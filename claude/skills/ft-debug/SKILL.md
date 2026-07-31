---
name: ft-debug
description: Start a hypothesis-first debugging tasknote for the given task ID and drive it through the SPEC's 4-phase workflow. Use when the user asks to debug a bug or issue with a structured hypothesis-first tasknote. The skill injects structured prompts for expected vs observed behavior, hypothesis generation, and minimal repro design inside the standard Phase 1 Discovery. Uses `templates/tasknote-template.md`. Soft pragmatic tone throughout. Invoke with the task ID as args (e.g., args="CORE-042" or "CORE-195.2 --fast").
---

# debug — hypothesis-first debugging tasknote runner

You are starting a **debugging tasknote** for the task ID provided in `args`. The full workflow contract lives in flowtron's `SPEC.md` — this skill is the executable interpretation with debug-specific scaffolding *inside* the standard 4-phase flow. Treat SPEC.md as authoritative when this file is silent or in tension.

The value prop is simple: bugs and "unexpected behavior" investigations benefit from explicit structure (expected vs observed, ranked hypotheses, smallest possible repro) so the operator (and future readers) can see the thinking, not just the fix. All of it lives in a normal tasknote using `templates/tasknote-template.md`. No custom template, no replacement phases, no new gate banners.

This skill supports the same invocation and flags as `/ft-task`:
- `/ft-debug <TASK-ID>`
- `/ft-debug <TASK-ID> --fast` (or `-f`)

A trailing `--fast` / `-f` is the only other accepted token after the ID.

## Step 0 — Resolve paths + fast-mode (same as /ft-task)

Two layouts. Pick by which file exists:

- **Adopter project:** `.flowtron/core/SPEC.md` exists → `<root>` = `.flowtron/core/`.
- **Flowtron self-host:** repo-root `SPEC.md` with heading `# Flowtron — Workflow Specification` → `<root>` = repo-root.

If neither matches, bail.

Paths this skill uses:
- SPEC: `<root>SPEC.md` (always loaded core)
- SPEC_DIR (lazy modules `epic.md` · `starter.md` · `blocked.md` · `model.md` · `versioning.md`): `<root>SPEC/`
- SKILL_DIR: `<root>claude/skills/ft-debug/` (no private fragments in v1; falls back to same mental model as ft-task)
- Template: `<root>templates/tasknote-template.md`
- PLAN: `.flowtron/PLAN.md`, tasknote dir: `.flowtron/tasknote/` (always)

**Parse `args`.** Split on whitespace into `(TASK-ID, rest...)`. Branch on `rest`:

- **Empty** → set internal flag `fast-mode = false` and continue to Step 1.
- **`--fast` or `-f`** → set `fast-mode = true`. Emit exactly one inline marker after path resolution: `⚡ --fast active — 👁️ frontend ask and 📦 signal trips suppressed; Re-scope/De-scope still fires 🛠️ (🛠️ banner is no-op for routine trips under default-skip flavor).` Continue to Step 1.
- **Any other trailing arg** → surface a one-line usage notice and ask via AskUserQuestion whether the user meant `--fast`, the default flow, or to abort. Do not proceed silently.

`fast-mode` semantics are identical to `/ft-task`. See `claude/skills/ft-task/SKILL.md` Step 0 for the full contract and operator-gate cue details.

## Step 1 — Locate the task in PLAN.md (identical to /ft-task)

Read PLAN.md. Find the line containing `**<TASK-ID>**`. Status gate, model capture, shortname, priority, filing-discipline word-count warning — all exactly as `/ft-task` Step 1.

## Step 1.5 — Model gate (identical to /ft-task)

Gate on the `[model]` segment before scaffolding. Read `SPEC/model.md` + `claude/skills/ft-task/step-1.5-model-edge.md` on mismatch or legacy entry. Same two-path AskUserQuestion. No silent overrides.

## Step 2 — Pre-flight checks & file-state branch (identical to /ft-task)

Includes the **foreign-dirt gate** (`git status --porcelain` hard stop) per SPEC §"Paper-complete guard" — same as `/ft-task` Step 2.

