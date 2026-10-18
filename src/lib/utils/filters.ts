import type { ProductFilters, ProductSort } from "@/lib/queries/products";

/**
 * URL search-param handling for the catalogue.
 *
 * Next 15 makes `searchParams` a Promise, and every page that reads filters
 * needs the same "take the first value if it's an array" dance. Centralised
 * here so a filter can never be silently dropped because one page forgot to
 * unwrap it.
 */

const SORTS: ProductSort[] = [
  "featured",
  "price-asc",
  "price-desc",
  "newest",
  "name",
];

/** Valid values, so a hand-edited URL cannot inject arbitrary strings. */
const ROOMS = new Set([
  "bathroom",
  "kitchen",
  "living-room",
  "bedroom",
  "flooring",
  "wall-cladding",
  "exterior",
  "commercial",
  "pool",
  "balcony",
]);

const MATERIALS = new Set([
  "ceramic",
  "vitrified",
  "porcelain",
  "natural-stone",
  "engineered-marble",
  "quartz",
  "mosaic",
  "wood-plank",
  "terrazzo",
]);

const FINISHES = new Set([
  "glossy",
  "matte",
  "textured",
  "leathered",
  "honed",
  "polished",
  "rustic",
  "brushed",
  "decor",
]);

const SIZES = new Set(["small", "medium", "large", "xlarge"]);

/** `?a=1&a=2` is `string[]`; a single `?a=1` is `string`. Take the first. */
export async function readSearchParams(
  params: Promise<Record<string, string | string[] | undefined>>,
): Promise<Record<string, string | string[] | undefined>> {
  return await params;
}

function one(value: string | string[] | undefined): string | undefined {
  if (value === undefined) return undefined;
  if (Array.isArray(value)) return value[0];
  return value;
}

/**
 * Map search params to filters, validating each against its enum.
 *
 * Returns only keys that are set, so `getProducts` can distinguish "no filter"
 * from "filter on empty string" — which matters because an empty value would
 * otherwise match nothing and render an empty catalogue for no visible reason.
 */
export function toFilters(
  params: Record<string, string | string[] | undefined>,
): ProductFilters {
  const filters: ProductFilters = {};

  const q = one(params["q"]);
  if (q !== undefined && q.trim() !== "") {
    filters.q = q.trim().slice(0, 120);
  }

  const room = one(params["room"]);
  if (room !== undefined && ROOMS.has(room)) filters.room = room;

  const material = one(params["material"]);
  if (material !== undefined && MATERIALS.has(material)) filters.material = material;

  const finish = one(params["finish"]);
  if (finish !== undefined && FINISHES.has(finish)) filters.finish = finish;

  const size = one(params["size"]);
  if (size !== undefined && SIZES.has(size)) filters.size = size;

  const origin = one(params["origin"]);
  if (origin !== undefined && origin !== "") filters.origin = origin;

  const sort = one(params["sort"]);
  if (sort !== undefined && SORTS.includes(sort as ProductSort)) {
    filters.sort = sort as ProductSort;
  }

  const page = Number(one(params["page"]));
  if (Number.isFinite(page) && page >= 1) {
    filters.page = Math.floor(page);
  }

  return filters;
}

/**
 * Build a query string, dropping empty values and resetting the page.
 *
 * Resetting `page` matters: filtering while on page 3 and staying on page 3
 * shows an empty grid, which reads as "your filter matched nothing" when it
 * actually matched plenty.
 */
export function buildQuery(
  current: Record<string, string | string[] | undefined>,
  changes: Record<string, string | undefined>,
): string {
  const next = new Map<string, string>();

  for (const [key, value] of Object.entries(current)) {
    const v = one(value);
    if (v !== undefined && v !== "" && key !== "page") {
      next.set(key, v);
    }
  }

  for (const [key, value] of Object.entries(changes)) {
    if (value === undefined || value === "") {
      next.delete(key);
    } else {
      next.set(key, value);
    }
  }

  const params = new URLSearchParams();
  for (const [key, value] of next) params.set(key, value);

  const qs = params.toString();
  return qs === "" ? "" : `?${qs}`;
}

/** Human label for a room slug, for headings and breadcrumbs. */
export function roomLabel(slug: string): string {
  return slug
    .split("-")
    .map((word) => (word === "w" ? "W" : word.charAt(0).toUpperCase() + word.slice(1)))
    .join(" ");
}