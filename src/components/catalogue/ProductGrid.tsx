import type { Product } from "@/types";
import { ProductCard } from "@/components/catalogue/ProductCard";
import { EmptyState } from "@/components/ui/EmptyState";

/**
 * Product grid.
 *
 * §10: an empty grid is an invitation to act, not a mood. When a filter
 * returns nothing the empty state names the likely cause and offers the two
 * ways out — clear the filters, or ask the shop directly. The shop is not
 * online, so offering only "browse all" would leave a customer whose tile is
 * not in the catalogue with nowhere to go.
 */
export function ProductGrid({
  products,
  emptyAction,
  priorityCount = 2,
}: {
  products: Product[];
  /** Link shown in the empty state. Usually the unfiltered catalogue. */
  emptyAction?: { href: string; label: string };
  /** How many cards to eager-load. One row's worth, not the whole page. */
  priorityCount?: number;
}) {
  if (products.length === 0) {
    return (
      <EmptyState
        title="Nothing matches those filters yet"
        body="Our catalogue is being loaded now, and the combination you picked may not exist in it. Clear the filters to see everything we stock, or send us the specification and we will tell you what we can source."
        actions={[
          ...(emptyAction ? [{ href: emptyAction.href, label: emptyAction.label }] : []),
          { href: "/contact", label: "Ask about a specification" },
        ]}
      />
    );
  }

  return (
    <div className="grid gap-5 md:gap-8 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          priority={index < priorityCount}
        />
      ))}
    </div>
  );
}