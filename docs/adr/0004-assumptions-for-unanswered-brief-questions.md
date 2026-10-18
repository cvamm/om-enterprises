# 0004 — Assumptions for the unanswered §12 questions

**Status:** Accepted (revisit when the shop answers §12)

## Context

The brief's §12 asks ten questions before Phase 1 starts. Two of them change
the *data model* rather than just its contents, so they cannot be deferred to
placeholder text:

- **Q5 — is there an existing supplier management system, or manual entry?**
- **Q7 — which Kanpur delivery zones are covered?**

Work was asked to proceed on stated assumptions and be corrected later through
an admin panel. This ADR records what was assumed, because a silent assumption
in a schema is one nobody notices until it is load-bearing.

## Decision

**Q5 — manual catalogue entry.** `suppliers` is a first-class table with a
`verified` flag, written by hand in the admin. No ERP integration is built
(§7.5 defers that to Phase 3 and requires a named system anyway).

**Q7 — Kanpur Nagar only, with Kanpur Dehat flagged.** Delivery zones are not
a table. `enquiries.delivery_preference` covers pickup / home / site delivery,
and `locality` is free text. Adding a zones table later is additive and does
not require a migration of existing rows — a zones table only matters once
per-zone pricing exists, which is Phase 3.

**Q2 — assume trade is under 20%.** The contractor portal ships as a guarded
scaffold with auth and a landing page, per §8.3 Phase 1 scope. No credit
terms, no re-ordering. `contractors.account_balance` and `credit_limit`
exist but default to zero and are never extended in Phase 1.

**Q3 — assume under 100 SKUs at launch.** Postgres `tsvector` plus `pg_trgm`,
per §3. Meilisearch is the documented trigger for Phase 2, not a default.

**Q4 — assume box prices are real.** The schema stores one price per box and
the UI shows per-box as primary, per §6. If prices turn out to be negotiable
per customer, the change is `price_per_box_inr` becoming nullable plus a
quote-only display path — not a schema redesign.

**Q9 — no real testimonials or projects yet.** `projects` and the testimonial
fields are schema-complete but ship empty. The portfolio page renders an
invitation to be the first project, not fake work.

**Q6 — no Meta/WhatsApp Business account.** §7.5 Phase 1 uses `wa.me` deep
links, which need no Meta approval. Correct by construction.

## Consequences

- Every assumption above is reversible without a destructive migration. That
  was a deliberate constraint on the schema design.
- The contractor tier guard (`guard_contractor_signup`) is live regardless of
  Q2. It costs nothing and prevents a real escalation, so it ships even if the
  portal is never more than a scaffold.
- Assumption-dependent behaviour is marked in the code with a comment naming
  the §12 question it waits on, so it can be found with one grep.