"use client";

import { useCalculator } from "@/components/calculator/CalculatorShell";

/**
 * Room + product inputs for the calculator.
 *
 * Product options are passed from the page (a server fetch) through
 * CalculatorShell, so no second request hits a phone on mount.
 */

export function AreaCalculator() {
  const {
    input,
    setInput,
    products,
    selectedProductId,
    onProductChange,
  } = useCalculator();

  const lengthValue = input.roomLengthFt > 0 ? input.roomLengthFt : "";
  const widthValue = input.roomWidthFt > 0 ? input.roomWidthFt : "";

  return (
    <div className="space-y-8">
      <Field label="Room length" hint="Feet">
        <input
          type="number"
          inputMode="decimal"
          min={0}
          step={0.1}
          value={lengthValue}
          onChange={(e) =>
            setInput({
              ...input,
              roomLengthFt: e.target.value === "" ? 0 : Number(e.target.value),
            })
          }
          className={inputClass}
          placeholder="e.g. 18"
        />
      </Field>

      <Field label="Room width" hint="Feet">
        <input
          type="number"
          inputMode="decimal"
          min={0}
          step={0.1}
          value={widthValue}
          onChange={(e) =>
            setInput({
              ...input,
              roomWidthFt: e.target.value === "" ? 0 : Number(e.target.value),
            })
          }
          className={inputClass}
          placeholder="e.g. 12"
        />
      </Field>

      <div>
        <div className="flex items-baseline justify-between">
          <Field label="Wastage allowance">
            <span className="sr-only">Wastage</span>
          </Field>
          <span className="text-[13px] tabular-nums text-bone/77">
            {input.wastagePct}%
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={30}
          step={1}
          value={input.wastagePct}
          onChange={(e) => setInput({ ...input, wastagePct: Number(e.target.value) })}
          className="mt-4 w-full accent-[#c9a96a]"
          aria-label="Wastage allowance percentage"
        />
        <p className="mt-2 text-[11px] text-bone/72">
          Standard is 10%. Diagonal and herringbone layouts run 15–20% —
          raise the slider if you are doing those.
        </p>
      </div>

      <div>
        <label
          htmlFor="calc-product"
          className="block text-[10px] uppercase tracking-[0.24em] text-bone/73"
        >
          Tile or stone
        </label>
        <select
          id="calc-product"
          value={selectedProductId}
          onChange={onProductChange}
          className={`${inputClass} mt-4 appearance-none`}
        >
          <option value="" disabled>
            Pick a product
          </option>
          {products.map((product) => (
            <option key={product.id} value={product.id} className="bg-ink-2">
              {product.nameEn} — {formatAreaPerBox(product.boxAreaSqft)}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

function formatAreaPerBox(sqft: number): string {
  return `${sqft} sq.ft / box`;
}

const inputClass =
  "w-full rounded-lg border border-bone/12 bg-transparent px-5 py-4 text-[15px] text-bone " +
  "placeholder:text-bone/68 transition-colors duration-300 hover:border-bone/30 " +
  "focus:border-gold/60 focus:outline-none";

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-[10px] uppercase tracking-[0.24em] text-bone/73">
          {label}
        </span>
        {hint !== undefined && (
          <span className="text-[10px] uppercase tracking-[0.24em] text-bone/68">
            {hint}
          </span>
        )}
      </div>
      <div className="mt-3">{children}</div>
    </div>
  );
}