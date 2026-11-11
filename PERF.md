# Performance log

Budgets are from §9 of the master brief. The gate is a Moto G-class device
throttled to 4G, **not** a developer laptop.

> **Neutral optimizations are reverts.** Every entry below is a measurement.
> If something did not move a number in the budget column, it was reverted or
> is listed here as a reverted attempt with the reason.

## How to measure

```bash
pnpm build
node scripts/bundle-budget.mjs     # JS/CSS/middleware gzip, from Next's own manifest
pnpm lhci autorun                   # Lighthouse, same config every time
```

`bundle-budget.mjs` reads `app-build-manifest.json`, so it reports what the
browser actually downloads. It does not shell out to a headless browser, which
keeps it deterministic and fast enough to run on every CI build.

Set budgets per environment when needed:

```bash
BUDGET_JS_KB=180 BUDGET_CSS_KB=40 node scripts/bundle-budget.mjs
```

## Baseline — 2026-05-29, home route

Commit `7e88413`. Single route in the app (`/`), plus `/api/health`.

| Metric | Budget | Measured | Headroom |
|---|---|---|---|
| Initial JS, worst route (`/layout`) | ≤ 200 KB gz | **163.1 KB** | 36.9 KB |
| Initial JS, home route (`/page`) | ≤ 200 KB gz | **149.1 KB** | 50.9 KB |
| CSS, total | ≤ 50 KB gz | **7.8 KB** | 42.2 KB |
| Edge middleware | ≤ 100 KB gz | **90.8 KB** | 9.2 KB |
| Fonts | ≤ 100 KB | not yet measured | — |
| LCP / INP / CLS | see §9 | not yet measured | — |

Notes on the numbers:

- `/layout` is the worst route because it carries the root font and provider
  bundle. It is not a real route a visitor lands on, but it is the honest
  upper bound, so it is what the gate checks.
- Middleware is 90.8 KB gz and is paid on **every request, by every visitor**,
  including those who never sign in. Today it exists only to refresh a Supabase
  session. That is a poor trade at this size and is worth revisiting once auth
  is actually wired up — see ADR 0003.
- LCP image, Lighthouse and font weight are unmeasured. The hero gallery is
  still a CSS-gradient placeholder, so there is no real LCP element yet.

## Kept

| Change | Before | After | Why |
|---|---|---|---|
| `optimizePackageImports: ["framer-motion"]` | — | 163.1 KB worst route | Barrel-file tree-shaking for the motion library; the hero is the single heaviest dependency on the LCP path. |

## Reverted

_(none yet)_

## Tile Lab (added 2026-05-29)

The pattern configurator is a client component with no image fetching on
the critical path: the CSS grid re-renders instantly, and the WhatsApp
hand-off builds a text-only link with no round trip. No performance
measurements were taken yet — add a Lighthouse row when the product
photos land and the preview tiles have real images.

## Re-measure before touching

Any of the above that stops holding, or a Lighthouse regression, gets a new
dated row here — not a silent edit to the baseline table.