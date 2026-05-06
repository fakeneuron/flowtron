# Flowtron — Workflow Specification

**Version:** v0.7.0
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

## Epic lifecycle

Some epics — particularly **code sweeps** and **major multi-child features** —
benefit from bracketing their implementation children with two coordination
tasks: an **opening Discovery** subtask that surveys the codebase and files
the children, and a **closing Audit** subtask that verifies the completed
work sits well in the codebase as a whole. The Discovery + Audit shape
catches scoping misses up front and integration misses at the end. Simpler
implementations don't need it — apply judgment.

This is *epic-level* Discovery, distinct from the per-tasknote Phase 1
Discovery (§"The 4-phase workflow"). Phase 1 Discovery scopes one task; an
epic Discovery subtask scopes the whole epic and produces the child task
list filed in PLAN.md.

**Numbering convention.** Discovery is the first child (`<AREA>-<N>.1`);
audit is the highest-numbered child at filing time. Both are normal
subtasks — same grammar, same 4-phase tasknote, same model rules.

**Lifecycle:**

1. **File the epic** with a Discovery subtask (`.1`) and a placeholder Audit
   subtask at the end. Implementation children may be empty at filing — the
   Discovery subtask populates them.
2. **Run Discovery** (`/task <ID>.1`). Deliverable: filed child entries in
   PLAN.md, not code.
3. **Run children** in order, normal flow.
4. **Run Audit** (`/task <ID>.<final>`) once all implementation children are
   closed. Final summary records findings even when nothing is wrong.
5. **Audit follow-ups.** Misses surfaced by the audit get filed as `.<N+1>`
   children. For a few small follow-ups, close the audit and execute them
   as normal children. For many, also file a fresh Audit subtask at the new
   highest number to cover the second wave.

**Forward-looking.** Applies to new epics; existing in-flight epics need no
migration. Apply judgment — simple multi-subtask implementations don't need
the bracket.

## Task-line format

Each entry under a priority heading in PLAN.md follows this grammar:

```
- [ ] **TASK-ID** [model] | shortname — long description
```

Both `[model]` and `| shortname` are optional. The legacy minimal form
`- [ ] **TASK-ID** — description` keeps parsing for backwards compatibility.

| Segment | Required | Notes |
|---|---|---|
| `- [ ]` / `- [x]` | yes | Open or completed checkbox |
| `**TASK-ID**` | yes | Bold ID, matching the §"Task ID convention" pattern |
| ` [model]` | optional | `opus` or `sonnet` only. Owns the model assignment for the task — `/task` reads this BEFORE scaffolding (see §"Model field"). New entries should declare a model. |
| ` \| shortname` | optional | Short label up to ~30 chars; rendered as the row title in visualizers when present. Falls back to the tasknote frontmatter `title:` for tasks that have a tasknote, or the long description otherwise. |
| ` — long description` | optional | Full description. Carries `Completed YYYY-MM-DD.` markers, re-scope notes, and any rationale that doesn't fit in the shortname. |

Examples:

```
- [ ] **CORE-023** [opus] | task-line grammar — Extend grammar to declare shortname + model.
- [ ] **CORE-016** [sonnet] — Execute InvisiPaw migration per CORE-008 playbook.
- [ ] **FE-003** | wikilink resolution — Parse [[TASK-ID]] in tasknote body text and render as clickable links.
- [ ] **CORE-024** [opus] | quick housekeeping
- [ ] **CORE-016** — Execute InvisiPaw migration per CORE-008 playbook.    (legacy)
```

Adopting projects' visualizers parse the line with the regex documented in
`viz/src/parser.ts` (the canonical reference). The grammar is additive —
bumping flowtron does not require migrating existing legacy entries; new
entries should follow the extended form.

### Long-description conventions

The long description after `—` is otherwise free prose, but two
machine-readable conventions are reserved so visualizers can surface
cross-task signals on rows that don't yet have a tasknote:

