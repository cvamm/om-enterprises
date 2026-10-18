import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

type ContainerProps = HTMLAttributes<HTMLDivElement>;

/**
 * The site's single column definition: `max-w-[1500px] px-5 md:px-10`.
 * One source of truth so the container never drifts between pages.
 */
export function Container({ className, children, ...rest }: ContainerProps) {
  return (
    <div className={cn("mx-auto w-full max-w-[1500px] px-5 md:px-10", className)} {...rest}>
      {children}
    </div>
  );
}
