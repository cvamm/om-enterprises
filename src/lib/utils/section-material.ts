import type { CategoryKey } from "@/lib/utils/category-photos";
import type { SectionTag } from "@/types";

/**
 * Which `section_tag` value each storefront "Others" section filters by.
 *
 * Products added from the admin panel get an explicit `section_tag` column
 * value. Each section page queries only products with that tag, so the
 * "Others" grids stop all showing the same tile list.
 *
 * Sections with `null` here (marbles, granite, house-finishing) still
 * fall back to the material-based SECTION_MATERIAL lookup for backwards
 * compatibility with the pre-migration catalogue.
 */
export const SECTION_TAG: Record<CategoryKey, SectionTag | null> = {
  marbles: null,
  granite: null,
  "western-toilets": "western-toilets",
  "tiles-adhesive": "tiles-adhesive",
  mirrors: "mirrors",
  "washing-basins": "washing-basins",
  taps: "taps",
  "house-finishing": null,
  miscellaneous: "miscellaneous",
};

/**
 * Which catalogue material each "Others" store line draws its product grid
 * from when a `section_tag` is not set (fallback for pre-migration rows).
 *
 * When dedicated products exist for a line, point it at the right tag above
 * and this fallback stops being used for that section.
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