| Convention | Meaning | Parses into |
|---|---|---|
| `[[TASK-ID]]` | Cross-reference / "see also" | `Task.relatedTasks: string[]` |
| `Blocked by [[ID]]` | Hard dependency on another task | `Task.blockedBy: string[]` |

Both are **wikilink-only** — bare-ID forms do not parse. Multiple
comma-separated wikilinks are supported in a single `Blocked by` clause.

Wikilinks inside markdown inline code spans (between backticks) are treated
as literal text, so descriptions can include illustrative `[[TASK-ID]]`
examples without polluting the parsed signal set.

A wikilink inside a `Blocked by` block lands in `blockedBy` only; the same
ID elsewhere in the description is excluded from `relatedTasks` (blocker is
the stronger signal).

Examples:

```
- [ ] **CORE-016** [opus] — Execute migration per [[CORE-008]] playbook. Blocked by [[CORE-008]] — wait for upstream signal.
- [ ] **FE-003** [opus] | wikilink resolution — Builds on [[FE-001]]; pairs with [[FE-004]].
- [ ] **FE-007** — Touches [[FE-001]], [[FE-004]]. Blocked by [[CORE-008]], [[CORE-016]] — needs both upstream.
```

## Tasknote frontmatter

**Write-once policy.** Archived tasknotes are historical records — not
retroactively edited when the spec evolves. Frontmatter and body
conventions apply to new tasknotes only; legacy archives stay as-is. Tools
should silently accept and ignore retired fields (e.g., the v0.2.0 `model:`
field, since moved to the PLAN.md task line — see §"Task-line format" /
§"Model field") when parsing legacy archives. §"Tasknote body shape" and
§"Model field" refer back here rather than restating.

Every tasknote opens with a YAML frontmatter block carrying machine-parseable
fields, followed by a Markdown body. The canonical schema (with field
comments) lives in `templates/tasknote-template.md`. Valid `status:` values:
`starter | not-started | in-progress | blocked | completed`. Valid
`priority:` values: `Critical | High | Medium | Low | Future Opportunities`.

Flowtron itself does not parse this frontmatter — the field contract exists
so adopting projects' tools (visualizers, dashboards, queries) can consume
tasknote metadata without scraping the H1 line. Adopting projects can ignore
the frontmatter and continue working as before.

## Starter tasknotes

A **starter tasknote** is a lightweight, intentionally minimal tasknote shape
for capturing rich AI-discovered context at task-filing time — when context
exists but the task isn't ready to start. Starters preserve the rationale,
suspected files, drift hypotheses, and design decisions that would otherwise
be lost or bloat the PLAN.md long description.

A starter has the same YAML frontmatter as a standard tasknote but with
`status: starter` and the optional `due:` / `related-tasks:` fields
typically omitted. The body has a single `## 🌱 Starter context` section —
**no** spec sections (🎯 Goal / ✅ Acceptance / 🧩 Subtasks / 🔗 Related),
**no** phase scaffolding. Those are added at promotion.

```markdown
# <TASK-ID> | <title>

[← PLAN.md](../PLAN.md) · 🌱 Starter (filed YYYY-MM-DD)

## 🌱 Starter context

<rich context: rationale, solution shape, file survey, decisions,
open questions for promotion, related tasks>
```

Sub-headings within `## 🌱 Starter context` (Why this exists / Solution shape /
Files to touch / Decisions / Open at promotion / Related) are conventional
but optional — drop any with nothing to capture. The canonical layout lives
in `templates/tasknote-starter-template.md`.

**Lifecycle:**

1. **Filing** (mid-flow): when AI surfaces rich context that warrants
   preserving, the `/starter-task <ID>` skill writes the starter file at
   `_project/tasknote/<ID>.md` and appends the PLAN.md entry under the
   appropriate priority section.
2. **Sitting**: visualizers render a 🌱 chip on the row and exclude starters
   from "in progress" counts.
