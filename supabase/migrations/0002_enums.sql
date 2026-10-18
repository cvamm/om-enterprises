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