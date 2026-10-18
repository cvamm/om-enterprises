/**
 * WhatsApp deep links.
 *
 * §7.5: Phase 1 uses `wa.me/<number>?text=<urlencoded>` — no Meta Business
 * account, no Cloud API credentials, no approval. That is the right call for
 * a shop whose enquiries already arrive by WhatsApp: the customer taps, the
 * app opens with the message typed out, and nothing needs to be configured
 * server-side.
 *
 * What this deliberately does NOT do: claim to have sent anything. A link
 * builder opens a conversation the customer chooses to send. The copy says
 * "send", never "sent".
 */

import { formatInr } from "@/lib/utils/pricing";

/** wa.me expects digits only, country code first, no '+' or spaces. */
export function normaliseNumber(input: string): string | null {
  const digits = input.replace(/\D/g, "");
  // An Indian mobile with the country code is 12 digits: 91 + 10.
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) return digits;
  return null;
}

/**
 * Build a wa.me link.
 *
 * Returns null when the message is empty or the number is unusable, so a
 * caller renders a disabled button rather than a link that opens WhatsApp
 * with nothing in it.
 */
export function buildWhatsAppLink(number: string, message: string): string | null {
  const normalised = normaliseNumber(number);
  if (normalised === null || message.trim() === "") return null;
  return `https://wa.me/${normalised}?text=${encodeURIComponent(message)}`;
}

export type QuoteRequest = {
  productName: string;
  boxPriceInr: number;
  boxAreaSqft: number;
  boxes: number;
  /** Optional second line: the room this is for. */
  note?: string;
};

/**
 * The message a shop actually wants to receive: what, how much, at what
 * price, and where. Everything on one screen so it can be answered without
 * scrolling back.
 *
 * Prices use lakh grouping because that is how the shop quotes.
 */
export function formatQuoteMessage(request: QuoteRequest): string {
  const total = request.boxPriceInr * request.boxes;
  const lines = [
    `Hello, I would like a quote for ${request.productName}.`,
    "",
    `Boxes needed: ${request.boxes}`,
    `Price per box: ${formatInr(request.boxPriceInr)}`,
    `Coverage per box: ${request.boxAreaSqft} sq.ft`,
    `Total coverage: ${(request.boxPriceInr > 0
      ? Math.round((request.boxes * request.boxAreaSqft) * 100) / 100
      : 0).toFixed(2)} sq.ft`,
    `Estimated tile cost: ${formatInr(total)}`,
  ];

  if (request.note !== undefined && request.note.trim() !== "") {
    lines.push("", request.note.trim());
  }

  return lines.join("\n");
}

export function buildWhatsAppQuoteLink(request: QuoteRequest): string {
  return (
    buildWhatsAppLink(
      process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "919999999999",
      formatQuoteMessage(request),
    ) ?? "https://wa.me/"
  );
}

/** Calculator hand-off: the full worked figures, so the shop can sanity-check. */
export type CalculatorHandoff = {
  productName: string;
  boxPriceInr: number;
  boxAreaSqft: number;
  roomLengthFt: number;
  roomWidthFt: number;
  netAreaSqft: number;
  totalAreaSqft: number;
  boxesRequired: number;
  estimatedCostInr: number;
  wastagePct: number;
  locality?: string;
};

export function formatCalculatorMessage(h: CalculatorHandoff): string {
  const lines = [
    `Hello, I ran the tile calculator on your site.`,
    "",
    `Product: ${h.productName}`,
    `Room: ${h.roomLengthFt} ft x ${h.roomWidthFt} ft`,
    `Net area: ${h.netAreaSqft.toFixed(2)} sq.ft`,
    `With ${h.wastagePct}% wastage: ${h.totalAreaSqft.toFixed(2)} sq.ft`,
    `Boxes required: ${h.boxesRequired}`,
    `Price per box: ${formatInr(h.boxPriceInr)}`,
    `Estimated tile cost: ${formatInr(h.estimatedCostInr)}`,
  ];

  if (h.locality !== undefined && h.locality.trim() !== "") {
    lines.push(`Area: ${h.locality.trim()}`);
  }

  return lines.join("\n");
}

export function buildCalculatorWhatsAppLink(h: CalculatorHandoff): string {
  return (
    buildWhatsAppLink(
      process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "919999999999",
      formatCalculatorMessage(h),
    ) ?? "https://wa.me/"
  );
}

/** Tile Lab hand-off: the mock-up as a specification, not a screenshot. */
export type TileLabHandoff = {
  surfaceName: string;
  format: string;
  bond: string;
  groutShade: string;
  groutWidthMm: number;
  glossLevel: number;
  areaSqft?: number;
};

export function formatTileLabMessage(h: TileLabHandoff): string {
  const lines = [
    `Hello, I designed a tile layout on your site.`,
    "",
    `Surface: ${h.surfaceName}`,
    `Format: ${h.format}`,
    `Bond pattern: ${h.bond}`,
    `Grout shade: ${h.groutShade}`,
    `Grout width: ${h.groutWidthMm} mm`,
    `Gloss level: ${h.glossLevel}%`,
  ];

  if (h.areaSqft !== undefined) {
    lines.push(`Approximate area: ${h.areaSqft} sq.ft`);
  }

  return lines.join("\n");
}

export function buildTileLabWhatsAppLink(h: TileLabHandoff): string {
  return (
    buildWhatsAppLink(
      process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "919999999999",
      formatTileLabMessage(h),
    ) ?? "https://wa.me/"
  );
}