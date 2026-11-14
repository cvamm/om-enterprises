import type { Metadata } from "next";
import { CATEGORIES } from "@/lib/utils/category-photos";
import { CategoryPageBody } from "@/components/marketing/CategoryPageBody";

const category = CATEGORIES.marbles;

export const metadata: Metadata = {
  title: `${category.name}`,
  description: category.intro,
  alternates: { canonical: `/${category.slug}` },
};

export default function MarblesPage() {
  return (
    <CategoryPageBody
      category={category}
      related={[
        CATEGORIES.granite,
        CATEGORIES["washing-basins"],
        CATEGORIES.taps,
      ]}
    />
  );
}
