---
name: epic-discovery
description: Scaffold and drive a new flowtron epic from filing through its `.1` Discovery tasknote in one motion — files parent `<AREA>-EPIC-<N>` + `.1` Discovery + `.N` audit placeholder lines into PLAN.md, scaffolds the `.1` tasknote with tailored pre-fill, then drives the full 4-phase Discovery (deliverable = filed `.2..(N-1)` children). Auto-wired into adopters via `/new-project` and `docs/MIGRATION.md` §1.2.
---

# epic-discovery — flowtron epic filing + Discovery driver

You are filing a new epic and driving its `.1` Discovery tasknote in one motion. The full lifecycle contract lives in `<SPEC_DIR>/epic.md` — this skill is the executable interpretation of the lifecycle's filing-and-Discovery side, not a replacement. Treat `SPEC/epic.md` as authoritative when this file is silent or in tension.

The skill takes **no arguments**. All inputs (area, shortname, priority, model, total-subtask-count N) are collected via AskUserQuestion in Step 2.

## Step 0 — Resolve paths

Determine which repo you're in:

- **Adopting project (typical):** `_project/flowtron/SPEC.md` exists. Use:
  - SPEC: `_project/flowtron/SPEC.md`
  - SPEC_DIR (lazy modules): `_project/flowtron/SPEC/`
  - Template: `_project/flowtron/templates/tasknote-template.md`
  - PLAN: `_project/PLAN.md`
  - Tasknote dir: `_project/tasknote/`
- **Flowtron itself (self-hosted):** repo-root `SPEC.md` exists with the heading `# Flowtron — Workflow Specification`. Use:
  - SPEC: `SPEC.md`
  - SPEC_DIR (lazy modules): `SPEC/`
  - Template: `templates/tasknote-template.md`
  - PLAN: `_project/PLAN.md`
  - Tasknote dir: `_project/tasknote/`

If neither layout matches, stop and tell the user this directory doesn't look like a flowtron-using project.

After resolving paths, Read `<SPEC_DIR>/epic.md` for the canonical lifecycle before drafting anything.

## Step 1 — Pre-flight

- `_project/PLAN.md` must exist (cwd is a flowtron-adopting project or flowtron itself).
- The conversation should already have surfaced enough context to motivate filing an epic: a problem worth bracketing with Discovery + Audit subtasks, not a single-task scope. If the conversation has only surfaced a single-task scope, surface to the user: "This looks like single-task scope rather than an epic — recommend `/starter-task <ID>` or a one-line PLAN.md filing instead." Do not proceed unless the user confirms epic scope.

## Step 2 — Collect inputs

Use AskUserQuestion to gather all inputs in one motion. Pre-populate from conversation context where possible — the AI proposes; the user confirms or overrides:

1. **Area** — `CORE | BE | FE | DB | DEPLOY | TEST` (per `SPEC.md` §"Task ID convention") + any project-specific prefixes declared in `_project/tasknote/README.md`. AI proposes from conversation context.
2. **Shortname** — concise label up to ~30 chars (e.g., `expand-shipped-skills`, `viz-keyboard-overhaul`). Used as the parent epic's `| shortname` segment.
3. **Priority** — `Critical | High | Medium | Low | Future Opportunities`. AI proposes its best read.
4. **Model** — `opus | sonnet`, per SPEC §"Model field". AI proposes; goes on every PLAN.md line this skill writes.
5. **Total-subtask-count N** — total number of children including Discovery (`.1`) and audit (`.N`). E.g., 3 children + Discovery + audit = N=5. The Discovery's deliverable is filing `.2..(N-1)` (the implementation children).

The user may decline the audit subtask if the epic is a simple multi-child implementation that doesn't warrant the audit bracket (per `SPEC/epic.md` line 11: "Simpler implementations don't need it — apply judgment"). In that case, set N = Discovery + implementation-children-count and skip the audit-line filing in Step 4.

## Step 3 — Resolve next available `<AREA>-EPIC-<N>`

Scan `_project/PLAN.md` AND `_project/tasknote/archive/<area>/` for the highest used numeric suffix in the chosen area, considering BOTH regular task IDs (`<AREA>-NNN`, `<AREA>-NNN.M`) AND epic IDs (`<AREA>-EPIC-NNN`). Per SPEC §"Task ID convention": `<AREA>-EPIC-<N>` and `<AREA>-<N>.<sub>` share the numeric suffix — the epic and its children use the same N.

