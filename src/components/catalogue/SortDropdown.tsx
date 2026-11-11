"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { buildQuery } from "@/lib/utils/filters";
import type { ProductSort } from "@/lib/queries/products";

const OPTIONS: Array<{ value: ProductSort; label: string }> = [
  { value: "featured", label: "Featured first" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "newest", label: "Newest" },
  { value: "name", label: "Name: A to Z" },
];

/**
 * Sort control. A native `<select>`, not a custom listbox: it opens the
 * platform picker on Android, which is faster and more familiar than any JS
 * dropdown on a mid-range phone, and it is keyboard-accessible for free.
 * Styled to the dark palette without losing that behaviour.
 */
export function SortDropdown() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const current = searchParams.get("sort") ?? "featured";

  function onChange(event: React.ChangeEvent<HTMLSelectElement>) {
    router.push(
      `${pathname}${buildQuery(Object.fromEntries(searchParams), {
        sort: event.target.value === "featured" ? undefined : event.target.value,
      })}`,
    );
  }

  return (
    <div className="flex items-center gap-3">
      <label
        htmlFor="sort"
        className="shrink-0 text-[10px] uppercase tracking-[0.45em] text-gold"
      >
        Sort
      </label>
      <select
        id="sort"
        value={current}
        onChange={onChange}
        className="rounded-lg border border-bone/12 bg-ink-2 px-5 py-4 text-[13px]
                   text-bone transition-colors duration-300 hover:border-bone/30
                   focus:border-gold/60 focus:outline-none"
      >
        {OPTIONS.map((option) => (
          <option key={option.value} value={option.value} className="bg-ink-2">
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}