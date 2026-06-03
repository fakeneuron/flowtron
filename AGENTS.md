# Flowtron Agent Guide

## Workflow

This repository is **flowtron** itself. The canonical workflow contract lives
in `SPEC.md`; read it before starting non-trivial work.

- Plans live in `.flowtron/PLAN.md`.
- Active tasknotes live in `.flowtron/tasknote/<TASK-ID>.md`.
- Completed tasknotes live in `.flowtron/tasknote/archive/<area>/<TASK-ID>.md`.
- Tasknote templates live in `templates/`.
- Lazy workflow modules live in `SPEC/` and are loaded when the task shape
  calls for them.

Flowtron self-hosts its own roadmap. For non-trivial edits, follow the
tasknote lifecycle from `SPEC.md`: Discovery -> Execution -> Testing &
Linting -> Closure. Do not skip phases unless the user explicitly asks for a
small direct change.

## Repo Layout

- `SPEC.md` — canonical workflow contract.
- `SPEC/` — lazy modules for epics, starter tasks, blocked tasks, model
  routing, gates, versioning, and tasknote selection.
- `.flowtron/` — flowtron's own plan and tasknotes.
- `claude/` — Claude Code wiring: commands, skills, and the historical
  source for the agent-neutral adopter snippet.
- `docs/` — supporting docs, conventions, migration, platform compatibility,
  security, and design rationale.
- `templates/` — canonical markdown templates.
- `viz/` — Vite/React/TypeScript visualizer.

## Validation

Use the narrowest validation that covers the change. For visualizer work, the
main commands are. **Run from the repository root** (the directory containing
the `viz/` subdirectory):

```sh
npm --prefix viz test
npm --prefix viz run typecheck
npm --prefix viz run lint
npm --prefix viz run dev
```

If your shell is already inside `viz/` (common when iterating on the UI), drop
the `--prefix viz` and run the bare forms (`npm test`, `npm run typecheck`, etc.).

The visualizer dev server is pinned to port `5120` with `strictPort`.

## Editing Rules

- Treat archived tasknotes as historical records; do not rewrite them unless
  a specific workflow step requires it.
- Preserve user-owned worktree changes. Check `git status --short` before
  broad edits.
- Keep markdown GitHub-Flavored Markdown compatible.
- Follow `.editorconfig`: UTF-8, LF endings, 2-space indentation, trim
  trailing whitespace, final newline.
- This repo is not an adopter checkout. There is no `.flowtron/core/`
  submodule here; `SPEC.md` at the root is the source of truth.

## Platform Notes

Claude Code has shipped wiring under `claude/`. Other agents, including Codex
CLI, currently consume the contract conversationally through this file and
`SPEC.md`; no Codex-specific flowtron bundle ships yet.
