/**
 * Deterministic tile-surface data URIs for the hero matrix.
 *
 * The shop does not have product photography yet (sample products carry empty
 * photoUrls), so the hero cannot rely on real images. Instead, each tile is a
 * small inline SVG — one of several stone/ceramic textures at a few sizes and
 * finishes — generated locally. Inline SVG costs nothing to download and is
 * safe on a Moto G over 4G. The set is deterministic so the matrix is the
 * same on every load (no CLS from image swap-in).
 *
 * Once real product photos land in Supabase Storage, swap `heroTileImages()`
 * for the catalogue's first N `photoUrls`; the hero code below only asks for
 * a list of image sources.
 */

// Distinct base hues drawn from the design palette's earth range, kept
// muted so the tiles read as stone, not toy blocks.
type TileSurface = {
  base: string;
  grain: string;
  lines: string;
};

const SURFACES: TileSurface[] = [
  { base: "#d8cfc0", grain: "#c3b59a", lines: "#b89b6a" }, // bone
  { base: "#b9b0a0", grain: "#9a8f7d", lines: "#7d705c" }, // sand
  { base: "#8f8b83", grain: "#6f6a60", lines: "#524d44" }, // warm grey
  { base: "#c9a96a", grain: "#b08c48", lines: "#8a6f33" }, // gold
  { base: "#a39a8a", grain: "#877d6b", lines: "#6b6151" }, // taupe
  { base: "#6f6a62", grain: "#55504a", lines: "#3d3a34" }, // umber
  { base: "#e0d8c8", grain: "#cdc3ab", lines: "#b3a78c" }, // cream
  { base: "#9aa0a0", grain: "#7d8282", lines: "#5f6464" }, // cool marble
];

/**
 * A single tile as a tiny SVG data URI. `finish` 0–3 varies the glaze:
 * matte, textured, honed, gloss. The pattern (veins) is seeded by index so
 * adjacent tiles differ, mimicking a real quarried batch.
 */
function tileDataUri(index: number, finish: number): string {
  // `index % SURFACES.length` is always a valid index, so the lookup can never
  // be undefined despite `noUncheckedIndexedAccess` widening the type.
  const s = SURFACES[index % SURFACES.length]!;
  const vein =
    index % 2 === 0
      ? `M0 ${20 + (index * 3) % 40} C 60 ${5 + (index % 5) * 10}, 120 ${
          55 - (index % 4) * 8
        }, 200 ${15 + (index % 6) * 6}`
      : `M${10 + (index % 5) * 30} 0 C ${40 + (index % 4) * 20} 80, ${
          120 - (index % 3) * 20
        } 120, ${60 + (index % 7) * 12} 200`;

  const glaze =
    finish === 3
      ? '<rect width="200" height="200" fill="url(#g)" opacity="0.35"/>'
      : finish === 2
        ? '<rect width="200" height="200" fill="#fff" opacity="0.08"/>'
        : finish === 1
          ? '<rect width="200" height="200" fill="#000" opacity="0.06"/>'
          : "";

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">` +
    `<defs><radialGradient id="g" cx="0.3" cy="0.3" r="0.9">` +
    `<stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/>` +
    `</radialGradient></defs>` +
    `<rect width="200" height="200" fill="${s.base}"/>` +
    `<path d="${vein}" stroke="${s.grain}" stroke-width="2" fill="none" opacity="0.5"/>` +
    `<path d="${vein}" stroke="${s.lines}" stroke-width="0.6" fill="none" opacity="0.4" transform="translate(4,6)"/>` +
    glaze +
    `</svg>`;

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/**
 * A varied, deterministic list of tile image sources for the hero.
 * 48 tiles across 8 surfaces and 4 finishes, seeded so it never changes.
 */
export function heroTileImages(count = 48): string[] {
  const out: string[] = [];
  for (let i = 0; i < count; i++) {
    out.push(tileDataUri(i, i % 4));
  }
  return out;
}
