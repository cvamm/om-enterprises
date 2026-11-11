"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState } from "react";
import { buildQuery } from "@/lib/utils/filters";
import type { Facet } from "@/lib/queries/products";

/**
 * Filter sidebar.
 *
 * Reads and writes the URL query string, so a filtered view is shareable and
 * the back button behaves. Server Components own the results; this only
 * manages intent.
 *
 * On a phone the sidebar collapses behind a disclosure. Six groups of radio
 * lists above the fold would push the products below 4000px on a 5-inch
 * screen, which is the same as hiding them.
 */
export function CatalogueFilters({
  facets,
}: {
  facets: {
    materials: Facet[];
    finishes: Facet[];
    origins: Facet[];
    sizes: Facet[];
  };
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);

  const params = Object.fromEntries(searchParams);

  function set(key: string, value: string | undefined) {
    router.push(`${pathname}${buildQuery(params, { [key]: value })}`);
  }

  const groups: Array<{ label: string; key: string; options: Facet[] }> = [
    { label: "Room", key: "room", options: [] },
    { label: "Material", key: "material", options: facets.materials },
    { label: "Finish", key: "finish", options: facets.finishes },
    { label: "Size", key: "size", options: facets.sizes },
  ];

  const activeCount = ["room", "material", "finish", "size", "origin", "q"].filter(
    (key) => searchParams.get(key) !== null,
  ).length;

  const panel = (
    <div className="space-y-9">
      {groups.map((group) => {
        const options =
          group.key === "room" ? ROOM_OPTIONS : group.options;
        if (options.length === 0) return null;
        const current = searchParams.get(group.key);

        return (
          <fieldset key={group.key}>
            <legend className="text-[10px] uppercase tracking-[0.45em] text-gold">
              {group.label}
            </legend>
            <div className="mt-4 space-y-1">
              <FilterOption
                label="All"
                checked={current === null}
                onChange={() => set(group.key, undefined)}
                count={undefined}
              />
              {options.map((option) => (
                <FilterOption
                  key={option.value}
                  label={option.label.replace(/-/g, " ")}
                  checked={current === option.value}
                  onChange={() =>
                    set(group.key, current === option.value ? undefined : option.value)
                  }
                  count={option.count}
                />
              ))}
            </div>
          </fieldset>
        );
      })}
    </div>
  );

  return (
    <div className="lg:sticky lg:top-24 lg:self-start">
      <div className="flex items-center justify-between lg:hidden">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="filter-panel"
          className="flex items-center gap-3 rounded-full border border-gold/60 px-5 py-2.5
                     text-[11px] uppercase tracking-[0.24em] text-gold"
        >
          Filters
          {activeCount > 0 && (
            <span className="rounded-full bg-[#c9a96a] px-2 py-0.5 text-[10px] text-black">
              {activeCount}
            </span>
          )}
        </button>
        {activeCount > 0 && (
          <button
            type="button"
            onClick={() => router.push(pathname)}
            className="text-[11px] uppercase tracking-[0.24em] text-bone/75 hover:text-bone"
          >
            Clear all
          </button>
        )}
      </div>

      <div id="filter-panel" className={`${open ? "mt-8 block" : "hidden"} lg:mt-0 lg:block`}>
        {panel}
      </div>

      {activeCount > 0 && (
        <button
          type="button"
          onClick={() => router.push(pathname)}
          className="mt-9 hidden text-[11px] uppercase tracking-[0.24em] text-bone/75
                     underline underline-offset-4 hover:text-bone lg:block"
        >
          Clear all filters
        </button>
      )}
    </div>
  );
}

function FilterOption({
  label,
  checked,
  onChange,
  count,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
  count: number | undefined;
}) {
  return (
    <label
      className={`flex cursor-pointer items-center justify-between rounded-lg px-3 py-2
                  text-[13px] transition-colors duration-300
                  ${checked ? "bg-white/5 text-bone" : "text-bone/79 hover:bg-white/[0.03] hover:text-bone"}`}
    >
      <span className="flex items-center gap-3">
        <input
          type="radio"
          checked={checked}
          onChange={onChange}
          className="h-3.5 w-3.5 accent-[#c9a96a]"
        />
        <span className="capitalize">{label}</span>
      </span>
      {count !== undefined && (
        <span className="text-[11px] tabular-nums text-bone/70">{count}</span>
      )}
    </label>
  );
}

/** Room options are fixed by the enum, not derived from data. */
const ROOM_OPTIONS: Facet[] = [
  "bathroom",
  "kitchen",
  "living-room",
  "bedroom",
  "flooring",
  "wall-cladding",
  "exterior",
  "commercial",
  "pool",
  "balcony",
].map((value) => ({ value, label: value, count: 0 }));