type ClassValue = string | number | null | false | undefined | Record<string, boolean | undefined>;

/**
 * Minimal className joiner. `clsx`-compatible signature without the dependency.
 *
 * Usage: cn("card", isOpen && "card--open", className)
 */
export function cn(...inputs: ClassValue[]): string {
  const out: string[] = [];

  for (const input of inputs) {
    // `0` is a legitimate class input, so it must not be dropped as falsy.
    if (input === null || input === undefined || input === false || input === "") continue;

    if (typeof input === "string" || typeof input === "number") {
      out.push(String(input));
    } else if (typeof input === "object") {
      for (const [key, value] of Object.entries(input)) {
        if (value === true) out.push(key);
      }
    }
  }

  return out.join(" ");
}
