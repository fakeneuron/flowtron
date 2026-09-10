# Flowtron — Workflow Specification

**Version:** v5.26.0
**Status:** Stable

## What is Flowtron

Flowtron is a lightweight, project-agnostic tasknote system for solo
AI-assisted coding. One source of truth, consumed by adopting projects via
git submodule.

The goal is simple: catch the agent before it wastes a session. The four
phases, the Relevance Assessment, and the Acceptance criteria are the
checkpoints where you look — and one task per context window keeps each one
small enough to actually review. No scripts, daemons, databases, or schemas
to maintain.

## Core principles

1. **Markdown over JSON.** Plans and tasknotes are markdown files: human-editable, AI-scannable in diffs.
2. **Zero scripts.** All operations are `cp`, `mv`, and editing markdown. Anything more is over-engineering.
3. **One task per context window.** Tasks are sized so the assistant can hold the entire scope in working memory.
4. **Relevance before action.** Every task starts with a hard gate: is this still the right work?
5. **Versioned and pinned.** Adopting projects pin a specific flowtron commit; updates are deliberate.

## Layout, and working in the flowtron repo itself

The adopting-project directory layout, the flowtron repo's own layout, lazy
SPEC module frontmatter, procedure SOPs, and the reserved `ft-` skill-name
prefix (adopters MUST NOT use it for their own skills): see
[`SPEC/layout.md`](SPEC/layout.md).

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

