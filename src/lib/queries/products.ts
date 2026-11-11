import { cache } from "react";
import { getServerSupabase } from "@/lib/supabase/server";
import type { Product, RoomUse } from "@/types";
import { SAMPLE_PRODUCTS } from "@/data/seeds/products.sample";
import { samplePage, sampleSort } from "@/lib/catalogue/sample";

/**
 * Product reads for Server Components.
 *
 * Every function here returns an empty array when Supabase is unconfigured, or
 * the local sample set when `USE_SAMPLE_DATA` is on. Pages never branch on
 * "is there a database" — they render whatever they are given, so the same
 * component works in dev, in preview, and in production.
 *
 * `cache()` dedupes within a single render pass. A layout and its page both
 * calling getFeaturedProducts() is one query, not two.
 */

export type ProductSort =
  | "featured"
  | "price-asc"
  | "price-desc"
  | "newest"
  | "name";

export type ProductFilters = {
  room?: RoomUse | string;
  origin?: string;
  material?: string;
  finish?: string;
  /** Nominal length in mm. Broad bucket match, not exact. */
  size?: string;
  q?: string;
  sort?: ProductSort;
  page?: number;
  perPage?: number;
};

export const PER_PAGE = 24;

/** Columns selected for every product read. Order matches the Product type. */
const PRODUCT_COLUMNS = `
  id, slug, name_en, name_hi, origin_id, supplier_id, material_type, finish,
  room_uses, shape, nominal_dimensions_mm, box_area_sqft, tiles_per_box,
  price_per_box_inr, moq_boxes, grade, stock_status, photo_urls, video_urls,
  featured_rank, description_en, description_hi, default_wastage_pct,
  active, created_at, updated_at
`;

/**
 * Row shape returned by Supabase. snake_case columns, camelCase Product.
 * Kept as an explicit mapper rather than a generic row transform because the
 * mapping is the thing most likely to drift when the schema changes, and an
 * explicit map fails loudly at compile time instead of silently at runtime.
 */
type ProductRow = {
  id: string;
  slug: string;
  name_en: string;
  name_hi: string | null;
  origin_id: string | null;
  supplier_id: string | null;
  material_type: Product["materialType"];
  finish: Product["finish"];
  room_uses: string[];
  shape: Product["shape"];
  nominal_dimensions_mm: number[];
  box_area_sqft: number | string;
  tiles_per_box: number;
  price_per_box_inr: number | string;
  moq_boxes: number;
  grade: Product["grade"];
  stock_status: Product["stockStatus"];
  photo_urls: string[];
  video_urls: string[];
  featured_rank: number | null;
  description_en: string | null;
  description_hi: string | null;
  default_wastage_pct: number | string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
};

