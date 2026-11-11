import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { getOriginSummaries } from "@/lib/queries/origins";

export const metadata: Metadata = {
  title: "Where our tiles come from",
  description:
    "Rajasthan, Tamil Nadu, Gujarat and beyond — the states behind the material in our catalogue, and the suppliers we source from.",
  alternates: { canonical: "/origins" },
};

/**
 * Origin listing.
 *
 * Origins are a browse path and a filter, not the site's top-level tree
 * (§5) — so they live under the catalogue, and each card links through to
 * that origin's products. The count on each card is a real number from the
 * catalogue, not a slogan.
 */
export default async function OriginsPage() {
  const summaries = await getOriginSummaries();

  return (
    <>
      <section className="border-b border-bone/10 bg-ink py-24 md:py-32">
        <Container>
          <div className="max-w-3xl">
            <Eyebrow label="ORIGINS" />
            <h1 className="mt-8 font-display text-5xl leading-[1.02] text-bone md:text-7xl">
              Where our material
              <span className="block font-light italic text-bone/77">
                is cut, fired, and finished
              </span>
            </h1>
            <p className="mt-8 max-w-2xl text-[15px] leading-relaxed text-bone/79">
              A tile is not generic — it is a quarry, a kiln, and a road. The
              state a material comes from decides what it can do, and how it
              behaves in a room in Kanpur. Browse by the place it came from.
            </p>
          </div>
        </Container>
      </section>

      <section className="bg-ink-2 py-24 md:py-32">
        <Container>
          {summaries.length === 0 ? (
            <p className="max-w-xl text-[15px] leading-relaxed text-bone/77">
              Origins will appear here as the catalogue is populated.
            </p>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 md:gap-8">
              {summaries.map((summary) => (
                <Link
                  key={summary.state}
                  href={`/origins/${summary.state}`}
                  className="group rounded-2xl border border-bone/10 bg-ink p-7
                             transition-colors duration-300 hover:border-bone/30 md:p-9"
                >
                  <div className="flex items-baseline justify-between gap-6">
                    <h2 className="font-display text-3xl leading-tight text-bone md:text-4xl">
                      {summary.label}
                    </h2>
                    {summary.productCount > 0 && (
                      <p className="shrink-0 text-[11px] uppercase tracking-[0.24em] text-bone/73">
                        {summary.productCount} {summary.productCount === 1 ? "item" : "items"}
                      </p>
                    )}
                  </div>

                  <p className="mt-5 text-[11px] uppercase tracking-[0.24em] text-gold">
                    {displayName(summary.leadOrigin.name)}
                  </p>

                  {summary.originCount > 1 && (
                    <p className="mt-3 text-[13px] text-bone/73">
                      Plus {summary.originCount - 1} more origin{summary.originCount > 2 ? "s" : ""} from this state
                    </p>
                  )}
                </Link>
              ))}
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
/**
 * Display name for an origin, keeping the sample marker visible when it is
 * present. The marker is deliberately not stripped — hiding it would make a
 * dev-only value look like a real one, which is the exact thing the marker
 * exists to prevent.
 */
function displayName(name: string): string {
  return name;
}
