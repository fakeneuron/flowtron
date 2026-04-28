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
  - Template: `_project/flowtron/templates/tasknote-template.md`
  - PLAN: `_project/PLAN.md`
  - Tasknote dir: `_project/tasknote/`
- **Flowtron itself (self-hosted):** repo-root `SPEC.md` exists with the heading `# Flowtron — Workflow Specification`. Use:
  - SPEC: `SPEC.md`
  - Template: `templates/tasknote-template.md`
  - PLAN: `_project/PLAN.md`
  - Tasknote dir: `_project/tasknote/`

If neither layout matches, stop and tell the user this directory doesn't look like a flowtron-using project.

## Step 1 — Locate the task in PLAN.md

Read PLAN.md. Find the line containing `**<TASK-ID>**`. Capture:

- The one-line description (everything after the `—`)
- The section heading the line lives under (`Critical` / `High` / `Medium` / `Low` / `Future Opportunities`) — this is the task's **Priority**
- Whether the line is already checked (`- [x]`) — if so, the task is marked complete; stop and surface the conflict

If the ID isn't in PLAN.md, stop and ask the user whether to add it or use a different ID. Do not invent an entry.

## Step 2 — Pre-flight checks

- If `_project/tasknote/<TASK-ID>.md` already exists: stop. Tell the user the tasknote exists and recommend they continue conversationally (e.g., "continue CORE-004") rather than restarting. This skill is start-only by design.
- Resolve the **Area** from the ID prefix using SPEC §"Task ID convention":
  - `CORE-` → core, `BE-` → backend, `FE-` → frontend, `DB-` → database, `DEPLOY-` → deployment, `TEST-` → testing
  - Unknown prefix: read `_project/tasknote/README.md` for project-specific prefixes. If still unresolved, stop and ask.

## Step 3 — Scaffold the tasknote

Copy the template to `_project/tasknote/<TASK-ID>.md` and fill the header:

- `TASK-ID | Task Title` → `<TASK-ID> | <description from PLAN.md>`
- **Goal:** derive a one-sentence goal from the PLAN.md line. If the line is too terse to support a clear goal, ask the user before scaffolding.
- **Priority:** the section heading from Step 1
- **Area:** resolved in Step 2
- **Model:** ask the user (`opus` or `sonnet`) using AskUserQuestion. Default recommendation: `opus` for design / multi-file / ambiguous work; `sonnet` for mechanical work with a clear diff in mind. Once set, the task runs end-to-end on this model — see SPEC §"Model field". If the loaded model doesn't match, surface the mismatch and let the user decide before continuing.
- **Status:** `In Progress`

## Step 4 — Phase 1: Discovery (drive now)

Work through the Phase 1 checklist in order. Tick boxes in the tasknote as you complete them.

1. **Reviewed the task entry in PLAN.md** — already done in Step 1.
2. **Relevance Assessment** — non-negotiable. State a verdict (`Proceed` / `Re-scope` / `De-scope`) with a one-line rationale, recorded in the tasknote.
   - `Re-scope`: update both the PLAN.md line and the tasknote header before continuing.
   - `De-scope`: skip directly to Phase 4 closure with the de-scope rationale as the final summary.
3. **Read relevant source files** — pull in any files the PLAN.md line references or implies.
4. **Drift check** — verify every file path, line number, function name, and root-cause hypothesis cited in the task description still matches current code. If anything drifted, surface it to the user and confirm the path forward before re-interpreting the task. Do not silently "correct" the plan.
5. **Clarifying questions** — use AskUserQuestion for anything genuinely ambiguous. If nothing is ambiguous, write `No clarifications needed` in the tasknote with the explicit assumptions you're making.
6. **Define execution steps** — list concrete, ordered steps in the tasknote's `Execution Steps:` section.

Do not enter Phase 2 until every Phase 1 box is ticked.

## Step 5 — Phases 2-4 (drive conversationally)

Continue with the user through:

- **Phase 2: Execution** — pattern survey first (look at sibling modules / parallel components for an existing shape to extend; justify a new shape if none fits), then minimal implementation, then targeted tests on changed files. Tick boxes as you go.
- **Phase 3: Testing & Linting** — targeted tests, lint/type-check on changed code, visual confirmation for frontend changes, fix everything you introduced. Run the full suite only for broad/cross-cutting changes.
- **Phase 4: Closure** — verify prior phases, update affected docs/inventories, flip the PLAN.md line to `[x] **<TASK-ID>** — <description>. Completed YYYY-MM-DD.` (move it to the `Completed` section), move the tasknote to `_project/tasknote/archive/<area>/<TASK-ID>.md`, and recap to the user. The recap = brief summary of what changed and key decisions, plus an optional verification request (one concrete thing for the user to check). Wait for confirmation.

## Step 6 — Post-closure protocol

After the user confirms the recap:

1. **Commit.** Bundle code changes + archived tasknote + PLAN.md flip into a single commit. Message: `feat: <TASK-ID> — <title>` (or `fix:` / `docs:` / `chore:` / `refactor:` as appropriate). Multiple recently-closed tasknotes may bundle into one commit when natural. Confirm with the user before committing — do not commit unprompted.
2. **Suggest the next move.** Either:
   - **Epic continuation:** if the closed task is in an active epic with cleared dependencies, name the most natural next task ID with a one-line "why now" and the recommended model.
   - **Open menu:** surface 2-3 candidates from PLAN.md mixing priority and readiness — one sentence per option, plus the recommended model for each.
3. **Offer the copy-paste line:**

   ```
   /clear then /task <NEXT-ID>
   ```

   You cannot run `/clear` yourself; the line is for the user.

## Notes

- **Sub-tasks of an epic** (`<AREA>-<NUMBER>.<SUB>`) follow the same flow. The parent epic line in PLAN.md is not flipped to complete until all children are.
- **Skip-the-tasknote cases** (single-line typo, formatting tweak, ~10-line doc patch, trivial config edit) — see SPEC §"When to use a tasknote (and when not to)". For these, decline to scaffold and tell the user to make the edit directly.
- **Date format:** always use `YYYY-MM-DD` for `Completed` and `Archived` fields.
