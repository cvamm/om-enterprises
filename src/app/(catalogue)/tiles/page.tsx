import type { Metadata } from "next";
import { Suspense } from "react";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { ProductGrid } from "@/components/catalogue/ProductGrid";
import { CatalogueFilters } from "@/components/catalogue/CatalogueFilters";
import { SearchBar } from "@/components/catalogue/SearchBar";
import { SortDropdown } from "@/components/catalogue/SortDropdown";
import { Pagination } from "@/components/catalogue/Pagination";
import { getFacets, getProducts } from "@/lib/queries/products";
import { readSearchParams, toFilters } from "@/lib/utils/filters";

export const metadata: Metadata = {
  title: "Tile catalogue",
  description:
    "Every tile and stone we stock, priced per box. Filter by room, material, " +
    "finish and size.",
  alternates: { canonical: "/tiles" },
};

/**
 * Full catalogue.
 *
 * Search and filtering happen in SQL, not in the browser: the whole catalogue
 * is never sent. Filter state lives in the URL so a filtered view can be
 * shared, bookmarked, and reached from search engines.
 *
 * The facet sidebar is a client component reading and writing the query
 * string; the results below are server-rendered. That split is deliberate —
 * filtering feels instant, the page still renders on the server, and no
 * catalogue data is duplicated into a JS payload.
 */
export default async function TilesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await readSearchParams(searchParams);
  const filters = toFilters(params);

  const [page, facets] = await Promise.all([getProducts(filters), getFacets()]);

  return (
    <>
      <section className="border-b border-white/10 bg-[#050505] py-24 md:py-32">
        <Container>
          <div className="max-w-3xl">
            <Eyebrow label="THE CATALOGUE" />
            <h1 className="mt-8 font-display text-5xl leading-[1.02] text-bone md:text-7xl">
              Every tile we carry,{" "}
              <span className="font-light italic text-white/55">
                priced the way a shop quotes
              </span>
            </h1>
            <p className="mt-8 max-w-2xl text-[15px] leading-relaxed text-bone/60">
              Prices are per box, because that is how tiles are sold and how you
              will be invoiced. The per-square-foot figure on each card is derived
              from the box, never stored, and always updated when the box price
              changes.
            </p>
          </div>

          <div className="mt-14 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <Suspense fallback={<div className="h-12 w-full max-w-md rounded-lg bg-white/5" />}>
              <SearchBar />
            </Suspense>
            <Suspense fallback={null}>
              <SortDropdown />
            </Suspense>
          </div>
        </Container>
      </section>

      <section className="bg-[#0b0b0c] py-24 md:py-32">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[280px_1fr] lg:gap-12">
            <Suspense fallback={null}>
              <CatalogueFilters facets={facets} />
            </Suspense>

            <div>
              <p className="mb-8 text-[11px] uppercase tracking-[0.24em] text-bone/45">
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
    </>
  );
}

/** ISR: catalogue contents change when stock or prices change. */
export const revalidate = 3600;

export function generateStaticParams() {
  // The catalogue is dynamic (filters in the URL), so there is nothing to
  // prerender here. Page 1 with no filters is the only static shell worth
  // having, and it is cheap enough to render per request.
  return [];
}