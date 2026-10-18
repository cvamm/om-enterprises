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