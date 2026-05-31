# Flowtron — Workflow Specification

**Version:** v4.4.0
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
├── AGENTS.md                       # references _project/flowtron/SPEC.md
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
- `SPEC/` — lazy SPEC modules loaded on demand by skills.
- The flowtron `_project/PLAN.md` tracks flowtron's own development.
- The `templates/` folder holds the canonical tasknote and PLAN.md templates.
- `claude/` — Claude Code commands + skills (`/ft-task`, `/ft-release`, `/ft-new-project`, …); the adopter snippet lives at `claude/AGENTS-snippet.md`. Future non-Claude-Code platform wirings (e.g., `codex/`, `grok/`, `cursor/`) plug in symmetrically as sibling top-level dirs — see [`docs/PLATFORMS.md`](docs/PLATFORMS.md) for the plug-in pattern.

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
`gates` · `tasknote-selection`) have status- or content-based triggers
and declare `paths: []`. The
leading `> Lazy-loaded SPEC module. Loaded by ...` prose line stays
authoritative for status/content triggers.

The contract is **declarative today**: the source of truth for which
module loads when is still `claude/skills/ft-task/SKILL.md`'s explicit
dispatch (Steps 1.5 / 2 / 3a / 3c / 5). Future tooling MAY parse the
frontmatter to drive dispatch dynamically.

## Skill namespace

Bundled flowtron skills carry the `ft-` prefix in their slug (`/ft-task`,
`/ft-release`, `/ft-new-project`, `/ft-starter-task`,
`/ft-micro-task`, `/ft-file-followup`, `/ft-epic-discovery`,
`/ft-close-epic`, `/ft-debug`, `/ft-worktree-start`, `/ft-worktree-end`,
`/ft-flowtron`, `/ft-stats`, `/ft-quality`,
`/ft-audit-context`, and the audit family
`/ft-audit{,-docs,-security,-frontend,-backend,-performance}`). The prefix
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
`_project/tasknote/README.md`.

Numbering: sequential within prefix. Decimals only for epic subtasks (e.g.,
`CORE-EPIC-009` parent + `CORE-009.1`, `CORE-009.2` children).

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
| ` [model]` | optional | Short identifier for the model assigned to this task. Recommended primary labels: `[heavy]` (design, multi-file, high-ambiguity, or exploratory work) \| `[light]` (mechanical, well-scoped, clear-diff implementation). Specific names (`opus`, `sonnet`, `haiku`, `gpt-5`, `gemini-pro`, etc.) are valid precision tokens; downstream tooling buckets unknown tokens as `other`. Owns the model assignment — `/ft-task` reads this BEFORE scaffolding (see §"Model field"). New entries should declare a model. |
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

The 4-phase workflow surfaces **up to two** operator-gate banners —
explicit-approval pauses, both conditional: 🛠️ Phase 1→2 (post-Discovery)
and 📦 ready-to-commit. A fully mechanical task skips both and runs
end-to-end with inline state markers. Once Phase 1 closes, Phase 2 →
Phase 3 → Phase 4 closure ops flow continuously without intermediate
gates; skill-level extensions (epic parent-flip, release push-go) bundle
into 📦 rather than adding their own banners.

Canonical gate contract — banner format, the trigger table, the Phase
1→2 exit-gate flavors, the conditional skip rule, and the `--fast`
operator override: see [`SPEC/gates.md`](SPEC/gates.md).

### 📝 Phase 1: Discovery

Mandatory steps:

- [ ] Reviewed the task entry in PLAN.md
- [ ] **Relevance Assessment** — `Proceed` / `Re-scope` / `De-scope` with one-line rationale
- [ ] Read relevant source files
- [ ] **Archive skim** — surface prior decisions on the same files / area by skimming `_project/tasknote/archive/<area>/` for tasknotes that touched the source paths in scope; log relevant findings in Discovery Notes before re-interpreting the task
- [ ] **Drift check** — verify file paths, line numbers, function names, and root-cause hypotheses cited in the task description still match current code; surface any drift to the user before re-interpreting the task
- [ ] Asked clarifying questions OR logged "No clarifications needed" with explicit assumptions
- [ ] Subtasks above populated with concrete, ordered steps

