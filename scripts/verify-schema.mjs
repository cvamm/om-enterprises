#!/usr/bin/env node
/**
 * verify-schema.mjs
 *
 * Applies every migration in order to a throwaway Postgres database and fails
 * on the first error. SQL that is never executed is SQL that is never correct
 * — this caught a misplaced STORED keyword and a missing-column trigger that
 * both passed review by eye.
 *
 * Needs a running Postgres. If SUPABASE_DB_URL is set it uses that; otherwise
 * it looks for a local server on PGHOST/PGPORT.
 *
 * Usage:
 *   node scripts/verify-schema.mjs
 *
 * Exit 0 when all migrations apply cleanly.
 */

import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const MIGRATIONS = join(ROOT, "supabase", "migrations");
const SHIM = join(ROOT, "supabase", "tests", "shim-auth.sql");

const config = {
  host: process.env.PGHOST ?? "/tmp",
  port: Number(process.env.PGPORT ?? 5433),
  user: process.env.PGUSER ?? "postgres",
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE ?? "postgres",
};

const SCRATCH_DB = "kt_schema_verify";

let Client;
try {
  ({ Client } = await import("pg"));
} catch {
  console.error(
    "✗ The `pg` package is required to verify migrations.\n  pnpm add -D pg",
  );
  process.exit(1);
}

const files = readdirSync(MIGRATIONS)
  .filter((f) => f.endsWith(".sql"))
  .sort();

if (files.length === 0) {
  console.error(`✗ No .sql files found in ${MIGRATIONS}`);
  process.exit(1);
}

const admin = new Client(config);
try {
  await admin.connect();
} catch (error) {
  console.error(`✗ Could not connect to Postgres at ${config.host}:${config.port}`);
  console.error(`  ${error.message}`);
  console.error("\n  Start one, or set PGHOST/PGPORT/PGUSER to an existing server.");
  process.exit(1);
}

// Always start from an empty database so a stale scratch DB cannot mask a
// migration that only works because of an object left behind by a prior run.
await admin.query(`drop database if exists ${SCRATCH_DB}`);
await admin.query(`create database ${SCRATCH_DB}`);
await admin.end();

const db = new Client({ ...config, database: SCRATCH_DB });
await db.connect();

let failures = 0;

console.log(`\nVerifying ${files.length} migrations on a scratch database`);
console.log("─".repeat(60));

// Supabase provisions auth.users and auth.uid() itself; a bare Postgres does
// not. The shim exists only so the foreign keys and policies typecheck here.
try {
  await db.query(readFileSync(SHIM, "utf8"));
  console.log(`shim auth schema          (test only, not shipped)`);
} catch (error) {
  console.error(`✗ auth shim failed: ${error.message}`);
  failures += 1;
}

for (const file of files) {
  const sql = readFileSync(join(MIGRATIONS, file), "utf8");
  try {
    await db.query(sql);
    console.log(`✓ ${file}`);
  } catch (error) {
    // Postgres reports a 1-based character offset. Show the surrounding text
    // rather than a bare line number, since these files are mostly comments.
    let context = "";
    if (typeof error.position === "number") {
      const p = error.position;
      const snippet = sql.slice(Math.max(0, p - 90), p + 40).replace(/\s+/g, " ");
      context = `\n    near: …${snippet}…`;
    }
    console.error(`✗ ${file}\n  ${error.message}${context}`);
    failures += 1;
    break;
  }
}

console.log("─".repeat(60));

if (failures === 0) {
  console.log("✓ All migrations apply cleanly.\n");
} else {
  console.error("✗ Schema verification failed.\n");
}

// Confirm the tables and RLS actually exist, so a migration that silently
// created nothing still fails the run.
try {
  const { rows } = await db.query(`
    select
      (select count(*) from information_schema.tables
        where table_schema = 'public' and table_type = 'BASE TABLE') as tables,
      (select count(*) from pg_policies where schemaname = 'public') as policies,
      (select count(*) from pg_indexes where schemaname = 'public') as indexes;
  `);
  const r = rows[0];
  console.log(`public tables: ${r.tables}  policies: ${r.policies}  indexes: ${r.indexes}`);
  if (Number(r.tables) < 6) {
    console.error(`✗ Expected at least 6 tables, found ${r.tables}.`);
    failures += 1;
  }
  if (Number(r.policies) < 7) {
    console.error(`✗ Expected at least 7 RLS policies, found ${r.policies}.`);
    failures += 1;
  }
} catch (error) {
  console.error(`✗ Introspection failed: ${error.message}`);
  failures += 1;
}

await db.end();
await admin.connect().catch(() => {});
process.exit(failures === 0 ? 0 : 1);