import type { Metadata } from "next";
import { TilesPageClient } from "@/components/catalogue/TilesPageClient";

export const metadata: Metadata = {
  title: "Vitrified Tiles, Marble & Granite — Kanpur | OM Enterprises",
  description:
    "Browse every vitrified tile, marble, granite and full body tile we stock in Kanpur. Filter by room, material, finish and size. Priced per box with free delivery in Kanpur city.",
  alternates: { canonical: "/tiles" },
};

export default function TilesPage() {
  return <TilesPageClient />;
}
