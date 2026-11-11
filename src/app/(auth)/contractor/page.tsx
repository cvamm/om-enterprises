import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";

export const metadata: Metadata = {
  title: "Trade portal",
  description:
    "Contractor access to batch pricing, credit tracking, and project records. Sign in with the account the shop created for you.",
  robots: { index: false },
};

/**
 * Trade portal landing.
 *
 * Phase 1: the portal is a stub. The route exists, the auth layout
 * guards it, and the page says clearly what will be here in Phase 2.
 * This keeps the link in the footer working without a 404 and gives
 * the shop a place to look once the account is live.
 *
 * Supabase auth middleware (ADR 0003) will redirect unauthenticated
 * visitors to /login once Supabase is configured. Until then the page
 * renders and says so.
 */
export default function ContractorPage() {
  return (
    <section className="min-h-[70vh] bg-ink py-24 md:py-32">
      <Container>
        <div className="max-w-2xl">
          <Eyebrow label="TRADE PORTAL" />
          <h1 className="mt-8 font-display text-5xl leading-[1.02] text-bone md:text-6xl">
            Contractor access
            <span className="block font-light italic text-bone/77">
              opens when the shop connects Supabase
            </span>
          </h1>

          <p className="mt-8 text-[15px] leading-relaxed text-bone/79">
            This is where batch pricing, credit limits, and project
            records will live. The shop will tell you when your account
            is ready and send your login details.
          </p>

          <div className="mt-10 space-y-4">
            <div className="rounded-2xl border border-bone/10 bg-ink-2 p-7">
              <h2 className="text-[10px] uppercase tracking-[0.45em] text-gold">
                PHASE 2 — PROJECTS
              </h2>
              <p className="mt-4 text-[15px] leading-relaxed text-bone/77">
                A record for every job you are running: materials,
                delivery dates, site address, and what is outstanding.
              </p>
            </div>
            <div className="rounded-2xl border border-bone/10 bg-ink-2 p-7">
              <h2 className="text-[10px] uppercase tracking-[0.45em] text-gold">
                PHASE 2 — ORDERS
              </h2>
              <p className="mt-4 text-[15px] leading-relaxed text-bone/77">
                Order history, delivery status, and a running ledger of
                what is on credit. No separate spreadsheet.
              </p>
            </div>
          </div>

          <div className="mt-12">
            <Link
              href="/login"
              className="rounded-full bg-[#c9a96a] px-6 py-4 text-[11px] uppercase tracking-[0.24em] text-black
                         transition-colors duration-300 hover:bg-ink"
            >
              Sign in
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}