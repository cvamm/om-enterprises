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
  marbles: [],
  granite: [],
  "western-toilets": [],
  "tiles-adhesive": [],
  mirrors: [],
  "washing-basins": [],
  "house-finishing": [],
  taps: [],
  miscellaneous: [],
};
