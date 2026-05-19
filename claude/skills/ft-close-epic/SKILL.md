---
name: ft-close-epic
description: Close a flowtron epic by scaffolding and driving its audit `.N` tasknote in one motion. Invoke with the audit subtask ID as args (e.g., args="CORE-057.6"). Pre-fills the audit tasknote with the fixed doc-drift sweep acceptance line per `SPEC/epic.md`, drives the full 4-phase audit inline, then prompts to flip the parent `<AREA>-EPIC-<N>` to `Completed` and move the cohort to `## Completed`. Auto-wired into adopters via `/ft-new-project` and `docs/MIGRATION.md` §1.2.
---

# close-epic — flowtron epic audit + close driver

You are scaffolding and driving the audit `.N` subtask of an epic, then prompting the user whether to flip the parent epic to `Completed`. The full lifecycle contract lives in `<SPEC_DIR>/epic.md` — this skill is the executable interpretation of the lifecycle's audit-and-close side, not a replacement. Treat `SPEC/epic.md` as authoritative when this file is silent or in tension.

The skill takes the **audit subtask ID** as `args` (e.g., `args="CORE-057.6"`). If `args` is missing or doesn't match `<AREA>-<NUMBER>.<SUB>`, stop and ask the user for a valid ID. Do not guess.

## Step 0 — Resolve paths

Two layouts. Pick by which file exists:

- **Adopter project:** `_project/flowtron/SPEC.md` exists → `<root>` = `_project/flowtron/`.
- **Flowtron self-host:** repo-root `SPEC.md` with heading `# Flowtron — Workflow Specification` → `<root>` = repo-root.

If neither matches, bail.

Paths: SPEC=`<root>SPEC.md`, SPEC_DIR=`<root>SPEC/`, template=`<root>templates/tasknote-template.md`, PLAN=`_project/PLAN.md`, tasknote dir=`_project/tasknote/`.

After resolving, Read `<SPEC_DIR>/epic.md` for the canonical lifecycle before drafting anything.

## Step 1 — Pre-flight

- `_project/PLAN.md` must exist (cwd is a flowtron-adopting project or flowtron itself).
- Parse `args` as `<AREA>-<NUMBER>.<SUB>`:
  - **Area** must resolve per SPEC §"Task ID convention" or via `_project/tasknote/README.md`'s project-specific prefixes. Unknown prefix → stop and ask.
  - **`.<SUB>` segment is required** — `/ft-close-epic` only runs against epic subtasks, not standalone tasks. If the ID matches `<AREA>-<NUMBER>` (no `.<SUB>` suffix), stop and tell the user "`/ft-close-epic` runs against the audit `.N` subtask of an epic, not a standalone task. Use `/ft-task <ID>` for standalone tasks."
- Check `<tasknote dir>/<AUDIT-SUBTASK-ID>.md`:
  - If the file already exists with `status: in-progress`, stop and tell the user the audit tasknote is already in flight. Recommend continuing conversationally (e.g., "continue CORE-057.6") rather than restarting — this skill is start-only by design.
  - If `<tasknote dir>/archive/<area>/<AUDIT-SUBTASK-ID>.md` already exists, the audit is closed and archived; stop and surface the conflict.
- Otherwise (fresh scaffold path), continue.

## Step 2 — Validate audit position and check sibling state

Read `_project/PLAN.md`. Locate the parent epic ID by stripping the `.<SUB>` suffix and looking for `<AREA>-EPIC-<NUMBER>`:

- If no parent epic line is found in PLAN.md (active OR `## Completed`), stop and tell the user no parent epic `<AREA>-EPIC-<NUMBER>` exists for the given audit ID. The audit subtask must be filed under a parent epic via `/ft-epic-discovery`.
- If the parent epic line lives under `## Completed`, stop and surface the conflict — the parent has already been closed.

Walk the parent's nested children block (lines indented 2 spaces under the parent line, matching `  - [ ] **<AREA>-<NUMBER>.<SUB>**` or `  - [x] **<AREA>-<NUMBER>.<SUB>**`). Determine:

