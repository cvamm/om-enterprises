import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const supabase = createClient(
  "https://fpefdhzeqagducnoipsz.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZwZWZkaHplcWFnZHVjbm9pcHN6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5NDQxMTI5OCwiZXhwIjoyMTA5OTg3Mjk4fQ.GbUmKpVkS9HKvv_3fpw47u40g439XhF8mqDbw5liZq0"
);

function collectionToFolder(collection) {
  const map = {
    lustrous: "lustrous",
    "lustrous infinity": "lustrous-infinity",
    "color max": "color-max",
    inscript: "inscript",
    fossil: "fossil",
    "lustrous bm": "lustrous-bm",
    highgloss: "highgloss",
    typhoon: "typhoon",
    earthen: "earthen",
    "inscript slate": "inscript-slate",
    patio: "patio",
  };
  return map[collection.toLowerCase()] || collection.toLowerCase();
}

async function main() {
  const content = fs.readFileSync(path.join(__dirname, "..", "scripts", "import_cera.mjs"), "utf8");
  
  // Match tile entries: ["Name","Code","Collection","Finish","Material",[dims],box,tpb,["rooms"],hue]
  const re = /\[\"([^\"]+)\",\"([^\"]+)\",\"([^\"]+)\",\"([^\"]+)\",\"([^\"]+)\",\[([^\]]+)\],([\d.]+),([\d]+),\[([^\]]+)\],([\d.]+)\]/g;
  
  const tiles = [];
  let m;
  while ((m = re.exec(content)) !== null) {
    const [, name, code, collection, finish, material, dimsStr, boxArea, tpb, roomsStr, hue] = m;
    const dims = dimsStr.split(",").map(Number);
    const rooms = roomsStr.split(",").map((r) => r.trim().replace(/"/g, ""));
    tiles.push({ name, code, collection, finish, material, dims, boxArea: Number(boxArea), tpb: Number(tpb), rooms, hue: Number(hue) });
  }
  
  console.log("Total tiles parsed:", tiles.length);
  
  const bathroom = tiles.filter(t => t.rooms.includes("bathroom"));
  const kitchen = tiles.filter(t => t.rooms.includes("kitchen"));
  console.log("Bathroom:", bathroom.length, "| Kitchen:", kitchen.length);
  
  let inserted = 0;
  for (const tile of [...bathroom, ...kitchen]) {
    const { name, code, collection, finish, material, dims, boxArea, tpb, rooms } = tile;
    const slug = collection.toLowerCase().replace(/\s+/g, "-") + "-" + code.toLowerCase();
    const folder = collectionToFolder(collection);
    const publicUrl = "https://fpefdhzeqagducnoipsz.supabase.co/storage/v1/object/public/tiles/" + folder + "/" + code + ".jpg";
    
    const { error } = await supabase.from("products").upsert({
      slug,
      name_en: name,
      name_hi: null,
      origin_id: null,
      supplier_id: null,
      material_type: material,
      finish,
      room_uses: rooms,
      shape: dims[0] === dims[1] ? "square" : "rectangular",
      nominal_dimensions_mm: dims,
      box_area_sqft: boxArea,
      tiles_per_box: tpb,
      price_per_box_inr: 1,
      moq_boxes: 1,
      grade: "aaa",
      stock_status: "made-to-order",
      photo_urls: [publicUrl],
      video_urls: [],
      featured_rank: null,
      description_en: collection + " collection, " + dims[0] + "x" + dims[1] + "mm. Price on request.",
      description_hi: null,
      default_wastage_pct: null,
      active: true,
    }, { onConflict: "slug" });
    
    if (error) {
      console.error("  FAIL " + name + ": " + error.message);
    } else {
      inserted++;
    }
  }
  
  console.log("Inserted:", inserted);
}

main().catch(console.error);
