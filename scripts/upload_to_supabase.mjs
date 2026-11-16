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
  // 1. Create the tiles bucket
  console.log("Creating 'tiles' bucket...");
  const { error: bucketError } = await supabase.storage.createBucket("tiles", {
    public: true,
    fileSizeLimit: 10485760,
  });
  if (bucketError && !bucketError.message.includes("already exists")) {
    console.error("Bucket create error:", bucketError.message);
  } else {
    console.log("Bucket ready.");
  }

  // 2. Upload all extracted images
  const imgDir = path.join(__dirname, "..", "public", "tiles", "cera");
  const files = fs.readdirSync(imgDir);
  console.log(`\nUploading ${files.length} images...`);

  let uploaded = 0;
  let failed = 0;

  for (const file of files) {
    const filePath = path.join(imgDir, file);
    const buffer = fs.readFileSync(filePath);

    // Determine folder from filename (collection-code.jpg)
    // Files are named like: T313169NA-CalaboZo.jpg
    const codeMatch = file.match(/^(T\d{6}[A-Z]{2})/);
    if (!codeMatch) {
      failed++;
      continue;
    }

    const code = codeMatch[1];
    const collectionGuess = file.replace(/\.jpg$/, "").replace(/^T\d{6}[A-Z]{2}-/, "").toLowerCase();

    // Map to collection folder based on code prefix
    let folder = "lustrous";
    if (code.startsWith("T324")) folder = "color-max";
    else if (code.startsWith("T323")) folder = "highgloss";
    else if (code.startsWith("T317")) folder = "lustrous";
    else if (code.startsWith("T313")) {
      // T313 codes span multiple collections
      const codeNum = parseInt(code.slice(1, 5));
      if (codeNum >= 270) folder = "fossil";
      else if (codeNum >= 260) folder = "lustrous-bm";
      else if (codeNum >= 250) folder = "inscript";
      else if (codeNum >= 390) folder = "earthen";
      else folder = "lustrous";
    }
    else if (code.startsWith("T623")) folder = "patio";
    else if (code.startsWith("T611")) folder = "patio";

    const storagePath = `${folder}/${code}.jpg`;

    const { error } = await supabase.storage
      .from("tiles")
      .upload(storagePath, buffer, {
        contentType: "image/jpeg",
        upsert: true,
      });

    if (error) {
      console.error(`  FAIL ${file}: ${error.message}`);
      failed++;
    } else {
      uploaded++;
      if (uploaded % 20 === 0) console.log(`  Uploaded ${uploaded}/${files.length}...`);
    }
  }

  console.log(`\nDone. Uploaded: ${uploaded}, Failed: ${failed}`);

  // 3. Update all CERA vitrified product photo_urls to point to the uploaded images
  console.log("\nUpdating product photo_urls...");

  const { data: products } = await supabase
    .from("products")
    .select("id, slug, name_en")
    .eq("material_type", "vitrified")
    .limit(2000);

  let updated = 0;
  for (const p of products) {
    const slugParts = p.slug.split("-");
    const codePart = slugParts[slugParts.length - 1].toUpperCase();
    const newUrl = `https://fpefdhzeqagducnoipsz.supabase.co/storage/v1/object/public/tiles/${codePart}.jpg`;

    // Determine folder from slug
    if (p.slug.startsWith("color-max-")) {
      const code = codePart;
      const { error } = await supabase
        .from("products")
        .update({ photo_urls: [`https://fpefdhzeqagducnoipsz.supabase.co/storage/v1/object/public/tiles/color-max/${code}.jpg`] })
        .eq("id", p.id);
      if (!error) updated++;
    } else if (p.slug.startsWith("highgloss-")) {
      const code = codePart;
      const { error } = await supabase
        .from("products")
        .update({ photo_urls: [`https://fpefdhzeqagducnoipsz.supabase.co/storage/v1/object/public/tiles/highgloss/${code}.jpg`] })
        .eq("id", p.id);
      if (!error) updated++;
    } else if (p.slug.startsWith("typhoon-")) {
      const code = codePart;
      const { error } = await supabase
        .from("products")
        .update({ photo_urls: [`https://fpefdhzeqagducnoipsz.supabase.co/storage/v1/object/public/tiles/typhoon/${code}.jpg`] })
        .eq("id", p.id);
      if (!error) updated++;
    } else if (p.slug.startsWith("inscript-") || p.slug.startsWith("lustrous-bm-") || p.slug.startsWith("fossil-")) {
      const folder = p.slug.split("-")[0];
      const code = codePart;
      const { error } = await supabase
        .from("products")
        .update({ photo_urls: [`https://fpefdhzeqagducnoipsz.supabase.co/storage/v1/object/public/tiles/${folder}/${code}.jpg`] })
        .eq("id", p.id);
      if (!error) updated++;
    } else {
      // lustrous, earthen, patio
      const folder = p.slug.split("-")[0];
      const code = codePart;
      const { error } = await supabase
        .from("products")
        .update({ photo_urls: [`https://fpefdhzeqagducnoipsz.supabase.co/storage/v1/object/public/tiles/${folder}/${code}.jpg`] })
        .eq("id", p.id);
      if (!error) updated++;
    }
  }

  console.log(`Updated photo_urls for ${updated} products`);
}

main().catch(console.error);
