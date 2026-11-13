import type { Metadata } from "next";
import { CATEGORIES } from "@/lib/utils/category-photos";
import { CategoryPageBody } from "@/components/marketing/CategoryPageBody";

const category = CATEGORIES.chemicals;

export const metadata: Metadata = {
  title: `${category.name}`,
  description: category.intro,
  alternates: { canonical: `/${category.slug}` },
};

export default function ChemicalsPage() {
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
