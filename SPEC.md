# Flowtron — Workflow Specification

**Version:** v3.0.0
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
- [ ] **TASK-ID** [model] | shortname — long description
```

Both `[model]` and `| shortname` are optional. The legacy minimal form
`- [ ] **TASK-ID** — description` keeps parsing for backwards compatibility.

| Segment | Required | Notes |
|---|---|---|
| `- [ ]` / `- [x]` | yes | Open or completed checkbox |
| `**TASK-ID**` | yes | Bold ID, matching the §"Task ID convention" pattern |
| ` [model]` | optional | `opus` or `sonnet` only. Owns the model assignment for the task — `/ft-task` reads this BEFORE scaffolding (see §"Model field"). New entries should declare a model. |
| ` \| shortname` | optional | Short label up to ~30 chars; rendered as the row title in visualizers when present. Falls back to the tasknote frontmatter `title:` for tasks that have a tasknote, or the long description otherwise. |
| ` — long description` | optional | Full description. Carries `Completed YYYY-MM-DD.` markers, re-scope notes, and any rationale that doesn't fit in the shortname. |

Examples:

```markdown
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

In skill and doc files (outside PLAN.md), use `[[<placeholder>]]`
(angle-bracket-inside) for illustrative wikilinks — the leading `<`
prevents a collision with the `[A-Z]+-[0-9]+` wikilink-integrity grep.

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

The 4-phase workflow surfaces **up to two** operator-gate banners —
moments where the assistant pauses for explicit user approval before
continuing. Both banners are conditional: 🛠️ Phase 1→2 skips when
Discovery surfaced zero clarifying questions (see §"📝 Phase 1:
Discovery" exit gate for the full rule); 📦 ready-to-commit skips when
the closure's diff content clears the deterministic signal rule (see
§"Post-closure protocol" for the full rule). On a fully unambiguous
mechanical task both banners skip and the assistant runs end-to-end with
inline state markers in place of approval pauses. To make these gates
visually scannable in the transcript, the assistant surfaces a banner
cue at each one that fires:

```markdown
---

<emoji>  **AWAITING APPROVAL — <label>**

_<1-2 sentence plain-English preview of what executes on approval>_

---
```

| Gate | Emoji | Label | Trigger |
|---|---|---|---|
| Phase 1→2 (post-Discovery) | 🛠️ | `AWAITING APPROVAL — Phase 2: Execution ready` | **Conditional** — fires when Discovery surfaced clarifying questions; skipped via the "No clarifications needed" branch (see §"📝 Phase 1: Discovery" exit gate) |
| Ready-to-commit (closure review + work summary bundled) | 📦 | `AWAITING APPROVAL — Ready to commit` | **Conditional** — fires when the closure diff trips any signal in §"Post-closure protocol" §"Conditional skip rule" (frontend / privileged-ops path-match or perf-narrative present) OR a bundled in-📦 user prompt is queued (e.g., /ft-close-epic parent-flip); skipped otherwise via the autonomous-commit motion |

