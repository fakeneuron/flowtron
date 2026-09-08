# Flowtron — PLAN.md

## Vision

A lightweight, versioned, project-agnostic tasknote system for solo
AI-assisted coding. One source of truth, consumed via git submodule by every
project under `~/code/`. Replaces the disjointed per-project workflow files
in fintown, InvisiPaw, and photard.

See [SPEC.md](../SPEC.md) for the canonical workflow contract.

## High

(none)

## Medium

- [ ] **CORE-536** [heavy] | gate-relaxation-pass — Relax gate behavior for easier passthrough under liberal conditions. Four candidates surfaced by [[CORE-535.5]]: path+content 📦 privileged-ops signal (so doc-only edits under `**/auth/**` stop firing); `--fast` treating Re-scope as an inline notice while De-scope still fires 🛠️; a wider closed commit-go set; `/ft-task` reading the `[unattended]` task-line marker. Behavior change — out of [[CORE-EPIC-535]]'s scope.

## Low

- [ ] **CORE-537** [light] | plan-row-ledger-churn — The ledger's `.flowtron/PLAN.md` row goes stale at every task closure — unlike the other 26 rows it tracks a file that changes by design. Decide: drop the row, replace it with an order-of-magnitude band, or mark it refreshed-only-at-release. Surfaced by [[CORE-535.N]].
- [ ] **CORE-538** [medium] | skill-citation-count-claim — `.flowtron/tasknote/README.md`'s "all 63 skill-body §"…" citations resolve today" cannot be re-derived: a naive count returns 254. Recover [[CORE-492]]'s counting rule and restate the claim, or drop the number and keep the resolution assertion. Surfaced by [[CORE-535.N]].

## Future Opportunities

## Completed

- [x] **CORE-EPIC-535** [heavy] | context-load-diet — Completed 2026-09-07.
  - [x] **CORE-535.1** [heavy] | context-load-diet discovery — Completed 2026-09-06.
  - [x] **CORE-535.2** [medium] | context-load-ledger — Completed 2026-09-06.
  - [x] **CORE-535.3** [heavy] | spec-core-lazy-split — Completed 2026-09-06.
  - [x] **CORE-535.4** [heavy] | skills-cite-dont-restate — Completed 2026-09-07.
  - [x] **CORE-535.5** [heavy] | gate-logic-untangle — Completed 2026-09-07.
  - [x] **CORE-535.N** [heavy] | context-load-diet audit — Completed 2026-09-07.

- [x] **CORE-534** [light]🔧 | adopter-filing-check — Completed 2026-09-06.
- [x] **CORE-533** [medium]🧩 | narrow-caobunga-batch — Completed 2026-09-06.
- [x] **CORE-532** [light]🔧 | neutrality-ledger-gates-count — Completed 2026-09-06.
- [x] **CORE-530** [light]🔧 | preserve-bracket-tokens — Completed 2026-09-06.
- [x] **CORE-529** [light]🔧 | deferred-handoff-filing-discipline — Completed 2026-09-06.
- [x] **CORE-528** [light]🔧 | handoff-persistence-rule — Completed 2026-09-06.
- [x] **CORE-531** [light]🔧 | blocked-by-grammar-discipline — Completed 2026-09-06.
- [x] **CORE-527** [medium]🧩 | blocked-by-closure-sweep — Completed 2026-09-06.
- [x] **CORE-526** [medium]🧩 | early-purpose-blurb — Completed 2026-09-06.
