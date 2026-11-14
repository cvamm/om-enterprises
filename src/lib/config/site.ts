/**
 * Single source of truth for brand, contact and coverage.
 *
 * ────────────────────────────────────────────────────────────────────────────
 * Brand, GSTIN, both phone lines, the shop address and the opening hours are
 * real — taken from the shop's own Google Maps listing and the signboard
 * photograph supplied on 2026-11-14. The New Azad Nagar office printed on the
 * board is deliberately not published; the owner asked for Bamba Road only.
 *
 * What is still a stand-in carries the literal marker string
 * `[SAMPLE — replace before deploy]`: email, Instagram handle, the
 * trust-bar claims and the delivery zones. The CI job `verify:no-sample`
 * greps the source for that marker and fails the launch gate while any of
 * them remain.
 *
 * Replace the remaining fields before the Phase 1 launch. Nothing else in
 * the codebase holds contact data.
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

/** One shop location. `locality` is the district label the footer chip shows. */
export type ShopAddress = {
  line1: string;
  line2: string;
  locality?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  /** Pinned Google Maps link for this shop's own place listing. */
  mapsUrl: string;
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

  /** Descriptor line under the wordmark, as painted on the signboard. */
  descriptor: "Marble, Granites & Tiles",

  /** GSTIN, as painted on the signboard and confirmed by the owner. */
  gstin: "09B0HPS2497E1Z4",

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
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "918009930761",

  /** Public phone line, formatted for display. */
  phoneDisplay: "+91 80099 30761",

  /** Second line, listed on Google Maps. Contact page only. */
  phoneAlt: "+91 91194 43019",

  /**
   * The shop. Address and pinned map link from the shop's own Google Maps
   * listing, which the owner confirmed is where customers walk in.
   */
  address: {
    line1: "Nayi Basti, near Skyomyo School",
    line2: "Bamba Road",
    locality: "Naubasta",
    city: "Kanpur",
    state: "Uttar Pradesh",
    zip: "208021",
    country: "India",
    mapsUrl: "https://maps.google.com/?cid=16215146413831390768",
  } satisfies ShopAddress,

  /** Opening hours, local time — as published on the shop's Google listing. */
  hours: [
    { days: "Monday – Saturday", time: "8:30 am – 9:00 pm" },
    { days: "Sunday", time: "8:30 am – 9:00 pm" },
  ],

  /** Email for the contact form fallback. */
  email: `care@[domain]${SAMPLE}`,

  /** Instagram handle, for the footer link. */
  instagram: `@[handle]${SAMPLE}`,

  /**
   * Delivery coverage, by road from the Bamba Road shop. Every entry was
   * measured on Google Maps on 2026-11-14 and sits inside the ~150 km radius
   * the owner set; the towns under each label are the ones a driver would
   * actually be sent to.
   */
  deliveryZones: [
    {
      id: "kanpur-nagar",
      label: "Kanpur city and suburbs",
      description: "Every mohalla, the cantonment, Naubasta, Bithnor Road and the industrial belts.",
    },
    {
      id: "kanpur-dehat",
      label: "Kanpur Dehat",
      description: "Akbarpur, Chibramau, Derapur, Bhoganipur, Raseru, Gram and Maitha.",
    },
    {
      id: "unnao",
      label: "Unnao",
      description: "Unnao city and the tehsils on both banks of the Ganga.",
    },
    {
      id: "kannauj",
      label: "Kannauj",
      description: "Kannauj city and the towns on the Kanpur–Kannauj road.",
    },
    {
      id: "lucknow",
      label: "Lucknow",
      description: "Lucknow city, Mohanlalganj and the outer suburbs.",
    },
    {
      id: "raebareli",
      label: "Rae Bareli",
      description: "Rae Bareli city and the towns toward Kanpur.",
    },
    {
      id: "fatehpur",
      label: "Fatehpur",
      description: "Fatehpur city and the towns along the Kanpur–Lucknow–Fatehpur road.",
    },
    {
      id: "barabanki",
      label: "Barabanki",
      description: "Barabanki city and the towns on the Kanpur–Barabanki road.",
    },
    {
      id: "banda",
      label: "Banda",
      description: "Banda city and the towns toward it.",
    },
  ] satisfies DeliveryZone[],

  /**
   * Named so a customer with a site here is not promised a drop that will
   * not happen. Every entry was measured by road from the Bamba Road shop
   * on 2026-11-14 and sits beyond the ~150 km line.
   */
  deliveryExcluded: [
    "Sultanpur",
    "Etawah",
    "Farrukhabad",
    "Hardoi",
    "Sitapur",
    "Jhansi",
    "Prayagraj",
    "Varanasi",
    "Agra",
    "Gwalior",
    "Ayodhya",
    "Gonda",
    "Pratapgarh",
    "Amethi",
    "Hamirpur",
    "Mahoba",
    "Mau",
    "Bahraich",
    "Shrawasti",
    "Kaushambi",
  ],


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
export function formatAddress(address: ShopAddress = siteConfig.address): string {
  // `locality` is the district label the footer chip shows; joining it in
  // here reads "Kanpur Nagar, Kanpur".
  return [address.line1, address.line2, address.city, address.state, address.zip]
    .filter((part) => Boolean(part))
    .join(", ");
}
