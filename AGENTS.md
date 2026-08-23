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
- Start a task with `/ft-task <TASK-ID>`; peer skills: `/ft-spec`, `/ft-micro-task`, `/ft-starter-task`, `/ft-file-followup` (`--park [--low|--med|--fut|--high]`), `/ft-epic-discovery`, `/ft-close-epic`, `/ft-task --debug`, `/ft-goal-task`, `/ft-refactor`, `/ft-worktree-start`, `/ft-worktree-end`, `/ft-release`. <!-- KEEP IN SYNC: this peer-skill roster is a names-only list except `/ft-file-followup`'s park-priority flags (Pair F release gate); richer detail (stubs, gates) lives in claude/AGENTS-snippet.md's paste-block and SPEC/tasknote-selection.md — adding/removing a tasknote-family skill requires editing both. Version-bump skills are checkout-specific: this self-host guide names `/ft-release`; the adopter paste-block names `/ft-update`. -->
- Each PLAN.md task line carries a `[model]` segment (see `SPEC/model.md` §"Model field" for practical/agent-aware guidance and the model-mismatch surface cue). The task runs end-to-end on the tagged model.

Flowtron self-hosts its own roadmap. For non-trivial edits, follow the
tasknote lifecycle from `SPEC.md`: Discovery -> Execution -> Testing &
Linting -> Closure. Do not skip phases unless the user explicitly asks for a
small direct change.

## Repo Layout

- `SPEC.md` — canonical workflow contract.
- `SPEC/` — lazy modules for epics, starter tasks, blocked tasks, model
  routing, gates, versioning, tasknote selection, and loop tasks.
- `.flowtron/` — flowtron's own plan and tasknotes.
- `claude/` — Claude Code wiring: commands, skills, and the historical
  source for the agent-neutral adopter snippet.
- `codex/` — Codex CLI skill wrappers and wiring notes.
- `cursor/` — Cursor thin wiring (snippet + `ft-task` procedure pointer; no skill wrappers).
- `grok/` — Grok thin wiring (snippet + `ft-task` procedure pointer; no skill wrappers).
- `docs/` — supporting docs, conventions, migration, platform compatibility,
  and design rationale.
- `templates/` — canonical markdown templates.
- `tools/` — operator-side fleet scripts (`update-adopters.mjs` + tests).
- `viz/` — Vite/React/TypeScript visualizer.

## Validation

Use the narrowest validation that covers the change. For visualizer work, run
the main commands from the repository root (the directory containing the
`viz/` subdirectory):

```sh
npm --prefix viz test
npm --prefix viz run typecheck
npm --prefix viz run lint
```

If your shell is already inside `viz/` (common when iterating on the UI), drop
the `--prefix viz` and run the bare forms (`npm test`, `npm run typecheck`, etc.).

For the fleet updater, run its portable zero-dependency suite and syntax checks
from the repository root:

```sh
node --test tools/update-adopters.test.mjs
node --check tools/update-adopters.test.mjs
node --check tools/update-adopters.mjs
```

The suite is a release gate; do not substitute a live adopter-fleet dry run or
an `--apply` operation for it.

## Dev Server

To preview the visualizer locally, start the dev server from the repository root:

```sh
npm --prefix viz run dev
```

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

Claude Code has shipped wiring under `claude/`. Codex CLI has first-class
skill wrappers under `codex/` for the full `ft-*` inventory; `ft-task` routes
through `SPEC/procedures/`. Cursor has a thin sibling under `cursor/`
(`AGENTS-snippet.md` + procedure pointer; adopters wire canonical
`claude/skills/` bodies into `.cursor/skills/` or reuse `.claude/`). Grok
has a thin sibling under `grok/` (`AGENTS-snippet.md` + procedure pointer;
adopters reuse Claude/Codex/Cursor wiring or symlink canonical
`claude/skills/` bodies into `.grok/skills/`). Other agents consume the
contract conversationally through this file and `SPEC.md`.
