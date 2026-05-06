# Adopting Flowtron in a Project

This is the procedural guide for putting flowtron into a project. For the "why," see [PHILOSOPHY.md](PHILOSOPHY.md). For the workflow contract, see [SPEC.md](../SPEC.md).

There are two starting points:

- **Section 1 — Fresh adoption.** The project has no prior workflow tooling, or its workflow is informal enough to discard.
- **Section 2 — Migrating from a prior workflow system.** The project already has a `plan.json`, helper scripts, a `WORKFLOW.md`, or another structured workflow. Do Section 1 first, then continue into Section 2.

Both paths assume the project lives under `~/code/`, has its own git repo, and already has a `CLAUDE.md`.

## 1 — Fresh adoption

> **Want a more opinionated starting point?** [natabula](https://github.com/fakeneuron/natabula) is a project template that pre-wires flowtron alongside FastAPI + React conventions, CI setup, and a richer `CLAUDE.md` starter. If you're starting a new project in that stack, consider cloning natabula instead of wiring flowtron by hand.

### 1.0 Quick path: `/new-project`

If you have flowtron's `/new-project` skill installed globally (one-time setup below), the manual steps in §1.1–1.6 are wrapped in a single command:

```sh
cd ~/code/<your-new-project>
/new-project
```

The skill verifies preconditions (cwd is a git repo with `CLAUDE.md`, no existing flowtron wiring), asks for the project name and pinned flowtron version, and walks through §1.1–1.6 conversationally. It stages all bootstrap files and surfaces the commit message for your approval — no unprompted commits.

**One-time global install** (run once per machine, after cloning flowtron to `~/code/flowtron/`):

```sh
ln -s ~/code/flowtron/claude/skills/new-project    ~/.claude/skills/new-project
ln -s ~/code/flowtron/claude/commands/new-project.md ~/.claude/commands/new-project.md
```

The symlinks point at flowtron's working tree, so they pick up flowtron edits immediately rather than tracking a versioned submodule. If you prefer to pin a specific flowtron version of the skill itself, copy the files instead of symlinking and re-copy on bump.

If you don't have the skill installed, follow §1.1–1.7 manually below — the skill is a convenience wrapper, not a requirement.

### 1.1 Add flowtron as a submodule

From the project root:

```sh
mkdir -p _project
git submodule add https://github.com/fakeneuron/flowtron.git _project/flowtron
git -C _project/flowtron checkout vX.Y.Z   # replace with the version you want to pin (see git tags)
```

The `checkout` step is what pins the project to a specific flowtron version. Without it, the submodule tracks `main` and updates would be undeliberate.

### 1.2 Wire `/task` via symlinks

The `/task` slash command and its skill live inside the submodule. Adopting projects expose them through their own `.claude/` folder using symlinks:

```sh
mkdir -p .claude/commands .claude/skills
ln -s ../../_project/flowtron/claude/commands/task.md .claude/commands/task.md
ln -s ../../_project/flowtron/claude/skills/task     .claude/skills/task
```

The relative paths are intentional — they survive `git clone` and always point at whichever flowtron commit the submodule is currently checked out at. The symlinks themselves never need to change when bumping flowtron.

The canonical wiring snippet (and the `CLAUDE.md` block to paste in the next step) lives in `_project/flowtron/claude/CLAUDE-snippet.md`. Refer to it directly rather than copying the commands here — that file is the single source of truth.

### 1.3 Paste the workflow block into `CLAUDE.md`

Open `_project/flowtron/claude/CLAUDE-snippet.md` and copy the markdown block from the "Block to paste into CLAUDE.md" section into your project's `CLAUDE.md`. It tells the assistant where to find the SPEC, where plans and tasknotes live, and how to start a task.

### 1.4 Create `_project/PLAN.md`

```sh
cp _project/flowtron/templates/PLAN.md _project/PLAN.md
```

Then fill in the project name, vision paragraph, and current task list. Tasks use the area-prefix convention from SPEC.md §"Task ID convention" (`CORE-`, `BE-`, `FE-`, etc.). Project-specific prefixes are allowed; declare them in the next file.

### 1.5 Create `_project/tasknote/README.md`

```sh
mkdir -p _project/tasknote/archive
cp _project/flowtron/templates/tasknote-README.md _project/tasknote/README.md
```

Declare any project-specific area prefixes. Replace the "Project quick commands" section with the actual test/lint/dev commands for your project.

The README also describes the current tasknote shape: YAML frontmatter (`title`, `status`, `tags`, `created`, `due`, `related-tasks`) and a spec-on-top + log-below body (`Goal` / `Acceptance` / `Subtasks` / `Related` above a divider, then the four phase sections below). The `/task` skill scaffolds this shape automatically; see `_project/flowtron/templates/tasknote-template.md` for the canonical layout.

### 1.6 Commit

```sh
git add .gitmodules _project/flowtron _project/PLAN.md _project/tasknote/ \
        .claude/commands/task.md .claude/skills/task CLAUDE.md
git commit -m "chore: adopt flowtron at vX.Y.Z"
```

If your project already has other files under `.claude/` (settings, other skills), the explicit paths above keep the migration commit scoped to just the flowtron wiring.

### 1.7 Verify

In a fresh Claude Code session in the project, type `/task`. The command should appear in the slash-command menu with its description. Running `/task <SOME-ID>` against a real entry in your `_project/PLAN.md` should scaffold a tasknote and begin Phase 1 Discovery.

If `/task` doesn't appear, the symlinks are likely wrong — check `readlink .claude/commands/task.md` resolves under the submodule.

---

## 2 — Migrating from a prior workflow system

If the project already has its own workflow tooling, do **Section 1 first** — flowtron lives alongside the legacy system until you finish converting. Then work through the items below in order.

### 2.1 Convert `plan.json` (or equivalent) to `PLAN.md`

If the project's plan is a structured file (JSON, YAML, a database export), convert it by hand to `_project/PLAN.md`:

- Preserve task IDs exactly. Archived tasknotes reference them; renumbering breaks the links.
- Group entries under the priority headings (`Critical`, `High`, `Medium`, `Low`, `Future Opportunities`) defined in SPEC §"Priority levels".
- Move completed entries into the `Completed` section with their close dates if known. If a date is missing, omit it rather than inventing one.
- Resist the urge to write a conversion script. The translation involves judgment calls (which priority does this map to, is this still relevant) and is a one-time operation per project.

### 2.2 Reconcile in-flight tasknotes

For each tasknote currently in flight, decide between **finish-as-is** and **rewrap-into-flowtron**:

- **Finish-as-is** if the tasknote is mid-Phase 2 or later. The cost of rewrapping near completion is higher than the cost of one trailing legacy file. Archive it under the legacy convention when done; use the flowtron template for the next task.
- **Rewrap** if the tasknote is in Phase 1 or has been stale for more than a week. Copy the flowtron template to `_project/tasknote/<TASK-ID>.md`, transcribe the relevant Discovery notes, and continue from Phase 1's Relevance Assessment (the gate may catch a now-obsolete task).

### 2.3 Retire helper scripts

Once `plan.json` is gone, scripts like `create_tasknote.py`, `archive_tasknote.py`, or `validate_plan.py` have nothing left to do — flowtron's "operations" are `cp`, `mv`, and editing markdown, executed by the assistant. Delete the scripts and remove any references to them from `CLAUDE.md`, the README, or pre-commit hooks.

If a script is doing something genuinely useful that flowtron doesn't cover (project-specific lint, custom CI integration), keep it — but rename and document it as a project-side helper, not part of the workflow system.

### 2.4 Replace project-side workflow docs

Files like `WORKFLOW.md` or `TASKNOTE_QUICK_REFERENCE.md` were written when each project owned its own workflow. With flowtron, the canonical workflow contract is `_project/flowtron/SPEC.md`. For each such doc:

- **Delete** if its content is fully covered by flowtron's SPEC, templates, and CLAUDE-snippet.
- **Shrink** if it holds project-specific notes (commands, conventions, gotchas) that don't belong in flowtron. Trim it to the project-only parts and add a one-line pointer at the top: *"Workflow contract: see `_project/flowtron/SPEC.md`."*

### 2.5 Update `CLAUDE.md`

Remove the block describing the legacy workflow. The flowtron paste-block from §1.3 replaces it. Keep any project-specific instructions (architecture notes, non-negotiables, quick commands) — those are orthogonal to flowtron.

### 2.6 Commit the migration

A migration is itself a tasknote — typically a `CORE-` task in the project's own PLAN.md (or an epic with subtasks if the legacy system is large). Use that tasknote to track the steps above; commit at the end of Phase 4 the same way any other tasknote closes.

---

## Pinning and bumping

The submodule SHA in `_project/flowtron` is what pins the project to a specific flowtron commit.

To bump:

1. For a major version bump, read the annotated tag message (`git -C _project/flowtron show vX.Y.Z`) and the per-release tasknote in `_project/flowtron/_project/tasknote/archive/core/` — both list migration steps. Follow them before changing anything in the project.
2. Update the submodule:
   ```sh
   git -C _project/flowtron fetch --tags
   git -C _project/flowtron checkout vX.Y.Z
   ```
3. Commit. The parent repo's submodule pointer (the SHA recorded for `_project/flowtron`) changes; `.gitmodules` itself only changes if the URL or branch field changes.

The symlinks in `.claude/` don't need to be touched — they always track whatever the submodule currently points at.

A bump is itself a project-side task (e.g., `CORE-XXX: Bump flowtron to vX.Y.Z`), with a tasknote and the usual 4-phase flow. Don't bump in passing.

## Common gotchas

- **Symlinks survive `git clone`.** Don't recreate them after cloning a project — they're already there.
- **The submodule is read-only in adopting projects.** Edits to flowtron itself happen in the flowtron repo; adopting projects pick them up via deliberate version bumps.
- **`/task` not appearing in the menu** almost always means the symlinks are broken or the submodule isn't checked out. `readlink .claude/commands/task.md` should resolve into `_project/flowtron/claude/commands/task.md`.
- **Don't renumber tasks during migration.** Archived tasknotes reference the old IDs by name; renumbering silently invalidates those links.
