/**
 * Area and box-count maths for the /calculator route. §6 of the brief.
 *
 * Two rules dominate everything here:
 *
 *   1. Quantities round UP, always. You cannot buy half a box, and a room
 *      short one box of tile is a room that ships with a visible gap.
 *   2. MOQ is a floor, not a suggestion. If the maths says two boxes and the
 *      product's minimum order is four, the answer is four.
 *
 * Wastage is not padding. It is the allowance for cuts, breakage, and the
 * pieces that end up in a skip because the layout fought back.
 */

export type CalculatorInput = {
  /** Room length in feet. */
  roomLengthFt: number;
  /** Room width in feet. */
  roomWidthFt: number;
  /** Wastage allowance as a percentage. Defaults to 10. */
  wastagePct: number;
  product: {
    boxAreaSqft: number;
    pricePerBoxInr: number;
    tilesPerBox: number;
    moqBoxes: number;
  };
};

export type CalculatorResult = {
  /** Length × width, before wastage. */
  netAreaSqft: number;
  /** Net area with the wastage allowance added. */
  totalAreaSqft: number;
  /** Boxes to buy, after MOQ. This is the number the customer acts on. */
  boxesRequired: number;
  /** Individual pieces across those boxes. */
  tilesRequired: number;
  /** Boxes × price. Rupees, integer. */
  estimatedCostInr: number;
  /** Effective cost per sq ft of the *total* area, including waste. */
  unitCostSqft: number;
};

/** The default cut-and-breakage allowance, per §6. */
export const DEFAULT_WASTAGE_PCT = 10;

/**
 * Wastage by bond pattern. Diagonal and herringbone both eat far more tile
 * than a straight stack because of the angled cuts at every edge.
 */
export const WASTAGE_BY_BOND = {
  stacked: 10,
  brick: 12,
  diagonal: 15,
  herringbone: 20,
} as const;

export type BondPattern = keyof typeof WASTAGE_BY_BOND;

/** Round up to a whole box. Never `Math.round`, which would round down. */
function boxesFor(areaSqft: number, boxAreaSqft: number): number {
  if (boxAreaSqft <= 0) return 0;
  return Math.ceil(areaSqft / boxAreaSqft);
}

/**
 * Areas are money-adjacent display values. `10 * 10 * 1.1` is
 * `110.00000000000001` in IEEE 754, and a customer who is told their room is
 * 110.00000000000001 sq ft has been handed a bug. Round to 2dp on the way
 * out; the box count above is computed from the unrounded value so the
 * rounding can never pull a box back out of the answer.
 */
function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/**
 * Full estimate for one room and one product.
 *
 * `totalAreaSqft` is the floor for the unit-cost figure, not `netAreaSqft` —
 * quoting a per-sqft price off the net area hides the cost of the wastage,
 * which is exactly the number the customer needs to see.
 */
export function calculate(input: CalculatorInput): CalculatorResult {
  const { roomLengthFt, roomWidthFt, wastagePct, product } = input;

  const netAreaSqft = round2(roomLengthFt * roomWidthFt);
  const totalAreaSqft = round2(netAreaSqft * (1 + wastagePct / 100));

  // MOQ is a floor: take the larger of what the area needs and the minimum.
  const boxesRequired = Math.max(boxesFor(totalAreaSqft, product.boxAreaSqft), product.moqBoxes);

  const tilesRequired = Math.ceil((totalAreaSqft / product.boxAreaSqft) * product.tilesPerBox);
  const estimatedCostInr = boxesRequired * product.pricePerBoxInr;

  const unitCostSqft =
    totalAreaSqft > 0
      ? round2(estimatedCostInr / totalAreaSqft)
      : 0;

  return {
    netAreaSqft,
    totalAreaSqft,
    boxesRequired,
    tilesRequired,
    estimatedCostInr,
    unitCostSqft,
  };
}