The Relevance Assessment is non-negotiable. `Re-scope` updates the PLAN.md line and tasknote header before continuing (if blocked prerequisite, see §"Blocked tasks"). `De-scope` jumps to Phase 4 closure with the de-scope rationale as the final summary.

Archive skim + drift check both exist because prior tasknotes record decisions (renames, regressions, rationales) and PLAN.md is a snapshot, not a spec. Surface findings before re-interpreting; don't silently "correct" the plan by executing a different task.

**Exit gate.** Once every Phase 1 box is ticked, the 🛠️ Phase 1→2 banner
fires according to the skill's exit-gate flavor — `/ft-task` uses
`default-skip` (skip on routine clarifications; fire only on significant
scope deviation), `/ft-epic-discovery` + `/ft-close-epic` use
`default-fire-on-clarifications` (fire on any surfaced ask). The two
flavors' judgment rules, the shared skip-path inline marker, and the
`--fast` drift carve-out: see [`SPEC/gates.md` §"Phase 1→2 exit gate"](SPEC/gates.md).

### 🛠️ Phase 2: Execution

- [ ] **Pattern survey** — looked at how neighboring code (sibling modules, parallel components, adjacent services) solves the same shape of problem; chose to extend an existing pattern, or justified the new shape if none fits
- [ ] Implemented the minimal solution
- [ ] Updated/added tests for non-trivial behavior

Keep edits tightly scoped. Resist refactoring adjacent code unless the task
explicitly calls for it. The pattern survey exists to keep the codebase
unified — prefer extending what already works over inventing a parallel
solution.

If a hard dependency surfaces mid-execution, **park the tasknote** per
§"Blocked tasks" and resume by re-invoking `/ft-task <ID>`.

Phase 2 flows continuously into Phase 3 (and Phase 4 closure ops) without
an intermediate gate; the next operator-gate cue is the 📦 ready-to-commit
banner in §"Post-closure protocol".

### 🧪 Phase 3: Testing & Linting

- [ ] Ran targeted test suite for changed code
- [ ] Ran lint/type-check on changed code
- [ ] (frontend) Asked the user for visual confirmation (👁️ prefix on the prose ask)

Run the full test suite only when changes are broad or cross-cutting.

The visual-confirmation ask carries a `👁️` inline prefix on the
conversational prompt (e.g., `👁️ Could you confirm the new outline at
http://localhost:5120?`). Inline emoji prefix only — **no banner block,
no operator-gate**; gate count stays at up-to-2.

When `/ft-task` is invoked with `--fast`, the 👁️ ask is suppressed
(lint/type-check on changed code still runs). See
[`SPEC/gates.md` §"`--fast` operator override"](SPEC/gates.md) for the
flag's full surface.

### 🚀 Phase 4: Closure

- [ ] **Doc-drift sweep** — for each entry in `_project/tasknote/README.md` §"AI-referenced docs", state "no change" or the update
- [ ] Closed — PLAN.md line flipped to stub form `Completed YYYY-MM-DD.` (see [`SPEC/tasknote-selection.md` §"`## Completed` archive convention"](SPEC/tasknote-selection.md)) and tasknote moved to `_project/tasknote/archive/<area>/`
- [ ] Recap drafted (surfaces at the 📦 ready-to-commit gate, or inline on conditional skip)

Phase 4 closure ops (doc-drift sweep, PLAN.md flip, archive move) auto-run
without an intermediate gate. The recap drafts alongside — a two-pass
summary leading with 1-2 plain-English sentences of *what the task
accomplished*, then technical detail (file paths, LOC, key decisions,
plus an optional verification ask). It bundles into the 📦
ready-to-commit motion (see §"Post-closure protocol") — fire branch:
behind the 📦 banner for one bundled approval; skip branch: inline behind
an `✅ Closure complete; …` marker followed by an autonomous commit.

> **Recap is recap-only.** The next-task suggestion belongs in the
> post-closure protocol, after the commit lands — not inside the recap.

The tasknote is closed when archived. Approval-semantics on each branch
live in [`SPEC/gates.md` §"Conditional skip rule"](SPEC/gates.md); commit
itself is not part of the tasknote.

## Blocked tasks

Canonical contract: see [`SPEC/blocked.md`](SPEC/blocked.md).

## Post-closure protocol

