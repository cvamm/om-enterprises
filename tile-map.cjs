/* Shared helper: reads src/data/seeds/real-tiles.ts and produces the list
 * of {slug, material, finish, rooms, file} for every catalogue tile.
 * Used by upload-tiles.cjs and generate-supabase-setup.cjs.
 * Run "node tile-map.cjs" to see the parsed list. */
const fs = require("fs");
const path = require("path");

function parseRealTiles() {
  const src = fs.readFileSync(
    path.join(__dirname, "src/data/seeds/real-tiles.ts"),
    "utf8"
  );

  const imports = {};
  for (const m of src.matchAll(/^import (\w+) from "(@\/assets\/tiles\/[^"]+)"\s*;?\s*$/gm)) {
    imports[m[1]] = m[2];
  }

  const re =
    /makeTile\(\s*(\d+)\s*,\s*"([el])"\s*,\s*"([^"]+)"\s*,\s*"([^"]+)"\s*,\s*"([^"]+)"\s*,\s*"([^"]+)"\s*,\s*"([^"]+)"\s*,\s*(\w+)\.src\s*,\s*(\[[^\]]*\])\s*\)/g;
  const rows = [];
  let m;
  while ((m = re.exec(src))) {
    const filePath = imports[m[8]];
    if (!filePath) {
      throw new Error("no import found for alias " + m[8] + " (tile #" + m[1] + ")");
    }
    const localRel = "src/" + filePath.slice(2).replace(/\\/g, "/");
    if (!fs.existsSync(path.join(__dirname, localRel))) {
      throw new Error("image missing on disk: " + localRel);
    }
    rows.push({
      n: m[1],
      prefix: m[2],
      name: m[3],
      slug: m[4],
      collection: m[5],
      material: m[6],
      finish: m[7],
      localPath: localRel,
      rooms: m[9],
    });
  }
  return rows;
}

module.exports = { parseRealTiles };

if (require.main === module) {
  const rows = parseRealTiles();
  console.log(rows.length + " tiles parsed");
  console.log(rows[0]);
  console.log(rows[rows.length - 1]);
}
