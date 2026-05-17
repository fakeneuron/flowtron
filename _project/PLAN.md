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

(none)

## Low

(none)

## Future Opportunities

- [ ] **CORE-EPIC-097** [opus] | external-skill-survey — Survey skills bundled by comparable claude-code / AI-coding workflow repos (GitHub-style CLI workflows, caveman-claude's token-minimization pattern popularized on social media, etc.). Discovery deliverable: shortlist of skills worth adopting into flowtron + adoption rationale per candidate.
  - [ ] **CORE-097.1** [opus] | discovery — Scope which comparable repos to survey + adoption criteria + per-candidate findings per SPEC/epic.md.
- [ ] **CORE-EPIC-099** [opus] | external-conventions-survey — Investigate missing/expected workflow conventions flowtron should adopt or be compatible with (commit conventions, semver discipline, markdown patterns, Obsidian/Foam interop, etc.). Discovery deliverable: gap analysis + adoption candidates.
  - [ ] **CORE-099.1** [opus] | discovery — Survey external workflow / convention surfaces + identify gaps + recommend adoptions per SPEC/epic.md.
- [ ] **CORE-100** [opus] | flowtron-nat-011 investigation — Investigate what `flowtron-nat-011` is, what it depends on, and whether it has any true function. Confirm safe-to-delete from disk, then delete the project directory + remove from the viz workspace projects list.
- [ ] **FE-EPIC-033** [opus] | theme-system — Review viz's overall color schema and add a selectable themes picker (light/dark already exist; goal is multiple curated palettes). Discovery deliverable: palette inventory + reference themes + storage + picker UI sketch.
  - [ ] **FE-033.3** [opus] | linear palette — Curate Linear-style palette across all 12 semantic tokens (status badges / section tints / priority badges / phase dots / row highlights / selection / neutrals); pair-tune light + dark contrast against FE-019 a11y baseline.
  - [ ] **FE-033.4** [opus] | github palette — Curate GitHub-style palette across all 12 semantic tokens; pair-tune light + dark contrast against FE-019 a11y baseline. Mirrors FE-033.3's shape with GitHub's accent family.
  - [ ] **FE-033.5** [sonnet] | picker UI — Add a Palette fieldset (radio group, parallels Density) to `SettingsModal` between Density and Detail panel; extend `visibilityPrefs.palette: 'default' | 'linear' | 'github'` with `default` default; bump schema to `version: 2`; cover in `visibilityPrefs.test.ts` + `App.test.tsx`.
  - [ ] **FE-033.6** [opus] | audit — Verify the completed theme-system epic: FE-019 a11y baseline preserved across all 3 palettes × 2 themes; bundle-size budget intact (FE-026); palette × density × visibility interactions coherent; doc-drift sweep per `SPEC/epic.md`.
- [ ] **FE-034** [sonnet] | empty priority panels — Hide PrioritySection cards with zero tasks (post-filter, respecting visibility prefs); render a subtle muted footer at page bottom ("No tasks in: Critical · Low") listing empty sections, comma-joined; collapse to "No tasks in this project" when all are empty. Priority view only.

## Completed

- [x] **CORE-102** [opus] | release v2.2.0 — Completed 2026-05-17.
- [x] **CORE-101** [opus] | audit-family bundle — Completed 2026-05-17.
- [x] **FE-033.2** [opus] | palette architecture — Completed 2026-05-17.
- [x] **FE-033.1** [opus] | discovery — Completed 2026-05-17.
- [x] **FE-032** [opus] | projectselector-restyle — Completed 2026-05-16.
- [x] **CORE-EPIC-098** [opus] | viz-embellishment — Completed 2026-05-16. Children CORE-098.1–.15 archived; closure consumed the subtask list per epic-close convention.
- [x] **CORE-095** [sonnet] | wikilink-form self-sweep — Completed 2026-05-15.
- [x] **CORE-096** [sonnet] | audit-fork CHANGELOG residue — Completed 2026-05-15.
- [x] **CORE-094** [opus] | release v2.1.0 — Completed 2026-05-14.
- [x] **CORE-091** [opus] | wiring-snippet single-source collapse — Completed 2026-05-14.
- [x] **CORE-090** [sonnet] | flowtron-info-skill adopter framing — Completed 2026-05-14.
- [x] **CORE-093** [sonnet] | SPEC tasknote-template claim trim — Completed 2026-05-14.
- [x] **CORE-092** [sonnet] | epic-discovery cite-don't-restate — Completed 2026-05-14.
- [x] **CORE-088** [opus] | gate-UX check-in 2 — Completed 2026-05-14.
- [x] **CORE-089** [opus] | conditional-precommit-gate — Completed 2026-05-14.
- [x] **CORE-087** [opus] | conditional-phase2-gate — Completed 2026-05-14.
- [x] **FE-031** [opus] | viz-chip-system-trim — Completed 2026-05-14.
- [x] **CORE-086** [sonnet] | contract-surface-fence-langtags — Completed 2026-05-14.
- [x] **CORE-085** [opus] | flowtron-skill-phase-row — Completed 2026-05-14.
- [x] **CORE-084** [sonnet] | flowtron-info-skill — Completed 2026-05-11.
- [x] **CORE-083** [sonnet] | release v2.0.1 — Completed 2026-05-11.
- [x] **CORE-082** [sonnet] | audit doc-drift sweep — Completed 2026-05-11.
- [x] **CORE-081** [opus] | release-skill example genericize — Completed 2026-05-11.
- [x] **CORE-080** [opus] | release v2.0.0 — Completed 2026-05-11.
- [x] **FE-030** [opus] | viz-load-stale-state-on-failure — Completed 2026-05-11.
- [x] **FE-029** [opus] | viz-archive-cold-start-500 — Completed 2026-05-11.
- [x] **FE-020** [opus] | cross-project-viz-dogfooding — Completed 2026-05-11.
- [x] **CORE-079** [sonnet] | spec-fence-langtags — Completed 2026-05-11.
- [x] **CORE-078** [sonnet] | plan-none-placeholder — Completed 2026-05-10.
- [x] **CORE-077** [opus] | viz-mvp-residue — Completed 2026-05-10.
- [x] **CORE-076** [sonnet] | wikilink-token placeholder hygiene — Completed 2026-05-10.
- [x] **CORE-074** [sonnet] | cite-not-restate sweep — Completed 2026-05-10.
- [x] **CORE-075** [opus] | drop Last-updated residue — Completed 2026-05-10.
- [x] **CORE-073** [opus] | audit-flowtron-self — Completed 2026-05-10.
- [x] **CORE-072** [opus] | audit-skill — Completed 2026-05-10.
- [x] **CORE-070** [opus] | repo-layout-doc-currency — Completed 2026-05-10.
- [x] **CORE-071** [opus] | release-global-install-doc — Completed 2026-05-10.
- [x] **CORE-069** [opus] | template-status-default — Completed 2026-05-10.
- [x] **FE-026** [opus] | viz-bundle-code-split — Completed 2026-05-10.
- [x] **FE-028** [opus] | viz-archive-cache — Completed 2026-05-10.
- [x] **FE-027** [sonnet] | viz-archive-500-race — Completed 2026-05-10. Subsumed by FE-028's promise-valued cache (in-flight de-dup eliminates the race).
- [x] **FE-025** [sonnet] | viz-contrast-fix — Completed 2026-05-10.
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