After a tasknote is archived, run the three-step protocol (commit / mark landed / offer copy-paste line). Step 1 branches on the **conditional skip rule** — the deterministic three-signal test (frontend / privileged-ops / perf-narrative), the bundled-prompt override, the `--fast` operator override, and the on-skip/on-fire routing all live in [`SPEC/gates.md` §"Conditional skip rule"](SPEC/gates.md). On skip, the closure auto-commits behind a `✅ Closure complete; committing autonomously (…)` marker; on fire, proceed with step 1 below. Steps 2-3 are identical across branches.

1. **Commit (bundled gate, fire branch).** Surface the bundled ready-to-commit gate behind the 📦 cue (per [`SPEC/gates.md` §"Operator-gate cues"](SPEC/gates.md) — preview line mandatory) and wait for commit-go. The bundle has three parts:

   - **Closure review** — per-entry doc-drift verdicts, new PLAN.md stub-form line, archive path.
   - **Recap (work summary)** — 1-2 sentence plain-English lede, then technical detail (file paths / LOC / key decisions + optional verification ask) per §"🚀 Phase 4: Closure".
   - **Proposed commit message** — `feat: <TASK-ID> — <title>` (or `fix:` / `docs:` / `chore:`). Multiple recently-closed tasknotes may bundle into one commit.

   The commit-go prompt carries a `🟢` prefix (e.g., `🟢 Reply commit / go to land.`). Skill-level extensions (e.g., parent-flip Yes/No) ride inside this bundle per the override above; the commit-go is the single approval authorizing recap + closure + bundled prompts + commit.

   **ft-micro-task carve-out.** `/ft-micro-task` carries no 📦 banner block on the fire branch — its commit-go is a plain prose ask in place of the banner; the 📦 cue and 🟢 prefix do not apply. The same conditional skip rule governs both forms. See `/ft-micro-task` SKILL.md Step 5.

2. **Mark the commit landed and suggest the next move.** Once the commit lands, prefix the next-move tail with a 🏁 state-marker (parallels 🛠️ → 📦 → 🏁):

   ```markdown
   🏁 **<TASK-ID> — committed `<sha>`** · archived to `<archive-path>`
   <1-2 sentence plain-English description of what was accomplished in this commit>
   ```

   Then surface candidates with emoji primary label inline per option — emit `[heavy]🧠` or `[light]🔧` (never the bare `[model]` token) followed by "design vs mechanical" prose and shortname:

   ```markdown
   - **<TASK-ID>** [heavy]🧠 | shortname — one-sentence "why now" (design)
   ```

   Either form:
   - **Epic continuation:** closed task is in an active epic with cleared dependencies → name the single most natural next task ID.
   - **Open menu:** 2-3 candidates from PLAN.md mixing priority and readiness; user picks.

   **Audit-family flag.** When a next-move candidate is an `/ft-audit*` slash command, prefix the candidate line (this step) and the copy-paste line (step 3) with 🔍. Audit-family skills are forked per project per `docs/MIGRATION.md` §1.2.1 — in adopter context the local fork is unprefixed (e.g., `/audit-docs`), not `/ft-audit-docs`. The 🔍 marker doubles as a self-check for any AI about to emit `/ft-audit*` as next move.

3. **Offer the copy-paste line.** Emit a tight visual cue of the form "Clear your session, then use 🔧 /<next-skill> <args>" (or 🧠 for heavy tasks). Never emit literal `/clear` or `/model` commands — the emoji on the candidate line (step 2) carries the model signal; the short prose cue carries the session-reset intent. The skill segment matches the appropriate flowtron skill for the next task — most commonly `/ft-task` (normal tasks), `/ft-micro-task` (micros), `/ft-starter-task` (filing-only), or `/ft-audit*` (audit follow-ups — adopters use the unprefixed local fork per §"Skill namespace"). `<args>` is the next task ID for tasknote-runner skills, or the skill's own argument shape otherwise.

## When to use a tasknote (and when not to)

Canonical contract: see [`SPEC/tasknote-selection.md`](SPEC/tasknote-selection.md).
The module carries the full use/skip thresholds (tasknote · starter ·
follow-up · micro-tasknote · debug), the PLAN.md filing-discipline word
budget (≤50w target / 70w hard cap), and the `## Completed` archive
stub-form convention.

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

- A CLI tool (use `cp`, `mv`, and your editor)
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
