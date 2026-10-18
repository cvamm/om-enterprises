"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

/**
 * Browser-side Supabase client. Lazily created so the singleton survives HMR
 * during development while still being constructed only once per page load.
 *
 * Returns `null` when Supabase is not configured — see the note below. Check
 * the result; do not assume a client.
 *
 * Never imported from a Server Component or a Server Action — use
 * `lib/supabase/server.ts` there instead.
 */
export function getBrowserSupabase(): SupabaseClient | null {
  if (typeof window === "undefined") {
    throw new Error("getBrowserSupabase must not be called on the server");
  }

  if (client) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Fails soft: the site must render without env vars so that `next build`
  // and a first `pnpm dev` both work before anyone touches Supabase. Every
  // call site therefore has to handle a null client — callers guard with
  // `isConfigured()` rather than catching a throw.
  if (url === undefined || url === "" || anonKey === undefined || anonKey === "") {
    console.warn(
      "[supabase] NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is not set. Running unconfigured; data-backed surfaces will be empty.",
    );
    return null;
  }

  client = createBrowserClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });

  return client;
}

/**
 * Whether Supabase is configured at all. Call this before touching the
 * client, since `getBrowserSupabase()` returns null when it is not.
 */
export function isConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return url !== undefined && url !== "" && anonKey !== undefined && anonKey !== "";
}
