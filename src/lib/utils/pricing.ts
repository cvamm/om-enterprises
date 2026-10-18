/**
 * Per-box pricing derivation. §6 of the brief.
 *
 * The database stores ONLY the four source numbers. Everything else is derived
 * on read, because a stored per-sqft price goes stale the moment a box price is
 * edited and there is no way to tell which of the two is wrong.
 */

export type ProductPricing = {
  /** Rupees, integer. The only stored price. */
  pricePerBoxInr: number;
  /** Total area covered by one box, in sq ft. */
  boxAreaSqft: number;
  /** Pieces in one box. `1` for slabs. */
  tilesPerBox: number;
  /** Minimum order quantity in boxes. */
  moqBoxes: number;
};

export type DerivedPricing = {
  /** Rupees per sq ft, rounded to 2dp. Display only — never the card price. */
  pricePerSqftInr: number;
  /** Pieces per sq ft, rounded to 2dp. */
  tilesPerSqft: number;
};

/** Rupees per square foot. The figure a customer compares across shops. */
export function derivePricePerSqftInr(product: ProductPricing): number {
  if (product.boxAreaSqft <= 0) return 0;
  return round2(product.pricePerBoxInr / product.boxAreaSqft);
}

/** Pieces per square foot. Useful for large-format where a box is 1–2 pieces. */
export function deriveTilesPerSqft(product: ProductPricing): number {
  if (product.boxAreaSqft <= 0) return 0;
  return round2(product.tilesPerBox / product.boxAreaSqft);
}

/** Both derived figures at once. */
export function derivePricing(product: ProductPricing): DerivedPricing {
  return {
    pricePerSqftInr: derivePricePerSqftInr(product),
    tilesPerSqft: deriveTilesPerSqft(product),
  };
}

/**
 * Half-up is NOT used anywhere in this project. A customer cannot buy half a
 * box, so every quantity rounds up. `Math.round` is deliberately avoided for
 * quantities — see `calculator.ts`.
 */
function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}
