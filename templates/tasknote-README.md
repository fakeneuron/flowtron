# Tasknote Directory

This directory holds active tasknotes, the local tasknote template, and
archived tasknotes for completed work. The canonical workflow lives in
`_project/flowtron/SPEC.md`.

## Flowtron version

**Pinned to:** v0.1.0

The flowtron repo is checked out as a git submodule at `_project/flowtron/`.
Bumping the pinned version is itself a project task — see flowtron's
`CHANGELOG.md` for migration steps when crossing a major version.

## Layout

- `tasknote-template.md` — copy this when starting a new task
- `<TASK-ID>.md` — active tasknote (one per task in flight)
- `archive/<area>/<TASK-ID>.md` — completed tasknotes, one folder per area

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

## Project quick commands

Replace this section with the commands an assistant should run for this
project. Keep it terse and high-signal.

- Tests: `pytest tests/` or `npm test`
- Type check: `npm run typecheck`
- Lint: `ruff check .` or `npm run lint`
- Dev server: `npm run dev`
