import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/** Skip static assets and Next internals — those never need a session. */
function isStaticAsset(request: NextRequest): boolean {
  const { pathname } = request.nextUrl;
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/_vercel") ||
    /\.(?:png|jpg|jpeg|webp|avif|gif|svg|ico|txt|woff2?|ttf)$/.test(pathname)
  );
}

export async function middleware(request: NextRequest) {
  if (isStaticAsset(request)) return NextResponse.next();

  // Not configured yet? Let the site render and let auth surfaces degrade.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (supabaseUrl === undefined || supabaseUrl === "") return NextResponse.next();

  return updateSession(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
