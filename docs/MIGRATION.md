# Adopting Flowtron in a Project

This is the procedural guide for putting flowtron into a project. For the "why," see [PHILOSOPHY.md](PHILOSOPHY.md). For the workflow contract, see [SPEC.md](../SPEC.md).

There are two starting points:

- **Section 1 — Fresh adoption.** The project has no prior workflow tooling, or its workflow is informal enough to discard.
- **Section 2 — Migrating from a prior workflow system.** The project already has a `plan.json`, helper scripts, a `WORKFLOW.md`, or another structured workflow. Do Section 1 first, then continue into Section 2.

Both paths assume the project lives under `~/code/`, has its own git repo, and already has a `CLAUDE.md`.

## 1 — Fresh adoption

> **Want a more opinionated starting point?** [natabula](https://github.com/fakeneuron/natabula) is a project template that pre-wires flowtron alongside FastAPI + React conventions, CI setup, and a richer `CLAUDE.md` starter. If you're starting a new project in that stack, consider cloning natabula instead of wiring flowtron by hand.

### 1.0 Quick path: `/ft-new-project`

If you have flowtron's `/ft-new-project` skill installed globally (one-time setup below), the manual steps in §1.1–1.6 are wrapped in a single command:

```sh
cd ~/code/<your-new-project>
/ft-new-project
```

The skill verifies preconditions (cwd is a git repo with `CLAUDE.md`, no existing flowtron wiring, and no legacy workflow tooling at the root — `PLAN.md`, `plan.json`, or `WORKFLOW.md` route to §3 / §2 instead), asks for the project name and pinned flowtron version, and walks through §1.1–1.6 conversationally. It stages all bootstrap files and surfaces the commit message for your approval — no unprompted commits.

**One-time global installs** (run once per machine, after cloning flowtron to `~/code/flowtron/`):

_Adopter-facing — `/ft-new-project` (also useful for flowtron-self developers bootstrapping new projects):_

```sh
ln -s ~/code/flowtron/claude/skills/ft-new-project    ~/.claude/skills/ft-new-project
ln -s ~/code/flowtron/claude/commands/ft-new-project.md ~/.claude/commands/ft-new-project.md
```

_Adopter-facing — `/ft-flowtron` (info screen: version, principles, bundled-skill roster; reads from the adopter's submodule at `_project/flowtron/SPEC.md`):_

```sh
ln -s ~/code/flowtron/claude/skills/ft-flowtron       ~/.claude/skills/ft-flowtron
ln -s ~/code/flowtron/claude/commands/ft-flowtron.md   ~/.claude/commands/ft-flowtron.md
```

_Flowtron-self developers only — `/ft-release` (bails outside flowtron's checkout; never useful in adopter projects):_

```sh
ln -s ~/code/flowtron/claude/skills/ft-release       ~/.claude/skills/ft-release
ln -s ~/code/flowtron/claude/commands/ft-release.md   ~/.claude/commands/ft-release.md
```

The symlinks point at flowtron's working tree, so they pick up flowtron edits immediately rather than tracking a versioned submodule. If you prefer to pin a specific flowtron version of a skill, copy the files instead of symlinking and re-copy on bump.

If you don't have the skill installed, follow §1.1–1.7 manually below — the skill is a convenience wrapper, not a requirement.

### 1.1 Add flowtron as a submodule

From the project root:

```sh
mkdir -p _project
git submodule add https://github.com/fakeneuron/flowtron.git _project/flowtron
git -C _project/flowtron checkout vX.Y.Z   # replace with the version you want to pin (see git tags)
```

The `checkout` step is what pins the project to a specific flowtron version. Without it, the submodule tracks `main` and updates would be undeliberate.

### 1.2 Wire `/ft-task`, `/ft-starter-task`, `/ft-micro-task`, `/ft-file-followup`, `/ft-epic-discovery`, `/ft-close-epic` via symlinks

Flowtron ships six slash commands and their skills inside the submodule:

- **`/ft-task <ID>`** — standard 4-phase tasknote runner.
- **`/ft-starter-task <ID>`** — file a starter (rich AI-discovered context for tasks not yet ready to start; promoted to a full tasknote at `/ft-task` checkout).
- **`/ft-micro-task <ID>`** — file + execute a small, single-file change with the relevance/drift/archive-skim/pattern-survey contracts but without the full 4-phase ceremony.
- **`/ft-file-followup <ID>`** — file a mid-flow follow-up: one PLAN.md line on disk + a short context paragraph delivered conversationally only (no tasknote artifact). Lighter than `/ft-starter-task`; declines filings >70w and routes to `/ft-starter-task` instead.
- **`/ft-epic-discovery`** — file a new epic (parent `<AREA>-EPIC-<N>` + `.1` Discovery + `.N` audit placeholder) AND drive its `.1` Discovery tasknote through closure in one motion (Phase 2 deliverable = filed implementation children). See `_project/flowtron/SPEC/epic.md` for the lifecycle contract.
- **`/ft-close-epic <AUDIT-SUBTASK-ID>`** — bracket twin of `/ft-epic-discovery`. Scaffolds and drives the audit `.N` tasknote of an epic (with the fixed doc-drift sweep acceptance line per `SPEC/epic.md`) through closure, then prompts to flip the parent `<AREA>-EPIC-<N>` to `Completed` and move the cohort to `## Completed`.

Adopting projects expose all six through their own `.claude/` folder using symlinks. Open `_project/flowtron/claude/CLAUDE-snippet.md` §"One-time symlink wiring" and run the commands listed there from the project root — that file is the single source of truth for the wiring block. The relative paths in the snippet are intentional (they survive `git clone` and pin to whichever flowtron commit the submodule is currently checked out at), so the symlinks never need touching on a version bump. The same file also holds the `CLAUDE.md` paste-block for the next step.

### 1.2.1 Optional: fork the `/ft-audit` family per stack

Flowtron ships an **audit family** at `_project/flowtron/claude/skills/ft-audit*/` — six stack-neutral scaffolds, each a 5-pass / capped-findings / writes-tickets-to-`_project/PLAN.md` skill. **Unlike the six skills in §1.2, the audit family is forked, not symlinked.** Per-stack divergence in rubric files, verification commands, and per-pass examples is the reason — one symlinked scaffold cannot serve every stack without becoming bland enough to miss real issues.

The family:

| Skill | Scope | 5 passes |
|---|---|---|
| `/ft-audit` | Catch-all code audit; default when no specialist fits | Security · Idioms · Hygiene · Orphans · Doc drift |
| `/ft-audit-docs` | Documentation surface | Claims vs. code · Cross-doc consistency · Cross-references · Currency · Stale content |
| `/ft-audit-security` | Security posture | Secrets · Input handling · Auth & authz · Network & boundaries · Dependencies |
| `/ft-audit-frontend` | Frontend (framework-agnostic scaffold) | Bundle & payload · Accessibility · Render perf · Browser hygiene · Component health |
| `/ft-audit-backend` | Backend (framework-agnostic scaffold) | Input & contracts · Error & lifecycle · Persistence · Async correctness · Observability |
| `/ft-audit-performance` | Cross-cutting perf (measurements required) | Hot paths · Payload & bundle · Data access · Memory & resource · Caching |

Pick the ones you'll actually use. Skipping a skill is fine — `/ft-audit` is a sensible default if you don't need specialists yet.

To install one skill (repeat per skill you want):

```sh
SKILL=audit-docs   # or audit, audit-security, audit-frontend, audit-backend, audit-performance
mkdir -p .claude/skills/$SKILL
cp _project/flowtron/claude/skills/ft-$SKILL/SKILL.md  .claude/skills/$SKILL/SKILL.md
cp _project/flowtron/claude/commands/ft-$SKILL.md      .claude/commands/$SKILL.md
```

Upstream paths carry the `ft-` prefix (the namespace bundled flowtron owns per SPEC §"Skill namespace"); the local fork is named **without** the prefix so ownership stays clear in skill resolution — the same SPEC clause mandates this for adopter forks.

Then open each `.claude/skills/<skill>/SKILL.md` and walk the **§0 Forker checklist** at the top — set the default glob, list your rubric files, pin your verification commands, fill in stack-specific pass examples, and call out your project's sacred invariants under Critical severity. Delete the §0 block from each fork once filled in.

You can also split a single skill into per-area forks (e.g. `audit-backend` → `audit-backend-payments` and `audit-backend-ingest`) by copying the SKILL.md into multiple sibling directories and customizing each independently. Adjust the `cp` targets accordingly.

The forks are yours — flowtron version bumps do not touch them. Re-copy from `_project/flowtron/claude/skills/<skill>/SKILL.md` if you ever want to pick up scaffold improvements upstream.

This subsection is **optional**. Projects that don't want structured audit skills can skip §1.2.1 entirely.

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

Declare any project-specific area prefixes. Replace the "Project quick commands" section with the actual test/lint/dev commands for your project. Extend the `## AI-referenced docs` section as the architecture matures — the template seeds it with `README.md` / `CLAUDE.md` / `_project/PLAN.md`; add architecture notes, API specs, DB schema docs, ADRs, inventories. This list is walked at every Phase 4 closure (per `_project/flowtron/SPEC.md` §"🚀 Phase 4: Closure") and at every epic-audit subtask.

The README also describes the canonical tasknote shape — see `_project/flowtron/SPEC.md` §"Tasknote frontmatter" + §"Tasknote body shape" and `_project/flowtron/templates/tasknote-template.md`. Two lightweight variants exist alongside it:

- **Starter tasknote** — `/ft-starter-task <ID>` scaffolds from `tasknote-starter-template.md` for mid-flow context capture; lifecycle at `_project/flowtron/SPEC/starter.md`.
- **Micro tasknote** — `/ft-micro-task <ID>` scaffolds from `tasknote-micro-template.md` for tasks above the skip-tasknote threshold but below full 4-phase ceremony; threshold at `_project/flowtron/SPEC.md` §"When to use a tasknote (and when not to)".

For multi-child code-sweep or feature epics, flowtron also defines an opening **Discovery** subtask (`<AREA>-<N>.1`) and a closing **Audit** subtask (highest `.N`) that bracket the implementation children. See `_project/flowtron/SPEC/epic.md`. Simple multi-subtask implementations don't need the bracket — apply judgment.

### 1.6 Commit

```sh
git add .gitmodules _project/flowtron _project/PLAN.md _project/tasknote/ \
        .claude/commands/ft-task.md .claude/commands/ft-starter-task.md .claude/commands/ft-micro-task.md \
        .claude/commands/ft-file-followup.md .claude/commands/ft-epic-discovery.md .claude/commands/ft-close-epic.md \
        .claude/skills/ft-task .claude/skills/ft-starter-task .claude/skills/ft-micro-task \
        .claude/skills/ft-file-followup .claude/skills/ft-epic-discovery .claude/skills/ft-close-epic \
        CLAUDE.md
git commit -m "chore: adopt flowtron at vX.Y.Z"
```

If your project already has other files under `.claude/` (settings, other skills), the explicit paths above keep the migration commit scoped to just the flowtron wiring.

### 1.7 Verify

In a fresh Claude Code session in the project, type `/ft-task`. The command should appear in the slash-command menu (alongside `/ft-starter-task`, `/ft-micro-task`, `/ft-file-followup`, `/ft-epic-discovery`, and `/ft-close-epic`) with its description. Running `/ft-task <SOME-ID>` against a real entry in your `_project/PLAN.md` should scaffold a tasknote and begin Phase 1 Discovery.

If any command doesn't appear, the symlinks are likely wrong — check that each `readlink .claude/commands/<name>.md` and `readlink .claude/skills/<name>` resolves under the submodule.

---

## 2 — Migrating from a prior workflow system

If the project already has its own workflow tooling, do **Section 1 first** — flowtron lives alongside the legacy system until you finish converting. Then work through the items below in order.

Before any `git mv` or new files, walk **§3.1 — Pre-flight collision check**. The collision risks (`.claude/` symlinks, `_project/tasknote/README.md`, working-tree-clean) apply identically to this heavy path, even though §3.1 lives under §3.

This section assumes you want to lift the **full** plan, including completed entries, into flowtron's shape. If you only want the active queue and are happy to leave historical tasknotes frozen as a read-only legacy reference, jump to **[Section 3](#3--lightweight-migration-current-tasks-only)** instead — it's a much shorter playbook.

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

## 3 — Lightweight migration: current tasks only

Most real-world adoptions don't want to lift the full archive. The legacy plan might be hundreds of closed entries, narrative-heavy, and irrelevant to day-to-day work going forward. This section is the **active-queue-only** playbook: freeze legacy as a read-only reference, lift only the open tasks into flowtron, and don't try to preserve historical link integrity.

Do **Section 1 first** — flowtron lives alongside legacy until you finish the steps below.

**Tradeoffs vs §2.** §2 preserves task IDs exactly so archived tasknotes stay addressable. §3 sacrifices that link integrity in exchange for a much smaller migration: closed entries stay frozen in legacy form, only the active queue moves. Pick §3 when the archive is large enough that converting it is its own multi-day project, or when the legacy plan format (narrative paragraphs, JSON, custom schema) is too far from flowtron's shape to translate cleanly.

### 3.1 Pre-flight collision check

Before any `git mv` or new files, walk this checklist. Each item below is a real-world collision or pre-condition that tripped early adopter migrations (fintown's `CORE-098`, InvisiPaw's `P43-1`); leaving any unresolved at the start makes §3.2's freeze partially fail or silently overwrite a legacy file.

The list is the **generic core**. Project-specific tells (credentials files, live runtime gates, project-local skills, project-specific orphan dirs) belong in the adopter's migration tasknote alongside this list — not here.

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
| P41-2 | BE-001 | Spread/fee-aware entry redesign |
| P42-1 | BE-002 | Boot-banner observability |
| P28-6 | TEST-001 | Playwright UX smoke |
| P28-7 | FE-001 | Full-screen blotter modal |
| P33-1 | FE-002 | Halt UX banner |
| P33-3 | BE-003 | Opt-in daily-loss USD cap |

Closed legacy IDs stay as-is in the frozen `legacy/` tree — they are no longer addressable from new tasknotes via flowtron's `[[TASK-ID]]` wikilinks, and that is the whole point of "current tasks only." External references (commit messages, code comments, doc cross-refs) still resolve into `legacy/` if needed; new work uses the new ID space.

If a renamed task's description references a closed legacy ID, write the cross-link as a plain markdown link (`[P29-2 (legacy)](../legacy/tasknote/P29-2.md)`) rather than a `[[]]` wikilink — flowtron's wikilink resolver assumes the new ID space and `_project/tasknote/archive/<area>/` layout.

### 3.4 Populate `_project/PLAN.md` from the active queue

For each open legacy task, write a new line in the right priority section of the freshly-templated `_project/PLAN.md` using the renamed ID and the task-line grammar from `SPEC.md` §"Task-line format":

```markdown
## High

- [ ] **BE-001** [opus] | strategy entry redesign — Spread/fee-aware EV-positive entry predicate. Supersedes legacy P41-2.
- [ ] **BE-002** [sonnet] | boot banner — Per-strategy `VERSION` + `strategies.py` mtime in startup banner. Supersedes legacy P42-1.
```

Leave `## Completed` empty or seed it with a single pointer line:

```markdown
## Completed

(legacy completions live in `legacy/PLAN.md` — flowtron-era completions land here in stub form per SPEC §"`## Completed` archive convention")
```

The stub-form (CORE-036, v0.10.0) means new flowtron-era completions are one-liners pointing into `_project/tasknote/archive/<area>/`. Don't try to reproduce legacy narrative blocks here — they belong in the frozen legacy plan, not in the new one.

### 3.5 Decide per active tasknote: finish-as-is or rewrap

Same call as §2.2, but the universe is small — only the currently-open tasknotes. For each:

- **Finish-as-is** in the legacy directory if the task is mid-Phase 2 or later. When it closes, archive it alongside the other legacy tasknotes; the line in flowtron's `_project/PLAN.md` flips to `[x] | <shortname> — Completed YYYY-MM-DD. (closed under legacy workflow)`. The new tasknote at `_project/tasknote/archive/<area>/` does **not** get created — the legacy artifact is sufficient.
- **Rewrap** under the new ID if the task is in Phase 1 or stale: scaffold via `/ft-task <NEW-ID>` against the renamed PLAN.md entry. The starter context can be transcribed from the legacy tasknote's discovery notes; apply Phase 1's drift check fully (legacy notes can be weeks old).

### 3.6 Retire helpers and project-side workflow docs

Same as §2.3 and §2.4. Helper scripts (`create_tasknote.py`, `archive_tasknote.py`, `validate_plan.py`) and project-side workflow docs (`WORKFLOW.md`, `TASKNOTE_QUICK_REFERENCE.md`) go away — the flowtron submodule + paste-block in CLAUDE.md cover their job. Project-specific notes shrink and get a pointer at the top.

### 3.7 Update `CLAUDE.md`

Same as §2.5. Replace any block referencing the legacy workflow with the flowtron paste-block from §1.3. Project-specific instructions (architecture notes, non-negotiables, quick commands) stay.

### 3.8 Post-migration cleanup

After §3.2–§3.7 land and `/ft-task` shows in the slash menu, sweep for residual state the migration steps didn't auto-handle. Each item below is a decision point — log the resolution in the migration tasknote's Cleanup Notes (or equivalent). The list is the **generic core**; project-specific tails (live-runtime smoke, CLAUDE.md project-guardrail check, project-specific orphan dirs) belong in the adopter's migration tasknote.

- **Redundant template removal.** `git rm _project/tasknote/tasknote-template.md` if a project-local template survived §3.2. Flowtron's template now lives at `_project/flowtron/templates/`.
- **`_legacy_task` backup disposition.** If §3.1 backed up a project-local `/ft-task` command or skill to `_legacy_task.md` / `_legacy_task/`, decide: delete after migration confirms flowtron's `/ft-task` works, OR keep indefinitely as historical reference.
- **Stale path-reference + ID sweep.** Walk the hit list captured in §3.1's path-reference inventory:
  - In active markdown docs: rewrite as `[<legacy-ID> (legacy)](legacy/...)`-style markdown links per §3.3, OR replace with the cross-walked flowtron ID if the reference is still relevant going forward.
  - In code comments / docstrings: low-risk; leave or update at touch time.
  - In archived/legacy content: leave untouched (write-once policy applies — don't retroactively rewrite history).
- **CI / pre-commit hook check.** `grep -rn "<retired-helper-script-name>" .git/hooks/ .github/ docker/ scripts/` (project root) — confirm nothing depends on retired scripts. Resolve before next CI run.
- **`/ft-starter-task`, `/ft-micro-task`, `/ft-file-followup`, `/ft-epic-discovery`, `/ft-close-epic` smoke.** Type each in a fresh Claude session — confirm all five appear in the slash menu alongside `/ft-task` (v1.0+ additions; symlinks added in §1.2).
- **Final pin verification.** `git -C _project/flowtron describe --tags` shows the pinned version recorded at the start (e.g., `v2.2.0`). A mismatch means the submodule drifted off the pin during migration.
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
cd ~/code/flowtron/viz && npm install   # one-time
cd ~/code/flowtron/viz && npm run dev
```

It scans `${FLOWTRON_VIZ_WORKSPACE:-~/code}/*/_project/PLAN.md` and renders every adopting project; the header-rail project selector swaps the active project. Port `5120` is pinned with `strictPort` — a second instance fails fast rather than scanning the same workspace on a different port. Set `FLOWTRON_VIZ_WORKSPACE` if your projects live somewhere other than `~/code/`. Adopter-side `_project/flowtron/viz/` still works (read-only submodule, unchanged) but is no longer the recommended path.

## Common gotchas

- **Symlinks survive `git clone`.** Don't recreate them after cloning a project — they're already there.
- **The submodule is read-only in adopting projects.** Edits to flowtron itself happen in the flowtron repo; adopting projects pick them up via deliberate version bumps.
- **`/ft-task` not appearing in the menu** almost always means the symlinks are broken or the submodule isn't checked out. `readlink .claude/commands/ft-task.md` should resolve into `_project/flowtron/claude/commands/ft-task.md`.
- **Don't renumber tasks during migration.** Archived tasknotes reference the old IDs by name; renumbering silently invalidates those links.
- **Two viz instances refuse to coexist.** The dev server pins port `5120` with `strictPort`; if a second `npm run dev` errors, an instance is already running — visit it at `http://localhost:5120/`.
