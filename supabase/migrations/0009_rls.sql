-- 0009_rls.sql
--
-- Row Level Security. Every table is locked down; the service role bypasses
-- all of it and is used only from server code.
--
-- Two corrections to the draft policies in the master brief, both of which
-- were real defects rather than style:
--
--   1. `enquiries_own_read` compared `auth.uid()` to `enquiries.contractor_id`.
--      auth.uid() is auth.users.id; contractor_id is contractors.id. Those are
--      different UUIDs for the same human, so the comparison never matched and
--      contractors could not read their own enquiries. It must resolve
--      through contractors.supabase_user_id.
--
--   2. `contractors_admin_insert ... with check (true)` allows any anonymous
--      visitor to insert a contractor row. The "service role only" comment
--      describes intent, not behaviour — `true` is a grant to the world. Worse,
--      self-service signup means the caller controls their own row, so without
--      the guard trigger below they could set tier='gold' and
--      trade_multiplier=0.50 and price themselves a 50% discount.

alter table origins     enable row level security;
alter table suppliers   enable row level security;
alter table products    enable row level security;
alter table projects    enable row level security;
alter table contractors enable row level security;
alter table enquiries   enable row level security;

-- ---------------------------------------------------------------------------
-- Public catalogue reads
-- ---------------------------------------------------------------------------

-- Origins are public browsing material.
create policy "origins_public_read" on origins
  for select using (true);

-- Only verified suppliers are public. An unverified row holds a phone number
-- belonging to someone who never agreed to be listed.
create policy "suppliers_public_read" on suppliers
  for select using (verified = true);

-- Only active products. Delisting is `active = false`, never a delete, so that
-- past enquiries keep resolving to a real product.
create policy "products_public_read" on products
  for select using (active = true);

-- Only featured projects are public; the rest are work-in-progress.
create policy "projects_public_read" on projects
  for select using (featured = true);

-- ---------------------------------------------------------------------------
-- Contractors
-- ---------------------------------------------------------------------------

create policy "contractors_own_read" on contractors
  for select using (auth.uid() = supabase_user_id);

-- Self-service signup: you may create exactly one row, and it must be your own.
create policy "contractors_self_insert" on contractors
  for insert with check (auth.uid() = supabase_user_id);

-- ---------------------------------------------------------------------------
-- Enquiries
-- ---------------------------------------------------------------------------

-- The contact form is public, so anonymous insert is required. This is a
-- spam surface by design and is mitigated in the server action by validation
-- and rate limiting, not by RLS — see server/actions/create-enquiry.ts.
create policy "enquiries_public_insert" on enquiries
  for insert with check (true);

-- A contractor reads enquiries filed under their own account.
create policy "enquiries_own_read" on enquiries
  for select using (
    exists (
      select 1 from contractors c
      where c.id = enquiries.contractor_id
        and c.supabase_user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- Privilege guard
-- ---------------------------------------------------------------------------

-- Force trade terms to defaults on self-service signup. RLS controls WHO can
-- write a row; it cannot control WHICH COLUMNS. Without this, a contractor
-- could self-assign tier='gold' and trade_multiplier=0.50.
create or replace function guard_contractor_signup()
returns trigger as $$
begin
  if auth.uid() is not null and new.supabase_user_id = auth.uid() then
    new.tier := 'silver';
    new.trade_multiplier := 1.00;
    new.account_balance := 0;
    new.credit_limit := 0;
    -- Self-signup cannot grant itself credit or mark itself active-by-admin.
    new.active := true;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger contractors_signup_guard
  before insert on contractors
  for each row execute function guard_contractor_signup();

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at := now();
  return new;
end;
$$ language plpgsql;

create trigger products_updated_at before update on products
  for each row execute function set_updated_at();
create trigger origins_updated_at before update on origins
  for each row execute function set_updated_at();
create trigger projects_updated_at before update on projects
  for each row execute function set_updated_at();
create trigger contractors_updated_at before update on contractors
  for each row execute function set_updated_at();

-- Enquiries has no updated_at column — it has status_updated_at, which should
-- move when the STATUS moves and not when someone edits a note. So it gets its
-- own trigger rather than reusing set_updated_at().
create or replace function set_enquiry_status_updated_at()
returns trigger as $$
begin
  if new.status is distinct from old.status then
    new.status_updated_at := now();
  end if;
  return new;
end;
$$ language plpgsql;

create trigger enquiries_status_updated_at
  before update on enquiries
  for each row execute function set_enquiry_status_updated_at();