# Flowtron adoption snippet

Paste the block below into your project's `AGENTS.md`, then run the symlink commands once to wire flowtron's slash commands into your project's `.claude/`.

---

## Block to paste into AGENTS.md

```markdown
## Workflow

This project uses **flowtron** for task tracking. The canonical workflow contract lives at `_project/flowtron/SPEC.md` — read it before starting non-trivial work.

- Plans live in `_project/PLAN.md`.
- Tasknotes live in `_project/tasknote/<TASK-ID>.md` while active and `_project/tasknote/archive/<area>/<TASK-ID>.md` once closed.
- Start a task with `/ft-task <TASK-ID>` (e.g., `/ft-task BE-014`). The slash command scaffolds the tasknote from the flowtron template and drives Phase 1 Discovery before any code is written.
- Other filing skills for non-task-shaped work: `/ft-starter-task <ID>` (rich-context filing, not yet ready to start), `/ft-micro-task <ID>` (small task too light for the 4-phase ceremony), `/ft-file-followup <ID>` (≤50w note, no tasknote artifact), `/ft-epic-discovery` and `/ft-close-epic <ID>` (multi-child code-sweep or feature epics). See `_project/flowtron/SPEC.md` §"When to use a tasknote (and when not to)" and `_project/flowtron/SPEC/epic.md` for the per-skill shape and lifecycle details.
- For independent children of a multi-child epic, the optional worktree convention (location `~/code/<p>-worktrees/wt-<ID>/`, branch `wt-<ID>`, tasknote copy) lets you execute siblings in parallel isolated checkouts. Full details: `_project/flowtron/docs/WORKTREES.md`. The two thin skills (`/ft-worktree-start` / `end`) wire the same way as the rest of the tasknote family.
- For bugs and unexpected behavior, `/ft-debug <TASK-ID>` is a peer to `/ft-task` that drives the standard 4-phase template with a hypothesis-first cadence (expected/observed → ranked hypotheses → minimal repro → re-verify) embedded inside Phase 1 Discovery. Soft scaffolding, not a gate; same `--fast` semantics as `/ft-task`.
- Standard tasknotes (`/ft-task`) run the 4-phase workflow in serial order — Discovery → Execution → Testing & Linting → Closure — followed by the post-closure protocol (commit + next-task suggestion). Do not skip phases. `/ft-micro-task` uses a lighter single-section ceremony in place of the full 4-phase flow.
- Each PLAN.md task line carries a `[model]` segment (see `SPEC/model.md` §"Model field" for practical/agent-aware guidance, examples, and realistic defaults such as Grok often staying on `[light]` for routine work; adopters may use any short token). The task runs end-to-end on the tagged model. If the loaded model doesn't match, surface the mismatch before continuing.
- The `_project/flowtron/` submodule is read-only here. Edits go upstream to flowtron and arrive via deliberate version bumps — see `_project/flowtron/SPEC/versioning.md` and `_project/tasknote/README.md` for the pinned version.
```

---

## One-time symlink wiring

Run these from the project root after adding the flowtron submodule at `_project/flowtron/`:

```sh
mkdir -p .claude/commands .claude/skills
ln -s ../../_project/flowtron/claude/commands/ft-task.md            .claude/commands/ft-task.md
ln -s ../../_project/flowtron/claude/commands/ft-starter-task.md    .claude/commands/ft-starter-task.md
ln -s ../../_project/flowtron/claude/commands/ft-micro-task.md      .claude/commands/ft-micro-task.md
ln -s ../../_project/flowtron/claude/commands/ft-file-followup.md   .claude/commands/ft-file-followup.md
ln -s ../../_project/flowtron/claude/commands/ft-epic-discovery.md  .claude/commands/ft-epic-discovery.md
ln -s ../../_project/flowtron/claude/commands/ft-close-epic.md      .claude/commands/ft-close-epic.md
ln -s ../../_project/flowtron/claude/commands/ft-debug.md           .claude/commands/ft-debug.md
ln -s ../../_project/flowtron/claude/skills/ft-task            .claude/skills/ft-task
ln -s ../../_project/flowtron/claude/skills/ft-starter-task    .claude/skills/ft-starter-task
ln -s ../../_project/flowtron/claude/skills/ft-micro-task      .claude/skills/ft-micro-task
ln -s ../../_project/flowtron/claude/skills/ft-file-followup   .claude/skills/ft-file-followup
ln -s ../../_project/flowtron/claude/skills/ft-epic-discovery  .claude/skills/ft-epic-discovery
ln -s ../../_project/flowtron/claude/skills/ft-close-epic      .claude/skills/ft-close-epic
ln -s ../../_project/flowtron/claude/skills/ft-debug           .claude/skills/ft-debug
```

The relative paths are intentional — they survive `git clone` and pin to whichever flowtron commit the submodule is checked out at. Commit the symlinks (`git add .claude/`).

To verify: invoke `/ft-task` in a fresh session with your coding agent (Claude Code, Cursor, Grok Build, Codex CLI, etc.; or the platform's equivalent slash/prompt command). The command should appear in the menu (alongside the other flowtron skills) with the description from `commands/ft-task.md`.

## Bumping the pinned flowtron version

Submodule bumps are themselves a project-side task (e.g., `CORE-XXX: Bump flowtron to vX.Y.Z`). Flowtron has no `CHANGELOG.md` — release notes and migration steps live in the annotated tag message (`git -C _project/flowtron show vX.Y.Z`) and the per-release tasknote in `_project/flowtron/_project/tasknote/archive/core/`. The symlinks above don't change on bump — they always track whatever the submodule currently points at.

## Visualizer

The flowtron visualizer is a single global instance — run it **once per machine** from flowtron's own checkout, not from this project's `_project/flowtron/viz/`:

```sh
cd ~/code/flowtron/viz
npm install
npm run dev
```

It scans `${FLOWTRON_VIZ_WORKSPACE:-~/code}/*/_project/PLAN.md` and renders every adopting project; the header-rail project selector swaps the active project. Port `5120` is pinned with `strictPort`, so a second instance fails fast. The adopter-side `_project/flowtron/viz/` still works for offline / submodule-pinned use, but the global instance above is the recommended path.
