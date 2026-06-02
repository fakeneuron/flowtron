---
description: Documentation-focused audit — 5 passes (Claims vs. code · Cross-doc consistency · Cross-references · Currency · Stale content), capped findings, writes prioritized tickets to `.flowtron/PLAN.md`. Stack-neutral scaffold; adopters fork to customize doc set and verification gates.
---

Invoke the `audit-docs` skill. The skill resolves scope from `$ARGUMENTS` (`all` / path / `last-commit` / `staged` / `ai-referenced`), loads the doc-set rubric, runs verification gates if configured, walks 5 passes (Claims-vs-code · Cross-doc consistency · Cross-references · Currency · Stale content) capped at 5 findings each, presents Summary + Exploratory Insights + Proposed tasks + Questions, then writes the agreed tickets into `.flowtron/PLAN.md` with `Surfaced by audit-docs YYYY-MM-DD (Finding #N, <severity>)` attribution. Doc files are not modified — fixes happen in separate `/ft-task` cycles.

This skill is **stack-neutral and meant to be forked**, not symlinked from the flowtron submodule. See `docs/MIGRATION.md` §1.2.1 "Optional: fork the `/ft-audit` family per stack" for the install workflow.
