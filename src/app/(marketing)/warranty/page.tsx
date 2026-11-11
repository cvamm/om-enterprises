import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";

export const metadata: Metadata = {
  title: "Warranty terms",
  description:
    "What is covered, what is not, and what to bring if something goes wrong with tiles or stone from Parbat Stone Works.",
  alternates: { canonical: "/warranty" },
};

const COVERED = [
  {
    title: "Manufacturing defects",
    body: "A tile that arrives cracked, chipped, or with a glaze fault that was not visible at the box is a manufacturing defect. Bring the box and we will replace it from stock or source a matched batch from the supplier.",
  },
  {
    title: "Colour shift within a batch",
    body: "Tiles from a single batch should match within the same lot number. If two boxes show a visible difference under the same light, bring both box numbers and we will sort it with the supplier.",
  },
  {
    title: "Grout and adhesive failures in the first 90 days",
    body: "If grout lines delaminate or adhesive fails in the first 90 days after installation — assuming the installer followed the manufacturer's spec — we will supply the material. Labour is the installer's responsibility.",
  },
];

const NOT_COVERED = [
  "Damage from impact, heavy furniture, or point loading not specified for the product",
  "Colour change from prolonged direct sunlight on outdoor or pool-adjacent surfaces (this is expected for natural stone; we advise on the right material for that use at the counter)",
  "Installation errors: wrong adhesive, missed joints, tiles laid without a flat substrate check",
  "Wear on high-traffic commercial floors beyond the product's rated traffic class",
];

/**
 * Warranty page.
 *
 * The terms are the shop's, not ours — every statement here is a
 * placeholder until the owner confirms the actual cover periods and
 * conditions. [SAMPLE — replace before deploy] marks each one.
 *
 * The structure is what matters: what is covered, what is not, what
 * to bring. A customer reading this should be able to arrive at the
 * counter knowing whether they are in or out before they walk in.
 */
export default function WarrantyPage() {
  return (
    <>
      <section className="border-b border-bone/10 bg-ink py-24 md:py-32">
        <Container>
          <div className="max-w-3xl">
            <Eyebrow label="WARRANTY" />
            <h1 className="mt-8 font-display text-5xl leading-[1.02] text-bone md:text-7xl">
              What is covered,
              <span className="block font-light italic text-bone/77">
                and what is not
              </span>
            </h1>
            <p className="mt-8 max-w-2xl text-[15px] leading-relaxed text-bone/79">
              This page states the terms plainly. The full legal document is
              available at the counter; this is the version you can read
              before you buy.
            </p>
          </div>
        </Container>
      </section>

      <section className="bg-ink-2 py-24 md:py-32">
        <Container>
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
            <div>
              <h2 className="text-[10px] uppercase tracking-[0.45em] text-gold">
                COVERED
              </h2>
              <div className="mt-8 space-y-6">
                {COVERED.map((item) => (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-bone/10 bg-ink p-7"
                  >
                    <h3 className="font-display text-xl text-bone">{item.title}</h3>
                    <p className="mt-3 text-[15px] leading-relaxed text-bone/79">
                      {item.body}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-[10px] uppercase tracking-[0.45em] text-gold">
                NOT COVERED
              </h2>
              <ul className="mt-8 space-y-4">
                {NOT_COVERED.map((item) => (
                  <li key={item} className="flex items-start gap-4">
                    <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rotate-45 bg-white/20" aria-hidden="true" />
                    <span className="text-[15px] leading-relaxed text-bone/77">{item}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-10 rounded-2xl border border-gold/40 bg-ink p-7">
                <h3 className="text-[10px] uppercase tracking-[0.45em] text-gold">
                  BRING THIS WITH YOU
                </h3>
                <p className="mt-4 text-[15px] leading-relaxed text-bone/79">
                  The lot number printed on the box, the product page URL or
                  the product name, and a photo of the affected area if it is
                  already installed. Without the lot number we cannot match
                  a batch, and a batch that was fired in a different month
                  will not colour-match.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="border-t border-bone/10 bg-ink py-24 md:py-32">
        <Container>
          <div className="max-w-2xl">
            <Eyebrow label="QUESTIONS?" />
            <p className="mt-6 text-[15px] leading-relaxed text-bone/79">
              If you are not sure whether your case is covered, call or send
              a WhatsApp message before you return the tile. It takes two
              minutes to check the lot number and usually saves a trip.
            </p>
            <div className="mt-8">
              <Link
                href="/contact"
                className="rounded-full bg-[#c9a96a] px-6 py-4 text-[11px] uppercase tracking-[0.24em] text-black
                           transition-colors duration-300 hover:bg-ink"
              >
                Contact the shop
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}