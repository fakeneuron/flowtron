# Flowtron adoption snippet

This snippet has two parts: a markdown block to paste into your project's `CLAUDE.md`, and one-time symlink commands to wire `/task` into your project's `.claude/`.

The pasted block is the single source of truth for flowtron's workflow-contract prose — keep it intact and contiguous. Project-specific instructions (architecture notes, non-negotiables, quick commands) live in other sections of `CLAUDE.md`, above or below the block, never interleaved. When bumping the pinned flowtron version, replace the block wholesale rather than merging line-by-line.

For more on what else lives in `CLAUDE.md` and how it composes around the block, see [`docs/MIGRATION.md`](../docs/MIGRATION.md) §"Extending `CLAUDE.md`".

---

## Block to paste into CLAUDE.md

```markdown
## Workflow

This project uses **flowtron** for task tracking. The canonical workflow contract lives at `_project/flowtron/SPEC.md` — read it before starting non-trivial work.

- Plans live in `_project/PLAN.md`.
- Tasknotes live in `_project/tasknote/<TASK-ID>.md` while active and `_project/tasknote/archive/<area>/<TASK-ID>.md` once closed.
- Start a task with `/task <TASK-ID>` (e.g., `/task BE-014`). The slash command scaffolds the tasknote from the flowtron template and drives Phase 1 Discovery before any code is written.
- Every tasknote runs the 4-phase workflow in serial order — Discovery → Execution → Testing & Linting → Closure — followed by the post-closure protocol (commit + next-task suggestion). Do not skip phases.
- Each tasknote header carries a `Model` field (`opus` / `sonnet`). The task runs end-to-end on the tagged model. If the loaded model doesn't match, surface the mismatch before continuing.
- The `_project/flowtron/` submodule is read-only here. Edits go upstream to flowtron and arrive via deliberate version bumps — see `_project/flowtron/SPEC.md` §"Versioning" and `_project/tasknote/README.md` for the pinned version.
```

---

## One-time symlink wiring

Run these from the project root after adding the flowtron submodule at `_project/flowtron/`:

```sh
mkdir -p .claude/commands .claude/skills
ln -s ../../_project/flowtron/claude/commands/task.md .claude/commands/task.md
ln -s ../../_project/flowtron/claude/skills/task     .claude/skills/task
```

The relative paths are intentional — they survive `git clone` and pin to whichever flowtron commit the submodule is checked out at. Commit the symlinks (`git add .claude/`).

To verify: type `/task` in Claude Code. The command should appear in the slash-command list with the description from `commands/task.md`.

## Bumping the pinned flowtron version

Submodule bumps are themselves a project-side task (e.g., `CORE-XXX: Bump flowtron to vX.Y.Z`). Flowtron has no `CHANGELOG.md` — release notes and migration steps live in the annotated tag message (`cd _project/flowtron && git show vX.Y.Z`) and the per-release tasknote in `_project/flowtron/_project/tasknote/archive/core/`. The symlinks above don't change on bump — they always track whatever the submodule currently points at.
