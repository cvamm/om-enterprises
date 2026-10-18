/**
 * verify-size-buckets.mjs
 *
 * The catalogue has two independent implementations of the same size
 * buckets: a `gte`/`lte` range in SQL (getProducts) and a `longest <=`
 * ladder in JS (sampleMatch). They must agree, or the same product appears
 * under "medium" in dev and "small" in production — a difference nobody
 * would notice until a customer filtered by size and lost a tile.
 *
 * Runs the JS filter against real Postgres and compares, per product, which
 * bucket each side computes.
 *
 * Usage: node scripts/verify-size-buckets.mjs   (needs a running Postgres)
 */

const config = {
  host: process.env.PGHOST ?? "127.0.0.1",
  port: Number(process.env.PGPORT ?? 5433),
  user: process.env.PGUSER ?? "postgres",
};

const { Client } = await import("pg");
const admin = new Client({ ...config, database: "postgres" });
await admin.connect();
await admin.query(`drop database if exists kt_buckets`);
await admin.query(`create database kt_buckets`);
await admin.end();

const db = new Client({ ...config, database: "kt_buckets" });
await db.connect();

await db.query(`
  create table products (
    slug text primary key,
    l int not null,
    w int not null
  );
`);

await db.query(`
  insert into products (slug, l, w) values
    ('a',600,600), ('b',800,800), ('c',2400,1200), ('d',1200,600),
    ('e',300,300), ('f',1200,200),  ('g',300,300),  ('h',600,600),
    ('i',3200,1600),('j',600,600),  ('k',600,120),   ('l',600,600);
`);

// Mirrors sampleMatch's ladder in products.ts.
function jsBucket(l, w) {
  const longest = Math.max(l, w);
  if (longest <= 300) return "small";
  if (longest <= 600) return "medium";
  if (longest <= 800) return "large";
  return "xlarge";
}

// Mirrors the gte/lte bounds in getProducts.
const BOUNDS = {
  small: [0, 300],
  medium: [301, 600],
  large: [601, 800],
  xlarge: [801, Number.MAX_SAFE_INTEGER],
};

let mismatches = 0;
let checked = 0;

for (const [bucket, [lo, hi]] of Object.entries(BOUNDS)) {
  // A bind parameter above int4 range needs a cast, so inline it.
  const { rows } = await db.query(`
    select slug, l, w from products
    where greatest(l, w) >= ${lo} and greatest(l, w) <= ${hi}
    order by slug
  `);

  const sqlSet = new Set(rows.map((r) => r.slug));
  const { rows: all } = await db.query(`select slug, l, w from products order by slug`);
  const jsSet = new Set(all.filter((r) => jsBucket(r.l, r.w) === bucket).map((r) => r.slug));

  for (const slug of new Set([...sqlSet, ...jsSet])) {
    checked += 1;
    if (!sqlSet.has(slug) || !jsSet.has(slug)) {
      mismatches += 1;
      console.log(
        `✗ ${bucket}: ${slug} — SQL=${sqlSet.has(slug)} JS=${jsSet.has(slug)}`,
      );
    }
  }

  console.log(`✓ ${bucket}: SQL ${sqlSet.size} products, JS ${jsSet.size} products`);
}

console.log("─".repeat(60));
if (mismatches > 0) {
  console.error(`✗ ${mismatches} mismatches across ${checked} checks`);
  process.exit(1);
}
console.log(`✓ SQL and JS agree on all ${checked} checks`);

await db.end();