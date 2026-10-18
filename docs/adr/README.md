# Architecture decision records

One file per decision that was not obvious. Each records the choice, why it was
chosen, and what it costs.

The rule these follow: if a future reader would be surprised by the choice and
could not reconstruct the reasoning from the code, it belongs here.

| # | Decision | Status |
|---|---|---|
| [0001](./0001-choice-of-stack.md) | Next.js App Router on Railway/Render, not GitHub Pages | Accepted |
| [0002](./0002-framer-motion-dom-hero-not-three-js.md) | Hero is framer-motion DOM transforms, not `@react-three/fiber` | Accepted |
| [0003](./0003-supabase-middleware-cost.md) | Fail-soft Supabase client; edge middleware is priced separately | Accepted |

## Format

```markdown
# NNNN — Short title

**Status:** Accepted | Superseded by NNNN

## Context
What forced a choice.

## Decision
What was chosen.

## Consequences
What this costs, and what it makes harder.
```