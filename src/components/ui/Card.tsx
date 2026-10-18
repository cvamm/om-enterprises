import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

type CardProps = HTMLAttributes<HTMLElement> & {
  /** Removes padding so images can bleed to the edges. */
  flush?: boolean;
};

/**
 * `rounded-2xl border border-white/10 bg-ink-2 p-7 md:p-9`.
 * Inner elements use `rounded-xl`. No soft grey shadow — the brief bans a
 * shadow under every card.
 */
export function Card({ flush, className, children, ...rest }: CardProps) {
  return (
    <div className={cn("card", flush === true && "card--flush", className)} {...rest}>
      {children}
    </div>
  );
}
