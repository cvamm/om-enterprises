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