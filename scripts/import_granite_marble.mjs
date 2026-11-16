import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const supabase = createClient(
  "https://fpefdhzeqagducnoipsz.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZwZWZkaHplcWFnZHVjbm9pcHN6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5NDQxMTI5OCwiZXhwIjoyMTA5OTg3Mjk4fQ.GbUmKpVkS9HKvv_3fpw47u40g439XhF8mqDbw5liZq0"
);

async function main() {
  const data = JSON.parse(
    fs.readFileSync(path.join(__dirname, "..", "data", "granite-marble-data.json"), "utf8")
  );
  const products = Object.values(data);

  console.log(`Total products: ${products.length}`);

  let imported = 0;
  let failed = 0;

  for (const p of products) {
    // Determine material_type based on product name
    const nameLower = p.nameEn.toLowerCase();
    let materialType = p.materialType; // default from data (natural-stone)
    
    if (nameLower.includes("granite")) {
      materialType = "granite";
    } else if (nameLower.includes("marble") || nameLower.includes("onyx") || 
               nameLower.includes("agate") || nameLower.includes("crystal") ||
               nameLower.includes("pearl") || nameLower.includes("statuario") ||
               nameLower.includes("quartz")) {
      materialType = "natural-stone";
    }

    const { error } = await supabase.from("products").upsert(
      {
        slug: p.slug,
        name_en: p.nameEn,
        name_hi: null,
        origin_id: null,
        supplier_id: null,
        material_type: materialType,
        finish: p.finish,
        room_uses: p.roomUses,
        shape: "rectangular",
        nominal_dimensions_mm: [300, 600, 15],
        box_area_sqft: 31,
        tiles_per_box: 4,
        price_per_box_inr: p.price,
        moq_boxes: 1,
        grade: "aaa",
        stock_status: "in-stock",
        photo_urls: p.photoUrls || [],
        video_urls: [],
        featured_rank: null,
        description_en: p.desc,
        description_hi: null,
        default_wastage_pct: 10,
        active: true,
      },
      { onConflict: "slug" }
    );

    if (error) {
      console.error(`  FAIL ${p.nameEn}: ${error.message}`);
      failed++;
    } else {
      imported++;
      if (imported % 50 === 0) console.log(`  Imported ${imported}/${products.length}...`);
    }
  }

  console.log(`\nDone. Imported: ${imported}, Failed: ${failed}`);

  // Verify counts
  const { count: graniteCount } = await supabase.from("products").select("*", { count: "exact", head: true }).eq("material_type", "granite");
  const { count: marbleCount } = await supabase.from("products").select("*", { count: "exact", head: true }).eq("material_type", "natural-stone");
  console.log(`\nGranite products: ${graniteCount}`);
  console.log(`Marble products: ${marbleCount}`);
}

main().catch(console.error);
