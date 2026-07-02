---
name: ft-new-project
description: Bootstrap a fresh ~/code/ project with flowtron — adds the submodule, wires /ft-task, drops in PLAN.md + tasknote README, creates/patches AGENTS.md, and stages the commit. Mirrors docs/MIGRATION.md §1 conversationally; for fresh adoption only.
---

# new-project — flowtron adoption skill

You are bootstrapping flowtron into a fresh project. The full procedural reference lives in flowtron's `docs/MIGRATION.md` §1 — this skill is the executable interpretation, not a replacement. Treat MIGRATION.md as authoritative when this file is silent or in tension.

This skill is **fresh-adoption only** — Step 0 detects prior workflow tooling at the project root and bails with a pointer at `docs/MIGRATION.md` §3 (lightweight, active-queue-only — the typical case) or §2 (heavier path that preserves task-ID continuity). Both paths involve judgment calls that don't fit a recipe.

## Step 0 — Verify preconditions

The skill operates on the current working directory. Before doing anything:

- `.git/` exists (cwd is a git repo). If not, stop and tell the user to `git init` first.
- `CLAUDE.md` exists in cwd. If not, stop and ask the user to create one before proceeding — this is a project-validity check (signals an AI-coding project); the flowtron paste-block itself lands in `AGENTS.md` (created in Step 4 if missing).
- None of the following exist (their presence means flowtron is already adopted):
  - `.flowtron/core/`
  - `.flowtron/PLAN.md`
  - `.claude/commands/ft-task.md`
  - `.claude/skills/ft-task`

  If any are present, stop. Surface what's already there and ask whether the user meant to bump the pinned version (see `docs/MIGRATION.md` §"Pinning and bumping") instead of bootstrapping fresh.

- None of the following exist at the project root (their presence means a legacy workflow system is in place — flowtron would conflict, e.g. a root `PLAN.md` collides with `.flowtron/PLAN.md`):
  - `PLAN.md`
  - `plan.json`
  - `WORKFLOW.md`

  If any are present, stop. Surface what's there and point the user at `docs/MIGRATION.md` §3 (lightweight migration: lift the active queue only, freeze legacy as read-only — the typical case) or §2 (heavier path that preserves task-ID continuity across the full archive). Do not bootstrap alongside legacy.

If any precondition fails, do not modify any files.

## Step 1 — Collect inputs

Use AskUserQuestion to gather:

1. **Project name** — default suggestion: cwd basename (e.g., `~/code/flowmagic` → `flowmagic`). Used to substitute the `# Project Name — PLAN.md` placeholder in `templates/PLAN.md`.
2. **Pinned flowtron version** — default suggestion: latest semver tag from `git ls-remote --tags --sort=-v:refname https://github.com/fakeneuron/flowtron.git | head -n1 | sed 's|.*/||'`. User can accept, override, or pin to `main` for unstable tracking (warn before doing so — the bump-tasknote / annotated-tag-message contract assumes a tag).

Record both before proceeding. If the user picks `main`, set the variable but skip the `git -C .flowtron/core checkout vX.Y.Z` step in Step 2.

## Step 2 — Add the submodule

From cwd:

```sh
mkdir -p .flowtron
git submodule add https://github.com/fakeneuron/flowtron.git .flowtron/core
git -C .flowtron/core checkout vX.Y.Z   # use the pinned version from Step 1
```

The `checkout` step is what pins the project to a specific flowtron commit. Skip it only if the user explicitly chose `main` in Step 1.

Reference: `docs/MIGRATION.md` §1.1.

## Step 3 — Wire /ft-task, /ft-starter-task, /ft-micro-task, /ft-file-followup, /ft-epic-discovery, /ft-close-epic, /ft-debug, /ft-worktree-start, /ft-worktree-end, /ft-update via symlinks

Read `.flowtron/core/claude/AGENTS-snippet.md` and run the bash block under the §"One-time symlink wiring" heading from the project root. Run it verbatim — relative paths are intentional (they survive `git clone` and pin to whichever flowtron commit the submodule is checked out at). Do not substitute absolute paths.