Compute `next-N = max-used + 1`. The new parent epic ID = `<AREA>-EPIC-<next-N>`; children will be `<AREA>-<next-N>.1` (Discovery), `<AREA>-<next-N>.<N>` (audit), and `<AREA>-<next-N>.2..(N-1)` (implementation, filed during Phase 2).

Surface to the user:

```
Filing new epic:
  Parent:    <AREA>-EPIC-<next-N> | <shortname>
  Discovery: <AREA>-<next-N>.1
  Audit:     <AREA>-<next-N>.<N>     (skip this line if N excludes audit)
  Children:  <AREA>-<next-N>.2 .. <AREA>-<next-N>.<N-1>  (filed in Phase 2)

Confirm or override?
```

The user may override the numeric suffix (e.g., to align with an externally-tracked ID). Once locked, use this `<TASK-ID>` shape throughout.

## Step 4 — File the PLAN.md lines

Append to `_project/PLAN.md` under the chosen `## <Priority>` heading. Use the canonical task-line grammar (SPEC §"Task-line format"). Three lines (or two if N excludes audit), nested with 2-space indent under the parent for the subtask lines:

```
- [ ] **<AREA>-EPIC-<next-N>** [<model>] | <shortname> — One-paragraph epic description (filed via /epic-discovery; refined at .1 closure).
  - [ ] **<AREA>-<next-N>.1** [<model>] | discovery — Scope shared design and file children .2..(N-1) per SPEC/epic.md.
  - [ ] **<AREA>-<next-N>.<N>** [<model>] | audit — Final-subtask audit per SPEC/epic.md (fixed doc-drift sweep acceptance line). Filed at filing time as highest `.N` child.
```

Placement:

- If the priority section already has entries, append to the bottom of that section.
- If the section carries a `(none)` placeholder, replace the placeholder with the new entries.
- Preserve the 2-space child indent on the `.1` and `.N` lines (per `_project/PLAN.md` lines 29-34 precedent: `  - [ ] **CORE-057.1** ...`).

Do NOT pre-write `.2..(N-1)` lines here — that is the Discovery's Phase 2 deliverable.

The parent epic's long description is a placeholder that the Discovery `.1` will refine at closure time (the epic's actual scope crystallizes from Discovery, not from filing-time guesswork). Keep it under the 70w hard cap (SPEC §"PLAN.md filing-discipline thresholds").

## Step 5 — Scaffold the `.1` Discovery tasknote

Copy `<template>` to `<tasknote dir>/<AREA>-<next-N>.1.md` and fill the frontmatter per SPEC §"Tasknote frontmatter":

- `title:` — `<shortname> discovery` (e.g., `expand-shipped-skills discovery`).
- `status:` — `in-progress`.
- `created:` — today's date (`YYYY-MM-DD`).
- `related-tasks:` — `[<AREA>-EPIC-<next-N>]` plus any predecessor IDs the user surfaced in Step 2.

Replace the H1 with `# <AREA>-<next-N>.1 | <shortname> discovery` and update the nav header `🔗` chip to `[[<AREA>-EPIC-<next-N>]]`.

Pre-populate `## 🎯 Goal`, `## ✅ Acceptance`, and `## 🧩 Subtasks` with the canonical epic-Discovery shape parameterized to the locked inputs:

**Goal (one sentence):**

> Scope the `<AREA>-EPIC-<next-N>` epic (`<shortname>`) before any implementation child fires; deliverable = filed concrete child scopes for `<AREA>-<next-N>.2..(N-1)` in `_project/PLAN.md`.

**Acceptance (parameterized):**

```
- [ ] Shared design surface inventoried for the epic (sources, adopter wiring, SPEC contract impact, templates) — captured in Discovery Notes
- [ ] Open scoping questions resolved with the user via AskUserQuestion — captured in a "Resolved scoping" table in Discovery Notes
- [ ] Concrete child scopes for <AREA>-<next-N>.2 .. <AREA>-<next-N>.<N-1> filed in _project/PLAN.md (each line under the 50w target / 70w hard cap per SPEC §"PLAN.md filing-discipline thresholds")
- [ ] Audit line <AREA>-<next-N>.<N> reviewed and confirmed as-filed (or rewritten if the Discovery surfaces a scope shift)
- [ ] Phase 4 doc-drift sweep at closure: typically no AI-referenced doc updates land in pure Discovery filing (contract edits land inside the implementation children)
```

