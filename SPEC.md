# Flowtron — Workflow Specification

**Version:** v5.13.0
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

```text
<project>/
├── AGENTS.md                       # references .flowtron/core/SPEC.md
├── .flowtron/
│   ├── PLAN.md                     # project-owned roadmap (this format)
│   ├── tasknote/
│   │   ├── README.md               # one-line pointer + project-specific notes
│   │   ├── BE-014.md               # active tasknotes
│   │   └── archive/<area>/         # completed tasknotes by area
│   └── core/                       # git submodule pinned to a flowtron version
└── ...
```

The `.flowtron/core/` submodule is **read-only** in adopting projects.
Edits go upstream to the flowtron repo and are pulled via deliberate version
bumps (see Versioning below).

## Working in the flowtron repo itself

Flowtron does not submodule itself. When working in `~/code/flowtron/`:

- This `SPEC.md` IS the canonical reference.
- `SPEC/` — lazy SPEC modules loaded on demand by skills.
- `SPEC/procedures/` — agent-neutral procedure SOPs: the source-of-truth projection of execution procedures (e.g. the `/ft-task` 4-phase workflow) for non-Claude wiring and contract-only agents. Format + loading convention: [`SPEC/procedures/README.md`](SPEC/procedures/README.md).
- The flowtron `.flowtron/PLAN.md` tracks flowtron's own development.
- The `templates/` folder holds the canonical tasknote and PLAN.md templates, plus the audit-overlay fork template (see [`docs/MIGRATION.md`](docs/MIGRATION.md) §1.2.1).
- `claude/` — Claude Code commands + skills (`/ft-task`, `/ft-release`, `/ft-new-project`, ...); the adopter snippet lives at `claude/AGENTS-snippet.md`.
- `codex/` — Codex skill wrappers for the full `ft-*` inventory plus Codex-specific wiring notes; `grok/` currently carries the `ft-task` procedure pointer. Future platform wirings plug in symmetrically as sibling top-level dirs — see [`docs/PLATFORMS.md`](docs/PLATFORMS.md) for the plug-in pattern.
- `tools/` — operator-side fleet scripts. Currently just `update-adopters.mjs`, the singular CLI carve-out documented in §"What flowtron does NOT provide".

For flowtron-self global installs (e.g. `/ft-release`), see [`docs/MIGRATION.md`](docs/MIGRATION.md) §1.0 → "One-time global installs" table, `Flowtron-self only` row.

### Lazy SPEC module frontmatter

Each `SPEC/*.md` lazy module opens with optional YAML frontmatter
carrying a `paths:` field — an array of bash-style globs naming the
tasknote-filename shapes the module applies to:

```yaml
---
paths: ['*-EPIC-*.md', '*.[0-9]*.md']
---
```

The field is **populated only where a filename-based trigger applies**.
`SPEC/epic.md` declares the parent-epic and epic-subtask filename shapes;
the remaining modules (`starter` · `blocked` · `model` · `versioning` ·
`gates` · `tasknote-selection` · `loop`) have status- or content-based triggers
and declare `paths: []`. The
leading `> Lazy-loaded SPEC module. Loaded by ...` prose line stays
authoritative for status/content triggers.

The contract is **declarative today**: the source of truth for which
module loads when is still `claude/skills/ft-task/SKILL.md`'s explicit
dispatch (Steps 1.5 / 2 / 3a / 3c / 5) — plus
`claude/skills/ft-goal-task/SKILL.md`, which is the dispatch source for
`SPEC/loop.md`. Future tooling MAY parse the
frontmatter to drive dispatch dynamically.

### Procedure SOPs (`SPEC/procedures/`)

`SPEC/procedures/*.md` files are a distinct artifact from the lazy SPEC
modules above: agent-neutral **procedure SOPs** that project an execution
procedure (e.g. the `/ft-task` 4-phase workflow) for contract-only agents.
They carry a different frontmatter shape — `procedure:` / `source:` /
`last-verified:`, not `paths:` — and are loaded by thin per-agent pointer
wrappers (`<platform>/procedures/<procedure>.md`) rather than by the
`/ft-task` SKILL dispatch. Canonical schema + loading convention:
[`SPEC/procedures/README.md`](SPEC/procedures/README.md).

