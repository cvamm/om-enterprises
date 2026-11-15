/**
 * Seeds the Supabase products table with granite + marble data.
 * Reads the generated SQL file and executes it against Supabase Postgres.
 *
 * Usage: node seed-supabase.cjs
 */
const fs = require("fs");
const path = require("path");

const envPath = "C:\\Users\\anjua\\OneDrive\\Desktop\\OM Tiles\\kanpur-tiles\\.env.local";
const env = fs.readFileSync(envPath, "utf8");
const pick = (k) => {
  const line = env.split(/\r?\n/).find((l) => l.startsWith(k + "="));
  return line ? line.slice(k.length + 1).trim() : undefined;
};

const SURL = pick("NEXT_PUBLIC_SUPABASE_URL");
const SKEY = pick("SUPABASE_SERVICE_ROLE_KEY");
const DBURL = pick("DATABASE_URL");

if (!SURL || !SKEY || !DBURL) {
  console.error("Missing env vars. Check .env.local");
  process.exit(1);
}

// Use Supabase's SQL API to execute the seed
const sqlFile = path.join(
  "C:\\Users\\anjua\\OneDrive\\Desktop\\OM Tiles\\kanpur-tiles\\supabase",
  "seed-granite-marble.sql"
);

const sql = fs.readFileSync(sqlFile, "utf8");
console.log(`SQL file size: ${sql.length} bytes`);

async function executeSQL() {
  // Use Supabase's /pg/meta endpoint or direct postgres connection
  // We'll use the postgres connection from DATABASE_URL
  const [host, port, dbName] = DBURL.replace("postgresql://", "").replace("@", "@").split(":").slice(1).concat(DBURL.split("/").pop().split(":").slice(-1));
  
  // Actually, let's just use the Supabase REST API to execute SQL
  // via the /sql endpoint (if available) or use a simple approach
  const result = await fetch(`${SURL}/pg/endpoint`, {
    method: "POST",
    headers: {
      apikey: SKEY,
      Authorization: `Bearer ${SKEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: sql }),
  });

  if (!result.ok) {
    const text = await result.text();
    console.error(`HTTP ${result.status}: ${text}`);
    
    // Fallback: try the /sql endpoint
    const sqlResult = await fetch(`${SURL}/sql`, {
      method: "POST",
      headers: {
        apikey: SKEY,
        Authorization: `Bearer ${SKEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: sql }),
    });
    
    if (!sqlResult.ok) {
      const sqlText = await sqlResult.text();
      console.error(`SQL endpoint also failed: ${sqlText}`);
      console.log("\nFalling back to node-postgres...");
      await executeWithPostgres();
      return;
    }
    
    console.log("Executed via /sql endpoint");
  } else {
    const data = await result.json();
    console.log("Executed successfully:", JSON.stringify(data).slice(0, 200));
  }
}

async function executeWithPostgres() {
  // Use the pg module if available, otherwise use a simple approach
  let pg;
  try {
    pg = require("pg");
  } catch {
    console.log("pg module not found. Try: npm install pg");
    process.exit(1);
  }

  const client = new pg.Client(DBURL);
  await client.connect();
  console.log("Connected to Supabase Postgres");

  // Split the SQL and execute
  try {
    await client.query(sql);
    const count = await client.query(
      "select count(*)::int as total from products where material_type = 'natural-stone'"
    );
    console.log(`Natural stone products: ${count.rows[0].total}`);
  } catch (e) {
    console.error("SQL error:", e.message);
  } finally {
    await client.end();
  }
}

executeSQL().catch((e) => {
  console.error(e);
  process.exit(1);
});
