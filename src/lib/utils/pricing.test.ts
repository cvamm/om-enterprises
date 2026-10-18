import { describe, expect, it } from "vitest";
import {
  derivePricePerSqftInr,
  deriveTilesPerSqft,
  derivePricing,
} from "@/lib/utils/pricing";

const STANDARD = {
  pricePerBoxInr: 1200,
  boxAreaSqft: 15.44,
  tilesPerBox: 4,
  moqBoxes: 1,
} as const;

describe("derivePricePerSqftInr", () => {
  it("divides box price by box area and rounds to 2dp", () => {
    // 1200 / 15.44 = 77.72…
    expect(derivePricePerSqftInr(STANDARD)).toBe(77.72);
  });

  it("returns a clean number when the division is exact", () => {
    const product = { ...STANDARD, pricePerBoxInr: 1000, boxAreaSqft: 10 };
    expect(derivePricePerSqftInr(product)).toBe(100);
  });

  it("returns 0 for a zero-area box rather than Infinity", () => {
    const product = { ...STANDARD, boxAreaSqft: 0 };
    expect(derivePricePerSqftInr(product)).toBe(0);
  });

  it("scales roughly linearly with box price, up to rounding", () => {
    const a = derivePricePerSqftInr({ ...STANDARD, pricePerBoxInr: 1000 });
    const b = derivePricePerSqftInr({ ...STANDARD, pricePerBoxInr: 2000 });
    // Both figures are independently rounded to 2dp, so doubling a rounded
    // value can differ from the rounded double by a hundredth. That is
    // display rounding, not a pricing bug.
    expect(b).toBeCloseTo(a * 2, 1);
  });
});

describe("deriveTilesPerSqft", () => {
  it("divides pieces per box by box area", () => {
    // 4 / 15.44 = 0.259…
    expect(deriveTilesPerSqft(STANDARD)).toBe(0.26);
  });

  it("handles a single-slab box", () => {
    const slab = { ...STANDARD, tilesPerBox: 1, boxAreaSqft: 20 };
    expect(deriveTilesPerSqft(slab)).toBe(0.05);
  });

  it("returns 0 for a zero-area box", () => {
    const product = { ...STANDARD, boxAreaSqft: 0 };
    expect(deriveTilesPerSqft(product)).toBe(0);
  });
});

describe("derivePricing", () => {
  it("returns both figures together", () => {
    expect(derivePricing(STANDARD)).toEqual({
      pricePerSqftInr: 77.72,
      tilesPerSqft: 0.26,
    });
  });
});
