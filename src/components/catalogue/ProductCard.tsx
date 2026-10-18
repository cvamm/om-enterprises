import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/types";
import { cn } from "@/lib/utils/cn";
import { Badge } from "@/components/ui/Badge";
import { PriceBlock } from "@/components/product/PriceBlock";
import { ProductImagePlaceholder } from "@/components/catalogue/ProductImagePlaceholder";

/**
 * Product card for grids.
 *
 * Images: the catalogue ships with no photos (ADR 0004), so a product with no
 * `photoUrls` renders a material-derived placeholder rather than an empty
 * frame or a stock photo. That placeholder is deterministic per slug — the
 * same tile always looks the same — and carries the sample marker so it is
 * visibly not the real thing.
 *
 * Motion: `group-hover:scale-110` at `duration-[1200ms]`, per §2. The card
 * itself does not fade in on scroll — grids are auxiliary to the section
 * heading, and §10 bans animating every card.
 */
export function ProductCard({
  product,
  priority = false,
  className,
}: {
  product: Product;
  /** First row only: eager-load and drop lazy decoding on the LCP images. */
  priority?: boolean;
  className?: string;
}) {
  const cover = product.photoUrls[0];
  const href = `/tiles/${product.slug}`;

  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-white/10 bg-[#0b0b0c]",
        "transition-colors duration-300 hover:border-white/30",
        className,
      )}
      data-testid="product-card"
      data-slug={product.slug}
    >
      <Link href={href} className="block">
        <div className="relative h-[330px] overflow-hidden md:h-[380px]">
          {cover === undefined ? (
            <ProductImagePlaceholder product={product} />
          ) : (
            <Image
              src={cover}
              alt={`${product.nameEn} — ${product.materialType} tile`}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1500px) 50vw, 33vw"
              className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-110"
              priority={priority}
              loading={priority ? "eager" : "lazy"}
            />
          )}

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0b0b0c] via-transparent to-transparent" />

          <div className="absolute left-5 top-5 flex flex-wrap gap-2">
            {product.stockStatus === "sold-out" && (
              <Badge tone="muted">Sold out</Badge>
            )}
            {product.stockStatus === "made-to-order" && (
              <Badge tone="gold">Made to order</Badge>
            )}
            {product.stockStatus === "preorder" && <Badge tone="gold">Preorder</Badge>}
          </div>
        </div>

        <div className="p-7 md:p-9">
          <div className="flex items-start justify-between gap-6">
            <div className="min-w-0">
              <h3 className="font-display text-2xl leading-tight text-bone">
                {product.nameEn}
              </h3>
              <p className="mt-1 text-[11px] uppercase tracking-[0.24em] text-bone/45">
                {product.materialType.replace(/-/g, " ")} — {product.finish}
              </p>
            </div>
            <p className="shrink-0 text-right text-[11px] leading-relaxed text-bone/45">
              {product.dimensionsMm[0]}×{product.dimensionsMm[1]}
              <span className="block">mm</span>
            </p>
          </div>

          <div className="mt-7">
            <PriceBlock product={product} size="sm" />
          </div>
        </div>
      </Link>
    </article>
  );
}