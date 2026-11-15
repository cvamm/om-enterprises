/**
 * Seeds granite + marble products into Supabase using REST API.
 * 
 * Uses the service role key to bypass RLS and insert directly.
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

if (!SURL || !SKEY) {
  console.error("Missing Supabase env vars");
  process.exit(1);
}

// Read the generated data
const dataFile = "C:\\Users\\anjua\\OneDrive\\Desktop\\OM Tiles\\kanpur-tiles\\data\\granite-marble-data.json";
const products = JSON.parse(fs.readFileSync(dataFile, "utf8"));

console.log(`Seeding ${products.length} products...`);

async function insertProducts() {
  // Insert in batches of 20
  const batchSize = 20;
  let totalInserted = 0;
  
  for (let i = 0; i < products.length; i += batchSize) {
    const batch = products.slice(i, i + batchSize).map((p) => ({
      slug: p.slug,
      name_en: p.nameEn,
      material_type: p.materialType,
      finish: p.finish,
      room_uses: p.roomUses,
      shape: "rectangular",
      nominal_dimensions_mm: [300, 600, 15],
      box_area_sqft: p.price > 1000 ? 40 : 31,
      tiles_per_box: 4,
      price_per_box_inr: p.price,
      moq_boxes: 1,
      grade: "aaa",
      stock_status: "in-stock",
      photo_urls: p.photoUrls,
      video_urls: [],
      featured_rank: null,
      description_en: p.desc,
      description_hi: null,
      default_wastage_pct: 10.0,
      active: true,
    }));
    
    const result = await fetch(`${SURL}/rest/v1/products?on_conflict=slug`, {
      method: "POST",
      headers: {
        apikey: SKEY,
        Authorization: `Bearer ${SKEY}`,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates, return=representation",
      },
      body: JSON.stringify(batch),
    });
    
    if (!result.ok) {
      const text = await result.text();
      console.error(`Batch ${i / batchSize + 1} failed:`, text.slice(0, 200));
    } else {
      const inserted = await result.json();
      totalInserted += Array.isArray(inserted) ? inserted.length : 0;
    }
    
    process.stdout.write(`\r  Progress: ${Math.min(i + batchSize, products.length)}/${products.length}`);
    
    // Small delay between batches
    await new Promise((r) => setTimeout(r, 200));
  }
  
  console.log(`\nDone! Inserted ${totalInserted} products`);
}

insertProducts().catch((e) => {
  console.error(e);
  process.exit(1);
});
