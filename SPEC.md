# Flowtron — Workflow Specification

**Version:** v0.1.0
**Status:** Stable

## What is Flowtron

Flowtron is a lightweight, project-agnostic tasknote system for solo
AI-assisted coding. One source of truth, consumed by adopting projects via
git submodule.

The goal is simple: keep AI context windows small, make tasks self-contained,
and prevent scope drift — without scripts, daemons, databases, or schemas to
maintain.

## Core principles

1. **Markdown over JSON.** Plans and tasknotes are markdown files: human-editable, AI-scannable in diffs.
2. **Zero scripts.** All operations are `cp`, `mv`, and editing markdown. Anything more is over-engineering.
3. **One task per context window.** Tasks are sized so the assistant can hold the entire scope in working memory.
4. **Relevance before action.** Every task starts with a hard gate: is this still the right work?
5. **Versioned and pinned.** Adopting projects pin a specific flowtron commit; updates are deliberate.

## Layout in adopting projects

After adopting flowtron, a project looks like:

```
<project>/
├── CLAUDE.md                       # references _project/flowtron/SPEC.md
├── _project/
│   ├── PLAN.md                     # project-owned roadmap (this format)
│   ├── tasknote/
│   │   ├── README.md               # one-line pointer + project-specific notes
│   │   ├── BE-014.md               # active tasknotes
│   │   └── archive/<area>/         # completed tasknotes by area
│   └── flowtron/                   # git submodule pinned to a flowtron version
└── ...
```

The `_project/flowtron/` submodule is **read-only** in adopting projects.
Edits go upstream to the flowtron repo and are pulled via deliberate version
bumps (see Versioning below).

## Working in the flowtron repo itself

Flowtron does not submodule itself. When working in `~/code/flowtron/`:

- This `SPEC.md` IS the canonical reference.
- The flowtron `_project/PLAN.md` tracks flowtron's own development.
- The `templates/` folder holds the canonical tasknote and PLAN.md templates.

## Task ID convention

Format: `<AREA>-<NUMBER>` for tasks, `<AREA>-EPIC-<NUMBER>` for epics with
subtasks numbered `<AREA>-<NUMBER>.<SUB>`.

Canonical area prefixes:

- `CORE-` — cross-cutting, orchestration, project-wide
- `BE-` — backend
- `FE-` — frontend
- `DB-` — database, migrations
- `DEPLOY-` — deployment, CI/CD, infra
- `TEST-` — testing infrastructure (not individual test fixes)

Adopting projects may add domain prefixes (e.g., `OCR-` for photard's OCR
pipeline). Domain prefixes must be declared in the project's
`_project/tasknote/README.md`.

Numbering: sequential within prefix. Decimals only for epic subtasks (e.g.,
`CORE-EPIC-009` parent + `CORE-009.1`, `CORE-009.2` children).

## The 4-phase workflow

Every tasknote follows four phases in strict serial order. Do not skip ahead.

### Phase 1: Discovery

Mandatory steps:

- [ ] Reviewed the task entry in PLAN.md
- [ ] **Relevance Assessment** — `Proceed` / `Re-scope` / `De-scope` with one-line rationale
- [ ] Read relevant source files
- [ ] **Drift check** — verify file paths, line numbers, function names, and root-cause hypotheses cited in the task description still match current code; surface any drift to the user before re-interpreting the task
- [ ] Asked clarifying questions OR logged "No clarifications needed" with explicit assumptions
- [ ] Defined concrete execution steps below

The Relevance Assessment is non-negotiable. If `Re-scope`, update the task
entry in PLAN.md and the tasknote header before continuing. If `De-scope`,
jump directly to Phase 4 closure with the de-scope rationale as the final
summary.

The drift check exists because the plan is a snapshot, not a spec. Adjacent
work may have moved files, renamed symbols, or invalidated a hypothesis since
the task was written. Do not silently "correct" the plan by executing a
different task than was approved — flag the drift and confirm the path
forward first.

### Phase 2: Execution

- [ ] **Pattern survey** — looked at how neighboring code (sibling modules, parallel components, adjacent services) solves the same shape of problem; chose to extend an existing pattern, or justified the new shape if none fits
- [ ] Implemented the minimal solution
- [ ] Updated/added tests for non-trivial behavior
- [ ] Ran targeted tests on changed files

Keep edits tightly scoped. Resist refactoring adjacent code unless the task
explicitly calls for it. The pattern survey exists to keep the codebase
unified — prefer extending what already works over inventing a parallel
solution.

### Phase 3: Testing & Linting