## Skill namespace

Bundled flowtron skills carry the `ft-` prefix in their slug (`/ft-task`,
`/ft-release`, `/ft-new-project`, `/ft-starter-task`,
`/ft-micro-task`, `/ft-file-followup`, `/ft-sidequest`, `/ft-epic-discovery`,
`/ft-close-epic`, `/ft-debug`, `/ft-goal-task`, `/ft-spec`, `/ft-worktree-start`, `/ft-worktree-end`,
`/ft-flowtron`, `/ft-stats`, `/ft-quality`,
`/ft-audit-context`, `/ft-update`, and the audit family
`/ft-audit{,-repo,-docs,-security,-frontend,-backend,-performance}`). The prefix
reserves the `ft-` slug namespace for flowtron-owned skills so adopter
projects can drop the bundle into `.claude/` without shadowing their own
skill names.

**Adopters MUST NOT use `ft-` for project-specific skills.** Reserve the
prefix for upstream flowtron. When forking the audit family per
[`docs/MIGRATION.md`](docs/MIGRATION.md) §1.2.1, name the fork **without**
the prefix (e.g., `audit-payments`, not `ft-audit-payments`) — the fork is
adopter-owned and the unprefixed name makes ownership clear in skill
resolution.

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
- [ ] **TASK-ID** [!critical] [model] | shortname — long description
```

All of `[!critical]`, `[model]`, and `| shortname` are optional. Canonical
ordering when both flags are present: `[!critical]` BEFORE `[model]`. The
legacy minimal form `- [ ] **TASK-ID** — description` still parses for
backwards compatibility.

| Segment | Required | Notes |
|---|---|---|
| `- [ ]` / `- [x]` | yes | Open or completed checkbox |
| `**TASK-ID**` | yes | Bold ID, matching the §"Task ID convention" pattern |
| ` [!critical]` | optional | Urgency flag — orthogonal to priority bucket. Flagged tasks render a red marker chip and sort to the top of the High column. Filed under whatever priority heading the row already lives under (typically `## High`). |
| ` [model]` | optional | Short identifier for the model assigned to this task. Recommended primary labels: `[heavy]` (design, multi-file, high-ambiguity, or exploratory work) \| `[medium]` (moderate, multi-step but well-scoped work) \| `[light]` (mechanical, clear-diff implementation). Specific names (`fable`, `opus`, `sonnet`, `haiku`, `gpt-5`, `gemini-pro`, etc.) are valid precision tokens; downstream tooling buckets unknown tokens as `other`. Owns the model assignment — `/ft-task` reads this BEFORE scaffolding (see §"Model field"). New entries should declare a model. |
| ` \| shortname` | optional | Short label up to ~30 chars; rendered as the row title in visualizers when present. Falls back to the tasknote frontmatter `title:` for tasks that have a tasknote, or the long description otherwise. |
| ` — long description` | optional | Full description. Carries `Completed YYYY-MM-DD.` markers, re-scope notes, and any rationale that doesn't fit in the shortname. |

Examples:

```markdown
- [ ] **CORE-023** [heavy] | task-line grammar — Extend grammar to declare shortname + model.
- [ ] **FE-200** [!critical] [heavy] | hotfix — Production breakage; floats to top of High.
- [ ] **CORE-016** [light] — Execute project adoption per CORE-008 playbook.
- [ ] **FE-003** | wikilink resolution — Parse [[TASK-ID]] in tasknote body text and render as clickable links.
- [ ] **CORE-024** [light] | quick housekeeping
- [ ] **CORE-016** — Execute project adoption per CORE-008 playbook.    (legacy)
```

**Legacy `## Critical` heading.** Pre-FE-044 PLAN.md files used a `## Critical`
priority heading. The parser soft-migrates this: tasks under a `## Critical`
heading parse with `priority: 'High'` and `critical: true` — equivalent to
filing each row under `## High` with an explicit `[!critical]` flag. Adopters
on older flowtron versions don't lose rows when they bump; migration of the
PLAN.md heading itself is optional cleanup.

Adopting projects' visualizers parse the line per `viz/src/parser.ts`
(canonical reference). The grammar is additive — flowtron bumps don't
require migrating legacy entries; new entries should use the extended form.