Adopting projects may add domain prefixes (e.g., `OCR-` for a vision-heavy
project's OCR pipeline). Domain prefixes must be declared in the project's
`.flowtron/tasknote/README.md`.

Numbering: sequential within prefix. Decimals only for epic subtasks (e.g.,
`CORE-EPIC-009` parent + `CORE-009.1`, `CORE-009.2` children). The subtask
slot accepts either a number (`\d+`) or the reserved literal `N` — `<AREA>-<N>.N`
is the epic's terminal **audit** child (see [`SPEC/epic.md`](SPEC/epic.md)),
grammar-legal as-is so it never needs renaming to a sequential number.

## Epic lifecycle

Canonical contract: see [`SPEC/epic.md`](SPEC/epic.md).

## Task-line format

Each entry under a priority heading in PLAN.md follows this grammar:

```markdown
- [ ] **TASK-ID** [!critical] [model] [unattended] | shortname — long description
```

All of `[!critical]`, `[model]`, `[unattended]`, and `| shortname` are
optional. Canonical ordering when the flags are present: `[!critical]` BEFORE
`[model]`, `[unattended]` AFTER it. The legacy minimal form
`- [ ] **TASK-ID** — description` still parses for backwards compatibility.

| Segment | Required | Notes |
|---|---|---|
| `- [ ]` / `- [x]` | yes | Open or completed checkbox |
| `**TASK-ID**` | yes | Bold ID, matching the §"Task ID convention" pattern |
| ` [!critical]` | optional | Urgency flag — orthogonal to priority bucket. Flagged tasks render a red marker chip and sort to the top of the High column. Filed under whatever priority heading the row already lives under (typically `## High`). |
| ` [model]` | optional | Short identifier for the model assigned to this task. Recommended primary labels: `[heavy]` (design, multi-file, high-ambiguity, or exploratory work) \| `[medium]` (moderate, multi-step but well-scoped work) \| `[light]` (mechanical, clear-diff implementation). Specific names (`fable`, `opus`, `sonnet`, `haiku`, `grok`, `codex`, `gpt-5`, `gemini-pro`, etc.) are valid precision tokens; downstream tooling buckets unknown tokens as `other`. Owns the model assignment — `/ft-task` reads this BEFORE scaffolding (see §"Model field"). New entries should declare a model. |
| ` [unattended]` | optional | Task-level opt-in marker declaring this row safe to dispatch with **no operator present** — the row-scoped counterpart to the `--unattended` invocation posture ([`SPEC/gates.md`](SPEC/gates.md)). Must sit AFTER `[model]`. Consumed by operator-less callers (see [`docs/EXTERNAL-AGENTS.md`](docs/EXTERNAL-AGENTS.md)), which are expected to **deny by default**: an unmarked row is undecided, not approved. The runners read it too: on an attended invocation with no flag, it implies `--fast` — never the `--unattended` posture ([`SPEC/gates.md`](SPEC/gates.md) §"`--fast` operator override"). Flowtron itself never writes it — seeding is an operator act. Parses into `Task.unattended: boolean`. |
| ` \| shortname` | optional | Short label up to ~30 chars; rendered as the row title in visualizers when present. Falls back to the tasknote frontmatter `title:` for tasks that have a tasknote, or the long description otherwise. |
| ` — long description` | optional | Full description. Carries `Completed YYYY-MM-DD.` markers, re-scope notes, and any rationale that doesn't fit in the shortname. |

Examples:

```markdown
- [ ] **CORE-023** [heavy] | task-line grammar — Extend grammar to declare shortname + model.
- [ ] **FE-200** [!critical] [heavy] | hotfix — Production breakage; floats to top of High.
- [ ] **BE-041** [light] [unattended] | regen fixtures — Mechanical; operator marked it safe to drain unattended.
- [ ] **CORE-016** [light] — Execute project adoption per CORE-008 playbook.
- [ ] **FE-003** | wikilink resolution — Parse [[TASK-ID]] in tasknote body text and render as clickable links.
- [ ] **CORE-024** [light] | quick housekeeping
- [ ] **CORE-016** — Execute project adoption per CORE-008 playbook.    (legacy)
```

The grammar is additive — flowtron bumps don't require migrating legacy
entries. **A rewrite preserves the trailing bracket-token run verbatim:** it
changes only the segment it means to change, copying every other bracket token
and any model-suggestion glyph from the original. A dropped token disarms it
with no diagnostic.

Parser tolerances, `[unattended]` footguns, excluded shapes, the legacy
`## Critical` heading, the reserved `[[TASK-ID]]` / `Blocked by [[ID]]`
long-description conventions, and the canonical `viz/src/parser.ts` reference:
see [`SPEC/plan-parser.md`](SPEC/plan-parser.md).

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

**Write-once does not cover lifecycle writes.** The policy scopes *retroactive*
edits — reaching back into an already-archived note because the spec moved on.
It does not reach the `status:` transitions the lifecycle itself performs
(`starter` → `in-progress` at promotion, `in-progress` → `blocked` at a park,
`blocked` → `in-progress` at a resume, `in-progress` → `completed` at Phase 4
closure). Each of those writes happens while the tasknote is **active**, before
any archive move. Do not cite write-once to justify leaving `status:` stale at
closure — that reading is what produced the drift this carve-out closes.

**Write-once does not cover factual corrections.** A task that proves a
**factual** claim in an archived tasknote false appends an append-only
`> **⚠️ Superseded by [[<TASK-ID>]]**` pointer under that note's nav header.
Contract + the three excluded cases:
[`SPEC/superseded-claims.md`](SPEC/superseded-claims.md).
Every tasknote opens with a YAML frontmatter block carrying machine-parseable
fields, followed by a Markdown body. The canonical schema lives in `templates/tasknote-template.md`. Valid `status:` values:
`starter | not-started | in-progress | blocked | completed`.

Flowtron itself does not parse this frontmatter — the field contract exists
so adopting projects' tools (visualizers, dashboards, queries) can consume
tasknote metadata without scraping the H1 line. Adopting projects can ignore
the frontmatter and continue working as before.

**Optional planning keys.** Four additive keys extend the frontmatter when a
task wants a durable, queryable planning claim. They follow the same
omit-when-absent rule as the loop keys
([`SPEC/loop.md`](SPEC/loop.md) §"Frontmatter keys"): legacy notes omit them;
tools ignore them when absent. Omitted means *undeclared*, not "touches
nothing" / "blocked by nothing" / "safe with everyone" / "supersedes
nothing." Bare IDs (not wikilinks) for task references; paths as strings or
globs.

| Key | Value | Meaning |
|---|---|---|
| `touches:` | list of path strings / globs | Files or trees this task expects to edit |
| `blocked-by:` | list of bare task IDs | Durable planning dependency. Distinct from PLAN `Blocked by [[ID]]` (the don't-start / park-visible gate; see [`SPEC/blocked.md`](SPEC/blocked.md)) and from `status: blocked` (mid-Phase-2 park). Survives the Phase 4 PLAN stub. |
| `parallel-safe-with:` | list of bare task IDs | Claimed-safe concurrent siblings (typically worktree isolation) |
| `supersedes:` | list of bare task IDs | This later note replaces that prior *decision*. Written only on the later note. Distinct from the ⚠️ `Superseded by` pointer (factual-false forward write on the old note; see the write-once carve-out above). Never `superseded-by:` on the corrected note. |

Do **not** add `blocks` (the inverse of `blocked-by`; derivable by grep) or
`depends-on` (a synonym of `blocked-by`). A Related prose label `depends-on:`
is not this key. Flowtron ships no validator for these keys. The shipped
templates comment them rather than emitting empty arrays, so the happy-path
scaffold pays nothing at parse time. Starter `### Files to touch` stays the
informal prose survey; YAML `touches:` is the short queryable list once the
files are known.

```yaml
touches:
  - templates/
  - SPEC.md
blocked-by:
  - CORE-445.2
parallel-safe-with:
  - CORE-445.3
supersedes:
  - CORE-157
```

**Park reason.** One additive key, `park-reason:`, records *why* a tasknote
sits at `status: blocked`. Omit-when-absent like the planning keys above:
legacy parked notes omit it and tools ignore it when absent. It appears only
while a note is parked.

The value is a **stable code, then prose**, separated by the same ` — ` this
spec uses on the PLAN.md task line (§"Task-line format"):

```yaml
status: blocked
park-reason: destructive — needs a `git push` to the public remote before the tag can be verified
```

A caller splits on the first ` — ` to read the code and never parses the
prose. The code comes from a **closed set** — a new stop cause adds a row to
this table, never a free-form value:

| Code | Records |
|---|---|
| `drift` | A Phase 1 `Re-scope` / `De-scope` verdict — the 🛠️ drift carve-out |
| `destructive` | A 🗄️/▶️/📡/💻 destructive-action escalation |
| `prerequisite` | A ✋ `ACTION` that must be performed before the run can continue |
| `model-mismatch` | The Step 1.5 concrete-`[model]` STOP |
| `input-needed` | A question autonomous execution cannot answer — a queued bundled in-📦 prompt, or `/ft-close-epic`'s Phase 1→2 clarification ask |
| `visual-confirm` | A Phase 3 👁️ `CONFIRM` visual ask — the check an operator-less run has nobody to hand to |
| `dependency` | A hard dependency surfaced mid-Phase-2 — the park that predates the posture |
| `interrupted` | The run ended without reaching closure *or* a gate — killed, out of context, session lost |

The first six are the gate conversions in [`SPEC/gates.md`](SPEC/gates.md)
§"`--unattended` operator posture"; `dependency` is the mid-Phase-2 park
[`SPEC/blocked.md`](SPEC/blocked.md) has always had. `interrupted` is neither
— nothing stopped the run, it simply ended — and it is the one code a *caller*
writes rather than a runner, to route a stranded note into the resume path
([`SPEC/blocked.md`](SPEC/blocked.md) §"Resuming an interrupted run").

**`drift` vs `dependency`.** The code names what *stopped* the run, not what
motivated it. A `Re-scope` verdict parks as `drift` even when a dependency
drove the verdict, because the verdict is the stop. `dependency` is reserved
for the mid-Phase-2 park, where no verdict is involved.

**Written on every `--unattended` park; optional on an attended one.** With no
operator present the key is the only stop surface a caller has, so a park
without one is a park it cannot classify. An attended park may write it — the
same reason is useful to a human resuming a week later — but is not required to.

**Cleared on resume.** The key describes a *current* stop, so the flip back to
`status: in-progress` removes it, alongside the `⏸ Blocked` → `🟢 In progress`
chip. That is an active-note lifecycle write, not a retroactive edit — the
write-once carve-out above already covers it. A note that parks twice writes
the second reason fresh; a note that reaches Phase 4 closure carries none.

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

```markdown
# <TASK-ID> | <title>
[← PLAN.md](../PLAN.md) · 🟢 In progress · 🔗 [[RELATED]]   ← nav header

## 🎯 Goal
## ✅ Acceptance
## 🧩 Subtasks
## 🔗 Related
## 🌳 Fan-out                                                ← optional (epic Discovery `.1`, M>1)
## 🔄 Handoff                                                ← optional (mid-task resume state)

---

## 📝 Phase 1: Discovery
## 🛠️ Phase 2: Execution
## 🧪 Phase 3: Testing & Linting
## 🚀 Phase 4: Closure
```

**Top sections (the "spec"):**

- **Nav header** — single line under the H1: a `← PLAN.md` back-link, a status
  chip mirroring the YAML `status:`, and `[[TASK-ID]]` wikilink chips
  mirroring `related-tasks:`.

  **The chip is hand-authored at exactly four transitions — scaffold,
  promotion, park, resume — and is deliberately NOT flipped at Phase 4
  closure.** CORE-042.4 (SPEC v0.8.0) retired that flip on purpose, cutting
  closure from three status writes to two. Visualizers compute the canonical
  chip from YAML `status:` at render time, so archived tasknotes may show
  chip text that lags the YAML state. This is intentional: YAML stays
  canonical for tasknote-bearing rows, the PLAN.md checkbox stays canonical
  for the roadmap binary, and the chip is render-derived.

  **Chip vocabulary** — `🟢 In progress` / `✅ Completed` / `⏸ Blocked` /
  `⚪ Not started` / `🌱 Starter`. This enumerates the values a *renderer* may
  produce; it is **not** a list of writes closure should perform. `✅ Completed`
  appears here because visualizers render it from YAML, not because Phase 4
  writes it into the markdown. Reading this list as license for a closure-time
  chip flip is the specific misreading that produced the CORE-042.5
  contradiction and, three months later, CORE-393 — a ticket filed to undo
  CORE-042.4 on the strength of this list alone.
- **🎯 Goal** — one-sentence description of what this task accomplishes.
- **✅ Acceptance** — checklist of concrete, testable criteria for "done."
  Populated during Phase 1 Discovery.
- **🧩 Subtasks** — checklist of the ordered, concrete steps to complete the
  task. Populated during Phase 1 Discovery (replaces the legacy Phase-1-internal
  "Execution Steps" block). A working plan, not a contract — **exempt from the
  Phase 4 Acceptance tick-through** (see §"🚀 Phase 4: Closure").
- **🔗 Related** — bullet list of related tasks with one-line context per ID,
  mirroring `related-tasks:` from the YAML in human-readable form. When a
  planning key is set, the same bullet may carry a type hint (`blocked-by:` /
  `parallel-safe-with:` / `supersedes:`) so the edge stays readable after the
  YAML is written: `[[CORE-445.2]] — blocked-by: templates land first`.
  Archive decision edges that have no YAML key use prose labels `depends-on:`
  (this decision rests on a prior one) and `related-decision:` (see-also) —
  never as frontmatter keys.

**Phase sections (the "log")** — the four-phase checklists below the divider
remain the execution record.

**Optional inserts.** Three sections are written only when the situation calls
for them. None ships in `templates/tasknote-template.md`, and a tasknote
without them is complete, not incomplete:

- **`## 🌳 Fan-out`** — epic-cohort parallelism declaration, written on a
  Discovery `.1` when the epic has more than one implementation child.
  Children echo the claim in YAML so a worktree copy (which carries only the
  child note) still sees it.
- **`## 🔄 Handoff`** — mid-task resume state, written when a session ends
  with work unfinished.
- **`## 🔁 Iterations`** — the append-only per-cycle log a goal loop keeps
  between Phase 3 and Phase 4. Owned by
  [`SPEC/loop.md`](SPEC/loop.md) §"`## 🔁 Iterations` log"; not restated here.

Fan-out and Handoff contract: see
[`SPEC/tasknote-inserts.md`](SPEC/tasknote-inserts.md).

**Cross-linking** — references to other tasknotes use
`[[<TASK-ID>]]` wikilinks throughout. They render as plain text on GitHub but
are first-class in markdown-vault tooling (Obsidian, Foam, Logseq) and stay
cheap to write.

**Backwards compatibility** — see §"Tasknote frontmatter" write-once policy.
Adopting projects pick up the new shape on their next flowtron version bump.

### Optional inserts — Fan-out and Handoff

Canonical contract for both: see
[`SPEC/tasknote-inserts.md`](SPEC/tasknote-inserts.md).

## The 4-phase workflow

Every tasknote follows four phases in strict serial order. Do not skip ahead.

### Operator-gate cues

The workflow surfaces **up to two** standing phase-gate banners: 🛠️ Phase 1→2
(post-Discovery) and 📦 ready-to-commit. Both are conditional, so a fully
mechanical task skips both and runs end-to-end with inline state markers.
Once Phase 1 closes, Phase 2 → Phase 3 → Phase 4 closure ops flow
continuously without intermediate gates, and skill-level extensions (epic
parent-flip, release push-go) bundle into 📦 rather than adding their own
banners.

That is the whole of the gate surface this core spec states. Everything that
governs it is lazy, in three modules, so a run loads only what its decision
needs:

- [`SPEC/gates.md`](SPEC/gates.md) — the machinery. Banner format and trigger
  table, the two-banner cap and its one bounded exception (a destructive
  🗄️/▶️/📡/💻 command escalating in-execution), the Phase 1→2 exit-gate flavors,
  the conditional skip rule, and the single flag×surface matrix and precedence
  ladder settling every `--fast` / `--unattended` / 👁️ interaction — including
  the `--unattended` posture, under which a gate an operator-less run cannot
  answer parks via `status: blocked` rather than firing a banner.
- [`SPEC/cue-vocabulary.md`](SPEC/cue-vocabulary.md) — the reference. Every
  operator cue's glyph, UPPERCASE label, and emission shape.
- [`SPEC/gate-discipline.md`](SPEC/gate-discipline.md) — the discipline. The
  excuses and symptoms that precede a skipped gate, and the carve-outs raised
  and refused.

### 🎯 Purpose blurb

An ID-invoked runner states in two plain-English lines what the task is, as
soon as the `PLAN.md` line is captured — before the model gate, the pre-flight
checks, and any scaffold write, each of which can end the run. Contract: see
[`SPEC/purpose-blurb.md`](SPEC/purpose-blurb.md).

### 📝 Phase 1: Discovery

Mandatory steps:

- [ ] Reviewed the task entry in PLAN.md
- [ ] **Relevance Assessment** — `Proceed` / `Re-scope` / `De-scope` with one-line rationale
- [ ] Read relevant source files — when the read set is broad or its shape is unknown, consider isolating the search in a **probe** (see below) and recording only its distilled return in Discovery Notes
- [ ] **Best Practices Review** — when code or module boundaries are in scope, identify the touched responsibilities, established dependency direction and abstractions, and nearby duplication; record any required in-scope refactor or deferred cleanup (otherwise `N/A` with a one-line reason)
- [ ] **Archive skim** — surface prior decisions on the same files / area by skimming `.flowtron/tasknote/archive/<area>/` for tasknotes that touched the source paths in scope (if YAML `touches:` is set, prefer those paths for the path grep); also open IDs named by `## 🔗 Related`, YAML `supersedes:`, and any ⚠️ `Superseded by` pointer on the hits — still `grep` + read, no query engine; when the grep returns more than a handful of notes (~3 is a fair line), prefer handing the reading to a **probe** (same clause as the read step above) rather than pulling every hit into this window; log relevant findings in Discovery Notes before re-interpreting the task
- [ ] **Drift check** — verify file paths, line numbers, function names, and root-cause hypotheses cited in the task description still match current code, **and** cross-reference the plan this tasknote is forming against its `PLAN.md` line and the SPEC contracts it touches (read them, don't recall them); surface any drift to the user before re-interpreting the task
- [ ] Asked clarifying questions OR logged "No clarifications needed" with explicit assumptions
- [ ] Subtasks above populated with concrete, ordered steps

The Relevance Assessment is non-negotiable. `Re-scope` updates the PLAN.md line and tasknote header before continuing (if blocked prerequisite, see §"Blocked tasks") — preserve the full trailing bracket-token run verbatim (see §"Task-line format"). `De-scope` jumps to Phase 4 closure with the de-scope rationale as the final summary.

The read step's **probe clause** exists because broad search is the one part
of Discovery whose cost is mostly noise. Locating five relevant files can take
fifty tool calls, and every one of them lands in the same context window that
has to hold the task's entire scope (Core Principle #3) through Phase 4. A
**probe** is the release valve: a bounded, read-only sub-agent that owns no
tasknote, answers one stated question, returns a distilled summary, and ends —
so the parent keeps the findings and discards the search. It never runs Phase
1, never trips a gate, and never closes or archives anything; a delegated
context that *does* own a tasknote is a **delegate**, and the distinction is
drawn in [README.md](README.md) §"Sessions, loops, and sub-agents". The brief
and the fixed return shape ship as
[`templates/subagent-probe-template.md`](templates/subagent-probe-template.md).
This is a judgment prompt, not a gate: it adds no checklist box, no phase, and
no machinery — spawning the probe is the operator's or the session's call, and
skipping it is always correct for a narrow read set.

Archive skim + drift check both exist because prior tasknotes record decisions (renames, regressions, rationales) and PLAN.md is a snapshot, not a spec. Surface findings before re-interpreting; don't silently "correct" the plan by executing a different task. When `touches:` is set, use it to narrow the path grep. After the path hits, follow typed Related lines, `supersedes:` IDs, and ⚠️ pointers as extra notes to open — they are edges to read, not a graph query.

The skim's **probe clause** is the read step's, applied where it bites hardest: a
path grep over a mature archive is the one Discovery step whose cost is set by
how long the project has been running rather than by how big the task is, and a
single common path can return dozens of notes. The `~3` is a judgment line, not a
threshold that fires — nothing counts hits, nothing gates on the number, and
reading four notes directly is always a correct call. It is there so the default
on a large hit list is "brief a probe and keep its findings" rather than "read
them all and keep the search too."

The drift check's **cross-artifact half** catches a different failure than its
code half: a plan that is fine against the code but contradicts a contract the
SPEC already settled, or that has quietly drifted from the `PLAN.md` line it
was filed as. Here is the cheapest place to catch either — Phase 4 collapses
that line to a `Completed YYYY-MM-DD.` stub, discarding the description the
tasknote could still have been compared against. It is a **cross-reference,
not a judgment call**: open the `PLAN.md` line and the SPEC section and read
them. The Relevance Assessment above already tests staleness by judgment; this
step exists because judgment alone let CORE-393 — a ticket filed to undo a
contract CORE-042.4 deliberately settled, and documented as settled in
§"Tasknote body shape" — survive filing and reach a full tasknote before anyone
reread the clause.

The Best Practices Review is a focused pre-change check, not a repository
audit. Use it to understand the changed path well enough to preserve clear
responsibilities, existing dependency boundaries, and useful abstractions;
carry only an Acceptance-relevant refactor need into Phase 2, and leave
unrelated cleanup deferred.

**Exit gate.** Once every Phase 1 box is ticked, the 🛠️ Phase 1→2 banner
fires according to the skill's exit-gate flavor — `/ft-task` uses
`default-skip` (skip on routine clarifications; fire only on significant
scope deviation), `/ft-epic-discovery` + `/ft-close-epic` use
`default-fire-on-clarifications` (fire on any surfaced ask). The two
flavors' judgment rules, the shared skip-path inline marker, and the
`--fast` drift carve-out: see [`SPEC/gates.md` §"Phase 1→2 exit gate"](SPEC/gates.md).

### 🛠️ Phase 2: Execution

- [ ] **Pattern survey** — looked at how neighboring code (sibling modules, parallel components, adjacent services) solves the same shape of problem; chose to extend an existing pattern or justified a new shape, checked for avoidable duplication and blurred responsibilities, and preferred composition when it reduced coupling
- [ ] **Minimal refactor gate** — refactored only when Acceptance required it or the touched implementation would otherwise introduce avoidable duplication, obscure a responsibility, or violate an established dependency direction; recorded the reason and deferred unrelated cleanup
- [ ] Implemented the minimal solution
- [ ] Updated/added tests for non-trivial behavior

Keep edits tightly scoped. Resist refactoring adjacent code unless the task
explicitly calls for it. The pattern survey exists to keep the codebase
unified — prefer extending what already works over inventing a parallel
solution. DRY, single-responsibility (SRP), and composition are contextual prompts,
not absolutes: a small local repetition can be clearer than a premature
abstraction, and composition earns preference only when it actually reduces
coupling.

The Minimal Refactor Gate permits the smallest structural correction needed
to satisfy Acceptance or keep the touched path coherent. It does not license
general cleanup; log broader opportunities for later work instead.

If a hard dependency surfaces mid-execution, **park the tasknote** per
§"Blocked tasks" and resume by re-invoking `/ft-task <ID>`.

Phase 2 flows continuously into Phase 3 (and Phase 4 closure ops) without
an intermediate gate; the next operator-gate cue is the 📦 ready-to-commit
banner in §"Post-closure protocol".

### 🧪 Phase 3: Testing & Linting

- [ ] Ran targeted test suite for changed code
- [ ] Ran lint/type-check on changed code
- [ ] **Quality assertions** — for changed code, confirmed no avoidable duplication, dead code, unexplained complexity, unnecessary public-surface growth, or stale code-facing documentation (`N/A` with a one-line reason when no code changed)
- [ ] (frontend) Asked the user for visual confirmation (emphasized `👁️ **CONFIRM**` ask on its own line)

Run the full test suite only when changes are broad or cross-cutting.

Record the Quality Assertions in Testing Notes as review evidence from the
actual diff and changed path. They complement tests and static checks; they do
not require a scorecard, arbitrary threshold, or new validation tool.

**Choosing a test strategy (guidance, not a gate).** Default to targeted
tests on the changed behavior. Where the input space is wide — parsers,
encoders, round-trips, invariants that must hold across many inputs — a
property-based test earns its keep; reach for one when example tests would
leave large gaps. Visual confirmation covers UI surfaces that assertions
can't. This is engineering judgment folded into Phase 3, never a new
lifecycle phase or a schema/validator — the same framing the `/ft-spec`
spec template's "Validation Approach" section carries into planning.

The visual-confirmation ask uses the **emphasized inline ask** shape — its own
line, blank-line isolated, with the label bolded:

```text
👁️ **CONFIRM** — does the new outline render correctly at http://localhost:5120?
```

👁️ is the only cue that gates task completion, which is why it carries more
emphasis than a bare prefix — raised *within* the inline shape, so it is **not
a banner** and the standing phase-gate count is unaffected. Full contract:
[`SPEC/cue-vocabulary.md` §"Emphasized inline ask shape"](SPEC/cue-vocabulary.md).
What `--fast` and `--unattended` do to this ask — suppress it, and convert it
to a `visual-confirm` park, respectively — is one row of
[`SPEC/gates.md` §"Flag precedence and surface matrix"](SPEC/gates.md).

### 🚀 Phase 4: Closure

- [ ] **Doc-drift sweep** — for each entry in `.flowtron/tasknote/README.md` §"AI-referenced docs", state "no change" or the update
- [ ] Closed — every `## ✅ Acceptance` criterion ticked or explicitly annotated (`N/A` / not-met with a one-line reason), tasknote YAML `status:` flipped to `completed`, PLAN.md line flipped to stub form `Completed YYYY-MM-DD.` and placed per [`SPEC/tasknote-selection.md` §"`## Completed` archive convention"](SPEC/tasknote-selection.md) (standalone → top of `## Completed`; epic child → kept nested beneath its active parent), then tasknote moved to `.flowtron/tasknote/archive/<area>/`
- [ ] **Evidence-based recap** drafted — changed files and LOC where meaningful, verification commands and results, refactors made or deferred with rationale, documentation verdict, and concrete maintainability effect (surfaces at the 📦 ready-to-commit gate, or inline on conditional skip)

Phase 4 closure ops (Acceptance tick-through, doc-drift sweep, YAML `status:`
flip, PLAN.md flip/placement, archive move) auto-run without an intermediate
gate. The
`status:` flip is the **first** of the three closure writes (`status:`, PLAN.md
line, archive move) and is what makes the YAML
canonical claim in §"Tasknote body shape" true — it happens while the tasknote
is still active, so it is a pre-archive closure write, **not** a retroactive
edit of an archived record (see §"Tasknote frontmatter"). Where the flipped
line lands is the checklist item's own citation above. The recap drafts alongside — a two-pass
summary leading with 1-2 plain-English sentences of *what the task
accomplished*, then evidence from the work: changed files and LOC where
meaningful, verification commands and results, refactors made or consciously
deferred with rationale, the documentation verdict, and the concrete
maintainability effect. This is evidence, not a scorecard; mark irrelevant
items `N/A` rather than inventing metrics. It bundles into the 📦
ready-to-commit motion (see §"Post-closure protocol") — fire branch:
behind the 📦 banner for one bundled approval; skip branch: inline behind
an `✅ Closure complete; …` marker followed by an autonomous commit.

> **Recap is recap-only.** The next-task suggestion belongs in the
> post-closure protocol, after the commit lands — not inside the recap.

**Handoff persistence.** Anything handed to the operator at closure that
must outlive the session — a proposed commit message, a filing the operator
is to run, a manual step — is written into the tasknote (the Recap, or a
`## 🔄 Handoff` for mid-task state) before archive. A terminal recap is not
durable: once the session scrolls past or the terminal closes, nothing
outside the tasknote file persists. The post-closure copy-paste line is
excluded: it is emitted after the closure commit lands and names the next
task, which the callout above keeps out of the recap.

**Deferred hand-off filing.** When closure defers a real-world operator step
past this task — a manual production action, a follow-up nobody has done
yet — recording it as prose (in the Recap, a `## 🔄 Handoff`, or a README) is
not enough: file it as its own unchecked PLAN.md row, and have any task
whose work depends on that step done first carry a `Blocked by [[ID]]`
clause pointing at it. This task's own PLAN.md line still flips to
Completed — a closed row with the hand-off only in prose hides the pending
step from every future reader; an open PLAN row keeps it visible. The duty
binds an operator-less closure too — the posture *raises* the count of
deferred steps, since whatever the run could not do falls to the absent
operator — and `/ft-file-followup --unattended` is its discharge path there
(`SPEC/tasknote-selection.md` §"Filing commits").

**Acceptance tick-through.** Closure asserts the task against its own stated
criteria, not against the agent's sense of being finished. Tick each
`## ✅ Acceptance` box the work satisfied; for any box it did not, annotate the
box in place (`N/A — <reason>` or `not met — <reason>`) rather than leaving it
silently unticked or deleting it. An unticked, unannotated box at archive time
is indistinguishable from an unnoticed one — which is what the checklist exists
to prevent. The annotation escape hatch is deliberate: criteria written in
Discovery sometimes stop applying by Phase 4, and forcing a tick would make the
box a rubber stamp.

**`## 🧩 Subtasks` is exempt.** Tick-through governs `## ✅ Acceptance` and
nothing else. Subtasks are a working plan, not a contract: the ordered steps
drafted in Discovery legitimately churn as execution finds a better route, and
a step abandoned for a reason recorded in Implementation Notes is a normal
outcome rather than an unnoticed miss. Unticked Subtasks boxes at archive time
are therefore **correct, not drift** — an archived tasknote is judged on its
Acceptance block alone. This is stated here so the silence cannot be re-read as
an implied obligation; it is a scope clarification, not a new rule, and the
surfaces that restate tick-through already name `## ✅ Acceptance` explicitly.

**Superseded-claim pointer (conditional).** If this task falsified a factual
claim in an archived tasknote — the Phase 1 drift check is where that usually
surfaces — append the one-line `> **⚠️ Superseded by [[<TASK-ID>]]**` pointer to
that note as part of closure, and stage it in the same atomic commit. Most
closures falsify nothing and write no pointer. The shape, the append-only rule,
and the three cases it does *not* cover are canonical in §"Tasknote
frontmatter"; this is the trigger, not a second copy of the contract. No new
checkbox — the pointer rides the existing `Closed —` box.

> **No nav-header chip flip here.** Phase 4 does **not** flip the markdown nav
> chip to `✅ Completed`. CORE-042.4 retired that write deliberately (three
> status writes → two), and visualizers derive the chip from YAML `status:` at
> render time — so an archived tasknote reading `🟢 In progress` in the raw
> markdown is correct, not stale. See §"Tasknote body shape" → Nav header
> before proposing to re-add it.

The tasknote is closed when archived. Approval-semantics on each branch
live in [`SPEC/gates.md` §"Conditional skip rule"](SPEC/gates.md); commit
itself is not part of the tasknote.

**Paper-complete guard (Phase 4).** PLAN.md flip + archive move are
working-tree prep for a **single atomic closure commit** that must also
land the task's deliverables. Do not treat archive/Completed as "done"
until that commit succeeds. Full rules: §"Paper-complete guard".

## Blocked tasks

Canonical contract: see [`SPEC/blocked.md`](SPEC/blocked.md).

## Cross-repo edit remit

A tasknote's deliverable lands in the repo whose session opened it. When
Discovery surfaces work that belongs in a **different** repo — a doc, config,
or code change outside this checkout — file it there (a `PLAN.md` line, a
starter tasknote, or a routed ticket) rather than editing it directly from
this task cycle. The target repo's own `/ft-task` cycle executes it, with its
own Discovery, Acceptance, and closure commit. The boundary is symmetric with
the routing adopting projects already run in the other direction: a task that
finds a flowtron-side issue files a `CORE-` ticket and routes it, rather than
fixing flowtron from that project's session.

Canonical contract, including the single documented precedent exception: see
[`SPEC/scope-boundaries.md`](SPEC/scope-boundaries.md).

## Loop tasks

A tasknote run under an iteration loop (goal loops, heartbeats): the assistant
repeats Phase 2 → Phase 3 against a fixed Acceptance target until it is met, a
budget is exhausted, or a per-cycle relevance check says stop. The runtime —
cadence, re-invocation, session lifetime — is Claude Code's `/loop` or any
equivalent runner; flowtron ships no loop runner or scheduler. What flowtron
does ship is the **contract the loop reports to**: gate collapse to `--fast`
semantics (commit per verified iteration; destructive actions park via
`status: blocked` rather than collapse), a per-cycle relevance gate, a
`loop-max:` budget, the `## 🔁 Iterations` log, and the additive `loop:` /
`loop-max:` / `loop-last-run:` frontmatter keys.

Canonical contract: see [`SPEC/loop.md`](SPEC/loop.md).

## Post-closure protocol

After a tasknote is archived, run the three-step protocol (commit / mark landed / offer copy-paste line). Step 1 branches on the **conditional skip rule** — the privileged-ops signal, the bundled-prompt override, the `--fast` operator override, and the on-skip/on-fire routing all live in [`SPEC/gates.md` §"Conditional skip rule"](SPEC/gates.md). On skip, the closure auto-commits behind a `✅ Closure complete; committing autonomously (…)` marker; on fire, proceed with step 1 below. Steps 2–3 run **only after** a deliverable-covering SHA — never in the same turn as a fire-branch 📦 / 🟢 ask.

1. **Commit (bundled gate, fire branch).** Surface the bundled ready-to-commit gate behind the 📦 cue (per [`SPEC/gates.md` §"Operator-gate cues"](SPEC/gates.md) — preview line mandatory) and wait for commit-go. The bundle has three parts:

   - **Closure review** — per-entry doc-drift verdicts, new PLAN.md stub-form line, archive path.
   - **Recap (work summary)** — 1-2 sentence plain-English lede, then technical detail (file paths / LOC / key decisions + optional verification ask) per §"🚀 Phase 4: Closure".
   - **Proposed commit message** — `feat: <TASK-ID> — <title>` (or `fix:` / `docs:` / `chore:`). Multiple recently-closed tasknotes may bundle into one commit.

   The commit-go prompt carries a `🟢` prefix (e.g., `🟢 Reply commit / go to land.`). Accepted replies are the closed set in [`SPEC/cue-vocabulary.md` §"Accepted gate replies"](SPEC/cue-vocabulary.md) (`commit` / `go` / `yes` and the explicit commit verbs named there); `okay` / `looks good` are not members. Skill-level extensions (e.g., parent-flip Yes/No) ride inside this bundle per the override above; the commit-go is the single approval authorizing recap + closure + bundled prompts + commit.

   **ft-micro-task carve-out.** `/ft-micro-task` carries no 📦 banner block on the fire branch — its commit-go is the emphasized 🟢 GO ask (own line, blank-line isolated, bold label) in place of the banner. The 📦 cue does not apply; the 🟢 prefix does. The same conditional skip rule governs both forms. See `/ft-micro-task` SKILL.md Step 5.

2. **Mark the commit landed and suggest the next move.** Once the commit lands **and** the SHA passes the deliverable-covering check in §"Paper-complete guard", prefix the next-move tail with a 🏁 state-marker (parallels 🛠️ → 📦 → 🏁). **Never emit 🏁 without a real commit SHA** from the just-landed closure commit, and never invent or reuse an unrelated SHA. **Never emit this step (or step 3) in the same turn as a fire-branch 📦 / 🟢 ask.**

   ```markdown
   🏁 **<TASK-ID> — committed `<sha>`** · archived to `<archive-path>`
   <1-2 sentence plain-English description of what was accomplished in this commit>
   ```

   Then surface candidates with emoji primary label inline per option — emit `[heavy]🧠`, `[medium]🧩`, `[light]🔧`, or (rare — manual-only filings) `[xheavy]🔭` (never the bare `[model]` token) followed by "design / moderate / mechanical / exploratory" prose and shortname. The glyph mirrors the model tier 1:1 (`[light]`→🔧, `[medium]`→🧩, `[heavy]`→🧠, `[xheavy]`→🔭; concrete tokens bucket to their inherent tier — see [`SPEC/model.md` §"Tier ladder vs. the next-move suggestion glyph"](SPEC/model.md)):

   ```markdown
   - **<TASK-ID>** [heavy]🧠 | shortname — one-sentence "why now" (design)
   - **<TASK-ID>** [medium]🧩 | shortname — one-sentence "why now" (moderate)
   ```

   **Re-read PLAN.md now** (fresh Read tool call — do not rely on the Step 1 cached parse; the Completed section grows long and stale-context suggestions are a known error mode). For each candidate you intend to name, verify its task line is `- [ ]` (unchecked) and lives in an open section (`## High`, `## Medium`, `## Low`, or `## Future Opportunities`), **not** under `## Completed`. Drop any candidate that fails this check before surfacing it.

   One of three forms:
   - **Epic continuation:** closed task is in an active epic with cleared dependencies → name the single most natural next task ID.
   - **Open menu:** 2-3 candidates from PLAN.md mixing priority and readiness; user picks.
   - **PLAN exhausted (terminal):** the fresh re-read leaves no surviving candidate — every open-section task is checked, or the only entries live under `## Completed`. **Stop. Do not invent a next move.** Naming a task from the `## Completed` archive, a doc example, or the cached Step-1 parse is exactly the confabulation this branch prevents — the two forms above both presuppose ≥1 open task and do not apply. State plainly that PLAN.md holds no open work, then — *in this session, before any clear* — offer to file new work: `/ft-epic-discovery` for a new epic, `/ft-file-followup` for a standalone follow-up. Skip step 3's copy-paste session-reset line: there is no queued task to run after a clear. (This canonizes `/ft-close-epic`'s long-standing empty-PLAN handling.)

   **Audit-family flag.** When a next-move candidate is an `/ft-audit*` slash command, prefix the candidate line (this step) and the copy-paste line (step 3) with 🔍. Audit-family skills are forked per project per `docs/MIGRATION.md` §1.2.1 — in adopter context the local fork is unprefixed (e.g., `/audit`), not `/ft-audit`. The 🔍 marker doubles as a self-check for any AI about to emit `/ft-audit*` as next move.

3. **Offer the copy-paste line.** The label-line glyph is **copied from the chosen candidate line just printed in step 2** — 🧠 when the candidate showed 🧠, 🧩 when it showed 🧩, 🔧 when it showed 🔧, 🔭 when it showed 🔭; never default to 🔧. Emit the session-reset **label line**, then put the skill invocation **on its own line as inline-code with no trailing punctuation** — a trailing `.` after the ID collides with the `.N` epic-subtask grammar (`FE-132.3.`) and breaks copy/paste. Shape, where `<glyph>` is the candidate's 🔧/🧩/🧠/🔭:

   ```markdown
   <glyph> Clear your session, then run:
   `/<next-skill> <args>`
   ```

   Never emit literal `/clear` or `/model` commands — the emoji on the label line carries the model signal; the cue carries the session-reset intent. The skill segment matches the appropriate flowtron skill for the next task — most commonly `/ft-task` (normal tasks), `/ft-micro-task` (micros), `/ft-starter-task` (filing-only), or `/ft-audit*` (audit follow-ups — adopters use the unprefixed local fork per [`SPEC/layout.md`](SPEC/layout.md) §"Skill namespace"). `<args>` is the next task ID for tasknote-runner skills, or the skill's own argument shape otherwise.

   **Context-dependent skills flag.** When the next-skill is `/ft-file-followup` (in either mode) or `/ft-epic-discovery`, replace the label line with `👇 Run in this session:` — 👇 (`HERE`) replaces the model glyph and signals run-here-don't-clear; the 🔧/🧩/🧠/🔭 model signal stays on the candidate line just printed. These skills draw from current-conversation context to draft their output, so clearing the session destroys what they need. Keep the skill invocation line unchanged.

## Paper-complete guard

Closes the hole where PLAN.md / archive show **Completed** but deliverables
never landed in git (motivated by external paper-completes such as InvisiPaw
FE-64). Contract only — **not** a general git UX (no auto-stash, no clean
automation, no multi-repo tooling). Skills and procedures implement the
checks; this section is authoritative.

### 1. Foreign-dirt gate (task entry)

At **skill entry**, before scaffold / promote / execute writes (and before
blocked-resume continues Phase 2), run `git status --porcelain` (or
equivalent). If the working tree is **non-empty**:

- **STOP.** Do not scaffold, promote, or resume.
- Surface the dirt list and ask the operator to commit, stash, or discard
  **themselves** — then re-invoke the skill.
- No assistant-driven stash/clean/commit of foreign dirt.

Same-conversation continue after a start-only skill already opened the
tasknote is out of band (those skills refuse re-entry on in-flight notes).

### 2. Atomic single-commit closure

Phase 4 may write PLAN.md Completed + archive move in the working tree as
**prep**, but "done" means one **atomic** commit that includes:

1. The task's **deliverable paths** (code, docs, contract edits named by
   Acceptance / Implementation — not only workflow files), **and**
2. The PLAN.md flip + tasknote archive move for **this** task ID.

Rules:

- **Never** leave PLAN/archive as Completed without immediately proceeding
  to the post-closure commit path in the same turn (skip or 📦 fire). If
  commit cannot run, **do not** flip PLAN/archive yet — keep the tasknote
  open until deliverables are ready to land with the flip.
- **Never** commit PLAN/archive alone when Acceptance requires non-workflow
  deliverables. Stage deliverable paths first; refuse a Completed-only
  commit.
- **Workflow-only carve-out:** pure filing / Discovery / audit-with-no-code
  tasks may land PLAN + archive (and any PLAN child-line edits) alone when
  Acceptance has no other deliverable surfaces.
- **Ban collateral Completed flips.** Closure may flip only the current
  task's PLAN line (plus epic-cohort moves under an explicit 📦 parent-flip
  approval for `/ft-close-epic`). Do not mark other open tasks Completed as
  a side effect.

