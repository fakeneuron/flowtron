# Flowtron — PLAN.md

**Last updated:** 2026-04-28 (CORE-006 closure)

## Vision

A lightweight, versioned, project-agnostic tasknote system for solo
AI-assisted coding. One source of truth, consumed via git submodule by every
project under `~/code/`. Replaces the disjointed per-project workflow files
in fintown, InvisiPaw, and photard.

See [SPEC.md](../SPEC.md) for the canonical workflow contract.

## Critical

(none — bootstrap tasks complete; see Completed below)

## High

- [ ] **CORE-007** — Migrate **photard** (single task — smallest footprint, proves the system)

## Medium

- [ ] **CORE-008** — Migrate **InvisiPaw** (single task)
- [ ] **CORE-EPIC-009** — Migrate **fintown** (epic; child tasks below)
  - [ ] **CORE-009.1** — Add flowtron submodule + CLAUDE.md block
  - [ ] **CORE-009.2** — Convert `plan.json` → `PLAN.md` (preserve archive references)
  - [ ] **CORE-009.3** — Retire `create_tasknote.py`, `archive_tasknote.py`, `validate_plan.py`
  - [ ] **CORE-009.4** — Reconcile in-flight tasknotes (BE-128, BE-138, FE-145, FE-146)
  - [ ] **CORE-009.5** — Update fintown's `WORKFLOW.md` and `TASKNOTE_QUICK_REFERENCE.md` to point at flowtron
- [ ] **CORE-010** — Update `~/Code/CLAUDE.md` to reference flowtron as canonical workflow
- [ ] **CORE-011** — Fold or delete `~/code/TasknoteSystem/` (the older predecessor folder)

## Low

(none yet)

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
