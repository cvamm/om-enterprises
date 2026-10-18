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