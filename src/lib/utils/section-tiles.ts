import type { CategoryKey } from "@/lib/utils/category-photos";

/**
 * Real catalogue tiles shown on each store line, so the non-stone pages also
 * carry the shop's own stock instead of only stand-in Pexels textures.
 *
 * Every slug must exist in `REAL_PRODUCTS` — these are the design names the
 * shop actually sells. Picking by material keeps each section on-subject:
 * marble-look designs on Marbles, the darker / wood ones on Granite, and a
 * few complementary floor tiles on the fixture and finishing lines.
 *
 * Kept as slug lists (not Product objects) so this file stays a pure data
 * module and the resolution happens where the catalogue data already lives.
 */
export const SECTION_TILES: Record<CategoryKey, string[]> = {
  marbles: [
    "glossy-endless-mg-adry-statuario",
    "glossy-endless-mg-lussoro-statuario",
    "glossy-endless-mg-opera-statuario",
    "glossy-endless-mg-silver-statuario",
    "glossy-endless-mg-modern-bianco",
    "livenza-statuario",
    "livenza-classic",
    "livenza-vintage-white",
  ],
  granite: [
    "glossy-endless-mg-bravio-black",
    "glossy-endless-mg-asher-brown",
    "glossy-endless-mg-marvella-natural",
    "glossy-endless-mg-mercury-brown",
    "glossy-endless-mg-amazing-brown",
    "glossy-endless-mg-vanilla-onyx",
    "glossy-endless-mg-ambar-onyx",
    "livenza-onyx",
  ],
  "western-toilets": [
    "glossy-endless-mg-jaxon-white",
    "glossy-endless-mg-pigues-white",
    "glossy-endless-mg-jaxon-crema",
    "livenza-anvi-white",
  ],
  chemicals: [
    "glossy-endless-mg-jaxon-crema",
    "glossy-endless-mg-pigues-white",
    "livenza-survey-cream",
    "livenza-lizard-crema",
  ],
  mirrors: [
    "glossy-endless-mg-modern-bianco",
    "glossy-endless-mg-silver-statuario",
    "livenza-anvi-white",
    "livenza-zebrano-crema",
  ],
  "washing-basins": [
    "glossy-endless-mg-jaxon-white",
    "glossy-endless-mg-pigues-white",
    "livenza-classic",
    "livenza-vintage-white",
  ],
  "house-finishing": [
    "livenza-wood-alpine",
    "livenza-wood-redox-wenge",
    "livenza-wood-clear-maple",
    "livenza-light-dark-brown",
    "livenza-statuario",
    "livenza-endless-marble",
  ],
};
