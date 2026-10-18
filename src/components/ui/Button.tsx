import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { forwardRef } from "react";
import { cn } from "@/lib/utils/cn";

export type ButtonVariant = "primary" | "secondary" | "quiet";
export type ButtonSize = "lg" | "md" | "sm";

const SIZE_CLASS: Record<ButtonSize, string> = {
  lg: "px-6 py-4 text-[11px]",
  md: "px-5 py-2.5 text-[11px]",
  sm: "px-4 py-2 text-[10px]",
};

type SharedProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: ReactNode;
};

export type ButtonAsButtonProps = SharedProps & ButtonHTMLAttributes<HTMLButtonElement>;
export type ButtonAsLinkProps = SharedProps & AnchorHTMLAttributes<HTMLAnchorElement>;

export type ComponentButtonProps = ButtonAsLinkProps | ButtonAsButtonProps;

function buildClasses(variant: ButtonVariant, size: ButtonSize, className?: string) {
  return cn("btn", `btn-${variant}`, SIZE_CLASS[size], className);
}

/**
 * Never rectangular, never with a trailing arrow. CTAs say exactly what
 * happens when used: "Request a Quote", not "Submit".
 *
 * Pass `href` to render an `<a>`, otherwise it renders a `<button>`.
 */
export function Button(props: ComponentButtonProps) {
  const { variant = "primary", size = "lg", className, children, ...rest } = props;
  const classes = buildClasses(variant, size, className);

  if ("href" in rest && rest.href !== undefined) {
    return <a className={classes} {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}>{children}</a>;
  }

  return <button type="button" className={classes} {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}>{children}</button>;
}

/** Form-submitting button that still respects the design system. */
export const SubmitButton = forwardRef<HTMLButtonElement, ButtonAsButtonProps & { type?: "submit" | "button" | "reset" }>(
  function SubmitButton({ variant = "primary", size = "lg", className, children, ...rest }, ref) {
    return (
      <button ref={ref} className={buildClasses(variant, size, className)} {...rest}>
        {children}
      </button>
    );
  },
);
