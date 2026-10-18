import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Railway/Render health probe target. Deliberately trivial — it must not touch
 * the database, so a database outage never shows up as a false deployment
 * failure.
 */
export function GET() {
  return NextResponse.json({
    ok: true,
    service: "kanpur-tiles",
    time: new Date().toISOString(),
  });
}
