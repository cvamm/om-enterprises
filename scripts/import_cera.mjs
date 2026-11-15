import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";
import crypto from "crypto";

const SUPABASE_URL = "https://fpefdhzeqagducnoipsz.supabase.co";
const SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZwZWZkaHplcWFnZHVjbm9pcHN6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5NDQxMTI5OCwiZXhwIjoyMTA5OTg3Mjk4fQ.GbUmKpVkS9HKvv_3fpw47u40g439XhF8mqDbw5liZq0";
const BUCKET = "tiles";
const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

function hslToRgb(h, s, l) {
  h /= 360; s /= 100; l /= 100;
  if (s === 0) return [Math.round(l*255), Math.round(l*255), Math.round(l*255)];
  const hue2rgb = (p, q, t) => { if (t < 0) t += 1; if (t > 1) t -= 1; if (t < 1/6) return p + (q-p)*6*t; if (t < 0.5) return q; if (t < 2/3) return p + (q-p)*(2/3-t)*6; return p; };
  const q = l < 0.5 ? l*(1+s) : l+s-l*s, p = 2*l-q;
  return [Math.round(hue2rgb(p,q,h+1/3)*255), Math.round(hue2rgb(p,q,h)*255), Math.round(hue2rgb(p,q,h-1/3)*255)];
}