**Subtasks (parameterized):**

```
- [ ] Inventory shared design surface (source files, adopter-wiring surfaces, SPEC contract impact, templates) — log in Discovery Notes
- [ ] Skim _project/tasknote/archive/<area>/ for relevant precedents — log load-bearing findings in Discovery Notes
- [ ] Drift check on cited paths and concepts — flag any drift before re-interpreting the epic
- [ ] Surface open scoping questions via AskUserQuestion (typical: per-child shortname + scope + adopter-wiring policy) — record answers in a "Resolved scoping" table
- [ ] Draft refined long descriptions for <AREA>-<next-N>.2 .. <AREA>-<next-N>.<N-1>; word-count each (≤50w target / 70w hard cap)
- [ ] Phase 2: write the drafted child lines into _project/PLAN.md under <AREA>-EPIC-<next-N> with 2-space indent
- [ ] Phase 3: markdown mental-pass on the PLAN.md edits (grammar / indent / cross-refs)
- [ ] Phase 4: doc-drift sweep + flip .1 PLAN line to stub form + archive tasknote
```

Leave the standard 4-phase checklist sections from the template intact below the populated Goal / Acceptance / Subtasks. Drop the audit-related Acceptance/Subtask line if N excluded audit in Step 2.

## Step 6 — Drive Phase 1: Discovery

Walk the Phase 1 checklist per SPEC §"📝 Phase 1: Discovery". Tick boxes as each step completes. Skill-specific imperatives:

- **Reviewed PLAN.md** — already done (the parent + `.1` + `.N` lines were written in Step 4).
- **Relevance Assessment** — Verdict: Proceed (the user explicitly invoked `/epic-discovery`, motivating filing an epic). Rationale: capture from the Step 1 conversation context.
- **Read relevant source files** — read the source files the conversation surfaced as in-scope for the epic. If none surfaced yet, ask the user which directories / modules / files the epic touches and read those.
- **Archive skim** — `ls <tasknote dir>/archive/<area>/` then `grep -l <source-path> <tasknote dir>/archive/<area>/*.md` for each source path. Read hits and log load-bearing findings (file moves, precedents, design decisions, regressions) in Discovery Notes.
- **Drift check** — verify file paths, line numbers, and concepts cited in the conversation context still match HEAD. Flag any drift.
- **Clarifying questions** — use AskUserQuestion to resolve open scoping decisions for the implementation children. Typical questions: per-child shortname + scope; cross-cutting adopter-wiring policy; SPEC contract impact per child. Record answers in a "Resolved scoping" table in Discovery Notes.
- **Subtasks populated** — the Step 5 scaffold pre-filled the canonical epic-Discovery subtask list; refine them now if Discovery surfaced a scope shift.

Do not enter Phase 2 until every Phase 1 box is ticked.

## Step 7 — Drive Phase 2: Execution

The Phase 2 deliverable is the filed child lines. Walk the Phase 2 checklist:

- **Pattern survey** — the existing CORE-EPIC-057 children are the closest precedent for the cohort-children filing pattern (2-space indent under the parent; `[<model>]` tag preserved on every line; em-dash separator; per-child long description ≤50w target / 70w hard cap).
- **Implemented the minimal solution** — write the drafted `.2..(N-1)` child lines into `_project/PLAN.md` directly under the existing `.1` Discovery line, before the `.N` audit line (or at the bottom if N excluded audit). Preserve the 2-space child indent. Word-count each line; rewrite if any breach the 70w cap.
- **Updated/added tests** — N/A (pure PLAN.md filing; no executable code surface).