**Parser tolerances (decorative, not captured).** `viz/src/parser.ts`
additionally accepts three real-board decorations without parsing them into
`Task` fields — they are dropped, not stored:

- **Model-suggestion glyph after `[model]`** — a `🧠` (heavy) / `🔧` (light) /
  `🧩` (medium) glyph appended to the model token (`[medium]🧩`,
  space-optional), mirroring the next-move suggestion label. Redundant with
  the model tier; ignored.
- **Stacked `[model]` tokens** — `[fable] [light]`: the first bracket token is
  captured as `model`; trailing bracket tokens are tolerated and dropped.
- **Leading status glyph** — a nav-header chip (`🟢`/`⏸`/`✅`/`⚪`/`🌱`) between
  the checkbox and the bold ID (`- [ ] ⏸ **ID**`).

These keep hand-decorated rows from being silently dropped (they surface in
the `parsePlanWithDiagnostics` diagnostics otherwise). They are tolerances,
not canonical authoring grammar — new entries should still use the clean form
above.

**HTML comments are ignored.** Checkbox-shaped lines inside `<!-- ... -->`
comment blocks are non-rendered content: the parser blanks the comment
interior first, so such lines are neither parsed as tasks nor surfaced as
diagnostics. This lets a grammar-reference example carrying a literal
`**TASK-ID**` placeholder live in a comment block (see `templates/PLAN.md`)
without polluting the task list.

**Legacy label lines (excluded, not tolerated).** Some adopter PLAN.md files
predate flowtron entirely and carry completed historical records whose bold
token was never an `<AREA>-NNN` ID (`**P1**`, `**flowtron v5.2.0 bump**`).
Unlike the decorative tolerances above, these aren't parsed into a `Task` at
all — a completed (`[x]`) checkbox line with a bare `**token**` (optionally
followed by an em/en-dash description, no `[!critical]`/`[model]`/
`| shortname`) whose token has no letter-dash-digit ID shape (checked
case-insensitively, so a case-typo like `**fe-065**` still surfaces as a
diagnostic) is silently excluded from both the task list and
`parsePlanWithDiagnostics`'s `unparsed` output. A pending (`[ ]`) line in this
shape still surfaces as unparsed — new entries should get a real ID.

### Long-description conventions

The long description is free prose, but two machine-readable
conventions are reserved so visualizers can surface cross-task signals
on rows without tasknotes:

| Convention | Meaning | Parses into |
|---|---|---|
| `[[TASK-ID]]` | Cross-reference / "see also" | `Task.relatedTasks: string[]` |
| `Blocked by [[ID]]` | Hard dependency on another task | `Task.blockedBy: string[]` |

Both are **wikilink-only** — bare-ID forms do not parse. Multiple
comma-separated wikilinks are supported in a single `Blocked by` clause.

For illustrative wikilinks that shouldn't be parsed: use markdown inline
code spans (treated as literal text) in PLAN.md, or angle-bracket
placeholders (`[[<TASK-ID>]]`) in skill/doc files — both avoid the
`[A-Z]+-[0-9]+` wikilink-integrity grep.

A wikilink inside a `Blocked by` block lands in `blockedBy` only; the same
ID elsewhere in the description is excluded from `relatedTasks` (blocker is
the stronger signal).

Examples:

```markdown
- [ ] **CORE-016** [opus] — Execute migration per [[<CORE-008>]] playbook. Blocked by [[<CORE-008>]] — wait for upstream signal.
- [ ] **FE-003** [opus] | wikilink resolution — Builds on [[<FE-001>]]; pairs with [[<FE-004>]].
- [ ] **FE-007** — Touches [[<FE-001>]], [[<FE-004>]]. Blocked by [[<CORE-008>]], [[<CORE-016>]] — needs both upstream.
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
fields, followed by a Markdown body. The canonical schema lives in `templates/tasknote-template.md`. Valid `status:` values:
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

```markdown
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

**Cross-linking** — references to other tasknotes use
`[[<TASK-ID>]]` wikilinks throughout. They render as plain text on GitHub but
are first-class in markdown-vault tooling (Obsidian, Foam, Logseq) and stay
cheap to write.

**Backwards compatibility** — see §"Tasknote frontmatter" write-once policy.
Adopting projects pick up the new shape on their next flowtron version bump.

