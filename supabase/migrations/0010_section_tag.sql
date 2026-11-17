-- 0010: add section_tag to products
--
-- Lets each product be explicitly tagged for which storefront section it
-- belongs to (tiles-adhesive, washing-basins, western-toilets, mirrors,
-- taps, miscellaneous, or 'tile' for the main catalogue). Previously the
-- "Others" sections just filtered by material_type, which wasn't granular
-- enough — now a product added from the admin panel's "Washing Basin"
-- section can be shown only on /washing-basins, not on the main tile list.

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS section_tag TEXT NOT NULL DEFAULT 'tile'
  CHECK (section_tag IN (
    'tile',
    'tiles-adhesive',
    'washing-basins',
    'western-toilets',
    'mirrors',
    'taps',
    'miscellaneous'
  ));

-- Backfill: existing rows already in the DB stay as 'tile' (the default),
-- which is correct since they were imported from the tile/stone PDFs.

-- Non-tile products (mirrors, taps, basins, adhesive) are sold per piece,
-- so box coverage and pieces-per-box can legitimately be 0. The original
-- schema required both to be > 0, which made adding those products from
-- the admin panel fail with a constraint error.
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_box_area_sqft_check;
ALTER TABLE products ADD CONSTRAINT products_box_area_sqft_check
  CHECK (box_area_sqft >= 0);

ALTER TABLE products DROP CONSTRAINT IF EXISTS products_tiles_per_box_check;
ALTER TABLE products ADD CONSTRAINT products_tiles_per_box_check
  CHECK (tiles_per_box >= 0);

