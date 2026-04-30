# Flowtron — PLAN.md

**Last updated:** 2026-04-30 (CORE-010 / workspace CLAUDE.md flowtron pointer)

## Vision

A lightweight, versioned, project-agnostic tasknote system for solo
AI-assisted coding. One source of truth, consumed via git submodule by every
project under `~/code/`. Replaces the disjointed per-project workflow files
in fintown, InvisiPaw, and photard.

See [SPEC.md](../SPEC.md) for the canonical workflow contract.

## Critical

(none — bootstrap tasks complete; see Completed below)

## High

(none — see Completed for CORE-007)

## Medium

- [ ] **CORE-008** — Migrate **InvisiPaw** (single task)
- [ ] **CORE-EPIC-009** — Migrate **fintown** (epic; child tasks below)
  - [ ] **CORE-009.1** — Add flowtron submodule + CLAUDE.md block
  - [ ] **CORE-009.2** — Convert `plan.json` → `PLAN.md` (preserve archive references)
  - [ ] **CORE-009.3** — Retire `create_tasknote.py`, `archive_tasknote.py`, `validate_plan.py`
  - [ ] **CORE-009.4** — Reconcile in-flight tasknotes (BE-128, BE-138, FE-145, FE-146)
  - [ ] **CORE-009.5** — Update fintown's `WORKFLOW.md` and `TASKNOTE_QUICK_REFERENCE.md` to point at flowtron
- [ ] **CORE-011** — Fold or delete `~/code/TasknoteSystem/` (the older predecessor folder)

## Low

(none — see Completed below for CORE-013)

## Future Opportunities

- [ ] **FE-001** — Revive Vite/React visualizer from `legacy/` (cross-project Kanban view, reads each project's `_project/PLAN.md` + tasknotes)
- [ ] **CORE-012** — Cookiecutter-style "new project" scaffolder (single command to add flowtron submodule + bootstrap `_project/` skeleton)

## Completed

- [x] **CORE-001** — Hard reset flowtron repo (moved old contents to `legacy/`, scaffolded new dirs). Completed 2026-04-28. Bootstrap task — no tasknote (flowtron not yet self-hosting at the time).
- [x] **CORE-002** — Drafted `SPEC.md` (4-phase + Relevance Gate + post-closure protocol; tightened with drift check, pattern survey, model-field rule, and recap shape after cross-repo audit). Completed 2026-04-28. Bootstrap task — no tasknote.
- [x] **CORE-003** — Built `templates/` (tasknote-template.md, PLAN.md, tasknote-README.md). Completed 2026-04-28. Bootstrap task — no tasknote (flowtron not yet self-hosting; CORE-004 wires up the `/task` flow).
- [x] **CORE-004** — Built `claude/` (CLAUDE-snippet.md, `/task` command, `/task` skill); flowtron is now self-hosting via symlinks. Completed 2026-04-28. Tasknote: `_project/tasknote/archive/core/CORE-004.md`.
- [x] **CORE-005** — Wrote `docs/PHILOSOPHY.md` (narrative "why" — drift across prior projects, principles that stuck) and `docs/MIGRATION.md` (procedural guide for fresh adoption + migrating from a prior workflow system). Completed 2026-04-28. Tasknote: `_project/tasknote/archive/core/CORE-005.md`.
- [x] **CORE-006** — Released v0.1.0 to private GitHub: bumped `SPEC.md` to `v0.1.0` / `Stable`, rewrote §Versioning major-bump bullet (tasknote + annotated tag message in place of `CHANGELOG.md`), added repo-root `README.md`, tagged and pushed. Re-scoped to drop `CHANGELOG.md` (tasknotes + git history + tag messages are the changelog). Completed 2026-04-28. Tasknote: `_project/tasknote/archive/core/CORE-006.md`.
- [x] **CORE-007** — Migrated **photard** to flowtron — first real cross-repo adoption. Added `_project/flowtron/` submodule pinned to `v0.1.0`; symlinked `.claude/commands/task.md` + `.claude/skills/task` from the submodule; collapsed photard's four root plan files (PLAN/ROADMAP/PLAN_ARCHIVE/FUTURE_OPPORTUNITIES) into one `_project/PLAN.md` and renamed active task IDs to canonical (`FE-/BE-/OCR-`); rewrote `_project/tasknote/README.md` from flowtron's template (declared `OCR-` prefix; added concrete "Bumping the pinned flowtron version" procedure to replace a ghost CHANGELOG.md reference); patched root `CLAUDE.md` Workflow block. Surfaced CORE-013 follow-up. Completed 2026-04-30. Tasknote: `_project/tasknote/archive/core/CORE-007.md`.
- [x] **CORE-013** — Fixed ghost `CHANGELOG.md` references in `claude/CLAUDE-snippet.md` and `SPEC.md` §Versioning (both stale, left over from before CORE-006's re-scope dropped CHANGELOG.md). Replaced with pointers to the annotated tag message (`git show vX.Y.Z` in the flowtron submodule) + per-release archived tasknote, mirroring the language CORE-007 added to photard's `_project/tasknote/README.md`. Re-scoped from snippet-only after photard adoption review surfaced the SPEC.md instance. Completed 2026-04-30. Doc patch — no tasknote (under SPEC §"When to use a tasknote (and when not to)" skip threshold).
- [x] **CORE-014** — Released v0.1.1 to private GitHub: tagged annotated `v0.1.1` summarizing CORE-007 + CORE-013 + task-skill tweak; pushed tag. Release-only action — no content changes (three commits since v0.1.0 already on main). Migration: none (doc-only patch). Completed 2026-04-30. No tasknote (release-only — under SPEC skip threshold).
- [x] **CORE-015** — Doc cleanup sweep: finished CHANGELOG.md ghost removal in `templates/tasknote-README.md` and `docs/MIGRATION.md` §"Pinning and bumping" (CORE-013 missed both); bumped `SPEC.md` `Version` header to `v0.1.1` (stale since CORE-013 patched §Versioning); leaned out version sprawl by replacing hardcoded `v0.1.0` examples with `vX.Y.Z` placeholders in `templates/tasknote-README.md` + `docs/MIGRATION.md` and dropping the duplicated version pointer in `README.md`. `SPEC.md` `Version` is now the single source of truth, bumped on release. Completed 2026-04-30. Doc patch — no tasknote (under SPEC §"When to use a tasknote (and when not to)" skip threshold).
- [x] **CORE-010** — Reference flowtron in `~/Code/CLAUDE.md` as a suggested workflow option for new repos under `~/code/`. Re-scoped from "as canonical workflow" framing (some `~/code/` repos still on legacy systems; mandate-style language would imply non-compliance). Single bullet appended to `~/Code/CLAUDE.md` "Shared Workflow Philosophy" with pointers to `SPEC.md` + `docs/MIGRATION.md`. Completed 2026-04-30. Tasknote: `_project/tasknote/archive/core/CORE-010.md`.
