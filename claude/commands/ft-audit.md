---
description: Run a ruthless principal-engineer code audit — 5 passes, capped findings, writes prioritized tickets to `_project/PLAN.md`. Stack-neutral scaffold; adopters fork to customize rubric and verification gates.
---

Invoke the `audit` skill. The skill resolves scope from `$ARGUMENTS` (`all` / path / `last-commit` / `staged`), loads the project rubric, runs verification gates, walks 5 passes (Security · Idioms · Hygiene · Orphans · Doc drift) capped at 5 findings each, presents Summary + Exploratory Insights + Proposed tasks + Questions, then writes the agreed tickets into `_project/PLAN.md` with `Surfaced by audit YYYY-MM-DD (Finding #N, <severity>)` attribution. Source files are not modified — fixes happen in separate `/ft-task` cycles.

This skill is **stack-neutral and meant to be forked**, not symlinked from the flowtron submodule. See `docs/MIGRATION.md` §1.2.1 "Optional: fork `/ft-audit` per stack" for the install workflow.
