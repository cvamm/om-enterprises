import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { readSupabaseAnonKey, readSupabaseUrl } from "@/lib/supabase/env";

let cached: SupabaseClient | null = null;

/**
 * Browser Supabase client.
 *
 * Only imported from client components and event handlers. Reads the
 * two public env vars; returns null when either is missing so a fresh
 * clone still builds and renders without Supabase (ADR 0003).
 *
 * The anon key is the only credential that reaches the browser. The
 * service role key is server-only and must never be imported here.
 */
export function getBrowserSupabase(): SupabaseClient | null {
  if (cached !== null) return cached;

  const url = readSupabaseUrl();
  const key = readSupabaseAnonKey();
  if (url === null || key === null) {
    return null;
  }

  cached = createBrowserClient(url, key, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  });

  return cached;
}

export function isSupabaseConfigured(): boolean {
  return readSupabaseUrl() !== null && readSupabaseAnonKey() !== null;
}