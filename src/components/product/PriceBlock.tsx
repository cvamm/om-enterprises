import type { Product } from "@/types";
import { formatProductPricing } from "@/lib/utils/pricing";

/**
 * Per-sqft derived price display.
 *
 * §6 is explicit: the primary price is per box, and per-sqft is a derived
 * secondary figure that must never be stored. It is also the figure a
 * customer actually compares across products, so it is shown — just
 * labelled, and always under the box price rather than instead of it.
 */
export function PriceBlock({
  product,
  size = "md",
  className,
}: {
  product: Product;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const { formattedPricePerBox, formattedPricePerSqft } = formatProductPricing(product);

  const boxSize =
    size === "lg" ? "text-3xl md:text-4xl" : size === "sm" ? "text-xl" : "text-2xl";
  const unitSize = size === "lg" ? "text-[13px]" : "text-[11px]";

  // pricePerBoxInr === 0 is the "price not set yet" state on the demo set;
  // show the honest label instead of a ₹0 that reads like free.
  const onRequest = product.pricePerBoxInr === 0;

  if (onRequest) {
    return (
      <div className={className}>
        <div className="flex items-baseline gap-2">
          <span
            className={`font-display ${boxSize} leading-none text-gold`}
            data-testid="price-per-box"
          >
            On request
          </span>
          <span className="text-[10px] uppercase tracking-[0.24em] text-bone/73">
            per box
          </span>
        </div>
        <p className={`mt-2 ${unitSize} text-bone/77`}>
          {product.boxAreaSqft} sq.ft per box
          <span className="mx-2 text-bone/25">|</span>
          WhatsApp for a quote
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="flex items-baseline gap-2">
        <span
          className={`font-display ${boxSize} leading-none text-bone`}
          data-testid="price-per-box"
        >
          {formattedPricePerBox}
        </span>
        <span className="text-[10px] uppercase tracking-[0.24em] text-bone/73">
          / box
        </span>
      </div>

      <p className={`mt-2 ${unitSize} text-bone/77`}>
        <span data-testid="price-per-sqft">{formattedPricePerSqft}</span> per sq.ft
        <span className="mx-2 text-bone/25">|</span>
        {product.boxAreaSqft} sq.ft per box
      </p>
    </div>
  );
}