## The 4-phase workflow

Every tasknote follows four phases in strict serial order. Do not skip ahead.

### Operator-gate cues

The 4-phase workflow surfaces **up to two** standing phase-gate banners —
explicit-approval pauses, both conditional: 🛠️ Phase 1→2 (post-Discovery)
and 📦 ready-to-commit. A fully mechanical task skips both and runs
end-to-end with inline state markers. Once Phase 1 closes, Phase 2 →
Phase 3 → Phase 4 closure ops flow continuously without intermediate
gates; skill-level extensions (epic parent-flip, release push-go) bundle
into 📦 rather than adding their own banners. Separate from these two phase
gates, a destructive 🗄️/▶️ command cue may trigger a one-off
destructive-action banner — a bounded safety escalation, not a third
standing gate (see the glossary below).

Canonical gate contract — banner format, the trigger table, the Phase
1→2 exit-gate flavors, the conditional skip rule, the `--fast`
operator override, and the full operator-cue vocabulary: see
[`SPEC/gates.md`](SPEC/gates.md).

### Operator-cue glossary

Compact at-a-glance reference for the operator-facing cues skills emit.
Every cue is `<glyph> <UPPERCASE-LABEL>` — the glyph is the fast-scan
signal, the UPPERCASE label survives non-render for cross-agent
reliability. Full contract (emission shapes, escalation, conventions):
[`SPEC/gates.md` §"Operator-cue vocabulary"](SPEC/gates.md).

