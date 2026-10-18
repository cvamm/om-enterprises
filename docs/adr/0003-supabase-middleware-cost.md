# 0003 — Fail-soft Supabase client; edge middleware priced separately

**Status:** Accepted

## Context

The scaffold has to build and run before anyone has a Supabase project. `next
build` prerenders every route, and if any page's data layer throws when
`NEXT_PUBLIC_SUPABASE_URL` is unset, the build fails for a reason that has
nothing to do with the code.

Two separate problems fell out of this:

1. `getBrowserSupabase()` threw on missing env. That made "clone, install,
   build" fail, and it made every call site responsible for a try/catch.
2. `middleware.ts` compiles to 90.8 KB gzipped on the edge, and is invoked on
   every request by every visitor — including the large majority who will never
   sign in during Phase 1. Its entire job today is translating `__Host-sb-*`
   cookie names and refreshing a session that Phase 1 barely uses.

## Decision

**Supabase client returns `null` when unconfigured.** `getBrowserSupabase()`
has return type `SupabaseClient | null`, logs one warning, and returns null.
A sibling `isConfigured()` lets callers branch without catching. Pages render
with empty data rather than not rendering at all.

**Middleware gets its own budget line.** `scripts/bundle-budget.mjs` reports
it separately from the per-route table, because the per-route table cannot see
it — middleware is not part of any route's chunk graph. §9 does not budget it,
which is a gap in §9: middleware is real per-request cost.

## Consequences

- `next build` succeeds on a fresh clone with no env vars. Verified.
- Every Supabase call site must handle `null`. This is more honest than a
  throw: a missing env var is a configuration state, not an exception.
- A visitor to an unconfigured dev server sees empty collections rather than
  an error page. That is the right failure mode for development, and it is
  logged loudly enough to notice.
- The 90.8 KB edge cost is documented rather than hidden. It is the single
  clearest optimisation target once auth exists — at which point it earns its
  keep, and today it does not. Revisit when `/contractor` and `/login` ship
  (task 21); if sign-in volume is low, dropping session refresh from the
  middleware matcher is likely a straight win.