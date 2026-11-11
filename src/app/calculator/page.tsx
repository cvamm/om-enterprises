import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { getProducts } from "@/lib/queries/products";
import { CalculatorShell } from "@/components/calculator/CalculatorShell";

export const metadata: Metadata = {
  title: "Tile cost calculator",
  description:
    "Measure your room, pick a tile, and get a box-by-box estimate including wastage. No payment — this is a planning tool, not an order.",
  alternates: { canonical: "/calculator" },
};

/**
 * Tile area and cost calculator. §8 feature 1.
 *
 * The page is a Server Component that fetches the product list once and
 * hands it to the client shell. All math, all state, and the WhatsApp
 * hand-off live in the client boundary — no network round trip while
 * typing, per §9.
 *
 * The estimate includes wastage (default 10%, §6) and floors the box
 * count to the product's MOQ. Both matter when comparing two tiles:
 * one with a large format and low wastage against one with a small
 * format and high wastage.
 */
export default async function CalculatorPage() {
  const { products } = await getProducts({ perPage: 500 });

  return (
    <>
      <section className="border-b border-bone/10 bg-ink py-24 md:py-32">
        <Container>
          <div className="max-w-3xl">
            <Eyebrow label="CALCULATOR" />
            <h1 className="mt-8 font-display text-5xl leading-[1.02] text-bone md:text-7xl">
              Plan the room,
              <span className="block font-light italic text-bone/77">
                box by box
              </span>
            </h1>
            <p className="mt-8 max-w-2xl text-[15px] leading-relaxed text-bone/79">
              Enter the room&apos;s dimensions and pick a tile. We will show
              how many boxes you need, including the wastage allowance that
              every installer builds in, and the estimated cost. This is a
              planning figure — the final quote is confirmed by phone or
              WhatsApp.
            </p>
          </div>
        </Container>
      </section>

      <section className="bg-ink-2 py-24 md:py-32">
        <Container>
          <CalculatorShell products={products} />
        </Container>
      </section>
    </>
  );
}