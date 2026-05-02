---
name: new-project
description: Bootstrap a fresh ~/code/ project with flowtron — adds the submodule, wires /task, drops in PLAN.md + tasknote README, patches CLAUDE.md, and stages the commit. Mirrors docs/MIGRATION.md §1 conversationally; for fresh adoption only.
---

# new-project — flowtron adoption skill

You are bootstrapping flowtron into a fresh project. The full procedural reference lives in flowtron's `docs/MIGRATION.md` §1 — this skill is the executable interpretation, not a replacement. Treat MIGRATION.md as authoritative when this file is silent or in tension.

This skill is **fresh-adoption only**. If the project already has a `plan.json`, `WORKFLOW.md`, helper scripts, or other prior workflow tooling, stop and point the user at MIGRATION.md §2 — the migration path involves judgment calls (which tasks survive, which docs to delete) that don't fit a recipe.

## Step 0 — Verify preconditions

The skill operates on the current working directory. Before doing anything:

- `.git/` exists (cwd is a git repo). If not, stop and tell the user to `git init` first.
- `CLAUDE.md` exists in cwd. If not, stop and ask the user to create one before proceeding (the workflow block from `claude/CLAUDE-snippet.md` will be appended to it).
- None of the following exist (their presence means flowtron is already adopted):
  - `_project/flowtron/`
  - `_project/PLAN.md`
  - `.claude/commands/task.md`
  - `.claude/skills/task`

  If any are present, stop. Surface what's already there and ask whether the user meant to bump the pinned version (see `docs/MIGRATION.md` §"Pinning and bumping") instead of bootstrapping fresh.

If any precondition fails, do not modify any files.

## Step 1 — Collect inputs

Use AskUserQuestion to gather:

1. **Project name** — default suggestion: cwd basename (e.g., `~/code/flowmagic` → `flowmagic`). Used to substitute the `# Project Name — PLAN.md` placeholder in `templates/PLAN.md`.
2. **Pinned flowtron version** — default suggestion: latest semver tag from `git ls-remote --tags --sort=-v:refname https://github.com/fakeneuron/flowtron.git | head -n1 | sed 's|.*/||'`. User can accept, override, or pin to `main` for unstable tracking (warn before doing so — the bump-tasknote / annotated-tag-message contract assumes a tag).

Record both before proceeding. If the user picks `main`, set the variable but skip the `git -C _project/flowtron checkout vX.Y.Z` step in Step 2.

## Step 2 — Add the submodule

From cwd:

```sh
mkdir -p _project
git submodule add https://github.com/fakeneuron/flowtron.git _project/flowtron
git -C _project/flowtron checkout vX.Y.Z   # use the pinned version from Step 1
```

The `checkout` step is what pins the project to a specific flowtron commit. Skip it only if the user explicitly chose `main` in Step 1.

Reference: `docs/MIGRATION.md` §1.1.

## Step 3 — Wire /task via symlinks

```sh
mkdir -p .claude/commands .claude/skills
ln -s ../../_project/flowtron/claude/commands/task.md .claude/commands/task.md
ln -s ../../_project/flowtron/claude/skills/task     .claude/skills/task
```

The relative paths are intentional — they survive `git clone` and pin to whichever flowtron commit the submodule is currently checked out at. Do not use absolute paths.

Reference: `docs/MIGRATION.md` §1.2 + `claude/CLAUDE-snippet.md` §"One-time symlink wiring".

## Step 4 — Patch CLAUDE.md

Read `_project/flowtron/claude/CLAUDE-snippet.md` and extract the markdown block under the "Block to paste into CLAUDE.md" heading (the fenced ```markdown ... ``` block). Append the block's *contents* (without the outer fences) to the project's `CLAUDE.md`.

Append at the end of the file. Do not overwrite the existing file or insert mid-file — project-specific instructions in `CLAUDE.md` must be preserved.

Reference: `docs/MIGRATION.md` §1.3.

## Step 5 — Create _project/PLAN.md

```sh
cp _project/flowtron/templates/PLAN.md _project/PLAN.md
```

Then substitute `Project Name` (line 1: `# Project Name — PLAN.md`) with the project name from Step 1. Leave the rest of the placeholders (vision paragraph, task list) for the user to fill in afterward — surface this in the hand-off in Step 8.

Reference: `docs/MIGRATION.md` §1.4.

## Step 6 — Create _project/tasknote/README.md

```sh
mkdir -p _project/tasknote/archive
cp _project/flowtron/templates/tasknote-README.md _project/tasknote/README.md
```

Edit `_project/tasknote/README.md`: leave the project-specific area-prefix table and "Project quick commands" section as placeholders for the user to fill in afterward — surface this in the hand-off in Step 8.

The README includes a description of the current tasknote template shape: YAML frontmatter (`title`, `status`, `priority`, `area`, `model`, `tags`, `created`, `due`, `related-tasks`) and a spec-on-top + log-below body. The `/task` skill scaffolds all new tasknotes in this shape automatically; the canonical layout is at `_project/flowtron/templates/tasknote-template.md`.

Reference: `docs/MIGRATION.md` §1.5.

## Step 7 — Stage and ask for commit-go

Stage the bootstrap files explicitly. Do **not** use `git add .` or `git add -A` — the project may have unrelated unstaged work that should not be bundled into the adoption commit:

```sh
git add .gitmodules _project/flowtron _project/PLAN.md _project/tasknote/ \
        .claude/commands/task.md .claude/skills/task CLAUDE.md
```

Surface the proposed commit message and wait for commit-go (e.g. "yes", "go", "commit"). Do not commit unprompted — same protocol as the `/task` post-closure flow.

Proposed message: `chore: adopt flowtron at vX.Y.Z` (substitute the actual pinned version). If the user picked `main`, the message is `chore: adopt flowtron (main, unpinned)`.

After the user approves, run `git commit` with the message. If the user wants a different message, follow their lead.

Reference: `docs/MIGRATION.md` §1.6.

## Step 8 — Verify and hand off

Confirm both symlinks resolve correctly:

```sh
readlink .claude/commands/task.md   # → ../../_project/flowtron/claude/commands/task.md
readlink .claude/skills/task        # → ../../_project/flowtron/claude/skills/task
```

If either resolves wrong, fix before reporting success.

Then surface to the user, in one short message:

- Bootstrap is complete; flowtron is pinned to `vX.Y.Z` (or `main` if unpinned).
- **Next steps for them** (the skill leaves these as placeholders):
  - Edit `_project/PLAN.md` — fill in the vision paragraph and initial task list.
  - Edit `_project/tasknote/README.md` — declare any project-specific area prefixes; replace the "Project quick commands" section with real commands.
- **To verify the wiring:** type `/task` in a fresh Claude Code session in the project root. The command should appear in the slash-command menu with its description.

Reference: `docs/MIGRATION.md` §1.7.

## Notes

- This skill does not touch existing files except `CLAUDE.md` (appended-to in Step 4). Everything else is new.
- For migrating from a prior workflow system (existing `plan.json`, `WORKFLOW.md`, etc.), use `docs/MIGRATION.md` §2 manually — the migration path involves judgment calls that don't fit a recipe.
- For bumping flowtron's pinned version in an already-adopted project, see `docs/MIGRATION.md` §"Pinning and bumping" — that's a different task (`CORE-XXX: Bump flowtron to vX.Y.Z`).