3. **Promotion** at `/task <ID>`: the `/task` skill detects `status: starter`,
   drift-checks the captured context against current code (paths, line
   numbers, function names cited in the starter may have moved), scaffolds
   the rest of the template (🎯 Goal / ✅ Acceptance / 🧩 Subtasks / 🔗 Related
   above a divider, then the four phase sections), and flips status to
   `in-progress`. The starter context informs the spec sections; it is not
   silently authoritative — Phase 1's drift check applies fully.

## Tasknote body shape

Below the YAML frontmatter, every **standard** (non-starter) tasknote follows
a **spec-on-top + log-below** structure so it reads like a small, polished
spec rather than a pure execution log. The canonical layout lives in
`templates/tasknote-template.md`. Starter tasknotes (§"Starter tasknotes")
skip this layout — they carry only the nav header + `## 🌱 Starter context`
section until promotion.

```
# <TASK-ID> | <title>
[← PLAN.md](../PLAN.md) · 🟢 In progress · 🔗 [[RELATED]]   ← nav header

## 🎯 Goal
## ✅ Acceptance
## 🧩 Subtasks
## 🔗 Related

---

## 📝 Phase 1: Discovery
## 🛠️ Phase 2: Execution
## 🧪 Phase 3: Testing & Linting
## 🚀 Phase 4: Closure
```

**Top sections (the "spec"):**

- **Nav header** — single line under the H1: a `← PLAN.md` back-link, a status
  chip (🟢 In progress / ✅ Completed / ⏸ Blocked / ⚪ Not started) that mirrors
  the YAML `status:`, and `[[TASK-ID]]` wikilink chips that mirror
  `related-tasks:`. The status chip is updated at Phase 4 closure.
- **🎯 Goal** — one-sentence description of what this task accomplishes.
- **✅ Acceptance** — checklist of concrete, testable criteria for "done."
  Populated during Phase 1 Discovery.
- **🧩 Subtasks** — checklist of the ordered, concrete steps to complete the
  task. Populated during Phase 1 Discovery (replaces the legacy Phase-1-internal
  "Execution Steps" block).
- **🔗 Related** — bullet list of related tasks with one-line context per ID,
  mirroring `related-tasks:` from the YAML in human-readable form.

**Phase sections (the "log")** — the four-phase checklists below the divider
remain the execution record.

**Cross-linking** — references to other tasknotes use Obsidian-style
`[[<TASK-ID>]]` wikilinks throughout. They render as plain text on GitHub but
are first-class in markdown-vault tooling (Obsidian, Foam, Logseq) and stay
cheap to write.

**Backwards compatibility** — see §"Tasknote frontmatter" write-once policy.
Adopting projects pick up the new shape on their next flowtron version bump.

## The 4-phase workflow

Every tasknote follows four phases in strict serial order. Do not skip ahead.

### 📝 Phase 1: Discovery

Mandatory steps:

- [ ] Reviewed the task entry in PLAN.md
- [ ] **Relevance Assessment** — `Proceed` / `Re-scope` / `De-scope` with one-line rationale
- [ ] Read relevant source files
- [ ] **Archive skim** — surface prior decisions on the same files / area by skimming `_project/tasknote/archive/<area>/` for tasknotes that touched the source paths in scope; log relevant findings in Discovery Notes before re-interpreting the task
- [ ] **Drift check** — verify file paths, line numbers, function names, and root-cause hypotheses cited in the task description still match current code; surface any drift to the user before re-interpreting the task
- [ ] Asked clarifying questions OR logged "No clarifications needed" with explicit assumptions
- [ ] Subtasks above populated with concrete, ordered steps

The Relevance Assessment is non-negotiable. `Re-scope` updates the PLAN.md
line and the tasknote header before continuing; if the re-scope is a
blocked prerequisite, see §"Blocked tasks". `De-scope` jumps directly to
Phase 4 closure with the de-scope rationale as the final summary.

The archive skim exists because prior tasknotes often record decisions and
historical context (file rename trails, regression notes, design
rationales, hardlink discoveries) that bear on the current task but live
nowhere else. The cost is trivial when `archive/<area>/` is empty or
small; the payoff scales as it matures.

