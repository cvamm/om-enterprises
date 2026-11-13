import type { Metadata } from "next";
import { CATEGORIES } from "@/lib/utils/category-photos";
import { CategoryPageBody } from "@/components/marketing/CategoryPageBody";

const category = CATEGORIES.granite;

export const metadata: Metadata = {
  title: `${category.name}`,
  description: category.intro,
  alternates: { canonical: `/${category.slug}` },
};

export default function GranitePage() {
  return (
    <CategoryPageBody
      category={category}
      related={[
        CATEGORIES.marbles,
        CATEGORIES.chemicals,
        CATEGORIES["house-finishing"],
      ]}
    />
  );
}
