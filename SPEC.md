# Flowtron — Workflow Specification

**Version:** v1.3.0
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

Canonical contract: see [`SPEC/epic.md`](SPEC/epic.md).

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
should silently accept and ignore retired fields (the v0.2.0 `model:` field
since moved to the PLAN.md task line — see §"Task-line format" /
§"Model field"; and the v0.8.0 `priority:` and `area:` fields, both
derivable from the PLAN.md section heading and the task ID prefix
respectively) when parsing legacy archives. §"Tasknote body shape" and
§"Model field" refer back here rather than restating.

Every tasknote opens with a YAML frontmatter block carrying machine-parseable
fields, followed by a Markdown body. The canonical schema (with field
comments) lives in `templates/tasknote-template.md`. Valid `status:` values:
`starter | not-started | in-progress | blocked | completed`.

Flowtron itself does not parse this frontmatter — the field contract exists
so adopting projects' tools (visualizers, dashboards, queries) can consume
tasknote metadata without scraping the H1 line. Adopting projects can ignore
the frontmatter and continue working as before.

**Date format:** always use `YYYY-MM-DD` for `created:`, `Completed`, and `Archived` date fields.

## Starter tasknotes

Canonical contract: see [`SPEC/starter.md`](SPEC/starter.md).

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
  chip (🟢 In progress / ✅ Completed / ⏸ Blocked / ⚪ Not started / 🌱 Starter)
  that mirrors the YAML `status:`, and `[[TASK-ID]]` wikilink chips that
  mirror `related-tasks:`. The chip in the markdown body is hand-authored at
  state transitions (scaffold, promotion, park, resume) for editor parity but
  is **not** flipped at Phase 4 closure — visualizers compute the canonical
  chip from YAML `status:` at render time, so archived tasknotes may show a
  chip text that lags the YAML state. This is intentional: YAML stays
  canonical for tasknote-bearing rows, the PLAN.md checkbox stays canonical
  for the roadmap binary, and the chip is render-derived.
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

### Operator-gate cues

The 4-phase workflow surfaces **two** operator-gate banners — moments
where the assistant pauses for explicit user approval before continuing.
To make these gates visually scannable in the transcript, the assistant
surfaces a banner cue at each one:

```
---

<emoji>  **AWAITING APPROVAL — <label>**

_<1-2 sentence plain-English preview of what executes on approval>_

---
```

| Gate | Emoji | Label |
|---|---|---|
| Phase 1→2 (post-Discovery) | 🛠️ | `AWAITING APPROVAL — Phase 2: Execution ready` |
| Ready-to-commit (closure review + work summary bundled) | 📦 | `AWAITING APPROVAL — Ready to commit` |

