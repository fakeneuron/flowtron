# Flowtron — PLAN.md

## Vision

A lightweight, versioned, project-agnostic tasknote system for solo
AI-assisted coding. One source of truth, consumed via git submodule by every
project under `~/code/`. Replaces the disjointed per-project workflow files
in fintown, InvisiPaw, and photard.

See [SPEC.md](../SPEC.md) for the canonical workflow contract.

## High

## Medium

- [ ] **CORE-EPIC-632** [heavy]🧠 | adopter-footprint — Every adopter checks out flowtron's dogfood archive at `.flowtron/core/.flowtron/` — 12.5 MB / 987 files, 71% of tracked bytes, growing ~200 tasknotes a month — and no doc, snippet, or `/ft-new-project` step tells them to keep it out of grep / `@`-file / context tooling; `LOGO.png` (446,650 bytes, rendered at 200 px) ships alongside a 4,566-byte `viz/public/LOGO.webp` of the same mark. Keep the archive where the README's headline claim needs it; shrink what the adopter carries around it. Discovery supplied by audit-repo 2026-09-20. Surfaced by audit-repo 2026-09-20 (Theme: the dogfood archive is the proof and the baggage).
  - [ ] **CORE-632.2** [light]🔧 [unattended] | readme-logo-webp — Point `README.md`'s logo at a ≤ 10 KB webp (reuse `viz/public/LOGO.webp` or add a root `LOGO.webp`) and drop the 446,650-byte `LOGO.png`; the `<img width="200">` never needed the full-resolution PNG. Check `/ft-release` §7.1 and `docs/` for any path reference to the PNG before deleting.
  - [ ] **CORE-632.3** [medium]🧩 | submodule-archive-exclusion-guidance — Add a `docs/MIGRATION.md` §1 bullet and one line in `claude/AGENTS-snippet.md` (mirrored to the codex / cursor / grok snippets) naming `.flowtron/core/.flowtron/` as the path to exclude from search and context tooling (`.claudeignore` / `.cursorignore` / `.rgignore`), and a matching deposit step in `/ft-new-project`; the flowtron-self checkout has no `.flowtron/core/` and needs nothing.
  - [ ] **CORE-632.N** [light]🔧 | adopter-footprint audit — Epic closure audit + doc-drift sweep.

## Low

- [ ] **CORE-634** [light]🔧 [unattended] | rotation-closed-month-append — `SPEC/plan-filing.md` §"`## Completed` rotation" calls a month heading with a later block above it "closed to further appends" but never says where a row resolving to that month goes; read literally it cannot rotate, breaking "oldest first" / "never split a cohort" around it. Replace the clause: append to the existing month block's end wherever it sits; blocks are extended, never rewritten or reordered. Surfaced in adppro 2026-09-20 (17 late-swept May–July rows).
- [ ] **CORE-633** [light]🔧 [unattended] | ci-job-timeouts — Add `timeout-minutes` to both `ci.yml` jobs (`validate` 20, `drift` 10); the viz suite is load-sensitive by its own history (FE-053, FE-95) and a hung worker today runs to GitHub's 360-minute default. Job-level keys only — no `- run:` line changes, so Pair H is untouched. Surfaced by audit-repo 2026-09-20 (Theme: ratchets everywhere — and two are one edit from tripping).

## Future Opportunities

## Completed

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
- [x] **CORE-601** [light]🔧 [unattended] | updater-legacy-only-report — Completed 2026-09-14.
- [x] **CORE-602** [light]🔧 | viz-readme-startup-discovery — README.md §Visualizer now states project discovery and the latest-release tag resolve once at dev-server start (restart to pick up new/removed projects or a mid-session tag). Surfaced by audit 2026-09-14 (Finding #3, Low), fixed inline.
- [x] **CORE-600** [light]🔧 [unattended] | layout-md-paths-contrast — Completed 2026-09-14.
- [x] **CORE-599** [medium]🧩 | release v5.28.0 — Completed 2026-09-14.
- [x] **CORE-EPIC-598** [heavy]🧠 | flowtron-caobunga-concert — Completed 2026-09-14.
  - [x] **CORE-598.1** [heavy]🧠 | flowtron-caobunga-concert discovery — Completed 2026-09-14.
  - [x] **CORE-598.2** [heavy]🧠 | caller-write-boundary-fixes — Completed 2026-09-14.
  - [x] **CORE-598.3** [heavy]🧠 | handoff-token-ratify — Completed 2026-09-14.
  - [x] **CORE-598.4** [medium]🧩 | caobunga-handoff-rows — Completed 2026-09-14.
  - [x] **CORE-598.N** [heavy]🧠 | flowtron-caobunga-concert audit — Completed 2026-09-14.
- [x] **CORE-597** [light]🔧 | caobunga-status-file-home — Completed 2026-09-13.
- [x] **CORE-596** [light]🔧 [unattended] | spec-paths-frontmatter-retire — Completed 2026-09-13.
- [x] **CORE-595** [medium]🧩 [unattended] | tasknote-selection-split — Completed 2026-09-13.
- [x] **CORE-594** [medium]🧩 [unattended] | mirror-pair-o-filing-commits — Completed 2026-09-13.
- [x] **CORE-593** [light]🔧 [unattended] | refactor-filing-post-stage-verify — Completed 2026-09-13.
- [x] **CORE-592** [light]🔧 [unattended] | updater-self-skip-realpath — Completed 2026-09-13.
- [x] **FE-120** [light]🔧 [unattended] | sse-heartbeat-extract — Completed 2026-09-13.
- [x] **FE-119** [light]🔧 [unattended] | origin-guard-same-site-reject — Completed 2026-09-13.
- [x] **CORE-591** [light]🔧 | followup-filing-commit-index-guard — Completed 2026-09-13.
- [x] **FE-118** [light]🔧 [unattended] | unattended-chip — Completed 2026-09-13.
- [x] **CORE-589** [light]🔧 | agents-snippet-plan-archive-mention — Completed 2026-09-13.
- [x] **CORE-590** [light]🔧 [unattended] | glossary-unattended-entry — Completed 2026-09-12.
- [x] **CORE-588** [medium]🧩 | release-dogfood-concurrent-write-hardening — Completed 2026-09-12.
- [x] **CORE-587** [light]🔧 | ft-task-sop-receipt-park-fix — Completed 2026-09-12.
- [x] **CORE-586** [medium]🧩 | release v5.27.0 — Completed 2026-09-12.
- [x] **FE-116** [light]🔧 [unattended] | theme-key-namespace — Completed 2026-09-12.
- [x] **CORE-585** [light]🔧 [unattended] | updater-git-no-prompt-timeout — Completed 2026-09-12.
- [x] **FE-115** [medium]🧩 [unattended] | watcher-error-listener — Completed 2026-09-12.
