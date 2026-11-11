"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { buildQuery } from "@/lib/utils/filters";
import { cn } from "@/lib/utils/cn";

/**
 * Pagination.
 *
 * Prev/next plus a windowed page list. Every other filter is preserved, so
 * paging through results of a filter does not silently drop the filter.
 *
 * Prev/next are real buttons, not arrows on link text — §2 bans arrows in
 * button labels, and a bare arrow with no label is inaccessible.
 */
export function Pagination({
  page,
  pageCount,
}: {
  page: number;
  pageCount: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function go(next: number) {
    if (next < 1 || next > pageCount || next === page) return;
    router.push(
      `${pathname}${buildQuery(Object.fromEntries(searchParams), {
        page: next === 1 ? undefined : String(next),
      })}`,
    );
  }

  const pages = window_(page, pageCount);

  const buttonClass =
    "flex h-11 min-w-11 items-center justify-center rounded-full border px-4 " +
    "text-[11px] uppercase tracking-[0.24em] transition-colors duration-300";

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-2">
      <button
        type="button"
        onClick={() => go(page - 1)}
        disabled={page <= 1}
        className={cn(buttonClass, "border-bone/12 text-bone/70 hover:border-bone/30 hover:text-bone",
          "disabled:pointer-events-none disabled:opacity-30")}
      >
        Previous
      </button>

      <div className="hidden items-center gap-2 sm:flex">
        {pages.map((p, index) =>
          p === "gap" ? (
            <span key={`gap-${index}`} className="px-1 text-bone/68" aria-hidden="true">
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => go(p)}
              aria-current={p === page ? "page" : undefined}
              className={cn(
                buttonClass,
                p === page
                  ? "border-gold/60 bg-gold/10 text-gold"
                  : "border-bone/12 text-bone/70 hover:border-bone/30 hover:text-bone",
              )}
            >
              {p}
            </button>
          ),
        )}
      </div>

      <button
        type="button"
        onClick={() => go(page + 1)}
        disabled={page >= pageCount}
        className={cn(buttonClass, "border-bone/12 text-bone/70 hover:border-bone/30 hover:text-bone",
          "disabled:pointer-events-none disabled:opacity-30")}
      >
        Next
      </button>
    </nav>
  );
}

/**
 * Windowed page numbers: first, last, and a run around the current page.
 * "gap" stands in for elided runs.
 */
function window_(page: number, pageCount: number): Array<number | "gap"> {
  if (pageCount <= 7) {
    return Array.from({ length: pageCount }, (_, i) => i + 1);
  }

  const out: Array<number | "gap"> = [1];
  const from = Math.max(2, page - 1);
  const to = Math.min(pageCount - 1, page + 1);

  if (from > 2) out.push("gap");
  for (let i = from; i <= to; i += 1) out.push(i);
  if (to < pageCount - 1) out.push("gap");
  out.push(pageCount);

  return out;
}