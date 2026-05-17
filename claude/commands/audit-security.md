---
description: Security-focused audit — 5 passes (Secrets · Input handling · Auth & authz · Network & boundaries · Dependencies), capped findings, writes prioritized tickets to `_project/PLAN.md`. Stack-neutral scaffold; adopters fork to customize sacred invariants and scanner wiring.
---

Invoke the `audit-security` skill. The skill resolves scope from `$ARGUMENTS` (`all` / path / `last-commit` / `staged`), loads the project's threat model and auth rubric, runs secret + dep + SAST scanners as verification gates, walks 5 passes (Secrets · Input handling · Auth & authz · Network & boundaries · Dependencies) capped at 5 findings each, presents Summary + Exploratory Insights + Proposed tasks + Questions, then writes the agreed tickets into `_project/PLAN.md` with `Surfaced by audit-security YYYY-MM-DD (Finding #N, <severity>)` attribution. Source files are not modified except for the secret-leak rotation exception.

This skill is **stack-neutral and meant to be forked**, not symlinked from the flowtron submodule. See `docs/MIGRATION.md` §1.2.1 "Optional: fork the `/audit` family per stack" for the install workflow.
