import type { Metadata } from "next";
import type { Product } from "@/types";
import { CATEGORIES } from "@/lib/utils/category-photos";
import { SECTION_MATERIAL } from "@/lib/utils/section-material";
import { CategoryPageBody } from "@/components/marketing/CategoryPageBody";

const category = CATEGORIES["washing-basins"];
const material = SECTION_MATERIAL["washing-basins"];

export const metadata: Metadata = {
  title: `${category.name}`,
  description: category.intro,
  alternates: { canonical: `/${category.slug}` },
};

export default async function WashingBasinsPage() {
  const products = await getSectionProducts(material);

  return (
    <CategoryPageBody
      category={category}
      products={products}
      related={[
        CATEGORIES["western-toilets"],
        CATEGORIES.mirrors,
        CATEGORIES.taps,
      ]}
    />
  );
}

async function getSectionProducts(material: string): Promise<Product[]> {
  try {
    const mod = await import("@/lib/queries/products");
    const page = await mod.getProducts({ material, sort: "featured", page: 1, perPage: 200 });
    return page.products;
  } catch {
    return [];
  }
}