- The **highest `.<SUB>` numeric value** across all children.
- Whether the chosen `<AUDIT-SUBTASK-ID>` matches that highest `.<SUB>`.

If the chosen ID is **not** the highest `.<SUB>`:

- Stop. Surface "The audit must be the highest-numbered child of its parent epic. The highest `.N` currently filed is `<AREA>-<NUMBER>.<HIGHEST>`. Either pass that ID or re-file the audit at a higher number."

Walk the children for **un-checked** `[ ]` siblings (excluding the chosen audit ID itself):

- **No open siblings** → proceed silently.
- **One or more open siblings** → use AskUserQuestion to ask:

  ```
  Open implementation children remain: <list>. Audit early before they close? (default No bails)
  ```

  - Default No → stop. Tell the user to drive the open children via `/ft-task <ID>` first, then re-run `/ft-close-epic <AUDIT-SUBTASK-ID>`.
  - Yes → continue, log the early-audit decision in the audit tasknote's Discovery Notes (Step 4) so the audit's scope is honest about the partial cohort.

## Step 3 — Scaffold the audit tasknote

Copy `<template>` to `<tasknote dir>/<AUDIT-SUBTASK-ID>.md` and fill the frontmatter per SPEC §"Tasknote frontmatter":

- `title:` — `<parent-epic-shortname> audit` (derive shortname from the parent epic's `| <shortname>` segment).
- `status:` — `in-progress`.
- `created:` — today's date (`YYYY-MM-DD`).
- `related-tasks:` — `[<AREA>-EPIC-<NUMBER>, <sibling-IDs>...]` (the parent epic plus all sibling subtask IDs in the cohort).

Replace the H1 with `# <AUDIT-SUBTASK-ID> | <parent-epic-shortname> audit` and update the nav header `🔗` chip to `[[<AREA>-EPIC-<NUMBER>]]`.

Pre-populate `## 🎯 Goal`, `## ✅ Acceptance`, and `## 🧩 Subtasks` with the canonical epic-audit shape parameterized to the cohort:

**Goal (one sentence):**

> Verify the completed `<AREA>-EPIC-<NUMBER>` (`<shortname>`) cohort sits coherently in the codebase: cumulative doc-drift sweep across `_project/tasknote/README.md` §"AI-referenced docs", naming/style consistency across the cohort's deliverables, and follow-up filings for any miss.

**Acceptance (parameterized; the first criterion is the fixed doc-drift line per `SPEC/epic.md` §"Audit acceptance — fixed doc-drift line" and is non-negotiable):**

```
- [ ] **Doc-drift sweep (fixed line, per SPEC/epic.md §"Audit acceptance — fixed doc-drift line")** — for each entry in `_project/tasknote/README.md` §"AI-referenced docs", state "no change" or the specific update. Always present; surfaces cumulative slice-local staleness that per-task Phase 4 closures can miss.
- [ ] Cohort coherence inventory: each implementation child's deliverables read against the others (naming consistency, style parity, no contradictory cross-refs)
- [ ] No regressions surfaced in earlier-shipped cohort children's surfaces
- [ ] Audit findings recorded in Implementation Notes; misses cited as candidates for `/ft-file-followup <NEW-ID>` filing (filed AFTER audit closure to preserve `/ft-file-followup`'s filing-discipline gate)
- [ ] Single `feat: <AUDIT-SUBTASK-ID> — audit <AREA>-EPIC-<NUMBER>` (or `chore: ...` if no code edits land) commit lands
- [ ] PLAN.md line for `<AUDIT-SUBTASK-ID>` flipped to stub form `Completed YYYY-MM-DD.`
- [ ] Tasknote moved to `_project/tasknote/archive/<area>/<AUDIT-SUBTASK-ID>.md`
- [ ] Parent-flip prompt surfaced after audit closure (skill Step 8) — user confirms or declines flipping `<AREA>-EPIC-<NUMBER>` to `Completed` and moving the cohort to `## Completed`
```

**Subtasks (parameterized):**

```
- [ ] Inventory cohort children's archived tasknotes — read each implementation child's Final Summary + Implementation Notes; capture deliverables in Discovery Notes
- [ ] Walk `_project/tasknote/README.md` §"AI-referenced docs" entries — fixed doc-drift sweep
- [ ] Cohort coherence pass — naming consistency, style parity, no contradictory cross-refs across the cohort's deliverables
- [ ] Surface audit findings in Implementation Notes; cite each miss as a `/ft-file-followup <NEW-ID>` candidate
- [ ] Phase 4: flip `<AUDIT-SUBTASK-ID>` PLAN line to stub form + archive tasknote
- [ ] Parent-flip: skill Step 8 prompts user; on confirm, atomic flip parent line + move cohort to `## Completed`
```

Leave the standard 4-phase checklist sections from the template intact below the populated Goal / Acceptance / Subtasks.

## Step 4 — Drive Phase 1: Discovery

Walk the Phase 1 checklist per SPEC §"📝 Phase 1: Discovery". Tick boxes as each step completes. Skill-specific imperatives:

- **Reviewed PLAN.md** — already done in Step 2 (parent epic + sibling state walked).
- **Relevance Assessment** — Verdict: Proceed (the user explicitly invoked `/ft-close-epic` and Step 2's pre-flight passed). Rationale: capture cohort state at audit time (which children closed when, any early-audit decision from Step 2).
- **Read relevant source files** — for each cohort sibling, read its archived tasknote at `<tasknote dir>/archive/<area>/<SIBLING-ID>.md`. Capture each child's deliverables (files added/edited, design decisions, surfaces touched) in Discovery Notes.
- **Archive skim** — typically self-referential for an epic audit (cohort children are themselves archive entries). If the epic touched surfaces with prior tasknote history beyond the cohort, grep for those paths in `<tasknote dir>/archive/<area>/*.md` and read non-cohort hits for cumulative context.
- **Drift check** — verify cited paths and conventions in cohort children's deliverables still match HEAD (paths the implementation children touched may have moved during the cohort).
- **Clarifying questions** — for an audit, typically none. If cohort scope is ambiguous (some children deferred, partial-cohort early-audit per Step 2), use AskUserQuestion to confirm audit scope.
- **Subtasks populated** — Step 3 scaffold pre-filled the canonical epic-audit subtask list; refine if Discovery surfaces a scope shift.

Do not enter Phase 2 until every Phase 1 box is ticked. Once ticked, branch on the clarifying-questions outcome per SPEC §"📝 Phase 1: Discovery" exit gate:

- **"No clarifications needed" branch** — emit the inline marker `✅ Phase 1 Discovery complete (no clarifications needed); entering Phase 2 Execution.` and start Step 5 Phase 2 immediately. Plain prose, not a banner; not a new gate.
- **Clarifications-surfaced branch** — surface the **🛠️ Phase 1→2 operator-gate cue** with the mandatory 1-2 sentence plain-English preview line (per SPEC §"Operator-gate cues") and wait for the user's go before starting Step 5 Phase 2.

## Step 5 — Drive Phase 2: Execution

The Phase 2 deliverable is the audit findings — recorded in Implementation Notes. Walk the Phase 2 checklist:

- **Pattern survey** — N/A for most audits (no new code surface; the audit is a verification pass over existing cohort deliverables). For audits that surface a fix needing inline correction, note the precedent surveyed.
- **Implemented the minimal solution** — for most audits this is verification work, not code edits: walk the cohort coherence checklist (Acceptance criteria 2-4), record findings as Implementation Notes. If the audit surfaces a fix that's small and clearly in scope (e.g., a stale path reference in a sibling's deliverable), apply it inline. Larger misses → log for `/ft-file-followup` filing after closure.
- **Updated/added tests** — N/A unless the audit applied a code fix.

Capture in Implementation Notes:

- Cohort children inventoried (one bullet per child summarizing its deliverable).
- Coherence findings ("no inconsistencies surfaced" or specific surfaced issues).
- Any inline fixes applied (file:line + diff shape).
- Misses logged as `/ft-file-followup <NEW-ID>` candidates (one bullet per miss with one-line rationale; user invokes `/ft-file-followup` per miss after audit closure).

Phase 2 flows continuously into the Step 6 lint/test pass and Step 7 closure ops without an intermediate gate; the next operator-gate cue is the 📦 ready-to-commit banner in Step 9.

## Step 6 — Drive Phase 3: Testing & Linting

Markdown-prose verification only for most audits — no test surface. If the audit applied an inline fix, run lint/type-check on changed files; otherwise tick all three Phase 3 boxes (test suite N/A, lint N/A, frontend N/A — capture rationale in Testing Notes).

## Step 7 — Drive Phase 4: Closure (audit subtask, auto-run)

Walk the Phase 4 checklist for the audit subtask itself. **No banner here** — closure ops auto-run; the recap drafted at the end bundles into Step 9's 📦 gate (parent-flip prompt also bundles there per Step 8).

- **Doc-drift sweep (fixed line)** — for each entry in `<tasknote dir>/README.md` §"AI-referenced docs", state per-entry verdict ("no change" or the specific update). This is the contractually-required sweep per `SPEC/epic.md` §"Audit acceptance — fixed doc-drift line"; never skip.
- **Flip the audit's PLAN.md line to stub form** — `- [ ] **<AUDIT-SUBTASK-ID>** [<model>] | <shortname> audit — Completed YYYY-MM-DD.` per SPEC §"`## Completed` archive convention". Keep nested under `<AREA>-EPIC-<NUMBER>` in its current `## <Priority>` section (parent + cohort move only on Step 9 confirmation).
- **Move the audit tasknote** — `git mv <tasknote dir>/<AUDIT-SUBTASK-ID>.md <tasknote dir>/archive/<area>/<AUDIT-SUBTASK-ID>.md`. Set `**Archived:** YYYY-MM-DD` in the tasknote.
- **Draft the recap** — leads with a 1-2 sentence plain-English summary (audit ran; key finding or "no inconsistencies surfaced"), then technical detail (cohort children inventoried, follow-ups to file, any inline fixes applied). Hold it for Step 9's 📦 bundle; do not surface a banner now.

## Step 8 — Parent-epic flip eligibility (no banner)

After the audit closes cleanly, scan `_project/PLAN.md` for the parent epic line + all its children. Determine eligibility:

- All children `[x]` (including the audit just closed) → **all-children-closed**: parent-flip is eligible. The Yes/No prompt fires inside Step 9's 📦 bundle.
- Any child `[ ]` (typical only when Step 2's early-audit gate was bypassed) → **not-all-closed**: parent-flip is **not eligible**. Note the open children for surfacing inside Step 9's bundle as a heads-up; the prompt is skipped.

This step computes state only — **no banner here**. The user-facing prompt (when eligible) bundles into Step 9's 📦 ready-to-commit gate alongside the recap + closure review + commit message.

When the prompt fires in Step 9 and the user answers **Yes**:

1. **Flip the parent line to stub form** — `- [x] **<AREA>-EPIC-<NUMBER>** [<model>] | <shortname> — Completed YYYY-MM-DD.` (drop the long description per stub-form, SPEC §"`## Completed` archive convention").
2. **Atomic move** — cut the parent line + all nested children from their current `## <Priority>` section; paste at the top of `## Completed`. Preserve the 2-space child indent. If the cohort was the last entry in its source section, restore the `(none)` placeholder under that section heading.

On **No** (still in Step 9's bundle): leave cohort nested under current section. Note "Cohort stays under `## <Priority>`. Re-run `/ft-close-epic` later or flip manually when ready." in the post-commit response.

Capture the flip decision in the audit tasknote's Final Summary block (still editable until git commit lands in Step 9).

## Step 9 — Post-closure protocol

Run the protocol per SPEC §"Post-closure protocol", branching on SPEC §"Conditional skip rule" against the audit closure diff. **Parent-flip override:** when Step 8 marked parent-flip eligible, the parent-flip Yes/No is a bundled in-📦 prompt and forces the 📦 gate to fire regardless of signal state (per SPEC's bundled-prompt override). When ineligible, the signal rule evaluates normally.

- **Skip branch** (parent-flip ineligible AND signals clear) — emit `✅ Closure complete; committing autonomously (<concrete-signal-summary>).` (e.g., `audit closure: PLAN.md flip + tasknote archive; no frontend/privileged surface`), then run closure review + recap + commit + 🏁 + suggest-next-move + copy-paste in one response. Heads-up listing of open children (Step 8 ineligible branch) delivers inline alongside the closure review.
- **Fire branch** (parent-flip eligible OR any signal hits) — surface the bundled 📦 ready-to-commit gate (per SPEC §"Post-closure protocol" step 1). Alongside the SPEC-defined bundle, this skill carries:
  - **Parent-flip prompt** (when eligible per Step 8) — AskUserQuestion with default Yes:
    ```
    All <AREA>-EPIC-<NUMBER> children closed. Flip parent + move cohort to `## Completed`?

      Parent: <AREA>-EPIC-<NUMBER> | <shortname>
      Children to move (N total): <AREA>-<N>.1 .. <AREA>-<N>.<HIGHEST>

    (default Yes; declines leave cohort nested under current `## <Priority>` section)
    ```
  - **Commit message** — `feat: <AUDIT-SUBTASK-ID> — audit <AREA>-EPIC-<NUMBER>` (or `chore: ...` if no code edits landed).

On commit (either branch): if parent-flip Yes, apply the flip + atomic move per Step 8 before staging, so the commit captures the flip atomically.

Skill-specific next-move shape:
- Candidates carry `[model]` inline per option (`**<TASK-ID>** [model] | shortname — one-sentence "why now"`). Branches:
  - Misses logged → `/ft-file-followup <NEW-ID>` per miss (one at a time; user paces).
  - No misses + parent flipped → next epic / standalone task in PLAN.md.
  - No misses + parent declined → manual flip when ready (edit PLAN.md: flip parent line to stub form, move parent + nested children to top of `## Completed`). Re-running `/ft-close-epic` would hit Step 1's already-archived bail.
- Copy-paste line: standard `/clear then /model <opus|sonnet> then /<next-skill> <args>` shape.

## Notes

- **Bracket twin of `/ft-epic-discovery`.** `/ft-epic-discovery` opens an epic (files parent + `.1` + `.N`, drives `.1` Discovery); `/ft-close-epic` closes it (drives audit `.N`, prompts parent flip). Together they bracket `SPEC/epic.md` lifecycle steps 1-2 and 4-5; `/ft-task` runs the implementation children (step 3).
- **Audit-only — never standalone.** Validates arg is `<AREA>-<NUMBER>.<SUB>` at the highest `.<SUB>` for its parent. Standalone tasks → `/ft-task <ID>`.
- **Open-children warn-and-proceed.** Sibling implementation children still open → skill warns and asks (default No bails). Useful for early audits when a child is stuck or deferred.
- **Audit follow-ups → `/ft-file-followup`.** Misses logged in Implementation Notes as `/ft-file-followup <NEW-ID>` candidates; user invokes per miss after closure (preserves the 50w/70w cap at its natural boundary).
- **Parent-flip is a prompt, not automatic.** Skill never silently flips. User confirms (default Yes); declines leave cohort nested for a later flip.
- **Auto-wired into adopters.** Symlinked via `claude/skills/ft-new-project/` + `docs/MIGRATION.md` §1.2 + `claude/CLAUDE-snippet.md`'s symlink section. Existing adopters pick up on next flowtron version bump.
