# Flowtron — PLAN.md

## Vision

A lightweight, versioned, project-agnostic tasknote system for solo
AI-assisted coding. One source of truth, consumed via git submodule by every
project under `~/code/`. Replaces the disjointed per-project workflow files
in fintown, InvisiPaw, and photard.

See [SPEC.md](../SPEC.md) for the canonical workflow contract.

## Critical

(none — bootstrap tasks complete; see Completed below)

## High

- [ ] **CORE-045** [opus] | MIGRATION.md pre-flight + post-cleanup — Generalize the pre-flight collision check + post-migration cleanup checklists from fintown's CORE-098 and invisipaw's P43-1 migration tasknotes into a permanent §3.x subsection of `docs/MIGRATION.md`. Project-specific items stay in adopter tasknotes. Pairs with [[CORE-044]].

## Medium

- [ ] **CORE-016** [opus] | InvisiPaw migration — Execute InvisiPaw migration per [[CORE-008]] playbook. Blocked by [[CORE-008]] — do not start until user signals InvisiPaw backlog is cleared. Scope: flowtron wiring + plan-file collapse + active-task-ID rename. Out of scope: renaming the 15 in-flight tasknote files (deferred further).
- [ ] **FE-010** [opus] | viz keyboard nav — Add shortcuts: `/` focuses search, `j/k` arrow-nav rows, `Enter` expands, `r` refreshes, `Esc` collapses detail / clears filters. Builds on [[FE-007]].
- [ ] **FE-012** [opus] | viz inbound wikilink back-refs — Surface inbound references: when a task's `related-tasks:` frontmatter or PLAN long-description points at another task, the target's row gets a "← referenced by N" chip. Build a `Map<id, Set<id>>` once at load (data is already parsed) and render in `TaskRowInner`. Builds on [[FE-007]].

## Low

- [ ] **CORE-EPIC-009** [opus] | fintown migration — Migrate **fintown** (epic; child tasks below). Demoted from Medium 2026-04-30 — user clearing fintown's pending tasks first + wants flowtron itself to mature before planning the integration. A [[CORE-008]]-style "draft fintown migration playbook" task will likely be filed before execution begins; not yet warranted.
  - [ ] **CORE-009.1** [sonnet] | submodule + CLAUDE.md — Add flowtron submodule + CLAUDE.md block
  - [ ] **CORE-009.2** [opus] | plan.json → PLAN.md — Convert `plan.json` → `PLAN.md` (preserve archive references)
  - [ ] **CORE-009.3** [sonnet] | retire shell scripts — Retire `create_tasknote.py`, `archive_tasknote.py`, `validate_plan.py`
  - [ ] **CORE-009.4** [opus] | reconcile in-flight tasknotes — Reconcile in-flight tasknotes (BE-128, BE-138, FE-145, FE-146)
  - [ ] **CORE-009.5** [sonnet] | update workflow docs — Update fintown's `WORKFLOW.md` and `TASKNOTE_QUICK_REFERENCE.md` to point at flowtron
- [ ] **FE-014** [opus] | viz UI component tests — Vitest + react-testing-library tests for App.tsx logic now that components are extracted: `matchesFilter` intersection, `navigateToTask` (epic auto-expand, scroll + highlight), expand-on-click toggling, status badge selection. Establish the testing pattern; subsequent component tests follow it. Builds on [[FE-007]].

## Future Opportunities

- [ ] **FE-002** [opus] | cross-project viz — Cross-project visualizer (extends [[FE-001]]) — Node-side filesystem scan over `~/code/*/_project/PLAN.md`, all projects in one Kanban, optional click-into tasknote detail view. Synergy: [[FE-004]] (frontmatter-aware cards/filters on the same viz codebase).
- [ ] **CORE-041** [opus] | dynamic-index direction — explore Dataview-style frontmatter queries / DB-backed index if flowtron scales beyond solo single-user planning. See [[CORE-037]] audit + [[CORE-040]] discipline conversation.

## Completed

- [x] **CORE-044** [opus] | new-project legacy detection — Completed 2026-05-07.
- [x] **CORE-043** [opus] | release v1.0.0 — Completed 2026-05-07.
- [x] **CORE-EPIC-042** [opus] | workflow architecture rethink — Completed 2026-05-07.
  - [x] **CORE-042.1** [opus] | discovery — Completed 2026-05-06.
  - [x] **CORE-042.2** [opus] | SPEC modularization — Completed 2026-05-06.
  - [x] **CORE-042.3** [opus] | frontmatter audit — Completed 2026-05-06.
  - [x] **CORE-042.4** [opus] | status source-of-truth — Completed 2026-05-06.
  - [x] **CORE-042.5** [opus] | micro-tasknote — Completed 2026-05-06.
  - [x] **CORE-042.6** [opus] | phase rethink Discovery — Completed 2026-05-06.
  - [x] **CORE-042.7** [opus] | 4-phase dedup — Completed 2026-05-06.
  - [x] **CORE-042.8** [opus] | audit — Completed 2026-05-07.
  - [x] **CORE-042.9** [opus] | SKILL-side lazy-load — Completed 2026-05-07.

