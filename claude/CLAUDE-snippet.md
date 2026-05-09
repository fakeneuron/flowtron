# Flowtron adoption snippet

Paste the block below into your project's `CLAUDE.md`, then run the symlink commands once to wire flowtron's slash commands into your project's `.claude/`.

---

## Block to paste into CLAUDE.md

```markdown
## Workflow

This project uses **flowtron** for task tracking. The canonical workflow contract lives at `_project/flowtron/SPEC.md` — read it before starting non-trivial work.

- Plans live in `_project/PLAN.md`.
- Tasknotes live in `_project/tasknote/<TASK-ID>.md` while active and `_project/tasknote/archive/<area>/<TASK-ID>.md` once closed.
- Start a task with `/task <TASK-ID>` (e.g., `/task BE-014`). The slash command scaffolds the tasknote from the flowtron template and drives Phase 1 Discovery before any code is written.
- For tasks discovered mid-flow with rich context that aren't ready to start, file a starter via `/starter-task <ID>` (lightweight tasknote shape; promoted to a full tasknote when `/task <ID>` runs). For tasks above the skip-tasknote threshold but small enough that the 4-phase ceremony is overkill, use `/micro-task <ID>` (single `## ⚡ Notes` section, file + execute one-shot). For mid-flow follow-ups whose long description fits in ≤50 words, use `/file-followup <ID>` (one PLAN.md line + a short conversational context paragraph; no tasknote artifact). See `_project/flowtron/SPEC.md` §"When to use a tasknote (and when not to)".
- Every tasknote runs the 4-phase workflow in serial order — Discovery → Execution → Testing & Linting → Closure — followed by the post-closure protocol (commit + next-task suggestion). Do not skip phases.
- Each PLAN.md task line carries a `[model]` segment (`opus` / `sonnet`). The task runs end-to-end on the tagged model. If the loaded model doesn't match, surface the mismatch before continuing.
- The `_project/flowtron/` submodule is read-only here. Edits go upstream to flowtron and arrive via deliberate version bumps — see `_project/flowtron/SPEC/versioning.md` and `_project/tasknote/README.md` for the pinned version.
```

---

## One-time symlink wiring

Run these from the project root after adding the flowtron submodule at `_project/flowtron/`:

```sh
mkdir -p .claude/commands .claude/skills
ln -s ../../_project/flowtron/claude/commands/task.md          .claude/commands/task.md
ln -s ../../_project/flowtron/claude/commands/starter-task.md  .claude/commands/starter-task.md
ln -s ../../_project/flowtron/claude/commands/micro-task.md    .claude/commands/micro-task.md
ln -s ../../_project/flowtron/claude/commands/file-followup.md .claude/commands/file-followup.md
ln -s ../../_project/flowtron/claude/skills/task          .claude/skills/task
ln -s ../../_project/flowtron/claude/skills/starter-task  .claude/skills/starter-task
ln -s ../../_project/flowtron/claude/skills/micro-task    .claude/skills/micro-task
ln -s ../../_project/flowtron/claude/skills/file-followup .claude/skills/file-followup
```

The relative paths are intentional — they survive `git clone` and pin to whichever flowtron commit the submodule is checked out at. Commit the symlinks (`git add .claude/`).

To verify: type `/task` in Claude Code. The command should appear in the slash-command list (alongside `/starter-task`, `/micro-task`, and `/file-followup`) with the description from `commands/task.md`.

## Bumping the pinned flowtron version

Submodule bumps are themselves a project-side task (e.g., `CORE-XXX: Bump flowtron to vX.Y.Z`). Flowtron has no `CHANGELOG.md` — release notes and migration steps live in the annotated tag message (`cd _project/flowtron && git show vX.Y.Z`) and the per-release tasknote in `_project/flowtron/_project/tasknote/archive/core/`. The symlinks above don't change on bump — they always track whatever the submodule currently points at.

## Visualizer

The flowtron visualizer is a single global instance — run it **once per machine** from flowtron's own checkout, not from this project's `_project/flowtron/viz/`:

```sh
cd ~/code/flowtron/viz && npm run dev
```

It scans `${FLOWTRON_VIZ_WORKSPACE:-~/code}/*/_project/PLAN.md` and renders every adopting project; the header-rail project selector swaps the active project. Port `5173` is pinned with `strictPort`, so a second instance fails fast. The adopter-side `_project/flowtron/viz/` still works for offline / submodule-pinned use, but the global instance above is the recommended path.
