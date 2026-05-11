---
name: task
description: Start a flowtron tasknote and drive it through the SPEC's 4-phase workflow. Invoke with the task ID as args (e.g., args="CORE-004"). Reads SPEC.md, scaffolds the tasknote from the template, runs Phase 1 Discovery, then continues conversationally through phases 2-4 and the post-closure protocol.
---

# task — flowtron tasknote runner

You are starting a tasknote for the task ID provided in `args` (e.g., `CORE-004`). The full workflow contract lives in flowtron's `SPEC.md` — this skill is the executable interpretation, not a replacement. Treat SPEC.md as authoritative when this file is silent or in tension.

If `args` is missing or doesn't match `<AREA>-<NUMBER>` (or `<AREA>-<NUMBER>.<SUB>` for epic subtasks), stop and ask the user for a valid task ID. Do not guess.

## Step 0 — Resolve paths

Determine which repo you're in:

- **Adopting project (typical):** `_project/flowtron/SPEC.md` exists. Use:
  - SPEC: `_project/flowtron/SPEC.md`
  - SPEC_DIR (lazy SPEC modules): `_project/flowtron/SPEC/`
  - SKILL_DIR (lazy SKILL fragments): `_project/flowtron/claude/skills/task/`
  - Template: `_project/flowtron/templates/tasknote-template.md`
  - PLAN: `_project/PLAN.md`
  - Tasknote dir: `_project/tasknote/`
- **Flowtron itself (self-hosted):** repo-root `SPEC.md` exists with the heading `# Flowtron — Workflow Specification`. Use:
  - SPEC: `SPEC.md`
  - SPEC_DIR (lazy SPEC modules): `SPEC/`
  - SKILL_DIR (lazy SKILL fragments): `claude/skills/task/`
  - Template: `templates/tasknote-template.md`
  - PLAN: `_project/PLAN.md`
  - Tasknote dir: `_project/tasknote/`

If neither layout matches, stop and tell the user this directory doesn't look like a flowtron-using project.

`SPEC.md` and this `SKILL.md` are the always-loaded core. Two lazy-load surfaces sit alongside:

- `SPEC_DIR/` holds lazy SPEC modules (`epic.md`, `starter.md`, `blocked.md`, `model.md`, `versioning.md`) — canonical workflow contract, loaded when the relevant branch fires (Step 1.5 model-gate, Step 2 epic-ID prefix, Step 3a / 3c, Step 5 parking).
- `SKILL_DIR/` holds lazy SKILL fragments (`step-1.5-model-edge.md`, `step-3a-promote-starter.md`, `step-3c-resume-blocked.md`) — executable interpretation of the contract, loaded on the same branch fires.

Each subsequent step names the modules and fragments to read explicitly. SKILL stubs typically Read both the SPEC contract and the SKILL fragment in parallel before proceeding.

## Step 1 — Locate the task in PLAN.md

Read PLAN.md. Find the line containing `**<TASK-ID>**`. If the ID isn't in PLAN.md, stop and ask the user whether to add it or use a different ID. Do not invent an entry.

**Status gate (non-negotiable).** Before doing anything else, check the located line:

- If the line is checked (`- [x]`), or
- if it lives under the `## Completed` heading,

the task is already closed. **Stop. Do not scaffold.** Surface the conflict to the user and ask whether they meant a different task ID. Do this check by re-reading the exact PLAN.md line — never infer status from prior conversation context.

Otherwise, capture:

- The optional `[model]` segment (`opus` | `sonnet`) — see Step 1.5
- The optional `| shortname` segment
- The one-line long description (everything after ` — `; may be empty)
- The section heading the line lives under (`Critical` / `High` / `Medium` / `Low` / `Future Opportunities`) — this is the task's **Priority**

The full task-line grammar is `- [ ] **TASK-ID** [model] | shortname — long description`; both `[model]` and `| shortname` are optional. See SPEC §"Task-line format" for the canonical grammar.

**Filing-discipline check (advisory).** Word-count the captured long description (after `— `). If it exceeds the 70-word hard cap from SPEC §"PLAN.md filing-discipline thresholds", surface a one-line warning to the user:

```
⚠️ PLAN.md description is <N> words (>70w cap). Should this have been filed
   as a starter? Proceeding with the existing line.
```

Informational only — do not block scaffolding; the task is already filed and reworking the filing now is too late. The warning nudges future filings.

## Step 1.5 — Model gate (BEFORE scaffolding)

The model decision is made at filing time on the PLAN.md task line, not at scaffold time. Gate on it now, before reading source files or synthesizing the tasknote body — heavy thinking should never run on the wrong model.

Three cases (decide via the `[model]` segment captured in Step 1):

