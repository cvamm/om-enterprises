import type { Origin } from "@/types";

/**
 * ────────────────────────────────────────────────────────────────────────────
 * LOCAL DEVELOPMENT ONLY. DO NOT SHIP.
 *
 * Origin stand-ins so `/origins` and `/origins/[origin]` are navigable before
 * the shop's real sourcing list exists. The state names are real geography —
 * Rajasthan, Tamil Nadu and Gujarat genuinely are the sourcing states for
 * this trade — but the descriptions are written as placeholders, not as claims
 * about any real quarry or supplier.
 *
 * The ids are stable so the sample products can reference them.
 * ────────────────────────────────────────────────────────────────────────────
 */

const SAMPLE = "[SAMPLE — replace before deploy]";

export const SAMPLE_ORIGINS: Origin[] = [
  {
    id: "00000000-0000-4000-8000-000000000001",
    state: "rajasthan",
    name: "Rajasthan " + SAMPLE,
    description:
      "Sandstone and limestone, cut and dressed by hand. Rajasthan's quarries " +
      "supply most of the natural stone that reaches Kanpur, and the material " +
      "arrives in the sizes a builder actually wants rather than in factory " +
      "standard sheets. " + SAMPLE,
    primaryRegions: ["Jaisalmer", "Jodhpur", "Dausa"],
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "00000000-0000-4000-8000-000000000002",
    state: "tamil-nadu",
    name: "Tamil Nadu " + SAMPLE,
    description:
      "Granite and engineered quartz, mostly through Coimbatore's machinery. " +
      "Consistent batches, dense colour, and the reliability a kitchen " +
      "worktop needs. " + SAMPLE,
    primaryRegions: ["Coimbatore", "Madurai", "Tiruchirappalli"],
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "00000000-0000-4000-8000-000000000003",
    state: "gujarat",
    name: "Gujarat " + SAMPLE,
    description:
      "The largest tile manufacturing cluster in India. Vitrified, porcelain " +
      "and mosaic come out of Gujarat at volume, which is why most of the " +
      "engineered formats are sourced here. " + SAMPLE,
    primaryRegions: ["North Gujarat", "Rajkot", "Surat"],
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "00000000-0000-4000-8000-000000000004",
    state: "other",
    name: "Other sources " + SAMPLE,
    description:
      "Material from outside the main sourcing states, held here so the " +
      "catalogue has somewhere to put a one-off. " + SAMPLE,
    primaryRegions: [],
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
];