Capture in Implementation Notes: the count of lines written, word-count per line, and any audit-number bump (if Discovery decided N was wrong and the audit's number shifted).

## Step 8 — Drive Phase 3: Testing & Linting

Markdown-prose edits only — no test surface. Markdown mental-pass on the edited PLAN.md block:

- 2-space child indent preserved on every new line.
- `**<AREA>-<next-N>.<M>**` bold ID intact.
- `[<model>]` tag present on every new line.
- `| <shortname>` segment present and ≤30 chars.
- Em-dash separator (` — `) consistent.
- Long description ≤70w hard cap; ≤50w target.
- No trailing whitespace.

Tick all three Phase 3 boxes (test suite N/A, lint N/A, frontend N/A).

## Step 9 — Drive Phase 4: Closure

Walk the closure steps in order:

- **Doc-drift sweep** — for each entry in `<tasknote dir>/README.md` §"AI-referenced docs" (typical adopter set: `README.md` / `CLAUDE.md` / `_project/PLAN.md`; flowtron self-hosted set: `README.md` / `SPEC.md` / `docs/MIGRATION.md` / `claude/CLAUDE-snippet.md`), state per-entry verdict ("no change" or the specific update). Pure Discovery filing typically lands "no change" across the board — contract edits live inside the implementation children.
- **Flip the `.1` PLAN.md line to stub form** — `- [ ] **<AREA>-<next-N>.1** [<model>] | <shortname> discovery — Completed YYYY-MM-DD.` per SPEC §"`## Completed` archive convention". Keep nested under `<AREA>-EPIC-<next-N>` in its current `## <Priority>` section (per epic-cohort grouping; parent + cohort move to `## Completed` only when all children close — see CORE-057.1 / .2 / .5 closure precedents).
- **Move the `.1` tasknote** — `git mv <tasknote dir>/<AREA>-<next-N>.1.md <tasknote dir>/archive/<area>/<AREA>-<next-N>.1.md`. Set `**Archived:** YYYY-MM-DD` in the tasknote's Phase 4 block.
- **Recap** — one short paragraph: epic filed, Discovery closed, children scoped, next move (typically `/task <AREA>-<next-N>.2` to fire the first implementation child).

Wait for user confirmation before continuing to Step 10.

## Step 10 — Post-closure protocol

The three-step post-closure protocol (commit / suggest next move / offer copy-paste line) is canonical in SPEC §"Post-closure protocol". Skill-specific orchestration:

- Confirm with the user before committing — do not commit unprompted.
- The proposed commit message is `feat: <AREA>-<next-N>.1 — file <AREA>-EPIC-<next-N> + scope children` (or a user-edited variant).
- On commit-go, the suggest-next-move and copy-paste-line follow in the same response (motion is one continuous flow per the SPEC contract).
- The next move is typically `/task <AREA>-<next-N>.2` (first implementation child) — name the recommended model alongside the task ID.
- The copy-paste line is `/clear then /model <opus|sonnet> then /task <AREA>-<next-N>.2`. Substitute the next child's PLAN-line `[model]` tag.

## Notes

- **One-motion contract.** This skill files the parent + `.1` + `.N` PLAN lines AND drives the `.1` Discovery tasknote through closure in a single invocation. No seam where the user has to manually run `/task <ID>.1` after filing — `/task` would refuse to restart the in-progress tasknote anyway.
- **Audit subtask is optional.** Per `SPEC/epic.md` line 11, simpler multi-child implementations don't need the Discovery + Audit bracket. Step 2's AskUserQuestion offers the option to skip the audit; in that case Step 4 files only the parent + `.1` and `N` excludes the audit slot.
- **N can shift during Discovery.** If the Discovery surfaces that N was wrong (scope shrinks or grows), Phase 2 in Step 7 bumps the audit's number when filing children. Document the shift in Implementation Notes.
- **Parent description is a placeholder.** The parent epic's long description filed in Step 4 is a one-paragraph placeholder; the Discovery's Final Summary refines it at closure time. The visualizer parses both states identically.
- **Auto-wired into adopters.** Symlinked into adopter projects via `claude/skills/new-project/SKILL.md` Step 3 + `docs/MIGRATION.md` §1.2 + `claude/CLAUDE-snippet.md`'s "One-time symlink wiring" section. New adopter projects bootstrapping via `/new-project` get this skill automatically; existing adopters pick it up on next flowtron version bump.
- **Compare with `/close-epic`** — the sibling skill that scaffolds + drives the audit `.N` tasknote at the end of an epic and prompts the user to flip the parent line to `Completed`. `/epic-discovery` opens an epic; `/close-epic` closes it.
- **Compare with `/task`** — `/task <ID>` runs an existing PLAN.md entry (starter, in-progress, or fresh) through the 4-phase workflow. `/epic-discovery` files a new epic AND its first child AND drives that first child to closure. The two skills don't overlap.
- **Compare with `/starter-task`** — `/starter-task <ID>` files a single starter tasknote with rich AI-captured context. `/epic-discovery` files an epic + its first two child lines + drives a full Discovery. Use `/starter-task` when scope is single-task; use `/epic-discovery` when scope warrants the Discovery + Audit bracket.
