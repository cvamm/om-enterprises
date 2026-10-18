# 0012 — 404 status code on missing products

## Status
Accepted, with a known limitation

## Context
When a product slug does not exist, the page calls `notFound()`. In
Next.js 15.5, verified in both dev and production builds, this renders
the not-found body (the scoped `(catalogue)/not-found.tsx`) correctly
but the HTTP status of the response is **200**, not 404.

Verified behaviour:
- Unknown route (e.g. `/definitely-not-a-route`): 404, root not-found body. Correct.
- Known route, missing resource (e.g. `/tiles/nope`): 200, scoped not-found body. Body correct, status wrong.

## Decision
Keep `notFound()` for the missing-product case. The scoped catalogue
not-found body is the right user-facing surface, and it renders.
Document the status-code limitation here rather than routing around it
with a home-redirect (which was tried and rejected as the worse outcome:
a customer following a stale product link lands on the homepage with no
explanation).

## Consequences
- Search engines keep indexing dead product URLs as live. On the real
  deployment, monitor Google Search Console for "Page is not indexed"
  vs "404" reports on product URLs and reconsider if indexing a wrong
  status becomes a ranking problem.
- Next.js may fix status propagation for `notFound()` in a later
  minor; re-test at each upgrade and close this ADR if the status
  comes out correct.
