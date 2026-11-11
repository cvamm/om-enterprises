/**
 * Single source of truth for brand, contact and coverage.
 *
 * ────────────────────────────────────────────────────────────────────────────
 * NOTHING IN THIS FILE IS REAL.
 *
 * The values are development stand-ins. Two categories:
 *
 *   1. Verifiable facts (name, address, phone, email, hours, warranty,
 *      delivery zones). These carry the literal marker string
 *      `[SAMPLE — replace before deploy]`. The CI job `verify:no-sample`
 *      greps the source for that marker and fails the launch gate while any
 *      of them remain.
 *
 *   2. Fictional-but-plausible brand strings. The shop's real name does not
 *      exist yet, so the dev site needs a coherent stand-in that does not
 *      collide with any live brand. The marker is attached so the boundary is
 *      never mistaken for a decision that was made.
 *
 * Replace this file with real details before the Phase 1 launch. Nothing
 * else in the codebase holds contact data.
 * ────────────────────────────────────────────────────────────────────────────
 */

/** The literal marker the CI job greps for. Do not rename it. */
const SAMPLE = "[SAMPLE — replace before deploy]" as const;

/**
 * Real brand, taken from the shop's signboard: "OM ENTERPRISES (Marble &
 * Granites)". Kept clean of the marker string so the wordmark renders as a
 * wordmark; the marker rides alongside it via `brandSample` and `SampleTag`
 * so it stays visible in the UI and greppable by CI.
 */
const BRAND = "OM ENTERPRISES" as const;

export type DeliveryZone = {
  id: string;
  label: string;
  description: string;
};

export const siteConfig = {
  /** Brand name shown in the mark, title tag and footer. */
  name: BRAND,

  /**
   * The marker string, exported so any surface that renders the brand name
   * can pair it with a `SampleTag` in one move. Clean `name` + visible
   * marker beats a marker glued onto the wordmark, which renders as a
   * run-on and reads like a typo rather than a warning.
   */
  brandSample: SAMPLE,

  /** Registered trade name, for the footer copyright line. */
  legalName: BRAND,

  /**
   * Tagline used where one line is needed. Editorial positioning, not a
   * verifiable fact, so it carries no sample marker — but confirm the
   * sourcing claims against the actual supplier list before launch.
   */
  tagline: "Tiles and natural stone, sourced across India",

  /** Meta description. Not verifiable, so it carries no marker. */
  description:
    "A Kanpur, Uttar Pradesh tiles and natural stone shop. Glazed vitrified, full body, marble look and natural stone sourced state by state, with every box traceable to its origin quarry.",

  /** Canonical URL, no trailing slash. */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.invalid",

  /** Digits only, country code first, no `+`. */
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "910000000000",

  /** Public phone line, formatted for display. */
  phoneDisplay: `+91 00000 00000${SAMPLE}`,

  /** Store front address. Every part is a placeholder. */
  address: {
    line1: `Main Market Road${SAMPLE}`,
    line2: `Lane [NUMBER]${SAMPLE}`,
    locality: `Kanpur Nagar${SAMPLE}`,
    city: "Kanpur",
    state: "Uttar Pradesh",
    zip: `208[000]${SAMPLE}`,
    country: "India",
  },

  /** Opening hours, local time. */
  hours: [
    { days: `Monday – Saturday${SAMPLE}`, time: `11:00 – 21:00${SAMPLE}` },
    { days: `Sunday${SAMPLE}`, time: `11:00 – 20:00${SAMPLE}` },
  ],

  /** Email for the contact form fallback. */
  email: `care@[domain]${SAMPLE}`,

  /** Instagram handle, for the footer link. */
  instagram: `@[handle]${SAMPLE}`,

  /**
   * Kanpur delivery coverage. Open question #7 was left unanswered, so this
   * is an explicit placeholder set — confirm Nagar vs Dehat before launch.
   */
  deliveryZones: [
    {
      id: "kanpur-nagar",
      label: `Kanpur Nagar${SAMPLE}`,
      description: `Primary delivery zone${SAMPLE}`,
    },
    {
      id: "kanpur-dehat",
      label: `Kanpur Dehat${SAMPLE}`,
      description: `Extended zone, quote on request${SAMPLE}`,
    },
  ] satisfies DeliveryZone[],

  /** Default wastage allowance, as a percentage. */
  defaultWastagePct: 10,

  /** Wastage by bond pattern, used by the calculator. */
  wastageByBond: {
    stacked: 10,
    brick: 12,
    diagonal: 15,
    herringbone: 20,
  } as const,

  /**
   * Claims shown on the home page trust bar. These are real promises a
   * customer can hold the shop to, so each one is a placeholder until
   * confirmed against the actual warranty terms and supplier paperwork.
   */
  claims: [
    {
      label: `10-year surface warranty${SAMPLE}`,
      detail: `Glaze and body defects covered from installation${SAMPLE}`,
    },
    {
      label: `Verified suppliers only${SAMPLE}`,
      detail: `Quarried batches carry a certificate we hold on file${SAMPLE}`,
    },
    {
      label: `Every box traceable${SAMPLE}`,
      detail: `Origin states recorded batch by batch, back to the quarry${SAMPLE}`,
    },
    {
      label: `Kanpur on the shop floor${SAMPLE}`,
      detail: `Lay a sample on your palm and decide in person${SAMPLE}`,
    },
  ],
} as const;

export type SiteConfig = typeof siteConfig;

/** WhatsApp deep link. No Meta API credentials — just a `wa.me` link. */
export function buildWhatsAppUrl(message: string): string {
  return `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

/** Full address as one line, for schema.org and the footer. */
export function formatAddress(): string {
  const { address } = siteConfig;
  return [address.line1, address.line2, address.locality, address.city, address.state, address.zip]
    .filter((part) => Boolean(part))
    .join(", ");
}
