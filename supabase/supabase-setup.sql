-- ============================================================
-- OM ENTERPRISES — one-time Supabase setup (run ONCE)
-- Generated: 2026-11-13
--
-- How to run (no knowledge of SQL needed):
--   1. Open your project in https://supabase.com/dashboard
--   2. Left menu: SQL Editor  >  New query
--   3. Paste this ENTIRE file, press RUN
--   4. Done. The 136 tiles are now in the products table.
--
-- After this, adding new tiles or changing prices = typing into the
-- tables in "Table Editor" (left menu), like a spreadsheet.
-- ============================================================

-- 0001_extensions.sql
--
-- Extensions required by the catalogue. Both are created idempotently so a
-- fresh project and an existing one converge on the same state.

-- Fuzzy matching on product names. `ilike '%stone%'` cannot catch a typo or a
-- partial token; trigram similarity can. Search in lib/queries/products.ts
-- uses this for the "did you mean" path only — exact and prefix matches still
-- go through the tsvector index.
create extension if not exists "pg_trgm";

-- GIN index support for the generated tsvector column on products.
create extension if not exists "btree_gist";

-- 0002_enums.sql
--
-- Domain enums. These are the controlled vocabularies the UI filters on, so
-- adding a value here makes it appear in the catalogue filters with no
-- front-end change. That is deliberate: the shop adds finishes and origins
-- through the admin, not through a code deploy.

create type origin_state as enum (
  'rajasthan', 'tamil-nadu', 'gujarat', 'madhya-pradesh',
  'chhattisgarh', 'karnataka', 'andhra-pradesh', 'bihar', 'other'
);

create type material_type as enum (
  'ceramic', 'vitrified', 'porcelain', 'natural-stone',
  'engineered-marble', 'quartz', 'mosaic', 'wood-plank', 'terrazzo'
);

create type finish_type as enum (
  'glossy', 'matte', 'textured', 'leathered', 'honed',
  'polished', 'rustic', 'brushed', 'decor'
);

create type room_use as enum (
  'bathroom', 'kitchen', 'living-room', 'bedroom', 'flooring',
  'wall-cladding', 'exterior', 'commercial', 'pool', 'balcony'
);

create type shape as enum (
  'square', 'rectangular', 'hexagonal', 'herringbone', 'tile', 'mosaic-sheet'
);

create type stock_status as enum ('in-stock', 'made-to-order', 'preorder', 'sold-out');
create type grade as enum ('aaa', 'aa', 'a', 'b');

create type delivery_pref as enum ('pickup', 'home-delivery', 'site-delivery');

create type enquiry_source as enum (
  'web', 'calculator', 'tile-lab', 'product-page', 'contractor-portal', 'instagram'
);

create type enquiry_status as enum ('new', 'contacted', 'quoted', 'won', 'lost');

create type contractor_tier as enum ('silver', 'gold');

-- 0003_origins.sql
--
-- Origins are a browse path and a filter, not the top-level tree. A product
-- has at most one origin (the stone comes from one place even when it is
-- processed somewhere else), which is why this is a nullable FK on products
-- rather than a join table.

create table origins (
  id uuid primary key default gen_random_uuid(),
  state origin_state not null,
  -- e.g. "Jaisalmer Sandstone, Rajasthan"
  name text not null,
  description text,
  -- Specific districts and quarries within the state.
  primary_regions text[] not null default '{}',
  -- Cover image for the origin landing page. Null until one is uploaded.
  hero_photo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index origins_state_idx on origins (state);

-- 0004_suppliers.sql
--
-- Suppliers are private by default. Only verified rows are publicly
-- readable (see the RLS policy in 0009), because a supplier phone number on
-- an unverified row is a person who never agreed to be listed.

create table suppliers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  location text not null,
  phone text,
  email text,
  verified boolean not null default false,
  -- Storage paths, not absolute URLs. See 0010 for the bucket policy.
  certificate_image_urls text[] not null default '{}',
  created_at timestamptz not null default now()
);

create index suppliers_verified_idx on suppliers (verified) where verified;

-- 0005_products.sql
--
-- The catalogue. Four stored numbers drive all pricing: price_per_box_inr,
-- box_area_sqft, tiles_per_box, moq_boxes. Everything else the customer sees
-- (per-sqft, per-piece) is derived at read time in lib/utils/pricing.ts and
-- deliberately NOT stored, because a stored derived price silently goes stale
-- the moment a box price is edited and there is no way to tell which figure
-- is the source of truth.

create table products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name_en text not null,
  name_hi text,

  origin_id uuid references origins(id) on delete set null,
  supplier_id uuid references suppliers(id) on delete set null,

  material_type material_type not null,
  finish finish_type not null,
  room_uses room_use[] not null default '{}',
  shape shape not null,

  -- [length, width, height] in millimetres.
  nominal_dimensions_mm int[3] not null,

  -- Total area covered by one box, square feet. This is a stored manufacturer
  -- figure: it comes off the carton, and for large-format it is often not
  -- (length x width x pieces) once packing waste is accounted for.
  box_area_sqft numeric(8,2) not null check (box_area_sqft > 0),
  tiles_per_box int not null check (tiles_per_box > 0),

  -- Rupees, integer. Settled per box, never per square foot: a half box is
  -- not a thing a shop can sell.
  price_per_box_inr bigint not null check (price_per_box_inr > 0),
  moq_boxes int not null default 1 check (moq_boxes > 0),

  grade grade not null default 'a',
  stock_status stock_status not null default 'in-stock',

  -- Storage paths, resolved to public URLs at read time.
  photo_urls text[] not null default '{}',
  video_urls text[] not null default '{}',

  -- Sort weight for manual merchandising on the home page. Lower floats first.
  featured_rank int,

  description_en text,
  description_hi text,

  -- Per-box wastage override. Null means "use the layout default" (10%).
  -- Diagonal and herringbone layouts need more; see lib/utils/calculator.ts.
  default_wastage_pct numeric(4,1),

  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- STORED is the keyword, and it closes the column definition — it sits after
-- the generated expression's own closing paren, not inside it.
  search_vector tsvector generated always as (
    to_tsvector('english',
      coalesce(name_en, '') || ' ' || coalesce(description_en, '')
    )
  ) stored
);

-- Browse paths.
create index products_origin_idx on products (origin_id);
create index products_material_idx on products (material_type);
create index products_finish_idx on products (finish);
create index products_slug_idx on products (slug);

-- room_uses is an array, so it is searched with GIN rather than btree. An
-- array-overlap (`&&`) query cannot use a plain btree index.
create index products_room_uses_idx on products using gin (room_uses);

-- Full-text search. §3 caps Phase 1 at 500 SKUs, which Postgres handles
-- comfortably; Meilisearch is a Phase 2 decision if the catalogue grows.
create index products_search_idx on products using gin (search_vector);

-- Typo tolerance for product names.
create index products_name_trgm_idx on products using gin (name_en gin_trgm_ops);

-- The home page and the catalogue landing both filter on this pair. A partial
-- index keeps it small: sold-out and inactive rows never enter it.
create index products_active_featured_idx on products (featured_rank)
  where active = true;

create index products_active_idx on products (created_at desc) where active = true;

-- 0006_projects.sql
--
-- Portfolio. Customer name is nullable on purpose: a homeowner who gives
-- photos is not automatically giving consent to be named. The UI must handle
-- "anonymous" as a normal state, not an edge case.