- **PLAN.md `[model]` matches the active model** → proceed silently to Step 2.
- **PLAN.md `[model]` differs from the active model** → STOP. Read `<SPEC_DIR>/model.md` (contract) and `<SKILL_DIR>/step-1.5-model-edge.md` (operational steps), then follow the "Mismatch" branch.
- **PLAN.md `[model]` is absent (legacy entry, no `[model]` on the line)** → Read `<SPEC_DIR>/model.md` (contract) and `<SKILL_DIR>/step-1.5-model-edge.md` (operational steps), then follow the "Legacy entry" branch.

The active model is whatever the assistant is currently running as (visible in the runtime; if uncertain, ask the user).

## Step 2 — Pre-flight checks & file-state branch

- Resolve the **Area** from the task ID prefix per SPEC §"Task ID convention". Unknown prefix → read `_project/tasknote/README.md`; if still unresolved, stop and ask.
- **Epic-ID dispatch.** If the TASK-ID is `<AREA>-EPIC-<N>` (parent epic) or `<AREA>-<N>.<sub>` (epic subtask), Read `<SPEC_DIR>/epic.md` for the lifecycle contract before continuing. Plain `<AREA>-<N>` IDs do not load this module.
- If `_project/tasknote/archive/<area>/<TASK-ID>.md` already exists: stop. The task is already closed and archived. Surface the conflict and ask whether the user meant a different task ID — do not scaffold a duplicate.
- Check `_project/tasknote/<TASK-ID>.md`. **Four-way branch on the file's YAML `status:`:**
  - **`status: starter`** — starter tasknote awaiting promotion. Continue at **Step 3a (Promote a starter)**.
  - **`status: blocked`** — parked tasknote awaiting resume. Continue at **Step 3c (Resume a blocked tasknote)**.
  - **Any other `status:`** (`not-started` / `in-progress` / `completed`) — file is in flight or already closed. Stop. Tell the user the tasknote exists and recommend they continue conversationally (e.g., "continue CORE-004") rather than restarting. This skill is start-only by design.
  - **File absent** — fresh scaffold path. Continue at **Step 3b (Scaffold a fresh tasknote)**.

## Step 3a — Promote a starter (existing file with `status: starter`)

Read `<SPEC_DIR>/starter.md` (lifecycle contract) and `<SKILL_DIR>/step-3a-promote-starter.md` (executable steps), then continue at **Step 4 (Phase 1: Discovery)**.

## Step 3b — Scaffold a fresh tasknote (no existing file)

Copy the template (path resolved in Step 0) to `_project/tasknote/<TASK-ID>.md`. The frontmatter schema and body layout are canonical in SPEC §"Tasknote frontmatter" and §"Tasknote body shape" — fill them as specified there. The template ships the canonical phase checklists; leave them exactly as they ship.

**Skill-specific values at scaffold time:**

- `title:` — prefer the PLAN.md `| shortname` (Step 1) when present; otherwise derive from the long description.
- `status:` — `in-progress`.
- `created:` — today's date.
- `related-tasks:` — from PLAN.md if the line cites parent epics, predecessors, or follow-ups; otherwise `[]`.

🎯 Goal is derived from the PLAN.md line at scaffold; ask the user if it's too terse for a clear one-sentence goal. ✅ Acceptance and 🧩 Subtasks are empty checklists at scaffold, populated during Phase 1 Discovery.

## Step 3c — Resume a blocked tasknote (existing file with `status: blocked`)

