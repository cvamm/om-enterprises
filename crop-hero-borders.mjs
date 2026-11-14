// Strip UI panels and black frames from hero tile screenshots.
// Run from project root: node crop-hero-borders.mjs
import sharp from "sharp";
import { readdir, unlink, stat } from "node:fs/promises";
import path from "node:path";
import fs from "node:fs";

const dir = path.join(import.meta.dirname, "src", "assets", "tiles", "hero");

// Per-file crop offsets.
// Most tiles: 90px left (UI panel) + 40px top (dark border).
// hero-24..29: no UI panel, just thin edge → 10px all sides.
// hero-30/31: same as most.
// hero-27: smaller panel → 70px left, 15px top.
const CROPS = {
  "hero-00.jpg": { left: 150, top: 40, right: 30 },
  "hero-01.jpg": { left: 150, top: 40, right: 30 },
  "hero-02.jpg": { left: 150, top: 40, right: 30 },
  "hero-03.jpg": { left: 150, top: 40, right: 30 },
  "hero-04.jpg": { left: 150, top: 40, right: 30 },
  "hero-05.jpg": { left: 150, top: 40, right: 30 },
  "hero-06.jpg": { left: 150, top: 40, right: 30 },
  "hero-07.jpg": { left: 150, top: 40, right: 30 },
  "hero-08.jpg": { left: 150, top: 40, right: 30 },
  "hero-09.jpg": { left: 150, top: 40, right: 30 },
  "hero-10.jpg": { left: 150, top: 40, right: 30 },
  "hero-11.jpg": { left: 150, top: 40, right: 30 },
  "hero-12.jpg": { left: 150, top: 40, right: 30 },
  "hero-13.jpg": { left: 150, top: 40, right: 30 },
  "hero-14.jpg": { left: 150, top: 40, right: 30 },
  "hero-15.jpg": { left: 150, top: 40, right: 30 },
  "hero-16.jpg": { left: 150, top: 40, right: 30 },
  "hero-17.jpg": { left: 150, top: 40, right: 30 },
  "hero-18.jpg": { left: 150, top: 40, right: 30 },
  "hero-19.jpg": { left: 150, top: 40, right: 30 },
  "hero-20.jpg": { left: 150, top: 40, right: 30 },
  "hero-21.jpg": { left: 150, top: 40, right: 30 },
  "hero-22.jpg": { left: 150, top: 40, right: 30 },
  "hero-23.jpg": { left: 150, top: 40, right: 30 },
  "hero-24.jpg": { left: 10, top: 10, right: 10 },
  "hero-25.jpg": { left: 10, top: 10, right: 10 },
  "hero-26.jpg": { left: 10, top: 10, right: 10 },
  "hero-27.jpg": { left: 130, top: 15, right: 20 },
  "hero-28.jpg": { left: 10, top: 10, right: 10 },
  "hero-29.jpg": { left: 10, top: 10, right: 10 },
  "hero-30.jpg": { left: 150, top: 40, right: 30 },
  "hero-31.jpg": { left: 150, top: 40, right: 30 },
};

const files = (await readdir(dir)).filter((f) => f.endsWith(".jpg")).sort();

for (const file of files) {
  const p = path.join(dir, file);
  const crop = CROPS[file];
  if (!crop || (crop.left === 0 && crop.top === 0 && !(crop.right > 0))) {
    console.log(`${file}: no crop`);
    continue;
  }
  const { data, info } = await sharp(p).raw().ensureAlpha().toBuffer({ resolveWithObject: true });
  const { width } = info;
  const height = data.length / width / info.channels;

  const rightTrim = crop.right || 0;
  const extract = {
    top: crop.top,
    left: crop.left,
    width: width - crop.left - rightTrim,
    height: height - crop.top,
  };

  const tmp = p + ".tmp";
  await sharp(p)
    .extract({ top: crop.top, left: crop.left, width: extract.width, height: extract.height })
    .jpeg({ quality: 88 })
    .toFile(tmp);
  fs.renameSync(tmp, p);
  console.log(`${file}: ${extract.width}x${extract.height}`);
}

console.log("done — run `npx next build` to verify");
