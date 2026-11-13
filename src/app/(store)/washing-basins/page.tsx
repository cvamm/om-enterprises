import type { Metadata } from "next";
import { CATEGORIES } from "@/lib/utils/category-photos";
import { CategoryPageBody } from "@/components/marketing/CategoryPageBody";

const category = CATEGORIES["washing-basins"];

export const metadata: Metadata = {
  title: `${category.name}`,
  description: category.intro,
  alternates: { canonical: `/${category.slug}` },
};

export default function WashingBasinsPage() {
  return (
    <CategoryPageBody
      category={category}
      related={[
        CATEGORIES["western-toilets"],
        CATEGORIES.mirrors,
        CATEGORIES["house-finishing"],
      ]}
    />
  );
}