Read `<SPEC_DIR>/blocked.md` (lifecycle contract) and `<SKILL_DIR>/step-3c-resume-blocked.md` (executable steps), then continue at **Step 5** at Phase 2 (the lazy fragment's step 5 directs there; Phase 1 is already complete on a parked tasknote).

## Step 4 — Phase 1: Discovery (drive now)

Work through the Phase 1 checklist per SPEC §"📝 Phase 1: Discovery". Re-scope and De-scope behavior is canonical there; the Re-scope-to-blocked path defers to `<SPEC_DIR>/blocked.md` (Read it if Discovery surfaces a real-but-blocked prerequisite).

Skill-specific imperatives on top of the SPEC contract:

- Tick boxes in the tasknote as you complete them.
- The first checklist item (Reviewed PLAN.md) is already done in Step 1 of this skill.
- For the Archive skim step: `ls _project/tasknote/archive/<area>/` to enumerate, then for each source path in scope run `grep -l <path> _project/tasknote/archive/<area>/*.md`. Read the hits and log anything load-bearing in Discovery Notes (file moves, regressions, design decisions, hardlink notes, etc.). If `archive/<area>/` is empty or absent, log "no prior tasknotes" and tick the box.
- For the Clarifying questions step: use AskUserQuestion for anything genuinely ambiguous. If nothing is ambiguous, write `No clarifications needed` in the tasknote with the explicit assumptions.
- For the "populate Subtasks" step: fill the tasknote's `## 🧩 Subtasks` checklist with concrete, ordered steps.
- Do not enter Phase 2 until every Phase 1 box is ticked. Once ticked, surface the **Phase 1→2 operator-gate cue** with the mandatory 1-2 sentence plain-English preview line (per SPEC §"Operator-gate cues") and wait for the user's go before starting Step 5 Phase 2.

## Step 5 — Phases 2-4 (drive conversationally)

After the Phase 1→2 cue clears, Phase 2 → Phase 3 → Phase 4 closure ops
flow continuously without an intermediate gate. The next operator-gate
cue is the 📦 ready-to-commit banner in Step 6.

- **Phase 2: Execution** — pattern survey first (look at sibling modules / parallel components for an existing shape to extend; justify a new shape if none fits), then minimal implementation, then targeted tests on changed files. Tick boxes as you go. **If a hard dependency surfaces mid-execution**, Read `<SPEC_DIR>/blocked.md` and park the tasknote per its contract — flip `status: blocked`, update the nav header to `⏸ Blocked`, and stop. The next `/task <ID>` invocation enters the resume path (Step 3c) automatically.
- **Phase 3: Testing & Linting** — targeted tests, lint/type-check on changed code, visual confirmation for frontend changes (`👁️` prefix on the prose ask, per SPEC §"🧪 Phase 3: Testing & Linting" — inline emoji only, not a banner block). Run the full suite only for broad/cross-cutting changes. Flows directly into Phase 4 closure ops; no gate between them.
- **Phase 4: Closure (auto-run)** — run the doc-drift sweep across `_project/tasknote/README.md` §"AI-referenced docs" (per-entry verdict: "no change" or the specific update), flip the PLAN.md line to the stub form `[x] **<TASK-ID>** [model] | shortname — Completed YYYY-MM-DD.` per SPEC §"`## Completed` archive convention" (drop the long description — the archived tasknote is the canonical record), move the line to the `## Completed` section, and move the tasknote file to `_project/tasknote/archive/<area>/<TASK-ID>.md` as a single closure write. Draft the recap (1-2 sentence plain-English summary first, then technical detail: file paths / LOC / key decisions + optional verification request) but **do not surface a banner here** — the recap bundles into Step 6's 📦 gate. **Recap is recap-only — do not include the next-task suggestion in the recap; that lands after the commit (Step 6); see SPEC §"🚀 Phase 4: Closure" callout.**

## Step 6 — Post-closure protocol

The three-step protocol (commit / suggest next move / offer copy-paste line) is canonical in SPEC §"Post-closure protocol".

Skill-specific orchestration on top of the SPEC contract:

- The motion is **one continuous flow**. The user's commit-go (e.g. "commit", "go", "yes") is the *only* gate; once the commit lands, the suggest-next-move and copy-paste-line steps follow **in the same response as the commit confirmation**, even if the user's reply was terse or only named the commit step. Do not wait for them to prompt the next-task suggestion.
- The post-commit response carries a 🏁 state-marker line immediately above the next-move suggestion (per SPEC §"Post-closure protocol" step 2): `` 🏁 **<TASK-ID> — committed `<sha>`** · archived to `<archive-path>` ``. Visually closes the 🛠️ → 📦 → 🏁 lifecycle in the transcript.
- Surface the **bundled 📦 ready-to-commit gate** (per SPEC §"Post-closure protocol" step 1) and wait for commit-go. Do not commit unprompted.
- When suggesting the next move (after commit lands), surface candidates with `[model]` tags visible **inline per option** in the PLAN.md task-line shape: `**<TASK-ID>** [model] | shortname — one-sentence "why now"`. Mirrors PLAN.md so the user can scan model assignments without cross-referencing.
- The copy-paste line is `/clear then /model <opus|sonnet> then /task <NEXT-ID>` — you cannot run `/clear` yourself. Substitute the next task's PLAN-line `[model]` tag for `<opus|sonnet>` so the user pastes a fully resolved line.

## Notes

- **Sub-tasks of an epic** (`<AREA>-<NUMBER>.<SUB>`) follow the same flow. The parent epic line in PLAN.md is not flipped to complete until all children are. For code-sweep / multi-child feature epics, the first subtask (`.1`) is typically a **Discovery** task — its deliverable is the filed child task list in PLAN.md, not code — and the final subtask is an **Audit** task that verifies the completed epic sits well in the codebase. Full lifecycle in `<SPEC_DIR>/epic.md` (loaded at Step 2 for epic IDs).
- **Skip-the-tasknote cases** (single-line typo, formatting tweak, ~10-line doc patch, trivial config edit) — see SPEC §"When to use a tasknote (and when not to)". For these, decline to scaffold and tell the user to make the edit directly.
