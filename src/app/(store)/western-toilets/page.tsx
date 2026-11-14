import type { Metadata } from "next";
import type { Product } from "@/types";
import { CATEGORIES } from "@/lib/utils/category-photos";
import { StoreCategoryPageBody } from "@/components/marketing/StoreCategoryPageBody";

const category = CATEGORIES["western-toilets"];

export const metadata: Metadata = {
  title: `${category.name}`,
  description: category.intro,
  alternates: { canonical: `/${category.slug}` },
};

export default async function WesternToiletsPage() {
  const allProducts = await getBathsenseProducts();

  return (
    <StoreCategoryPageBody
      category={category}
      related={[
        CATEGORIES["washing-basins"],
        CATEGORIES.mirrors,
        CATEGORIES["tiles-adhesive"],
      ]}
      initialProducts={allProducts}
    />
  );
}

async function getBathsenseProducts(): Promise<Product[]> {
  try {
    const mod = await import("@/lib/queries/products");
    const page = await mod.getProducts({ sort: "featured", page: 1, perPage: 200 });
    return page.products;
  } catch {
    return [];
  }
}
