---
description: Performance-focused audit — 5 passes (Hot paths · Payload & bundle · Data access · Memory & resource · Caching), capped findings, writes prioritized tickets to `_project/PLAN.md`. Stack-neutral scaffold; adopters fork to customize perf budgets and profiling tools.
---

Invoke the `audit-performance` skill. The skill resolves scope from `$ARGUMENTS` (`all` / path / route name / `last-commit` / `staged`), loads the perf-budget + SLO + benchmark-baseline rubric, runs profilers / bundle analyzers / load tests as verification gates (measurements required — performance audits without measurements are a code-style audit in disguise), walks 5 passes (Hot paths · Payload & bundle · Data access · Memory & resource · Caching) capped at 5 findings each, presents Summary + Exploratory Insights + Proposed tasks + Questions, then writes the agreed tickets into `_project/PLAN.md` with `Surfaced by audit-performance YYYY-MM-DD (Finding #N, <severity>, <measured-impact>)` attribution. Source files are not modified.

This skill is **stack-neutral and meant to be forked**, not symlinked from the flowtron submodule. See `docs/MIGRATION.md` §1.2.1 "Optional: fork the `/audit` family per stack" for the install workflow.
