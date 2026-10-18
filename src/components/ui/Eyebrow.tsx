import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

type EyebrowProps = {
  /** Zero-padded section number, e.g. "01". Omit for unnumbered eyebrows. */
  index?: string;
  label: string;
  className?: string;
} & Omit<HTMLAttributes<HTMLElement>, "className">;

/**
 * Tracked-out ALL-CAPS section eyebrow — the site's structural label voice.
 *
 * `01 — COLLECTIONS` is the canonical form. Section numbers form a real
 * sequence: sections genuinely appear in that order on the page, so `index`
 * must never be applied to non-sequential content.
 *
 * The em dash is the one place it is allowed in the design — the brief bans
 * spaced em dashes for everything *except* section eyebrows.
 */
export function Eyebrow({ index, label, className, ...rest }: EyebrowProps) {
  return (
    <span className={cn("eyebrow", className)} {...rest}>
      {index !== undefined && index !== "" ? (
        <>
          <span aria-hidden="true" className="eyebrow__num">
            {index}
          </span>
          <span aria-hidden="true" className="eyebrow__dash">
            —
          </span>
        </>
      ) : null}
      {label}
    </span>
  );
}