The preview line is **mandatory** on every banner that fires: a 1-2
sentence plain-English summary of *what executes if the user approves*,
italicized, placed inside the banner block immediately above the closing
`---`. The preview is for scanning intent ("what am I greenlighting?") —
file paths, LOC counts, and key decisions belong in the recap (per §"🚀
Phase 4: Closure"), not the preview.

Once Phase 1 closes (either via the 🛠️ banner clearing or via the
conditional-skip path — see §"📝 Phase 1: Discovery" exit gate), Phase 2 →
Phase 3 → Phase 4 closure ops (doc-drift sweep, PLAN.md flip, archive move)
**flow continuously without intermediate gates**. The recap (work summary)
is drafted during closure ops but does not surface its own banner — it
bundles with the closure review (per-entry doc-drift verdicts, PLAN.md
line preview, archive path) and the proposed commit message into the
📦 ready-to-commit motion. On the 📦-fires branch one bundled approval
clears the commit; on the 📦-skips branch the bundle is delivered inline
with an `✅ Closure complete; committing autonomously (<rationale>).`
marker and the commit + 🏁 state-marker + next-move suggestion follow in
the same response (see §"Post-closure protocol" §"Conditional skip rule").

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

**Exit gate (conditional):** once every Phase 1 box is ticked, branch on
the clarifying-questions outcome:

- **"No clarifications needed" branch** (zero AskUserQuestion calls and
  zero prose asks during Discovery; explicit assumptions logged) — skip
  the 🛠️ banner. Emit a single inline marker and proceed directly into
  Phase 2:

  ```text
  ✅ Phase 1 Discovery complete (no clarifications needed); entering Phase 2 Execution.
  ```

  The marker is plain prose, not a banner block, and not a new operator
  gate — it's a scannable phase-boundary cue so the user can spot the
  transition in the transcript and intervene if Discovery looks off.

- **Clarifications-surfaced branch** (AskUserQuestion fired, prose asks
  reshaped scope, or a Re-scope verdict landed) — surface the 🛠️ Phase 2
  operator-gate cue per §"Operator-gate cues" (with the mandatory preview
  line) and wait for the user's go before starting execution.

The skip rule binds to the Phase 1 checklist branch, not a raw count of
tool calls — Re-scope deliberations and prose asks that reshape work both
keep the banner.

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
re-invoking `/ft-task <ID>`.

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
http://localhost:5120 and confirm the new outline behaves as expected
before I move to closure?`). Inline emoji prefix only — **no banner
block, no operator-gate**. Gate count stays at up-to-2; the prefix is a
scannable visual cue parallel to 🛠️ / 📦 without elevating
visual-confirmation to gate status.

### 🚀 Phase 4: Closure

- [ ] **Doc-drift sweep** — for each entry in `_project/tasknote/README.md` §"AI-referenced docs", state "no change" or the update
- [ ] Closed — PLAN.md line flipped to stub form `Completed YYYY-MM-DD.` (see §"`## Completed` archive convention") and tasknote moved to `_project/tasknote/archive/<area>/`
- [ ] Recap drafted (surfaces at the 📦 ready-to-commit gate, or inline on conditional skip)

Phase 4 closure ops (doc-drift sweep, PLAN.md flip, archive move) auto-run
without an intermediate gate. The recap — a two-pass summary leading with
1-2 plain-English sentences of *what the task accomplished* (non-technical,
suitable for fast scanning), then technical detail (file paths, LOC, key
decisions, plus an optional verification request: something concrete for
the user to check, like reviewing the diff, running the feature, or
eyeballing a generated artifact) — is drafted alongside but **does not
surface its own banner**. It bundles into the 📦 ready-to-commit motion
(see §"Post-closure protocol") — on the fire branch behind the 📦 banner
where the user gives one bundled approval; on the skip branch inline with
an `✅ Closure complete; …` marker and an autonomous commit.

> **Recap is recap-only.** The recap leads with a 1-2 sentence plain-English
> summary, then technical detail (file paths / LOC / decisions / verification
> ask), and stops there. The next-task suggestion belongs in the
> post-closure protocol, after the commit lands — not inside the recap.

The tasknote is closed when archived. On the 📦-fire branch the user's
commit-go at the gate is the bundled approval that confirms the recap
and authorizes the commit; on the 📦-skip branch the inline `✅ Closure
complete; …` marker stands in for the approval and the autonomous
commit follows in the same response (see §"Post-closure protocol"
§"Conditional skip rule"). Commit itself is not part of the tasknote.

## Blocked tasks

Canonical contract: see [`SPEC/blocked.md`](SPEC/blocked.md).

## Post-closure protocol

After a tasknote is archived, the assistant must run the three-step
protocol (commit / mark landed / offer copy-paste line). Step 1 (commit)
branches on the **Conditional skip rule** below — the 📦 banner fires on
diff content that warrants explicit review and skips on mechanical
closures via the autonomous-commit motion. Steps 2 and 3 are identical
across both branches.

### Conditional skip rule

The 📦 ready-to-commit gate is **conditional**: it fires when the
closure's diff content trips any of the signals below or when a bundled
in-📦 user prompt is queued; otherwise it skips and the assistant runs
the autonomous-commit motion in one continuous response.

**Skip signals (deterministic — all three must clear to skip):**

- **Zero frontend files changed.** A changed path is "frontend" if it
  matches the glob set `**/*.tsx`, `**/*.jsx`, `**/*.css`, `**/*.scss`,
  `**/*.html`, `**/*.vue`, `**/*.svelte`, or `**/*.ts` *under an explicit
  UI dir* (e.g., `viz/`). Adopters declare project-specific UI dirs in
  `_project/tasknote/README.md`; those dirs join the glob set for that
  project. The "explicit UI dir" qualifier on `.ts` matters because
  TypeScript is also used backend-side in many adopters — the signal
  targets UI surface specifically.
- **Zero privileged-ops paths changed.** A changed path is
  "privileged-ops" if it matches any of:
  - **Migrations** — `**/migrations/**`, `**/alembic/**`, `**/db/migrations/**`, `**/prisma/migrations/**`
  - **Auth** — `**/auth/**`, `**/authn/**`, `**/authz/**`, `**/oauth/**`, `**/session*/**`
  - **Security / secrets** — `**/security/**`, `**/secrets/**`, `**/credentials/**`, `.env*`, plus any file whose diff hunk includes credential-shaped keyword hits (`API_KEY`, `SECRET`, `TOKEN`, `PASSWORD` — uppercase to avoid prose collision)
  - **External integrations** — `**/integrations/**`, `**/clients/**` (when housing third-party SDK callers), `**/webhooks/**`
- **No perf-sensitive narrative concern.** Narrative fallback (the only
  judgment surface in the rule): the gate fires if the assistant
  reasoned about performance during execution (hot-path optimization,
  indexing/query-plan change, cache invalidation pattern, batch sizing,
  throughput target, p99 SLO concern) OR if the changed files sit under
  a project-declared perf-critical directory. Default-clear for pure
  SPEC/SKILL/template/doc edits, refactors of non-perf-critical
  internal code, type-only changes. **The narrative branch biases
  conservative — fire on doubt.**

**Bundled-prompt override (autonomous-commit constraint):** if a
skill-level prompt is queued inside the 📦 bundle (e.g.,
/ft-close-epic's parent-flip Yes/No), the gate **fires regardless** of
signal state. Autonomous-commit cannot resolve a user-input question.

**"No AI override" semantics.** The rule is bidirectionally locked: the
assistant cannot escalate (force the banner on a clean diff) nor
de-escalate (skip when a signal hits). The perf-narrative branch is the
only judgment surface, and its conservative bias (fire on doubt) is the
only valve.

**On skip (autonomous-commit motion).** Emit the inline marker

```text
✅ Closure complete; committing autonomously (<concrete-signal-summary>).
```

where `<concrete-signal-summary>` names the cleared signals as
diff-specific facts (e.g., `4 markdown files; no frontend/privileged
surface` or `SPEC + 3 SKILLs; docs only`). Then run the full bundle in
one continuous response: closure review → recap → commit → 🏁
state-marker → suggest-next-move → copy-paste line. Same response
shape as the post-commit response on the fire branch — the marker just
replaces the banner + commit-go wait. Plain prose, not a banner block,
not a new gate.

**On fire (bundled approval motion).** Proceed with step 1 below.

1. **Commit (bundled gate, fire branch).** Surface the **bundled
   ready-to-commit gate** behind the 📦 operator-gate cue (see
   §"Operator-gate cues") and wait for commit-go. The 📦 banner carries
   the mandatory 1-2 sentence plain-English preview line (per
   §"Operator-gate cues") immediately above the closing rule. The
   bundle has three parts surfaced together:

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

   Skill-level extensions (e.g., /ft-close-epic's parent-flip Yes/No prompt)
   ride inside this bundle rather than getting their own banner — and
   their presence is precisely what forces this fire branch via the
   bundled-prompt override above. The user's commit-go is the single
   approval that authorizes recap + closure + bundled prompts + commit.

2. **Mark the commit landed and suggest the next move.** Once the commit
   lands, prefix the post-commit response's tail (immediately above the
   next-move suggestion) with a 🏁 state-marker line so the task's
   lifecycle visually closes in the transcript (parallels 🛠️ → 📦 → 🏁):

   ```markdown
   🏁 **<TASK-ID> — committed `<sha>`** · archived to `<archive-path>`
   ```

   Then surface candidates with `[model]` tags visible inline per option,
   mirroring the PLAN.md task-line shape so the user can scan model
   assignments without cross-referencing PLAN.md:

   ```markdown
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

   ```text
   /clear then /model <opus|sonnet> then /ft-task <NEXT-ID>
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

**File a starter (`/ft-starter-task <ID>`) when:**

- The PLAN.md long description would exceed **~50 words (target) or 70 words (hard cap)** — richer context belongs in the starter body, not on the line
- A task is discovered mid-flow with rich context (rationale, design decisions, file survey, open questions) but isn't ready to start now
- The captured context would be lost or would bloat the PLAN.md long description if recorded as inline prose
- The right shape isn't fully obvious; the AI wants to preserve the survey and open questions for resolution at `/ft-task` checkout

**Skip the starter (just add a one-line PLAN.md entry) when:**

- The long description fits inside ~50 words (a scannable one-liner)
- The task is straightforward enough that the long description suffices
- No design decisions or file survey work has been done yet
- The next available `/ft-task <ID>` slot is the user's natural next move (file it, then start it; no sitting time)

**File a follow-up (`/ft-file-followup <ID>`) when:**

- A new task surfaces mid-flow (typically inside an active `/ft-task`) and the long description fits in ≤50 words, but the surrounding conversation context (why this came up, suspected files, recommended priority/model) is worth surfacing once at filing time without persisting it to disk
- The follow-up is clear enough that it doesn't need a starter body — but you still want a paragraph of rationale visible in chat alongside the new PLAN.md line
- You want the lightest filing motion in the cohort: one PLAN.md line written, a short paragraph delivered conversationally, zero edits to the active tasknote

A `/ft-file-followup` filing produces **zero artifacts on disk beyond a single PLAN.md task line**. The "short context paragraph" — rationale + suspected scope + recommended priority/model — is delivered conversationally only; there is no tasknote file, and the active tasknote (if any) is not edited. If the description would breach the 70w cap, `/ft-file-followup` declines the filing and points at `/ft-starter-task` instead — rich context belongs in starter bodies, not chat.

**Skip the follow-up (use `/ft-starter-task` or just inline a PLAN.md line) when:**

- The description would breach 50 words — `/ft-starter-task` is the right tool; rich context belongs in the starter body
- Persistent context (file survey, open questions, design decisions) is worth preserving to disk — same call: use `/ft-starter-task`
- You're outside any active conversation that produced the rationale — write the PLAN.md line directly; the conversational paragraph would have nothing meaningful to surface

**File a micro-tasknote (`/ft-micro-task <ID>`) when:**

- The task is above the skip threshold (more than a one-liner; touches code or non-trivial doc state) but small enough that the full 4-phase ceremony is overkill — typically under ~30 minutes of effort
- The change is single-file or near-single-file, with no design tradeoffs worth recording across multiple subtasks
- The shape is obvious enough that Acceptance/Subtasks checklists would just restate the goal — but you still want the relevance / drift / archive-skim / pattern-survey contracts before writing code
- Examples: small audits, focused doc patches, single-file behavior tweaks with clear scope

A micro-tasknote uses a single `## ⚡ Notes` section with bold-prefix prompts (Relevance · Drift check · Archive skim · Pattern survey · Implementation) instead of the four phase checklists, plus a `## ✅ Recap` and an `Archived:` line. Closure flips two places (PLAN.md + tasknote location), the same as a normal tasknote. The `/ft-micro-task` skill is **file + execute (one-shot)** — it scaffolds, drives execution inline, and closes in a single conversation.

**Skip the micro-tasknote (use `/ft-task` instead) when:**

- The task touches multiple files or has design tradeoffs to record
- The task is likely to take more than ~30 minutes
- The 4-phase log would carry useful state (Discovery findings, intermediate Phase 2 work) for downstream tasknotes or audits
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

The thresholds apply to **active** task lines (`Critical` / `High` /
`Medium` / `Low` / `Future Opportunities`). Lines under `## Completed`
are governed by §"`## Completed` archive convention" below.

`/ft-starter-task` (filing time), `/ft-file-followup` (filing time), and `/ft-task`
(scaffold/promote time) flag filings that breach the cap — see the respective
skill files for the mechanism. `/ft-file-followup` declines the filing entirely
at >70w and routes the user to `/ft-starter-task` instead.

### `## Completed` archive convention

Closed task lines under `## Completed` collapse to a stub form:

```markdown
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
