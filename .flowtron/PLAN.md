# Flowtron — PLAN.md

## Vision

A lightweight, versioned, project-agnostic tasknote system for solo
AI-assisted coding. One source of truth, consumed via git submodule by every
project under `~/code/`. Replaces the disjointed per-project workflow files
in fintown, InvisiPaw, and photard.

See [SPEC.md](../SPEC.md) for the canonical workflow contract.

## High

## Medium

- [ ] **CORE-528** [light]🔧 | handoff-persistence-rule — SPEC Phase 4 guidance line: anything handed to the operator (verbatim paste lines, commands, filings) is written into the tasknote (Handoff / Final Summary) before archive; terminal recaps are not durable (caobunga CBN-120.2 F2).
- [ ] **CORE-529** [light]🔧 | deferred-handoff-filing-discipline — Guidance: a real-world operator step deferred past a task's closure is filed as its own unchecked PLAN row (dependents carry clauses pointing at it), never only prose in a README — a checked row otherwise hides the pending hand-off from every reader (caobunga CBN-120.2 F4 / adppro DATA-13.3).
- [ ] **CORE-530** [light]🔧 | preserve-bracket-tokens — SPEC guidance: any task-line rewrite (Re-scope, model change, stub flip) must copy the full trailing bracket-token run (`[unattended]`, stacked `[model]` tolerances) verbatim from the original line; a rewrite that preserves visible text but drops a bracket token silently disarms it (caobunga CBN-120.2 F5, observed twice live).
- [ ] **CORE-532** [light]🔧 | neutrality-ledger-gates-count — `docs/AGENT-NEUTRALITY.md`'s `--fast` ledger row claims "3 sites in `SPEC/gates.md`" (naming §"Phase 1→2 exit gate", §"`--fast` operator override", §"Conditional skip rule"), but 15 sections of that file name the flag. The row's `SPEC.md` half counts sections — [[CORE-527]] verified and corrected it to 7 — so the same rule yields 15, not 3. Reconcile the figure or state the narrower rule explicitly. Surfaced by [[CORE-527]].

## Low

## Future Opportunities

## Completed

- [x] **CORE-531** [light]🔧 | blocked-by-grammar-discipline — Completed 2026-09-06.
- [x] **CORE-527** [medium]🧩 | blocked-by-closure-sweep — Completed 2026-09-06.
- [x] **CORE-526** [medium]🧩 | early-purpose-blurb — Completed 2026-09-06.
