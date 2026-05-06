# Tasknote Directory

This directory holds active tasknotes, the local tasknote template, and
archived tasknotes for completed work. The canonical workflow lives in
`_project/flowtron/SPEC.md`.

## Flowtron version

The flowtron repo is checked out as a git submodule at `_project/flowtron/`.
Bumping the pinned version is itself a project task — see the annotated tag
message (`cd _project/flowtron && git show vX.Y.Z`) and the per-release
tasknote in `_project/flowtron/_project/tasknote/archive/core/` for migration
steps when crossing a major version.

## Layout

- `tasknote-template.md` — copy this when starting a new task. Tasknotes carry a YAML frontmatter block (`title`, `status`, `priority`, `area`, `tags`, `created`, `due`, `related-tasks`) followed by a spec-on-top + log-below body: nav header + `🎯 Goal` / `✅ Acceptance` / `🧩 Subtasks` / `🔗 Related` sections above a divider, then the four phase sections (`📝 Discovery` / `🛠️ Execution` / `🧪 Testing` / `🚀 Closure`) below. The model assignment (`opus` | `sonnet`) lives on the PLAN.md task line, not in the frontmatter — see `_project/flowtron/SPEC.md` §"Task-line format" + `_project/flowtron/SPEC/model.md`. Cross-references use `[[TASK-ID]]` wikilinks. See the template for the canonical schema, §"Tasknote frontmatter" for field contracts, and §"Tasknote body shape" for the body layout.
- `tasknote-starter-template.md` — copy this when filing a starter via `/starter-task` for a task discovered mid-flow with rich AI-captured context that isn't ready to start. Starters share the standard YAML frontmatter but use `status: starter` and a single body section (`## 🌱 Starter context`); spec sections + phase scaffolding are added at `/task` promotion. See `_project/flowtron/SPEC/starter.md` for the lifecycle.
- **Epic lifecycle** — for code-sweep or major multi-child feature epics, bracket the implementation children with a **Discovery** subtask (`<AREA>-<N>.1`, plans the children) and an **Audit** subtask (final `.N`, verifies the completed work). See `_project/flowtron/SPEC/epic.md`. Simple implementations don't need it.
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
