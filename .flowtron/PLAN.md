# Flowtron — PLAN.md

## Vision

A lightweight, versioned, project-agnostic tasknote system for solo
AI-assisted coding. One source of truth, consumed via git submodule by every
project under `~/code/`. Replaces the disjointed per-project workflow files
in fintown, InvisiPaw, and photard.

See [SPEC.md](../SPEC.md) for the canonical workflow contract.

## High

## Medium

(none)

## Low

- [ ] **CORE-EPIC-639** [heavy]🧠 | toolchain-currency — CI validates on Node 24 only while local dev runs Node 26 (where the suite's FE-053/FE-95 flake history was observed) and `viz/package.json` `engines` admits 22/24/26+; six majors are pending (`typescript` 5.9→7.0, `vitest` 4→5, `js-yaml` 4→5, `@testing-library/jest-dom` 6→7, `globals` 15→17, `@types/node` 24→26) with Dependabot deliberately security-only and no other currency trigger. Keep Dependabot as is; add the second CI lane and a release-time currency look. Discovery supplied by audit-repo 2026-09-20. Surfaced by audit-repo 2026-09-20 (Theme: toolchain currency is manual and single-lane).
  - [x] **CORE-639.2** [light]🔧 [unattended] | ci-node-matrix — Completed 2026-09-20.
  - [ ] **CORE-639.3** [medium]🧩 | viz-majors-triage — Triage the six pending majors in `viz/package.json`: bump each one whose full validation roster stays green, park the rest as `/ft-file-followup --park` stubs with the blocking reason; then add an advisory-only `npm --prefix viz outdated` majors line to `/ft-release` §7.1 standing checks so currency is looked at every cut.
  - [ ] **CORE-639.N** [light]🔧 | toolchain-currency audit — Epic closure audit + doc-drift sweep.
- [ ] **CORE-640** [light]🔧 | js-yaml-5-gray-matter — Bump js-yaml 4→5 once gray-matter no longer bind()s js-yaml 3 safeLoad at import. CORE-639.3 reverted; engines.js TypeError.
- [ ] **CORE-641** [light]🔧 | typescript-7 — Bump typescript 5.9→7 once typescript-eslint supports TS 7.1+; tsc also TS2882 on CSS side-effect import. CORE-639.3 reverted.

## Future Opportunities

## Completed

- [x] **CORE-EPIC-638** [heavy]🧠 | completed-rotation-debt — Completed 2026-09-20.
  - [x] **CORE-638.2** [light]🔧 [unattended] | rotate-completed-rows — Completed 2026-09-20.
  - [x] **CORE-638.3** [medium]🧩 [unattended] | rotation-advisory-mirrors — Completed 2026-09-20.
  - [x] **CORE-638.N** [light]🔧 | completed-rotation-debt audit — Completed 2026-09-20.
- [x] **CORE-637** [light]🔧 | root-justfile-viz — Completed 2026-09-20.
- [x] **CORE-636** [light]🔧 | remove-dead-claudeignore — Completed 2026-09-20.
- [x] **CORE-635** [light]🔧 [unattended] | plan-stub-shape-ratchet — Completed 2026-09-20.
- [x] **CORE-EPIC-632** [heavy]🧠 | adopter-footprint — Completed 2026-09-20.
  - [x] **CORE-632.2** [light]🔧 [unattended] | readme-logo-webp — Completed 2026-09-20.
  - [x] **CORE-632.3** [medium]🧩 | submodule-archive-exclusion-guidance — Completed 2026-09-20.
  - [x] **CORE-632.N** [light]🔧 | adopter-footprint audit — Completed 2026-09-20.
- [x] **CORE-634** [light]🔧 [unattended] | rotation-closed-month-append — Completed 2026-09-20.
- [x] **CORE-633** [light]🔧 [unattended] | ci-job-timeouts — Completed 2026-09-20.
- [x] **CORE-EPIC-631** [heavy]🧠 | budget-headroom — Completed 2026-09-20.
  - [x] **CORE-631.2** [heavy]🧠 | lifted-pairs-single-body — Completed 2026-09-20.
  - [x] **CORE-631.3** [medium]🧩 | procedures-postures-headroom — Completed 2026-09-20.
  - [x] **CORE-631.N** [light]🔧 | budget-headroom audit — Completed 2026-09-20.
- [x] **CORE-630** [light]🔧 | readme-maturity-note — Completed 2026-09-20.
- [x] **CORE-629** [medium]🧩 | release v5.30.0 — Completed 2026-09-20.
- [x] **CORE-625** [light]🔧 | gitleaks-checksum-verify — Completed 2026-09-20.
- [x] **CORE-624** [medium]🧩 | pair-h-lift-to-ci — Completed 2026-09-20.
- [x] **CORE-623** [medium]🧩 [unattended] | validation-roster-build-step — Completed 2026-09-20.
- [x] **CORE-626** [light] | tsconfig-vitest-globals-drop — `viz/tsconfig.json` `types` trimmed to `["node"]`; `vitest/globals` was dead ambient typing with `globals: false` and explicit imports everywhere. Surfaced by audit 2026-09-20 (Finding #2, Low), fixed inline.
- [x] **CORE-627** [light] | conventions-pair-g-stale — `docs/CONVENTIONS.md` §"Dependency audit cadence" release-only pair list now reads `D, F, H, I, K, and L` (Pair G retired at CORE-571). Surfaced by audit 2026-09-20 (Finding #4, Low), fixed inline.
- [x] **CORE-628** [light] | agents-layout-dependabot — `AGENTS.md` §"Repo Layout" `.github/` row now names `dependabot.yml`. Surfaced by audit 2026-09-20 (Finding #5, Low), fixed inline.
- [x] **CORE-621** [light]🔧 [unattended] | editorconfig-final-newline — Completed 2026-09-20.
- [x] **CORE-EPIC-622** [heavy]🧠 | drift-ratchet-gaps — Completed 2026-09-20.
  - [x] **CORE-622.2** [medium]🧩 [unattended] | skill-directory-budget-row — Completed 2026-09-20.
  - [x] **CORE-622.3** [medium]🧩 [unattended] | section-citation-resolver — Completed 2026-09-20.
  - [x] **CORE-622.4** [light]🔧 [unattended] | viz-shared-pure-node-guard — Completed 2026-09-20.
  - [x] **CORE-622.N** [light]🔧 | drift-ratchet-gaps audit — Completed 2026-09-20.
- [x] **CORE-620** [light]🔧 [unattended] | completed-rotation-2026-09 — Completed 2026-09-20.
- [x] **CORE-616** [light]🔧 | receipt-not-transcript — Completed 2026-09-19.
- [x] **CORE-619** [heavy]🧠 | ft-seed — Completed 2026-09-19.
- [x] **CORE-618** [heavy]🧠 | plan-grammar-fixtures — Completed 2026-09-19.
- [x] **CORE-617** [medium]🧩 | unattended-full-suite — Completed 2026-09-19.
- [x] **CORE-615** [light]🔧 [unattended] | task-counter-date-grep-anchor — Completed 2026-09-19.
- [x] **CORE-614** [medium]🧩 [unattended] | dogfood-receipt-shape — Completed 2026-09-19.
- [x] **CORE-613** [medium]🧩 | release v5.29.0 — Completed 2026-09-19.
- [x] **CORE-612** [light]🔧 | caobunga-commit-type — Completed 2026-09-19.
- [x] **CORE-EPIC-610** [heavy]🧠 | archive-closure-integrity — Completed 2026-09-19.
  - [x] **CORE-610.2** [medium]🧩 | archived-tasknote-integrity-check — Completed 2026-09-19.
  - [x] **CORE-610.3** [light]🔧 | closure-tick-through-executable — Completed 2026-09-19.
  - [x] **CORE-610.4** [light]🔧 | archived-stamp-fill-gate — Completed 2026-09-19.
  - [x] **CORE-610.N** [light]🔧 | archive-closure-integrity audit — Completed 2026-09-19.
- [x] **CORE-611** [light]🔧 | readme-glossary-count — Completed 2026-09-19.
- [x] **CORE-609** [light]🔧 | bold-lead-citation-targets — Completed 2026-09-19.
- [x] **CORE-608** [light]🔧 [unattended] | procedures-sop-budget-row — Completed 2026-09-19.
- [x] **CORE-607** [heavy]🧠 | spec-headroom-extraction — Completed 2026-09-19.
- [x] **CORE-606** [light]🔧 [unattended] | sidequest-stub-retirement — Completed 2026-09-19.
- [x] **CORE-605** [light] | plan-filing-off-default-path — Completed 2026-09-18.
- [x] **CORE-EPIC-604** [heavy] | gate-tiering-cold-start — Completed 2026-09-18.
  - [x] **CORE-604.1** [heavy] | gate-tiering-cold-start discovery — Completed 2026-09-18.
  - [x] **CORE-604.2** [heavy] | gate-postures-split — Completed 2026-09-18.
  - [x] **CORE-604.3** [medium] | runner-stub-model-trim — Completed 2026-09-18.
  - [x] **CORE-604.4** [light] | rotation-bound-and-ledger — Completed 2026-09-18.
  - [x] **CORE-604.N** [heavy] | gate-tiering-cold-start audit — Completed 2026-09-18.
- [x] **CORE-EPIC-603** [heavy]🧠 | skill-roster-diet — Completed 2026-09-18.
  - [x] **CORE-603.1** [heavy]🧠 | skill-roster-diet discovery — Completed 2026-09-17.
  - [x] **CORE-603.2** [light]🔧 | retire-flowtron-stats — Completed 2026-09-17.
  - [x] **CORE-603.3** [medium]🧩 | audit-context-fold — Completed 2026-09-18.
  - [x] **CORE-603.4** [light]🔧 | skill-description-trim — Completed 2026-09-18.
  - [x] **CORE-603.N** [heavy]🧠 | skill-roster-diet audit — Completed 2026-09-18.
- [x] **FE-121** [light]🔧 [unattended] | local-storage-helper — Completed 2026-09-14.