The drift check exists because PLAN.md is a snapshot, not a spec. Flag any
drift and confirm the path forward — do not silently "correct" the plan by
executing a different task than was approved.

### 🛠️ Phase 2: Execution

- [ ] **Pattern survey** — looked at how neighboring code (sibling modules, parallel components, adjacent services) solves the same shape of problem; chose to extend an existing pattern, or justified the new shape if none fits
- [ ] Implemented the minimal solution
- [ ] Updated/added tests for non-trivial behavior
- [ ] Ran targeted tests on changed files

Keep edits tightly scoped. Resist refactoring adjacent code unless the task
explicitly calls for it. The pattern survey exists to keep the codebase
unified — prefer extending what already works over inventing a parallel
solution.

If a hard dependency surfaces during execution that wasn't visible at Phase
1, **park the tasknote** per §"Blocked tasks" — flip `status: blocked`,
update the nav header, and stop. The tasknote sits at
`_project/tasknote/<TASK-ID>.md` until the blocker clears; resume by
re-invoking `/task <ID>`.

### 🧪 Phase 3: Testing & Linting

- [ ] Ran targeted test suite for changed code
- [ ] Ran lint/type-check on changed code
- [ ] (frontend) Asked the user for visual confirmation
- [ ] Fixed all introduced issues

Run the full test suite only when changes are broad or cross-cutting.

### 🚀 Phase 4: Closure

- [ ] Verified all prior phases complete
- [ ] Updated docs/inventories affected by the change
- [ ] Updated PLAN.md (status flipped to `Completed YYYY-MM-DD`)
- [ ] Updated nav header status icon to ✅ Completed
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

## Blocked tasks

A task can be **blocked** at two distinct points in its lifecycle, and
flowtron records each at a different layer. The two signals are independent
— they describe different states and serve different consumers.

| Signal | Layer | Means | Entered when |
|---|---|---|---|
| `Blocked by [[ID]]` in PLAN.md long description | PLAN-line | Filed task, dependency cited, not yet started | At filing time, or via Phase 1 Re-scope |
| `status: blocked` in tasknote YAML frontmatter | Tasknote | Started and parked mid-execution | Mid-Phase-2 transition |

A task may carry one, both, or neither. Adopting projects' tools render the
two signals independently — the canonical viz parser surfaces `Blocked by
[[ID]]` as a chip on every row whose long description names a blocker
(regardless of tasknote presence), and the tasknote-level `status:` drives
the row's status badge for rows that have a tasknote.