| Glyph | Label | Means |
|---|---|---|
| 🗄️ | `DB` | run a database / migration command (inline) |
| ▶️ | `RUN` | run a build / script / server step (inline) |
| ✋ | `ACTION` | perform a manual, non-command action (inline) |
| 🟢 | `GO` | commit-go approval ask |
| 👁️ | `CONFIRM` | visual-confirmation ask (covers "visit a URL") |
| 🔍 | `AUDIT` | `/ft-audit*` next-move flag |
| 🛠️ | — | Phase 1→2 approval banner |
| 📦 | — | ready-to-commit approval banner |
| 🏁 | — | committed state-marker (carries the work summary) |
| ✅ | — | phase / closure-complete marker |
| 🔧 / 🧩 / 🧠 | `LIGHT` / `MEDIUM` / `HEAVY` | next-task suggestion: mechanical / moderate / design |
| 👇 | `HERE` | run the suggested invocation in this session (don't clear) |

A destructive 🗄️/▶️ action may escalate from its inline prefix to a
blocking banner — see [`SPEC/gates.md` §"Operator-cue vocabulary" → "Destructive-action escalation"](SPEC/gates.md).

### 📝 Phase 1: Discovery

Mandatory steps:

- [ ] Reviewed the task entry in PLAN.md
- [ ] **Relevance Assessment** — `Proceed` / `Re-scope` / `De-scope` with one-line rationale
- [ ] Read relevant source files
- [ ] **Best Practices Review** — when code or module boundaries are in scope, identify the touched responsibilities, established dependency direction and abstractions, and nearby duplication; record any required in-scope refactor or deferred cleanup (otherwise `N/A` with a one-line reason)
- [ ] **Archive skim** — surface prior decisions on the same files / area by skimming `.flowtron/tasknote/archive/<area>/` for tasknotes that touched the source paths in scope; log relevant findings in Discovery Notes before re-interpreting the task
- [ ] **Drift check** — verify file paths, line numbers, function names, and root-cause hypotheses cited in the task description still match current code; surface any drift to the user before re-interpreting the task
- [ ] Asked clarifying questions OR logged "No clarifications needed" with explicit assumptions
- [ ] Subtasks above populated with concrete, ordered steps

The Relevance Assessment is non-negotiable. `Re-scope` updates the PLAN.md line and tasknote header before continuing (if blocked prerequisite, see §"Blocked tasks"). `De-scope` jumps to Phase 4 closure with the de-scope rationale as the final summary.

Archive skim + drift check both exist because prior tasknotes record decisions (renames, regressions, rationales) and PLAN.md is a snapshot, not a spec. Surface findings before re-interpreting; don't silently "correct" the plan by executing a different task.

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
- [ ] (frontend) Asked the user for visual confirmation (👁️ prefix on the prose ask)

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

The visual-confirmation ask carries a `👁️` inline prefix on the
conversational prompt (e.g., `👁️ Could you confirm the new outline at
http://localhost:5120?`). Inline emoji prefix only — **no banner block,
no operator-gate**; the standing phase-gate count is unaffected.

When `/ft-task` is invoked with `--fast`, the 👁️ ask is suppressed
(lint/type-check on changed code still runs). See
[`SPEC/gates.md` §"`--fast` operator override"](SPEC/gates.md) for the
flag's full surface.

### 🚀 Phase 4: Closure

- [ ] **Doc-drift sweep** — for each entry in `.flowtron/tasknote/README.md` §"AI-referenced docs", state "no change" or the update
- [ ] Closed — PLAN.md line flipped to stub form `Completed YYYY-MM-DD.` and placed per [`SPEC/tasknote-selection.md` §"`## Completed` archive convention"](SPEC/tasknote-selection.md) (standalone → top of `## Completed`; epic child → kept nested beneath its active parent), then tasknote moved to `.flowtron/tasknote/archive/<area>/`
- [ ] **Evidence-based recap** drafted — changed files and LOC where meaningful, verification commands and results, refactors made or deferred with rationale, documentation verdict, and concrete maintainability effect (surfaces at the 📦 ready-to-commit gate, or inline on conditional skip)

Phase 4 closure ops (doc-drift sweep, PLAN.md flip/placement, archive move)
auto-run without an intermediate gate. A standalone task moves to the top of
`## Completed`; an epic child is checked and stubbed in place, preserving its
2-space nesting beneath the active parent until `/ft-close-epic` atomically
moves the parent and complete cohort. The recap drafts alongside — a two-pass
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

The tasknote is closed when archived. Approval-semantics on each branch
live in [`SPEC/gates.md` §"Conditional skip rule"](SPEC/gates.md); commit
itself is not part of the tasknote.

**Paper-complete guard (Phase 4).** PLAN.md flip + archive move are
working-tree prep for a **single atomic closure commit** that must also
land the task's deliverables. Do not treat archive/Completed as "done"
until that commit succeeds. Full rules: §"Paper-complete guard".

## Blocked tasks

Canonical contract: see [`SPEC/blocked.md`](SPEC/blocked.md).

## Loop tasks

A tasknote run under an iteration loop (goal loops, heartbeats) — the
assistant repeats Phase 2 → Phase 3 against a fixed Acceptance target until
it's met, a budget is exhausted, or a per-cycle relevance check says stop.
The runtime (cadence, re-invocation, session lifetime) is Claude Code's
`/loop` or any equivalent runner — flowtron ships no loop runner or
scheduler (see [`docs/VISION.md`](docs/VISION.md) §"What we won't accept").
Flowtron ships the **contract the loop reports to**: gate collapse to
`--fast` semantics (commit-per-verified-iteration; destructive actions park
via `status: blocked` rather than collapse), a per-cycle relevance gate, a
`loop-max:` budget, the `## 🔁 Iterations` log, and the additive
`loop:` / `loop-max:` / `loop-last-run:` frontmatter keys.

Canonical contract: see [`SPEC/loop.md`](SPEC/loop.md).

## Post-closure protocol

After a tasknote is archived, run the three-step protocol (commit / mark landed / offer copy-paste line). Step 1 branches on the **conditional skip rule** — the deterministic three-signal test (frontend / privileged-ops / perf-narrative), the bundled-prompt override, the `--fast` operator override, and the on-skip/on-fire routing all live in [`SPEC/gates.md` §"Conditional skip rule"](SPEC/gates.md). On skip, the closure auto-commits behind a `✅ Closure complete; committing autonomously (…)` marker; on fire, proceed with step 1 below. Steps 2-3 are identical across branches.

1. **Commit (bundled gate, fire branch).** Surface the bundled ready-to-commit gate behind the 📦 cue (per [`SPEC/gates.md` §"Operator-gate cues"](SPEC/gates.md) — preview line mandatory) and wait for commit-go. The bundle has three parts:

   - **Closure review** — per-entry doc-drift verdicts, new PLAN.md stub-form line, archive path.
   - **Recap (work summary)** — 1-2 sentence plain-English lede, then technical detail (file paths / LOC / key decisions + optional verification ask) per §"🚀 Phase 4: Closure".
   - **Proposed commit message** — `feat: <TASK-ID> — <title>` (or `fix:` / `docs:` / `chore:`). Multiple recently-closed tasknotes may bundle into one commit.

   The commit-go prompt carries a `🟢` prefix (e.g., `🟢 Reply commit / go to land.`). Skill-level extensions (e.g., parent-flip Yes/No) ride inside this bundle per the override above; the commit-go is the single approval authorizing recap + closure + bundled prompts + commit.

   **ft-micro-task carve-out.** `/ft-micro-task` carries no 📦 banner block on the fire branch — its commit-go is a plain prose ask in place of the banner; the 📦 cue and 🟢 prefix do not apply. The same conditional skip rule governs both forms. See `/ft-micro-task` SKILL.md Step 5.

2. **Mark the commit landed and suggest the next move.** Once the commit lands **and** the SHA passes the deliverable-covering check in §"Paper-complete guard", prefix the next-move tail with a 🏁 state-marker (parallels 🛠️ → 📦 → 🏁). **Never emit 🏁 without a real commit SHA** from the just-landed closure commit, and never invent or reuse an unrelated SHA.

   ```markdown
   🏁 **<TASK-ID> — committed `<sha>`** · archived to `<archive-path>`
   <1-2 sentence plain-English description of what was accomplished in this commit>
   ```

   Then surface candidates with emoji primary label inline per option — emit `[heavy]🧠`, `[medium]🧩`, or `[light]🔧` (never the bare `[model]` token) followed by "design / moderate / mechanical" prose and shortname. The glyph mirrors the model tier 1:1 (`[light]`→🔧, `[medium]`→🧩, `[heavy]`→🧠; concrete tokens bucket to their inherent tier — see [`SPEC/model.md` §"Tier ladder vs. the next-move suggestion glyph"](SPEC/model.md)):

   ```markdown
   - **<TASK-ID>** [heavy]🧠 | shortname — one-sentence "why now" (design)
   - **<TASK-ID>** [medium]🧩 | shortname — one-sentence "why now" (moderate)
   ```

   **Re-read PLAN.md now** (fresh Read tool call — do not rely on the Step 1 cached parse; the Completed section grows long and stale-context suggestions are a known error mode). For each candidate you intend to name, verify its task line is `- [ ]` (unchecked) and lives in an open section (`## High`, `## Medium`, `## Low`, or `## Future Opportunities`), **not** under `## Completed`. Drop any candidate that fails this check before surfacing it.

   One of three forms:
   - **Epic continuation:** closed task is in an active epic with cleared dependencies → name the single most natural next task ID.
   - **Open menu:** 2-3 candidates from PLAN.md mixing priority and readiness; user picks.
   - **PLAN exhausted (terminal):** the fresh re-read leaves no surviving candidate — every open-section task is checked, or the only entries live under `## Completed`. **Stop. Do not invent a next move.** Naming a task from the `## Completed` archive, a doc example, or the cached Step-1 parse is exactly the confabulation this branch prevents — the two forms above both presuppose ≥1 open task and do not apply. State plainly that PLAN.md holds no open work, then — *in this session, before any clear* — offer to file new work: `/ft-epic-discovery` for a new epic, `/ft-file-followup` for a standalone follow-up. Skip step 3's copy-paste session-reset line: there is no queued task to run after a clear. (This canonizes `/ft-close-epic`'s long-standing empty-PLAN handling.)

   **Audit-family flag.** When a next-move candidate is an `/ft-audit*` slash command, prefix the candidate line (this step) and the copy-paste line (step 3) with 🔍. Audit-family skills are forked per project per `docs/MIGRATION.md` §1.2.1 — in adopter context the local fork is unprefixed (e.g., `/audit-docs`), not `/ft-audit-docs`. The 🔍 marker doubles as a self-check for any AI about to emit `/ft-audit*` as next move.