Resolve Area, epic-ID dispatch (read `SPEC/epic.md` for `<AREA>-<N>.<sub>`), archive vs active tasknote checks, four-way status branch (starter / blocked / in-flight / fresh). Same routing to 3a/3b/3c.

## Step 3a / 3b / 3c — Promote, Scaffold, Resume (identical to /ft-task)

- Starter promotion: read `SPEC/starter.md` + the promote fragment if present.
- Fresh scaffold: copy `templates/tasknote-template.md` to `.flowtron/tasknote/<TASK-ID>.md`, fill title from shortname or description, status `in-progress`, created date, related-tasks from context (parent epic for children), leave checklists empty for Phase 1 population.
- Blocked resume: read `SPEC/blocked.md` + resume fragment.

All mechanics identical. The debug flavor appears in the *content* the operator records during Phase 1, not in the scaffolding shape.

## Step 4 — Phase 1: Discovery (standard checklist + hypothesis-first cadence)

Work through the Phase 1 checklist in the scaffolded tasknote **exactly as `/ft-task` does** (tick boxes, archive skim via `ls` + `grep -l`, drift check, AskUserQuestion for genuine ambiguity, populate 🧩 Subtasks, Relevance Assessment with default-skip exit gate judgment).

**Debug-specific scaffolding (do this after "Reviewed the task entry" and Relevance Assessment, before or alongside the normal archive/drift steps):**

Surface these prompts conversationally. Record the operator's answers clearly in **Discovery Notes** (use a "Debug Log" subsection if it grows long). The goal is a persistent, scannable record of the thinking that led to the fix.

1. **Expected vs Observed**
   - What was the *expected* behavior (per spec, prior run, user report, mental model)?
   - What is the *exact observed* behavior (error message, wrong value, timing, environment, frequency, "works on my machine" differences)?
   - Quote or link the concrete evidence (log lines, screenshots, stack traces, reproduction commands). Be precise — "it crashes" is not enough.

2. **Hypotheses (generate & rank)**
   - List 2–5 plausible root causes.
   - For each: one-line rationale + rough confidence (High / Medium / Low) + what would falsify it.
   - Rank them. The top hypothesis becomes the primary target for the minimal repro and the Phase 2 fix.

3. **Minimal repro design**
   - Design the *smallest* sequence of actions, inputs, or state that reliably triggers the symptom.
   - Constraints: runnable in < 2 minutes, isolates the variable under test, no unrelated setup.
   - Write the repro steps explicitly (numbered). If it requires a specific build or data set, note the minimal viable one.

4. **Run the repro + update beliefs**
   - Execute the minimal repro.
   - Record outcome: still fails (same symptom) / fails differently / now passes (or expected behavior holds).
   - Update the hypothesis list with new evidence. If the top hypothesis is falsified, promote the next and design a new minimal repro if needed.
   - Only when a hypothesis survives a clean minimal repro do you have a stable target for code changes.

These four prompts are guidance, not a gate. The operator can skip or shorthand any of them. The value is the written record for the operator's future self and for anyone who later audits "why did we make this change?"

After the debug prompts, continue with the normal Phase 1 items (archive skim, drift check, clarifying questions, subtasks population). Apply the normal `default-skip` exit gate judgment. Emit the inline skip marker when appropriate.

**When `fast-mode = true`:** write the four debug prompts + the operator's answers (or "operator asserted no formal hypotheses captured in this run") directly into Discovery Notes without extra AskUserQuestion pauses.

## Step 5 — Phase 2: Execution (debug emphasis)

Pattern survey first (neighboring code, similar bug fixes in the archive, recent changes to the suspect area); check DRY and responsibility boundaries, and prefer composition when it reduces coupling.

Then **minimal implementation**:
- Target the *top surviving hypothesis* from Phase 1.
- Make the smallest edit that would falsify or confirm it.
- In **Implementation Notes**, explicitly state: "Addresses hypothesis #N: <one-line>. Rationale for minimal scope: <why this change is the smallest that tests the hypothesis>."

