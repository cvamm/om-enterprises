import { describe, expect, it } from "vitest";
import {
  calculate,
  DEFAULT_WASTAGE_PCT,
  WASTAGE_BY_BOND,
} from "@/lib/utils/calculator";

/**
 * Standard test product: a 600×600mm full-body vitrified, 10 pieces per box,
 * each box covering 15.44 sq ft, sold in whole boxes.
 */
const STANDARD = {
  boxAreaSqft: 15.44,
  pricePerBoxInr: 1200,
  tilesPerBox: 4,
  moqBoxes: 1,
} as const;

describe("calculate — area", () => {
  it("multiplies length by width for the net area", () => {
    const r = calculate({ roomLengthFt: 12, roomWidthFt: 10, wastagePct: 10, product: STANDARD });
    expect(r.netAreaSqft).toBe(120);
  });

  it("adds the wastage percentage to the net area", () => {
    const r = calculate({ roomLengthFt: 12, roomWidthFt: 10, wastagePct: 10, product: STANDARD });
    expect(r.totalAreaSqft).toBe(132);
  });

  it("handles 0% wastage as a straight pass-through", () => {
    const r = calculate({ roomLengthFt: 12, roomWidthFt: 10, wastagePct: 0, product: STANDARD });
    expect(r.totalAreaSqft).toBe(120);
  });

  it("handles 30% wastage, the top of the override range", () => {
    const r = calculate({ roomLengthFt: 10, roomWidthFt: 10, wastagePct: 30, product: STANDARD });
    expect(r.netAreaSqft).toBe(100);
    expect(r.totalAreaSqft).toBe(130);
  });

  it("uses 10% by default", () => {
    expect(DEFAULT_WASTAGE_PCT).toBe(10);
  });
});

describe("calculate — boxes required", () => {
  it("rounds up, never down", () => {
    // 120 sq ft net, 10% waste → 132 sq ft. 132 / 15.44 = 8.55 boxes.
    const r = calculate({ roomLengthFt: 12, roomWidthFt: 10, wastagePct: 10, product: STANDARD });
    expect(r.boxesRequired).toBe(9);
  });

  it("rounds up at exactly one box over a whole number of boxes", () => {
    const product = { boxAreaSqft: 10, pricePerBoxInr: 500, tilesPerBox: 5, moqBoxes: 1 };
    // 110 sq ft net → 121 sq ft with waste. 121 / 10 = 12.1 → 13 boxes.
    const r = calculate({ roomLengthFt: 11, roomWidthFt: 10, wastagePct: 10, product });
    expect(r.boxesRequired).toBe(13);
  });

  it("applies MOQ when the area needs fewer boxes", () => {
    const product = { ...STANDARD, moqBoxes: 4 };
    // 10 sq ft needs 1 box; MOQ is 4.
    const r = calculate({ roomLengthFt: 5, roomWidthFt: 2, wastagePct: 0, product });
    expect(r.boxesRequired).toBe(4);
  });

  it("does not reduce a larger requirement down to MOQ", () => {
    const product = { ...STANDARD, moqBoxes: 2 };
    const r = calculate({ roomLengthFt: 20, roomWidthFt: 20, wastagePct: 10, product });
    // 400 sq ft net, 440 total, / 15.44 = 28.5 → 29 boxes. MOQ of 2 is irrelevant.
    expect(r.boxesRequired).toBe(29);
  });
  it("returns zero for a zero-size room", () => {
    const r = calculate({ roomLengthFt: 0, roomWidthFt: 10, wastagePct: 10, product: STANDARD });
    // MOQ still applies even to a zero room — you cannot order zero boxes.
    expect(r.netAreaSqft).toBe(0);
    expect(r.boxesRequired).toBe(STANDARD.moqBoxes);
  });
});

