---
description: Backend-focused audit — 5 passes (Input & contracts · Error handling & lifecycle · Persistence · Async correctness · Observability), capped findings, writes prioritized tickets to `_project/PLAN.md`. Stack-neutral scaffold; adopters fork to customize framework, ORM, and test commands.
---

Invoke the `audit-backend` skill. The skill resolves scope from `$ARGUMENTS` (`all` / path / `last-commit` / `staged` / endpoint name), loads the API contract + DB schema + error-model rubric, runs lint / type-check / test as verification gates, walks 5 passes (Input & contracts · Error handling & lifecycle · Persistence · Async correctness · Observability) capped at 5 findings each, presents Summary + Exploratory Insights + Proposed tasks + Questions, then writes the agreed tickets into `_project/PLAN.md` with `Surfaced by audit-backend YYYY-MM-DD (Finding #N, <severity>)` attribution. Source files are not modified.

This skill is **stack-neutral and meant to be forked**, not symlinked from the flowtron submodule. See `docs/MIGRATION.md` §1.2.1 "Optional: fork the `/ft-audit` family per stack" for the install workflow.
