# Tasknote Directory (flowtron self-host)

This directory holds active tasknotes and archived tasknotes for flowtron's
own development. The canonical workflow lives in [`SPEC.md`](../../SPEC.md)
at the repo root; canonical tasknote templates ship at `templates/`.

## Layout

- `<TASK-ID>.md` — active tasknote (one per task in flight)
- `archive/<area>/<TASK-ID>.md` — completed tasknotes, one folder per area
- `templates/` (at repo root) — `tasknote-template.md`, `tasknote-starter-template.md`, `tasknote-micro-template.md`, `tasknote-README.md`, `PLAN.md`

## Area prefixes

Flowtron uses only the canonical prefixes defined in [`SPEC.md` §"Task ID convention"](../../SPEC.md) — `CORE-`, `BE-`, `FE-`, `DB-`, `DEPLOY-`, `TEST-`. No project-specific prefixes.

## Archive layout

| Prefix | Folder |
|--------|--------|
| `CORE-*` | `archive/core/` |
| `FE-*` | `archive/frontend/` |

Other area folders are created when the first tasknote in that area lands.

## AI-referenced docs

Canonical docs that AI sessions consume as cold-start ground truth — the
project-declared doc set walked at every Phase 4 closure (per
[`SPEC.md` §"🚀 Phase 4: Closure"](../../SPEC.md)) and at every epic-audit
subtask (per [`SPEC/epic.md`](../../SPEC/epic.md)). Flat list, one-line
purpose each.

- `README.md` — public-facing flowtron repo overview
- `SPEC.md` — canonical workflow contract; primary AI cold-start surface
- `docs/MIGRATION.md` — adoption + bump procedures for adopting projects
- `claude/CLAUDE-snippet.md` — block adopters paste into their CLAUDE.md (defines adopters' assistant-facing surface)

`SPEC/*.md` (lazy modules) and `claude/skills/*/SKILL.md` are loaded on
demand by skill stubs — authoritative when fired, but not part of the
default cold-start sweep.

## Project quick commands

- Viz tests: `cd viz && npm test`
- Viz lint: `cd viz && npm run lint`
- Viz dev server: `cd viz && npm run dev`