create table projects (
  id uuid primary key default gen_random_uuid(),

  customer_name text,
  locality text not null,
  project_type text not null,

  install_date date,
  before_photo_urls text[] not null default '{}',
  after_photo_urls text[] not null default '{}',

  testimonial_text text,
  testimonial_name text,
  google_review_url text,

  -- Meter squared, shown on the portfolio card. Null until measured.
  area_sqft numeric(10,2),

  featured boolean not null default false,
  sort_rank int,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index projects_locality_idx on projects (locality);
create index projects_type_idx on projects (project_type);
create index projects_featured_idx on projects (sort_rank) where featured = true;

-- 0007_contractors.sql
--
-- Trade accounts. trade_multiplier is applied to price_per_box_inr at read
-- time, never baked into a stored price — otherwise a tier change would
-- require rewriting every row in the catalogue.

create table contractors (
  id uuid primary key default gen_random_uuid(),
  supabase_user_id uuid unique references auth.users(id) on delete cascade,

  real_name text not null,
  firm text,
  phone text not null,
  email text,
  -- GSTIN is 15 characters: 2 state, 10 PAN, 1 entity, 1 'Z', 1 checksum.
  gstin text check (gstin is null or gstin ~ '^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$'),
  locality text,

  tier contractor_tier not null default 'silver',
  -- 0.90 means 10% off list.
  trade_multiplier numeric(3,2) not null default 1.00
    check (trade_multiplier > 0 and trade_multiplier <= 1.00),

  -- Credit terms. All zero in Phase 1: no credit is extended until the shop
  -- decides to extend it, and these columns exist so that decision is data
  -- rather than a migration later.
  account_balance bigint not null default 0,
  credit_limit bigint not null default 0,

  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index contractors_tier_idx on contractors (tier) where active = true;

-- 0008_enquiries.sql
--
-- An enquiry is NOT an order. Phase 1 has no cart and no payment. This table
-- records intent so the shop can call back, quote, and close. Modelling this
-- as an order would imply a fulfilment state machine the shop does not have.

create table enquiries (
  id uuid primary key default gen_random_uuid(),
  timestamp timestamptz not null default now(),

  -- Set null if the product is deleted, so the enquiry survives.
  product_id uuid references products(id) on delete set null,
  contractor_id uuid references contractors(id) on delete set null,

  qty_boxes int,
  room_area_sqft numeric(10,2),

  customer_name text not null,
  phone text not null,
  -- Separate from phone: plenty of customers give a landline for calls and a
  -- different number for WhatsApp.
  whatsapp_number text,
  whatsapp_optin boolean not null default true,

  locality text,
  delivery_preference delivery_pref not null default 'home-delivery',
  notes text,

  -- Free-form context carried from the calculator and Tile Lab, so the shop
  -- knows exactly what the customer configured before calling them.
  calculator_context jsonb,
  tile_lab_context jsonb,

  source enquiry_source not null default 'web',
  status enquiry_status not null default 'new',
  status_updated_at timestamptz,

  -- Admin-only. Never exposed to the customer or the contractor.
  notes_internal text
);

-- The admin queue is "newest first, unresolved" — the index matches that
-- query so the dashboard does not sort the whole table on every load.
create index enquiries_status_idx on enquiries (status, timestamp desc);
create index enquiries_timestamp_idx on enquiries (timestamp desc);
create index enquiries_product_idx on enquiries (product_id);

-- Contractor-facing lookup. Partial: most enquiries are never viewed by a
-- contractor, and this keeps the index off the anonymous rows.
create index enquiries_contractor_idx on enquiries (contractor_id, timestamp desc)
  where contractor_id is not null;

-- Rate-limit backing. A partial index on recent phone numbers would be added
-- here if spam becomes a problem; see the note in docs/api.md.

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

-- Anonymous visitors read the public catalogue through the website.
grant select on products to anon;
grant select on products to authenticated;
grant insert on enquiries to anon;
grant select on origins to anon;

-- ------------------------------------------------------------
-- Catalogue seed: all 136 real tiles (96 Glossy Endless +
-- 40 Livenza). Images already uploaded to the public
-- "tiles" storage bucket; photo_urls point at them.
-- price_per_box_inr = 1 placeholder ("On request") until the
-- shop sets real prices.
-- ------------------------------------------------------------
insert into products (
  slug, name_en, name_hi, origin_id, supplier_id,
  material_type, finish, room_uses, shape,
  nominal_dimensions_mm, box_area_sqft, tiles_per_box,
  price_per_box_inr, moq_boxes, grade, stock_status,
  photo_urls, video_urls, featured_rank,
  description_en, description_hi, default_wastage_pct, active
)
values
('glossy-endless-mg-adry-statuario', 'Glossy Endless MG ADRY STATUARIO', NULL, NULL, NULL, 'engineered-marble', 'glossy', ARRAY['flooring','living-room','bedroom']::room_use[], 'rectangular', ARRAY[600, 1200, 9], 31, 4, 1, 1, 'aaa', 'made-to-order', ARRAY['https://fpefdhzeqagducnoipsz.supabase.co/storage/v1/object/public/tiles/glossy-endless-mg-adry-statuario.jpg'], ARRAY[]::text[], 0, 'Glossy Endless collection, 600x1200mm. Price on request.', NULL, NULL, TRUE),
('glossy-endless-mg-aquane-statuario', 'Glossy Endless MG AQUANE STATUARIO', NULL, NULL, NULL, 'engineered-marble', 'glossy', ARRAY['flooring','living-room','bedroom']::room_use[], 'rectangular', ARRAY[600, 1200, 9], 31, 4, 1, 1, 'aaa', 'made-to-order', ARRAY['https://fpefdhzeqagducnoipsz.supabase.co/storage/v1/object/public/tiles/glossy-endless-mg-aquane-statuario.jpg'], ARRAY[]::text[], 0, 'Glossy Endless collection, 600x1200mm. Price on request.', NULL, NULL, TRUE),
('glossy-endless-mg-ariston-multy', 'Glossy Endless MG ARISTON MULTY', NULL, NULL, NULL, 'engineered-marble', 'glossy', ARRAY['flooring','living-room','bedroom']::room_use[], 'rectangular', ARRAY[600, 1200, 9], 31, 4, 1, 1, 'aaa', 'made-to-order', ARRAY['https://fpefdhzeqagducnoipsz.supabase.co/storage/v1/object/public/tiles/glossy-endless-mg-ariston-multy.jpg'], ARRAY[]::text[], 0, 'Glossy Endless collection, 600x1200mm. Price on request.', NULL, NULL, TRUE),
('glossy-endless-mg-ariston-white', 'Glossy Endless MG ARISTON WHITE', NULL, NULL, NULL, 'engineered-marble', 'glossy', ARRAY['flooring','living-room','bedroom']::room_use[], 'rectangular', ARRAY[600, 1200, 9], 31, 4, 1, 1, 'aaa', 'made-to-order', ARRAY['https://fpefdhzeqagducnoipsz.supabase.co/storage/v1/object/public/tiles/glossy-endless-mg-ariston-white.jpg'], ARRAY[]::text[], 0, 'Glossy Endless collection, 600x1200mm. Price on request.', NULL, NULL, TRUE),
('glossy-endless-mg-bijox-blue', 'Glossy Endless MG BIJOX BLUE', NULL, NULL, NULL, 'engineered-marble', 'glossy', ARRAY['flooring','living-room','bedroom']::room_use[], 'rectangular', ARRAY[600, 1200, 9], 31, 4, 1, 1, 'aaa', 'made-to-order', ARRAY['https://fpefdhzeqagducnoipsz.supabase.co/storage/v1/object/public/tiles/glossy-endless-mg-bijox-blue.jpg'], ARRAY[]::text[], 0, 'Glossy Endless collection, 600x1200mm. Price on request.', NULL, NULL, TRUE),
('glossy-endless-mg-bijox-grey', 'Glossy Endless MG BIJOX GREY', NULL, NULL, NULL, 'engineered-marble', 'glossy', ARRAY['flooring','living-room','bedroom']::room_use[], 'rectangular', ARRAY[600, 1200, 9], 31, 4, 1, 1, 'aaa', 'made-to-order', ARRAY['https://fpefdhzeqagducnoipsz.supabase.co/storage/v1/object/public/tiles/glossy-endless-mg-bijox-grey.jpg'], ARRAY[]::text[], 0, 'Glossy Endless collection, 600x1200mm. Price on request.', NULL, NULL, TRUE),
('glossy-endless-mg-borgini-blue', 'Glossy Endless MG BORGINI BLUE', NULL, NULL, NULL, 'engineered-marble', 'glossy', ARRAY['flooring','living-room','bedroom']::room_use[], 'rectangular', ARRAY[600, 1200, 9], 31, 4, 1, 1, 'aaa', 'made-to-order', ARRAY['https://fpefdhzeqagducnoipsz.supabase.co/storage/v1/object/public/tiles/glossy-endless-mg-borgini-blue.jpg'], ARRAY[]::text[], 0, 'Glossy Endless collection, 600x1200mm. Price on request.', NULL, NULL, TRUE),
('glossy-endless-mg-borgini-grey', 'Glossy Endless MG BORGINI GREY', NULL, NULL, NULL, 'engineered-marble', 'glossy', ARRAY['flooring','living-room','bedroom']::room_use[], 'rectangular', ARRAY[600, 1200, 9], 31, 4, 1, 1, 'aaa', 'made-to-order', ARRAY['https://fpefdhzeqagducnoipsz.supabase.co/storage/v1/object/public/tiles/glossy-endless-mg-borgini-grey.jpg'], ARRAY[]::text[], 0, 'Glossy Endless collection, 600x1200mm. Price on request.', NULL, NULL, TRUE),
('glossy-endless-mg-carra-grey', 'Glossy Endless MG CARRA GREY', NULL, NULL, NULL, 'engineered-marble', 'glossy', ARRAY['flooring','living-room','bedroom']::room_use[], 'rectangular', ARRAY[600, 1200, 9], 31, 4, 1, 1, 'aaa', 'made-to-order', ARRAY['https://fpefdhzeqagducnoipsz.supabase.co/storage/v1/object/public/tiles/glossy-endless-mg-carra-grey.jpg'], ARRAY[]::text[], 0, 'Glossy Endless collection, 600x1200mm. Price on request.', NULL, NULL, TRUE),
('glossy-endless-mg-celestial-grey-statuario', 'Glossy Endless MG CELESTIAL GREY STATUARIO', NULL, NULL, NULL, 'engineered-marble', 'glossy', ARRAY['flooring','living-room','bedroom']::room_use[], 'rectangular', ARRAY[600, 1200, 9], 31, 4, 1, 1, 'aaa', 'made-to-order', ARRAY['https://fpefdhzeqagducnoipsz.supabase.co/storage/v1/object/public/tiles/glossy-endless-mg-celestial-grey-statuario.jpg'], ARRAY[]::text[], 0, 'Glossy Endless collection, 600x1200mm. Price on request.', NULL, NULL, TRUE),
('glossy-endless-mg-mare-statuario', 'Glossy Endless MG MARE STATUARIO', NULL, NULL, NULL, 'engineered-marble', 'glossy', ARRAY['flooring','living-room','bedroom']::room_use[], 'rectangular', ARRAY[600, 1200, 9], 31, 4, 1, 1, 'aaa', 'made-to-order', ARRAY['https://fpefdhzeqagducnoipsz.supabase.co/storage/v1/object/public/tiles/glossy-endless-mg-mare-statuario.jpg'], ARRAY[]::text[], 0, 'Glossy Endless collection, 600x1200mm. Price on request.', NULL, NULL, TRUE),
('glossy-endless-mg-charm-statuario', 'Glossy Endless MG CHARM STATUARIO', NULL, NULL, NULL, 'engineered-marble', 'glossy', ARRAY['flooring','living-room','bedroom']::room_use[], 'rectangular', ARRAY[600, 1200, 9], 31, 4, 1, 1, 'aaa', 'made-to-order', ARRAY['https://fpefdhzeqagducnoipsz.supabase.co/storage/v1/object/public/tiles/glossy-endless-mg-charm-statuario.jpg'], ARRAY[]::text[], 0, 'Glossy Endless collection, 600x1200mm. Price on request.', NULL, NULL, TRUE),
('glossy-endless-mg-marbola-statuario', 'Glossy Endless MG MARBOLA STATUARIO', NULL, NULL, NULL, 'engineered-marble', 'glossy', ARRAY['flooring','living-room','bedroom']::room_use[], 'rectangular', ARRAY[600, 1200, 9], 31, 4, 1, 1, 'aaa', 'made-to-order', ARRAY['https://fpefdhzeqagducnoipsz.supabase.co/storage/v1/object/public/tiles/glossy-endless-mg-marbola-statuario.jpg'], ARRAY[]::text[], 0, 'Glossy Endless collection, 600x1200mm. Price on request.', NULL, NULL, TRUE),
('glossy-endless-mg-florentina-blue', 'Glossy Endless MG FLORENTINA BLUE', NULL, NULL, NULL, 'engineered-marble', 'glossy', ARRAY['flooring','living-room','bedroom']::room_use[], 'rectangular', ARRAY[600, 1200, 9], 31, 4, 1, 1, 'aaa', 'made-to-order', ARRAY['https://fpefdhzeqagducnoipsz.supabase.co/storage/v1/object/public/tiles/glossy-endless-mg-florentina-blue.jpg'], ARRAY[]::text[], 0, 'Glossy Endless collection, 600x1200mm. Price on request.', NULL, NULL, TRUE),
('glossy-endless-mg-florentina-multy', 'Glossy Endless MG FLORENTINA MULTY', NULL, NULL, NULL, 'engineered-marble', 'glossy', ARRAY['flooring','living-room','bedroom']::room_use[], 'rectangular', ARRAY[600, 1200, 9], 31, 4, 1, 1, 'aaa', 'made-to-order', ARRAY['https://fpefdhzeqagducnoipsz.supabase.co/storage/v1/object/public/tiles/glossy-endless-mg-florentina-multy.jpg'], ARRAY[]::text[], 0, 'Glossy Endless collection, 600x1200mm. Price on request.', NULL, NULL, TRUE),
('glossy-endless-mg-oikos-aqua', 'Glossy Endless MG OIKOS AQUA', NULL, NULL, NULL, 'engineered-marble', 'glossy', ARRAY['flooring','living-room','bedroom']::room_use[], 'rectangular', ARRAY[600, 1200, 9], 31, 4, 1, 1, 'aaa', 'made-to-order', ARRAY['https://fpefdhzeqagducnoipsz.supabase.co/storage/v1/object/public/tiles/glossy-endless-mg-oikos-aqua.jpg'], ARRAY[]::text[], 0, 'Glossy Endless collection, 600x1200mm. Price on request.', NULL, NULL, TRUE),
('glossy-endless-mg-oikos-blue', 'Glossy Endless MG OIKOS BLUE', NULL, NULL, NULL, 'engineered-marble', 'glossy', ARRAY['flooring','living-room','bedroom']::room_use[], 'rectangular', ARRAY[600, 1200, 9], 31, 4, 1, 1, 'aaa', 'made-to-order', ARRAY['https://fpefdhzeqagducnoipsz.supabase.co/storage/v1/object/public/tiles/glossy-endless-mg-oikos-blue.jpg'], ARRAY[]::text[], 0, 'Glossy Endless collection, 600x1200mm. Price on request.', NULL, NULL, TRUE),
('glossy-endless-mg-lussoro-statuario', 'Glossy Endless MG LUSSORO STATUARIO', NULL, NULL, NULL, 'engineered-marble', 'glossy', ARRAY['flooring','living-room','bedroom']::room_use[], 'rectangular', ARRAY[600, 1200, 9], 31, 4, 1, 1, 'aaa', 'made-to-order', ARRAY['https://fpefdhzeqagducnoipsz.supabase.co/storage/v1/object/public/tiles/glossy-endless-mg-lussoro-statuario.jpg'], ARRAY[]::text[], 0, 'Glossy Endless collection, 600x1200mm. Price on request.', NULL, NULL, TRUE),
('glossy-endless-mg-opera-statuario', 'Glossy Endless MG OPERA STATUARIO', NULL, NULL, NULL, 'engineered-marble', 'glossy', ARRAY['flooring','living-room','bedroom']::room_use[], 'rectangular', ARRAY[600, 1200, 9], 31, 4, 1, 1, 'aaa', 'made-to-order', ARRAY['https://fpefdhzeqagducnoipsz.supabase.co/storage/v1/object/public/tiles/glossy-endless-mg-opera-statuario.jpg'], ARRAY[]::text[], 0, 'Glossy Endless collection, 600x1200mm. Price on request.', NULL, NULL, TRUE),
('glossy-endless-mg-panozzo-green', 'Glossy Endless MG PANOZZO GREEN', NULL, NULL, NULL, 'engineered-marble', 'glossy', ARRAY['flooring','living-room','bedroom']::room_use[], 'rectangular', ARRAY[600, 1200, 9], 31, 4, 1, 1, 'aaa', 'made-to-order', ARRAY['https://fpefdhzeqagducnoipsz.supabase.co/storage/v1/object/public/tiles/glossy-endless-mg-panozzo-green.jpg'], ARRAY[]::text[], 0, 'Glossy Endless collection, 600x1200mm. Price on request.', NULL, NULL, TRUE),
('glossy-endless-mg-pigues-natural', 'Glossy Endless MG PIGUES NATURAL', NULL, NULL, NULL, 'engineered-marble', 'glossy', ARRAY['flooring','living-room','bedroom']::room_use[], 'rectangular', ARRAY[600, 1200, 9], 31, 4, 1, 1, 'aaa', 'made-to-order', ARRAY['https://fpefdhzeqagducnoipsz.supabase.co/storage/v1/object/public/tiles/glossy-endless-mg-pigues-natural.jpg'], ARRAY[]::text[], 0, 'Glossy Endless collection, 600x1200mm. Price on request.', NULL, NULL, TRUE),
('glossy-endless-mg-pigues-white', 'Glossy Endless MG PIGUES WHITE', NULL, NULL, NULL, 'engineered-marble', 'glossy', ARRAY['flooring','living-room','bedroom']::room_use[], 'rectangular', ARRAY[600, 1200, 9], 31, 4, 1, 1, 'aaa', 'made-to-order', ARRAY['https://fpefdhzeqagducnoipsz.supabase.co/storage/v1/object/public/tiles/glossy-endless-mg-pigues-white.jpg'], ARRAY[]::text[], 0, 'Glossy Endless collection, 600x1200mm. Price on request.', NULL, NULL, TRUE),
('glossy-endless-mg-onyx-florim-blue', 'Glossy Endless MG ONYX FLORIM BLUE', NULL, NULL, NULL, 'engineered-marble', 'glossy', ARRAY['flooring','living-room','bedroom']::room_use[], 'rectangular', ARRAY[600, 1200, 9], 31, 4, 1, 1, 'aaa', 'made-to-order', ARRAY['https://fpefdhzeqagducnoipsz.supabase.co/storage/v1/object/public/tiles/glossy-endless-mg-onyx-florim-blue.jpg'], ARRAY[]::text[], 0, 'Glossy Endless collection, 600x1200mm. Price on request.', NULL, NULL, TRUE),
('glossy-endless-mg-silver-statuario', 'Glossy Endless MG SILVER STATUARIO', NULL, NULL, NULL, 'engineered-marble', 'glossy', ARRAY['flooring','living-room','bedroom']::room_use[], 'rectangular', ARRAY[600, 1200, 9], 31, 4, 1, 1, 'aaa', 'made-to-order', ARRAY['https://fpefdhzeqagducnoipsz.supabase.co/storage/v1/object/public/tiles/glossy-endless-mg-silver-statuario.jpg'], ARRAY[]::text[], 0, 'Glossy Endless collection, 600x1200mm. Price on request.', NULL, NULL, TRUE),
('glossy-endless-mg-onyx-florim-sepia', 'Glossy Endless MG ONYX FLORIM SEPIA', NULL, NULL, NULL, 'engineered-marble', 'glossy', ARRAY['flooring','living-room','bedroom']::room_use[], 'rectangular', ARRAY[600, 1200, 9], 31, 4, 1, 1, 'aaa', 'made-to-order', ARRAY['https://fpefdhzeqagducnoipsz.supabase.co/storage/v1/object/public/tiles/glossy-endless-mg-onyx-florim-sepia.jpg'], ARRAY[]::text[], 0, 'Glossy Endless collection, 600x1200mm. Price on request.', NULL, NULL, TRUE),
('glossy-endless-mg-verso-statuario', 'Glossy Endless MG VERSO STATUARIO', NULL, NULL, NULL, 'engineered-marble', 'glossy', ARRAY['flooring','living-room','bedroom']::room_use[], 'rectangular', ARRAY[600, 1200, 9], 31, 4, 1, 1, 'aaa', 'made-to-order', ARRAY['https://fpefdhzeqagducnoipsz.supabase.co/storage/v1/object/public/tiles/glossy-endless-mg-verso-statuario.jpg'], ARRAY[]::text[], 0, 'Glossy Endless collection, 600x1200mm. Price on request.', NULL, NULL, TRUE),
('glossy-endless-mg-almeria-beige', 'Glossy Endless MG ALMERIA BEIGE', NULL, NULL, NULL, 'engineered-marble', 'glossy', ARRAY['flooring','living-room','bedroom']::room_use[], 'rectangular', ARRAY[600, 1200, 9], 31, 4, 1, 1, 'aaa', 'made-to-order', ARRAY['https://fpefdhzeqagducnoipsz.supabase.co/storage/v1/object/public/tiles/glossy-endless-mg-almeria-beige.jpg'], ARRAY[]::text[], 0, 'Glossy Endless collection, 600x1200mm. Price on request.', NULL, NULL, TRUE),
('glossy-endless-mg-vanilla-onyx', 'Glossy Endless MG VANILLA ONYX', NULL, NULL, NULL, 'engineered-marble', 'glossy', ARRAY['flooring','living-room','bedroom']::room_use[], 'rectangular', ARRAY[600, 1200, 9], 31, 4, 1, 1, 'aaa', 'made-to-order', ARRAY['https://fpefdhzeqagducnoipsz.supabase.co/storage/v1/object/public/tiles/glossy-endless-mg-vanilla-onyx.jpg'], ARRAY[]::text[], 0, 'Glossy Endless collection, 600x1200mm. Price on request.', NULL, NULL, TRUE),
('glossy-endless-mg-almeria-white', 'Glossy Endless MG ALMERIA WHITE', NULL, NULL, NULL, 'engineered-marble', 'glossy', ARRAY['flooring','living-room','bedroom']::room_use[], 'rectangular', ARRAY[600, 1200, 9], 31, 4, 1, 1, 'aaa', 'made-to-order', ARRAY['https://fpefdhzeqagducnoipsz.supabase.co/storage/v1/object/public/tiles/glossy-endless-mg-almeria-white.jpg'], ARRAY[]::text[], 0, 'Glossy Endless collection, 600x1200mm. Price on request.', NULL, NULL, TRUE),
('glossy-endless-mg-river-granite', 'Glossy Endless MG RIVER GRANITE', NULL, NULL, NULL, 'engineered-marble', 'glossy', ARRAY['flooring','living-room','bedroom']::room_use[], 'rectangular', ARRAY[600, 1200, 9], 31, 4, 1, 1, 'aaa', 'made-to-order', ARRAY['https://fpefdhzeqagducnoipsz.supabase.co/storage/v1/object/public/tiles/glossy-endless-mg-river-granite.jpg'], ARRAY[]::text[], 0, 'Glossy Endless collection, 600x1200mm. Price on request.', NULL, NULL, TRUE),
('glossy-endless-mg-amazing-brown', 'Glossy Endless MG AMAZING BROWN', NULL, NULL, NULL, 'engineered-marble', 'glossy', ARRAY['flooring','living-room','bedroom']::room_use[], 'rectangular', ARRAY[600, 1200, 9], 31, 4, 1, 1, 'aaa', 'made-to-order', ARRAY['https://fpefdhzeqagducnoipsz.supabase.co/storage/v1/object/public/tiles/glossy-endless-mg-amazing-brown.jpg'], ARRAY[]::text[], 0, 'Glossy Endless collection, 600x1200mm. Price on request.', NULL, NULL, TRUE),
('glossy-endless-mg-amazing-natural', 'Glossy Endless MG AMAZING NATURAL', NULL, NULL, NULL, 'engineered-marble', 'glossy', ARRAY['flooring','living-room','bedroom']::room_use[], 'rectangular', ARRAY[600, 1200, 9], 31, 4, 1, 1, 'aaa', 'made-to-order', ARRAY['https://fpefdhzeqagducnoipsz.supabase.co/storage/v1/object/public/tiles/glossy-endless-mg-amazing-natural.jpg'], ARRAY[]::text[], 0, 'Glossy Endless collection, 600x1200mm. Price on request.', NULL, NULL, TRUE),
('glossy-endless-mg-ambar-onyx', 'Glossy Endless MG AMBAR ONYX', NULL, NULL, NULL, 'engineered-marble', 'glossy', ARRAY['flooring','living-room','bedroom']::room_use[], 'rectangular', ARRAY[600, 1200, 9], 31, 4, 1, 1, 'aaa', 'made-to-order', ARRAY['https://fpefdhzeqagducnoipsz.supabase.co/storage/v1/object/public/tiles/glossy-endless-mg-ambar-onyx.jpg'], ARRAY[]::text[], 0, 'Glossy Endless collection, 600x1200mm. Price on request.', NULL, NULL, TRUE),
('glossy-endless-mg-lemon-onyx', 'Glossy Endless MG LEMON ONYX', NULL, NULL, NULL, 'engineered-marble', 'glossy', ARRAY['flooring','living-room','bedroom']::room_use[], 'rectangular', ARRAY[600, 1200, 9], 31, 4, 1, 1, 'aaa', 'made-to-order', ARRAY['https://fpefdhzeqagducnoipsz.supabase.co/storage/v1/object/public/tiles/glossy-endless-mg-lemon-onyx.jpg'], ARRAY[]::text[], 0, 'Glossy Endless collection, 600x1200mm. Price on request.', NULL, NULL, TRUE),
('glossy-endless-mg-lerox-white', 'Glossy Endless MG LEROX WHITE', NULL, NULL, NULL, 'engineered-marble', 'glossy', ARRAY['flooring','living-room','bedroom']::room_use[], 'rectangular', ARRAY[600, 1200, 9], 31, 4, 1, 1, 'aaa', 'made-to-order', ARRAY['https://fpefdhzeqagducnoipsz.supabase.co/storage/v1/object/public/tiles/glossy-endless-mg-lerox-white.jpg'], ARRAY[]::text[], 0, 'Glossy Endless collection, 600x1200mm. Price on request.', NULL, NULL, TRUE),
('glossy-endless-mg-motrico-onyx-sky', 'Glossy Endless MG MOTRICO ONYX SKY', NULL, NULL, NULL, 'engineered-marble', 'glossy', ARRAY['flooring','living-room','bedroom']::room_use[], 'rectangular', ARRAY[600, 1200, 9], 31, 4, 1, 1, 'aaa', 'made-to-order', ARRAY['https://fpefdhzeqagducnoipsz.supabase.co/storage/v1/object/public/tiles/glossy-endless-mg-motrico-onyx-sky.jpg'], ARRAY[]::text[], 0, 'Glossy Endless collection, 600x1200mm. Price on request.', NULL, NULL, TRUE),
('glossy-endless-mg-motrico-onyx-white', 'Glossy Endless MG MOTRICO ONYX WHITE', NULL, NULL, NULL, 'engineered-marble', 'glossy', ARRAY['flooring','living-room','bedroom']::room_use[], 'rectangular', ARRAY[600, 1200, 9], 31, 4, 1, 1, 'aaa', 'made-to-order', ARRAY['https://fpefdhzeqagducnoipsz.supabase.co/storage/v1/object/public/tiles/glossy-endless-mg-motrico-onyx-white.jpg'], ARRAY[]::text[], 0, 'Glossy Endless collection, 600x1200mm. Price on request.', NULL, NULL, TRUE),
('glossy-endless-mg-mural-onyx', 'Glossy Endless MG MURAL ONYX', NULL, NULL, NULL, 'engineered-marble', 'glossy', ARRAY['flooring','living-room','bedroom']::room_use[], 'rectangular', ARRAY[600, 1200, 9], 31, 4, 1, 1, 'aaa', 'made-to-order', ARRAY['https://fpefdhzeqagducnoipsz.supabase.co/storage/v1/object/public/tiles/glossy-endless-mg-mural-onyx.jpg'], ARRAY[]::text[], 0, 'Glossy Endless collection, 600x1200mm. Price on request.', NULL, NULL, TRUE),
('glossy-endless-mg-onyx-delicato', 'Glossy Endless MG ONYX DELICATO', NULL, NULL, NULL, 'engineered-marble', 'glossy', ARRAY['flooring','living-room','bedroom']::room_use[], 'rectangular', ARRAY[600, 1200, 9], 31, 4, 1, 1, 'aaa', 'made-to-order', ARRAY['https://fpefdhzeqagducnoipsz.supabase.co/storage/v1/object/public/tiles/glossy-endless-mg-onyx-delicato.jpg'], ARRAY[]::text[], 0, 'Glossy Endless collection, 600x1200mm. Price on request.', NULL, NULL, TRUE),
('glossy-endless-mg-onyx-delicato-blue', 'Glossy Endless MG ONYX DELICATO BLUE', NULL, NULL, NULL, 'engineered-marble', 'glossy', ARRAY['flooring','living-room','bedroom']::room_use[], 'rectangular', ARRAY[600, 1200, 9], 31, 4, 1, 1, 'aaa', 'made-to-order', ARRAY['https://fpefdhzeqagducnoipsz.supabase.co/storage/v1/object/public/tiles/glossy-endless-mg-onyx-delicato-blue.jpg'], ARRAY[]::text[], 0, 'Glossy Endless collection, 600x1200mm. Price on request.', NULL, NULL, TRUE),
('glossy-endless-mg-angel-natural', 'Glossy Endless MG ANGEL NATURAL', NULL, NULL, NULL, 'engineered-marble', 'glossy', ARRAY['flooring','living-room','bedroom']::room_use[], 'rectangular', ARRAY[600, 1200, 9], 31, 4, 1, 1, 'aaa', 'made-to-order', ARRAY['https://fpefdhzeqagducnoipsz.supabase.co/storage/v1/object/public/tiles/glossy-endless-mg-angel-natural.jpg'], ARRAY[]::text[], 0, 'Glossy Endless collection, 600x1200mm. Price on request.', NULL, NULL, TRUE),
('glossy-endless-mg-asher-brown', 'Glossy Endless MG ASHER BROWN', NULL, NULL, NULL, 'engineered-marble', 'glossy', ARRAY['flooring','living-room','bedroom']::room_use[], 'rectangular', ARRAY[600, 1200, 9], 31, 4, 1, 1, 'aaa', 'made-to-order', ARRAY['https://fpefdhzeqagducnoipsz.supabase.co/storage/v1/object/public/tiles/glossy-endless-mg-asher-brown.jpg'], ARRAY[]::text[], 0, 'Glossy Endless collection, 600x1200mm. Price on request.', NULL, NULL, TRUE),
('glossy-endless-mg-asher-grey', 'Glossy Endless MG ASHER GREY', NULL, NULL, NULL, 'engineered-marble', 'glossy', ARRAY['flooring','living-room','bedroom']::room_use[], 'rectangular', ARRAY[600, 1200, 9], 31, 4, 1, 1, 'aaa', 'made-to-order', ARRAY['https://fpefdhzeqagducnoipsz.supabase.co/storage/v1/object/public/tiles/glossy-endless-mg-asher-grey.jpg'], ARRAY[]::text[], 0, 'Glossy Endless collection, 600x1200mm. Price on request.', NULL, NULL, TRUE),
('glossy-endless-mg-asher-gris', 'Glossy Endless MG ASHER GRIS', NULL, NULL, NULL, 'engineered-marble', 'glossy', ARRAY['flooring','living-room','bedroom']::room_use[], 'rectangular', ARRAY[600, 1200, 9], 31, 4, 1, 1, 'aaa', 'made-to-order', ARRAY['https://fpefdhzeqagducnoipsz.supabase.co/storage/v1/object/public/tiles/glossy-endless-mg-asher-gris.jpg'], ARRAY[]::text[], 0, 'Glossy Endless collection, 600x1200mm. Price on request.', NULL, NULL, TRUE),
('glossy-endless-mg-asher-ivory', 'Glossy Endless MG ASHER IVORY', NULL, NULL, NULL, 'engineered-marble', 'glossy', ARRAY['flooring','living-room','bedroom']::room_use[], 'rectangular', ARRAY[600, 1200, 9], 31, 4, 1, 1, 'aaa', 'made-to-order', ARRAY['https://fpefdhzeqagducnoipsz.supabase.co/storage/v1/object/public/tiles/glossy-endless-mg-asher-ivory.jpg'], ARRAY[]::text[], 0, 'Glossy Endless collection, 600x1200mm. Price on request.', NULL, NULL, TRUE),
('glossy-endless-mg-bravio-black', 'Glossy Endless MG BRAVIO BLACK', NULL, NULL, NULL, 'engineered-marble', 'glossy', ARRAY['flooring','living-room','bedroom']::room_use[], 'rectangular', ARRAY[600, 1200, 9], 31, 4, 1, 1, 'aaa', 'made-to-order', ARRAY['https://fpefdhzeqagducnoipsz.supabase.co/storage/v1/object/public/tiles/glossy-endless-mg-bravio-black.jpg'], ARRAY[]::text[], 0, 'Glossy Endless collection, 600x1200mm. Price on request.', NULL, NULL, TRUE),
('glossy-endless-mg-jaxon-crema', 'Glossy Endless MG JAXON CREMA', NULL, NULL, NULL, 'engineered-marble', 'glossy', ARRAY['flooring','living-room','bedroom']::room_use[], 'rectangular', ARRAY[600, 1200, 9], 31, 4, 1, 1, 'aaa', 'made-to-order', ARRAY['https://fpefdhzeqagducnoipsz.supabase.co/storage/v1/object/public/tiles/glossy-endless-mg-jaxon-crema.jpg'], ARRAY[]::text[], 0, 'Glossy Endless collection, 600x1200mm. Price on request.', NULL, NULL, TRUE),
('glossy-endless-mg-jaxon-white', 'Glossy Endless MG JAXON WHITE', NULL, NULL, NULL, 'engineered-marble', 'glossy', ARRAY['flooring','living-room','bedroom']::room_use[], 'rectangular', ARRAY[600, 1200, 9], 31, 4, 1, 1, 'aaa', 'made-to-order', ARRAY['https://fpefdhzeqagducnoipsz.supabase.co/storage/v1/object/public/tiles/glossy-endless-mg-jaxon-white.jpg'], ARRAY[]::text[], 0, 'Glossy Endless collection, 600x1200mm. Price on request.', NULL, NULL, TRUE),
('glossy-endless-mg-leaves-blue', 'Glossy Endless MG LEAVES BLUE', NULL, NULL, NULL, 'engineered-marble', 'glossy', ARRAY['flooring','living-room','bedroom']::room_use[], 'rectangular', ARRAY[600, 1200, 9], 31, 4, 1, 1, 'aaa', 'made-to-order', ARRAY['https://fpefdhzeqagducnoipsz.supabase.co/storage/v1/object/public/tiles/glossy-endless-mg-leaves-blue.jpg'], ARRAY[]::text[], 0, 'Glossy Endless collection, 600x1200mm. Price on request.', NULL, NULL, TRUE),
('glossy-endless-mg-leaves-brown', 'Glossy Endless MG LEAVES BROWN', NULL, NULL, NULL, 'engineered-marble', 'glossy', ARRAY['flooring','living-room','bedroom']::room_use[], 'rectangular', ARRAY[600, 1200, 9], 31, 4, 1, 1, 'aaa', 'made-to-order', ARRAY['https://fpefdhzeqagducnoipsz.supabase.co/storage/v1/object/public/tiles/glossy-endless-mg-leaves-brown.jpg'], ARRAY[]::text[], 0, 'Glossy Endless collection, 600x1200mm. Price on request.', NULL, NULL, TRUE),
('glossy-endless-mg-leaves-natural', 'Glossy Endless MG LEAVES NATURAL', NULL, NULL, NULL, 'engineered-marble', 'glossy', ARRAY['flooring','living-room','bedroom']::room_use[], 'rectangular', ARRAY[600, 1200, 9], 31, 4, 1, 1, 'aaa', 'made-to-order', ARRAY['https://fpefdhzeqagducnoipsz.supabase.co/storage/v1/object/public/tiles/glossy-endless-mg-leaves-natural.jpg'], ARRAY[]::text[], 0, 'Glossy Endless collection, 600x1200mm. Price on request.', NULL, NULL, TRUE),
('glossy-endless-mg-marazzi-grey', 'Glossy Endless MG MARAZZI GREY', NULL, NULL, NULL, 'engineered-marble', 'glossy', ARRAY['flooring','living-room','bedroom']::room_use[], 'rectangular', ARRAY[600, 1200, 9], 31, 4, 1, 1, 'aaa', 'made-to-order', ARRAY['https://fpefdhzeqagducnoipsz.supabase.co/storage/v1/object/public/tiles/glossy-endless-mg-marazzi-grey.jpg'], ARRAY[]::text[], 0, 'Glossy Endless collection, 600x1200mm. Price on request.', NULL, NULL, TRUE),
('glossy-endless-mg-modern-bianco', 'Glossy Endless MG MODERN BIANCO', NULL, NULL, NULL, 'engineered-marble', 'glossy', ARRAY['flooring','living-room','bedroom']::room_use[], 'rectangular', ARRAY[600, 1200, 9], 31, 4, 1, 1, 'aaa', 'made-to-order', ARRAY['https://fpefdhzeqagducnoipsz.supabase.co/storage/v1/object/public/tiles/glossy-endless-mg-modern-bianco.jpg'], ARRAY[]::text[], 0, 'Glossy Endless collection, 600x1200mm. Price on request.', NULL, NULL, TRUE),
('glossy-endless-mg-modern-grey', 'Glossy Endless MG MODERN GREY', NULL, NULL, NULL, 'engineered-marble', 'glossy', ARRAY['flooring','living-room','bedroom']::room_use[], 'rectangular', ARRAY[600, 1200, 9], 31, 4, 1, 1, 'aaa', 'made-to-order', ARRAY['https://fpefdhzeqagducnoipsz.supabase.co/storage/v1/object/public/tiles/glossy-endless-mg-modern-grey.jpg'], ARRAY[]::text[], 0, 'Glossy Endless collection, 600x1200mm. Price on request.', NULL, NULL, TRUE),
('glossy-endless-mg-natural-bottochino', 'Glossy Endless MG NATURAL BOTTOCHINO', NULL, NULL, NULL, 'engineered-marble', 'glossy', ARRAY['flooring','living-room','bedroom']::room_use[], 'rectangular', ARRAY[600, 1200, 9], 31, 4, 1, 1, 'aaa', 'made-to-order', ARRAY['https://fpefdhzeqagducnoipsz.supabase.co/storage/v1/object/public/tiles/glossy-endless-mg-natural-bottochino.jpg'], ARRAY[]::text[], 0, 'Glossy Endless collection, 600x1200mm. Price on request.', NULL, NULL, TRUE),
('glossy-endless-mg-amazing-multy', 'Glossy Endless MG AMAZING MULTY', NULL, NULL, NULL, 'engineered-marble', 'glossy', ARRAY['flooring','living-room','bedroom']::room_use[], 'rectangular', ARRAY[600, 1200, 9], 31, 4, 1, 1, 'aaa', 'made-to-order', ARRAY['https://fpefdhzeqagducnoipsz.supabase.co/storage/v1/object/public/tiles/glossy-endless-mg-amazing-multy.jpg'], ARRAY[]::text[], 0, 'Glossy Endless collection, 600x1200mm. Price on request.', NULL, NULL, TRUE),
('glossy-endless-mg-antony-blue', 'Glossy Endless MG ANTONY BLUE', NULL, NULL, NULL, 'engineered-marble', 'glossy', ARRAY['flooring','living-room','bedroom']::room_use[], 'rectangular', ARRAY[600, 1200, 9], 31, 4, 1, 1, 'aaa', 'made-to-order', ARRAY['https://fpefdhzeqagducnoipsz.supabase.co/storage/v1/object/public/tiles/glossy-endless-mg-antony-blue.jpg'], ARRAY[]::text[], 0, 'Glossy Endless collection, 600x1200mm. Price on request.', NULL, NULL, TRUE),
('glossy-endless-mg-antresit-brize', 'Glossy Endless MG ANTRESIT BRIZE', NULL, NULL, NULL, 'engineered-marble', 'glossy', ARRAY['flooring','living-room','bedroom']::room_use[], 'rectangular', ARRAY[600, 1200, 9], 31, 4, 1, 1, 'aaa', 'made-to-order', ARRAY['https://fpefdhzeqagducnoipsz.supabase.co/storage/v1/object/public/tiles/glossy-endless-mg-antresit-brize.jpg'], ARRAY[]::text[], 0, 'Glossy Endless collection, 600x1200mm. Price on request.', NULL, NULL, TRUE),
('glossy-endless-mg-antresit-dove', 'Glossy Endless MG ANTRESIT DOVE', NULL, NULL, NULL, 'engineered-marble', 'glossy', ARRAY['flooring','living-room','bedroom']::room_use[], 'rectangular', ARRAY[600, 1200, 9], 31, 4, 1, 1, 'aaa', 'made-to-order', ARRAY['https://fpefdhzeqagducnoipsz.supabase.co/storage/v1/object/public/tiles/glossy-endless-mg-antresit-dove.jpg'], ARRAY[]::text[], 0, 'Glossy Endless collection, 600x1200mm. Price on request.', NULL, NULL, TRUE),
('glossy-endless-mg-axor-beige', 'Glossy Endless MG AXOR BEIGE', NULL, NULL, NULL, 'engineered-marble', 'glossy', ARRAY['flooring','living-room','bedroom']::room_use[], 'rectangular', ARRAY[600, 1200, 9], 31, 4, 1, 1, 'aaa', 'made-to-order', ARRAY['https://fpefdhzeqagducnoipsz.supabase.co/storage/v1/object/public/tiles/glossy-endless-mg-axor-beige.jpg'], ARRAY[]::text[], 0, 'Glossy Endless collection, 600x1200mm. Price on request.', NULL, NULL, TRUE),
('glossy-endless-mg-axor-grey', 'Glossy Endless MG AXOR GREY', NULL, NULL, NULL, 'engineered-marble', 'glossy', ARRAY['flooring','living-room','bedroom']::room_use[], 'rectangular', ARRAY[600, 1200, 9], 31, 4, 1, 1, 'aaa', 'made-to-order', ARRAY['https://fpefdhzeqagducnoipsz.supabase.co/storage/v1/object/public/tiles/glossy-endless-mg-axor-grey.jpg'], ARRAY[]::text[], 0, 'Glossy Endless collection, 600x1200mm. Price on request.', NULL, NULL, TRUE),
('glossy-endless-mg-brera-blue', 'Glossy Endless MG BRERA BLUE', NULL, NULL, NULL, 'engineered-marble', 'glossy', ARRAY['flooring','living-room','bedroom']::room_use[], 'rectangular', ARRAY[600, 1200, 9], 31, 4, 1, 1, 'aaa', 'made-to-order', ARRAY['https://fpefdhzeqagducnoipsz.supabase.co/storage/v1/object/public/tiles/glossy-endless-mg-brera-blue.jpg'], ARRAY[]::text[], 0, 'Glossy Endless collection, 600x1200mm. Price on request.', NULL, NULL, TRUE),
('glossy-endless-mg-brera-brown', 'Glossy Endless MG BRERA BROWN', NULL, NULL, NULL, 'engineered-marble', 'glossy', ARRAY['flooring','living-room','bedroom']::room_use[], 'rectangular', ARRAY[600, 1200, 9], 31, 4, 1, 1, 'aaa', 'made-to-order', ARRAY['https://fpefdhzeqagducnoipsz.supabase.co/storage/v1/object/public/tiles/glossy-endless-mg-brera-brown.jpg'], ARRAY[]::text[], 0, 'Glossy Endless collection, 600x1200mm. Price on request.', NULL, NULL, TRUE),
('glossy-endless-mg-brera-grey', 'Glossy Endless MG BRERA GREY', NULL, NULL, NULL, 'engineered-marble', 'glossy', ARRAY['flooring','living-room','bedroom']::room_use[], 'rectangular', ARRAY[600, 1200, 9], 31, 4, 1, 1, 'aaa', 'made-to-order', ARRAY['https://fpefdhzeqagducnoipsz.supabase.co/storage/v1/object/public/tiles/glossy-endless-mg-brera-grey.jpg'], ARRAY[]::text[], 0, 'Glossy Endless collection, 600x1200mm. Price on request.', NULL, NULL, TRUE),
('glossy-endless-mg-henri-blue', 'Glossy Endless MG HENRI BLUE', NULL, NULL, NULL, 'engineered-marble', 'glossy', ARRAY['flooring','living-room','bedroom']::room_use[], 'rectangular', ARRAY[600, 1200, 9], 31, 4, 1, 1, 'aaa', 'made-to-order', ARRAY['https://fpefdhzeqagducnoipsz.supabase.co/storage/v1/object/public/tiles/glossy-endless-mg-henri-blue.jpg'], ARRAY[]::text[], 0, 'Glossy Endless collection, 600x1200mm. Price on request.', NULL, NULL, TRUE),
('glossy-endless-mg-honesta-ivory', 'Glossy Endless MG HONESTA IVORY', NULL, NULL, NULL, 'engineered-marble', 'glossy', ARRAY['flooring','living-room','bedroom']::room_use[], 'rectangular', ARRAY[600, 1200, 9], 31, 4, 1, 1, 'aaa', 'made-to-order', ARRAY['https://fpefdhzeqagducnoipsz.supabase.co/storage/v1/object/public/tiles/glossy-endless-mg-honesta-ivory.jpg'], ARRAY[]::text[], 0, 'Glossy Endless collection, 600x1200mm. Price on request.', NULL, NULL, TRUE),
('glossy-endless-mg-marvella-natural', 'Glossy Endless MG MARVELLA NATURAL', NULL, NULL, NULL, 'engineered-marble', 'glossy', ARRAY['flooring','living-room','bedroom']::room_use[], 'rectangular', ARRAY[600, 1200, 9], 31, 4, 1, 1, 'aaa', 'made-to-order', ARRAY['https://fpefdhzeqagducnoipsz.supabase.co/storage/v1/object/public/tiles/glossy-endless-mg-marvella-natural.jpg'], ARRAY[]::text[], 0, 'Glossy Endless collection, 600x1200mm. Price on request.', NULL, NULL, TRUE),
('glossy-endless-mg-mercury-bianco', 'Glossy Endless MG MERCURY BIANCO', NULL, NULL, NULL, 'engineered-marble', 'glossy', ARRAY['flooring','living-room','bedroom']::room_use[], 'rectangular', ARRAY[600, 1200, 9], 31, 4, 1, 1, 'aaa', 'made-to-order', ARRAY['https://fpefdhzeqagducnoipsz.supabase.co/storage/v1/object/public/tiles/glossy-endless-mg-mercury-bianco.jpg'], ARRAY[]::text[], 0, 'Glossy Endless collection, 600x1200mm. Price on request.', NULL, NULL, TRUE),
('glossy-endless-mg-mercury-brown', 'Glossy Endless MG MERCURY BROWN', NULL, NULL, NULL, 'engineered-marble', 'glossy', ARRAY['flooring','living-room','bedroom']::room_use[], 'rectangular', ARRAY[600, 1200, 9], 31, 4, 1, 1, 'aaa', 'made-to-order', ARRAY['https://fpefdhzeqagducnoipsz.supabase.co/storage/v1/object/public/tiles/glossy-endless-mg-mercury-brown.jpg'], ARRAY[]::text[], 0, 'Glossy Endless collection, 600x1200mm. Price on request.', NULL, NULL, TRUE),
('glossy-endless-mg-mercury-crema', 'Glossy Endless MG MERCURY CREMA', NULL, NULL, NULL, 'engineered-marble', 'glossy', ARRAY['flooring','living-room','bedroom']::room_use[], 'rectangular', ARRAY[600, 1200, 9], 31, 4, 1, 1, 'aaa', 'made-to-order', ARRAY['https://fpefdhzeqagducnoipsz.supabase.co/storage/v1/object/public/tiles/glossy-endless-mg-mercury-crema.jpg'], ARRAY[]::text[], 0, 'Glossy Endless collection, 600x1200mm. Price on request.', NULL, NULL, TRUE),
('glossy-endless-mg-mercury-fossil', 'Glossy Endless MG MERCURY FOSSIL', NULL, NULL, NULL, 'engineered-marble', 'glossy', ARRAY['flooring','living-room','bedroom']::room_use[], 'rectangular', ARRAY[600, 1200, 9], 31, 4, 1, 1, 'aaa', 'made-to-order', ARRAY['https://fpefdhzeqagducnoipsz.supabase.co/storage/v1/object/public/tiles/glossy-endless-mg-mercury-fossil.jpg'], ARRAY[]::text[], 0, 'Glossy Endless collection, 600x1200mm. Price on request.', NULL, NULL, TRUE),
('glossy-endless-mg-mercury-grey', 'Glossy Endless MG MERCURY GREY', NULL, NULL, NULL, 'engineered-marble', 'glossy', ARRAY['flooring','living-room','bedroom']::room_use[], 'rectangular', ARRAY[600, 1200, 9], 31, 4, 1, 1, 'aaa', 'made-to-order', ARRAY['https://fpefdhzeqagducnoipsz.supabase.co/storage/v1/object/public/tiles/glossy-endless-mg-mercury-grey.jpg'], ARRAY[]::text[], 0, 'Glossy Endless collection, 600x1200mm. Price on request.', NULL, NULL, TRUE),
('glossy-endless-mg-mercury-natural', 'Glossy Endless MG MERCURY NATURAL', NULL, NULL, NULL, 'engineered-marble', 'glossy', ARRAY['flooring','living-room','bedroom']::room_use[], 'rectangular', ARRAY[600, 1200, 9], 31, 4, 1, 1, 'aaa', 'made-to-order', ARRAY['https://fpefdhzeqagducnoipsz.supabase.co/storage/v1/object/public/tiles/glossy-endless-mg-mercury-natural.jpg'], ARRAY[]::text[], 0, 'Glossy Endless collection, 600x1200mm. Price on request.', NULL, NULL, TRUE),
('glossy-endless-mg-mercury-stone', 'Glossy Endless MG MERCURY STONE', NULL, NULL, NULL, 'engineered-marble', 'glossy', ARRAY['flooring','living-room','bedroom']::room_use[], 'rectangular', ARRAY[600, 1200, 9], 31, 4, 1, 1, 'aaa', 'made-to-order', ARRAY['https://fpefdhzeqagducnoipsz.supabase.co/storage/v1/object/public/tiles/glossy-endless-mg-mercury-stone.jpg'], ARRAY[]::text[], 0, 'Glossy Endless collection, 600x1200mm. Price on request.', NULL, NULL, TRUE),
('glossy-endless-mg-mercury-thunder', 'Glossy Endless MG MERCURY THUNDER', NULL, NULL, NULL, 'engineered-marble', 'glossy', ARRAY['flooring','living-room','bedroom']::room_use[], 'rectangular', ARRAY[600, 1200, 9], 31, 4, 1, 1, 'aaa', 'made-to-order', ARRAY['https://fpefdhzeqagducnoipsz.supabase.co/storage/v1/object/public/tiles/glossy-endless-mg-mercury-thunder.jpg'], ARRAY[]::text[], 0, 'Glossy Endless collection, 600x1200mm. Price on request.', NULL, NULL, TRUE),
('glossy-endless-mg-nokta-blue', 'Glossy Endless MG NOKTA BLUE', NULL, NULL, NULL, 'engineered-marble', 'glossy', ARRAY['flooring','living-room','bedroom']::room_use[], 'rectangular', ARRAY[600, 1200, 9], 31, 4, 1, 1, 'aaa', 'made-to-order', ARRAY['https://fpefdhzeqagducnoipsz.supabase.co/storage/v1/object/public/tiles/glossy-endless-mg-nokta-blue.jpg'], ARRAY[]::text[], 0, 'Glossy Endless collection, 600x1200mm. Price on request.', NULL, NULL, TRUE),
('glossy-endless-mg-nokta-brown', 'Glossy Endless MG NOKTA BROWN', NULL, NULL, NULL, 'engineered-marble', 'glossy', ARRAY['flooring','living-room','bedroom']::room_use[], 'rectangular', ARRAY[600, 1200, 9], 31, 4, 1, 1, 'aaa', 'made-to-order', ARRAY['https://fpefdhzeqagducnoipsz.supabase.co/storage/v1/object/public/tiles/glossy-endless-mg-nokta-brown.jpg'], ARRAY[]::text[], 0, 'Glossy Endless collection, 600x1200mm. Price on request.', NULL, NULL, TRUE),
('glossy-endless-mg-omani-beige', 'Glossy Endless MG OMANI BEIGE', NULL, NULL, NULL, 'engineered-marble', 'glossy', ARRAY['flooring','living-room','bedroom']::room_use[], 'rectangular', ARRAY[600, 1200, 9], 31, 4, 1, 1, 'aaa', 'made-to-order', ARRAY['https://fpefdhzeqagducnoipsz.supabase.co/storage/v1/object/public/tiles/glossy-endless-mg-omani-beige.jpg'], ARRAY[]::text[], 0, 'Glossy Endless collection, 600x1200mm. Price on request.', NULL, NULL, TRUE),
('glossy-endless-mg-rivana-beige', 'Glossy Endless MG RIVANA BEIGE', NULL, NULL, NULL, 'engineered-marble', 'glossy', ARRAY['flooring','living-room','bedroom']::room_use[], 'rectangular', ARRAY[600, 1200, 9], 31, 4, 1, 1, 'aaa', 'made-to-order', ARRAY['https://fpefdhzeqagducnoipsz.supabase.co/storage/v1/object/public/tiles/glossy-endless-mg-rivana-beige.jpg'], ARRAY[]::text[], 0, 'Glossy Endless collection, 600x1200mm. Price on request.', NULL, NULL, TRUE),
('glossy-endless-mg-rivana-bianco', 'Glossy Endless MG RIVANA BIANCO', NULL, NULL, NULL, 'engineered-marble', 'glossy', ARRAY['flooring','living-room','bedroom']::room_use[], 'rectangular', ARRAY[600, 1200, 9], 31, 4, 1, 1, 'aaa', 'made-to-order', ARRAY['https://fpefdhzeqagducnoipsz.supabase.co/storage/v1/object/public/tiles/glossy-endless-mg-rivana-bianco.jpg'], ARRAY[]::text[], 0, 'Glossy Endless collection, 600x1200mm. Price on request.', NULL, NULL, TRUE),
('glossy-endless-mg-rivana-brown', 'Glossy Endless MG RIVANA BROWN', NULL, NULL, NULL, 'engineered-marble', 'glossy', ARRAY['flooring','living-room','bedroom']::room_use[], 'rectangular', ARRAY[600, 1200, 9], 31, 4, 1, 1, 'aaa', 'made-to-order', ARRAY['https://fpefdhzeqagducnoipsz.supabase.co/storage/v1/object/public/tiles/glossy-endless-mg-rivana-brown.jpg'], ARRAY[]::text[], 0, 'Glossy Endless collection, 600x1200mm. Price on request.', NULL, NULL, TRUE),
('glossy-endless-mg-rivana-grey', 'Glossy Endless MG RIVANA GREY', NULL, NULL, NULL, 'engineered-marble', 'glossy', ARRAY['flooring','living-room','bedroom']::room_use[], 'rectangular', ARRAY[600, 1200, 9], 31, 4, 1, 1, 'aaa', 'made-to-order', ARRAY['https://fpefdhzeqagducnoipsz.supabase.co/storage/v1/object/public/tiles/glossy-endless-mg-rivana-grey.jpg'], ARRAY[]::text[], 0, 'Glossy Endless collection, 600x1200mm. Price on request.', NULL, NULL, TRUE),
('glossy-endless-mg-rivana-ivory', 'Glossy Endless MG RIVANA IVORY', NULL, NULL, NULL, 'engineered-marble', 'glossy', ARRAY['flooring','living-room','bedroom']::room_use[], 'rectangular', ARRAY[600, 1200, 9], 31, 4, 1, 1, 'aaa', 'made-to-order', ARRAY['https://fpefdhzeqagducnoipsz.supabase.co/storage/v1/object/public/tiles/glossy-endless-mg-rivana-ivory.jpg'], ARRAY[]::text[], 0, 'Glossy Endless collection, 600x1200mm. Price on request.', NULL, NULL, TRUE),
('glossy-endless-mg-rivana-natural', 'Glossy Endless MG RIVANA NATURAL', NULL, NULL, NULL, 'engineered-marble', 'glossy', ARRAY['flooring','living-room','bedroom']::room_use[], 'rectangular', ARRAY[600, 1200, 9], 31, 4, 1, 1, 'aaa', 'made-to-order', ARRAY['https://fpefdhzeqagducnoipsz.supabase.co/storage/v1/object/public/tiles/glossy-endless-mg-rivana-natural.jpg'], ARRAY[]::text[], 0, 'Glossy Endless collection, 600x1200mm. Price on request.', NULL, NULL, TRUE),
('glossy-endless-mg-rosell-crema', 'Glossy Endless MG ROSELL CREMA', NULL, NULL, NULL, 'engineered-marble', 'glossy', ARRAY['flooring','living-room','bedroom']::room_use[], 'rectangular', ARRAY[600, 1200, 9], 31, 4, 1, 1, 'aaa', 'made-to-order', ARRAY['https://fpefdhzeqagducnoipsz.supabase.co/storage/v1/object/public/tiles/glossy-endless-mg-rosell-crema.jpg'], ARRAY[]::text[], 0, 'Glossy Endless collection, 600x1200mm. Price on request.', NULL, NULL, TRUE),
('glossy-endless-mg-royal-bottochino', 'Glossy Endless MG ROYAL BOTTOCHINO', NULL, NULL, NULL, 'engineered-marble', 'glossy', ARRAY['flooring','living-room','bedroom']::room_use[], 'rectangular', ARRAY[600, 1200, 9], 31, 4, 1, 1, 'aaa', 'made-to-order', ARRAY['https://fpefdhzeqagducnoipsz.supabase.co/storage/v1/object/public/tiles/glossy-endless-mg-royal-bottochino.jpg'], ARRAY[]::text[], 0, 'Glossy Endless collection, 600x1200mm. Price on request.', NULL, NULL, TRUE),
('glossy-endless-mg-spanish-crema', 'Glossy Endless MG SPANISH CREMA', NULL, NULL, NULL, 'engineered-marble', 'glossy', ARRAY['flooring','living-room','bedroom']::room_use[], 'rectangular', ARRAY[600, 1200, 9], 31, 4, 1, 1, 'aaa', 'made-to-order', ARRAY['https://fpefdhzeqagducnoipsz.supabase.co/storage/v1/object/public/tiles/glossy-endless-mg-spanish-crema.jpg'], ARRAY[]::text[], 0, 'Glossy Endless collection, 600x1200mm. Price on request.', NULL, NULL, TRUE),
('glossy-endless-mg-spanish-grey', 'Glossy Endless MG SPANISH GREY', NULL, NULL, NULL, 'engineered-marble', 'glossy', ARRAY['flooring','living-room','bedroom']::room_use[], 'rectangular', ARRAY[600, 1200, 9], 31, 4, 1, 1, 'aaa', 'made-to-order', ARRAY['https://fpefdhzeqagducnoipsz.supabase.co/storage/v1/object/public/tiles/glossy-endless-mg-spanish-grey.jpg'], ARRAY[]::text[], 0, 'Glossy Endless collection, 600x1200mm. Price on request.', NULL, NULL, TRUE),
('glossy-endless-mg-spanish-natural', 'Glossy Endless MG SPANISH NATURAL', NULL, NULL, NULL, 'engineered-marble', 'glossy', ARRAY['flooring','living-room','bedroom']::room_use[], 'rectangular', ARRAY[600, 1200, 9], 31, 4, 1, 1, 'aaa', 'made-to-order', ARRAY['https://fpefdhzeqagducnoipsz.supabase.co/storage/v1/object/public/tiles/glossy-endless-mg-spanish-natural.jpg'], ARRAY[]::text[], 0, 'Glossy Endless collection, 600x1200mm. Price on request.', NULL, NULL, TRUE),
('glossy-endless-mg-sydney-beige', 'Glossy Endless MG SYDNEY BEIGE', NULL, NULL, NULL, 'engineered-marble', 'glossy', ARRAY['flooring','living-room','bedroom']::room_use[], 'rectangular', ARRAY[600, 1200, 9], 31, 4, 1, 1, 'aaa', 'made-to-order', ARRAY['https://fpefdhzeqagducnoipsz.supabase.co/storage/v1/object/public/tiles/glossy-endless-mg-sydney-beige.jpg'], ARRAY[]::text[], 0, 'Glossy Endless collection, 600x1200mm. Price on request.', NULL, NULL, TRUE),
('glossy-endless-mg-sydney-bianco', 'Glossy Endless MG SYDNEY BIANCO', NULL, NULL, NULL, 'engineered-marble', 'glossy', ARRAY['flooring','living-room','bedroom']::room_use[], 'rectangular', ARRAY[600, 1200, 9], 31, 4, 1, 1, 'aaa', 'made-to-order', ARRAY['https://fpefdhzeqagducnoipsz.supabase.co/storage/v1/object/public/tiles/glossy-endless-mg-sydney-bianco.jpg'], ARRAY[]::text[], 0, 'Glossy Endless collection, 600x1200mm. Price on request.', NULL, NULL, TRUE),
('glossy-endless-mg-sydney-brown', 'Glossy Endless MG SYDNEY BROWN', NULL, NULL, NULL, 'engineered-marble', 'glossy', ARRAY['flooring','living-room','bedroom']::room_use[], 'rectangular', ARRAY[600, 1200, 9], 31, 4, 1, 1, 'aaa', 'made-to-order', ARRAY['https://fpefdhzeqagducnoipsz.supabase.co/storage/v1/object/public/tiles/glossy-endless-mg-sydney-brown.jpg'], ARRAY[]::text[], 0, 'Glossy Endless collection, 600x1200mm. Price on request.', NULL, NULL, TRUE),
('glossy-endless-mg-sydney-grey', 'Glossy Endless MG SYDNEY GREY', NULL, NULL, NULL, 'engineered-marble', 'glossy', ARRAY['flooring','living-room','bedroom']::room_use[], 'rectangular', ARRAY[600, 1200, 9], 31, 4, 1, 1, 'aaa', 'made-to-order', ARRAY['https://fpefdhzeqagducnoipsz.supabase.co/storage/v1/object/public/tiles/glossy-endless-mg-sydney-grey.jpg'], ARRAY[]::text[], 0, 'Glossy Endless collection, 600x1200mm. Price on request.', NULL, NULL, TRUE),
('glossy-endless-mg-sydney-ivory', 'Glossy Endless MG SYDNEY IVORY', NULL, NULL, NULL, 'engineered-marble', 'glossy', ARRAY['flooring','living-room','bedroom']::room_use[], 'rectangular', ARRAY[600, 1200, 9], 31, 4, 1, 1, 'aaa', 'made-to-order', ARRAY['https://fpefdhzeqagducnoipsz.supabase.co/storage/v1/object/public/tiles/glossy-endless-mg-sydney-ivory.jpg'], ARRAY[]::text[], 0, 'Glossy Endless collection, 600x1200mm. Price on request.', NULL, NULL, TRUE),
('glossy-endless-mg-sydney-natural', 'Glossy Endless MG SYDNEY NATURAL', NULL, NULL, NULL, 'engineered-marble', 'glossy', ARRAY['flooring','living-room','bedroom']::room_use[], 'rectangular', ARRAY[600, 1200, 9], 31, 4, 1, 1, 'aaa', 'made-to-order', ARRAY['https://fpefdhzeqagducnoipsz.supabase.co/storage/v1/object/public/tiles/glossy-endless-mg-sydney-natural.jpg'], ARRAY[]::text[], 0, 'Glossy Endless collection, 600x1200mm. Price on request.', NULL, NULL, TRUE),
('glossy-endless-mg-sydney-yellow', 'Glossy Endless MG SYDNEY YELLOW', NULL, NULL, NULL, 'engineered-marble', 'glossy', ARRAY['flooring','living-room','bedroom']::room_use[], 'rectangular', ARRAY[600, 1200, 9], 31, 4, 1, 1, 'aaa', 'made-to-order', ARRAY['https://fpefdhzeqagducnoipsz.supabase.co/storage/v1/object/public/tiles/glossy-endless-mg-sydney-yellow.jpg'], ARRAY[]::text[], 0, 'Glossy Endless collection, 600x1200mm. Price on request.', NULL, NULL, TRUE),
('livenza-wood-alpine', 'Livenza Wood Alpine', NULL, NULL, NULL, 'wood-plank', 'matte', ARRAY['flooring','kitchen']::room_use[], 'rectangular', ARRAY[600, 1200, 9], 31, 4, 1, 1, 'aaa', 'made-to-order', ARRAY['https://fpefdhzeqagducnoipsz.supabase.co/storage/v1/object/public/tiles/livenza-wood-alpine.jpg'], ARRAY[]::text[], 0, 'Livenza collection, 600x1200mm. Price on request.', NULL, NULL, TRUE),
('livenza-light-dark', 'Livenza Light Dark', NULL, NULL, NULL, 'engineered-marble', 'glossy', ARRAY['flooring','living-room','bedroom']::room_use[], 'rectangular', ARRAY[600, 1200, 9], 31, 4, 1, 1, 'aaa', 'made-to-order', ARRAY['https://fpefdhzeqagducnoipsz.supabase.co/storage/v1/object/public/tiles/livenza-light-dark.jpg'], ARRAY[]::text[], 0, 'Livenza collection, 600x1200mm. Price on request.', NULL, NULL, TRUE),
('livenza-statuario', 'Livenza Statuario', NULL, NULL, NULL, 'engineered-marble', 'glossy', ARRAY['flooring','living-room','bedroom']::room_use[], 'rectangular', ARRAY[600, 1200, 9], 31, 4, 1, 1, 'aaa', 'made-to-order', ARRAY['https://fpefdhzeqagducnoipsz.supabase.co/storage/v1/object/public/tiles/livenza-statuario.jpg'], ARRAY[]::text[], 0, 'Livenza collection, 600x1200mm. Price on request.', NULL, NULL, TRUE),
('livenza-wood-clear-maple', 'Livenza Wood Clear Maple', NULL, NULL, NULL, 'wood-plank', 'matte', ARRAY['flooring','kitchen']::room_use[], 'rectangular', ARRAY[600, 1200, 9], 31, 4, 1, 1, 'aaa', 'made-to-order', ARRAY['https://fpefdhzeqagducnoipsz.supabase.co/storage/v1/object/public/tiles/livenza-wood-clear-maple.jpg'], ARRAY[]::text[], 0, 'Livenza collection, 600x1200mm. Price on request.', NULL, NULL, TRUE),
('livenza-light-dark-grey', 'Livenza Light Dark Grey', NULL, NULL, NULL, 'engineered-marble', 'glossy', ARRAY['flooring','living-room','bedroom']::room_use[], 'rectangular', ARRAY[600, 1200, 9], 31, 4, 1, 1, 'aaa', 'made-to-order', ARRAY['https://fpefdhzeqagducnoipsz.supabase.co/storage/v1/object/public/tiles/livenza-light-dark-grey.jpg'], ARRAY[]::text[], 0, 'Livenza collection, 600x1200mm. Price on request.', NULL, NULL, TRUE),
('livenza-light-dark-brown', 'Livenza Light Dark Brown', NULL, NULL, NULL, 'engineered-marble', 'glossy', ARRAY['flooring','living-room','bedroom']::room_use[], 'rectangular', ARRAY[600, 1200, 9], 31, 4, 1, 1, 'aaa', 'made-to-order', ARRAY['https://fpefdhzeqagducnoipsz.supabase.co/storage/v1/object/public/tiles/livenza-light-dark-brown.jpg'], ARRAY[]::text[], 0, 'Livenza collection, 600x1200mm. Price on request.', NULL, NULL, TRUE),
('livenza-endless-grey', 'Livenza Endless Grey', NULL, NULL, NULL, 'engineered-marble', 'glossy', ARRAY['flooring','living-room','bedroom']::room_use[], 'rectangular', ARRAY[600, 1200, 9], 31, 4, 1, 1, 'aaa', 'made-to-order', ARRAY['https://fpefdhzeqagducnoipsz.supabase.co/storage/v1/object/public/tiles/livenza-endless-grey.jpg'], ARRAY[]::text[], 0, 'Livenza collection, 600x1200mm. Price on request.', NULL, NULL, TRUE),
('livenza-endless-white', 'Livenza Endless White', NULL, NULL, NULL, 'engineered-marble', 'glossy', ARRAY['flooring','living-room','bedroom']::room_use[], 'rectangular', ARRAY[600, 1200, 9], 31, 4, 1, 1, 'aaa', 'made-to-order', ARRAY['https://fpefdhzeqagducnoipsz.supabase.co/storage/v1/object/public/tiles/livenza-endless-white.jpg'], ARRAY[]::text[], 0, 'Livenza collection, 600x1200mm. Price on request.', NULL, NULL, TRUE),
('livenza-endless-marble', 'Livenza Endless Marble', NULL, NULL, NULL, 'engineered-marble', 'glossy', ARRAY['flooring','living-room','bedroom']::room_use[], 'rectangular', ARRAY[600, 1200, 9], 31, 4, 1, 1, 'aaa', 'made-to-order', ARRAY['https://fpefdhzeqagducnoipsz.supabase.co/storage/v1/object/public/tiles/livenza-endless-marble.jpg'], ARRAY[]::text[], 0, 'Livenza collection, 600x1200mm. Price on request.', NULL, NULL, TRUE),
('livenza-onyx-fog-grey', 'Livenza Onyx Fog Grey', NULL, NULL, NULL, 'engineered-marble', 'glossy', ARRAY['flooring','living-room','bedroom']::room_use[], 'rectangular', ARRAY[600, 1200, 9], 31, 4, 1, 1, 'aaa', 'made-to-order', ARRAY['https://fpefdhzeqagducnoipsz.supabase.co/storage/v1/object/public/tiles/livenza-onyx-fog-grey.jpg'], ARRAY[]::text[], 0, 'Livenza collection, 600x1200mm. Price on request.', NULL, NULL, TRUE),
('livenza-endless-white-2', 'Livenza Endless White', NULL, NULL, NULL, 'engineered-marble', 'glossy', ARRAY['flooring','living-room','bedroom']::room_use[], 'rectangular', ARRAY[600, 1200, 9], 31, 4, 1, 1, 'aaa', 'made-to-order', ARRAY['https://fpefdhzeqagducnoipsz.supabase.co/storage/v1/object/public/tiles/livenza-endless-white-2.jpg'], ARRAY[]::text[], 0, 'Livenza collection, 600x1200mm. Price on request.', NULL, NULL, TRUE),
('livenza-statuario-2', 'Livenza Statuario', NULL, NULL, NULL, 'engineered-marble', 'glossy', ARRAY['flooring','living-room','bedroom']::room_use[], 'rectangular', ARRAY[600, 1200, 9], 31, 4, 1, 1, 'aaa', 'made-to-order', ARRAY['https://fpefdhzeqagducnoipsz.supabase.co/storage/v1/object/public/tiles/livenza-statuario-2.jpg'], ARRAY[]::text[], 0, 'Livenza collection, 600x1200mm. Price on request.', NULL, NULL, TRUE),
('livenza-statuario-natural', 'Livenza Statuario Natural', NULL, NULL, NULL, 'engineered-marble', 'glossy', ARRAY['flooring','living-room','bedroom']::room_use[], 'rectangular', ARRAY[600, 1200, 9], 31, 4, 1, 1, 'aaa', 'made-to-order', ARRAY['https://fpefdhzeqagducnoipsz.supabase.co/storage/v1/object/public/tiles/livenza-statuario-natural.jpg'], ARRAY[]::text[], 0, 'Livenza collection, 600x1200mm. Price on request.', NULL, NULL, TRUE),
('livenza-endless', 'Livenza Endless', NULL, NULL, NULL, 'engineered-marble', 'glossy', ARRAY['flooring','living-room','bedroom']::room_use[], 'rectangular', ARRAY[600, 1200, 9], 31, 4, 1, 1, 'aaa', 'made-to-order', ARRAY['https://fpefdhzeqagducnoipsz.supabase.co/storage/v1/object/public/tiles/livenza-endless.jpg'], ARRAY[]::text[], 0, 'Livenza collection, 600x1200mm. Price on request.', NULL, NULL, TRUE),
('livenza-endless-2', 'Livenza Endless', NULL, NULL, NULL, 'engineered-marble', 'glossy', ARRAY['flooring','living-room','bedroom']::room_use[], 'rectangular', ARRAY[600, 1200, 9], 31, 4, 1, 1, 'aaa', 'made-to-order', ARRAY['https://fpefdhzeqagducnoipsz.supabase.co/storage/v1/object/public/tiles/livenza-endless-2.jpg'], ARRAY[]::text[], 0, 'Livenza collection, 600x1200mm. Price on request.', NULL, NULL, TRUE),
('livenza-onyx', 'Livenza Onyx', NULL, NULL, NULL, 'engineered-marble', 'glossy', ARRAY['flooring','living-room','bedroom']::room_use[], 'rectangular', ARRAY[600, 1200, 9], 31, 4, 1, 1, 'aaa', 'made-to-order', ARRAY['https://fpefdhzeqagducnoipsz.supabase.co/storage/v1/object/public/tiles/livenza-onyx.jpg'], ARRAY[]::text[], 0, 'Livenza collection, 600x1200mm. Price on request.', NULL, NULL, TRUE),
('livenza-statuario-acember-grey', 'Livenza Statuario Acember Grey', NULL, NULL, NULL, 'engineered-marble', 'glossy', ARRAY['flooring','living-room','bedroom']::room_use[], 'rectangular', ARRAY[600, 1200, 9], 31, 4, 1, 1, 'aaa', 'made-to-order', ARRAY['https://fpefdhzeqagducnoipsz.supabase.co/storage/v1/object/public/tiles/livenza-statuario-acember-grey.jpg'], ARRAY[]::text[], 0, 'Livenza collection, 600x1200mm. Price on request.', NULL, NULL, TRUE),
('livenza-zebrano-crema', 'Livenza Zebrano Crema', NULL, NULL, NULL, 'engineered-marble', 'glossy', ARRAY['flooring','living-room','bedroom']::room_use[], 'rectangular', ARRAY[600, 1200, 9], 31, 4, 1, 1, 'aaa', 'made-to-order', ARRAY['https://fpefdhzeqagducnoipsz.supabase.co/storage/v1/object/public/tiles/livenza-zebrano-crema.jpg'], ARRAY[]::text[], 0, 'Livenza collection, 600x1200mm. Price on request.', NULL, NULL, TRUE),
('livenza-endless-3', 'Livenza Endless', NULL, NULL, NULL, 'engineered-marble', 'glossy', ARRAY['flooring','living-room','bedroom']::room_use[], 'rectangular', ARRAY[600, 1200, 9], 31, 4, 1, 1, 'aaa', 'made-to-order', ARRAY['https://fpefdhzeqagducnoipsz.supabase.co/storage/v1/object/public/tiles/livenza-endless-3.jpg'], ARRAY[]::text[], 0, 'Livenza collection, 600x1200mm. Price on request.', NULL, NULL, TRUE),
('livenza-endless-4', 'Livenza Endless', NULL, NULL, NULL, 'engineered-marble', 'glossy', ARRAY['flooring','living-room','bedroom']::room_use[], 'rectangular', ARRAY[600, 1200, 9], 31, 4, 1, 1, 'aaa', 'made-to-order', ARRAY['https://fpefdhzeqagducnoipsz.supabase.co/storage/v1/object/public/tiles/livenza-endless-4.jpg'], ARRAY[]::text[], 0, 'Livenza collection, 600x1200mm. Price on request.', NULL, NULL, TRUE),
('livenza-endless-5', 'Livenza Endless', NULL, NULL, NULL, 'engineered-marble', 'glossy', ARRAY['flooring','living-room','bedroom']::room_use[], 'rectangular', ARRAY[600, 1200, 9], 31, 4, 1, 1, 'aaa', 'made-to-order', ARRAY['https://fpefdhzeqagducnoipsz.supabase.co/storage/v1/object/public/tiles/livenza-endless-5.jpg'], ARRAY[]::text[], 0, 'Livenza collection, 600x1200mm. Price on request.', NULL, NULL, TRUE),
('livenza-statuario-listello', 'Livenza Statuario Listello', NULL, NULL, NULL, 'engineered-marble', 'glossy', ARRAY['flooring','living-room','bedroom']::room_use[], 'rectangular', ARRAY[600, 1200, 9], 31, 4, 1, 1, 'aaa', 'made-to-order', ARRAY['https://fpefdhzeqagducnoipsz.supabase.co/storage/v1/object/public/tiles/livenza-statuario-listello.jpg'], ARRAY[]::text[], 0, 'Livenza collection, 600x1200mm. Price on request.', NULL, NULL, TRUE),
('livenza-valencia-crema', 'Livenza Valencia Crema', NULL, NULL, NULL, 'engineered-marble', 'glossy', ARRAY['flooring','living-room','bedroom']::room_use[], 'rectangular', ARRAY[600, 1200, 9], 31, 4, 1, 1, 'aaa', 'made-to-order', ARRAY['https://fpefdhzeqagducnoipsz.supabase.co/storage/v1/object/public/tiles/livenza-valencia-crema.jpg'], ARRAY[]::text[], 0, 'Livenza collection, 600x1200mm. Price on request.', NULL, NULL, TRUE),
('livenza-anvi-grey', 'Livenza Anvi Grey', NULL, NULL, NULL, 'engineered-marble', 'glossy', ARRAY['flooring','living-room','bedroom']::room_use[], 'rectangular', ARRAY[600, 1200, 9], 31, 4, 1, 1, 'aaa', 'made-to-order', ARRAY['https://fpefdhzeqagducnoipsz.supabase.co/storage/v1/object/public/tiles/livenza-anvi-grey.jpg'], ARRAY[]::text[], 0, 'Livenza collection, 600x1200mm. Price on request.', NULL, NULL, TRUE),
('livenza-golden-series-solid-aqua', 'Livenza Golden Series Solid Aqua', NULL, NULL, NULL, 'engineered-marble', 'glossy', ARRAY['flooring','living-room','bedroom']::room_use[], 'rectangular', ARRAY[600, 1200, 9], 31, 4, 1, 1, 'aaa', 'made-to-order', ARRAY['https://fpefdhzeqagducnoipsz.supabase.co/storage/v1/object/public/tiles/livenza-golden-series-solid-aqua.jpg'], ARRAY[]::text[], 0, 'Livenza collection, 600x1200mm. Price on request.', NULL, NULL, TRUE),
('livenza-compress-gold', 'Livenza Compress Gold', NULL, NULL, NULL, 'engineered-marble', 'glossy', ARRAY['flooring','living-room','bedroom']::room_use[], 'rectangular', ARRAY[600, 1200, 9], 31, 4, 1, 1, 'aaa', 'made-to-order', ARRAY['https://fpefdhzeqagducnoipsz.supabase.co/storage/v1/object/public/tiles/livenza-compress-gold.jpg'], ARRAY[]::text[], 0, 'Livenza collection, 600x1200mm. Price on request.', NULL, NULL, TRUE),
('livenza-anvi-grey-2', 'Livenza Anvi Grey', NULL, NULL, NULL, 'engineered-marble', 'glossy', ARRAY['flooring','living-room','bedroom']::room_use[], 'rectangular', ARRAY[600, 1200, 9], 31, 4, 1, 1, 'aaa', 'made-to-order', ARRAY['https://fpefdhzeqagducnoipsz.supabase.co/storage/v1/object/public/tiles/livenza-anvi-grey-2.jpg'], ARRAY[]::text[], 0, 'Livenza collection, 600x1200mm. Price on request.', NULL, NULL, TRUE),
('livenza-anvi-white', 'Livenza Anvi White', NULL, NULL, NULL, 'engineered-marble', 'glossy', ARRAY['flooring','living-room','bedroom']::room_use[], 'rectangular', ARRAY[600, 1200, 9], 31, 4, 1, 1, 'aaa', 'made-to-order', ARRAY['https://fpefdhzeqagducnoipsz.supabase.co/storage/v1/object/public/tiles/livenza-anvi-white.jpg'], ARRAY[]::text[], 0, 'Livenza collection, 600x1200mm. Price on request.', NULL, NULL, TRUE),
('livenza-endless-6', 'Livenza Endless', NULL, NULL, NULL, 'engineered-marble', 'glossy', ARRAY['flooring','living-room','bedroom']::room_use[], 'rectangular', ARRAY[600, 1200, 9], 31, 4, 1, 1, 'aaa', 'made-to-order', ARRAY['https://fpefdhzeqagducnoipsz.supabase.co/storage/v1/object/public/tiles/livenza-endless-6.jpg'], ARRAY[]::text[], 0, 'Livenza collection, 600x1200mm. Price on request.', NULL, NULL, TRUE),
('livenza-wood-redox-wenge', 'Livenza Wood Redox Wenge', NULL, NULL, NULL, 'wood-plank', 'matte', ARRAY['flooring','kitchen']::room_use[], 'rectangular', ARRAY[600, 1200, 9], 31, 4, 1, 1, 'aaa', 'made-to-order', ARRAY['https://fpefdhzeqagducnoipsz.supabase.co/storage/v1/object/public/tiles/livenza-wood-redox-wenge.jpg'], ARRAY[]::text[], 0, 'Livenza collection, 600x1200mm. Price on request.', NULL, NULL, TRUE),
('livenza-lizard-crema', 'Livenza Lizard Crema', NULL, NULL, NULL, 'engineered-marble', 'matte', ARRAY['flooring','living-room','bedroom']::room_use[], 'rectangular', ARRAY[600, 1200, 9], 31, 4, 1, 1, 'aaa', 'made-to-order', ARRAY['https://fpefdhzeqagducnoipsz.supabase.co/storage/v1/object/public/tiles/livenza-lizard-crema.jpg'], ARRAY[]::text[], 0, 'Livenza collection, 600x1200mm. Price on request.', NULL, NULL, TRUE),
('livenza-semond-grey', 'Livenza Semond Grey', NULL, NULL, NULL, 'engineered-marble', 'matte', ARRAY['flooring','living-room','bedroom']::room_use[], 'rectangular', ARRAY[600, 1200, 9], 31, 4, 1, 1, 'aaa', 'made-to-order', ARRAY['https://fpefdhzeqagducnoipsz.supabase.co/storage/v1/object/public/tiles/livenza-semond-grey.jpg'], ARRAY[]::text[], 0, 'Livenza collection, 600x1200mm. Price on request.', NULL, NULL, TRUE),
('livenza-survey-cream', 'Livenza Survey Cream', NULL, NULL, NULL, 'engineered-marble', 'glossy', ARRAY['flooring','living-room','bedroom']::room_use[], 'rectangular', ARRAY[600, 1200, 9], 31, 4, 1, 1, 'aaa', 'made-to-order', ARRAY['https://fpefdhzeqagducnoipsz.supabase.co/storage/v1/object/public/tiles/livenza-survey-cream.jpg'], ARRAY[]::text[], 0, 'Livenza collection, 600x1200mm. Price on request.', NULL, NULL, TRUE),
('livenza-cronos-black', 'Livenza Cronos Black', NULL, NULL, NULL, 'engineered-marble', 'matte', ARRAY['flooring','commercial']::room_use[], 'rectangular', ARRAY[600, 1200, 9], 31, 4, 1, 1, 'aaa', 'made-to-order', ARRAY['https://fpefdhzeqagducnoipsz.supabase.co/storage/v1/object/public/tiles/livenza-cronos-black.jpg'], ARRAY[]::text[], 0, 'Livenza collection, 600x1200mm. Price on request.', NULL, NULL, TRUE),
('livenza-pal-statuario', 'Livenza Pal Statuario', NULL, NULL, NULL, 'engineered-marble', 'glossy', ARRAY['flooring','living-room','bedroom']::room_use[], 'rectangular', ARRAY[600, 1200, 9], 31, 4, 1, 1, 'aaa', 'made-to-order', ARRAY['https://fpefdhzeqagducnoipsz.supabase.co/storage/v1/object/public/tiles/livenza-pal-statuario.jpg'], ARRAY[]::text[], 0, 'Livenza collection, 600x1200mm. Price on request.', NULL, NULL, TRUE),
('livenza-rosata-black', 'Livenza Rosata Black', NULL, NULL, NULL, 'engineered-marble', 'matte', ARRAY['wall-cladding','commercial']::room_use[], 'rectangular', ARRAY[600, 1200, 9], 31, 4, 1, 1, 'aaa', 'made-to-order', ARRAY['https://fpefdhzeqagducnoipsz.supabase.co/storage/v1/object/public/tiles/livenza-rosata-black.jpg'], ARRAY[]::text[], 0, 'Livenza collection, 600x1200mm. Price on request.', NULL, NULL, TRUE),
('livenza-wood-clear-maple-2', 'Livenza Wood Clear Maple', NULL, NULL, NULL, 'wood-plank', 'matte', ARRAY['flooring','kitchen']::room_use[], 'rectangular', ARRAY[600, 1200, 9], 31, 4, 1, 1, 'aaa', 'made-to-order', ARRAY['https://fpefdhzeqagducnoipsz.supabase.co/storage/v1/object/public/tiles/livenza-wood-clear-maple-2.jpg'], ARRAY[]::text[], 0, 'Livenza collection, 600x1200mm. Price on request.', NULL, NULL, TRUE),
('livenza-arezzo-blue', 'Livenza Arezzo Blue', NULL, NULL, NULL, 'engineered-marble', 'matte', ARRAY['flooring','living-room']::room_use[], 'rectangular', ARRAY[600, 1200, 9], 31, 4, 1, 1, 'aaa', 'made-to-order', ARRAY['https://fpefdhzeqagducnoipsz.supabase.co/storage/v1/object/public/tiles/livenza-arezzo-blue.jpg'], ARRAY[]::text[], 0, 'Livenza collection, 600x1200mm. Price on request.', NULL, NULL, TRUE),
('livenza-classic', 'Livenza Classic', NULL, NULL, NULL, 'engineered-marble', 'glossy', ARRAY['flooring','living-room','bedroom']::room_use[], 'rectangular', ARRAY[600, 1200, 9], 31, 4, 1, 1, 'aaa', 'made-to-order', ARRAY['https://fpefdhzeqagducnoipsz.supabase.co/storage/v1/object/public/tiles/livenza-classic.jpg'], ARRAY[]::text[], 0, 'Livenza collection, 600x1200mm. Price on request.', NULL, NULL, TRUE),
('livenza-vintage-white', 'Livenza Vintage White', NULL, NULL, NULL, 'engineered-marble', 'glossy', ARRAY['flooring','living-room','bedroom']::room_use[], 'rectangular', ARRAY[600, 1200, 9], 31, 4, 1, 1, 'aaa', 'made-to-order', ARRAY['https://fpefdhzeqagducnoipsz.supabase.co/storage/v1/object/public/tiles/livenza-vintage-white.jpg'], ARRAY[]::text[], 0, 'Livenza collection, 600x1200mm. Price on request.', NULL, NULL, TRUE)
on conflict (slug) do update set
  name_en = excluded.name_en,
  material_type = excluded.material_type,
  finish = excluded.finish,
  room_uses = excluded.room_uses,
  photo_urls = excluded.photo_urls,
  description_en = excluded.description_en,
  active = excluded.active;

select count(*) as total_products from products;
