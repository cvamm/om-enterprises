import type { Product } from "@/types";

/**
 * Spec table.
 *
 * Every value comes from the database. Nothing here is a marketing claim —
 * the table is the reason a contractor picks one product over another, and a
 * fabricated number is worse than a missing row.
 *
 * Where a figure is derived rather than stored (per sq ft, tiles per sq ft)
 * it is labelled as derived, so nobody mistakes it for a factory
 * specification.
 */
export function SpecTable({ product }: { product: Product }) {
  const derived = deriveRows(product);

  return (
    <dl
      className="mt-10 grid gap-x-10 gap-y-0 sm:grid-cols-2"
      data-testid="spec-table"
    >
      {derived.map((row) => (
        <div
          key={row.label}
          className="flex items-baseline justify-between gap-6 border-b border-bone/10 py-4"
        >
          <dt className="text-[10px] uppercase tracking-[0.24em] text-bone/73">
            {row.label}
          </dt>
          <dd className="text-right text-[14px] text-bone">
            {row.value}
            {row.note !== undefined && (
              <span className="mt-1 block text-[10px] normal-case tracking-normal text-bone/70">
                {row.note}
              </span>
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}

type Row = { label: string; value: string; note?: string };

function deriveRows(product: Product): Row[] {
  const rows: Row[] = [
    {
      label: "Material",
      value: product.materialType.replace(/-/g, " "),
    },
    { label: "Finish", value: product.finish },
    { label: "Shape", value: product.shape.replace(/-/g, " ") },
    {
      label: "Nominal size",
      value: `${product.dimensionsMm[0]} × ${product.dimensionsMm[1]} mm`,
    },
    {
      label: "Thickness",
      value: `${product.dimensionsMm[2]} mm`,
    },
    {
      label: "Coverage per box",
      value: `${product.boxAreaSqft} sq.ft`,
    },
    {
      label: "Pieces per box",
      value: String(product.tilesPerBox),
    },
    {
      label: "Price per sq.ft",
      value: inr(product.pricePerBoxInr / product.boxAreaSqft),
      note: "derived from the box price",
    },
    {
      label: "Pieces per sq.ft",
      value: (product.tilesPerBox / product.boxAreaSqft).toFixed(2),
      note: "derived",
    },
    {
      label: "Minimum order",
      value: product.moqBoxes > 1 ? `${product.moqBoxes} boxes` : "1 box",
    },
    { label: "Grade", value: product.grade.toUpperCase() },
  ];

  if (product.roomUses.length > 0) {
    rows.push({
      label: "Recommended for",
      value: product.roomUses.map((r) => r.replace(/-/g, " ")).join(", "),
    });
  }

  return rows;
}

function inr(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}