### 3. 🏁 only with a deliverable-covering SHA

Emit 🏁 **only after** `git commit` succeeds and returns a real SHA, and
only when `git show --name-only --pretty=format: <sha>` (or equivalent)
covers:

- the PLAN.md + archive paths for this task, **and**
- every non-workflow deliverable surface implied by Acceptance (judgment:
  paths edited for the goal — source modules, SPEC/skills, tests — not
  incidental untracked noise).

If the commit is missing required deliverable paths: **do not emit 🏁**;
fix the staging set and commit again (or reopen the tasknote if the flip
was premature). Never invent a SHA or claim a prior unrelated commit.

## When to use a tasknote (and when not to)

Canonical contract: see [`SPEC/tasknote-selection.md`](SPEC/tasknote-selection.md).
The module carries the full use/skip thresholds (tasknote · starter ·
follow-up · micro-tasknote · debug), the PLAN.md filing-discipline word
budget (≤50w target / 70w hard cap), the filing-commit contract (the four
filing motions — follow-up, park, starter, and `/ft-audit` — auto-commit at
hand-off since filing approval *is* commit authorization; execution skills keep
their commit-go gate), the `## Completed` archive
stub-form convention, the `## Completed` rotation bound (older month blocks
spill verbatim to `.flowtron/PLAN-ARCHIVE.md` on an operator motion; advisory
only, nothing deleted), and the downstream-impact reconciliation scan (a new
filing or a mid-flow direction change triggers a cohesion check against
active PLAN entries, behind a user-confirm gate).

