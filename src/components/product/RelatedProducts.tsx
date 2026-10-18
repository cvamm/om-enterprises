import { ProductGrid } from "@/components/catalogue/ProductGrid";
import { getRelatedProducts } from "@/lib/queries/products";
import type { Product } from "@/types";

/**
 * Related products.
 *
 * Siblings by material or origin. If a product sits in a thin category the
 * query widens rather than returning nothing — a "related" strip with four
 * plausible tiles is more useful than an empty one.
 */
export async function RelatedProducts({ product }: { product: Product }) {
  const related = await getRelatedProducts(product, 3);

  return (
    <ProductGrid
      products={related}
      emptyAction={{ href: "/tiles", label: "Browse all products" }}
      priorityCount={0}
    />
  );
}