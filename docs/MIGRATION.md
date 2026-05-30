# Adopting Flowtron in a Project

This is the procedural guide for putting flowtron into a project. For the "why," see [PHILOSOPHY.md](PHILOSOPHY.md). For the workflow contract, see [SPEC.md](../SPEC.md). For the load-bearing vocabulary (terms, phases, markers, grammar), see the lazy-loaded [GLOSSARY.md](GLOSSARY.md) (pointers only; SPEC is authoritative).

There are two starting points:

- **Section 1 — Fresh adoption.** The project has no prior workflow tooling, or its workflow is informal enough to discard.
- **Section 2 — Migrating from a prior workflow system.** The project already has a `plan.json`, helper scripts, a `WORKFLOW.md`, or another structured workflow. Do Section 1 first, then continue into Section 2.

Both paths assume the project has its own git repo — the project can live anywhere on your local machine. (The `/ft-new-project` Quick path in §1.0 additionally checks for `CLAUDE.md` as a project-validity heuristic; the manual §1.1–1.6 path does not require it.)

## 1 — Fresh adoption

### 1.0 Quick path: `/ft-new-project`

If you have flowtron's `/ft-new-project` skill installed globally (one-time setup below), the manual steps in §1.1–1.6 are wrapped in a single command:

```sh
cd ~/code/<your-new-project>
/ft-new-project
```

The skill verifies preconditions (cwd is a git repo with `CLAUDE.md`, no existing flowtron wiring, and no legacy workflow tooling at the root — `PLAN.md`, `plan.json`, or `WORKFLOW.md` route to §3 / §2 instead), asks for the project name and pinned flowtron version, and walks through §1.1–1.6 conversationally. It stages all bootstrap files and surfaces the commit message for your approval — no unprompted commits.

**One-time global installs** (run once per machine, after cloning flowtron anywhere on your local machine).

| Skill | Audience | Purpose |
|---|---|---|
| `/ft-new-project` | Adopters (+ flowtron-self) | Bootstrap a new project with flowtron wiring |
| `/ft-flowtron` | Adopters | Info screen — version, principles, bundled-skill roster (reads `_project/flowtron/SPEC.md`) |
| `/ft-stats` | Adopters | Stats from `_project/PLAN.md` `## Completed` — `[model]` distribution, velocity, per-area volume; `--write` flushes to `_project/STATS.md` |
| `/ft-quality` | Adopters | Lint + typecheck + test sweep (heuristic Node/Python/Go/Rust detection, fail-fast); runs outside the tasknote flow |
| `/ft-audit-context` | Adopters (+ flowtron-self) | Adopter-context audit — 4 conversational passes over `CLAUDE.md`, `AGENTS.md`, `.claude/{commands,skills}` for bloat / paste-block redundancy / `ft-*` namespace conflicts / lean-context drift; soft prose recommendations with an offer to file PLAN tickets (no auto-write) |
| `/ft-release` | Flowtron-self only | Cut a release; bails outside flowtron's checkout |

Install each you want with the same shape (substitute `<skill>`):

```sh
ln -s <path-to-flowtron-checkout>/claude/skills/<skill>       ~/.claude/skills/<skill>
ln -s <path-to-flowtron-checkout>/claude/commands/<skill>.md  ~/.claude/commands/<skill>.md
```

The symlinks point at flowtron's working tree, so they pick up flowtron edits immediately rather than tracking a versioned submodule. To pin a specific version of a skill, copy the files instead of symlinking and re-copy on bump.

If you don't have the skill installed, follow §1.1–1.7 manually below — the skill is a convenience wrapper, not a requirement.

### 1.1 Add flowtron as a submodule

From the project root:

```sh
mkdir -p _project
git submodule add https://github.com/fakeneuron/flowtron.git _project/flowtron
git -C _project/flowtron checkout vX.Y.Z   # replace with the version you want to pin (see git tags)
```

The `checkout` step is what pins the project to a specific flowtron version. Without it, the submodule tracks `main` and updates would be undeliberate.

### 1.2 Wire the tasknote skills + worktree pair via symlinks

