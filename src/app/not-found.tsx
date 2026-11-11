import Link from "next/link";

/**
 * 404. A customer lands here when a link has gone stale or they typed
 * a URL from memory. Two exits: home, or the catalogue — the most
 * likely place they actually wanted to be.
 *
 * The copy stays warm and specific rather than generic: "stone is
 * quarried in the country and kept in Kanpur" tells them where they
 * are, not just that the page is gone.
 */
export default function NotFoundPage() {
  return (
    <section className="relative flex min-h-[70vh] items-center bg-[#f5f0e6] py-24 md:py-32">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 right-[8%] h-[300px] w-[300px] rounded-full blur-[130px]"
        style={{ background: "radial-gradient(circle, #c9a96a, transparent 70%)", opacity: 0.2 }}
      />
      <div className="mx-auto w-full max-w-[1500px] px-5 md:px-10">
        <p className="text-[10px] uppercase tracking-[0.45em] text-gold">
          PAGE NOT FOUND
        </p>
        <h1 className="mt-8 font-display text-5xl leading-[1.02] text-bone md:text-7xl">
          This page is not here.
          <span className="block font-light italic text-bone/77">
            The stone, however, is.
          </span>
        </h1>
        <p className="mt-8 max-w-[55ch] text-[15px] leading-relaxed text-bone/79">
          The link may have moved or stopped working. The collections are
          where most of the work is — start there if you are not sure
          where you were going.
        </p>
        <div className="mt-12 flex flex-wrap gap-4">
          <Link
            href="/"
            className="rounded-full bg-[#c9a96a] px-6 py-4 text-[11px] uppercase tracking-[0.24em] text-black
                       transition-colors duration-300 hover:bg-ink"
          >
            Go home
          </Link>
          <Link
            href="/collections"
            className="rounded-full border border-gold/60 px-6 py-4 text-[11px] uppercase tracking-[0.24em] text-gold
                       transition-colors duration-300 hover:bg-[#c9a96a] hover:text-black"
          >
            Browse the collections
          </Link>
        </div>
      </div>
    </section>
  );
}