Reference: `claude/AGENTS-snippet.md` §"One-time symlink wiring" (canonical) · `docs/MIGRATION.md` §1.2 (adopter doc, points to the snippet).

## Step 4 — Create or patch AGENTS.md

Read `.flowtron/core/claude/AGENTS-snippet.md` and extract the markdown block under the "Block to paste into AGENTS.md" heading (the fenced ```markdown ... ``` block). If `AGENTS.md` doesn't exist in the project root, create it with the block's *contents* (without the outer fences) as initial content. If it exists, append the contents at the end of the file — do not overwrite or insert mid-file (project-specific instructions in `AGENTS.md` must be preserved).

Reference: `docs/MIGRATION.md` §1.3.

## Step 5 — Create .flowtron/PLAN.md

```sh
cp .flowtron/core/templates/PLAN.md .flowtron/PLAN.md
```

Then substitute `Project Name` (line 1: `# Project Name — PLAN.md`) with the project name from Step 1. Leave the rest of the placeholders (vision paragraph, task list) for the user to fill in afterward — surface this in the hand-off in Step 8.

Reference: `docs/MIGRATION.md` §1.4.

## Step 6 — Create .flowtron/tasknote/README.md

```sh
mkdir -p .flowtron/tasknote/archive
cp .flowtron/core/templates/tasknote-README.md .flowtron/tasknote/README.md
```

The README includes a description of the current tasknote template shape: YAML frontmatter (`title`, `status`, `tags`, `created`, `due`, `related-tasks`) and a spec-on-top + log-below body. The `/ft-task` skill scaffolds all new tasknotes in this shape automatically; the canonical layout is at `.flowtron/core/templates/tasknote-template.md`.

Reference: `docs/MIGRATION.md` §1.5.

## Step 7 — Stage and ask for commit-go

Stage the bootstrap files explicitly. Do **not** use `git add .` or `git add -A` — the project may have unrelated unstaged work that should not be bundled into the adoption commit:

```sh
git add .gitmodules .flowtron/core .flowtron/PLAN.md .flowtron/tasknote/ \
        .claude/commands/ft-task.md .claude/commands/ft-starter-task.md .claude/commands/ft-micro-task.md .claude/commands/ft-file-followup.md .claude/commands/ft-epic-discovery.md .claude/commands/ft-close-epic.md .claude/commands/ft-debug.md \
        .claude/commands/ft-worktree-start.md .claude/commands/ft-worktree-end.md \
        .claude/commands/ft-update.md \
        .claude/skills/ft-task .claude/skills/ft-starter-task .claude/skills/ft-micro-task .claude/skills/ft-file-followup .claude/skills/ft-epic-discovery .claude/skills/ft-close-epic .claude/skills/ft-debug \
        .claude/skills/ft-worktree-start .claude/skills/ft-worktree-end \
        .claude/skills/ft-update \
        AGENTS.md
```

Surface the proposed commit message and wait for commit-go (e.g. "yes", "go", "commit"). Do not commit unprompted — same protocol as the `/ft-task` post-closure flow.

Proposed message: `chore: adopt flowtron at vX.Y.Z` (substitute the actual pinned version). If the user picked `main`, the message is `chore: adopt flowtron (main, unpinned)`.

After the user approves, run `git commit` with the message. If the user wants a different message, follow their lead.

Reference: `docs/MIGRATION.md` §1.6.

## Step 8 — Verify and hand off

Confirm all twenty symlinks resolve correctly:

