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

(none)

## Low

- [ ] **FE-103** [light]🔧 | fence-mask-shared-module — Extract the byte-identical FENCE_DELIMITER + fenceMask from parser.ts and tasknote.ts into a shared-pure fence.ts. Surfaced by audit 2026-09-08 (Finding #5, Medium)
- [ ] **FE-104** [medium]🧩 | node-tier-contained-read-dedup — One helper for the realpathWithin → read → parse → drop loop shared by /api/active and archiveCache.readArchive, plus a guarded() wrapper for the six-handler prelude in devApi.ts. Surfaced by audit 2026-09-08 (Finding #3, Medium; Finding #6, Low)
- [ ] **CORE-540** [light]🔧 | updater-unreadable-root-exit — Fail with exit 1 when --root / FLOWTRON_VIZ_WORKSPACE is not a readable directory instead of reporting "no adopters" and exit 0; fold in the parseArgs usage-string and WIRING_SURFACES thin-bundle dedup. Surfaced by audit 2026-09-08 (Finding #4, Medium; Finding #7, Low)

## Future Opportunities

- [ ] **FE-105** [heavy]🧠 | ui-shell-structure-pass — Run /ft-audit structure viz/src/ui (or /ft-refactor viz/src/ui/App.tsx) for a sequenced plan on the 286-line App and 227-line useProjectData. Surfaced by audit 2026-09-08 (Finding #8, Low)

## Completed

- [x] **FE-102** [medium] | api-cross-site-navigation-guard — Completed 2026-09-08.
- [x] **CORE-539** [medium] | release-ledger-refresh-gap — Completed 2026-09-07.
- [x] **CORE-537** [light] | plan-row-ledger-churn — Completed 2026-09-07.
- [x] **CORE-538** [medium] | skill-citation-count-claim — Completed 2026-09-07.
- [x] **CORE-536** [heavy] | gate-relaxation-pass — Completed 2026-09-07.
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
