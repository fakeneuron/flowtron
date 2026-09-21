# Flowtron — PLAN.md

## Vision

A lightweight, versioned, project-agnostic tasknote system for solo
AI-assisted coding. One source of truth, consumed via git submodule by every
project under `~/code/`. Replaces the disjointed per-project workflow files
in fintown, InvisiPaw, and photard.

See [SPEC.md](../SPEC.md) for the canonical workflow contract.

## High

- [ ] **CORE-EPIC-651** [heavy]🧠 | gate-reliability — Make the CI/release gate machinery deterministic where it isn't: Pair Q's citation resolver has no out-of-repo path escape (fails on the unpushed `brand/*.md` back-port), the `tools/` suite races git's post-checkout writes on macOS, and `viz/package.json` `engines` admits a Node line CI never runs. Discovery supplied by audit-repo 2026-09-21. Surfaced by audit-repo 2026-09-21 (Theme: Gate machinery outruns its escape hatches).
  - [x] **CORE-651.2** [light]🔧 [unattended] | pair-q-out-of-repo-skip — Completed 2026-09-21.
  - [x] **CORE-651.3** [light]🔧 [unattended] | updater-test-cleanup-race — Completed 2026-09-21.
  - [x] **CORE-651.4** [light]🔧 [unattended] | engines-ci-matrix — Completed 2026-09-21.
  - [ ] **CORE-651.N** [light]🔧 | gate-reliability audit

## Medium

- [ ] **CORE-EPIC-652** [heavy]🧠 | public-surface-decoupling — flowtron is MIT/public but 14 non-archive tracked files point readers at the private `~/Code/natabula` layer (`brand/README.md`, `justfile`, `ci.yml`, `.gitleaks.toml`, `SPEC.md`, `docs/CONVENTIONS.md`, two `SPEC/` modules, three skill bodies, two READMEs); decide per site whether the pointer is operator-private (label it) or adopter-facing (make it self-contained). Discovery supplied by audit-repo 2026-09-21. Surfaced by audit-repo 2026-09-21 (Theme: Private-fleet coupling in a public artifact).
  - [ ] **CORE-652.2** [medium]🧩 | natabula-ref-inventory — Walk `git grep -n natabula -- . ':!.flowtron/tasknote/archive' ':!.flowtron/PLAN-ARCHIVE.md' ':!.flowtron/PLAN.md'`, classify each hit (operator-private note vs adopter-facing pointer), and reword adopter-facing hits to stand alone; archives and PLAN history stay untouched.
  - [ ] **CORE-652.N** [light]🔧 | public-surface-decoupling audit

## Low

- [ ] **CORE-641** [light]🔧 | typescript-7 — Bump typescript 5.9→7 once typescript-eslint supports TS 7.1+; tsc also TS2882 on CSS side-effect import. CORE-639.3 reverted.

## Future Opportunities

## Completed

- [x] **CORE-643** [light] | brand-kit-back-port — Completed 2026-09-21.
- [x] **CORE-640** [light]🔧 | js-yaml-5-gray-matter — Completed 2026-09-21.
- [x] **CORE-644** [medium]🧩 | audit-bootstrap-self-branch — Completed 2026-09-21.
- [x] **CORE-645** [light] | docs-audit-gates-claim — `docs/MIGRATION.md` §1.2.2 and `/ft-release` §7.1 no longer say the `docs` audit runs with no gates; both name the CI `drift` job's doc checks (Pair Q citation resolver, final-newline, context budget) as the local gate. Surfaced by audit-docs 2026-09-21 (Finding #1, Medium), fixed inline.
- [x] **CORE-646** [light] | neutrality-ledger-two-rows — `docs/AGENT-NEUTRALITY.md` ledger gains rows for `SPEC/unattended-candidacy.md` (`claude/skills/`, `.claude/skills/audit/`) and `templates/audit-overlay-template.md` (referenced-scaffold path, `CLAUDE.md` rubric example), both path facts. Surfaced by audit-docs 2026-09-21 (Finding #2, Medium), fixed inline.
- [x] **CORE-647** [light] | agents-layout-justfile — `AGENTS.md` §"Repo Layout" names the root `justfile` (CORE-637). Surfaced by audit-docs 2026-09-21 (Finding #3, Low), fixed inline.
- [x] **CORE-648** [light] | agents-model-mirror-pointer — `AGENTS.md:35` KEEP IN SYNC pointer now reads `claude/AGENTS-snippet.md:32` (the `[model]` bullet), matching the snippet's reverse pointer. Surfaced by audit-docs 2026-09-21 (Finding #4, Low), fixed inline.
- [x] **CORE-650** [light] | sweep-set-exclusion-note — `.flowtron/tasknote/README.md` §"AI-referenced docs" now states why `docs/PHILOSOPHY.md` (historical), `docs/DOGFOOD.md` (release-gated), `docs/CONTEXT-BUDGET.md` (CI-enforced + release-remeasured), and `docs/VERSION-HISTORY.md` (release-written) sit outside the sweep set. Surfaced by audit-docs 2026-09-21 (insight), fixed inline.
- [x] **CORE-649** [light] | platforms-wrapper-count — `docs/PLATFORMS.md` Codex "Structured ask" row says "every wrapper" instead of the stale "all 11 wrappers" (12 since `ft-seed`). Surfaced by audit-docs 2026-09-21 (Finding #5, Low), fixed inline.
- [x] **CORE-642** [medium]🧩 | release v5.31.0 — Completed 2026-09-20.
- [x] **CORE-EPIC-639** [heavy]🧠 | toolchain-currency — Completed 2026-09-20.
  - [x] **CORE-639.2** [light]🔧 [unattended] | ci-node-matrix — Completed 2026-09-20.
  - [x] **CORE-639.3** [medium]🧩 | viz-majors-triage — Completed 2026-09-20.
  - [x] **CORE-639.N** [light]🔧 | toolchain-currency audit — Completed 2026-09-20.
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
