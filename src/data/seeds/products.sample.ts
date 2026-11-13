import type { Product } from "@/types";
import { REAL_PRODUCTS } from "@/data/seeds/real-tiles";

/**
 * Catalogue data source for the static demo.
 *
 * `REAL_PRODUCTS` are the shop's actual catalogue, sourced from the two
 * product PDFs (Glossy Endless marble + Livenza wood/marble) and cropped
 * one-by-one into 600x1200mm specs. Kept under the `SAMPLE_PRODUCTS` name
 * because the query layer treats it as the "no database" fallback — on
 * GitHub Pages there is no Supabase, so this set *is* the catalogue.
 *
 * Prices are all 0, which the UI renders as "price on request"; the owner
 * adds real per-box prices later and the derived per-sqft figures pick
 * them up automatically.
 */
export const SAMPLE_PRODUCTS: Product[] = REAL_PRODUCTS;
