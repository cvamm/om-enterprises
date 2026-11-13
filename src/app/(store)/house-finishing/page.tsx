import type { Metadata } from "next";
import { CATEGORIES } from "@/lib/utils/category-photos";
import { CategoryPageBody } from "@/components/marketing/CategoryPageBody";

const category = CATEGORIES["house-finishing"];

export const metadata: Metadata = {
  title: `${category.name}`,
  description: category.intro,
  alternates: { canonical: `/${category.slug}` },
};

export default function HouseFinishingPage() {
  return (
    <CategoryPageBody
      category={category}
      related={[
        CATEGORIES.marbles,
        CATEGORIES.granite,
        CATEGORIES.chemicals,
      ]}
    />
  );
}