Flowtron ships nine slash commands inside the submodule: the seven tasknote family (`/ft-task`, `/ft-starter-task`, `/ft-micro-task`, `/ft-file-followup`, `/ft-epic-discovery`, `/ft-close-epic`, `/ft-debug`) plus two thin worktree utilities (`/ft-worktree-start` + `/ft-worktree-end`). Each tasknote family's purpose lives in its own SKILL.md frontmatter — short version: 4-phase runner; starter filer; micro one-shot; in-chat follow-up; epic open; epic close; hypothesis-first debug runner. The worktree pair are thin procedural utilities (see their SKILL.md frontmatter + `docs/WORKTREES.md`).

Two additional thin skills (`/ft-worktree-start` + `/ft-worktree-end`) support executing *independent* children of a multi-child epic in isolated git worktrees (see `_project/flowtron/docs/WORKTREES.md` for the location / branch-naming / tasknote-copy / cleanup convention). Full wiring for the pair lands in the worktree epic's adopter-surface child.

**Install:** open `_project/flowtron/claude/AGENTS-snippet.md` §"One-time symlink wiring" and run the commands from the project root — that file is the single source of truth for the wiring (and also holds the §1.3 `AGENTS.md` paste-block). The relative paths in the snippet survive `git clone` and pin to the submodule's current SHA, so symlinks never need touching on a version bump.

### 1.2.1 Optional: fork the `/ft-audit` family per stack

Flowtron ships six stack-neutral audit scaffolds at `_project/flowtron/claude/skills/ft-audit{,-docs,-security,-frontend,-backend,-performance}/` — each a 5-pass / capped-findings / writes-tickets skill. **Forked, not symlinked**: per-stack rubrics/commands/examples diverge.

| Skill | Scope | 5 passes |
|---|---|---|
| `/ft-audit` | Catch-all code audit; default when no specialist fits | Security · Idioms · Hygiene · Orphans · Doc drift |
| `/ft-audit-docs` | Documentation surface | Claims vs. code · Cross-doc consistency · Cross-references · Currency · Stale content |
| `/ft-audit-security` | Security posture | Secrets · Input handling · Auth & authz · Network & boundaries · Dependencies |
| `/ft-audit-frontend` | Frontend (framework-agnostic) | Bundle & payload · Accessibility · Render perf · Browser hygiene · Component health |
| `/ft-audit-backend` | Backend (framework-agnostic) | Input & contracts · Error & lifecycle · Persistence · Async correctness · Observability |
| `/ft-audit-performance` | Cross-cutting perf (measurements required) | Hot paths · Payload & bundle · Data access · Memory & resource · Caching |

Pick the ones you'll use — `/ft-audit` is a sensible default if you don't need specialists yet. To install one (repeat per skill):

```sh
SKILL=audit-docs   # or audit, audit-security, audit-frontend, audit-backend, audit-performance
mkdir -p .claude/skills/$SKILL
cp _project/flowtron/claude/skills/ft-$SKILL/SKILL.md  .claude/skills/$SKILL/SKILL.md
cp _project/flowtron/claude/commands/ft-$SKILL.md      .claude/commands/$SKILL.md
```

