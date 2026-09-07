# Flowtron — PLAN.md

## Vision

A lightweight, versioned, project-agnostic tasknote system for solo
AI-assisted coding. One source of truth, consumed via git submodule by every
project under `~/code/`. Replaces the disjointed per-project workflow files
in fintown, InvisiPaw, and photard.

See [SPEC.md](../SPEC.md) for the canonical workflow contract.

## High

- [ ] **CORE-EPIC-535** [heavy] | context-load-diet — Bring flowtron's per-task context load back under an enforced budget. SPEC.md tripled since v5.0.0 (28k→77k chars) and SPEC/gates.md nearly tripled (19k→52k); flowtron-owned surfaces are ~half of the ~70k tokens (7%) present at Phase 1. Measure, set per-file byte budgets as a release gate, re-split/trim, and adopt progressive-disclosure loading (filed via /ft-epic-discovery; refined at .1 closure).
  - [x] **CORE-535.1** [heavy] | context-load-diet discovery — Completed 2026-09-06.
  - [x] **CORE-535.2** [medium] | context-load-ledger — Completed 2026-09-06.
  - [x] **CORE-535.3** [heavy] | spec-core-lazy-split — Completed 2026-09-06.
  - [x] **CORE-535.4** [heavy] | skills-cite-dont-restate — Completed 2026-09-07.
  - [x] **CORE-535.5** [heavy] | gate-logic-untangle — Completed 2026-09-07.
  - [ ] **CORE-535.N** [heavy] | context-load-diet audit — Final-subtask audit per SPEC/epic.md (fixed doc-drift sweep acceptance line). Filed now with the reserved terminal `.N` suffix (never renumbers as children are added).

## Medium

- [ ] **CORE-536** [heavy] | gate-relaxation-pass — Relax gate behavior for easier passthrough under liberal conditions. Four candidates surfaced by [[CORE-535.5]]: path+content 📦 privileged-ops signal (so doc-only edits under `**/auth/**` stop firing); `--fast` treating Re-scope as an inline notice while De-scope still fires 🛠️; a wider closed commit-go set; `/ft-task` reading the `[unattended]` task-line marker. Behavior change — out of [[CORE-EPIC-535]]'s scope.

## Low

## Future Opportunities

## Completed

- [x] **CORE-534** [light]🔧 | adopter-filing-check — Completed 2026-09-06.
- [x] **CORE-533** [medium]🧩 | narrow-caobunga-batch — Completed 2026-09-06.
- [x] **CORE-532** [light]🔧 | neutrality-ledger-gates-count — Completed 2026-09-06.
- [x] **CORE-530** [light]🔧 | preserve-bracket-tokens — Completed 2026-09-06.
- [x] **CORE-529** [light]🔧 | deferred-handoff-filing-discipline — Completed 2026-09-06.
- [x] **CORE-528** [light]🔧 | handoff-persistence-rule — Completed 2026-09-06.
- [x] **CORE-531** [light]🔧 | blocked-by-grammar-discipline — Completed 2026-09-06.
- [x] **CORE-527** [medium]🧩 | blocked-by-closure-sweep — Completed 2026-09-06.
- [x] **CORE-526** [medium]🧩 | early-purpose-blurb — Completed 2026-09-06.
