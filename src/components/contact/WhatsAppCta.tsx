"use client";

import { useState, useContext } from "react";
import { CalculatorContext } from "@/components/calculator/CalculatorShell";
import { buildCalculatorWhatsAppLink } from "@/lib/utils/whatsapp";

type CalcCtx =
  | {
      input: { roomLengthFt: number; roomWidthFt: number; wastagePct: number };
      product:
        | { nameEn: string; boxPriceInr: number; boxAreaSqft: number; moqBoxes: number }
        | null;
      estimate:
        | {
            netAreaSqft: number;
            totalAreaSqft: number;
            boxesRequired: number;
            estimatedCostInr: number;
          }
        | null;
    }
  | null;

/**
 * WhatsApp hand-off from the contact or product page.
 *
 * If the calculator has already been run (context present, estimate in
 * scope) the button carries the full worked figures into the message —
 * the §8 feature 1 hand-off. Otherwise it opens a plain conversation.
 *
 * The safe context read here means this component works on the contact
 * page without a crash and upgrades automatically on the calculator page.
 */
export function WhatsAppCta() {
  const [showPlain, setShowPlain] = useState(false);

  const ctx = useContext(CalculatorContext) as CalcCtx | null;

  const hasEstimate =
    ctx !== null &&
    ctx.estimate !== null &&
    ctx.product !== null &&
    ctx.input.roomLengthFt > 0;

  const estimateLink =
    hasEstimate && ctx !== null && ctx.estimate !== null && ctx.product !== null
      ? buildCalculatorWhatsAppLink({
          productName: ctx.product.nameEn,
          boxPriceInr: ctx.product.boxPriceInr,
          boxAreaSqft: ctx.product.boxAreaSqft,
          roomLengthFt: ctx.input.roomLengthFt,
          roomWidthFt: ctx.input.roomWidthFt,
          netAreaSqft: ctx.estimate.netAreaSqft,
          totalAreaSqft: ctx.estimate.totalAreaSqft,
          boxesRequired: ctx.estimate.boxesRequired,
          estimatedCostInr: ctx.estimate.estimatedCostInr,
          wastagePct: ctx.input.wastagePct,
        })
      : null;

  const plainLink =
    "https://wa.me/" +
    (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "") +
    "?text=" +
    encodeURIComponent(
      "Hi — I would like to talk about a tile or stone project. Here is what I am fitting:",
    );

  return (
    <div className="mt-6">
      {hasEstimate && estimateLink !== null ? (
        <a
          href={estimateLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center rounded-full bg-[#c9a96a] px-6 py-4
                     text-[11px] uppercase tracking-[0.24em] text-black transition-colors
                     duration-300 hover:bg-ink"
        >
          Send estimate to WhatsApp
        </a>
      ) : showPlain ? (
        <a
          href={plainLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center rounded-full bg-[#c9a96a] px-6 py-4
                     text-[11px] uppercase tracking-[0.24em] text-black transition-colors
                     duration-300 hover:bg-ink"
        >
          Start a conversation on WhatsApp
        </a>
      ) : (
        <button
          type="button"
          onClick={() => setShowPlain(true)}
          className="flex w-full items-center justify-center rounded-full border border-gold/60 px-6 py-4
                     text-[11px] uppercase tracking-[0.24em] text-gold transition-colors
                     duration-300 hover:bg-[#c9a96a] hover:text-black"
        >
          Start a conversation on WhatsApp
        </button>
      )}
      <p className="mt-3 text-[12px] leading-relaxed text-bone/72">
        {hasEstimate
          ? "Opens WhatsApp with your worked figures already in the message. No need to type them out."
          : "Run the calculator first and this button will carry your full estimate in the message, so the shop has everything it needs on the first reply."}
      </p>
    </div>
  );
}