Upstream carries the `ft-` prefix (flowtron's owned namespace per SPEC §"Skill namespace"); the local fork drops it so ownership is clear in skill resolution. Open each fork's SKILL.md and walk the **§0 Forker checklist** — set glob, rubric files, verification commands, stack-specific pass examples, sacred-invariant callouts under Critical. Delete §0 when filled in.

Splitting one skill into per-area forks (e.g., `audit-backend` → `audit-backend-payments` + `audit-backend-ingest`): copy SKILL.md into multiple sibling dirs and customize each. Forks are yours — flowtron bumps don't touch them; re-copy upstream when you want scaffold improvements.

Optional section — skip entirely if you don't want structured audit skills.

### 1.2.2 Developing flowtron skills & commands (maintainer & contributors)

The canonical skill and command definitions live in `claude/skills/` and `claude/commands/` at the root of this checkout. The in-repo `.claude/` directory is gitignored (see root `.gitignore`) and must never contain committed per-machine wiring.

For live editing with immediate effect in your AI coding agent:

```sh
# One-time (or after adding a new skill/command)
ln -s ~/code/flowtron/claude/skills/*       ~/.claude/skills/
ln -s ~/code/flowtron/claude/commands/*.md  ~/.claude/commands/
```

Use the same global pattern shown in §1.0 for the thin utility skills. This is the supported way to get hot-reload behavior when you are the one modifying the `ft-*` family itself. The `ft-` prefix remains flowtron's reserved namespace.

When you need the flowtron-self specializations of the audit family (the versions with flowtron-specific scope, rubric, and verification commands), they are the primary implementations inside the canonical scaffolds — no separate fork is required inside this tree.

**Optional: local `.claude/` wiring when cwd is the flowtron checkout**

If your AI coding sessions often have `cwd` inside this checkout (as opposed to adopter projects), you can populate a *local* (still fully ignored) copy of the wiring instead of or alongside the global `~/.claude/`:

```sh
# From the flowtron repo root (one-time, or after adding a skill)
mkdir -p .claude/commands .claude/skills
ln -s ../../claude/commands/*.md .claude/commands/
ln -s ../../claude/skills/* .claude/skills/
```

The relative `../../` paths are clone-location independent. The symlinks land under the ignored `.claude/` directory, so they never enter git history. This gives the complete `/ft-*` surface (all audit variants, `ft-debug`, worktree pair, quality, release, stats, new-project, etc.) for any agent started while inside the tree.

The global form above is still the right choice when you want a single `~/.claude/` that serves flowtron + every adopter project on the machine.

### 1.3 Paste the workflow block into `AGENTS.md`

Open `_project/flowtron/claude/AGENTS-snippet.md` and copy the markdown block from the "Block to paste into AGENTS.md" section into your project's `AGENTS.md` (create the file if it doesn't exist). `AGENTS.md` is the open-standard memory file read by Claude Code, Codex CLI, Cursor, Sourcegraph Amp, Aider, and Grok Build — pasting here makes the flowtron contract visible to whatever assistant the adopter uses. Project-specific instructions for a single assistant (e.g., `CLAUDE.md` for Claude-only directives) stay where they are; flowtron's block is agent-neutral.

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

Then fill it in:
- Declare project-specific area prefixes.
- Replace "Project quick commands" with the project's test/lint/dev commands.
- Extend `## AI-referenced docs` (seeded with `README.md` / `AGENTS.md` / `CLAUDE.md` / `_project/PLAN.md`) — this list is walked at every Phase 4 closure and epic-audit subtask. Add architecture notes, API specs, DB schema docs, ADRs as the project matures.

Tasknote shape and lifecycles: see SPEC §"Tasknote frontmatter" + §"Tasknote body shape", plus the lightweight variants — **starter** (`tasknote-starter-template.md`, lifecycle in `SPEC/starter.md`) and **micro** (`tasknote-micro-template.md`, threshold in SPEC §"When to use a tasknote"). For multi-child code-sweep/feature epics, opening Discovery (`.1`) + closing Audit (highest `.N`) bracket the implementation children — `SPEC/epic.md`. Simple multi-subtask implementations skip the bracket.

### 1.6 Commit

```sh
git add .gitmodules _project/flowtron _project/PLAN.md _project/tasknote/ \
        .claude/commands/ft-task.md .claude/commands/ft-starter-task.md .claude/commands/ft-micro-task.md \
        .claude/commands/ft-file-followup.md .claude/commands/ft-epic-discovery.md .claude/commands/ft-close-epic.md \
        .claude/commands/ft-debug.md \
        .claude/commands/ft-worktree-start.md .claude/commands/ft-worktree-end.md \
        .claude/skills/ft-task .claude/skills/ft-starter-task .claude/skills/ft-micro-task \
        .claude/skills/ft-file-followup .claude/skills/ft-epic-discovery .claude/skills/ft-close-epic \
        .claude/skills/ft-debug \
        .claude/skills/ft-worktree-start .claude/skills/ft-worktree-end \
        AGENTS.md
git commit -m "chore: adopt flowtron at vX.Y.Z"
```

If your project already has other files under `.claude/` (settings, other skills), the explicit paths above keep the migration commit scoped to just the flowtron wiring.

### 1.7 Verify