The preview line is **mandatory** on both gates: a 1-2 sentence
plain-English summary of *what executes if the user approves*, italicized,
placed inside the banner block immediately above the closing `---`. The
preview is for scanning intent ("what am I greenlighting?") — file paths,
LOC counts, and key decisions belong in the recap (per §"🚀 Phase 4:
Closure"), not the preview.

After the user clears the 🛠️ gate, Phase 2 → Phase 3 → Phase 4 closure
ops (doc-drift sweep, PLAN.md flip, archive move) **flow continuously
without intermediate gates**. The recap (work summary) is drafted during
closure ops but does not surface its own banner — it bundles into the 📦
ready-to-commit gate alongside the closure review (per-entry doc-drift
verdicts, PLAN.md line preview, archive path) and the proposed commit
message. One bundled approval, one commit.

Skill-level extensions (epic parent-flip, release push-go, etc.) **bundle
into the 📦 gate** rather than adding their own banners — the prompt is
presented inside the ready-to-commit content, not behind a separate cue.
The convention is a UX layer over the existing pause points — it does
not introduce new gates.

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

**Exit gate:** once every Phase 1 box is ticked, surface the Phase 2
operator-gate cue (see §"Operator-gate cues") and wait for the user's go
before starting execution.

### 🛠️ Phase 2: Execution

- [ ] **Pattern survey** — looked at how neighboring code (sibling modules, parallel components, adjacent services) solves the same shape of problem; chose to extend an existing pattern, or justified the new shape if none fits
- [ ] Implemented the minimal solution
- [ ] Updated/added tests for non-trivial behavior

Keep edits tightly scoped. Resist refactoring adjacent code unless the task
explicitly calls for it. The pattern survey exists to keep the codebase
unified — prefer extending what already works over inventing a parallel
solution.

If a hard dependency surfaces during execution that wasn't visible at Phase
1, **park the tasknote** per §"Blocked tasks" — flip `status: blocked`,
update the nav header, and stop. The tasknote sits at
`_project/tasknote/<TASK-ID>.md` until the blocker clears; resume by
re-invoking `/task <ID>`.

Phase 2 flows continuously into Phase 3 (and Phase 4 closure ops) without
an intermediate gate; the next operator-gate cue is the 📦 ready-to-commit
banner in §"Post-closure protocol".

### 🧪 Phase 3: Testing & Linting

- [ ] Ran targeted test suite for changed code
- [ ] Ran lint/type-check on changed code
- [ ] (frontend) Asked the user for visual confirmation (👁️ prefix on the prose ask)

Run the full test suite only when changes are broad or cross-cutting.

The visual-confirmation ask carries a `👁️` inline prefix on the
conversational prompt (e.g., `👁️ Could you take a look at viz at
http://localhost:5176 and confirm the new outline behaves as expected
before I move to closure?`). Inline emoji prefix only — **no banner
block, no operator-gate**. Gate count stays at 2; the prefix is a
scannable visual cue parallel to 🛠️ / 📦 without elevating
visual-confirmation to gate status.

### 🚀 Phase 4: Closure

- [ ] **Doc-drift sweep** — for each entry in `_project/tasknote/README.md` §"AI-referenced docs", state "no change" or the update
- [ ] Closed — PLAN.md line flipped to stub form `Completed YYYY-MM-DD.` (see §"`## Completed` archive convention") and tasknote moved to `_project/tasknote/archive/<area>/`
- [ ] Recap drafted (surfaces at the 📦 ready-to-commit gate)

Phase 4 closure ops (doc-drift sweep, PLAN.md flip, archive move) auto-run
without an intermediate gate. The recap — a two-pass summary leading with
1-2 plain-English sentences of *what the task accomplished* (non-technical,
suitable for fast scanning), then technical detail (file paths, LOC, key
decisions, plus an optional verification request: something concrete for
the user to check, like reviewing the diff, running the feature, or
eyeballing a generated artifact) — is drafted alongside but **does not
surface its own banner**. It bundles into the 📦 ready-to-commit gate
(see §"Post-closure protocol") where the user sees recap + closure review
+ commit message together and gives one bundled approval.

> **Recap is recap-only.** The recap leads with a 1-2 sentence plain-English
> summary, then technical detail (file paths / LOC / decisions / verification
> ask), and stops there. The next-task suggestion belongs in the
> post-closure protocol, after the commit lands — not inside the recap.

The tasknote is closed when archived. The user's commit-go (at the 📦
gate) is the bundled approval that confirms the recap and authorizes the
commit. Commit itself happens after that go (see post-closure protocol
below) and is not part of the tasknote.

## Blocked tasks

Canonical contract: see [`SPEC/blocked.md`](SPEC/blocked.md).

## Post-closure protocol

After a tasknote is archived, the assistant must:

1. **Commit (bundled gate).** Surface the **bundled ready-to-commit gate**
   behind the 📦 operator-gate cue (see §"Operator-gate cues") and wait
   for commit-go. The 📦 banner carries the mandatory 1-2 sentence
   plain-English preview line (per §"Operator-gate cues") immediately
   above the closing rule. The bundle has three parts surfaced together:

   - **Closure review** — per-entry doc-drift verdicts, the new PLAN.md
     stub-form line, and the archive path the tasknote moved to.
   - **Recap (work summary)** — leads with a 1-2 sentence plain-English
     summary of what the task accomplished, then technical detail (file
     paths / LOC / key decisions + the optional verification ask). Per
     §"🚀 Phase 4: Closure".
   - **Proposed commit message** — `feat: <TASK-ID> — <title>` (or
     `fix:` / `docs:` / `chore:` as appropriate). Multiple
     recently-closed tasknotes may bundle into one commit when natural.

   The commit-go prompt at the bottom of the bundle carries a `🟢` emoji
   prefix (e.g., `🟢 Reply commit / go to land.`) so the call-to-action
   stands out under the closure-review tables.

   Skill-level extensions (e.g., /close-epic's parent-flip Yes/No prompt)
   ride inside this bundle rather than getting their own banner. The
   user's commit-go is the single approval that authorizes recap +
   closure + bundled prompts + commit.

2. **Mark the commit landed and suggest the next move.** Once the commit
   lands, prefix the post-commit response's tail (immediately above the
   next-move suggestion) with a 🏁 state-marker line so the task's
   lifecycle visually closes in the transcript (parallels 🛠️ → 📦 → 🏁):

   ```
   🏁 **<TASK-ID> — committed `<sha>`** · archived to `<archive-path>`
   ```

   Then surface candidates with `[model]` tags visible inline per option,
   mirroring the PLAN.md task-line shape so the user can scan model
   assignments without cross-referencing PLAN.md:

   ```
   - **<TASK-ID>** [model] | shortname — one-sentence "why now"
   ```

   Either form:
   - **Epic continuation:** if the closed task is in an active epic with
     cleared dependencies, name the single most natural next task ID
     using the inline shape above.
   - **Open menu:** surface 2-3 candidates from PLAN.md mixing priority
     and readiness, one per line in the inline shape above; let the user
     pick.