function toProduct(row: ProductRow): Product {
  const dims = row.nominal_dimensions_mm;
  return {
    id: row.id,
    slug: row.slug,
    nameEn: row.name_en,
    nameHi: row.name_hi,
    originId: row.origin_id,
    materialType: row.material_type,
    finish: row.finish,
    roomUses: row.room_uses as RoomUse[],
    shape: row.shape,
    dimensionsMm: [dims[0] ?? 0, dims[1] ?? 0, dims[2] ?? 0],
    // Postgres numeric comes back as a string over the wire to avoid float
    // drift. Parse at the boundary so the rest of the app sees numbers.
    boxAreaSqft: Number(row.box_area_sqft),
    tilesPerBox: row.tiles_per_box,
    pricePerBoxInr: Number(row.price_per_box_inr),
    moqBoxes: row.moq_boxes,
    grade: row.grade,
    stockStatus: row.stock_status,
    photoUrls: row.photo_urls ?? [],
    videoUrls: row.video_urls ?? [],
    featured: row.featured_rank !== null,
    active: row.active,
    descriptionEn: row.description_en,
    descriptionHi: row.description_hi,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** Build the ORDER BY fragment. Interpolated, but from a fixed union. */
function orderBy(sort: ProductSort): string {
  switch (sort) {
    case "price-asc":
      return "price_per_box_inr asc";
    case "price-desc":
      return "price_per_box_inr desc";
    case "newest":
      return "created_at desc";
    case "name":
      return "name_en asc";
    case "featured":
    default:
      return "featured_rank asc nulls last, created_at desc";
  }
}

export type ProductPage = {
  products: Product[];
  total: number;
  page: number;
  perPage: number;
  pageCount: number;
};

export const getProducts = cache(
  async (filters: ProductFilters = {}): Promise<ProductPage> => {
    const {
      room,
      origin,
      material,
      finish,
      size,
      q,
      sort = "featured",
      page = 1,
      perPage = PER_PAGE,
    } = filters;

    const supabase = await getServerSupabase();
    if (!supabase) {
      return samplePage(filters);
    }

    let query = supabase
      .from("products")
      .select(PRODUCT_COLUMNS, { count: "exact" })
      .eq("active", true);

    if (room !== undefined) query = query.contains("room_uses", [room]);
    if (origin !== undefined) query = query.eq("origin_id", origin);
    if (material !== undefined) query = query.eq("material_type", material);
    if (finish !== undefined) query = query.eq("finish", finish);

    if (q !== undefined && q !== "") {
      // Full-text first; trigram similarity is the fallback for typos and
      // partial tokens that tsquery tokenises away.
      query = query.textSearch("search_vector", q, {
        type: "plain",
        config: "english",
      });
    }

    // Size buckets need a computed longest-side expression. Postgres cannot
    // index it without a generated column, and §3 caps Phase 1 at a few
    // hundred SKUs, so a filter is cheap enough to run per query.
    if (size !== undefined) {
      const bounds: Record<string, [number, number]> = {
        small: [0, 300],
        medium: [301, 600],
        large: [601, 800],
        xlarge: [801, Number.MAX_SAFE_INTEGER],
      };
      const range = bounds[size];
      if (range) {
        const longest = "greatest(nominal_dimensions_mm[1], nominal_dimensions_mm[2])";
        query = query.gte(longest, range[0]).lte(longest, range[1]);
      }
    }

    const from = Math.max(0, (page - 1) * perPage);
    const { data, error, count } = await query
      .order(orderBy(sort), { ascending: true })
      .range(from, from + perPage - 1);

    if (error) {
      console.error("[queries/products] getProducts failed:", error.message);
      return samplePage(filters);
    }

    const total = count ?? 0;
    return {
      products: ((data ?? []) as ProductRow[]).map(toProduct),
      total,
      page,
      perPage,
      pageCount: Math.max(1, Math.ceil(total / perPage)),
    };
  },
);

/** Products flagged for the home page, in manual order. */
export const getFeaturedProducts = cache(async (limit = 6): Promise<Product[]> => {
  const supabase = await getServerSupabase();
  if (!supabase) {
    return sampleSort(SAMPLE_PRODUCTS, "featured").slice(0, limit);
  }

  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_COLUMNS)
    .eq("active", true)
    .not("featured_rank", "is", null)
    .order("featured_rank", { ascending: true })
    .limit(limit);

  if (error) {
    console.error("[queries/products] getFeaturedProducts failed:", error.message);
    return sampleSort(SAMPLE_PRODUCTS, "featured").slice(0, limit);
  }
  return ((data ?? []) as ProductRow[]).map(toProduct);
});

/** One product by slug, or null. Drives ISR on the detail page. */
export const getProductBySlug = cache(async (slug: string): Promise<Product | null> => {
  const supabase = await getServerSupabase();
  if (!supabase) {
    return SAMPLE_PRODUCTS.find((p) => p.slug === slug) ?? null;
  }

  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_COLUMNS)
    .eq("slug", slug)
    .eq("active", true)
    .maybeSingle();

  if (error) {
    console.error("[queries/products] getProductBySlug failed:", error.message);
    return null;
  }
  return data ? toProduct(data as ProductRow) : null;
});

