import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import type { Category } from "@/lib/utils/category-photos";

/**
 * Shared body for a store line (marbles, granite, western toilets, …).
 *
 * Every line follows the same shape: an intro band that states what the
 * material or service actually is, then a grid of real product photos. The
 * photos are stand-in Pexels textures with truthful alt text — the shop's own
 * stock and prices are added later, so nothing here claims a specific product
 * the shop does not carry.
 */
export function CategoryPageBody({
  category,
  related,
}: {
  category: Category;
  /** Other lines shown in a "keep looking" strip at the bottom. */
  related: Category[];
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
        </Container>
      </section>

      <section className="bg-ink-2 py-24 md:py-32">
        <Container>
          <div className="grid gap-5 sm:grid-cols-2 md:gap-8">
            {category.photos.map((photo) => (
              <figure
                key={photo.src}
                className="group relative h-[330px] overflow-hidden rounded-2xl border border-bone/10 md:h-[420px]"
              >
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-110"
                  loading="lazy"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-2/70 via-transparent to-transparent" />
              </figure>
            ))}
          </div>

          <div className="mt-14">
            <p className="text-[10px] uppercase tracking-[0.45em] text-gold">
              Keep looking
            </p>
            <div className="mt-6 flex flex-wrap gap-4">
              {related.map((item) => (
                <Link
                  key={item.slug}
                  href={`/${item.slug}`}
                  className="border-gold/60 text-gold rounded-full border px-5 py-3 text-[11px] uppercase tracking-[0.24em] transition-colors duration-300 hover:bg-[#c9a96a] hover:text-black"
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