3. **Offer the copy-paste line.** The label-line glyph is **copied from the chosen candidate line just printed in step 2** — 🧠 when the candidate showed 🧠, 🧩 when it showed 🧩, 🔧 when it showed 🔧; never default to 🔧. Emit the session-reset **label line**, then put the skill invocation **on its own line as inline-code with no trailing punctuation** — a trailing `.` after the ID collides with the `.N` epic-subtask grammar (`FE-132.3.`) and breaks copy/paste. Shape, where `<glyph>` is the candidate's 🔧/🧩/🧠:

   ```markdown
   <glyph> Clear your session, then run:
   `/<next-skill> <args>`
   ```

   Never emit literal `/clear` or `/model` commands — the emoji on the label line carries the model signal; the cue carries the session-reset intent. The skill segment matches the appropriate flowtron skill for the next task — most commonly `/ft-task` (normal tasks), `/ft-micro-task` (micros), `/ft-starter-task` (filing-only), or `/ft-audit*` (audit follow-ups — adopters use the unprefixed local fork per §"Skill namespace"). `<args>` is the next task ID for tasknote-runner skills, or the skill's own argument shape otherwise.

   **Context-dependent skills flag.** When the next-skill is `/ft-sidequest`, `/ft-file-followup`, or `/ft-epic-discovery`, replace the label line with `👇 Run in this session:` — 👇 (`HERE`) replaces the model glyph and signals run-here-don't-clear; the 🔧/🧩/🧠 model signal stays on the candidate line just printed. These skills draw from current-conversation context to draft their output, so clearing the session destroys what they need. Keep the skill invocation line unchanged.

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
budget (≤50w target / 70w hard cap), the `## Completed` archive
stub-form convention, and the downstream-impact reconciliation scan (a new
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

- A CLI tool (use `cp`, `mv`, and your editor) — with one carved-out
  exception: [`tools/update-adopters.mjs`](tools/update-adopters.mjs), the
  operator-side batch updater that walks the workspace and moves each
  adopter's pinned submodule to the latest non-breaking release (dry-run by
  default, local commits only, never pushes). It maintains the fleet *around*
  flowtron-adopting projects, not the workflow inside one — like viz under
  the query-API exclusion, it is the singular exception, not a precedent.