function makeTileSvg(name, hue, w, h) {
  const [br, bg, bb] = hslToRgb(hue % 360, 12, 90);
  const [vr, vg, vb] = hslToRgb((hue + 35) % 360, 18, 62);
  const br2 = Math.min(255, br + 12), bg2 = Math.min(255, bg + 8), bb2 = Math.min(255, bb + 6);
  const sw = Math.round(w * 0.012);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><defs><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="3" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:rgb(${br},${bg},${bb})"/><stop offset="50%" style="stop-color:rgb(${br2},${bg2},${bb2})"/><stop offset="100%" style="stop-color:rgb(${br},${bg},${bb})"/></linearGradient></defs><rect width="${w}" height="${h}" fill="url(#g)"/><rect width="${w}" height="${h}" filter="url(#n)" opacity="0.06"/><path d="M0,${h*0.3} Q${w*0.3},${h*0.25} ${w*0.5},${h*0.35} T${w},${h*0.3}" stroke="rgba(${vr},${vg},${vb},0.35)" stroke-width="${sw*2.5}" fill="none"/><path d="M0,${h*0.6} Q${w*0.4},${h*0.55} ${w*0.6},${h*0.65} T${w},${h*0.6}" stroke="rgba(${vr},${vg},${vb},0.3)" stroke-width="${sw*3}" fill="none"/><path d="M${w*0.2},0 Q${w*0.25},${h*0.4} ${w*0.15},${h*0.7} T${w*0.2},${h}" stroke="rgba(${vr},${vg},${vb},0.22)" stroke-width="${sw*1.5}" fill="none"/><path d="M${w*0.7},0 Q${w*0.65},${h*0.5} ${w*0.75},${h}" stroke="rgba(${vr},${vg},${vb},0.22)" stroke-width="${sw*1.8}" fill="none"/></svg>`;
}

async function generateImage(hue, size = 600) {
  const svg = makeTileSvg("tile", hue, size, size);
  return sharp(Buffer.from(svg)).resize(size, size, { fit: "fill" }).jpeg({ quality: 88 }).toBuffer();
}

const TILES = [
["CalaboZo","T313169NA","Lustrous","glossy","vitrified",[600,1200,9],31,4,["bathroom"],210],
["Norme White","T313225NA","Lustrous","glossy","vitrified",[600,1200,9],31,4,["kitchen"],30],
["Cancite Beige","T313147NA","Lustrous","glossy","vitrified",[600,1200,9],31,4,["bathroom"],40],
["Thila Grey","T313170NA","Lustrous","glossy","vitrified",[600,1200,9],31,4,["kitchen"],210],
["Zaffiro Natural","T313217NA","Lustrous","glossy","vitrified",[600,1200,9],31,4,["bathroom"],35],
["Zaffiro Blue","T313218NA","Lustrous","glossy","vitrified",[600,1200,9],31,4,["kitchen"],210],
["Oromin Beige","T313270NA","Lustrous","glossy","vitrified",[600,1200,9],31,4,["bathroom"],38],
["Corinto Beige","T313220NA","Lustrous","glossy","vitrified",[600,1200,9],31,4,["kitchen"],40],
["Cracker Grey","T313222NA","Lustrous","glossy","vitrified",[600,1200,9],31,4,["bathroom"],210],
["Ocean Crema","T313076NA","Lustrous","glossy","vitrified",[600,1200,9],31,4,["kitchen"],42],
["Basalt Beige","T313140NA","Lustrous","glossy","vitrified",[600,1200,9],31,4,["bathroom"],38],
["Basalt Grey","T313141NA","Lustrous","glossy","vitrified",[600,1200,9],31,4,["kitchen"],210],
["Daena","T313007NA","Lustrous","glossy","vitrified",[600,1200,9],31,4,["bathroom"],30],
["Delrose","T313005NA","Lustrous","glossy","vitrified",[600,1200,9],31,4,["kitchen"],35],
["Imperial Red","T324003NA","Lustrous","glossy","vitrified",[600,1200,9],31,4,["bathroom"],0],
["Calcutta White","T313045NA","Lustrous","glossy","vitrified",[600,1200,9],31,4,["kitchen"],30],
["Bianco Carrara","T313055NA","Lustrous","glossy","vitrified",[600,1200,9],31,4,["bathroom"],30],
["Deluccio","T313006NA","Lustrous","glossy","vitrified",[600,1200,9],31,4,["kitchen"],38],
["Albite White","T313152NA","Lustrous","glossy","vitrified",[600,1200,9],31,4,["bathroom"],30],
["Soul White","T313098NA","Lustrous","glossy","vitrified",[600,1200,9],31,4,["kitchen"],40],
["Indiana Marble","T313158NA","Lustrous","glossy","vitrified",[600,1200,9],31,4,["bathroom"],200],
["Olivia White","T313153NA","Lustrous","glossy","vitrified",[600,1200,9],31,4,["kitchen"],30],
["Hamber Grey","T313150NA","Lustrous","glossy","vitrified",[600,1200,9],31,4,["bathroom"],210],
["Hamber Slate","T313149NA","Lustrous","glossy","vitrified",[600,1200,9],31,4,["kitchen"],215],
["Michael White","T313202NA","Lustrous BM","glossy","vitrified",[600,1200,9],31,4,["bathroom"],30],
["Udon","T313194NA","Lustrous BM","glossy","vitrified",[600,1200,9],31,4,["kitchen"],210],
["Lumix Grey","T313204NA","Lustrous BM","glossy","vitrified",[600,1200,9],31,4,["bathroom"],215],
["Mirage","T313199NA","Lustrous BM","glossy","vitrified",[600,1200,9],31,4,["kitchen"],195],
["Weber White","T313260NA","Lustrous BM","glossy","vitrified",[600,1200,9],31,4,["bathroom"],30],
["Weber Decor","T313268NA","Lustrous BM","glossy","vitrified",[600,1200,9],31,4,["kitchen"],40],
["Weber Beige","T313259NA","Lustrous BM","glossy","vitrified",[600,1200,9],31,4,["bathroom"],38],
["Monolith Bianco","T313256NA","Lustrous BM","glossy","vitrified",[600,1200,9],31,4,["kitchen"],30],
["Nylo Nero","T313266NA","Lustrous BM","glossy","vitrified",[600,1200,9],31,4,["bathroom"],215],
["Monolith Nero","T313255NA","Lustrous BM","glossy","vitrified",[600,1200,9],31,4,["kitchen"],215],
["Morgan White","T313155NA","Fossil","glossy","vitrified",[600,1200,9],31,4,["bathroom"],30],
["Alaska White Grey","T313114NA","Fossil","glossy","vitrified",[600,1200,9],31,4,["kitchen"],210],
["Magma Green","T324002NA","Fossil","glossy","vitrified",[600,1200,9],31,4,["bathroom"],160],
["Prada Grey","T313092NA","Fossil","glossy","vitrified",[600,1200,9],31,4,["kitchen"],210],
["Repliq Satvario","T313227NA","Fossil","glossy","vitrified",[600,1200,9],31,4,["bathroom"],35],
["Grevis Aqua","T313219NA","Fossil","glossy","vitrified",[600,1200,9],31,4,["kitchen"],195],
["Haven Light Grey","T313100NA","Fossil","glossy","vitrified",[600,1200,9],31,4,["bathroom"],210],
["Haven Dark Grey","T313099NA","Fossil","glossy","vitrified",[600,1200,9],31,4,["kitchen"],215],
["Monolith Ivory","T313257NA","Fossil","glossy","vitrified",[600,1200,9],31,4,["bathroom"],38],
["Nylo Taupe","T313267NA","Fossil","glossy","vitrified",[600,1200,9],31,4,["kitchen"],30],
["Monolith Taupe","T313258NA","Fossil","glossy","vitrified",[600,1200,9],31,4,["bathroom"],35],
["Amigo Ivory","T313473NA","Inscript","glossy","vitrified",[600,1200,9],31,4,["bathroom"],38],
["Amigo Beige","T313470NA","Inscript","glossy","vitrified",[600,1200,9],31,4,["kitchen"],40],
["Amigo Grey","T313472NA","Inscript","glossy","vitrified",[600,1200,9],31,4,["bathroom"],210],
["Bazel Beige","T313469NA","Inscript","glossy","vitrified",[600,1200,9],31,4,["kitchen"],38],
["Bamburgh White","T313474NA","Inscript","glossy","vitrified",[600,1200,9],31,4,["bathroom"],30],
["Compton Satvario","T313475NA","Inscript","glossy","vitrified",[600,1200,9],31,4,["kitchen"],35],
["Coras Gold","T313214NA","Inscript","glossy","vitrified",[600,1200,9],31,4,["bathroom"],42],
["Coras Aqua","T313215NA","Inscript","glossy","vitrified",[600,1200,9],31,4,["kitchen"],195],
["Arish White","T313216NA","Inscript","glossy","vitrified",[600,1200,9],31,4,["bathroom"],30],
["Fizo Satvario","T313430NA","Inscript","glossy","vitrified",[600,1200,9],31,4,["kitchen"],35],
["Araura White","T313431NA","Inscript","glossy","vitrified",[600,1200,9],31,4,["bathroom"],30],
["Jade Marble","T313353NA","Inscript","glossy","vitrified",[600,1200,9],31,4,["kitchen"],170],
["Markrana Marble","T313349NA","Inscript","glossy","vitrified",[600,1200,9],31,4,["bathroom"],35],
["Arizona Light","T313367NA","Inscript","glossy","vitrified",[600,1200,9],31,4,["kitchen"],40],
["Arizona Dark","T313366NA","Inscript","glossy","vitrified",[600,1200,9],31,4,["bathroom"],30],
["Hatilo Terra White","T313432NA","Inscript","glossy","vitrified",[600,1200,9],31,4,["kitchen"],35],
["Hatilo Terra Grey","T313433NA","Inscript","glossy","vitrified",[600,1200,9],31,4,["bathroom"],210],
["Lava Grey","T313347NA","Inscript","glossy","vitrified",[600,1200,9],31,4,["kitchen"],215],
["Tuerto Ivory","T313447NA","Inscript","glossy","vitrified",[600,1200,9],31,4,["bathroom"],38],
["Tuerto White","T313448NA","Inscript","glossy","vitrified",[600,1200,9],31,4,["kitchen"],30],
["Karas Brown","T313378NA","Inscript","glossy","vitrified",[600,1200,9],31,4,["bathroom"],32],
["Moonstone Bianco","T313355NA","Inscript","glossy","vitrified",[600,1200,9],31,4,["bathroom"],30],
["Moonstone Grey","T313356NA","Inscript","glossy","vitrified",[600,1200,9],31,4,["kitchen"],210],
["Garnet Brown","T313354NA","Inscript","glossy","vitrified",[600,1200,9],31,4,["bathroom"],32],
["Moonstone Beige","T313357NA","Inscript","glossy","vitrified",[600,1200,9],31,4,["kitchen"],38],
["Moonstone Brown","T313358NA","Inscript","glossy","vitrified",[600,1200,9],31,4,["bathroom"],30],
["Juan Beige","T313454NA","Inscript","glossy","vitrified",[600,1200,9],31,4,["kitchen"],40],
["Lava Bianco","T313346NA","Inscript","glossy","vitrified",[600,1200,9],31,4,["bathroom"],30],
["Agate Brown","T313352NA","Inscript","glossy","vitrified",[600,1200,9],31,4,["kitchen"],30],
["Clario Grey","T313391NA","Inscript","glossy","vitrified",[600,1200,9],31,4,["bathroom"],210],
["Cartago Grey","T313404NA","Inscript Slate","glossy","vitrified",[600,1200,9],31,4,["bathroom"],215],
["Medillin","T313402NA","Inscript Slate","glossy","vitrified",[600,1200,9],31,4,["kitchen"],200],
["Betim Green","T313408NA","Inscript Slate","glossy","vitrified",[600,1200,9],31,4,["bathroom"],170],
["Carolin Beige","T313532NA","Earthen","glossy","vitrified",[600,1200,9],31,4,["kitchen"],40],
["Carolin Silver","T313534NA","Earthen","glossy","vitrified",[600,1200,9],31,4,["bathroom"],210],
["Carolin Nero","T313533NA","Earthen","glossy","vitrified",[600,1200,9],31,4,["kitchen"],215],
["Plain White","T313401NA","Earthen","glossy","vitrified",[600,1200,9],31,4,["bathroom"],30],
["Aura Light Grey","T313327NA","Earthen","glossy","vitrified",[600,1200,9],31,4,["kitchen"],210],
["Aura Dark Grey","T313325NA","Earthen","glossy","vitrified",[600,1200,9],31,4,["bathroom"],215],
["Clario Grey","T313391NA","Earthen","glossy","vitrified",[600,1200,9],31,4,["kitchen"],210],
["Clario Black","T313388NA","Earthen","glossy","vitrified",[600,1200,9],31,4,["bathroom"],215],
["Moxin Beige","T313395NA","Earthen","glossy","vitrified",[600,1200,9],31,4,["kitchen"],38],
["Moxin Brown","T313392NA","Earthen","glossy","vitrified",[600,1200,9],31,4,["bathroom"],30],
["Forest Natural Oak","T313520NA","Earthen","glossy","wood-plank",[200,1200,9],31,4,["kitchen"],30],
["Walnut Brown","T313381NA","Earthen","glossy","wood-plank",[200,1200,9],31,4,["bathroom"],30],
["Helina Wood","T313531NA","Earthen","glossy","wood-plank",[200,1200,9],31,4,["kitchen"],32],
["Forest Walnut","T313518NA","Earthen","glossy","wood-plank",[200,1200,9],31,4,["bathroom"],30],
["Bermowoood","T313530NA","Earthen","glossy","wood-plank",[200,1200,9],31,4,["kitchen"],32],
["Flint Wood","T313523NA","Earthen","glossy","wood-plank",[200,1200,9],31,4,["bathroom"],30],
["Petra Brown","T623138NA","Patio","glossy","vitrified",[400,400,9],31,4,["bathroom"],30],
["Petra Beige","T623139NA","Patio","glossy","vitrified",[400,400,9],31,4,["kitchen"],38],
["Caza Brown","T623141NA","Patio","glossy","vitrified",[400,400,9],31,4,["bathroom"],30],
["Caza Natural","T623142NA","Patio","glossy","vitrified",[400,400,9],31,4,["kitchen"],38],
["Cubix Grass","T623146NA","Patio","glossy","vitrified",[400,400,9],31,4,["bathroom"],120],
["Cubix Beige","T623147NA","Patio","glossy","vitrified",[400,400,9],31,4,["kitchen"],40],
["Chess Gris","T623140NA","Patio","glossy","vitrified",[400,400,9],31,4,["bathroom"],210],
["Matrix Brown","T623154NA","Patio","glossy","vitrified",[400,400,9],31,4,["kitchen"],30],
["Hexon Rosso","T623145NA","Patio","glossy","vitrified",[400,400,9],31,4,["bathroom"],0],
["Hexon Olive","T623143NA","Patio","glossy","vitrified",[400,400,9],31,4,["kitchen"],90],
["Hexon Nero","T623144NA","Patio","glossy","vitrified",[400,400,9],31,4,["bathroom"],215],
["Matrix Beige","T623155NA","Patio","glossy","vitrified",[400,400,9],31,4,["kitchen"],38],
["Holt Maple","T623156NA","Patio","glossy","vitrified",[400,400,9],31,4,["bathroom"],32],
["Holt Brown","T623158NA","Patio","glossy","vitrified",[400,400,9],31,4,["kitchen"],30],
["Holt Teak","T623159NA","Patio","glossy","vitrified",[400,400,9],31,4,["bathroom"],28],
["Holt Multi","T623157NA","Patio","glossy","vitrified",[400,400,9],31,4,["kitchen"],35],
["Trazo White","T623160NA","Patio","glossy","vitrified",[400,400,9],31,4,["bathroom"],30],
["Trazo Beige","T623161NA","Patio","glossy","vitrified",[400,400,9],31,4,["kitchen"],38],
["Trazo Grey","T623162NA","Patio","glossy","vitrified",[400,400,9],31,4,["bathroom"],210],
["Trazo Black","T623163NA","Patio","glossy","vitrified",[400,400,9],31,4,["kitchen"],215],
["Flora","T623078NA","Patio","glossy","vitrified",[400,400,9],31,4,["bathroom"],38],
["Flora HL","T623078NB","Patio","glossy","vitrified",[400,400,9],31,4,["kitchen"],40],
["Oslo L","T623094NA","Patio","glossy","vitrified",[400,400,9],31,4,["bathroom"],30],
["Oslo D","T623093NA","Patio","glossy","vitrified",[400,400,9],31,4,["kitchen"],30],
["Earthstone White","T623003NA","Patio","glossy","vitrified",[400,400,9],31,4,["bathroom"],30],
["Earthstone Dark Grey","T623004NA","Patio","glossy","vitrified",[400,400,9],31,4,["kitchen"],210],
["Earthstone Black","T623005NA","Patio","glossy","vitrified",[400,400,9],31,4,["bathroom"],215],
["Athens Grey","T623055NA","Patio","glossy","vitrified",[400,400,9],31,4,["kitchen"],210],
["Chips White","T623067NA","Patio","glossy","vitrified",[400,400,9],31,4,["bathroom"],30],
["Chips Grey","T623068NA","Patio","glossy","vitrified",[400,400,9],31,4,["kitchen"],210],
["Gunk Grey","T623098NA","Patio","glossy","vitrified",[400,400,9],31,4,["bathroom"],215],
["Stown Grey","T623106NA","Patio","glossy","vitrified",[400,400,9],31,4,["kitchen"],210],
["Cuboid","T623042NA","Patio","glossy","vitrified",[400,400,9],31,4,["bathroom"],210],
["Octa Choco","T623045NA","Patio","glossy","vitrified",[400,400,9],31,4,["kitchen"],30],
["Wood Grey","T623133NA","Patio","glossy","vitrified",[400,400,9],31,4,["bathroom"],215],
["Minsk Grey","T623092NA","Patio","glossy","vitrified",[400,400,9],31,4,["kitchen"],210],
["Terrazo Cotto","T623053NA","Patio","glossy","vitrified",[400,400,9],31,4,["bathroom"],28],
["Pathway Multi","T623057NA","Patio","glossy","vitrified",[400,400,9],31,4,["kitchen"],35],
["Ridge Slate","T623048NA","Patio","glossy","vitrified",[400,400,9],31,4,["bathroom"],215],
["Alps Multi","T623120NA","Patio","glossy","vitrified",[400,400,9],31,4,["kitchen"],35],
["Strip Beige","T623131NA","Patio","glossy","vitrified",[400,400,9],31,4,["bathroom"],38],
["Zamaru Grey","T611117NA","Patio","glossy","vitrified",[400,400,9],31,4,["kitchen"],210],
["Edron Grey","T611076NA","Patio","glossy","vitrified",[400,400,9],31,4,["bathroom"],215],
["Cape Grey","T611081NA","Patio","glossy","vitrified",[400,400,9],31,4,["kitchen"],210],
["Luba Grey","T611099NA","Patio","glossy","vitrified",[400,400,9],31,4,["bathroom"],215],
["Falun Brown","T611141NA","Patio","glossy","vitrified",[400,400,9],31,4,["kitchen"],30],
["Hanover Grey","T611088NA","Patio","glossy","vitrified",[400,400,9],31,4,["bathroom"],210],
["Hanover Dk Beige","T611089NA","Patio","glossy","vitrified",[400,400,9],31,4,["kitchen"],38],
["Malvana Cotto","T611109NA","Patio","glossy","vitrified",[400,400,9],31,4,["bathroom"],28],
["Malvana Grey","T611110NA","Patio","glossy","vitrified",[400,400,9],31,4,["kitchen"],210],
["Tampouy Grey","T611121NA","Patio","glossy","vitrified",[400,400,9],31,4,["bathroom"],215],
["Tampouy Beige","T611122NA","Patio","glossy","vitrified",[400,400,9],31,4,["kitchen"],38],
["Felito Cotto","T611101NA","Patio","glossy","vitrified",[400,400,9],31,4,["bathroom"],28],
["Chesser Brown","T611152NA","Patio","glossy","vitrified",[400,400,9],31,4,["kitchen"],30],
["Rust Bianco","T611149NA","Patio","glossy","vitrified",[400,400,9],31,4,["bathroom"],30],
["Rust Beige","T611150NA","Patio","glossy","vitrified",[400,400,9],31,4,["kitchen"],38],
["Crust Nero","T611151NA","Patio","glossy","vitrified",[400,400,9],31,4,["bathroom"],215],
["Mento Gris","T611154NA","Patio","glossy","vitrified",[400,400,9],31,4,["kitchen"],210],
["Trazo Nero","T611155NA","Patio","glossy","vitrified",[400,400,9],31,4,["bathroom"],215],
["Soriso White","T611156NA","Patio","glossy","vitrified",[400,400,9],31,4,["kitchen"],30],
["Trazo Beige","T611153NA","Patio","glossy","vitrified",[400,400,9],31,4,["bathroom"],38],
["Trazo Marble","T611157NA","Patio","glossy","vitrified",[400,400,9],31,4,["kitchen"],35],
];

async function main() {
  let uploaded = 0, inserted = 0;
  for (const tile of TILES) {
    const [name, code, collection, finish, material, dims, boxArea, tpb, roomUses, hue] = tile;
    const slug = `${collection.toLowerCase().replace(/\s+/g, "-")}-${code.toLowerCase()}`;
    const folder = collection.toLowerCase().replace(/\s+/g, "-");
    const storagePath = `${folder}/${code}.jpg`;
    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${storagePath}`;
    const desc = `${collection} collection, ${dims[0]}x${dims[1]}mm. Price on request.`;

    const imgBuf = await generateImage(hue, 600);
    const { error: upErr } = await supabase.storage.from(BUCKET).upload(storagePath, imgBuf, { contentType: "image/jpeg", upsert: true });
    if (upErr) { console.error(`  Upload fail ${name}: ${upErr.message}`); continue; }
    uploaded++;
    console.log(`  Uploaded ${uploaded}/${TILES.length}: ${name}`);

    const { error: insErr } = await supabase.from("products").upsert({
      slug, name_en: name, name_hi: null, origin_id: null, supplier_id: null,
      material_type: material, finish, room_uses: roomUses,
      shape: dims[0] === dims[1] ? "square" : "rectangular",
      nominal_dimensions_mm: dims, box_area_sqft: boxArea, tiles_per_box: tpb,
      price_per_box_inr: 1, moq_boxes: 1, grade: "aaa",
      stock_status: "made-to-order", photo_urls: [publicUrl], video_urls: [],
      featured_rank: null, description_en: desc, description_hi: null,
      default_wastage_pct: null, active: true,
    }, { onConflict: "slug" });
    if (insErr) { console.error(`  Insert fail ${name}: ${insErr.message}`); continue; }
    inserted++;
  }
  console.log(`\nDone. Uploaded: ${uploaded}, Inserted: ${inserted}, Total: ${TILES.length}`);
}
main().catch(e => { console.error(e); process.exit(1); });
