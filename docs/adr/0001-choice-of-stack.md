# 0001 — Next.js App Router on Railway/Render, not GitHub Pages

**Status:** Accepted

## Context

§3 locks the stack to Next.js 14+ App Router with TypeScript strict mode, ISR
on product and origin pages (`revalidate: 3600`), Server Components by default,
and Supabase for auth/database/storage.

§3 also names Railway or Render's free tier as the default, with GitHub Pages
listed as a last resort that "constrains architecture (no server components, no
ISR)".

## Decision

Deploy to **Railway** (Render as the equivalent fallback). The user was asked in
§12 question 1 and had not chosen at the time this ADR was written, so the
brief's stated default stands; switching to Render is a Dockerfile change, not
a code change.

`next.config.ts` sets `output: "standalone"`, which is what Railway and Render
both need to run the app as a small self-contained server rather than
`next start` against the whole `node_modules`.

## Consequences

- ISR, Server Components, route handlers (`/api/health`) and middleware all
  work as specified. Product pages can be revalidated hourly rather than
  rebuilt per request.
- The app needs a long-lived Node process, so there is a real difference between
  free tiers in cold-start behaviour. Railway sleeps after inactivity; the
  first request after a wake pays the cold start, which affects TTFB but not
  the LCP budget on a warm cache.
- `output: "standalone"` traces only the dependencies actually imported. Every
  dependency that turns out to be unused in production is worth removing —
  it shows up directly in the traced bundle.
- GitHub Pages stays rejected: it cannot run ISR or middleware, and §7 needs
  both. Revisit only if Railway and Render both become unavailable.