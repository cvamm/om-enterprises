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