# Flowtron — PLAN.md

## Vision

A lightweight, versioned, project-agnostic tasknote system for solo
AI-assisted coding. One source of truth, consumed via git submodule by every
project under `~/code/`. Replaces the disjointed per-project workflow files
in fintown, InvisiPaw, and photard.

See [SPEC.md](../SPEC.md) for the canonical workflow contract.

## High

## Medium

- [ ] **CORE-527** [medium]🧩 | blocked-by-closure-sweep — Phase 4 closure sweeps PLAN for `Blocked by` clauses naming the closing ID and prompts the operator to remove now-satisfied ones in the same closure motion; kills the forgotten-stale-clause class (caobunga CBN-120.2 F1; clause removal stays the operator act).
- [ ] **CORE-528** [light]🔧 | handoff-persistence-rule — SPEC Phase 4 guidance line: anything handed to the operator (verbatim paste lines, commands, filings) is written into the tasknote (Handoff / Final Summary) before archive; terminal recaps are not durable (caobunga CBN-120.2 F2).
- [ ] **CORE-529** [light]🔧 | deferred-handoff-filing-discipline — Guidance: a real-world operator step deferred past a task's closure is filed as its own unchecked PLAN row (dependents carry clauses pointing at it), never only prose in a README — a checked row otherwise hides the pending hand-off from every reader (caobunga CBN-120.2 F4 / adppro DATA-13.3).
- [ ] **CORE-530** [light]🔧 | preserve-bracket-tokens — SPEC guidance: any task-line rewrite (Re-scope, model change, stub flip) must copy the full trailing bracket-token run (`[unattended]`, stacked `[model]` tolerances) verbatim from the original line; a rewrite that preserves visible text but drops a bracket token silently disarms it (caobunga CBN-120.2 F5, observed twice live).
- [ ] **CORE-531** [light]🔧 | blocked-by-grammar-discipline — SPEC/tasknote-selection.md guidance: filing a real dependency must use the exact `Blocked by [[ID]]` wikilink grammar — `Blocked on [[ID]]` and free prose don't parse, so the row silently dispatches as if unblocked (caobunga CBN-123 F5, three of three seeded rows written wrong).

## Low

## Future Opportunities

## Completed

- [x] **CORE-526** [medium]🧩 | early-purpose-blurb — Completed 2026-09-06.
