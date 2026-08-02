---
description: Parameterized principal-engineer audit — `/ft-audit <domain> [scope]` runs 5 domain-specific passes, capped findings, writes prioritized tickets to `.flowtron/PLAN.md`. Domains: general (default) · backend · frontend · security · performance · docs. Stack-neutral scaffold; adopters fork to customize rubric and verification gates.
---

Invoke the `audit` skill. The skill resolves the domain from the first `$ARGUMENTS` token (`general`/`backend`/`frontend`/`security`/`performance`/`docs`; any other first token falls back to domain `general` with the whole argument string as scope), loads that domain's `passes/<domain>.md` pass definitions, resolves scope (`all` / path / `last-commit` / `staged`), loads the project rubric, runs verification gates, walks the domain's 5 passes capped at 5 findings each, presents Summary + Exploratory Insights + Proposed tasks + Questions, then writes the agreed tickets into `.flowtron/PLAN.md` with `Surfaced by <slug> YYYY-MM-DD (Finding #N, <severity>)` attribution. Source files are not modified — fixes happen in separate `/ft-task` cycles.

This skill is **stack-neutral and meant to be forked**, not symlinked from the flowtron submodule. Fork the whole directory (`SKILL.md` + `passes/`) into `.claude/skills/audit/`. See `docs/MIGRATION.md` §1.2.1 "Optional: fork `/ft-audit` per stack" for the install workflow.
