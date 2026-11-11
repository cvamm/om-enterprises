"use client";

import { useCalculator } from "@/components/calculator/CalculatorShell";
import { buildCalculatorWhatsAppLink } from "@/lib/utils/whatsapp";
import { formatInr } from "@/lib/utils/pricing";

/**
 * Calculator result panel.
 *
 * Renders the live estimate as the user types, and hands off to WhatsApp
 * with the full worked figures pre-filled — the exact message format from
 * §8 feature 1, so the shop receives everything it needs to sanity-check
 * and respond without a single follow-up question.
 *
 * The button is disabled until a product is selected. A customer who has
 * not picked a tile has not earned a "send" yet.
 */
export function ResultHandoff() {
  const { estimate, product, input } = useCalculator();

  const hasDimensions = input.roomLengthFt > 0 && input.roomWidthFt > 0;
  const canSend = hasDimensions && product !== null && estimate !== null;

  const whatsappLink =
    canSend && product !== null && estimate !== null
      ? buildCalculatorWhatsAppLink({
          productName: product.nameEn,
          boxPriceInr: product.pricePerBoxInr,
          boxAreaSqft: product.boxAreaSqft,
          roomLengthFt: input.roomLengthFt,
          roomWidthFt: input.roomWidthFt,
          netAreaSqft: estimate.netAreaSqft,
          totalAreaSqft: estimate.totalAreaSqft,
          boxesRequired: estimate.boxesRequired,
          estimatedCostInr: estimate.estimatedCostInr,
          wastagePct: input.wastagePct,
        })
      : null;

  if (product === null) {
    return <EmptyProduct />;
  }

  if (estimate === null) {
    return (
      <div className="rounded-2xl border border-bone/10 bg-ink p-7 md:p-9">
        <p className="text-[15px] leading-relaxed text-bone/77">
          Enter the room&apos;s dimensions to see the estimate.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gold/40 bg-ink p-7 md:p-9">
      <div className="grid gap-8">
        <ResultRow
          label="Net area"
          value={`${estimate.netAreaSqft} sq.ft`}
        />
        <ResultRow
          label={`Total with ${input.wastagePct}% wastage`}
          value={`${estimate.totalAreaSqft} sq.ft`}
        />
        <ResultRow
          label="Boxes required"
          value={String(estimate.boxesRequired)}
          note={
            estimate.boxesRequired === product.moqBoxes &&
            estimate.boxesRequired > 1
              ? "minimum order quantity"
              : undefined
          }
        />
        <ResultRow
          label="Tiles required"
          value={String(estimate.tilesRequired)}
        />
        <ResultRow
          label="Estimated tile cost"
          value={formatInr(estimate.estimatedCostInr)}
          primary
        />
        <ResultRow
          label="Cost per sq.ft"
          value={formatInr(estimate.unitCostSqft)}
          note="including wastage"
        />
      </div>

      <a
        href={canSend && whatsappLink !== null ? whatsappLink : undefined}
        target="_blank"
        rel="noopener noreferrer"
        aria-disabled={!canSend}
        onClick={(event) => { if (!canSend) event.preventDefault(); }}
        className={
          "mt-10 flex w-full items-center justify-center rounded-full bg-[#c9a96a] px-6 py-4 " +
          "text-[11px] uppercase tracking-[0.24em] text-black transition-colors duration-300 hover:bg-ink " +
          (canSend ? "" : "pointer-events-none opacity-40")
        }
      >
        Send estimate to WhatsApp
      </a>

      <p className="mt-4 text-[11px] leading-relaxed text-bone/72">
        This is an estimate for planning, not a quote. Final pricing and
        stock are confirmed by us before you order.
      </p>
    </div>
  );
}

function EmptyProduct() {
  return (
    <div className="rounded-2xl border border-bone/10 bg-ink p-7 md:p-9">
      <p className="text-[15px] leading-relaxed text-bone/77">
        Pick a tile to see an estimate for it.
      </p>
      <p className="mt-3 text-[12px] leading-relaxed text-bone/72">
        The estimate includes the box price, the minimum order quantity, and
        your wastage allowance.
      </p>
    </div>
  );
}

function ResultRow({
  label,
  value,
  note,
  primary,
}: {
  label: string;
  value: string;
  note?: string;
  primary?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-6">
      <span className="text-[10px] uppercase tracking-[0.24em] text-bone/73">
        {label}
      </span>
      <span className="text-right">
        <span
          className={
            primary === true
              ? "font-display text-3xl leading-none text-bone"
              : "text-[15px] tabular-nums text-bone"
          }
        >
          {value}
        </span>
        {note !== undefined ? (
          <span className="mt-1 block text-[10px] text-bone/70">{note}</span>
        ) : null}
      </span>
    </div>
  );
}