import type { Metadata } from "next";
import { CATEGORIES } from "@/lib/utils/category-photos";
import { StoneCategoryPage } from "@/components/marketing/StoneCategoryPage";

const category = CATEGORIES.granite;

export const metadata: Metadata = {
  title: `${category.name}`,
  description: category.intro,
  alternates: { canonical: `/${category.slug}` },
};

export default async function GranitePage() {
  return (
    <StoneCategoryPage
      category={category}
      nameTerms={["granite"]}
      related={[
        CATEGORIES.marbles,
        CATEGORIES["tiles-adhesive"],
        CATEGORIES.taps,
      ]}
    />
  );
}
