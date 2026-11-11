import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";

export const metadata: Metadata = {
  title: "Common questions",
  description:
    "Answers to the questions that come up most often at the counter: grading, rectification, box coverage, delivery, and the difference between finishes.",
  alternates: { canonical: "/faq" },
};

const FAQS = [
  {
    q: "What is the difference between the grades?",
    a: "AAA is the highest quality — uniform colour, no visible chips, and consistent thickness across the box. It is what we recommend for large-format architectural work where a colour shift would be visible. AA is for residential use and the quality is very good for everyday rooms. A is for commercial or high-traffic surfaces where a small variation is acceptable and the price is lower.",
  },
  {
    q: "What does 'rectified' mean?",
    a: "The final 1–2 mm is ground off the edges of the tile so they are perfectly square. A rectified tile reads as one continuous grout line across the floor rather than a row of rough edges. If a tile is not rectified, the grout lines will be uneven and the finished floor will look patchy. All our vitrified and porcelain ranges are rectified.",
  },
  {
    q: "How do I know how many boxes I need?",
    a: "Run the calculator on the site. Enter the room dimensions and the product — it will give you the box count including the wastage allowance. The wastage slider matters: a standard 10% is fine for a straight stack, but a diagonal or herringbone layout runs 15–20% and you should raise the slider before checking the box count.",
  },
  {
    q: "What is the difference between glossy and matte finishes?",
    a: "Glossy reflects light and makes a room feel brighter, but it shows grout lines and dust more. Matte hides both and is more comfortable underfoot. For a bathroom with a lot of artificial light, matte on the walls reads as calmer. For a kitchen with little natural light, a slight gloss on the floor lifts the whole room. The Tile Lab lets you compare the two side by side on the same layout.",
  },
  {
    q: "Do you do delivery to site?",
    a: "Yes. Pickup, home delivery within the Kanpur city limits, and site delivery for active construction sites are all options. Site delivery is the right choice when the tiles need to be brought in through a construction lift or through a narrow gap between floors. The delivery preference you select on the quote form is the one the driver is told, not the one on the shipping label — make sure it matches where the tiles will actually arrive.",
  },
  {
    q: "Can I match a batch of tiles I bought a year ago?",
    a: "Often, but not always. Tiles are fired in batches and each batch has its own slight colour variation. If you still have the lot number from the original box, bring it with you and we will check with the supplier whether that batch is still in stock or whether a matched batch exists. If it does not, the two options are: buy a new batch and use the two colours as a deliberate design decision, or order enough at the same time next time to avoid the issue.",
  },
  {
    q: "What is anti-skid and where should it be used?",
    a: "Anti-skid tiles have a textured surface or a specific glaze that increases friction when wet. They are the right choice for pool surrounds, outdoor balconies, and any wet area where a standard glossy tile would be unsafe underfoot. Check the R10/R11 rating on the product page — R11 is the standard for wet commercial use.",
  },
];

/**
 * FAQ page.
 *
 * Questions are the ones the shop actually hears at the counter.
 * Answers are specific to this shop's stock and practices, not generic
 * tile advice from the internet.
 *
 * [SAMPLE — replace before delivery terms before launch.]
 */
export default function FaqPage() {
  return (
    <>
      <section className="border-b border-bone/10 bg-ink py-24 md:py-32">
        <Container>
          <div className="max-w-3xl">
            <Eyebrow label="FAQ" />
            <h1 className="mt-8 font-display text-5xl leading-[1.02] text-bone md:text-7xl">
              The questions we hear
              <span className="block font-light italic text-bone/77">
                most at the counter
              </span>
            </h1>
            <p className="mt-8 max-w-2xl text-[15px] leading-relaxed text-bone/79">
              If your question is not here, ask at the counter or send a
              WhatsApp message. The answers are usually in the product
              page or the calculator, and it takes two minutes to point
              you to the right one.
            </p>
          </div>
        </Container>
      </section>

      <section className="bg-ink-2 py-24 md:py-32">
        <Container>
          <div className="grid gap-8">
            {FAQS.map((faq) => (
              <div
                key={faq.q}
                className="rounded-2xl border border-bone/10 bg-ink p-7 md:p-9"
              >
                <h2 className="font-display text-xl leading-tight text-bone md:text-2xl">
                  {faq.q}
                </h2>
                <p className="mt-4 max-w-[70ch] text-[15px] leading-relaxed text-bone/79">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-t border-bone/10 bg-ink py-24 md:py-32">
        <Container>
          <div className="max-w-2xl">
            <Eyebrow label="STILL NOT SURE?" />
            <p className="mt-6 text-[15px] leading-relaxed text-bone/79">
              The Tile Lab is where most of the &ldquo;which finish&rdquo; questions
              get settled. Pick the room, pick the layout, and compare the
              surfaces side by side before you commit to a box count.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/tile-lab"
                className="rounded-full bg-[#c9a96a] px-6 py-4 text-[11px] uppercase tracking-[0.24em] text-black
                           transition-colors duration-300 hover:bg-ink"
              >
                Open the Tile Lab
              </Link>
              <Link
                href="/contact"
                className="rounded-full border border-gold/60 px-6 py-4 text-[11px] uppercase tracking-[0.24em] text-gold
                           transition-colors duration-300 hover:bg-[#c9a96a] hover:text-black"
              >
                Ask us directly
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}