- [ ] Ran targeted test suite for changed code
- [ ] Ran lint/type-check on changed code
- [ ] (frontend) Asked the user for visual confirmation
- [ ] Fixed all introduced issues

Run the full test suite only when changes are broad or cross-cutting.

### Phase 4: Closure

- [ ] Verified all prior phases complete
- [ ] Updated docs/inventories affected by the change
- [ ] Updated PLAN.md (status flipped to `Completed YYYY-MM-DD`)
- [ ] Moved this tasknote to `_project/tasknote/archive/<area>/`
- [ ] Recapped changes with the user and got confirmation

The recap has two parts: a brief summary of what changed and key decisions,
and an optional verification request — something concrete for the user to
check before they confirm (review the diff, run the feature end-to-end,
eyeball a generated artifact). The next-task suggestion is separate and
lives in the post-closure protocol below.

The tasknote is closed when archived and the user confirms the recap. Commit
happens *after* closure (see post-closure protocol below) and is not part of
the tasknote.

## Post-closure protocol

After a tasknote is archived and confirmed, the assistant must:

1. **Commit.** Bundle code changes, archived tasknote, and PLAN.md status flip
   into a single commit (`feat: <TASK-ID> — <title>` or `fix:` / `docs:` as
   appropriate). Multiple recently-closed tasknotes may bundle into one commit
   when natural.

2. **Suggest the next move.** Do not idle. Either:
   - **Epic continuation:** if the closed task is in an active epic with
     cleared dependencies, name the most natural next task ID with a one-line
     "why now."
   - **Open menu:** surface 2-3 candidate directions from PLAN.md mixing
     priority and readiness. One sentence per option; let the user pick.

3. **Offer the copy-paste line:**

   ```
   /clear then /task <NEXT-ID>
   ```

   Claude cannot run `/clear` itself; the line is for the user to paste to
   start the next task in a fresh context.

## When to use a tasknote (and when not to)

**Use a tasknote when:**

- The change touches more than one file
- The work takes more than ~15 minutes
- The task has a `<AREA>-<NUMBER>` ID in PLAN.md
- The work involves design tradeoffs the assistant should record

**Skip the tasknote for:**

- Single-line typo fixes
- Pure formatting tweaks
- Documentation patches under ~10 lines
- Trivial config edits with no logic impact

When in doubt, write the tasknote. The Discovery phase pays for itself.

## Priority levels

Used in PLAN.md:

- **Critical** — blocking bugs, security issues, production incidents
- **High** — important features and stabilization
- **Medium** — standard development work
- **Low** — nice-to-haves, cleanup
- **Backlog** — unprioritized future work

Selection rule: pick by priority first (Critical → High → Medium → Low →
Backlog), then by lowest incomplete `<AREA>-<NUMBER>` within that priority.

## Model field

Each tasknote header carries a `Model` field (`opus` or `sonnet`). It is the
source of truth for which model runs the task.

A task runs end-to-end on a single model — no swapping mid-task between
Discovery, Execution, Testing, or Closure. If scope grows or ambiguity
surfaces and the tagged model no longer fits, flag it before continuing and
ask whether to retag the task; do not silently swap.

When suggesting a next task, name the recommended model alongside the task
ID. Default to `opus` for design, multi-file changes, or ambiguity; reserve
`sonnet` for mechanical work with a clear diff in mind.

## Versioning

Flowtron uses semver tags. Each tagged release is consumable by adopting
projects via submodule checkout.

- **Patch** (`v0.1.0` → `v0.1.1`) — clarifications, doc fixes, no project-side
  changes needed.
- **Minor** (`v0.1.x` → `v0.2.0`) — additive features (new optional fields,
  new template sections). Adopting projects can ignore the new features and
  continue working.
- **Major** (`v0.x.y` → `v1.0.0`) — breaking change. The bump task's tasknote
  and the annotated tag message list explicit migration steps. Adopting
  projects must follow them when bumping.

Each adopting project's `_project/tasknote/README.md` records the
currently-pinned flowtron version. Bumping is a project-side task (e.g.,
`CORE-XYZ: Bump flowtron to vX.Y.Z`) that runs the migration steps from the
CHANGELOG and commits the new submodule SHA.

## What flowtron does NOT provide

To prevent scope creep, flowtron deliberately omits:

- A CLI tool (use `cp`, `mv`, and your editor)
- Schema validation (markdown is the schema; the assistant catches drift)
- A database backend (markdown files in git are the database)
- Cross-project queries (each project owns its history; the future visualizer
  would aggregate read-only)
- Per-project CI hooks (those belong in the adopting project)

If you find yourself wanting these, write a project-side helper. Do not add
them to flowtron.
