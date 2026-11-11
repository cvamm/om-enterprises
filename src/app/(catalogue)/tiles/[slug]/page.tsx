import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Badge } from "@/components/ui/Badge";
import { PriceBlock } from "@/components/product/PriceBlock";
import { SpecTable } from "@/components/product/SpecTable";
import { RequestQuote } from "@/components/product/RequestQuote";
import { RelatedProducts } from "@/components/product/RelatedProducts";
import { ProductGallery } from "@/components/product/ProductGallery";
import { getProductBySlug, getAllProductSlugs } from "@/lib/queries/products";
import { siteConfig } from "@/lib/config/site";

/**
 * Product detail.
 *
 * ISR at 3600s: a price or stock change propagates within the hour, which
 * matches how often the shop actually edits the catalogue.
 *
 * The page is a Server Component. Only the quote form and the gallery are
 * client islands, so the price, spec table and related products all render
 * without JS — the thing that actually matters on a Moto G over 4G.
 */
export const revalidate = 3600;

export async function generateStaticParams() {
  const slugs = await getAllProductSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (product === null) {
    // Call notFound() here rather than returning a title. Returning a title
    // from generateMetadata resolves the metadata promise successfully, so
    // Next has nothing marking this response as a 404 and serves the
    // not-found page with a 200 status. Search engines then index a
    // "Product not found" page as a real product URL.
    notFound();
  }

  const title = `${product.nameEn} — price per box`;
  const description =
    product.descriptionEn ??
    `${product.nameEn}: ${product.materialType.replace(/-/g, " ")} with a ${product.finish} finish, ` +
    `${product.dimensionsMm[0]}×${product.dimensionsMm[1]}mm, sold by the box covering ` +
    `${product.boxAreaSqft} sq.ft. Request a quote in Kanpur.`;

  const cover = product.photoUrls[0];

  return {
    title,
    description,
    alternates: { canonical: `/tiles/${slug}` },
    openGraph: {
      title,
      description,
      // No photo yet means no OG image rather than a broken one. The
      // default from generateMetadata in the root layout still applies.
      ...(cover !== undefined ? { images: [{ url: cover }] } : {}),
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (product === null) {
    notFound();
  }


  return (
    <>
      {/* Structured data. Product schema with the per-box price, so a search
          result can show the real number rather than a generic blurb. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: product.nameEn,
            description: product.descriptionEn ?? undefined,
            material: product.materialType,
            offers: {
              "@type": "Offer",
              price: product.pricePerBoxInr,
              priceCurrency: "INR",
              // A box, not a unit. Getting this wrong in schema is how a
              // product ends up listed at ₹1,200 in a shopping feed that
              // assumes per-item pricing.
              unitText: "box",
              availability:
                product.stockStatus === "in-stock"
                  ? "https://schema.org/InStock"
                  : product.stockStatus === "sold-out"
                    ? "https://schema.org/OutOfStock"
                    : "https://schema.org/PreOrder",
              seller: { "@type": "LocalBusiness", name: siteConfig.name },
            },
          }),
        }}
      />

      <section className="bg-ink py-16 md:py-24">
        <Container>
          <nav aria-label="Breadcrumb" className="mb-12 text-[11px] uppercase tracking-[0.24em] text-bone/72">
            <Link href="/tiles" className="hover:text-bone">
              Catalogue
            </Link>
            <span className="mx-2 text-bone/25" aria-hidden="true">/</span>
            <span className="text-bone/70">{product.materialType.replace(/-/g, " ")}</span>
          </nav>

          <div className="grid gap-12 lg:grid-cols-[1fr_420px] lg:gap-16">
            <div>
              <ProductGallery product={product} />

              <div className="mt-20">
                <Eyebrow label="SPECIFICATION" />
                <SpecTable product={product} />
              </div>
            </div>

            <div className="lg:sticky lg:top-24 lg:self-start">
              <div className="flex flex-wrap items-center gap-3">
                <Badge tone={badgeTone(product.stockStatus)}>
                  {stockLabel(product.stockStatus)}
                </Badge>
                {product.moqBoxes > 1 && (
                  <Badge tone="muted">
                    {`Minimum ${product.moqBoxes} boxes`}
                  </Badge>
                )}
              </div>

              <h1 className="mt-6 font-display text-4xl leading-[1.02] text-bone md:text-5xl">
                {product.nameEn}
              </h1>

              <p className="mt-4 text-[11px] uppercase tracking-[0.24em] text-bone/73">
                {product.materialType.replace(/-/g, " ")} — {product.finish}
              </p>

              <div className="mt-10 border-t border-bone/10 pt-10">
                <PriceBlock product={product} size="lg" />
              </div>

              {product.descriptionEn !== null && product.descriptionEn !== "" && (
                <p className="mt-10 text-[15px] leading-relaxed text-bone/70">
                  {product.descriptionEn}
                </p>
              )}

              <div className="mt-12">
                <RequestQuote product={product} />
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="border-t border-bone/10 bg-ink-2 py-24 md:py-32">
        <Container>
          <Eyebrow label="RELATED" />
          <h2 className="mt-8 font-display text-4xl leading-[1.02] text-bone md:text-5xl">
            Similar <span className="font-light italic text-bone/77">material</span>
          </h2>
          <div className="mt-12">
            <RelatedProducts product={product} />
          </div>
        </Container>
      </section>
    </>
  );
}

/** Sold-out and made-to-order should not read as gold — gold means "buy now". */
function badgeTone(status: string): "gold" | "muted" {
  return status === "in-stock" || status === "preorder" ? "gold" : "muted";
}

function stockLabel(status: string): string {
  switch (status) {
    case "in-stock":
      return "In stock";
    case "made-to-order":
      return "Made to order";
    case "preorder":
      return "Preorder";
    case "sold-out":
      return "Sold out";
    default:
      return status;
  }
}