**Phase 1 entry (Re-scope path).** If Discovery surfaces a real-but-blocked
prerequisite, the verdict is `Re-scope`: add `Blocked by [[ID]]` to the
PLAN.md long description (canonical wikilink form, see §"Long-description
conventions"), delete the just-scaffolded tasknote, and halt. `status:
blocked` is reserved for mid-Phase-2 parking — a Phase 1 blocker has no
Phase 2 work to preserve. The task re-enters when the blocker clears
(remove the `Blocked by` clause; run `/task <ID>` afresh). Blockers reuse
Re-scope rather than introducing a fourth Phase 1 verdict.

**Mid-Phase-2 parking.** If a hard dependency surfaces during Execution,
park the tasknote: flip YAML `status:` from `in-progress` to `blocked`,
flip the nav-header chip from `🟢 In progress` to `⏸ Blocked`, optionally
add `Blocked by [[ID]]` to the PLAN.md line (recommended for viz
visibility, not required — the two signals stay independent), and stop. Do
not run Phase 3 or Phase 4. The tasknote sits at
`_project/tasknote/<TASK-ID>.md` until the blocker clears.

**Parked state.** A blocked tasknote is paused, not closed — Phase 4 is
reserved for actual completion (or a Phase 1 De-scope). The tasknote is not
archived, the PLAN.md task line stays unchecked, and Phase 1 + partial
Phase 2 work are preserved verbatim.

**Exit (resume).** Re-running `/task <ID>` against a blocked tasknote enters
the resume path: drift-check the parked work first (Phase 2 progress may
rest on symbols that moved while the task was parked), flip `status:
blocked` → `in-progress`, flip the nav chip back to `🟢 In progress`,
optionally remove the `Blocked by` clause from PLAN.md (or leave it as
historical context), and continue Phase 2 from where parking left off.
Phase 1 is already complete — do not re-run it.

### Viz interaction

Adopting projects' tools render `Blocked by [[ID]]` (PLAN-line signal) and
tasknote `status: blocked` as independent signals; a row may show either,
both, or neither, and each rendering is correct in its own layer.

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

**File a starter (`/starter-task <ID>`) when:**

- The PLAN.md long description would exceed **~50 words (target) or 70 words (hard cap)** — richer context belongs in the starter body, not on the line
- A task is discovered mid-flow with rich context (rationale, design decisions, file survey, open questions) but isn't ready to start now
- The captured context would be lost or would bloat the PLAN.md long description if recorded as inline prose
- The right shape isn't fully obvious; the AI wants to preserve the survey and open questions for resolution at `/task` checkout

**Skip the starter (just add a one-line PLAN.md entry) when:**

- The long description fits inside ~50 words (a scannable one-liner)
- The task is straightforward enough that the long description suffices
- No design decisions or file survey work has been done yet
- The next available `/task <ID>` slot is the user's natural next move (file it, then start it; no sitting time)

When in doubt, write the tasknote. The Discovery phase pays for itself.

### PLAN.md filing-discipline thresholds

Active PLAN.md long descriptions (everything after `— ` on the task line)
are subject to a hard word budget — the index reads cleanly only when each
line stays scannable, and rich context routes into starter bodies:

| Range | Status | Action |
|---|---|---|
| ≤50 words | Target — comfortably scannable | Keep the one-liner |
| 51-70 words | Yellow flag | Trim if practical; otherwise consider promoting to a starter |
| >70 words | Hard cap — exceeded | Move the rich context into a starter body via `/starter-task <ID>`; PLAN.md line keeps a ≤50w summary |

The thresholds apply to **active** task lines (`Critical` / `High` /
`Medium` / `Low` / `Future Opportunities`). Lines under `## Completed`
record archived task summaries and are out of scope here (they have their
own archive-strategy track — see CORE-036).

`/starter-task` (filing time) and `/task` (scaffold/promote time) flag
filings that breach the cap — see the respective skill files for the
mechanism.

## Priority levels

Used in PLAN.md:

- **Critical** — blocking bugs, security issues, production incidents
- **High** — important features and stabilization
- **Medium** — standard development work
- **Low** — nice-to-haves, cleanup
- **Future Opportunities** — unprioritized future work

Selection rule: pick by priority first (Critical → High → Medium → Low →
Future Opportunities), then by lowest incomplete `<AREA>-<NUMBER>` within that priority.

## Model field

The model assignment (`opus` | `sonnet`) lives on the PLAN.md task line — the
`[model]` segment of §"Task-line format". PLAN.md is the source of truth.

`/task` reads the model BEFORE scaffolding (see `claude/skills/task/SKILL.md`
Step 0.5):

- Active model matches the PLAN.md `[model]` → proceed silently.
- Active model differs → block and offer two paths: switch the active model
  via `/model <X>` then re-invoke `/task`, or retag the PLAN.md line to the
  active model and proceed. No silent overrides.
- PLAN.md line has no `[model]` (legacy entry) → ask the user via
  AskUserQuestion at `/task` entry, before any scaffolding work.

A task runs end-to-end on a single model — no swapping mid-task between
Discovery, Execution, Testing, or Closure. If scope grows and the tagged
model no longer fits, retag the PLAN.md line and re-invoke; do not silently
swap.

When suggesting a next task, name the recommended model alongside the task
ID — the model is part of the PLAN.md grammar, so it's already known without
asking. Default to `opus` for design, multi-file changes, or ambiguity;
reserve `sonnet` for mechanical work with a clear diff in mind.

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
bump's annotated tag message (`git show vX.Y.Z` in the flowtron submodule)
and commits the new submodule SHA.

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
