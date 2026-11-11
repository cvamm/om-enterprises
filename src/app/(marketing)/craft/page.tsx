import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";

export const metadata: Metadata = {
  title: "The craft",
  description:
    "How every tile and stone we sell moves from the quarry or kiln to the floor of your home. The steps in between matter as much as the finished surface.",
  alternates: { canonical: "/craft" },
};

const STEPS = [
  {
    eyebrow: "01",
    title: "The quarry or the kiln",
    body: "Every product in the catalogue starts at a specific place: a quarry in Rajasthan, a kiln in the Tamil Nadu corridor, a stone yard in a state we name on the page. The origin page carries the certification; the product page carries the box price. One chain, no hand-waving.",
  },
  {
    eyebrow: "02",
    title: "The grade decision",
    body: "Tiles come in three grades: AAA for large-format architectural work, AA for residential use, and A for high-turnover commercial surfaces. The grade is printed on the box. What you see on the shelf is what the box says — no swapping between boxes, no mystery batch.",
  },
  {
    eyebrow: "03",
    title: "The glaze and the rectification",
    body: "Vitrified tiles are fired at over 1,200 °C, which is what makes them dense and water-resistant. The edges are then rectified — the final 1–2 mm ground off — so that the joints in a finished floor are uniform and the grout line reads as one continuous seam rather than a row of rough edges.",
  },
  {
    eyebrow: "04",
    title: "The stock check",
    body: "Each box we receive is counted against the shipping list and the grade stamp is checked against what the supplier declared. That is the step that catches a batch that went wrong in transit — a chip, a colour shift, a missing slab — before it reaches a customer who cannot tell the difference at the counter.",
  },
];

/**
 * The craft page.
 *
 * One of the five marketing sections (§2, eyebrow numbering).
 * The page exists to make the supply chain legible: a customer who
 * has read this page can say exactly where a tile they are buying
 * has been and what was checked at each step.
 */
export default function CraftPage() {
  return (
    <>
      <section className="border-b border-bone/10 bg-ink py-24 md:py-32">
        <Container>
          <div className="max-w-3xl">
            <Eyebrow label="02 — THE CRAFT" />
            <h1 className="mt-8 font-display text-5xl leading-[1.02] text-bone md:text-7xl">
              From the quarry,
              <span className="block font-light italic text-bone/77">
                with the grade on the box
              </span>
            </h1>
            <p className="mt-8 max-w-2xl text-[15px] leading-relaxed text-bone/79">
              Most tile shops cannot say where their stock came from. Ours
              can. This page is the supply chain, step by step, with no
              decorative language and no gap between the stone yard and the
              shelf.
            </p>
          </div>
        </Container>
      </section>

      <section className="bg-ink-2 py-24 md:py-32">
        <Container>
          <div className="grid gap-10 md:grid-cols-2 lg:gap-14">
            {STEPS.map((step) => (
              <div
                key={step.eyebrow}
                className="rounded-2xl border border-bone/10 bg-ink p-7 md:p-9"
              >
                <span className="text-[10px] uppercase tracking-[0.45em] text-gold">
                  {step.eyebrow}
                </span>
                <h2 className="mt-4 font-display text-3xl leading-tight text-bone">
                  {step.title}
                </h2>
                <p className="mt-4 text-[15px] leading-relaxed text-bone/79">
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-t border-bone/10 bg-ink py-24 md:py-32">
        <Container>
          <div className="max-w-2xl">
            <Eyebrow label="SEE THE COLLECTIONS" />
            <p className="mt-6 text-[15px] leading-relaxed text-bone/79">
              Every product in the catalogue has its origin page, its grade,
              and its box price on one screen. No separate lookup, no phone
              call to confirm what the shelf label means.
            </p>
            <div className="mt-8">
              <Link
                href="/collections"
                className="rounded-full bg-[#c9a96a] px-6 py-4 text-[11px] uppercase tracking-[0.24em] text-black
                           transition-colors duration-300 hover:bg-ink"
              >
                Browse the collections
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}