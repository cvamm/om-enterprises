import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

type Tone = "gold" | "neutral" | "sand" | "muted";

const TONE_CLASS: Record<Tone, string> = {
  gold: "border-gold/60 bg-gold/10 text-gold",
  sand: "border-sand/50 bg-sand/10 text-sand",
  neutral: "border-bone/20 bg-bone/5 text-bone/80",
  muted: "border-bone/12 bg-transparent text-bone/77",
};

type BadgeProps = {
  tone?: Tone;
  className?: string;
  children: string;
} & HTMLAttributes<HTMLSpanElement>;

/** Pills, badges, MOQ and stock indicators. Always `rounded-full`. */
export function Badge({ tone = "gold", className, children, ...rest }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1",
        "text-[10px] uppercase tracking-[0.18em]",
        TONE_CLASS[tone],
        className,
      )}
      {...rest}
    >
      {children}
    </span>
  );
}
