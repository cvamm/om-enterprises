"use client";

import type { Product } from "@/types";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { ProductCard } from "@/components/catalogue/ProductCard";
import { SortDropdown } from "@/components/catalogue/SortDropdown";
import type { Category } from "@/lib/utils/category-photos";

export function StoreCategoryPageBody({
  category,
  related,
  initialProducts,
}: {
  category: Category;
  related: Category[];
  initialProducts: Product[];
}) {
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

          <div className="mt-14 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="flex items-center gap-3">
              <p className="text-[11px] uppercase tracking-[0.24em] text-bone/73">
                {initialProducts.length} {initialProducts.length === 1 ? "product" : "products"}
              </p>
            </div>
            <SortDropdown />
          </div>
        </Container>
      </section>

      <section className="bg-ink-2 py-24 md:py-32">
        <Container>
          {initialProducts.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-bone/73">No products found. Ask us for availability.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-3 xl:grid-cols-4">
              {initialProducts.map((product, index) => (
                <ProductCard
                  key={product.slug}
                  product={product}
                  priority={index < 4}
                />
              ))}
            </div>
          )}

          <div className="mt-20">
            <p className="text-[10px] uppercase tracking-[0.45em] text-gold">
              Keep looking
            </p>
            <div className="mt-6 flex flex-wrap gap-4">
              {related.map((item) => (
                <a
                  key={item.slug}
                  href={`/${item.slug}`}
                  className="border-gold/60 text-gold rounded-full border px-5 py-3 text-[11px] uppercase tracking-[0.24em] transition-colors duration-300 hover:bg-[#c9a96a] hover:text-black"
                >
                  {item.name}
                </a>
              ))}
              <a
                href="/contact"
                className="rounded-full bg-[#c9a96a] px-5 py-3 text-[11px] uppercase tracking-[0.24em] text-black transition-colors duration-300 hover:bg-ink"
              >
                Ask us
              </a>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
