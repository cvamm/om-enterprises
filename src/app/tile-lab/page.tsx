import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { getProducts } from "@/lib/queries/products";
import { TileLab } from "@/components/marketing/TileLab/TileLab";

export const metadata: Metadata = {
  title: "Tile Lab",
  description:
    "Pick a surface, a bond pattern, a grout shade and a gloss level — see the layout update live, and send the full specification to the shop on WhatsApp.",
  alternates: { canonical: "/tile-lab" },
};

/**
 * Tile Lab — pattern configurator. §8 feature 2.
 *
 * The server component fetches the product list once and hands it to
 * the client configurator. No round trip happens while the user drags
 * a slider; all preview updates are local.
 */
export default async function TileLabPage() {
  const { products } = await getProducts({ perPage: 200 });

  return (
    <>
      <section className="border-b border-bone/10 bg-ink py-24 md:py-32">
        <Container>
          <div className="max-w-3xl">
            <Eyebrow label="03 — TILE LAB" />
            <h1 className="mt-8 font-display text-5xl leading-[1.02] text-bone md:text-7xl">
              See the room,
              <span className="block font-light italic text-bone/77">
                before the boxes arrive
              </span>
            </h1>
            <p className="mt-8 max-w-2xl text-[15px] leading-relaxed text-bone/79">
              Pick a surface, a bond pattern, a grout shade and a gloss level.
              The layout updates live — no waiting, no &ldquo;call us for a
              mock-up&rdquo;. When the layout is right, the button sends the
              full specification to the shop on WhatsApp.
            </p>
          </div>
        </Container>
      </section>

      <section className="bg-ink-2 py-24 md:py-32">
        <Container>
          <TileLab products={products} />
        </Container>
      </section>
    </>
  );
}