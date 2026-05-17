---
description: Frontend-focused audit — 5 passes (Bundle & payload · Accessibility · Render performance · Browser hygiene · Component health), capped findings, writes prioritized tickets to `_project/PLAN.md`. Stack-neutral scaffold; adopters fork to customize framework, bundler, and a11y tooling.
---

Invoke the `audit-frontend` skill. The skill resolves scope from `$ARGUMENTS` (`all` / path / `last-commit` / `staged` / route name), loads the design-system + a11y + perf-budget rubric, runs build / bundle-analyzer / a11y / lint as verification gates, walks 5 passes (Bundle · A11y · Render perf · Browser hygiene · Component health) capped at 5 findings each, presents Summary + Exploratory Insights + Proposed tasks + Questions, then writes the agreed tickets into `_project/PLAN.md` with `Surfaced by audit-frontend YYYY-MM-DD (Finding #N, <severity>)` attribution. Source files are not modified.

This skill is **stack-neutral and meant to be forked**, not symlinked from the flowtron submodule. See `docs/MIGRATION.md` §1.2.1 "Optional: fork the `/audit` family per stack" for the install workflow.
