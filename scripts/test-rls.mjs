#!/usr/bin/env node
/**
 * test-rls.mjs
 *
 * Proves the RLS policies in 0009 actually deny what they claim to deny.
 *
 * A policy that fails to create is a visible error. A policy that creates but
 * evaluates wrong is silent, and it is the failure mode that actually matters
 * here — `contractors_self_insert` with `with check (true)` would let any
 * anonymous visitor mint themselves a gold-tier account with a 50% discount.
 *
 * Runs each case as a distinct, non-superuser role so RLS is genuinely
 * evaluated rather than bypassed by the table owner's privileges.
 *
 * Usage: node scripts/test-rls.mjs   (needs a running Postgres)
 * Exit 0 when every case behaves as documented.
 */

import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { readFileSync, readdirSync } from "node:fs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const MIGRATIONS = join(ROOT, "supabase", "migrations");
const SHIM = join(ROOT, "supabase", "tests", "shim-auth.sql");

const config = {
  host: process.env.PGHOST ?? "/tmp",
  port: Number(process.env.PGPORT ?? 5433),
  user: process.env.PGUSER ?? "postgres",
  database: process.env.PGDATABASE ?? "postgres",
};

const { Client } = await import("pg");
const SCRATCH_DB = "kt_rls_verify";

const admin = new Client(config);
await admin.connect();

// `drop database` fails if anything is still connected. A previous run that
// was interrupted mid-flight leaves a live session, and the scratch DB then
// survives — carrying its stale `anon` grants straight into the next run.
// Terminate before dropping so every run starts genuinely clean.
await admin.query(`
  select pg_terminate_backend(pid)
  from pg_stat_activity
  where datname = $1 and pid <> pg_backend_pid()
`, [SCRATCH_DB]);
await admin.query(`drop database if exists ${SCRATCH_DB}`);
await admin.query(`create database ${SCRATCH_DB}`);

// Roles are cluster-level, so a role left by a previous run survives the
// database drop. Drop it here while the scratch DB is empty, so `drop owned
// by` has nothing to reassign and cannot fail on dependencies. Doing it here
// rather than skipping means a leftover role can never mask a policy that
// stopped working.
//
// Both are separate statements: CREATE/DROP ROLE cannot run inside a DO block,
// and `drop owned by` needs a literal role name, not an identifier.
const hasAnon = await admin.query(
  `select exists (select 1 from pg_roles where rolname = 'anon') as present`,
);
if (hasAnon.rows[0].present) {
  // `drop owned by` only releases objects in the *current* database. A role
  // left by an earlier failed run can hold grants in a database that still
  // exists, so sweep every database we can connect to before dropping it.
  const { rows: dbs } = await admin.query(
    `select datname from pg_database where datallowconn and not datistemplate`,
  );
  for (const { datname } of dbs) {
    const other = new Client({ ...config, database: datname });
    try {
      await other.connect();
      await other.query(`drop owned by anon`);
    } catch {
      // Nothing owned there, or no permission — either way keep going.
    } finally {
      await other.end().catch(() => {});
    }
  }
  await admin.query(`drop role anon`);
}
await admin.end();

const db = new Client({ ...config, database: SCRATCH_DB });
await db.connect();
await db.query(readFileSync(SHIM, "utf8"));
for (const f of readdirSync(MIGRATIONS).filter((x) => x.endsWith(".sql")).sort()) {
  await db.query(readFileSync(join(MIGRATIONS, f), "utf8"));
}

// Anonymous visitor: the role an unauthenticated browser gets. Guaranteed
// absent by the drop above, so this is a plain CREATE.
await db.query(`create role anon nologin noinherit`);
await db.query(`grant usage on schema public to anon;`);
await db.query(`grant select on origins, products to anon;`);
await db.query(`grant select on projects to anon;`);
await db.query(`grant select on suppliers to anon;`);
await db.query(`grant insert on enquiries to anon;`);
await db.query(`grant insert on contractors to anon;`);

// Seed rows as the table owner (RLS is bypassed for the owner).
await db.query(
  `insert into origins (state, name) values ('rajasthan', 'Test Origin')`,
);

const verified = await db.query(
  `insert into suppliers (name, location, verified) values ('V', 'X', true) returning id`,
);
const unverified = await db.query(
  `insert into suppliers (name, location, verified) values ('U', 'Y', false) returning id`,
);

await db.query(
  `insert into products (slug, name_en, material_type, finish, shape,
     nominal_dimensions_mm, box_area_sqft, tiles_per_box, price_per_box_inr, active)
   values
     ('live-item', 'Live Item', 'vitrified', 'matte', 'square',
      ARRAY[600,600,10]::int[], 15.44, 4, 1200, true),
     ('delisted-item', 'Delisted Item', 'vitrified', 'matte', 'square',
      ARRAY[600,600,10]::int[], 15.44, 4, 1200, false)`,
);

await db.query(
  `insert into projects (locality, project_type, featured) values
     ('Kakadeo', 'Kitchen', true),
     ('Unlisted', 'Kitchen', false)`,
);

const anon = new Client({ ...config, database: SCRATCH_DB });
// Become the unprivileged role for the actual assertions.
await anon.query(`set role anon;`);