## Priority levels

Used in PLAN.md:

- **High** — important features, stabilization, and urgent work (blocking bugs, security issues, and production incidents add a `[!critical]` flag — see §"Task-line format")
- **Medium** — standard development work
- **Low** — nice-to-haves, cleanup
- **Future Opportunities** — unprioritized future work

Selection rule: within High, `[!critical]` rows come first; then pick by
priority (High → Medium → Low → Future Opportunities), then by lowest
incomplete `<AREA>-<NUMBER>` within that priority.

## Model field

Canonical contract: see [`SPEC/model.md`](SPEC/model.md).

## Versioning

Canonical contract: see [`SPEC/versioning.md`](SPEC/versioning.md).

## What flowtron does NOT provide

To prevent scope creep, flowtron deliberately omits:

- A CLI tool (use `cp`, `mv`, and your editor) — one carved-out exception:
  [`tools/update-adopters.mjs`](tools/update-adopters.mjs), the operator-side
  batch updater that maintains the fleet *around* adopting projects, not the
  workflow inside one.
- Schema validation (markdown is the schema; the assistant catches drift)
- A database backend (markdown files in git are the database)
- Cross-project query API (each project owns its history; the read-only
  visualizer is a single global instance — a multi-project query API is not)
- Per-project CI hooks (those belong in the adopting project)

Both carve-outs above are singular exceptions, not precedents. If you find
yourself wanting any of these, write a project-side helper — do not add them
to flowtron.

Canonical contract: see [`SPEC/scope-boundaries.md`](SPEC/scope-boundaries.md),
which also carries the PR / suggestion archetypes flowtron does not accept.