If the change is larger than a one-line hypothesis test, justify it (cross-cutting concern, safety, etc.). Refactor only when the Acceptance or the touched path's duplication, responsibility, or dependency boundary requires it; record the reason and defer unrelated cleanup.

If a hard dependency surfaces mid-execution, read `SPEC/blocked.md` and park the tasknote (status: blocked) exactly as `/ft-task` does.

## Step 6 — Phase 3: Testing & Linting (debug emphasis)

- Targeted tests for changed code.
- Lint / type-check on changed files.
- The canonical structural quality assertions for changed code (otherwise `N/A` with reason).
- No automatic 👁️ visual confirmation ask (this skill is methodology-agnostic; the operator owns any UI / manual repro steps). When `fast-mode = true`, same suppression as ft-task.

**Critical debug addition (always run, even under --fast):**
- Re-execute the *exact minimal repro* recorded in Phase 1.
- Record the outcome in **Testing Notes**: "Minimal repro re-run after fix: <passes / still fails with X / different symptom>".
- The task is only complete when the minimal repro no longer exhibits the original symptom (or the documented expected behavior now holds cleanly).
- If the repro still fails, treat it as new evidence: return to Phase 2 with updated hypotheses rather than declaring victory.

## Step 7 — Phase 4: Closure + Post-closure (identical to /ft-task)

Doc-drift sweep across the AI-referenced docs in `.flowtron/tasknote/README.md`, flip **only this task's** PLAN.md line to the stub `Completed YYYY-MM-DD.` form and move the tasknote to `archive/<area>/` only when deliverables are ready for the same atomic commit (SPEC §"Paper-complete guard"), draft the evidence-based recap (1-2 sentence plain-English summary first, then paths/LOC where meaningful, verification results, refactors made or deferred with rationale, documentation verdict, maintainability effect, and a verification request), then the conditional skip / 📦 gate logic, commit with deliverable-covering SHA check before 🏁, next-move suggestions, and copy-paste cue — all exactly as `/ft-task` Step 5 / Step 6.

The recap should mention the top hypothesis that was ultimately addressed and whether the minimal repro now passes.

## Notes

- **Relationship to /ft-task:** This is a specialized driver, not a fork. 90% of the flow (scaffolding, gates, fast-mode, epic children, blocked handling, closure) is identical. The only additions are the four explicit debug prompts in Phase 1 and the re-verify obligation in Phase 3. Operators who know `/ft-task` will feel at home immediately.

- **When to reach for /ft-debug vs /ft-task:**
  - Use `/ft-debug` for bugs, regressions, "it used to work", flaky behavior, "why does X happen only under Y".
  - Use `/ft-task` (or micro) for straightforward feature work, refactors with a clear diff, or when the root cause is already obvious and the work is "implement the fix."

- **Tone contract (per CORE-EPIC-195):** Soft, pragmatic, supportive. Phrases like "this prompt helps surface hidden assumptions" or "the record is for your future self" — never "you must follow the Iron Law of Debugging or the session is invalid." The methodology is a tool, not a religion.

- **No new operator-gate cues:** The standard 🛠️ / 📦 / 🏁 cues apply unchanged. Hypothesis tracking does not create extra banners.

- **Epic children:** Fully supported. Debugging an epic child (e.g. `CORE-195.3`) works the same as any other ID.

- **Future evolution:** If the debug flow accumulates reusable fragments (e.g. a standard "Debug Log" subsection template, or a hypothesis-ranking helper), later children can add `step-*.md` files under this directory and load them from SKILL_DIR. v1 keeps the surface minimal — all guidance lives inline in this SKILL.md.

- **Cross-references (after sibling children land):** See `SPEC/tasknote-selection.md` §"When to use a tasknote (and when not to)" for the official positioning bullet, `claude/skills/ft-flowtron/SKILL.md` for the roster entry, and `docs/MIGRATION.md` §1.2 for the per-project symlink count.

- **Standalone safety:** This SKILL is designed to be invoked directly. It does not require any other ft- skill to be present beyond the shared SPEC + template surface.
