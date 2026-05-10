# Flowtron — PLAN.md

## Vision

A lightweight, versioned, project-agnostic tasknote system for solo
AI-assisted coding. One source of truth, consumed via git submodule by every
project under `~/code/`. Replaces the disjointed per-project workflow files
in fintown, InvisiPaw, and photard.

See [SPEC.md](../SPEC.md) for the canonical workflow contract.

## Critical

(none)

## High

(none)

## Medium

- [ ] **FE-020** [opus] | cross-project-viz-dogfooding — FE-002 follow-up: run workspace scanner against real ~/code/ projects; walk each surfaced project; log surprises and rough edges before declaring FE-002 done.
- [ ] **FE-025** [sonnet] | viz-contrast-fix — FE-019 follow-up: serious-impact contrast failure (3.83–3.91:1, expected 4.5:1) on `text-slate-400 dark:text-slate-500` for small text in `PrioritySection.tsx:65` ("No tasks" placeholder) and `SubtaskRow.tsx:48` (completed-date badge). Swap to `text-slate-500 dark:text-slate-400` (or another ≥4.5:1 pair) and verify in both themes.

## Low

- [ ] **FE-026** [opus] | viz-bundle-code-split — FE-019 follow-up: ~80 KiB (~65% of gzipped JS) unused at first paint. Lazy-load `WikilinkMarkdown` (carries `react-markdown` + `remark-gfm`, only mounted when a row's detail panel is expanded) and dynamic-import `gray-matter` from the parser. Target: drop initial-bundle gzip from ~124 KB toward ~50 KB.

## Future Opportunities

(none)

## Completed

- [x] **FE-019** [opus] | viz-a11y-perf-pass — Completed 2026-05-10.
- [x] **CORE-067** [opus] | gate-UX check-in — Completed 2026-05-10.
- [x] **FE-024** [opus] | viz-app-decomposition — Completed 2026-05-10.
- [x] **CORE-068** [opus] | committed-state-marker — Completed 2026-05-10.
- [x] **CORE-066** [opus] | gate-UX refinements — Completed 2026-05-10.
- [x] **FE-023** [opus] | viz-constants-consolidation — Completed 2026-05-10.
- [x] **FE-022** [opus] | viz-id-prefix-helpers — Completed 2026-05-10.
- [x] **FE-021** [opus] | viz-row-outline-dedup — Completed 2026-05-10.
- [x] **FE-018** [opus] | viz-code-token-audit — Completed 2026-05-10.
- [x] **CORE-065** [opus] | trim gates to 2 — Completed 2026-05-09.
- [x] **CORE-059** [opus] | task workflow visual gate cues — Completed 2026-05-09.
- [x] **CORE-064** [sonnet] | equalize step-1.5 fragments — Completed 2026-05-09.
- [x] **CORE-063** [sonnet] | equalize stub cross-refs — Completed 2026-05-09.
- [x] **CORE-062** [sonnet] | lift date-format bullet — Completed 2026-05-09.
- [x] **CORE-061** [opus] | FUTURE.md cleanup — Completed 2026-05-09.
- [x] **CORE-056** [opus] | conventions-techdebt-audit — Completed 2026-05-09.
- [x] **CORE-055** [opus] | CLAUDE-snippet-review — Completed 2026-05-09.
- [x] **CORE-060** [opus] | release v1.3.0 — Completed 2026-05-09.
- [x] **CORE-EPIC-057** [opus] | expand-shipped-skills — Completed 2026-05-09.
  - [x] **CORE-057.1** [opus] | discovery — Completed 2026-05-09.
  - [x] **CORE-057.2** [opus] | /release skill — Completed 2026-05-09.
  - [x] **CORE-057.3** [opus] | /epic-discovery skill — Completed 2026-05-09.
  - [x] **CORE-057.4** [opus] | /close-epic skill — Completed 2026-05-09.
  - [x] **CORE-057.5** [opus] | /file-followup skill — Completed 2026-05-09.
  - [x] **CORE-057.6** [opus] | audit — Completed 2026-05-09.
  - [x] **CORE-057.7** [opus] | epic-md inline-cmds — Completed 2026-05-09.
  - [x] **CORE-057.8** [opus] | command-stub cross-refs — Completed 2026-05-09.
- [x] **CORE-058** [opus] | task-skill early model-switch catch — Completed 2026-05-09.
- [x] **CORE-054** [opus] | expand-shipped-skills — Completed 2026-05-09.
- [x] **CORE-053** [opus] | MIGRATION-variant-trim — Completed 2026-05-09.
- [x] **CORE-052** [opus] | tasknote-README variant trim — Completed 2026-05-09.
- [x] **CORE-051** [opus] | starter-task SKILL cite-don't-restate — Completed 2026-05-09.
- [x] **CORE-050** [opus] | micro-task SKILL cite-don't-restate — Completed 2026-05-09.
- [x] **CORE-049** [opus] | workflow token audit — Completed 2026-05-08.
- [x] **FE-002** [opus] | cross-project viz — Completed 2026-05-08.
- [x] **CORE-048** [opus] | release v1.2.0 — Completed 2026-05-08.
- [x] **CORE-016** [opus] | InvisiPaw migration (executed out-of-band) — Completed 2026-05-08. Done in InvisiPaw's own repo chat; flowtron now adopted there.
- [x] **CORE-EPIC-009** [opus] | fintown migration (executed out-of-band) — Completed 2026-05-08. Done in fintown's own repo chat; flowtron now adopted there. Children CORE-009.1–.5 closed as part of the same migration.
- [x] **CORE-047** [opus] | doc-set drift contract — Completed 2026-05-08.
- [x] **FE-012** [opus] | viz inbound wikilink back-refs — Completed 2026-05-07.
- [x] **CORE-046** [opus] | flowtron v1.1.0 — post-closure /model + recap-only — Completed 2026-05-07.
- [x] **FE-014** [opus] | viz UI component tests — Completed 2026-05-07.
- [x] **FE-010** [opus] | viz keyboard nav — Completed 2026-05-07.
- [x] **CORE-045** [opus] | MIGRATION.md pre-flight + post-cleanup — Completed 2026-05-07.
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
