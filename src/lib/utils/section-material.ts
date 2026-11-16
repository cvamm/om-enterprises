import type { CategoryKey } from "@/lib/utils/category-photos";

/**
 * Which catalogue material each store line draws its product grid from.
 *
 * The shop's "Others" lines (mirrors, basins, toilets, …) do not yet have
 * dedicated database products, so instead of every section copying the whole
 * tile list, each one filters the catalogue to a material that genuinely
 * belongs on that page. When dedicated products exist for a line later,
 * point it at them (or add a slug/origin filter) without touching the pages.
 */
export const SECTION_MATERIAL: Record<CategoryKey, string> = {
  marbles: "engineered-marble",
  granite: "granite",
  "western-toilets": "ceramic",
  "tiles-adhesive": "vitrified",
  mirrors: "engineered-marble",
  "washing-basins": "ceramic",
  taps: "natural-stone",
  "house-finishing": "natural-stone",
  miscellaneous: "ceramic",
};
