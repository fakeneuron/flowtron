# Tasknote Directory

This directory holds active tasknotes and archived tasknotes for completed
work. Tasknote templates are resolved from the flowtron submodule at
`_project/flowtron/templates/`. The canonical workflow lives in
`_project/flowtron/SPEC.md`.

## Flowtron version

The flowtron repo is checked out as a git submodule at `_project/flowtron/`.
Bumping the pinned version is itself a project task — see the annotated tag
message (`cd _project/flowtron && git show vX.Y.Z`) and the per-release
tasknote in `_project/flowtron/_project/tasknote/archive/core/` for migration
steps when crossing a major version.

## Layout

- `<TASK-ID>.md` — active tasknote (one per task in flight)
- `archive/<area>/<TASK-ID>.md` — completed tasknotes, one folder per area

Tasknotes are scaffolded automatically by the slash commands from
`_project/flowtron/templates/`; inspect those files directly for the
canonical shapes. Three variants:

- **Standard 4-phase tasknote** — `/ft-task <ID>` scaffolds from `tasknote-template.md`; full schema at `_project/flowtron/SPEC.md` §"Tasknote frontmatter" + §"Tasknote body shape" (model assignment lives on the PLAN.md task line — see §"Task-line format").
- **Starter tasknote** — `/ft-starter-task <ID>` scaffolds from `tasknote-starter-template.md` for mid-flow context capture; lifecycle at `_project/flowtron/SPEC/starter.md`.
- **Micro-tasknote** — `/ft-micro-task <ID>` scaffolds from `tasknote-micro-template.md` for tasks above the skip-tasknote threshold but below full 4-phase ceremony; threshold at `_project/flowtron/SPEC.md` §"When to use a tasknote (and when not to)".
- **Epic lifecycle** — for code-sweep or major multi-child feature epics, bracket the implementation children with a **Discovery** subtask (`<AREA>-<N>.1`, plans the children) and an **Audit** subtask (final `.N`, verifies the completed work). See `_project/flowtron/SPEC/epic.md`. Simple implementations don't need it.

## Area prefixes

Canonical prefixes (defined by flowtron):

| Prefix | Area |
|--------|------|
| `CORE-` | cross-cutting, orchestration, project-wide |
| `BE-` | backend |
| `FE-` | frontend |
| `DB-` | database, migrations |
| `DEPLOY-` | deployment, CI/CD, infra |
| `TEST-` | testing infrastructure |

Project-specific prefixes (declare yours here, or delete this section if none):

| Prefix | Area | Notes |
|--------|------|-------|
| `XXX-` | example | replace or remove |

## Archive layout

| Prefix | Folder |
|--------|--------|
| `CORE-*` | `archive/core/` |
| `BE-*` | `archive/backend/` |
| `FE-*` | `archive/frontend/` |
| `DB-*` | `archive/database/` |
| `DEPLOY-*` | `archive/deployment/` |
| `TEST-*` | `archive/testing/` |

Project-specific prefixes archive under their own subfolder named for the area
(e.g., `OCR-*` → `archive/ocr/`).

## AI-referenced docs

Canonical docs that AI sessions consume as cold-start ground truth — the
project-declared doc set walked at every Phase 4 closure (per
`_project/flowtron/SPEC.md` §"🚀 Phase 4: Closure") and at every
epic-audit subtask (per `_project/flowtron/SPEC/epic.md`). Flat list,
one-line purpose each. Extend as the architecture matures (architecture
notes, API specs, DB schema docs, ADRs, inventories).

- `README.md` — project overview, current shipped feature surface
- `CLAUDE.md` — assistant-facing project guide; quick commands, conventions
- `_project/PLAN.md` — roadmap and active task queue

## Project quick commands

Replace this section with the commands an assistant should run for this
project. Keep it terse and high-signal.

- Tests: `pytest tests/` or `npm test`
- Type check: `npm run typecheck`
- Lint: `ruff check .` or `npm run lint`
- Dev server: `npm run dev`