In a fresh session with your coding agent (Claude Code, Cursor, Grok Build, Codex CLI, etc.; or the platform's equivalent slash/prompt command), invoke `/ft-task`. The command should appear in the menu (alongside `/ft-starter-task`, `/ft-micro-task`, `/ft-file-followup`, `/ft-epic-discovery`, `/ft-close-epic`, `/ft-debug`, `/ft-worktree-start`, and `/ft-worktree-end`) with its description. Running `/ft-task <SOME-ID>` against a real entry in your `_project/PLAN.md` should scaffold a tasknote and begin Phase 1 Discovery.

If any command doesn't appear, the symlinks are likely wrong — check that each `readlink .claude/commands/<name>.md` and `readlink .claude/skills/<name>` resolves under the submodule.

**Recommended follow-up.** If you've installed `/ft-audit-context` globally (see §1.0), run it now: `/ft-audit-context` scans the project's `CLAUDE.md`, `AGENTS.md`, and `.claude/{commands,skills}` for context bloat, redundancy with the freshly-pasted `AGENTS.md` block, `ft-*` namespace conflicts, and lean-context drift. Output is conversational; ticket-filing is opt-in. Catches first-day context-surface issues before they ossify.

---

## 2 — Migrating from a prior workflow system

If the project has its own workflow tooling, do **Section 1 first** — flowtron lives alongside the legacy system until conversion is done. Then work through this section.

§2 lifts the **full** plan (closed + active) into flowtron shape, preserving task IDs so archived tasknotes stay addressable. If you'd rather freeze the archive as read-only legacy and only lift the active queue, jump to **[Section 3](#3--lightweight-migration-current-tasks-only)** — much shorter playbook.

Walk **§3.1 Pre-flight collision check** before any `git mv` — the collision risks apply identically to this heavy path.

### 2.1 Convert `plan.json` (or equivalent) to `PLAN.md`

The differentiator vs §3: full conversion, not just the active queue. Convert by hand to `_project/PLAN.md`:

- **Preserve task IDs exactly** — archived tasknotes reference them; renumbering breaks the links.
- Group entries under SPEC §"Priority levels" headings (`High` / `Medium` / `Low` / `Future Opportunities`). Legacy `Critical` rows move into `High` with `[!critical]` per SPEC §"Task-line format".
- Move completed entries to `## Completed` with close dates if known; omit missing dates rather than inventing them.
- **No conversion script** — judgment calls (priority mapping, still-relevant filter) make this a one-time per-project translation.

### 2.2–2.6 Follow §3.5–§3.9

The remaining steps (reconcile in-flight tasknotes · retire helpers · replace workflow docs · create `AGENTS.md` from the paste-block · commit) are identical to §3's playbook. Apply §3.5 to **all** in-flight tasknotes (not just the active queue), then §3.6–§3.9 as written.

---

## 3 — Lightweight migration: current tasks only

Most real-world adoptions don't want to lift the full archive. The legacy plan might be hundreds of closed entries, narrative-heavy, and irrelevant to day-to-day work going forward. This section is the **active-queue-only** playbook: freeze legacy as a read-only reference, lift only the open tasks into flowtron, and don't try to preserve historical link integrity.

Do **Section 1 first** — flowtron lives alongside legacy until you finish the steps below.

**Tradeoffs vs §2.** §2 preserves task IDs exactly so archived tasknotes stay addressable. §3 sacrifices that link integrity in exchange for a much smaller migration: closed entries stay frozen in legacy form, only the active queue moves. Pick §3 when the archive is large enough that converting it is its own multi-day project, or when the legacy plan format (narrative paragraphs, JSON, custom schema) is too far from flowtron's shape to translate cleanly.

### 3.1 Pre-flight collision check

Before any `git mv` or new files, walk this checklist — each item below tripped early adopter migrations. Unresolved items make §3.2's freeze partially fail or silently overwrite legacy files. The list is the generic core; project-specific tells (credentials, runtime gates, project-local skills, orphan dirs) belong in the adopter's migration tasknote, not here.

- **Working tree clean.** `git status` shows no uncommitted changes — bail and resolve before proceeding. Migration is a multi-commit shape; mixing in unrelated WIP makes the diff unreadable.
- **Gitignore audit.** Confirm any project-specific transient paths (e.g. `__pycache__/`, `.coverage`, `node_modules/`, `.env*`, large local DB files) are already ignored. If any aren't, fix `.gitignore` and commit BEFORE staging migration files — `git add _project/...` could otherwise leak compiled artifacts or secrets.
- **Collision: project-local `/ft-task` command or skill.** Pre-existing `.claude/commands/ft-task.md` or `.claude/skills/ft-task/` (an artifact of any pre-flowtron internal `/ft-task`) will fail §1.2's symlink step (target exists). Back up or remove first: `git mv .claude/commands/ft-task.md .claude/commands/_legacy_task.md` (or `git rm` if the legacy skill has no salvageable content).
- **Collision: `_project/tasknote/README.md`.** §3.4's `cp _project/flowtron/templates/tasknote-README.md _project/tasknote/README.md` would silently overwrite a pre-existing legacy README. Either run §3.2's `git mv _project/tasknote _project/legacy-tasknote` first so the path is freed naturally, or move the legacy README upfront (`git mv _project/tasknote/README.md _project/legacy-plan/<old-name>.md`). **This is the gap that motivated [[CORE-044]]'s `/ft-new-project` legacy detection** — the bail check protects fresh adoption; this checklist protects migration.
- **Collision: `_project/tasknote/tasknote-template.md`.** Pre-existing project-local template, redundant once flowtron's template lives at `_project/flowtron/templates/tasknote-template.md`. Either it moves with the directory rename in §3.2, or it requires explicit `git rm` after wiring — decide upfront.
- **Active migration-tasknote disposition.** This very tasknote (the `CORE-XXX` driving the migration) IS the migration. Decide UPFRONT: stay in legacy-shape and self-close to the legacy archive as the final commit (cleanest — minimizes mid-migration churn) OR rewrap into flowtron's spec-on-top + log-below shape mid-migration (more work, more risk). Default: stay legacy. Same call applies to any sibling in-flight tasknotes per §3.5.
- **Root-level workflow-file inventory.** If the legacy plan lives at the repo root (rather than under `_project/`), enumerate every file moving to `legacy/` — typically `PLAN.md`, `PLAN_ARCHIVE.md`, `ROADMAP.md`, `FUTURE_OPPORTUNITIES.md`. Decide per-file: move with the legacy umbrella (workflow content) or stay at root (orthogonal — e.g. `CHANGELOG.md`, `SCRATCHPAD.md`).
- **Path-reference inventory.** Pre-grep for legacy IDs and paths the migration will retire:

  ```sh
  grep -rnE "<legacy-ID-pattern>|PLAN\.md|<retired-helper>" \
    --include='*.md' --include='*.py' --include='*.ts' \
    --exclude-dir=node_modules --exclude-dir=_project .
  ```

  Record the hit list — §3.8 (Post-migration cleanup) walks it to resolve every stale reference.

### 3.2 Freeze the legacy plan + tasknote dirs

Move the legacy directories under a clearly-labeled umbrella so it's obvious at a glance which world is which. The exact layout depends on where legacy currently lives:

```sh
# If PLAN.md and friends live at the repo root:
mkdir -p legacy
git mv PLAN.md legacy/PLAN.md
git mv PLAN_ARCHIVE.md legacy/PLAN_ARCHIVE.md      # if present
git mv ROADMAP.md legacy/ROADMAP.md                # if it duplicates PLAN.md content

# If legacy already lives under _project/ (e.g., _project/plan/plan.json):
git mv _project/plan _project/legacy-plan
git mv _project/tasknote _project/legacy-tasknote  # only if you also want a fresh _project/tasknote/
```

If the legacy `_project/tasknote/` is already organized with `archive/<area>/` subfolders matching flowtron's shape, you can leave it in place and **only freeze the legacy plan file** — new flowtron tasknotes can land in the same directory alongside the legacy archive without a conflict. Adopt the path of least surgery.

Add a one-line `legacy/README.md` (or wherever the legacy umbrella ended up):

```markdown
Read-only reference — the project's pre-flowtron plan and tasknotes.
For active work, see `_project/PLAN.md` and `_project/tasknote/`.
```

### 3.3 Cross-walk the active queue to canonical IDs

If the legacy IDs already follow flowtron's `<AREA>-<NUMBER>` convention (e.g. `FE-`, `BE-`, `CORE-`), they carry over unchanged.

If the legacy IDs follow a non-canonical scheme (phase-prefixed `P11.7-1`, sequential numerics, project-internal codes), do a one-time rename of the **open queue only**. Map each open task to a canonical area prefix and record the cross-walk in the migration tasknote:

| Legacy ID | Flowtron ID | Notes |
|---|---|---|
| P41-2 | BE-001 | auth middleware |
| P42-1 | BE-002 | boot banner |
| P28-6 | TEST-001 | Playwright UX smoke |
| P28-7 | FE-001 | settings drawer |
| P33-1 | FE-002 | offline banner |
| P33-3 | BE-003 | health-check endpoint |

Closed legacy IDs stay as-is in the frozen `legacy/` tree — they are no longer addressable from new tasknotes via flowtron's `[[TASK-ID]]` wikilinks, and that is the whole point of "current tasks only." External references (commit messages, code comments, doc cross-refs) still resolve into `legacy/` if needed; new work uses the new ID space.

If a renamed task's description references a closed legacy ID, write the cross-link as a plain markdown link (`[P29-2 (legacy)](../legacy/tasknote/P29-2.md)`) rather than a `[[]]` wikilink — flowtron's wikilink resolver assumes the new ID space and `_project/tasknote/archive/<area>/` layout.

### 3.4 Populate `_project/PLAN.md` from the active queue

For each open legacy task, write a new line in the right priority section of the freshly-templated `_project/PLAN.md` using the renamed ID and the task-line grammar from `SPEC.md` §"Task-line format":

```markdown
## High

- [ ] **BE-001** [opus] | auth middleware — Token validation and refresh flow for protected API routes. Supersedes legacy T-45.
- [ ] **BE-002** [sonnet] | boot banner — Log app `VERSION` and config file path at process startup. Supersedes legacy T-62.
```

Leave `## Completed` empty or seed it with a single pointer line:

```markdown
## Completed

(legacy completions live in `legacy/PLAN.md` — flowtron-era completions land here in stub form per `SPEC/tasknote-selection.md` §"`## Completed` archive convention")
```

The stub-form (CORE-036, v0.10.0) means new flowtron-era completions are one-liners pointing into `_project/tasknote/archive/<area>/`. Don't try to reproduce legacy narrative blocks here — they belong in the frozen legacy plan, not in the new one.

### 3.5 Decide per active tasknote: finish-as-is or rewrap

For each currently-open tasknote (a small universe under §3):

- **Finish-as-is** in the legacy directory if the task is mid-Phase 2 or later. When it closes, archive it alongside the other legacy tasknotes; the line in flowtron's `_project/PLAN.md` flips to `[x] | <shortname> — Completed YYYY-MM-DD. (closed under legacy workflow)`. The new tasknote at `_project/tasknote/archive/<area>/` does **not** get created — the legacy artifact is sufficient.
- **Rewrap** under the new ID if the task is in Phase 1 or stale: scaffold via `/ft-task <NEW-ID>` against the renamed PLAN.md entry. The starter context can be transcribed from the legacy tasknote's discovery notes; apply Phase 1's drift check fully (legacy notes can be weeks old).

### 3.6 Retire helpers and project-side workflow docs

Helper scripts (`create_tasknote.py`, `archive_tasknote.py`, `validate_plan.py`) and project-side workflow docs (`WORKFLOW.md`, `TASKNOTE_QUICK_REFERENCE.md`) go away — the flowtron submodule + paste-block in `AGENTS.md` cover their job. If a doc holds project-specific notes worth keeping, shrink it to those parts and add a top-of-file pointer: *"Workflow contract: see `_project/flowtron/SPEC.md`."* If a script does something flowtron doesn't cover (project-specific lint, custom CI), keep it as a project-side helper — not part of the workflow system.

### 3.7 Create `AGENTS.md` from the paste-block

Create `AGENTS.md` and paste the flowtron block from §1.3. If a legacy workflow block lived inside `CLAUDE.md` (or another assistant-specific memory file) under the prior system, remove it — flowtron's contract now lives in `AGENTS.md` and is read by Claude Code, Codex, Cursor, Amp, Aider, and Grok. Project-specific instructions (architecture notes, non-negotiables, quick commands) stay in whatever file they already live in — they're orthogonal to flowtron.

### 3.8 Post-migration cleanup

After §3.2–§3.7 land and `/ft-task` shows in the slash menu, sweep for residual state the migration steps didn't auto-handle. Each item below is a decision point — log the resolution in the migration tasknote's Cleanup Notes (or equivalent). The list is the **generic core**; project-specific tails (live-runtime smoke, CLAUDE.md project-guardrail check, project-specific orphan dirs) belong in the adopter's migration tasknote.

- **Redundant template removal.** `git rm _project/tasknote/tasknote-template.md` if a project-local template survived §3.2. Flowtron's template now lives at `_project/flowtron/templates/`.
- **`_legacy_task` backup disposition.** If §3.1 backed up a project-local `/ft-task` command or skill to `_legacy_task.md` / `_legacy_task/`, decide: delete after migration confirms flowtron's `/ft-task` works, OR keep indefinitely as historical reference.
- **Stale path-reference + ID sweep.** Walk the hit list captured in §3.1's path-reference inventory:
  - In active markdown docs: rewrite as `[<legacy-ID> (legacy)](legacy/...)`-style markdown links per §3.3, OR replace with the cross-walked flowtron ID if the reference is still relevant going forward.
  - In code comments / docstrings: low-risk; leave or update at touch time.
  - In archived/legacy content: leave untouched (write-once policy applies — don't retroactively rewrite history).
- **CI / pre-commit hook check.** `grep -rn "<retired-helper-script-name>" .git/hooks/ .github/ docker/ scripts/` (project root) — confirm nothing depends on retired scripts. Resolve before next CI run.
- **`/ft-starter-task`, `/ft-micro-task`, `/ft-file-followup`, `/ft-epic-discovery`, `/ft-close-epic`, `/ft-debug`, `/ft-worktree-start`, `/ft-worktree-end` smoke.** Invoke each in a fresh session with your coding agent (Claude Code, Cursor, Grok Build, Codex CLI, etc.; or platform equivalent) — confirm the tasknote family + worktree pair (eight total) appear in the slash/prompt menu alongside `/ft-task` (v1.0+ additions; symlinks added in §1.2; worktree pair added in CORE-215.5).
- **Context-surface audit.** If you've installed `/ft-audit-context` globally (see §1.0), run it now — migrations frequently carry over context bloat from the legacy era (stale `CLAUDE.md` workflow tutorials, project-local skills that now shadow `ft-*` namespace, AGENTS.md content redundant with the freshly-pasted block). Soft prose; ticket-filing is opt-in.
- **Final pin verification.** `git -C _project/flowtron describe --tags` shows the pinned version recorded at the start (e.g., `v4.2.0`). A mismatch means the submodule drifted off the pin during migration.
- **Cleanup commit.** Bundle the decisions above into a single follow-up commit (`chore: <ID> post-migration cleanup`) OR fold into the §3.9 closure commit if scope is small.

### 3.9 Commit the migration

A lightweight migration is itself a tasknote — typically a `CORE-` task in the project's own freshly-populated `_project/PLAN.md`. Use it to track §3.1–§3.8 including the ID cross-walk table, and commit at Phase 4 closure the same way any other tasknote closes. The cross-walk table belongs in the tasknote body, not in `_project/PLAN.md` — once the migration closes, anyone searching for a legacy ID can find it in the archived migration tasknote.

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

## Visualizer

The flowtron visualizer is a single global instance, not a per-project install. Run it once per machine from flowtron's own checkout:

```sh
cd ~/code/flowtron/viz
npm install   # one-time
npm run dev
```

It scans `${FLOWTRON_VIZ_WORKSPACE:-~/code}/*/_project/PLAN.md` and renders every adopting project; the header-rail project selector swaps the active project. Port `5120` is pinned with `strictPort` — a second instance fails fast rather than scanning the same workspace on a different port. Set `FLOWTRON_VIZ_WORKSPACE` if your projects live somewhere other than `~/code/`. Adopter-side `_project/flowtron/viz/` still works (read-only submodule, unchanged) but is no longer the recommended path.

## Common gotchas

- **Symlinks survive `git clone`.** Don't recreate them after cloning a project — they're already there.
- **The submodule is read-only in adopting projects.** Edits to flowtron itself happen in the flowtron repo; adopting projects pick them up via deliberate version bumps.
- **`/ft-task` not appearing in the menu** almost always means the symlinks are broken or the submodule isn't checked out. `readlink .claude/commands/ft-task.md` should resolve into `_project/flowtron/claude/commands/ft-task.md`.
- **Don't renumber tasks during migration.** Archived tasknotes reference the old IDs by name; renumbering silently invalidates those links.
- **Two viz instances refuse to coexist.** The dev server pins port `5120` with `strictPort`; if a second `npm run dev` errors, an instance is already running — visit it at `http://localhost:5120/`.
