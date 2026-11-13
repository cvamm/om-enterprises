import type { MaterialType } from "@/types";

import vitrifiedUrl from "@/assets/tiles/vitrified.jpg";
import vitrifiedAltUrl from "@/assets/tiles/vitrified-alt.jpg";
import naturalStoneUrl from "@/assets/tiles/natural-stone.jpg";
import naturalStoneAltUrl from "@/assets/tiles/natural-stone-alt.jpg";
import engineeredMarbleUrl from "@/assets/tiles/engineered-marble.jpg";
import engineeredMarbleAltUrl from "@/assets/tiles/engineered-marble-alt.jpg";
import ceramicUrl from "@/assets/tiles/ceramic.jpg";
import woodPlankUrl from "@/assets/tiles/wood-plank.jpg";
import woodPlankAltUrl from "@/assets/tiles/wood-plank-alt.jpg";
import mosaicUrl from "@/assets/tiles/mosaic.jpg";
import terrazzoUrl from "@/assets/tiles/terrazzo.jpg";
import quartzUrl from "@/assets/tiles/quartz.jpg";

/**
 * Real tile/stone photography, licensed under the Pexels free licence
 * (no attribution required). Imported as Next.js assets so each entry is a
 * hashed build path — already prefixed with the demo `basePath` — which is
 * what makes the hero CSS background and the catalogue `photoUrls` render
 * correctly on the GitHub Pages subpath without any hand-prefixed URL.
 *
 * Each material maps to one primary surface and (where two look different
 * enough to be useful) one alternate. The alternate lets the hero matrix and
 * multi-photo galleries show variety instead of the same tile repeated.
 *
 * Alt text is a plain description of what the photo shows; it carries no
 * invented product name, because these are stand-in textures, not the shop's
 * own stock, and prices are added later.
 */
export type TilePhoto = {
  /** Basepath-safe image URL, safe for both `next/image` and CSS. */
  src: string;
  /** Short, truthful alt description of the surface. */
  alt: string;
  /** Pexels source, kept so the licensing is auditable before launch. */
  pexels: string;
};

/** One or two photos per material type; a brand-new type fails the build. */
const PHOTOS: Record<MaterialType, TilePhoto[]> = {
  vitrified: [
    {
      src: vitrifiedUrl.src,
      alt: "White vitrified tile surface with light natural veining",
      pexels: "https://www.pexels.com/photo/white-marble-surface-6769735/",
    },
    {
      src: vitrifiedAltUrl.src,
      alt: "Pale grey vitrified tile with a fine stone pattern",
      pexels: "https://www.pexels.com/photo/marble-surface-2341290/",
    },
  ],
  porcelain: [
    {
      src: vitrifiedAltUrl.src,
      alt: "Pale grey porcelain tile with a fine stone pattern",
      pexels: "https://www.pexels.com/photo/marble-surface-2341290/",
    },
  ],
  "natural-stone": [
    {
      src: naturalStoneUrl.src,
      alt: "Weathered natural stone with grey and rust veining",
      pexels: "https://www.pexels.com/photo/close-up-of-the-texture-of-a-stone-11255507/",
    },
    {
      src: naturalStoneAltUrl.src,
      alt: "Rough-hewn natural granite close up",
      pexels: "https://www.pexels.com/photo/texture-of-a-granite-close-up-photo-7599796/",
    },
  ],
  "engineered-marble": [
    {
      src: engineeredMarbleUrl.src,
      alt: "Polished engineered marble in warm beige tones",
      pexels: "https://www.pexels.com/photo/white-and-gray-marble-surface-5623204/",
    },
    {
      src: engineeredMarbleAltUrl.src,
      alt: "Dark engineered marble slab with strong movement",
      pexels: "https://www.pexels.com/photo/dark-marble-surface-18325726/",
    },
  ],
  ceramic: [
    {
      src: ceramicUrl.src,
      alt: "Decorative ceramic wall tiles in a bold pattern",
      pexels: "https://www.pexels.com/photo/pattern-from-ceramic-tiles-19341962/",
    },
  ],
  "wood-plank": [
    {
      src: woodPlankUrl.src,
      alt: "Wood-look plank tiles in a warm brown grain",
      pexels: "https://www.pexels.com/photo/a-close-up-of-a-wooden-floor-with-dark-wood-28101632/",
    },
    {
      src: woodPlankAltUrl.src,
      alt: "Weathered timber plank floor sample",
      pexels: "https://www.pexels.com/photo/a-close-up-shot-of-a-floor-made-of-wooden-panels-13088155/",
    },
  ],
  mosaic: [
    {
      src: mosaicUrl.src,
      alt: "Mosaic tile sheet of small irregular stone chips",
      pexels: "https://www.pexels.com/photo/detailed-mosaic-tile-pattern-close-up-33444077/",
    },
  ],
  terrazzo: [
    {
      src: terrazzoUrl.src,
      alt: "Terrazzo tile with an aggregate stone pattern",
      pexels: "https://www.pexels.com/photo/patterns-on-plain-texture-4977451/",
    },
  ],
  quartz: [
    {
      src: quartzUrl.src,
      alt: "White engineered stone counter with soft grey veining",
      pexels: "https://www.pexels.com/photo/marble-counter-top-3847490/",
    },
  ],
};

/** Photos for one product, keyed by material type. */
export function photosForMaterial(material: MaterialType): TilePhoto[] {
  return PHOTOS[material];
}

/** One cover image for a product, by material type. */
export function coverForMaterial(material: MaterialType): string {
  const first = PHOTOS[material][0];
  return first?.src ?? PHOTOS["vitrified"][0]!.src;
}

/**
 * Fully-colourful painted-tile backgrounds for the hero wall.
 *
 * These are CSS gradients, not photos: the hero is a decorative material
 * moment, not a product, and a colourful wall has to read instantly. A single
 * two-stop gradient plus a soft top-left sheen gives each tile the look of a
 * glazed, painted surface without any network request or image download — the
 * wall is a fixed, deterministic list so the LCP tile is the same every load.
 *
 * The palette is jewel-toned and warm to sit against the ink/bone site: teal,
 * terracotta, mustard, olive, dusty blue, coral, sage, plum, cream, ink.
 */
const TILE_COLORS: Array<[string, string]> = [
  ["#2f7d8a", "#1f5a63"], // teal
  ["#c1653e", "#a8502f"], // terracotta
  ["#c9973a", "#b4802e"], // mustard
  ["#7c7a4a", "#5f5e38"], // olive
  ["#5b7a8c", "#3f5a6b"], // dusty blue
  ["#c9705a", "#b05642"], // coral
  ["#8fa08b", "#6f8274"], // sage
  ["#6e4b57", "#573a45"], // plum
  ["#e7dac6", "#d8c8ac"], // cream
  ["#37363b", "#26252a"], // ink
];

/** Deterministic list of CSS `background-image` values for the hero wall. */
export function colorfulTileImages(count = 24): string[] {
  const out: string[] = [];
  for (let i = 0; i < count; i += 1) {
    // Diagonal pick so two adjacent cells are never the same colour.
    const c = TILE_COLORS[i % TILE_COLORS.length];
    if (c === undefined) continue;
    const [light, deep] = c;
    const glaze =
      `radial-gradient(circle at 28% 22%, rgba(255,255,255,0.22), rgba(255,255,255,0) 62%), ` +
      `linear-gradient(135deg, ${light} 0%, ${deep} 100%)`;
    out.push(glaze);
  }
  return out;
}
