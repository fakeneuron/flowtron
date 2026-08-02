# Debug mode — hypothesis-first scaffolding (executable steps)

> Lazy-loaded SKILL fragment. Loaded by `task` SKILL.md Step 0 when `--debug` / `-d` is present in `args`. Carries the whole of debug mode: the four Phase 1 prompts (§Phase 1 below), the Phase 2 emphasis, and the Phase 3 re-verify obligation. See `claude/skills/ft-task/SKILL.md` for the always-loaded core flow, and `SPEC/tasknote-selection.md` §"When to use a tasknote (and when not to)" for when to reach for debug mode at all.

Debug mode adds **content**, never mechanics. Scaffolding, the model gate, operator-gate cues, epic children, blocked handling, closure, and the post-closure protocol are byte-identical to a normal `/ft-task` run. Nothing in this fragment creates a new phase, template, banner, or gate.

The value prop is simple: bugs and "unexpected behavior" investigations benefit from explicit structure — expected vs observed, ranked hypotheses, smallest possible repro — so the operator (and future readers) can see the thinking, not just the fix. All of it lives in a normal tasknote using `templates/tasknote-template.md`.

**Tone contract (inherited from CORE-EPIC-195).** Soft, pragmatic, supportive. Phrases like "this prompt helps surface hidden assumptions" or "the record is for your future self" — never "you must follow the Iron Law of Debugging or the session is invalid." The methodology is a tool, not a religion.

## Phase 1 — the four prompts (Step 4)

Run these **after** "Reviewed the task entry" and the Relevance Assessment, before or alongside the normal archive-skim / drift-check steps. Surface them conversationally and record the operator's answers in **Discovery Notes** (use a `**Debug Log:**` subsection if it grows long). The goal is a persistent, scannable record of the thinking that led to the fix.

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

These four prompts are **guidance, not a gate**. The operator can skip or shorthand any of them. The value is the written record for the operator's future self and for anyone who later audits "why did we make this change?"

Then continue with the normal Phase 1 items (archive skim, drift check, clarifying questions, Subtasks population) and apply the standard `default-skip` exit-gate judgment unchanged.

**When `fast-mode = true`:** write the four prompts and the operator's answers (or "operator asserted no formal hypotheses captured in this run") directly into Discovery Notes without extra AskUserQuestion pauses.

## Phase 2 — emphasis (Step 5)

Pattern survey first, as always — with debug-specific weight on similar bug fixes in the archive and recent changes to the suspect area.

Then **minimal implementation**:

- Target the *top surviving hypothesis* from Phase 1.
- Make the smallest edit that would falsify or confirm it.
- In **Implementation Notes**, explicitly state: `Addresses hypothesis #N: <one-line>. Rationale for minimal scope: <why this change is the smallest that tests the hypothesis>.`

If the change is larger than a one-line hypothesis test, justify it (cross-cutting concern, safety, etc.). The Minimal Refactor Gate applies unchanged.

## Phase 3 — repro re-verify (Step 5)

**Always run, even under `--fast`.** This is debug mode's one non-negotiable addition, and the reason the mode is worth a flag:

- Re-execute the *exact minimal repro* recorded in Phase 1.
- Record the outcome in **Testing Notes**: `Minimal repro re-run after fix: <passes / still fails with X / different symptom>`.
- The task is only complete when the minimal repro no longer exhibits the original symptom (or the documented expected behavior now holds cleanly).
- If the repro still fails, treat it as new evidence: return to Phase 2 with updated hypotheses rather than declaring victory.

`--fast` suppresses the 👁️ visual-confirmation ask exactly as it does on a normal run; it does **not** suppress the repro re-verify. A fast debug run still has to prove the symptom is gone.

## Phase 4 — recap addition

The evidence-based recap should name the top hypothesis that was ultimately addressed and state whether the minimal repro now passes. Everything else in closure and the post-closure protocol is unchanged.