- [x] **FE-009** [opus] | viz dark mode — Completed 2026-05-07.
- [x] **FE-016** [opus] | viz consume archive — Completed 2026-05-07.
- [x] **CORE-036** [opus] | PLAN.md `## Completed` archive strategy — Completed 2026-05-07.
- [x] **CORE-033** [sonnet] | extract legacy/ to a tag — Completed 2026-05-06.
- [x] **CORE-032** [opus] | starter promotion verification — Completed 2026-05-06.
- [x] **CORE-031** [opus] | archive search in Phase 1 — Completed 2026-05-06.
- [x] **CORE-039** [opus] | SPEC.md prose tightening sweep — Completed 2026-05-06.
- [x] **CORE-038** [opus] | task SKILL.md cite-don't-restate — Completed 2026-05-06.
- [x] **CORE-040** [opus] | PLAN.md filing discipline — Completed 2026-05-05.
- [x] **CORE-037** [opus] | workflow token-cost audit — Completed 2026-05-05.
- [x] **FE-011** [opus] | viz auto-refresh on file change — Completed 2026-05-05.
- [x] **FE-013** [sonnet] | viz polish bundle — Completed 2026-05-04.
- [x] **FE-007** [sonnet] | viz refactor: split App.tsx — Completed 2026-05-04.
- [x] **FE-015** [sonnet] | filter chips include no-tasknote rows — Completed 2026-05-04.
- [x] **FE-008** [opus] | viz row-density redesign — Completed 2026-05-04.
- [x] **CORE-030** [opus] | "blocked" workflow phase — Completed 2026-05-04.
- [x] **CORE-029** [opus] | epic lifecycle — Completed 2026-05-04.
- [x] **CORE-035** [sonnet] | retire "Last updated:" line — Completed 2026-05-04.
- [x] **CORE-034** [sonnet] | priority-name reconciliation — Completed 2026-05-04.
- [x] **CORE-028** [sonnet] | release v0.4.0 — Completed 2026-05-03.
- [x] **FE-006** [opus] | viz/ starter chip — Completed 2026-05-03.
- [x] **CORE-027** [opus] | starter tasknotes — Completed 2026-05-03.
- [x] **CORE-026** [sonnet] | remove "Pinned to:" version line — Completed 2026-05-02.
- [x] **CORE-025** [sonnet] | release v0.3.0 — Completed 2026-05-02.
- [x] **FE-003** [opus] | wikilink resolution — Completed 2026-05-02.
- [x] **CORE-024** [opus] | PLAN.md signal extraction — Completed 2026-05-02.
- [x] **CORE-023** [opus] | task-line grammar — Completed 2026-05-02.
- [x] **FE-005** | viz vertical list redesign — Completed 2026-05-02.
- [x] **FE-004** | viz consume frontmatter — Completed 2026-05-01.
- [x] **CORE-020** | /new-project + MIGRATION.md update — Completed 2026-05-01.
- [x] **CORE-017** | tasknote frontmatter — Completed 2026-05-01.
- [x] **CORE-018** | tasknote body shape — Completed 2026-05-01.
- [x] **CORE-021** | natabula migration (de-scoped) — Completed 2026-05-01.
- [x] **CORE-022** | Working in Obsidian README section — Completed 2026-05-01.
- [x] **FE-001** | viz/ Kanban v1 — Completed 2026-04-30.
- [x] **CORE-007** | photard migration — Completed 2026-04-30.
- [x] **CORE-008** | InvisiPaw migration playbook — Completed 2026-04-30.
- [x] **CORE-010** | ~/Code/CLAUDE.md flowtron pointer — Completed 2026-04-30.
- [x] **CORE-011** | delete TasknoteSystem/ — Completed 2026-04-30.
- [x] **CORE-012** | /new-project skill — Completed 2026-04-30.
- [x] **CORE-013** | ghost CHANGELOG.md refs — Completed 2026-04-30.
- [x] **CORE-014** | release v0.1.1 — Completed 2026-04-30.
- [x] **CORE-015** | doc cleanup sweep — Completed 2026-04-30.
- [x] **CORE-001** | bootstrap hard reset — Completed 2026-04-28.
- [x] **CORE-002** | draft SPEC.md — Completed 2026-04-28.
- [x] **CORE-003** | build templates/ — Completed 2026-04-28.
- [x] **CORE-004** | build claude/ + self-hosting — Completed 2026-04-28.
- [x] **CORE-005** | PHILOSOPHY + MIGRATION docs — Completed 2026-04-28.
- [x] **CORE-006** | release v0.1.0 — Completed 2026-04-28.
