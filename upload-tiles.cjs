/* One-off: uploads every catalogue tile JPG to the public "tiles" bucket
 * in Supabase, named by tile slug. Idempotent — re-running after adding new
 * tiles just uploads the new ones. Reads the service key from .env.local.
 *
 * Usage: node upload-tiles.cjs
 */
const fs = require("fs");
const path = require("path");
const { parseRealTiles } = require("./tile-map.cjs");

const env = fs.readFileSync(path.join(__dirname, ".env.local"), "utf8");
const pick = (k) => {
  const line = env.split(/\r?\n/).find((l) => l.startsWith(k + "="));
  return line ? line.slice(k.length + 1).trim() : undefined;
};
const SURL = pick("NEXT_PUBLIC_SUPABASE_URL");
const SKEY = pick("SUPABASE_SERVICE_ROLE_KEY");

if (!SURL || !SKEY) {
  console.error("missing Supabase URL or service key in .env.local");
  process.exit(1);
}

const rows = parseRealTiles();

(async () => {
  let ok = 0,
    fail = 0;
  const failed = [];
  for (const r of rows) {
    const local = path.join(__dirname, r.localPath);
    const remote = r.slug + ".jpg";
    const buf = fs.readFileSync(local);
    for (let attempt = 0; attempt < 3; attempt++) {
      const res = await fetch(`${SURL}/storage/v1/object/tiles/${remote}`, {
        method: "POST",
        headers: {
          apikey: SKEY,
          Authorization: "Bearer " + SKEY,
          "Content-Type": "image/jpeg",
          "Content-Disposition": "attachment",
        },
        body: buf,
      });
      if (res.ok) {
        ok++;
        break;
      }
      if (attempt === 2) {
        fail++;
        failed.push(remote + " (" + res.status + ")");
      }
      await new Promise((s) => setTimeout(s, 1500));
    }
    if ((ok + fail) % 20 === 0) console.log("progress " + (ok + fail) + "/" + rows.length);
  }
  console.log("done. ok=" + ok + " fail=" + fail);
  if (failed.length) console.log("failures:\n" + failed.join("\n"));
})();