3. **Offer the copy-paste line:**

   ```
   /clear then /model <opus|sonnet> then /task <NEXT-ID>
   ```

   Claude cannot run `/clear` itself; the line is for the user to paste to
   start the next task in a fresh context. The `/model` segment matches
   the next task's PLAN-line `[model]` tag — a no-op when the active
   model already matches, but pre-empts the Step 1.5 model gate on
   assistant-driven hand-offs (the gate still fires on cold starts where
   the assistant didn't pick the model).

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

**File a follow-up (`/file-followup <ID>`) when:**

- A new task surfaces mid-flow (typically inside an active `/task`) and the long description fits in ≤50 words, but the surrounding conversation context (why this came up, suspected files, recommended priority/model) is worth surfacing once at filing time without persisting it to disk
- The follow-up is clear enough that it doesn't need a starter body — but you still want a paragraph of rationale visible in chat alongside the new PLAN.md line
- You want the lightest filing motion in the cohort: one PLAN.md line written, a short paragraph delivered conversationally, zero edits to the active tasknote

A `/file-followup` filing produces **zero artifacts on disk beyond a single PLAN.md task line**. The "short context paragraph" — rationale + suspected scope + recommended priority/model — is delivered conversationally only; there is no tasknote file, and the active tasknote (if any) is not edited. If the description would breach the 70w cap, `/file-followup` declines the filing and points at `/starter-task` instead — rich context belongs in starter bodies, not chat.

**Skip the follow-up (use `/starter-task` or just inline a PLAN.md line) when:**

- The description would breach 50 words — `/starter-task` is the right tool; rich context belongs in the starter body
- Persistent context (file survey, open questions, design decisions) is worth preserving to disk — same call: use `/starter-task`
- You're outside any active conversation that produced the rationale — write the PLAN.md line directly; the conversational paragraph would have nothing meaningful to surface

**File a micro-tasknote (`/micro-task <ID>`) when:**

- The task is above the skip threshold (more than a one-liner; touches code or non-trivial doc state) but small enough that the full 4-phase ceremony is overkill — typically under ~30 minutes of effort
- The change is single-file or near-single-file, with no design tradeoffs worth recording across multiple subtasks
- The shape is obvious enough that Acceptance/Subtasks checklists would just restate the goal — but you still want the relevance / drift / archive-skim / pattern-survey contracts before writing code
- Examples: small audits, focused doc patches, single-file behavior tweaks with clear scope

A micro-tasknote uses a single `## ⚡ Notes` section with bold-prefix prompts (Relevance · Drift check · Archive skim · Pattern survey · Implementation) instead of the four phase checklists, plus a `## ✅ Recap` and an `Archived:` line. Closure flips two places (PLAN.md + tasknote location), the same as a normal tasknote. The `/micro-task` skill is **file + execute (one-shot)** — it scaffolds, drives execution inline, and closes in a single conversation.

**Skip the micro-tasknote (use `/task` instead) when:**

- The task touches multiple files or has design tradeoffs to record
- The task is likely to take more than ~30 minutes
- The 4-phase log would carry useful state (Discovery findings, intermediate Phase 2 work) for downstream tasknotes or audits
- You're unsure — default to `/task`. The Discovery phase pays for itself.

When in doubt, write the full tasknote. The 4-phase ceremony pays for itself.

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
are governed by §"`## Completed` archive convention" below.

`/starter-task` (filing time), `/file-followup` (filing time), and `/task`
(scaffold/promote time) flag filings that breach the cap — see the respective
skill files for the mechanism. `/file-followup` declines the filing entirely
at >70w and routes the user to `/starter-task` instead.

### `## Completed` archive convention

Closed task lines under `## Completed` collapse to a stub form:

```
- [x] **TASK-ID** [model] | shortname — Completed YYYY-MM-DD.
```

The long description is dropped — the archived tasknote at
`_project/tasknote/archive/<area>/<TASK-ID>.md` is the canonical record.
PLAN.md keeps the cross-reference accessible via the ID; rich detail is
one click away in the archive.

This is enforced at Phase 4 closure: the flip rewrites the line to the
stub form, not just the checkbox + date. The `| shortname` segment is
required in the stub form so visualizers have a row title — without it,
the empty long description leaves the row label blank. `[model]` stays
optional (legacy entries without a model continue to parse and render).

Adopting projects pick up the convention on their next flowtron version
bump and may migrate existing entries at their own cadence (additive
change; legacy paragraph-form entries continue to parse).

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

Canonical contract: see [`SPEC/model.md`](SPEC/model.md).

## Versioning

Canonical contract: see [`SPEC/versioning.md`](SPEC/versioning.md).

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
