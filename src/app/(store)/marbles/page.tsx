import type { Metadata } from "next";
import { CATEGORIES } from "@/lib/utils/category-photos";
import { StoneCategoryPage } from "@/components/marketing/StoneCategoryPage";

const category = CATEGORIES.marbles;

export const metadata: Metadata = {
  title: `Marble in Kanpur — ${category.name}`,
  description: category.intro,
  alternates: { canonical: `/${category.slug}` },
};

export default async function MarblesPage() {
  return (
    <StoneCategoryPage
      category={category}
      nameTerms={["marble", "onyx", "agate", "quartz", "crystal", "pearl", "statuario"]}
      related={[
        CATEGORIES.granite,
        CATEGORIES["washing-basins"],
        CATEGORIES.taps,
      ]}
    />
  );
}
