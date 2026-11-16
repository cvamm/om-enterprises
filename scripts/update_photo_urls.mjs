import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const supabase = createClient(
  "https://fpefdhzeqagducnoipsz.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZwZWZkaHplcWFnZHVjbm9pcHN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ0MTEyOTgsImV4cCI6MjEwOTk4NzI5OH0.USEg2fcAsRNCgrZ7qN-F9Y7gNIlIHjC8tner2a9SEgE"
);

// Read all extracted image filenames
const imgDir = path.join(__dirname, "..", "public", "tiles", "cera");
const files = fs.readdirSync(imgDir);

// Build code -> filename map
const codeToFile = {};
for (const f of files) {
  const m = f.match(/^(T\d{6}[A-Z]{2})/);
  if (m) {
    codeToFile[m[1]] = f;
  }
}

console.log("Image files mapped:", Object.keys(codeToFile).length);

// Read product codes from import_cera.mjs
const PRODUCT_NAMES = {};
const importContent = fs.readFileSync(path.join(__dirname, "import_cera.mjs"), "utf8");
for (const line of importContent.split("\n")) {
  const m = line.match(/\["([^"]+)","([^"]+)"/);
  if (m) {
    PRODUCT_NAMES[m[2]] = m[1];
  }
}

// Get all CERA products from DB
const { data: products } = await supabase
  .from("products")
  .select("id, slug, name_en, material_type, photo_urls")
  .eq("material_type", "vitrified")
  .limit(2000);

console.log("Total vitrified products:", products?.length);

// Update photo_urls
let updated = 0;
let notFound = 0;
const notFoundCodes = [];

for (const p of products) {
  const slugParts = p.slug.split("-");
  const codePart = slugParts[slugParts.length - 1].toUpperCase();
  
  if (codeToFile[codePart]) {
    const newUrl = `/tiles/cera/${codeToFile[codePart]}`;
    if (p.photo_urls?.[0] !== newUrl) {
      const { error } = await supabase
        .from("products")
        .update({ photo_urls: [newUrl] })
        .eq("id", p.id);
      
      if (error) {
        console.error("Update fail:", p.name_en, error.message);
      } else {
        updated++;
      }
    }
  } else {
    notFound++;
    notFoundCodes.push(`${p.name_en} (code: ${codePart})`);
  }
}

console.log("\nUpdated:", updated);
console.log("No image found:", notFound);
if (notFoundCodes.length > 0) {
  console.log("\nProducts without images:");
  notFoundCodes.forEach(c => console.log(" ", c));
}
