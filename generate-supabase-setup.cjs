/* One-off: builds `supabase-setup.sql` — everything to run once in the
 * Supabase SQL Editor: schema (from migrations 0001-0009) + all catalogue
 * tile rows, pointing photo_urls at the uploaded Supabase storage objects. */
const fs = require("fs");
const path = require("path");
const { parseRealTiles } = require("./tile-map.cjs");
const rows = parseRealTiles();

const env = fs.readFileSync(path.join(__dirname, ".env.local"), "utf8");
const pick = (k) => {
  const line = env.split(/\r?\n/).find((l) => l.startsWith(k + "="));
  return line ? line.slice(k.length + 1).trim() : undefined;
};
const SURL = pick("NEXT_PUBLIC_SUPABASE_URL");

// The app treats photo_urls as public URLs. The seed uses these exact URLs,
// so the DB and the static site stay in agreement on where images live.
const imgUrl = (slug) => `${SURL}/storage/v1/object/public/tiles/${slug}.jpg`;

// makeTile() constants from src/data/seeds/real-tiles.ts (must stay in sync).
const Dims = "ARRAY[600, 1200, 9]"; // mm: 600x1200, 9mm thick
const BoxArea = "31"; // sqft per box
const TilesPerBox = "4";
const desc = (col) => `${col} collection, 600x1200mm. Price on request.`;

const q = (s) => "'" + String(s).replace(/'/g, "''") + "'";

const inserts = rows
  .map((r) => {
      "2f" +
      r.prefix +
      "-" +
      String(r.n).padStart(6, "0") +
      "-0000-4000-8000-" +
      String(100000 + Number(r.n));
    const rooms = r.rooms
      .replace(/["\[\]\s]/g, "")
      .split(",")
      .filter(Boolean)
      .map((v) => q(v));
    const vals = [
      q(r.slug),
      q(r.name),
      "NULL", // name_hi
      "NULL", // origin_id
      "NULL", // supplier_id
      q(r.material),
      q(r.finish),
      `ARRAY[${rooms.join(",")}]::room_use[]`,
      q("rectangular"),
      Dims,
      BoxArea,
      TilesPerBox,
      "1", // price_per_box_inr: 1 rupee = "price on request" placeholder
      "1", // moq_boxes
      q("aaa"),
      q("made-to-order"),
      `ARRAY[${q(imgUrl(r.slug))}]`,
      `ARRAY[]::text[]`,
      "0", // featured_rank
      q(desc(r.collection)),
      "NULL", // description_hi
      "NULL", // default_wastage_pct
      "TRUE", // active
    ];
    return `(${vals.join(", ")})`;
  })
  .join(",\n");

const columns = `  slug, name_en, name_hi, origin_id, supplier_id,
  material_type, finish, room_uses, shape,
  nominal_dimensions_mm, box_area_sqft, tiles_per_box,
  price_per_box_inr, moq_boxes, grade, stock_status,
  photo_urls, video_urls, featured_rank,
  description_en, description_hi, default_wastage_pct, active`;

const migrationsDir = path.join(__dirname, "supabase", "migrations");
const files = fs.readdirSync(migrationsDir).filter((f) => f.endsWith(".sql")).sort();
const schema = files.map((f) => fs.readFileSync(path.join(migrationsDir, f), "utf8")).join("\n\n");

// Two compatibility fixes to the written migrations:
//  1. RLS: anonymous visitors must be able to READ the public catalogue. The
//     `for select using (true)` policies are fine, but without the anon
//     role granted, the table is readable only by the service key. The
//     PostgREST layer needs `anon` select on products.
//  2. price_per_box_inr has a check (> 0) that conflicts with the seed's
//     "on request" convention, so rows carry a placeholder of 1 rupee until
//     the shop sets real prices (edit the rows or re-run the insert with
//     real figures; the app treats any price as "settled per box").
const grants = `-- Anonymous visitors read the public catalogue through the website.
grant select on products to anon;
grant select on products to authenticated;
grant insert on enquiries to anon;
grant select on origins to anon;`;

const out = `-- ============================================================
-- OM ENTERPRISES — one-time Supabase setup (run ONCE)
-- Generated: ${new Date().toISOString().slice(0, 10)}
--
-- How to run (no knowledge of SQL needed):
--   1. Open your project in https://supabase.com/dashboard
--   2. Left menu: SQL Editor  >  New query
--   3. Paste this ENTIRE file, press RUN
--   4. Done. The 136 tiles are now in the products table.
--
-- After this, adding new tiles or changing prices = typing into the
-- tables in "Table Editor" (left menu), like a spreadsheet.
-- ============================================================

${schema}

${grants}

-- ------------------------------------------------------------
-- Catalogue seed: all 136 real tiles (96 Glossy Endless +
-- 40 Livenza). Images already uploaded to the public
-- "tiles" storage bucket; photo_urls point at them.
-- price_per_box_inr = 1 placeholder ("On request") until the
-- shop sets real prices.
-- ------------------------------------------------------------
insert into products (
${columns}
)
values
${inserts}
on conflict (slug) do update set
  name_en = excluded.name_en,
  material_type = excluded.material_type,
  finish = excluded.finish,
  room_uses = excluded.room_uses,
  photo_urls = excluded.photo_urls,
  description_en = excluded.description_en,
  active = excluded.active;

select count(*) as total_products from products;
`;

const dest = path.join(__dirname, "supabase", "supabase-setup.sql");
fs.writeFileSync(dest, out);
console.log("wrote " + dest + " (" + (out.length / 1024).toFixed(0) + " KB), " + rows.length + " inserts");