- Schema validation (markdown is the schema; the assistant catches drift)
- A database backend (markdown files in git are the database)
- Cross-project query API (each project owns its history; the read-only
  visualizer is a single global instance — a multi-project query API is
  not)
- Per-project CI hooks (those belong in the adopting project)

If you find yourself wanting these, write a project-side helper. Do not add
them to flowtron.

### PR / suggestion archetypes flowtron does not accept

For future-AI mid-task discipline. Outward-facing prose version with full justification lives in [`docs/VISION.md`](docs/VISION.md) §"What we won't accept".

- **Schema validators.** PR-rejection mirror of "Schema validation" above — markdown is the schema; runtime checkers reintroduce the friction the v0.1.0 cut removed.
- **Abstractions without two-project precedent.** Promote a helper into flowtron only when ≥2 projects need the same shape. Three similar lines is cheaper than premature abstraction.
- **Cross-project query layers beyond the read-only visualizer.** PR-rejection mirror of "Cross-project query API" above — viz is the singular exception; anything richer is out of scope.
- **Multi-user / team features.** Solo system; teams use a different tool.
- **Runtime security scanners / audit daemons.** PR-rejection mirror of "Runtime security scanners" above — the control is the human at the gate, not a scorer; deterministic enforcement lives in per-project permission hooks. `ft-audit-security` + `SECURITY.md` already cover the markdown-native need.
- **LLM knowledge-base / "wiki layer" subsystems.** PR-rejection mirror of "LLM knowledge-base" above — tasknotes + `PLAN.md` + `archive/` already are the clean LLM-maintained markdown layer; a parallel `raw/`+`wiki/` tree duplicates the SSOT. "Knowledge Gate" phase, `/ft-wiki-*` skills, and link-linters are rejected like schema validators.
- **Loop runtime — runners, schedulers, session daemons.** PR-rejection mirror of "Loop runners" above — the loop *runtime* (cadence, re-invocation, session lifetime) is Claude Code's `/loop` or any equivalent, not flowtron. Flowtron ships only the markdown *contract* the loop reports to (§"Loop tasks" → [`SPEC/loop.md`](SPEC/loop.md)); a scheduler, a session daemon, or a `loop-interval` tasknote field is rejected like a cross-project query layer.
