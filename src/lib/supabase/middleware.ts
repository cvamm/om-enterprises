import { createServerClient } from "@supabase/ssr";
import type { GetAllCookies, SetAllCookies } from "@supabase/ssr/dist/main/types";
import { NextResponse, type NextRequest } from "next/server";

/** Cookie-name prefix Next.js adds when Supabase cookies are set on localhost. */
const HOST_PREFIX = "__Host-";

/**
 * Session refresh at the edge.
 *
 * Next.js writes Supabase's cookies as `__Host-sb-*`; the SSR client expects
 * the bare `sb-*` names, so request cookies are translated on the way in and
 * the refreshed tokens are translated back onto the outgoing response.
 *
 * Runs on every request. The refresh only fires when the access token is
 * close to expiring, so the steady-state cost is one cookie read.
 */
export async function updateSession(request: NextRequest) {
  // One response instance per request, written to by `setAll` below.
  let response: NextResponse | null = null;

  const getAllCookies: GetAllCookies = () =>
    request.cookies.getAll().map(({ name, value }) => ({
      name: name.startsWith(HOST_PREFIX) ? name.slice(HOST_PREFIX.length) : name,
      value,
    }));

  const setAllCookies: SetAllCookies = (cookies) => {
    response ??= NextResponse.next({ request });
    cookies.forEach(({ name, value, options }) => {
      const cookieName = name.startsWith("sb-") ? `__Host-${name}` : name;
      response?.cookies.set(cookieName, value, options);
    });
  };

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://placeholder.supabase.co",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "placeholder-anon-key",
    { cookies: { getAll: getAllCookies, setAll: setAllCookies } },
  );

  // Refreshes the token if it is stale. A failed fetch must never block
  // navigation: the user comes back stale and the next request retries.
  await supabase.auth.getUser();

  return response ?? NextResponse.next({ request });
}
