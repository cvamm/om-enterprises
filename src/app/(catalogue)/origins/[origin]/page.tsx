import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { ProductGrid } from "@/components/catalogue/ProductGrid";
import { getOriginByState, getSuppliersForState } from "@/lib/queries/origins";
import { getProductsByOrigin } from "@/lib/queries/origins";
import { SAMPLE_ORIGINS } from "@/data/seeds/origins.sample";

/**
 * Valid origin segments. The sample data and the `origin_state` enum share
 * the same set; this is the single source of truth for which values are
 * routable.
 */
const VALID_STATES = [
  "rajasthan",
  "tamil-nadu",
  "gujarat",
  "madhya-pradesh",
  "chhattisgarh",
  "karnataka",
  "andhra-pradesh",
  "bihar",
  "other",
];

export function generateStaticParams() {
  return VALID_STATES.map((origin) => ({ origin }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ origin: string }>;
}): Promise<Metadata> {
  const { origin } = await params;
  if (!VALID_STATES.includes(origin)) return { title: "Origin not found" };

  const label = origin
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return {
    title: `${label} — sourcing and products`,
    description: `Material sourced from ${label}: products, verified suppliers and region notes.`,
    alternates: { canonical: `/origins/${origin}` },
  };
}

/**
 * Origin detail.
 *
 * Products from this state plus the verified suppliers behind them. Unverified
 * suppliers are not shown — §5's RLS enforces this at the database level and
 * the query here filters on `verified = true` for defence in depth.
 */
export default async function OriginDetailPage({
  params,
}: {
  params: Promise<{ origin: string }>;
}) {
  const { origin } = await params;
  if (!VALID_STATES.includes(origin)) {
    notFound();
  }

  const originRecord = await getOriginByState(origin);
  const suppliers = await getSuppliersForState(origin);

  // Products are keyed by origin id. Resolve the id for this state from the
  // sample data first; in a real database this would be a join.
  const originId =
    originRecord?.id ??
    SAMPLE_ORIGINS.find((o) => o.state === origin)?.id;

  const products =
    originId !== undefined ? await getProductsByOrigin(originId) : [];
  const regionList = originRecord?.primaryRegions ?? [];
  const description = originRecord?.description ?? null;

  const label = origin
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return (
    <>
      <section className="border-b border-bone/10 bg-ink py-20 md:py-28">
        <Container>
          <nav aria-label="Breadcrumb" className="text-[11px] uppercase tracking-[0.24em] text-bone/72">
            <Link href="/origins" className="transition-colors duration-300 hover:text-bone">
              Origins
            </Link>
            <span className="mx-2 text-bone/25" aria-hidden="true">/</span>
            <span className="text-bone/70">{label}</span>
          </nav>

          <div className="mt-10 max-w-3xl">
            <Eyebrow label={label.toUpperCase()} />
            <h1 className="mt-8 font-display text-5xl leading-[1.02] text-bone md:text-7xl">
              {label}
              {regionList.length > 0 ? (
                <span className="block font-light italic text-bone/77">
                  {regionList.join("  ")}
                </span>
              ) : null}
            </h1>

            {description !== null && description !== "" ? (
              <p className="mt-8 max-w-2xl text-[15px] leading-relaxed text-bone/79">
                {description}
              </p>
            ) : null}
          </div>
        </Container>
      </section>

      <section className="bg-ink-2 py-20 md:py-28">
        <Container>
          <p className="mb-10 text-[11px] uppercase tracking-[0.24em] text-bone/73">
            {products.length} {products.length === 1 ? "item" : "items"} from this state
          </p>
          <ProductGrid
            products={products}
            emptyAction={{ href: "/tiles", label: "Browse all products" }}
          />

          {suppliers.length > 0 && (
            <div className="mt-24">
              <h2 className="font-display text-3xl leading-tight text-bone">
                Verified suppliers
              </h2>
              <p className="mt-3 text-[13px] text-bone/73">
                Shown only when verified. Contact details are for the shop, not the customer.
              </p>
              <div className="mt-10 grid gap-5 md:grid-cols-2 md:gap-8">
                {suppliers.map((supplier) => (
                  <div
                    key={supplier.id}
                    className="rounded-2xl border border-bone/10 bg-ink p-7"
                  >
                    <h3 className="font-display text-2xl leading-tight text-bone">
                      {supplier.name}
                    </h3>
                    <p className="mt-2 text-[13px] text-bone/75">{supplier.location}</p>
                    {supplier.phone !== null && (
                      <p className="mt-4 text-[13px] text-bone/72">{supplier.phone}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </Container>
      </section>
    </>
  );
}