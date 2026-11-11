import { SAMPLE_PRODUCTS } from "@/data/seeds/products.sample";
import type { Product, RoomUse } from "@/types";
import type {
  ProductFilters,
  ProductSort,
  ProductPage,
  Facet,
} from "@/lib/queries/products";

/**
 * Pure, client-safe catalogue over the sample set.
 *
 * The server query layer (`lib/queries/products.ts`) falls back to this same
 * sample data when Supabase is unconfigured. These helpers are extracted here,
 * free of any `next/headers` import, so the static demo can filter, sort and
 * paginate in the browser — GitHub Pages has no server to run SQL.
 *
 * Nothing in this module touches the network or the cookie jar.
 */

const PER_PAGE = 24;

/** Filter the sample set in JS, mirroring what the SQL does server-side. */
function sampleMatch(p: Product, f: ProductFilters): boolean {
  const { room, origin, material, finish, q } = f;
  if (room !== undefined && !p.roomUses.includes(room as RoomUse)) return false;
  if (origin !== undefined && p.originId !== origin) return false;
  if (material !== undefined && p.materialType !== material) return false;
  if (finish !== undefined && p.finish !== finish) return false;
  if (f.size !== undefined) {
    const longest = Math.max(...p.dimensionsMm);
    const bucket: string = f.size;
    if (bucket === "small" && longest > 300) return false;
    if (bucket === "medium" && (longest <= 300 || longest > 600)) return false;
    if (bucket === "large" && (longest <= 600 || longest > 800)) return false;
    if (bucket === "xlarge" && longest <= 800) return false;
  }
  if (q !== undefined && q !== "") {
    const needle = q.toLowerCase();
    const hay = `${p.nameEn} ${p.descriptionEn ?? ""}`.toLowerCase();
    if (!hay.includes(needle)) return false;
  }
  return true;
}

export function sampleSort(list: Product[], sort: ProductSort): Product[] {
  const out = [...list];
  switch (sort) {
    case "price-asc":
      return out.sort((a, b) => a.pricePerBoxInr - b.pricePerBoxInr);
    case "price-desc":
      return out.sort((a, b) => b.pricePerBoxInr - a.pricePerBoxInr);
    case "newest":
      return out.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    case "name":
      return out.sort((a, b) => a.nameEn.localeCompare(b.nameEn));
    case "featured":
    default:
      return out.sort((a, b) => Number(b.featured) - Number(a.featured));
  }
}

export function samplePage(f: ProductFilters): ProductPage {
  const perPage = f.perPage ?? PER_PAGE;
  const page = Math.max(1, f.page ?? 1);
  const matched = sampleSort(
    SAMPLE_PRODUCTS.filter((p) => sampleMatch(p, f)),
    f.sort ?? "featured",
  );
  const from = (page - 1) * perPage;
  return {
    products: matched.slice(from, from + perPage),
    total: matched.length,
    page,
    perPage,
    pageCount: Math.max(1, Math.ceil(matched.length / perPage)),
  };
}

/** Distinct facet values with counts, derived from the sample set. */
export function sampleFacets(): {
  materials: Facet[];
  finishes: Facet[];
  origins: Facet[];
  sizes: Facet[];
} {
  const tally = (key: (p: Product) => string | null) => {
    const map = new Map<string, number>();
    for (const p of SAMPLE_PRODUCTS) {
      const k = key(p);
      if (k === null) continue;
      map.set(k, (map.get(k) ?? 0) + 1);
    }
    return [...map].map(([value, count]) => ({ value, label: value, count }));
  };

  const sizeBucket = (p: Product): string => {
    const longest = Math.max(p.dimensionsMm[0] ?? 0, p.dimensionsMm[1] ?? 0);
    if (longest <= 300) return "small";
    if (longest <= 600) return "medium";
    if (longest <= 800) return "large";
    return "xlarge";
  };

  return {
    materials: tally((p) => p.materialType),
    finishes: tally((p) => p.finish),
    origins: tally((p) => p.originId),
    sizes: tally(sizeBucket),
  };
}