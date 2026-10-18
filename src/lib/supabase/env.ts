/**
 * Environment variable reads.
 *
 * `strict-boolean-expressions` forbids `if (!url)` where `url` is
 * `string | undefined`, because an empty string and a missing key behave the
 * same here but mean different things to whoever is debugging a deployment.
 * These helpers make the intent explicit once instead of at every call site.
 *
 * Also the single place that knows which variables exist, so a rename is a
 * one-file change.
 */

/** The var's value if it is a non-empty string, else null. */
export function readEnv(name: string): string | null {
  const value = process.env[name];
  return value !== undefined && value !== "" ? value : null;
}

/** Both Supabase public vars, or null if either is missing. */
export function readSupabaseUrl(): string | null {
  return readEnv("NEXT_PUBLIC_SUPABASE_URL");
}

export function readSupabaseAnonKey(): string | null {
  return readEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
}

export function readSupabaseServiceKey(): string | null {
  return readEnv("SUPABASE_SERVICE_ROLE_KEY");
}

/** WhatsApp number in wa.me format: digits only, country code, no '+'. */
export function readWhatsAppNumber(): string | null {
  const raw = readEnv("NEXT_PUBLIC_WHATSAPP_NUMBER");
  if (raw === null) return null;
  const digits = raw.replace(/\D/g, "");
  return digits.length > 0 ? digits : null;
}

/** Canonical origin, for sitemap, OG tags and absolute links. */
export function readSiteUrl(): string {
  return readEnv("NEXT_PUBLIC_SITE_URL") ?? "http://localhost:3000";
}

/** True when a real database is configured. */
export function hasSupabase(): boolean {
  return readSupabaseUrl() !== null && readSupabaseAnonKey() !== null;
}