import type { Metadata } from "next";
import { CATEGORIES } from "@/lib/utils/category-photos";
import { CategoryPageBody } from "@/components/marketing/CategoryPageBody";

const category = CATEGORIES["miscellaneous"];

export const metadata: Metadata = {
  title: `${category.name}`,
  description: category.intro,
  alternates: { canonical: `/${category.slug}` },
};

export default function MiscellaneousPage() {
  return (
    <CategoryPageBody
      category={category}
      related={[
        CATEGORIES["tiles-adhesive"],
        CATEGORIES["house-finishing"],
        CATEGORIES.mirrors,
      ]}
    />
  );
}
