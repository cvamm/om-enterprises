import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";

export const metadata: Metadata = {
  title: "About the shop",
  description:
    "Parbat Stone Works is a tiles and natural stone shop in Kanpur. What we carry, how we source it, and why the supply chain matters to a customer.",
  alternates: { canonical: "/about" },
};

/**
 * About page. The shop is real; the page carries what is already
 * public — the name, the location, what it does. The history and the
 * founder are filled in by the owner; they are not for us to invent.
 *
 * [SAMPLE — replace before deploy] carries every field that is
 * currently a placeholder.
 */
export default function AboutPage() {
  return (
    <>
      <section className="border-b border-bone/10 bg-ink py-24 md:py-32">
        <Container>
          <div className="max-w-3xl">
            <Eyebrow label="ABOUT" />
            <h1 className="mt-8 font-display text-5xl leading-[1.02] text-bone md:text-7xl">
              A shop that can tell you
              <span className="block font-light italic text-bone/77">
                where the stone came from
              </span>
            </h1>
            <p className="mt-8 max-w-2xl text-[15px] leading-relaxed text-bone/79">
              Parbat Stone Works carries glazed vitrified, full body,
              marble look and natural stone, sourced from specific quarries
              and kilns in Rajasthan, Tamil Nadu and other Indian states.
              Every box has an origin. We can tell you which one.
            </p>
          </div>
        </Container>
      </section>

      <section className="bg-ink-2 py-24 md:py-32">
        <Container>
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
            <div>
              <h2 className="text-[10px] uppercase tracking-[0.45em] text-gold">
                WHAT WE CARRY
              </h2>
              <ul className="mt-6 space-y-4">
                {[
                  "Glazed vitrified and full body tiles — the workhorse formats for floors and walls",
                  "Marble look and wood plank finishes for rooms that need a specific material story",
                  "Natural stone: Rajasthan sandstone, Tamil Nadu granite, and engineered marble",
                  "Terrazzo, mosaic, and anti-skid outdoor ranges for balconies, pools, and exteriors",
                  "Contractor pricing and batch matching for jobs that span months, not days",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-4">
                    <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rotate-45 bg-[#c9a96a]" aria-hidden="true" />
                    <span className="text-[15px] leading-relaxed text-bone/79">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid gap-6">
              <div className="rounded-2xl border border-bone/10 bg-ink p-7">
                <h3 className="text-[10px] uppercase tracking-[0.45em] text-gold">
                  THE SHOP
                </h3>
                <p className="mt-4 text-[15px] leading-relaxed text-bone/79">
                  [SAMPLE — replace before deploy]
                  Amdadi Road, near the old clock tower, Kanpur, UP 226 001
                </p>
              </div>

              <div className="rounded-2xl border border-bone/10 bg-ink p-7">
                <h3 className="text-[10px] uppercase tracking-[0.45em] text-gold">
                  WHY THE SUPPLY CHAIN MATTERS
                </h3>
                <p className="mt-4 text-[15px] leading-relaxed text-bone/79">
                  A tile that is not rectified shows its joints a year in. A
                  batch that was fired at the wrong temperature shifts colour
                  across the room. The grade on the box and the name of the
                  quarry on the origin page are not marketing. They are the
                  two facts that matter most when a problem shows up at 9 am
                  on installation day.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="border-t border-bone/10 bg-ink py-24 md:py-32">
        <Container>
          <div className="max-w-2xl">
            <Eyebrow label="KEEP READING" />
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/craft"
                className="rounded-full border border-gold/60 px-6 py-3.5 text-[11px] uppercase tracking-[0.24em] text-gold
                           transition-colors duration-300 hover:bg-[#c9a96a] hover:text-black"
              >
                The craft
              </Link>
              <Link
                href="/contact"
                className="rounded-full bg-[#c9a96a] px-6 py-3.5 text-[11px] uppercase tracking-[0.24em] text-black
                           transition-colors duration-300 hover:bg-ink"
              >
                Visit the shop
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}