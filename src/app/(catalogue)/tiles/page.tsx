import type { Metadata } from "next";
import { TilesPageClient } from "@/components/catalogue/TilesPageClient";

export const metadata: Metadata = {
  title: "Tile catalogue",
  description:
    "Every tile and stone we stock, priced per box. Filter by room, material, " +
    "finish and size.",
  alternates: { canonical: "/tiles" },
};

export default function TilesPage() {
  return <TilesPageClient />;
}
