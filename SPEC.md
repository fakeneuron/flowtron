# Flowtron — Workflow Specification

**Version:** v3.2.0
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
- `SPEC/` — lazy SPEC modules loaded on demand by skills.
- The flowtron `_project/PLAN.md` tracks flowtron's own development.
- The `templates/` folder holds the canonical tasknote and PLAN.md templates.
- `claude/` — Claude Code commands + skills (`/ft-task`, `/ft-release`, `/ft-new-project`, …); the adopter snippet lives at `claude/CLAUDE-snippet.md`.

For flowtron-self global installs (e.g. `/ft-release`), see [`docs/MIGRATION.md`](docs/MIGRATION.md) §1.0 "One-time global installs" → flowtron-self developers block.

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
the remaining modules (`starter` · `blocked` · `model` · `versioning`)
have status- or content-based triggers and declare `paths: []`. The
leading `> Lazy-loaded SPEC module. Loaded by ...` prose line stays
authoritative for status/content triggers.

The contract is **declarative today**: the source of truth for which
module loads when is still `claude/skills/ft-task/SKILL.md`'s explicit
dispatch (Steps 1.5 / 2 / 3a / 3c / 5). Future tooling MAY parse the
frontmatter to drive dispatch dynamically.

## Skill namespace

Bundled flowtron skills carry the `ft-` prefix in their slug (`/ft-task`,
`/ft-audit`, `/ft-release`, `/ft-new-project`, `/ft-starter-task`,
`/ft-micro-task`, `/ft-file-followup`, `/ft-epic-discovery`,
`/ft-close-epic`, `/ft-flowtron`, `/ft-stats`, `/ft-quality`, and the audit
family `/ft-audit-{docs,backend,frontend,performance,security}`). The prefix
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

Adopting projects may add domain prefixes (e.g., `OCR-` for photard's OCR
pipeline). Domain prefixes must be declared in the project's
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
| ` [model]` | optional | `opus` or `sonnet` only. Owns the model assignment for the task — `/ft-task` reads this BEFORE scaffolding (see §"Model field"). New entries should declare a model. |
| ` \| shortname` | optional | Short label up to ~30 chars; rendered as the row title in visualizers when present. Falls back to the tasknote frontmatter `title:` for tasks that have a tasknote, or the long description otherwise. |
| ` — long description` | optional | Full description. Carries `Completed YYYY-MM-DD.` markers, re-scope notes, and any rationale that doesn't fit in the shortname. |

Examples:

```markdown
- [ ] **CORE-023** [opus] | task-line grammar — Extend grammar to declare shortname + model.
- [ ] **FE-200** [!critical] [opus] | hotfix — Production breakage; floats to top of High.
- [ ] **CORE-016** [sonnet] — Execute InvisiPaw migration per CORE-008 playbook.
- [ ] **FE-003** | wikilink resolution — Parse [[TASK-ID]] in tasknote body text and render as clickable links.
- [ ] **CORE-024** [opus] | quick housekeeping
- [ ] **CORE-016** — Execute InvisiPaw migration per CORE-008 playbook.    (legacy)
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

**Cross-linking** — references to other tasknotes use Obsidian-style
`[[<TASK-ID>]]` wikilinks throughout. They render as plain text on GitHub but
are first-class in markdown-vault tooling (Obsidian, Foam, Logseq) and stay
cheap to write.

**Backwards compatibility** — see §"Tasknote frontmatter" write-once policy.
Adopting projects pick up the new shape on their next flowtron version bump.

## The 4-phase workflow

Every tasknote follows four phases in strict serial order. Do not skip ahead.

### Operator-gate cues

The 4-phase workflow surfaces **up to two** operator-gate banners — explicit-approval pauses. Both are conditional: 🛠️ Phase 1→2 skips when Discovery has no clarifying questions; 📦 ready-to-commit skips when the closure diff clears the signal rule. A fully mechanical task skips both and runs end-to-end with inline state markers. Banner format when one fires:

```markdown
---

<emoji>  **AWAITING APPROVAL — <label>**

_<1-2 sentence plain-English preview of what executes on approval>_

