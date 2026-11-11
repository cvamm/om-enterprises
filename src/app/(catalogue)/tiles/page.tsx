import type { Metadata } from "next";
import { Suspense } from "react";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { SearchBar } from "@/components/catalogue/SearchBar";
import { SortDropdown } from "@/components/catalogue/SortDropdown";
import { CatalogueResults } from "@/components/catalogue/CatalogueResults";

export const metadata: Metadata = {
  title: "Tile catalogue",
  description:
    "Every tile and stone we stock, priced per box. Filter by room, material, " +
    "finish and size.",
  alternates: { canonical: "/tiles" },
};

/**
 * Full catalogue — static demo.
 *
 * The hero is prerendered; the results below are a client island that filters
 * the sample set in the browser from the URL query string. On `master` this
 * is server-rendered from SQL, but GitHub Pages has no server, so the same
 * filter/sort/paginate logic runs client-side. Filter state still lives in the
 * URL, so a filtered view is shareable and the back button behaves.
 */
export default function TilesPage() {
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

      <Suspense
        fallback={
          <section className="bg-ink-2 py-24 md:py-32">
            <Container>
              <div className="h-96 w-full rounded-2xl bg-white/5" />
            </Container>
          </section>
        }
      >
        <CatalogueResults />
      </Suspense>
    </>
  );
}