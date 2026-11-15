import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { ProductCard } from "@/components/catalogue/ProductCard";
import { getProducts } from "@/lib/queries/products";
import type { Category } from "@/lib/utils/category-photos";

/**
 * Server component for granite and marble category pages.
 *
 * Fetches real products from Supabase (or falls back to sample data when
 * Supabase is unconfigured). Filters by material_type = 'natural-stone'
 * and optional name search terms to distinguish granite from marble.
 */
export async function StoneCategoryPage({
  category,
  nameTerms,
  related,
}: {
  category: Category;
  /** Search terms that must appear in the product name. */
  nameTerms: string[];
  related: Category[];
}) {
  // First fetch all natural stone products
  const result = await getProducts({
    material: "natural-stone",
    perPage: 999,
  });

  // Filter to only products whose name matches at least one search term
  const terms = nameTerms.map((t) => t.toLowerCase());
  const products = result.products.filter((p) => {
    const name = p.nameEn.toLowerCase();
    return terms.some((t) => name.includes(t));
  });

  // Take first 12 for display
  const tiles = products.slice(0, 12);

  return (
    <>
      <section className="border-b border-bone/10 bg-ink py-24 md:py-32">
        <Container>
          <div className="max-w-3xl">
            <Eyebrow label={category.eyebrow} />
            <h1 className="mt-8 font-display text-5xl leading-[1.02] text-bone md:text-7xl">
              {category.name}
              <span className="block font-light italic text-bone/77">
                {category.intro}
              </span>
            </h1>
            <p className="mt-8 max-w-2xl text-[15px] leading-relaxed text-bone/79">
              {category.body}
            </p>
          </div>
        </Container>
      </section>

      <section className="bg-ink-2 py-24 md:py-32">
        <Container>
          {tiles.length > 0 ? (
            <>
              <p className="text-[10px] uppercase tracking-[0.45em] text-gold">
                Our {category.name} Collection
              </p>
              <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-bone/79">
                {category.name} varieties we stock and supply — each links to
                its own product page with full specifications.
              </p>

              <div className="mt-8 grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4">
                {tiles.map((product, index) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    priority={index < 4}
                  />
                ))}
              </div>

              <p className="mt-12 text-[11px] uppercase tracking-[0.24em] text-bone/50">
                {products.length} varieties in total — see all on the{" "}
                <Link
                  href="/tiles"
                  className="text-gold underline underline-offset-2"
                >
                  catalogue
                </Link>
                .
              </p>
            </>
          ) : (
            <div className="py-12 text-center">
              <p className="text-[15px] text-bone/60">
                Our {category.name} collection is being updated. Please check
                back soon or{" "}
                <Link
                  href="/contact"
                  className="text-gold underline underline-offset-2"
                >
                  contact us
                </Link>{" "}
                for availability.
              </p>
            </div>
          )}

          <div className="mt-20">
            <p className="text-[10px] uppercase tracking-[0.45em] text-gold">
              Keep looking
            </p>
            <div className="mt-6 flex flex-wrap gap-4">
              {related.map((item) => (
                <Link
                  key={item.slug}
                  href={`/${item.slug}`}
                  className="rounded-full border border-gold/60 px-5 py-3 text-[11px] uppercase tracking-[0.24em] text-gold transition-colors duration-300 hover:bg-[#c9a96a] hover:text-black"
                >
                  {item.name}
                </Link>
              ))}
              <Link
                href="/contact"
                className="rounded-full bg-[#c9a96a] px-5 py-3 text-[11px] uppercase tracking-[0.24em] text-black transition-colors duration-300 hover:bg-ink"
              >
                Ask us
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