```sh
readlink .claude/commands/ft-task.md            # → ../../.flowtron/core/claude/commands/ft-task.md
readlink .claude/commands/ft-starter-task.md    # → ../../.flowtron/core/claude/commands/ft-starter-task.md
readlink .claude/commands/ft-micro-task.md      # → ../../.flowtron/core/claude/commands/ft-micro-task.md
readlink .claude/commands/ft-file-followup.md   # → ../../.flowtron/core/claude/commands/ft-file-followup.md
readlink .claude/commands/ft-epic-discovery.md  # → ../../.flowtron/core/claude/commands/ft-epic-discovery.md
readlink .claude/commands/ft-close-epic.md      # → ../../.flowtron/core/claude/commands/ft-close-epic.md
readlink .claude/commands/ft-debug.md           # → ../../.flowtron/core/claude/commands/ft-debug.md
readlink .claude/skills/ft-task                 # → ../../.flowtron/core/claude/skills/ft-task
readlink .claude/skills/ft-starter-task         # → ../../.flowtron/core/claude/skills/ft-starter-task
readlink .claude/skills/ft-micro-task           # → ../../.flowtron/core/claude/skills/ft-micro-task
readlink .claude/skills/ft-file-followup        # → ../../.flowtron/core/claude/skills/ft-file-followup
readlink .claude/skills/ft-epic-discovery       # → ../../.flowtron/core/claude/skills/ft-epic-discovery
readlink .claude/skills/ft-close-epic           # → ../../.flowtron/core/claude/skills/ft-close-epic
readlink .claude/skills/ft-debug                # → ../../.flowtron/core/claude/skills/ft-debug
readlink .claude/commands/ft-worktree-start.md   # → ../../.flowtron/core/claude/commands/ft-worktree-start.md
readlink .claude/commands/ft-worktree-end.md     # → ../../.flowtron/core/claude/commands/ft-worktree-end.md
readlink .claude/skills/ft-worktree-start        # → ../../.flowtron/core/claude/skills/ft-worktree-start
readlink .claude/skills/ft-worktree-end          # → ../../.flowtron/core/claude/skills/ft-worktree-end
readlink .claude/commands/ft-update.md           # → ../../.flowtron/core/claude/commands/ft-update.md
readlink .claude/skills/ft-update                # → ../../.flowtron/core/claude/skills/ft-update
```

If any resolves wrong, fix before reporting success.

Then surface to the user, in one short message:

- Bootstrap is complete; flowtron is pinned to `vX.Y.Z` (or `main` if unpinned).
- **Next steps for them** (the skill leaves these as placeholders):
  - Edit `.flowtron/PLAN.md` — fill in the vision paragraph and initial task list.
  - Edit `.flowtron/tasknote/README.md` — declare any project-specific area prefixes; replace the "Project quick commands" section with real commands; extend `## AI-referenced docs` (seeded with `README.md` / `AGENTS.md` / `CLAUDE.md` / `.flowtron/PLAN.md`) as the architecture matures (architecture notes, API specs, DB schema docs, ADRs, inventories).
- **To verify the wiring:** invoke `/ft-task` in a fresh session with your coding agent (Claude Code, Cursor, Grok Build, Codex CLI, etc.; or the platform's equivalent slash/prompt command) in the project root. The command should appear in the menu (alongside the other flowtron skills) with its description.
- **Recommended follow-up.** If they've installed `/ft-audit-context` globally (per `docs/MIGRATION.md` §1.0), suggest running it now: `/ft-audit-context` scans the freshly-bootstrapped `CLAUDE.md`, `AGENTS.md`, and `.claude/{commands,skills}` for context bloat, redundancy with the just-pasted `AGENTS.md` block, `ft-*` namespace conflicts, and lean-context drift. Output is conversational; ticket-filing is opt-in. Catches first-day context-surface issues before they ossify.

Reference: `docs/MIGRATION.md` §1.7.

## Notes

- This skill does not touch existing files except `AGENTS.md` (created or appended-to in Step 4). Everything else is new.
- For migrating from a prior workflow system (existing `plan.json`, `WORKFLOW.md`, etc.), use `docs/MIGRATION.md` §3 (lightweight, active-queue-only) or §2 (full, ID-preserving) manually — the migration path involves judgment calls that don't fit a recipe.
- For bumping flowtron's pinned version in an already-adopted project, see `docs/MIGRATION.md` §"Pinning and bumping" — that's a different task (`CORE-XXX: Bump flowtron to vX.Y.Z`).
