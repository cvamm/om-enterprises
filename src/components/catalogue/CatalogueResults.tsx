"use client";

import { useSearchParams } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { CatalogueFilters } from "./CatalogueFilters";
import { SortDropdown } from "./SortDropdown";
import { ProductGrid } from "./ProductGrid";
import { Pagination } from "./Pagination";
import { toFilters, buildQuery } from "@/lib/utils/filters";
import { samplePage, sampleFacets } from "@/lib/catalogue/sample";

/**
 * Interactive catalogue results for the static demo.
 *
 * On `master` these results are server-rendered from SQL driven by the URL.
 * GitHub Pages has no server, so the same filter/sort/paginate logic runs in
 * the browser over the sample set. The filter controls (SearchBar,
 * SortDropdown, CatalogueFilters, Pagination) already write to the query
 * string; this reads it back with `useSearchParams` and re-renders, so the
 * experience — shareable filtered URLs, back button, instant updates — is
 * unchanged.
 *
 * Must sit inside a `<Suspense>` boundary: `useSearchParams` bails out to
 * client-side rendering during static prerender.
 *
 * `fixedRoom` pins the room facet for `/collections/[room]`, which uses the
 * single-column layout; without it, this is the full `/tiles` catalogue with
 * the filter sidebar.
 */
export function CatalogueResults({ fixedRoom }: { fixedRoom?: string }) {
  const searchParams = useSearchParams();
  const filters = toFilters(Object.fromEntries(searchParams));
  if (fixedRoom !== undefined) filters.room = fixedRoom;

  const page = samplePage(filters);
  const facets = sampleFacets();

  if (fixedRoom !== undefined) {
    return (
      <section className="bg-ink-2 py-20 md:py-28">
        <Container>
          <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <p className="text-[11px] uppercase tracking-[0.24em] text-bone/73">
              {page.total} {page.total === 1 ? "product" : "products"}
            </p>
            <SortDropdown />
          </div>

          <ProductGrid
            products={page.products}
            emptyAction={{
              href: buildQuery({}, { room: fixedRoom }),
              label: "Browse all products",
            }}
          />

          {page.pageCount > 1 && (
            <div className="mt-16">
              <Pagination page={page.page} pageCount={page.pageCount} />
            </div>
          )}
        </Container>
      </section>
    );
  }

  return (
    <section className="bg-ink-2 py-24 md:py-32">
      <Container>
        <div className="grid gap-10 lg:grid-cols-[280px_1fr] lg:gap-12">
          <CatalogueFilters facets={facets} />

          <div>
            <p className="mb-8 text-[11px] uppercase tracking-[0.24em] text-bone/73">
              {page.total} {page.total === 1 ? "product" : "products"}
              {filters.room !== undefined && ` for ${filters.room.replace(/-/g, " ")}`}
            </p>

            <ProductGrid
              products={page.products}
              emptyAction={{ href: "/tiles", label: "Browse all products" }}
            />

            {page.pageCount > 1 && (
              <div className="mt-16">
                <Pagination page={page.page} pageCount={page.pageCount} />
              </div>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}