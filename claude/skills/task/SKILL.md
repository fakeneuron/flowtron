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

## Step 1.5 — Model gate (BEFORE scaffolding)

The model decision is made at filing time on the PLAN.md task line, not at scaffold time. Gate on it now, before reading source files or synthesizing the tasknote body — heavy thinking should never run on the wrong model.

Three cases (decide via the `[model]` segment captured in Step 1):

- **PLAN.md `[model]` matches the active model** → proceed silently to Step 2.
- **PLAN.md `[model]` differs from the active model** → STOP. Surface the mismatch and offer two paths via AskUserQuestion:
  1. "Switch active model: I'll stop. Run `/model <PLAN-model>` then re-invoke `/task <TASK-ID>`." (recommended — preserves the filed assignment)
  2. "Retag the PLAN.md line to `<active-model>` and proceed." If chosen, edit the PLAN.md line's `[model]` segment in place, then proceed to Step 2.
  Do not silently override.
- **PLAN.md `[model]` is absent (legacy entry, no `[model]` on the line)** → ask the user via AskUserQuestion to choose `opus` or `sonnet` (default recommendation: `opus` for design / multi-file / ambiguous work; `sonnet` for mechanical work with a clear diff in mind). Then write `[<chosen>]` into the PLAN.md line in place (insert immediately after `**TASK-ID**`), then proceed to Step 2. The next time `/task` runs against this line, no question is asked.

The active model is whatever the assistant is currently running as (visible in the runtime; if uncertain, ask the user). See SPEC §"Model field" for the full contract.

## Step 2 — Pre-flight checks

- Resolve the **Area** from the ID prefix using SPEC §"Task ID convention":
  - `CORE-` → core, `BE-` → backend, `FE-` → frontend, `DB-` → database, `DEPLOY-` → deployment, `TEST-` → testing
  - Unknown prefix: read `_project/tasknote/README.md` for project-specific prefixes. If still unresolved, stop and ask.
- If `_project/tasknote/<TASK-ID>.md` already exists: stop. Tell the user the tasknote exists and recommend they continue conversationally (e.g., "continue CORE-004") rather than restarting. This skill is start-only by design.
- If `_project/tasknote/archive/<area>/<TASK-ID>.md` already exists: stop. The task is already closed and archived. Surface the conflict and ask whether the user meant a different task ID — do not scaffold a duplicate.

## Step 3 — Scaffold the tasknote

Copy the template to `_project/tasknote/<TASK-ID>.md` and fill the YAML frontmatter and the H1.

**YAML frontmatter** (the `---` block at file top):

- `title:` — concise one-line title. Prefer the PLAN.md `| shortname` (Step 1) when present; otherwise derive from the long description (may shorten; keep it scannable).
- `status:` — `in-progress` (kebab-case; valid values: `not-started | in-progress | blocked | completed`)
- `priority:` — the section heading from Step 1, title-case (`Critical | High | Medium | Low | Future Opportunities`)
- `area:` — resolved in Step 2, lowercase (e.g., `core`, `backend`, `frontend`); matches the archive subfolder name
- `tags:` — leave as `[]` unless the user supplies tags at scaffold time
- `created:` — today's date in `YYYY-MM-DD`
- `due:` — leave empty unless the user supplies a deadline at scaffold time
- `related-tasks:` — leave as `[]` unless the PLAN.md line cites parent epics, predecessors, or follow-ups (e.g., `[CORE-018, CORE-019]`)

> Note: the model is NOT in the frontmatter (retired in flowtron v0.2.0 — the `[model]` segment on the PLAN.md task line is the source of truth, gated in Step 1.5).

**Body** (spec-on-top + log-below shape; see SPEC §"Tasknote body shape" for rationale):

- H1: `# <TASK-ID> | <title>` — match the frontmatter `title:` exactly
- **Nav header** — single line directly under the H1: `[← PLAN.md](../PLAN.md) · 🟢 In progress · 🔗 [[RELATED-1]] [[RELATED-2]]`
  - Status icon mirrors YAML `status:` — `🟢 In progress` at scaffold (other values: `⚪ Not started`, `⏸ Blocked`, `✅ Completed`). Updated at Phase 4 closure to match the YAML flip.
  - Wikilink chips after `🔗` mirror `related-tasks:` from the YAML frontmatter (one wikilink per ID). If `related-tasks: []`, drop the `· 🔗 ...` segment entirely.
- `## 🎯 Goal` — one-sentence goal derived from the PLAN.md line. If the line is too terse to support a clear goal, ask the user before scaffolding.
- `## ✅ Acceptance` — empty checklist at scaffold (`- [ ] Criterion 1` / `- [ ] Criterion 2`). Populated during Phase 1 Discovery as the user clarifies what "done" looks like.
- `## 🧩 Subtasks` — empty checklist at scaffold. Populated during Phase 1 Discovery with concrete, ordered steps (this section replaces the old Phase-1-internal "Execution Steps" block).
- `## 🔗 Related` — bullet list mirroring `related-tasks:` from the YAML frontmatter, one bullet per ID with short context (e.g., `- [[CORE-017]] — frontmatter (predecessor)`). If `related-tasks: []`, write `- (none)`.
- `---` divider, then the four phase sections (`📝 Phase 1: Discovery`, `🛠️ Phase 2: Execution`, `🧪 Phase 3: Testing & Linting`, `🚀 Phase 4: Closure`) — leave the phase checklists exactly as the template ships them.

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

After the user confirms the recap, the post-closure motion is **one continuous flow** — commit, suggest the next move, and offer the copy-paste line. The user's commit-go (e.g. "commit", "go", "yes") is the *only* gate; once the commit lands, steps 2 and 3 follow **in the same response as the commit confirmation**, even if the user's reply was terse or only named the commit step. Do not wait for them to prompt the next-task suggestion.

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
