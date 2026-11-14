import type { Metadata } from "next";
import { CATEGORIES } from "@/lib/utils/category-photos";
import { CategoryPageBody } from "@/components/marketing/CategoryPageBody";

const category = CATEGORIES["tiles-adhesive"];

export const metadata: Metadata = {
  title: `${category.name}`,
  description: category.intro,
  alternates: { canonical: `/${category.slug}` },
};

export default function TilesAdhesivePage() {
  return (
    <CategoryPageBody
      category={category}
      related={[
        CATEGORIES.marbles,
        CATEGORIES.granite,
        CATEGORIES["house-finishing"],
      ]}
    />
  );
}
