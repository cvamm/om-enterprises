import type { Metadata } from "next";
import type { Product } from "@/types";
import { CATEGORIES } from "@/lib/utils/category-photos";
import { SECTION_TAG, SECTION_MATERIAL } from "@/lib/utils/section-material";
import { CategoryPageBody } from "@/components/marketing/CategoryPageBody";

const category = CATEGORIES.taps;
const tag = SECTION_TAG.taps;

export const metadata: Metadata = {
  title: `${category.name}`,
  description: category.intro,
  alternates: { canonical: `/${category.slug}` },
};

export default async function TapsPage() {
  const products = await getSectionProducts(tag, SECTION_MATERIAL.taps);

  return (
    <CategoryPageBody
      category={category}
      products={products}
      related={[
        CATEGORIES["western-toilets"],
        CATEGORIES["washing-basins"],
        CATEGORIES.mirrors,
      ]}
    />
  );
}

async function getSectionProducts(
  tag: string | null,
  material: string
): Promise<Product[]> {
  try {
    const mod = await import("@/lib/queries/products");
    const page = tag !== null
      ? await mod.getProducts({ sectionTag: tag, sort: "featured", page: 1, perPage: 200 })
      : await mod.getProducts({ material, sort: "featured", page: 1, perPage: 200 });
    return page.products;
  } catch {
    return [];
  }
}
