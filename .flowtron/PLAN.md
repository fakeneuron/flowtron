# Flowtron — PLAN.md

## Vision

A lightweight, versioned, project-agnostic tasknote system for solo
AI-assisted coding. One source of truth, consumed via git submodule by every
project under `~/code/`. Replaces the disjointed per-project workflow files
in fintown, InvisiPaw, and photard.

See [SPEC.md](../SPEC.md) for the canonical workflow contract.

## High

## Medium

- [ ] **CORE-EPIC-622** [heavy]🧠 | drift-ratchet-gaps — Three checks the repo's own rules describe but nothing executes: skill-fragment totals are measured in `docs/CONTEXT-BUDGET.md` §"Ledger" yet unbudgeted (`claude/skills/ft-release/step-7.1-mirror-pairs.md` is 50,099 chars, above its parent's 40,000 cap; the directory sums to 117,337 and loads in full on every cut); `§"Heading"` citations across ~130 live files resolve clean today but only Pairs N/O check any in CI (CORE-546 was this class); the viz shared-pure tier is Node-free by `viz/README.md` convention only, and `vite build` never runs. Discovery supplied by audit-repo 2026-09-20. Surfaced by audit-repo 2026-09-20 (Theme: ratchets with gaps).
  - [ ] **CORE-622.2** [medium]🧩 [unattended] | skill-directory-budget-row — Add a `claude/skills/ft-release/**` directory-total row to `docs/CONTEXT-BUDGET.md` §"Budgets" (file-plus-~1.5-units sizing, as `gate-postures.md`'s row), and teach the CI `drift` context-budget step and `/ft-release` §7.1 to sum a `**` row; closes the "fragments its way under the cap" gap §"Ledger" names.
  - [ ] **CORE-622.3** [medium]🧩 [unattended] | section-citation-resolver — CI `drift` step plus §7.1 pair that resolves every `` `<file>.md` §"<Section>" `` citation in live markdown (tasknote archive excluded) against a `## ` heading or a `**<Section>` bold lead in the target (CORE-609's rule); Pairs N and O become instances of it. Lands green — the 2026-09-20 sweep found zero real breaks.
  - [ ] **CORE-622.4** [light]🔧 [unattended] | viz-shared-pure-node-guard — Extend `viz/eslint.config.js`'s `no-restricted-imports` `node:*` pattern to the eight shared-pure modules `viz/README.md` §"Architecture — three tiers" lists, and either add `npm --prefix viz run build` to CI `validate` or drop the unexercised `build`/`preview` scripts from `viz/package.json`.
  - [ ] **CORE-622.N** [light]🔧 | drift-ratchet-gaps audit — Epic closure audit + doc-drift sweep.

## Low

- [ ] **CORE-621** [light]🔧 [unattended] | editorconfig-final-newline — `docs/GLOSSARY.md` and `templates/sidequest-template.md` lack the final newline `.editorconfig` requires, and the template propagates into every adopter's `.flowtron/sidequest/`. Add the newline and a CI `drift` step (`tail -c1` over tracked text files) so the class stays closed. Surfaced by audit-repo 2026-09-20 (Theme: ratchets with gaps).

## Future Opportunities

## Completed

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