describe("calculate — edge cases from §6", () => {
  it("product with tilesPerBox = 1 (slabs)", () => {
    const slab = { boxAreaSqft: 20, pricePerBoxInr: 9000, tilesPerBox: 1, moqBoxes: 1 };
    const r = calculate({ roomLengthFt: 10, roomWidthFt: 10, wastagePct: 10, product: slab });
    expect(r.totalAreaSqft).toBe(110);
    expect(r.boxesRequired).toBe(6);
    expect(r.tilesRequired).toBe(6);
    expect(r.estimatedCostInr).toBe(54000);
  });

  it("product with boxAreaSqft = 100 (large-format)", () => {
    const largeFormat = { boxAreaSqft: 100, pricePerBoxInr: 24000, tilesPerBox: 2, moqBoxes: 1 };
    const r = calculate({ roomLengthFt: 40, roomWidthFt: 25, wastagePct: 10, product: largeFormat });
    expect(r.netAreaSqft).toBe(1000);
    expect(r.totalAreaSqft).toBe(1100);
    expect(r.boxesRequired).toBe(11);
    expect(r.tilesRequired).toBe(22);
    expect(r.estimatedCostInr).toBe(264000);
  });

  it("large-format below MOQ falls back to one box", () => {
    const largeFormat = { boxAreaSqft: 100, pricePerBoxInr: 24000, tilesPerBox: 2, moqBoxes: 1 };
    // 8 sq ft → 8.8 total → 1 box needed anyway.
    const r = calculate({ roomLengthFt: 4, roomWidthFt: 2, wastagePct: 10, product: largeFormat });
    expect(r.boxesRequired).toBe(1);
  });

  it("a single-tile box with a large room still counts pieces correctly", () => {
    const slab = { boxAreaSqft: 20, pricePerBoxInr: 9000, tilesPerBox: 1, moqBoxes: 1 };
    const r = calculate({ roomLengthFt: 30, roomWidthFt: 20, wastagePct: 20, product: slab });
    // 600 net, 720 total, / 20 = 36 boxes, 36 slabs.
    expect(r.boxesRequired).toBe(36);
    expect(r.tilesRequired).toBe(36);
  });
});

describe("calculate — cost", () => {
  it("multiplies boxes by box price", () => {
    const r = calculate({ roomLengthFt: 12, roomWidthFt: 10, wastagePct: 10, product: STANDARD });
    expect(r.estimatedCostInr).toBe(9 * 1200);
  });

  it("derives unit cost off the total area, waste included", () => {
    const r = calculate({ roomLengthFt: 12, roomWidthFt: 10, wastagePct: 10, product: STANDARD });
    // 10800 / 132 = 81.8181… → 81.82
    expect(r.unitCostSqft).toBe(81.82);
  });

  it("reports zero unit cost for a zero room rather than dividing by zero", () => {
    const r = calculate({ roomLengthFt: 0, roomWidthFt: 0, wastagePct: 10, product: STANDARD });
    expect(r.unitCostSqft).toBe(0);
  });

  it("unit cost rises as wastage rises", () => {
    const low = calculate({ roomLengthFt: 10, roomWidthFt: 10, wastagePct: 5, product: STANDARD });
    const high = calculate({ roomLengthFt: 10, roomWidthFt: 10, wastagePct: 25, product: STANDARD });
    expect(high.unitCostSqft).toBeGreaterThan(low.unitCostSqft);
  });
});

describe("wastage by bond pattern", () => {
  it("matches the values specified in the brief", () => {
    expect(WASTAGE_BY_BOND.stacked).toBe(10);
    expect(WASTAGE_BY_BOND.brick).toBe(12);
    expect(WASTAGE_BY_BOND.diagonal).toBe(15);
    expect(WASTAGE_BY_BOND.herringbone).toBe(20);
  });

  it("increases with layout complexity", () => {
    expect(WASTAGE_BY_BOND.brick).toBeGreaterThan(WASTAGE_BY_BOND.stacked);
    expect(WASTAGE_BY_BOND.diagonal).toBeGreaterThan(WASTAGE_BY_BOND.brick);
    expect(WASTAGE_BY_BOND.herringbone).toBeGreaterThan(WASTAGE_BY_BOND.diagonal);
  });
});
