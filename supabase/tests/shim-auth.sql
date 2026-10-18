-- TEST SHIM — NOT PART OF THE SCHEMA
--
-- `contractors.supabase_user_id` references `auth.users(id)`. On Supabase that
-- schema exists and is managed for you. On a bare Postgres instance (CI, local
-- `scripts/verify-schema.mjs`) it does not, so migrations 0007+ fail with
-- 'schema "auth" does not exist'.
--
-- This file recreates just enough of it to typecheck the FKs. It is applied by
-- the verification script only and is never run against a real Supabase
-- project. See supabase/tests/README.md.

create schema if not exists auth;

create table if not exists auth.users (
  id uuid primary key default gen_random_uuid(),
  email text unique,
  raw_user_meta_data jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- `auth.uid()` is a Supabase helper that reads the JWT claim. This stand-in
-- lets the migration's policy *definitions* be created. Behaviour under a
-- real request is Supabase's concern, not this shim's.
-- `sql` language functions use `SELECT expr`, not a BEGIN/RETURN block —
-- a RETURN there is a syntax error.
create or replace function auth.uid()
returns uuid as $$
  select null::uuid;
$$ language sql stable;

-- `auth.role()` likewise. Unused by the current policies, but kept so a future
-- admin policy referencing it still typechecks.
create or replace function auth.role()
returns text as $$
  select 'anon'::text;
$$ language sql stable;