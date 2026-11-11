"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { calculate, DEFAULT_WASTAGE_PCT, type CalculatorInput, type CalculatorResult } from "@/lib/utils/calculator";
import { AreaCalculator } from "@/components/calculator/AreaCalculator";
import { ResultHandoff } from "@/components/calculator/ResultHandoff";
import type { Product } from "@/types";

/**
 * Client boundary for the calculator.
 *
 * Owns all calculator state — room dimensions, wastage, selected product,
 * and the derived estimate — and hands it to the two panels through
 * context. The page stays a Server Component; this is the only client
 * chunk on the route, so a phone loads exactly one bundle for the whole
 * calculator experience.
 *
 * `products` is fetched server-side and passed in as a prop. A fetch in
 * the hook would mean a second request to the same data the page already
 * has, which is a round trip a Moto G does not need.
 */
export function CalculatorShell({ products }: { products: Product[] }) {
  const [roomLengthFt, setRoomLengthFt] = useState<number>(0);
  const [roomWidthFt, setRoomWidthFt] = useState<number>(0);
  const [wastagePct, setWastagePct] = useState<number>(DEFAULT_WASTAGE_PCT);
  const [selectedProductId, setSelectedProductId] = useState<string>("");

  const product = useMemo(
    () => products.find((p) => p.id === selectedProductId) ?? null,
    [products, selectedProductId],
  );

  // Recalculated on every input change, including slider drags. The math is
  // a few multiplications and a ceil, which is cheap; the cost is the React
  // re-render, and that is bounded to two panels, not a large grid.
  const estimate: CalculatorResult | null = useMemo(() => {
    if (product === null || roomLengthFt <= 0 || roomWidthFt <= 0) return null;

    const input: CalculatorInput = {
      roomLengthFt,
      roomWidthFt,
      wastagePct,
      product: {
        boxAreaSqft: product.boxAreaSqft,
        pricePerBoxInr: product.pricePerBoxInr,
        tilesPerBox: product.tilesPerBox,
        moqBoxes: product.moqBoxes,
      },
    };

    return calculate(input);
  }, [product, roomLengthFt, roomWidthFt, wastagePct]);

  const setInput = useCallback((next: { roomLengthFt: number; roomWidthFt: number; wastagePct: number }) => {
    setRoomLengthFt(next.roomLengthFt);
    setRoomWidthFt(next.roomWidthFt);
    setWastagePct(next.wastagePct);
  }, []);

  const onProductChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      setSelectedProductId(event.target.value);
    },
    [],
  );

  const value = useMemo(
    () => ({
      input: { roomLengthFt, roomWidthFt, wastagePct },
      products,
      product,
      estimate,
      selectedProductId,
      onProductChange,
      setInput,
    }),
    [roomLengthFt, roomWidthFt, wastagePct, products, product, estimate, selectedProductId, onProductChange, setInput],
  );

  return (
    <CalculatorContext.Provider value={value}>
      <div className="grid gap-10 lg:grid-cols-[420px_1fr] lg:gap-14">
        <div>
          <h2 className="text-[10px] uppercase tracking-[0.45em] text-gold">
            YOUR ROOM
          </h2>
          <div className="mt-8">
            <AreaCalculator />
          </div>
        </div>

        <div>
          <h2 className="text-[10px] uppercase tracking-[0.45em] text-gold">
            ESTIMATE
          </h2>
          <div className="mt-8">
            <ResultHandoff />
          </div>
        </div>
      </div>
    </CalculatorContext.Provider>
  );
}

// ── Context ────────────────────────────────────────────────────────────────

type CalculatorState = {
  input: { roomLengthFt: number; roomWidthFt: number; wastagePct: number };
  products: Product[];
  product: Product | null;
  estimate: CalculatorResult | null;
  selectedProductId: string;
  onProductChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  setInput: (next: { roomLengthFt: number; roomWidthFt: number; wastagePct: number }) => void;
};

export const CalculatorContext = createContext<CalculatorState | null>(null);

/** Access the shared calculator state. Must be under CalculatorShell. */
export function useCalculator(): CalculatorState {
  const ctx = useContext(CalculatorContext);
  if (ctx === null) {
    throw new Error("useCalculator must be used inside <CalculatorShell>");
  }
  return ctx;
}