let pass = 0;
let fail = 0;

async function check(name, fn) {
  try {
    await fn();
    console.log(`✓ ${name}`);
    pass += 1;
  } catch (error) {
    console.error(`✗ ${name}\n    ${error.message}`);
    fail += 1;
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

await check("anonymous can read origins", async () => {
  const { rows } = await anon.query(`select id from origins`);
  assert(rows.length === 1, `expected 1 origin, got ${rows.length}`);
});

await check("anonymous sees only verified suppliers", async () => {
  const { rows } = await anon.query(`select id from suppliers`);
  assert(rows.length === 1, `expected 1 verified supplier, got ${rows.length}`);
  assert(rows[0].id === verified.rows[0].id, "wrong supplier returned");
  assert(rows[0].id !== unverified.rows[0].id, "unverified supplier leaked");
});

await check("anonymous cannot see inactive products", async () => {
  const { rows } = await anon.query(`select slug from products`);
  assert(rows.length === 1, `expected 1 product, got ${rows.length}`);
  assert(rows[0].slug === "live-item", "inactive product leaked");
});

await check("anonymous sees only featured projects", async () => {
  const { rows } = await anon.query(`select locality from projects`);
  assert(rows.length === 1, `expected 1 project, got ${rows.length}`);
  assert(rows[0].locality === "Kakadeo", "unfeatured project leaked");
});

await check("anonymous cannot read contractors", async () => {
  const { rows } = await anon.query(`select id from contractors`);
  assert(rows.length === 0, `expected 0 contractors, got ${rows.length}`);
});

await check("anonymous cannot read enquiries", async () => {
  const { rows } = await anon.query(`select id from enquiries`);
  assert(rows.length === 0, `expected 0 enquiries, got ${rows.length}`);
});

await check("anonymous can submit an enquiry (contact form)", async () => {
  await anon.query(
    `insert into enquiries (customer_name, phone, source)
     values ('Test', '919999999999', 'web')`,
  );
  const { rows } = await anon.query(`select id from enquiries`);
  assert(rows.length === 1, `expected 1 enquiry, got ${rows.length}`);
});

await check("anonymous cannot self-assign gold tier or a discount", async () => {
  // Needs auth.uid() to equal supabase_user_id for the insert policy to pass.
  // Simulate by granting the role a fixed uid via a session setting.
  await anon.query(`reset role;`);
  await db.query(`
    create or replace function auth.uid() returns uuid as $$
      select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
    $$ language sql stable;
  `);
  await db.query(`
    grant execute on function auth.uid() to anon;
  `);
  await anon.query(`set request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';`);
  await anon.query(`set role anon;`);

  await anon.query(
    `insert into contractors (supabase_user_id, real_name, phone, tier, trade_multiplier)
     values ('11111111-1111-1111-1111-111111111111', 'Test', '919999999999', 'gold', 0.50)`,
  );

  // Read it back as the table owner to inspect what actually landed.
  const { rows } = await db.query(
    `select tier, trade_multiplier, account_balance, credit_limit from contractors`,
  );
  assert(rows.length === 1, `expected 1 contractor, got ${rows.length}`);
  assert(rows[0].tier === "silver", `tier was not reset: got ${rows[0].tier}`);
  assert(
    Number(rows[0].trade_multiplier) === 1.0,
    `trade_multiplier was not reset: got ${rows[0].trade_multiplier}`,
  );
  assert(Number(rows[0].credit_limit) === 0, "credit_limit was not reset");
});

await check("contractor cannot read another contractor's enquiries", async () => {
  // Row belonging to a different contractor id.
  await db.query(`
    insert into contractors (supabase_user_id, real_name, phone)
    values ('22222222-2222-2222-2222-222222222222', 'Other', '919999999998')`);
  const other = await db.query(
    `select id from contractors where supabase_user_id = '22222222-2222-2222-2222-222222222222'`,
  );
  await db.query(
    `insert into enquiries (customer_name, phone, contractor_id)
     values ('X', '919999999997', $1)`,
    [other.rows[0].id],
  );

  await anon.query(`reset role;`);
  await anon.query(`set request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';`);
  await anon.query(`set role anon;`);

  const { rows } = await anon.query(
    `select id from enquiries where contractor_id = $1`,
    [other.rows[0].id],
  );
  assert(rows.length === 0, `cross-tenant read leaked ${rows.length} rows`);
});

await check("contractor can read their own enquiries", async () => {
  const me = await db.query(
    `select id from contractors where supabase_user_id = '11111111-1111-1111-1111-111111111111'`,
  );
  await db.query(
    `insert into enquiries (customer_name, phone, contractor_id)
     values ('Mine', '919999999996', $1)`,
    [me.rows[0].id],
  );

  const { rows } = await anon.query(
    `select id from enquiries where contractor_id = $1`,
    [me.rows[0].id],
  );
  assert(rows.length === 1, `expected to see own enquiry, got ${rows.length}`);
});

console.log("─".repeat(60));
console.log(`${pass} passed, ${fail} failed`);

await anon.end();
await db.end();
process.exit(fail === 0 ? 0 : 1);