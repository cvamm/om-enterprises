import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

/**
 * Real tile vocabulary — these are the material families a Kanpur stone shop
 * actually stocks. The marquee is separated by rotated-square gold diamonds,
 * not middle dots, because `A · B · C` meta strings are banned in this design.
 */
const MATERIALS = [
  "Glazed Vitrified",
  "Full Body",
  "Marble Look",
  "Terrazzo",
  "Wood Plank",
  "Mosaic",
  "Anti-Skid",
  "Rectified Edge",
  "Kiln Fired",
  "Quartzite",
  "Cave Marble",
  "Limestone",
] as const;

type MarqueeProps = Omit<HTMLAttributes<HTMLElement>, "children"> & {
  /** Override the defaults for the product page's material strip. */
  items?: readonly string[];
};

/**
 * Single-row horizontal marquee between the hero and the first content
 * section. Duplicated so the -50% translate loops seamlessly.
 *
 * 38s linear infinite, edge fade masks, Cormorant Garamond at 2xl/3xl in
 * bone at 45% opacity. CSS-only, so it costs nothing in JS and honours
 * `prefers-reduced-motion` via globals.css.
 */
export function MaterialMarquee({ className, items = MATERIALS, ...rest }: MarqueeProps) {
  return (
    <section
      aria-hidden="true"
      className={cn(
        "border-y border-bone/10 bg-ink-2 py-7",
        className,
      )}
      {...rest}
    >
      <div className="marquee-mask overflow-hidden">
        <div className="marquee-track items-center gap-10 pr-10">
          {[0, 1].map((copy) => (
            <div key={copy} className="flex shrink-0 items-center gap-10">
              {items.map((material) => (
                <span key={`${copy}-${material}`} className="flex items-center gap-10">
                  <span className="font-display whitespace-nowrap text-2xl text-bone/45 md:text-3xl">
                    {material}
                  </span>
                  <span
                    aria-hidden="true"
                    className="h-1.5 w-1.5 rotate-45 bg-gold"
                  />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
