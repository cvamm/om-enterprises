"use client";

import { useCallback, useMemo, useState } from "react";
import { calculate, DEFAULT_WASTAGE_PCT, type CalculatorInput, type CalculatorResult } from "@/lib/utils/calculator";
import type { Product } from "@/types";

/**
 * Calculator state, shared between the input panel and the result panel.
 *
 * The estimate is recomputed on every input change, including while a
 * slider is mid-drag, because that is the moment a customer needs the
 * number to move. The math is a few multiplications and a ceil — it does
 * not need to be debounced.
 *
 * Product options are passed in once from the page, not fetched by the
 * hook, so the page controls the request and the hook only owns state.
 */
export function useCalculator(products: Product[]) {
  const [roomLengthFt, setRoomLengthFt] = useState<number>(0);
  const [roomWidthFt, setRoomWidthFt] = useState<number>(0);
  const [wastagePct, setWastagePct] = useState<number>(DEFAULT_WASTAGE_PCT);
  const [selectedProductId, setSelectedProductId] = useState<string>("");

  const product = useMemo(
    () => products.find((p) => p.id === selectedProductId) ?? null,
    [products, selectedProductId],
  );

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

  return {
    input: { roomLengthFt, roomWidthFt, wastagePct },
    products,
    product,
    estimate,
    selectedProductId,
    onProductChange: useCallback(
      (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedProductId(event.target.value);
      },
      [],
    ),
    setInput: (next: { roomLengthFt: number; roomWidthFt: number; wastagePct: number }) => {
      setRoomLengthFt(next.roomLengthFt);
      setRoomWidthFt(next.roomWidthFt);
      setWastagePct(next.wastagePct);
    },
  };
}