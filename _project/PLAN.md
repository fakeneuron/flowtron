# Flowtron — PLAN.md

**Last updated:** 2026-05-01 (CORE-017 shipped — tasknote YAML frontmatter; filed CORE-021 — natabula migration)

## Vision

A lightweight, versioned, project-agnostic tasknote system for solo
AI-assisted coding. One source of truth, consumed via git submodule by every
project under `~/code/`. Replaces the disjointed per-project workflow files
in fintown, InvisiPaw, and photard.

See [SPEC.md](../SPEC.md) for the canonical workflow contract.

## Critical

(none — bootstrap tasks complete; see Completed below)

## High

- [ ] **CORE-018** — Polish `templates/` for scannability: consistent emojis in headings, GitHub-style checklists, `[[TASK-ID]]` linking, clear “Subtasks / Acceptance / Related” sections, navigation header — every tasknote reads like a small, polished spec.
- [ ] **CORE-021** — Migrate natabula to flowtron. Path TBD by Phase 1 discovery (fresh adoption via `/new-project` skill vs. `docs/MIGRATION.md` §2 if natabula already has prior workflow tooling).

## Medium

- [ ] **CORE-016** — Execute InvisiPaw migration per CORE-008 playbook. Blocked: do not start until user signals InvisiPaw backlog is cleared. Scope: flowtron wiring + plan-file collapse + active-task-ID rename. Out of scope: renaming the 15 in-flight tasknote files (deferred further).
- [ ] **CORE-019** — Enhance `viz/` to consume the new frontmatter: richer cards (priority badges, tags, due dates, status), full Markdown for description/subtasks in cards, “Open in editor” button, tag/status filters, quick-search. Implementation note: gray-matter + react-markdown; aligns with FE-002 cross-project path.
- [ ] **CORE-020** — Update `/new-project` skill and `docs/MIGRATION.md` for the new template format; optionally mention “use natabula for a full opinionated setup.”

## Low

- [ ] **CORE-EPIC-009** — Migrate **fintown** (epic; child tasks below). Demoted from Medium 2026-04-30 — user clearing fintown's pending tasks first + wants flowtron itself to mature before planning the integration. A CORE-008-style "draft fintown migration playbook" task will likely be filed before execution begins; not yet warranted.
  - [ ] **CORE-009.1** — Add flowtron submodule + CLAUDE.md block
  - [ ] **CORE-009.2** — Convert `plan.json` → `PLAN.md` (preserve archive references)
  - [ ] **CORE-009.3** — Retire `create_tasknote.py`, `archive_tasknote.py`, `validate_plan.py`
  - [ ] **CORE-009.4** — Reconcile in-flight tasknotes (BE-128, BE-138, FE-145, FE-146)
  - [ ] **CORE-009.5** — Update fintown's `WORKFLOW.md` and `TASKNOTE_QUICK_REFERENCE.md` to point at flowtron

## Future Opportunities

- [ ] **FE-002** — Cross-project visualizer (extends FE-001) — Node-side filesystem scan over `~/code/*/_project/PLAN.md`, all projects in one Kanban, optional click-into tasknote detail view. Synergy: **CORE-019** (frontmatter-aware cards/filters on the same viz codebase).

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
- [x] **CORE-011** — Fold or delete `~/code/TasknoteSystem/` (the older predecessor folder). Verdict: delete outright — TasknoteSystem (5 small files dated 2025-04-02) is strictly superseded by flowtron; nothing to fold. Patched `docs/PHILOSOPHY.md:17` and `:47` to past-tense and dropped the `~/code/` absolute-path prefix so the historical narrative no longer points at a defunct location. Completed 2026-04-30. Tasknote: `_project/tasknote/archive/core/CORE-011.md`.
- [x] **CORE-008** — Re-scoped from "Migrate InvisiPaw (single task)" to "Draft InvisiPaw migration playbook" after discovery surfaced 15 in-flight tasknotes + dirty working tree + extra root files; user wants execution deferred until InvisiPaw backlog is cleared. Deliverable: ready-to-execute playbook captured in archived tasknote (preconditions, 9 execution steps, explicit out-of-scope items, ID-rename rule that handles whichever in-flight pile survives the backlog drain, version pin resolved at execution time). Filed CORE-016 as the blocked follow-up. Completed 2026-04-30. Tasknote: `_project/tasknote/archive/core/CORE-008.md`.
- [x] **CORE-012** — Re-scoped from "cookiecutter-style scaffolder" to "build `/new-project` skill" after Relevance Assessment surfaced collision with SPEC §"What flowtron does NOT provide" (no CLI tool); promoted Future Opportunities → Medium and shipped immediately. Deliverable: `claude/skills/new-project/SKILL.md` (8-step skill mirroring `/task` shape — preconditions, inputs, submodule add, symlink wire, CLAUDE.md append, PLAN.md + tasknote README from templates, stage + commit-go, verify), `claude/commands/new-project.md` (thin pointer), `docs/MIGRATION.md` §1.0 "Quick path" with one-time global-install symlink one-liner (§1.1–1.7 retained as manual fallback), README.md "Bootstrapping a new project" section. Live dry-run deferred (user opted out at Phase 1 checkpoint). Completed 2026-04-30. Tasknote: `_project/tasknote/archive/core/CORE-012.md`.
- [x] **CORE-017** — Added YAML frontmatter to the tasknote template (fields: `title`, `status`, `priority`, `area`, `model`, `tags`, `created`, `due`, `related-tasks`) so adopting projects' tools (visualizers, dashboards) can parse tasknote metadata without scraping. Replaced the body `**Priority:** **Area:** **Model:** **Status:**` lines with a YAML block above the H1; kept `**Goal:**` as prose. Propagated through `claude/skills/task/SKILL.md` Step 3 (frontmatter-filling instructions + `created:` auto-fill), `templates/tasknote-README.md` (Layout bullet), and `SPEC.md` (new §"Tasknote frontmatter" between Task ID convention and 4-phase workflow). Archived tasknotes left as-is — write-once historical records. Scope kept tight per CORE-018 separation. SPEC version bump (v0.1.1 → v0.2.0) and release tag deferred to a follow-up release task. Completed 2026-05-01. Tasknote: `_project/tasknote/archive/core/CORE-017.md`.
- [x] **FE-001** — Shipped flowtron's first frontend artifact: `viz/`, a single-project read-only Kanban visualizer (Vite 5 + React 18 + TS 5 + Tailwind 3) with six priority columns sourced from `_project/PLAN.md`, "In progress" badge driven by tasknote-file presence in `_project/tasknote/`. Re-scoped 2026-04-30 from cross-project view after discovery surfaced legacy/'s old JSON data model required a full data-layer rewrite; cross-project + tasknote drill-in filed as FE-002. 6 parser tests green, build clean. Run via `cd viz && npm install && npm run dev`. Completed 2026-04-30. Tasknote: `_project/tasknote/archive/frontend/FE-001.md`.
