import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type SampleTagProps = {
  children?: ReactNode;
  className?: string;
};

/**
 * A visible marker over dev-only placeholder data. Deliberately loud: the
 * point is that nobody mistakes a sample address or sample price for the
 * shop's real details.
 *
 * The `verify:no-sample` CI job greps the source for the marker string, so a
 * build that still ships these tags fails the launch gate.
 */
export function SampleTag({ children, className }: SampleTagProps) {
  return (
    <span className={cn("ph-sample", className)}>
      <span aria-hidden="true" className="mr-1.5">
        !
      </span>
      {children ?? "[SAMPLE — replace before deploy]"}
    </span>
  );
}

/**
 * Renders real content while it exists, otherwise a visible sample marker.
 * Keeps every page renderable during development without shipping anything
 * that reads as the shop's actual data.
 */
export function SampleValue({
  value,
  label = "sample value",
  className,
  valueClassName,
}: {
  value?: string | number | null;
  label?: string;
  className?: string;
  valueClassName?: string;
}) {
  if (value === undefined || value === null || value === "") {
    return (
      <span className={className}>
        <SampleTag>{`${label} — replace before deploy`}</SampleTag>
      </span>
    );
  }

  return <span className={cn(className, valueClassName)}>{value}</span>;
}
