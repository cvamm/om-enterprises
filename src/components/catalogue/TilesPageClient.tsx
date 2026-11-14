"use client";

import type { Product } from "@/types";
import type { ProductPage } from "@/lib/queries/products";
import { useState, useEffect, useMemo } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { ProductGrid } from "@/components/catalogue/ProductGrid";
import { SortDropdown } from "@/components/catalogue/SortDropdown";
import { samplePage, sampleFacets } from "@/lib/catalogue/sample";
import { toFilters, buildQuery } from "@/lib/utils/filters";
import type { Facet } from "@/lib/queries/products";

export function TilesPageClient() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const raw: Record<string, string | undefined> = useMemo(() => {
    const r: Record<string, string | undefined> = {};
    for (const [key, value] of searchParams.entries()) {
      r[key] = value;
    }
    return r;
  }, [searchParams]);

  useEffect(() => {
    const filters = toFilters(raw);
    const result: ProductPage = samplePage(filters);
    setProducts(result.products);
    setTotal(result.total);
    setLoading(false);
  }, [raw]);

  const facets = useMemo(() => sampleFacets(), []);
  const filterGroups: Array<{ key: string; label: string; options: Facet[] }> = [
    { key: "material", label: "Material", options: facets.materials },
    { key: "finish", label: "Finish", options: facets.finishes },
    { key: "size", label: "Size", options: facets.sizes },
    { key: "origin", label: "Origin", options: facets.origins },
  ];

  const activeCount = ["room", "material", "finish", "size", "origin", "q"].filter(
    (key) => searchParams.get(key) !== null,
  ).length;
  const filterBadge = activeCount > 0 ? ` (${activeCount})` : "";

  return (
    <>
      <section className="border-b border-bone/10 bg-ink py-24 md:py-32">
        <Container>
          <div className="max-w-3xl">
            <Eyebrow label="THE CATALOGUE" />
            <h1 className="mt-8 font-display text-5xl leading-[1.02] text-bone md:text-7xl">
              Every tile we carry,{" "}
              <span className="font-light italic text-bone/77">
                priced the way a shop quotes
              </span>
            </h1>
            <p className="mt-8 max-w-2xl text-[15px] leading-relaxed text-bone/79">
              Prices are per box, because that is how tiles are sold and how you
              will be invoiced.
            </p>
          </div>

          <div className="mt-14 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById("filter-panel");
                  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className="btn btn-secondary"
              >
                Filters{filterBadge}
              </button>
              {activeCount > 0 && (
                <button
                  type="button"
                  onClick={() => router.push(pathname)}
                  className="text-[11px] uppercase tracking-[0.24em] text-bone/75 hover:text-bone"
                >
                  Clear all
                </button>
              )}
            </div>
            <SortDropdown />
          </div>
        </Container>
      </section>

      <section className="bg-ink-2 py-24 md:py-32" id="filter-panel">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[280px_1fr] lg:gap-12">
            <div className="space-y-9">
              {filterGroups.map((group) => {
                const current = searchParams.get(group.key);
                return (
                  <fieldset key={group.key}>
                    <legend className="text-[10px] uppercase tracking-[0.45em] text-gold">
                      {group.label}
                    </legend>
                    <div className="mt-4 space-y-1">
                      <label className="flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-[13px] transition-colors duration-300">
                        <span className="flex items-center gap-3">
                          <input
                            type="radio"
                            checked={current === null}
                            onChange={() => router.push(`${pathname}${buildQuery(raw, { [group.key]: undefined })}`)}
                            className="h-3.5 w-3.5 accent-[#c9a96a]"
                          />
                          <span>All</span>
                        </span>
                      </label>
                      {group.options.map((option) => (
                        <label
                          key={option.value}
                          className={`flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-[13px] transition-colors duration-300 ${current === option.value ? "bg-white/5 text-bone" : "text-bone/79 hover:bg-white/[0.03] hover:text-bone"}`}
                        >
                          <span className="flex items-center gap-3">
                            <input
                              type="radio"
                              checked={current === option.value}
                              onChange={() =>
                                router.push(
                                  `${pathname}${buildQuery(raw, { [group.key]: current === option.value ? undefined : option.value })}`,
                                )
                              }
                              className="h-3.5 w-3.5 accent-[#c9a96a]"
                            />
                            <span className="capitalize">{option.label.replace(/-/g, " ")}</span>
                          </span>
                          {option.count !== undefined && (
                            <span className="text-[11px] tabular-nums text-bone/70">{option.count}</span>
                          )}
                        </label>
                      ))}
                    </div>
                  </fieldset>
                );
              })}
            </div>

            <div>
              <p className="mb-8 text-[11px] uppercase tracking-[0.24em] text-bone/73">
                {loading ? "Loading..." : `${total} ${total === 1 ? "product" : "products"}`}
              </p>

              <ProductGrid
                products={products}
                emptyAction={{ href: "/tiles", label: "Browse all products" }}
              />
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
