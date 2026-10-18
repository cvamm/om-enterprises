"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { buildQuery } from "@/lib/utils/filters";

/**
 * Catalogue search.
 *
 * Submits on Enter and on an explicit Search button. Not on every keystroke:
 * a full server round trip per character on a 4G connection is the single
 * worst thing this component could do, and the catalogue is small enough that
 * typeahead would not pay for itself anyway.
 *
 * Debounced 400ms after the user stops typing, so the common case — typing
 * then waiting — still gets the result they want without a submit click.
 */
export function SearchBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const initial = searchParams.get("q") ?? "";
  const [value, setValue] = useState(initial);
  const [pending, setPending] = useState(false);
  const firstRender = useRef(true);

  // Keep in step with back/forward navigation.
  useEffect(() => {
    setValue(searchParams.get("q") ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.get("q")]);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    if (value === initial) return;

    setPending(true);
    const timer = setTimeout(() => {
      router.push(`${pathname}${buildQuery(Object.fromEntries(searchParams), { q: value !== "" ? value : undefined })}`);
      setPending(false);
    }, 400);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(false);
    router.push(`${pathname}${buildQuery(Object.fromEntries(searchParams), { q: value !== "" ? value : undefined })}`);
  }

  return (
    <form onSubmit={onSubmit} role="search" className="w-full md:max-w-md">
      <label htmlFor="catalogue-search" className="sr-only">
        Search tiles and stone
      </label>
      <div className="relative">
        <input
          id="catalogue-search"
          type="search"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Search tiles and stone"
          autoComplete="off"
          className="w-full rounded-lg border border-white/12 bg-transparent px-5 py-4
                     text-[15px] text-bone placeholder:text-bone/35
                     transition-colors duration-300 hover:border-white/30
                     focus:border-[#c9a96a]/60 focus:outline-none"
        />
        <button
          type="submit"
          disabled={pending}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full
                     bg-[#c9a96a] px-4 py-2 text-[10px] uppercase tracking-[0.24em]
                     text-black transition-colors duration-300 hover:bg-bone
                     disabled:opacity-50"
        >
          {pending ? "Searching" : "Search"}
        </button>
      </div>
    </form>
  );
}