import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  hasSupabase,
  readSupabaseAnonKey,
  readSupabaseServiceKey,
  readSupabaseUrl,
} from "@/lib/supabase/env";

/**
 * Server Component / Server Action Supabase client, bound to the request's
 * cookie jar. Use anywhere server-side; never from a client component.
 *
 * Returns `null` when Supabase is unconfigured rather than throwing. A fresh
 * clone must build and render before env vars exist (ADR 0003), and
 * `next build` prerenders every route — a throw here fails the build for a
 * reason unrelated to the code. Callers branch on null with `isConfigured()`
 * and render empty states, which is the honest dev experience: no data yet.
 *
 * Cookies are read per call. `cookies()` is async in Next 15 and must be
 * awaited, which is why this is async.
 */
export async function getServerSupabase(): Promise<SupabaseClient | null> {
  const url = readSupabaseUrl();
  const key = readSupabaseAnonKey();
  if (url === null || key === null) {
    warnOnce("getServerSupabase");
    return null;
  }

  // `cookies()` is only valid in request scope. During `next build` the
  // static-param and metadata passes run outside a request, so an unconfigured
  // or build-time call must not throw — read the jar when we can and build the
  // client anonymously when we can't (reads still work on the anon key).
  let cookieStore;
  try {
    cookieStore = await cookies();
  } catch {
    cookieStore = null;
  }

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore?.getAll() ?? [];
      },
      setAll(
        cookiesToSet: Array<{
          name: string;
          value: string;
          options: Record<string, unknown>;
        }>,
      ) {
        if (cookieStore === null) return;
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Called from a Server Action after the response cookies are
          // committed. The session is still valid; writing is what fails.
        }
      },
    },
  });
}

/**
 * Service-role client for trusted server-side writes only: the admin panel,
 * seeding, backfills. Bypasses RLS entirely.
 *
 * The key is unprefixed so it cannot reach the browser. If it ever appears in
 * a client bundle the database is compromised.
 */
export function getServiceSupabase(): SupabaseClient | null {
  const url = readSupabaseUrl();
  const key = readSupabaseServiceKey();
  if (url === null || key === null) {
    warnOnce("getServiceSupabase");
    return null;
  }

  return createServerClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/** True when both public env vars are present. */
export function isConfigured(): boolean {
  return hasSupabase();
}

/**
 * Warn once per process. `next build` prerenders every route, so an
 * unconfigured build would otherwise print the same message a dozen times
 * and bury anything that actually matters.
 */
const warned = new Set<string>();
function warnOnce(where: string): void {
  if (warned.has(where)) return;
  warned.add(where);
  console.warn(
    `[supabase] ${where}: NEXT_PUBLIC_SUPABASE_URL / ANON_KEY not set — ` +
      `rendering empty states. Set them in .env.local to read the catalogue.`,
  );
}