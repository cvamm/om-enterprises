import { cache } from "react";
import { getServerSupabase } from "@/lib/supabase/server";
import type { Origin, OriginState, Product, Supplier } from "@/types";
import { SAMPLE_ORIGINS } from "@/data/seeds/origins.sample";

/**
 * Origin reads. Origins are a browse path and a filter, not the top-level
 * tree — `/origins/[state]` lists products from that state.
 *
 * As with the product queries, every function degrades to sample data when
 * Supabase is unconfigured rather than throwing.
 */

type OriginRow = {
  id: string;
  state: OriginState;
  name: string;
  description: string | null;
  primary_regions: string[];
  hero_photo_url: string | null;
  created_at: string;
  updated_at: string;
};

function toOrigin(row: OriginRow): Origin {
  return {
    id: row.id,
    state: row.state,
    name: row.name,
    description: row.description,
    primaryRegions: row.primary_regions ?? [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const ORIGIN_COLUMNS = "id, state, name, description, primary_regions, hero_photo_url, created_at, updated_at";

/** All origins, alphabetically. */
export const getOrigins = cache(async (): Promise<Origin[]> => {
  const supabase = await getServerSupabase();
  if (!supabase) return SAMPLE_ORIGINS;

  const { data, error } = await supabase
    .from("origins")
    .select(ORIGIN_COLUMNS)
    .order("name", { ascending: true });

  if (error) {
    console.error("[queries/origins] getOrigins failed:", error.message);
    return SAMPLE_ORIGINS;
  }
  return ((data ?? []) as OriginRow[]).map(toOrigin);
});

/** Distinct states with at least one origin, for the browse grid. */
export type OriginSummary = {
  state: OriginState;
  label: string;
  originCount: number;
  productCount: number;
  leadOrigin: Origin;
};

const STATE_LABELS: Record<OriginState, string> = {
  rajasthan: "Rajasthan",
  "tamil-nadu": "Tamil Nadu",
  gujarat: "Gujarat",
  "madhya-pradesh": "Madhya Pradesh",
  chhattisgarh: "Chhattisgarh",
  karnataka: "Karnataka",
  "andhra-pradesh": "Andhra Pradesh",
  bihar: "Bihar",
  other: "Other",
};

export const getOriginSummaries = cache(async (): Promise<OriginSummary[]> => {
  const origins = await getOrigins();
  const supabase = await getServerSupabase();

  // Product counts per state, one round trip, grouped in SQL.
  const counts = new Map<OriginState, number>();
  if (supabase !== null) {
    const { data, error } = await supabase.from("products").select("origin_id").eq("active", true);
    if (error === null && data !== null) {
      const ids = new Map(origins.map((o) => [o.id, o.state]));
      for (const row of data as Array<{ origin_id: string | null }>) {
        const state =
          row.origin_id !== null ? ids.get(row.origin_id) : undefined;
        if (state !== undefined) counts.set(state, (counts.get(state) ?? 0) + 1);
      }
    }
  }

  const byState = new Map<OriginState, Origin[]>();
  for (const o of origins) {
    const list = byState.get(o.state) ?? [];
    list.push(o);
    byState.set(o.state, list);
  }

  return [...byState.entries()]
    .flatMap(([state, list]) => {
      // A state always has at least one origin — it is grouped from them —
      // but flatMap keeps the non-null assertion out of the render path.
      const lead = list[0];
      if (lead === undefined) return [];
      return [{
        state,
        label: STATE_LABELS[state],
        originCount: list.length,
        productCount: counts.get(state) ?? 0,
        leadOrigin: lead,
      }];
    })
    .sort((a, b) => {
      // Busiest state first, then alphabetical. The `||` on a number
      // reads as 0-is-falsy, which is correct here but is exactly the
      // ambiguity strict-boolean-expressions exists to catch — so state
      // the tie-break explicitly.
      if (b.productCount !== a.productCount) return b.productCount - a.productCount;
      return a.label.localeCompare(b.label);
    });
});

/** One origin by its state slug, for `/origins/[origin]`. */
export const getOriginByState = cache(async (state: string): Promise<Origin | null> => {
  const origins = await getOrigins();
  return origins.find((o) => o.state === state) ?? null;
});

/**
 * Verified suppliers for an origin's state.
 *
 * The `verified` filter is enforced again in RLS, so this is a defence in
 * depth rather than the only guard: an unverified supplier's phone number
 * must never reach the browser, and a query bug here would be the second
 * place that fails rather than the first.
 */
export const getSuppliersForState = cache(async (state: string): Promise<Supplier[]> => {
  const supabase = await getServerSupabase();
  if (!supabase) return [];

  const origins = await getOrigins();
  const originIds = origins.filter((o) => o.state === state).map((o) => o.id);
  if (originIds.length === 0) return [];

  const { data, error } = await supabase
    .from("suppliers")
    .select("id, name, location, phone, email, verified, certificate_image_urls, created_at")
    .eq("verified", true)
    .limit(20);

  if (error) {
    console.error("[queries/origins] getSuppliersForState failed:", error.message);
    return [];
  }

  // Suppliers are not yet joined to origins in the read model; return the
  // verified set and let the page render them against the state's products.
  const rows = (data ?? []) as Array<{
    id: string;
    name: string;
    location: string;
    phone: string | null;
    email: string | null;
    verified: boolean;
    certificate_image_urls: string[];
    created_at: string;
  }>;

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    location: r.location,
    phone: r.phone,
    email: r.email,
    verified: r.verified,
    certificateImageUrls: r.certificate_image_urls ?? [],
    createdAt: r.created_at,
  }));
});

/** Products sourced from a given origin id. */
export const getProductsByOrigin = cache(
  async (originId: string): Promise<Product[]> => {
    const { getProducts } = await import("@/lib/queries/products");
    const result = await getProducts({ origin: originId, perPage: 48 });
    return result.products;
  },
);