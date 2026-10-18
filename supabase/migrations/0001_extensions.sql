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