---
```

| Gate | Emoji | Label | Trigger |
|---|---|---|---|
| Phase 1→2 (post-Discovery) | 🛠️ | `AWAITING APPROVAL — Phase 2: Execution ready` | **Conditional** — fires when Discovery surfaced clarifying questions; skipped via "No clarifications needed" (see §"📝 Phase 1: Discovery" exit gate) |
| Ready-to-commit (closure review + work summary bundled) | 📦 | `AWAITING APPROVAL — Ready to commit` | **Conditional** — fires when the diff trips any §"Conditional skip rule" signal (frontend / privileged-ops / perf-narrative) OR a bundled in-📦 prompt is queued (e.g., /ft-close-epic parent-flip); skipped otherwise via autonomous-commit |

The preview line is **mandatory** on every banner: 1-2 sentence plain-English summary of *what executes on approval*, for scanning intent ("what am I greenlighting?"). File paths, LOC counts, and key decisions belong in the recap (§"🚀 Phase 4: Closure"), not the preview.

Once Phase 1 closes, Phase 2 → Phase 3 → Phase 4 closure ops **flow continuously without intermediate gates**. The recap drafts during closure ops and bundles into the 📦 ready-to-commit motion alongside the closure review (per-entry doc-drift verdicts, PLAN.md line preview, archive path) and the proposed commit message — see §"Post-closure protocol" §"Conditional skip rule" for fire/skip branching.

Skill-level extensions (epic parent-flip, release push-go) **bundle into 📦** rather than adding their own banners.

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

**Exit gate (conditional):** once every Phase 1 box is ticked, branch on
the clarifying-questions outcome:

- **"No clarifications needed" branch** (zero AskUserQuestion calls and
  zero prose asks during Discovery; explicit assumptions logged) — skip
  the 🛠️ banner. Emit a single inline marker and proceed directly into
  Phase 2:

  ```text
  ✅ Phase 1 Discovery complete (no clarifications needed); entering Phase 2 Execution.
  ```

- **Clarifications-surfaced branch** (AskUserQuestion fired, prose asks
  reshaped scope, or a Re-scope verdict landed) — surface the 🛠️ Phase 2
  operator-gate cue per §"Operator-gate cues" (with the mandatory preview
  line) and wait for the user's go before starting execution.

The skip rule binds to the Phase 1 checklist branch — Re-scope and prose
asks that reshape work both keep the banner.

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

### 🚀 Phase 4: Closure

- [ ] **Doc-drift sweep** — for each entry in `_project/tasknote/README.md` §"AI-referenced docs", state "no change" or the update
- [ ] Closed — PLAN.md line flipped to stub form `Completed YYYY-MM-DD.` (see §"`## Completed` archive convention") and tasknote moved to `_project/tasknote/archive/<area>/`
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
live in §"Post-closure protocol" §"Conditional skip rule"; commit itself
is not part of the tasknote.

## Blocked tasks

Canonical contract: see [`SPEC/blocked.md`](SPEC/blocked.md).

## Post-closure protocol

After a tasknote is archived, run the three-step protocol (commit / mark landed / offer copy-paste line). Step 1 branches on the **Conditional skip rule** below. Steps 2-3 are identical across branches.

### Conditional skip rule

The 📦 gate fires when the closure diff trips a signal below OR a bundled in-📦 prompt is queued; otherwise it skips via autonomous-commit motion.

**Skip signals (deterministic — all three must clear to skip):**

- **Zero frontend files changed.** A changed path is "frontend" if it
  matches the glob set `**/*.tsx`, `**/*.jsx`, `**/*.css`, `**/*.scss`,
  `**/*.html`, `**/*.vue`, `**/*.svelte`, or `**/*.ts` *under an explicit
  UI dir* (e.g., `viz/`). Adopters declare project-specific UI dirs in
  `_project/tasknote/README.md`; those dirs join the glob set for that
  project.
- **Zero privileged-ops paths changed.** A changed path is
  "privileged-ops" if it matches any of:
  - **Migrations** — `**/migrations/**`, `**/alembic/**`, `**/db/migrations/**`, `**/prisma/migrations/**`
  - **Auth** — `**/auth/**`, `**/authn/**`, `**/authz/**`, `**/oauth/**`, `**/session*/**`
  - **Security / secrets** — `**/security/**`, `**/secrets/**`, `**/credentials/**`, `.env*`, plus any file whose diff hunk includes credential-shaped keyword hits (`API_KEY`, `SECRET`, `TOKEN`, `PASSWORD` — uppercase to avoid prose collision)
  - **External integrations** — `**/integrations/**`, `**/clients/**` (when housing third-party SDK callers), `**/webhooks/**`
