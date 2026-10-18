import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Server Component / Server Action Supabase client, bound to the request's
 * cookie jar. Use this anywhere server-side; never use it from a client
 * component.
 *
 * Cookies are fetched per call — `cookies()` is async in Next 15 and must be
 * awaited, which is why this function is async too.
 */
export async function getServerSupabase(): Promise<SupabaseClient> {
  const cookieStore = await cookies();

  return createServerClient(
    env("NEXT_PUBLIC_SUPABASE_URL"),
    env("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(
          cookiesToSet: Array<{
            name: string;
            value: string;
            options: Record<string, unknown>;
          }>,
        ) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Action the response cookies are already
            // committed. Safe to ignore — the session is still valid.
          }
        },
      },
    },
  );
}

/**
 * Service-role client for trusted server-side writes only: seeding, admin
 * backfills, and anything that must bypass RLS.
 *
 * The key is never prefixed with NEXT_PUBLIC, so it cannot reach the
 * browser. If it ever ends up in a bundle, the database is compromised.
 */
export function getServiceSupabase(): SupabaseClient {
  return createServerClient(
    env("NEXT_PUBLIC_SUPABASE_URL"),
    env("SUPABASE_SERVICE_ROLE_KEY"),
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}

/** Read an env var, failing loudly rather than returning `undefined`. */
function env(name: string): string {
  const value = process.env[name];
  if (value === undefined || value === "") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}
