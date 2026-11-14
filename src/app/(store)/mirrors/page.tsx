import type { Metadata } from "next";
import { CATEGORIES } from "@/lib/utils/category-photos";
import { CategoryPageBody } from "@/components/marketing/CategoryPageBody";

const category = CATEGORIES.mirrors;

export const metadata: Metadata = {
  title: `${category.name}`,
  description: category.intro,
  alternates: { canonical: `/${category.slug}` },
};

export default function MirrorsPage() {
  return (
    <CategoryPageBody
      category={category}
      related={[
        CATEGORIES["washing-basins"],
        CATEGORIES["western-toilets"],
        CATEGORIES.taps,
      ]}
    />
  );
}
