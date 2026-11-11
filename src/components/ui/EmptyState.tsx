import Link from "next/link";

/**
 * Empty state.
 *
 * §10 requires failure and emptiness read as direction, not mood. So: no
 * apology, no illustration, a sentence that names the situation, and at least
 * one concrete thing to do. Used by the catalogue grid, the portfolio, and
 * the admin tables.
 */
export function EmptyState({
  title,
  body,
  actions = [],
  className,
}: {
  title: string;
  body: string;
  actions?: Array<{ href: string; label: string }>;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-bone/10 bg-ink-2 px-7 py-16 md:px-9 md:py-20 ${className ?? ""}`}
      data-testid="empty-state"
    >
      <div className="mx-auto max-w-2xl text-center">
        <h3 className="font-display text-3xl leading-tight text-bone md:text-4xl">
          {title}
        </h3>
        <p className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-bone/79">
          {body}
        </p>

        {actions.length > 0 && (
          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            {actions.map((action, index) => (
              <Link
                key={action.href}
                href={action.href}
                className={
                  index === 0
                    ? "inline-flex items-center rounded-full bg-[#c9a96a] px-6 py-4 text-[11px] uppercase tracking-[0.24em] text-black transition-colors duration-300 hover:bg-ink"
                    : "inline-flex items-center rounded-full border border-gold/60 px-5 py-2.5 text-[11px] uppercase tracking-[0.24em] text-gold transition-colors duration-300 hover:bg-[#c9a96a] hover:text-black"
                }
              >
                {action.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}