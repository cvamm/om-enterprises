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