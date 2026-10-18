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