- **No perf-sensitive narrative concern.** The gate fires if the
  assistant reasoned about performance during execution (hot-path
  optimization, indexing/query-plan change, cache invalidation pattern,
  batch sizing, throughput target, p99 SLO concern) OR if the changed
  files sit under a project-declared perf-critical directory.
  Default-clear for pure SPEC/SKILL/template/doc edits, refactors of
  non-perf-critical internal code, type-only changes. **Biased
  conservative — fire on doubt.**

**Bundled-prompt override (autonomous-commit constraint):** a skill-level prompt queued inside the 📦 bundle (e.g., /ft-close-epic's parent-flip Yes/No) **forces fire** regardless of signal state — autonomous-commit cannot resolve user-input questions.

**"No AI override" semantics.** The rule is bidirectionally locked: the assistant cannot escalate (force the banner on a clean diff) nor de-escalate (skip when a signal hits). The perf-narrative branch is the only judgment valve.

**On skip (autonomous-commit motion).** Emit:

```text
✅ Closure complete; committing autonomously (<concrete-signal-summary>).
```

where `<…>` names the cleared signals as diff facts (e.g., `4 markdown files; no frontend/privileged surface`). Then run the bundle in one response: closure review → recap → commit → 🏁 → suggest-next-move → copy-paste line.

**On fire (bundled approval motion).** Proceed with step 1 below.

1. **Commit (bundled gate, fire branch).** Surface the bundled ready-to-commit gate behind the 📦 cue (per §"Operator-gate cues" — preview line mandatory) and wait for commit-go. The bundle has three parts:

   - **Closure review** — per-entry doc-drift verdicts, new PLAN.md stub-form line, archive path.
   - **Recap (work summary)** — 1-2 sentence plain-English lede, then technical detail (file paths / LOC / key decisions + optional verification ask) per §"🚀 Phase 4: Closure".
   - **Proposed commit message** — `feat: <TASK-ID> — <title>` (or `fix:` / `docs:` / `chore:`). Multiple recently-closed tasknotes may bundle into one commit.

   The commit-go prompt carries a `🟢` prefix (e.g., `🟢 Reply commit / go to land.`). Skill-level extensions (e.g., parent-flip Yes/No) ride inside this bundle per the override above; the commit-go is the single approval authorizing recap + closure + bundled prompts + commit.

2. **Mark the commit landed and suggest the next move.** Once the commit lands, prefix the next-move tail with a 🏁 state-marker (parallels 🛠️ → 📦 → 🏁):

   ```markdown
   🏁 **<TASK-ID> — committed `<sha>`** · archived to `<archive-path>`
   ```

   Then surface candidates with `[model]` tags inline per option, mirroring the PLAN.md task-line shape:

   ```markdown
   - **<TASK-ID>** [model] | shortname — one-sentence "why now"
   ```

   Either form:
   - **Epic continuation:** closed task is in an active epic with cleared dependencies → name the single most natural next task ID.
   - **Open menu:** 2-3 candidates from PLAN.md mixing priority and readiness; user picks.

3. **Offer the copy-paste line:**

   ```text
   /clear then /model <opus|sonnet> then /ft-task <NEXT-ID>
   ```

   Claude cannot run `/clear` itself; this is for the user to paste in a fresh context. The `/model` segment matches the next task's PLAN-line `[model]`, pre-empting the Step 1.5 gate on assistant hand-offs (still fires on cold starts).

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

**File a starter (`/ft-starter-task <ID>`) when:**

- The PLAN.md long description would exceed **~50 words (target) or 70 words (hard cap)** — richer context belongs in the starter body, not on the line
- A task is discovered mid-flow with rich context (rationale, design decisions, file survey, open questions) but isn't ready to start now
- The captured context would be lost or would bloat the PLAN.md long description if recorded as inline prose
- The right shape isn't fully obvious; the AI wants to preserve the survey and open questions for resolution at `/ft-task` checkout

**Skip the starter (just add a one-line PLAN.md entry) when:**

- The long description fits inside ~50 words (a scannable one-liner)
- The task is straightforward enough that the long description suffices
- No design decisions or file survey work has been done yet
- The next available `/ft-task <ID>` slot is the natural next move (file, then start; no sitting time)

**File a follow-up (`/ft-file-followup <ID>`) when:**

- A new task surfaces mid-flow (typically inside an active `/ft-task`) and the long description fits in ≤50 words, but the surrounding conversation context (why this came up, suspected files, recommended priority/model) is worth surfacing once at filing time without persisting it to disk
- The follow-up is clear enough that it doesn't need a starter body — but you still want a paragraph of rationale visible in chat alongside the new PLAN.md line
- You want the lightest filing motion in the cohort: one PLAN.md line written, a short paragraph delivered conversationally, zero edits to the active tasknote

A `/ft-file-followup` filing produces **no tasknote file** — the rationale paragraph lives in chat only, and the active tasknote (if any) is not edited.

**Skip the follow-up (use `/ft-starter-task` or just inline a PLAN.md line) when:**

- The description would breach 50 words — use `/ft-starter-task`; rich context belongs in the starter body
- Persistent context (file survey, open questions, design decisions) is worth preserving to disk — same call
- You're outside any active conversation that produced the rationale — write the PLAN.md line directly

**File a micro-tasknote (`/ft-micro-task <ID>`) when:**

- The task is above the skip threshold (more than a one-liner; touches code or non-trivial doc state) but small enough that the full 4-phase ceremony is overkill — typically under ~30 minutes of effort
- The change is single-file or near-single-file, with no design tradeoffs worth recording across multiple subtasks
- The shape is obvious enough that Acceptance/Subtasks checklists would just restate the goal — but you still want the relevance / drift / archive-skim / pattern-survey contracts before writing code
- Examples: small audits, focused doc patches, single-file behavior tweaks with clear scope

A micro-tasknote uses a single `## ⚡ Notes` section (bold-prefix prompts for relevance / drift / archive / pattern / implementation) instead of the four phase checklists; closure flips PLAN.md + the tasknote location like a normal tasknote. The `/ft-micro-task` skill is **file + execute (one-shot)** — scaffold, execute inline, close in one conversation.

**Skip the micro-tasknote (use `/ft-task` instead) when:**

- The task touches multiple files or has design tradeoffs to record
- The task is likely to take more than ~30 minutes
- The 4-phase log would carry useful state for downstream tasknotes or audits
- You're unsure — default to `/ft-task`. The Discovery phase pays for itself.

When in doubt, write the full tasknote. The 4-phase ceremony pays for itself.

### PLAN.md filing-discipline thresholds

Active PLAN.md long descriptions (everything after `— ` on the task line)
are subject to a hard word budget — the index reads cleanly only when each
line stays scannable, and rich context routes into starter bodies:

| Range | Status | Action |
|---|---|---|
| ≤50 words | Target — comfortably scannable | Keep the one-liner |
| 51-70 words | Yellow flag | Trim if practical; otherwise consider promoting to a starter |
| >70 words | Hard cap — exceeded | Move the rich context into a starter body via `/ft-starter-task <ID>`; PLAN.md line keeps a ≤50w summary |

The thresholds apply to **active** task lines (`High` / `Medium` /
`Low` / `Future Opportunities`). Lines under `## Completed`
are governed by §"`## Completed` archive convention" below.

`/ft-starter-task`, `/ft-file-followup`, and `/ft-task` flag filings that
breach the cap at filing/scaffold time — see the respective skill files
for the mechanism. `/ft-file-followup` declines at >70w and routes to
`/ft-starter-task`.

### `## Completed` archive convention

Closed task lines under `## Completed` collapse to a stub form:

```markdown
- [x] **TASK-ID** [model] | shortname — Completed YYYY-MM-DD.
```

The long description drops — the archived tasknote at
`_project/tasknote/archive/<area>/<TASK-ID>.md` is the canonical record.
Phase 4 closure rewrites the line to the stub form (not just the
checkbox + date); `| shortname` is required so visualizers have a row
title, `[model]` stays optional. Adopting projects pick up the
convention on their next bump (additive change; legacy paragraph-form
entries continue to parse).

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
  visualizer is shipped per project — a multi-project query API is not)
- Per-project CI hooks (those belong in the adopting project)

If you find yourself wanting these, write a project-side helper. Do not add
them to flowtron.