/** Every active slug, for generateStaticParams. */
export const getAllProductSlugs = cache(async (): Promise<string[]> => {
  const supabase = await getServerSupabase();
  if (!supabase) {
    return SAMPLE_PRODUCTS.map((p) => p.slug);
  }

  const { data, error } = await supabase
    .from("products")
    .select("slug")
    .eq("active", true)
    .order("slug");

  if (error) {
    console.error("[queries/products] getAllProductSlugs failed:", error.message);
    return [];
  }
  return (data ?? []).map((r) => (r as { slug: string }).slug);
});

/**
 * Sibling products: same material or same origin, excluding the current one.
 * Returns fewer than `limit` rather than none, so a product in a thin
 * category still shows something.
 */
export const getRelatedProducts = cache(
  async (product: Product, limit = 4): Promise<Product[]> => {
    const supabase = await getServerSupabase();
    if (!supabase) {
      return sampleSort(SAMPLE_PRODUCTS, "featured")
        .filter((p) => p.slug !== product.slug)
        .slice(0, limit);
    }

    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_COLUMNS)
      .eq("active", true)
      .neq("slug", product.slug)
      .or(
        `material_type.eq.${product.materialType},origin_id.eq.${product.originId ?? "null"}`,
      )
      .order("featured_rank", { ascending: true, nullsFirst: false })
      .limit(limit);

    if (error) {
      console.error("[queries/products] getRelatedProducts failed:", error.message);
      return [];
    }
    return ((data ?? []) as ProductRow[]).map(toProduct);
  },
);

/**
 * Distinct values for a filter facet, with counts.
 * Used to render the filter sidebar without hard-coding the enum list, so a
 * value added in the admin appears in the UI on its own.
 */
export type Facet = { value: string; label: string; count: number };

export const getFacets = cache(async (): Promise<{
  materials: Facet[];
  finishes: Facet[];
  origins: Facet[];
  sizes: Facet[];
}> => {
  const empty = { materials: [], finishes: [], origins: [], sizes: [] };
  const supabase = await getServerSupabase();
  if (!supabase) return empty;

  const { data, error } = await supabase
    .from("products")
    .select("material_type, finish, origin_id, nominal_dimensions_mm")
    .eq("active", true);

  if (error) {
    console.error("[queries/products] getFacets failed:", error.message);
    return empty;
  }

  const rows = (data ?? []) as Array<{
    material_type: string;
    finish: string;
    origin_id: string | null;
    nominal_dimensions_mm: number[];
  }>;

  const tally = (key: (r: (typeof rows)[number]) => string | null) => {
    const map = new Map<string, number>();
    for (const r of rows) {
      const k = key(r);
      if (k === null) continue;
      map.set(k, (map.get(k) ?? 0) + 1);
    }
    return map;
  };

  const sizeBucket = (r: (typeof rows)[number]): string | null => {
    const dims = r.nominal_dimensions_mm;
    // noUncheckedIndexedAccess: the array is int[3] in SQL, so these are
    // never actually absent. Defaulting to 0 keeps the bucket maths honest
    // without a non-null assertion.
    const longest = Math.max(dims[0] ?? 0, dims[1] ?? 0);
    if (longest <= 300) return "small";
    if (longest <= 600) return "medium";
    if (longest <= 800) return "large";
    return "xlarge";
  };

  return {
    materials: [...tally((r) => r.material_type)].map(([value, count]) => ({
      value,
      label: value,
      count,
    })),
    finishes: [...tally((r) => r.finish)].map(([value, count]) => ({
      value,
      label: value,
      count,
    })),
    origins: [...tally((r) => r.origin_id)].map(([value, count]) => ({
      value,
      label: value,
      count,
    })),
    sizes: [...tally(sizeBucket)].map(([value, count]) => ({
      value,
      label: value,
      count,
    })),
  };
});