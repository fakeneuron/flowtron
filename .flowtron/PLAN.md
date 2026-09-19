# Flowtron — PLAN.md

## Vision

A lightweight, versioned, project-agnostic tasknote system for solo
AI-assisted coding. One source of truth, consumed via git submodule by every
project under `~/code/`. Replaces the disjointed per-project workflow files
in fintown, InvisiPaw, and photard.

See [SPEC.md](../SPEC.md) for the canonical workflow contract.

## High

- [ ] **CORE-EPIC-610** [heavy]🧠 | archive-closure-integrity — Make the Phase 4 Acceptance tick-through and YAML `status:` flip verifiable instead of claimed. 13 of 132 September archivals carry only unticked, unannotated `## ✅ Acceptance` boxes (CORE-608's closure line says "all three ticked" above three `[ ]`); CORE-593 archived with `status: in-progress`; `[unattended]` closures miss at 24% vs 6% attended. SPEC §"Acceptance tick-through" states the rule, nothing executes it. Archived tasknotes are historical — the check applies from a date floor forward, never backfills. Discovery supplied by audit-repo 2026-09-19. Surfaced by audit-repo 2026-09-19 (Theme: Closure claims outrun closure ops).
  - [x] **CORE-610.2** [medium]🧩 | archived-tasknote-integrity-check — Completed 2026-09-19.
  - [ ] **CORE-610.3** [light]🔧 | closure-tick-through-executable — In `/ft-task`, `/ft-micro-task`, and `SPEC/procedures/ft-task.md`, make the pre-archive closure step grep the tasknote for unannotated `- [ ]` under `## ✅ Acceptance` and for `status: completed`, and refuse the archive move until both hold — same shape on the `--fast`/`--unattended` path, where the miss rate is 4× higher.
  - [ ] **CORE-610.N** [light]🔧 | archive-closure-integrity audit — Epic closure audit + doc-drift sweep.

## Medium

## Low

- [ ] **CORE-611** [light]🔧 | readme-glossary-count — `README.md:76` says "~68" glossary terms; `docs/GLOSSARY.md:7` says "~71" and holds ≈71 entries. Align README (or drop the count). Surfaced by audit-repo 2026-09-19 (Theme: prose-only rules).
- [ ] **CORE-612** [light]🔧 | caobunga-commit-type — Commit `71e5051` uses `caobunga:` as a type; `docs/CONVENTIONS.md:17` lists only `feat/fix/chore/docs`. Either name it there as the orchestrator-only type or have the orchestrator emit `chore:`. Surfaced by audit-repo 2026-09-19 (Theme: prose-only rules).

## Future Opportunities

## Completed

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
- [x] **FE-117** [light]🔧 | vscode-href-segment-encoding — `vscodeFileHref` in `viz/src/ui/TaskDetail.tsx` now encodes per path segment with `encodeURIComponent` so `#`/`?` in a workspace path no longer truncate the `vscode://file` link; test added. Surfaced by audit 2026-09-12 (Finding #4, Low), fixed inline.
- [x] **CORE-584** [light]🔧 | updater-hook-claims-and-exit-flush — Completed 2026-09-12.
- [x] **FE-111** [light]🔧 [unattended] | keyboard-nav-enter-button-guard — Completed 2026-09-12.
- [x] **FE-110** [light]🔧 [unattended] | sse-head-and-archive-prefix — Completed 2026-09-12.
- [x] **FE-109** [light]🔧 [unattended] | tasknote-parse-node-only-reclass — Completed 2026-09-12.
- [x] **CORE-581** [light]🔧 | quality-stack-gaps — Added `.github/dependabot.yml` (github-actions + npm/viz, security-only via `open-pull-requests-limit: 0`) and a `docs/CONVENTIONS.md` note on it as the continuous complement to the `npm audit` cadence. Operator still needs to arm the per-repo "Dependabot security updates" GitHub setting. Completed 2026-09-12.
- [x] **FE-108** [light]🔧 [unattended] | model-chip-xheavy-glyph — Completed 2026-09-12.
- [x] **FE-107** [light]🔧 | wikilink-markdown-link-fidelity — Refused non-http(s) links in `WikilinkMarkdown` now render their text instead of vanishing, and react-markdown's `node` prop no longer lands on the `<a>`; tests extended. Surfaced by audit 2026-09-12 (Findings #1 Medium, #4 Low). Completed 2026-09-12.
- [x] **FE-112** [light]🔧 | fence-delimiter-unexport — Dropped the unused `export` on `FENCE_DELIMITER` in `viz/src/fence.ts`. Surfaced by audit 2026-09-12 (Finding #8, Low), fixed inline.
- [x] **FE-113** [light]🔧 | asstring-dead-date-branch — Deleted the unreachable `Date` branch of `asString` in `viz/src/tasknote.ts` (CORE_SCHEMA never yields Date). Surfaced by audit 2026-09-12 (Finding #9, Low), fixed inline.
- [x] **FE-114** [light]🔧 | density-docstring-typography-token — `viz/src/ui/constants.ts:207` now says chips use literal `text-xs`, not the removed `TYPOGRAPHY.caption`. Surfaced by audit 2026-09-12 (Finding #13, Low), fixed inline.
- [x] **CORE-582** [light]🔧 | rollback-bump-unexport — Dropped the unused `export` on `rollbackBump` in `tools/update-adopters.mjs`. Surfaced by audit 2026-09-12 (Finding #7, Low), fixed inline.
- [x] **CORE-583** [light]🔧 | updater-doc-stale-refs — Removed the dangling `SPEC.md` token at `SECURITY.md:163`; added Grok to the flagged-symlink surface list at `docs/MIGRATION.md:545`. Surfaced by audit 2026-09-12 (Finding #14, Low), fixed inline.
- [x] **CORE-579** [light]🔧 [unattended] | external-agents-candidates-row — Completed 2026-09-12.
- [x] **CORE-576** [light]🔧 | stale-spec-draft-cleanup — Completed 2026-09-12.
- [x] **CORE-578** [light]🔧 | gitleaks-ci-step — Completed 2026-09-12.
- [x] **CORE-EPIC-575** [medium]🧩 | viz-dependency-posture — Completed 2026-09-12.
  - [x] **CORE-575.2** [light] [unattended]🔧 | npm-audit-fix-in-range — Completed 2026-09-11.
  - [x] **CORE-575.3** [medium]🧩 | gray-matter-js-yaml-residue — Completed 2026-09-11.
  - [x] **CORE-575.4** [light]🔧 | audit-in-ci-or-cadence — Completed 2026-09-11.
  - [x] **CORE-575.N** [light]🔧 | viz-dependency-posture audit — Completed 2026-09-12.
- [x] **CORE-580** [medium]🧩 [unattended] | ft-file-followup-headroom-trim — Completed 2026-09-11.
