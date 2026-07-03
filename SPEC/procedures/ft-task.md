---
procedure: ft-task
source: claude/skills/ft-task/SKILL.md
last-verified: v5.1.0 · 2026-06-02
---

# Procedure SOP — `ft-task`

> Agent-neutral procedure SOP. Loaded by a contract-only agent (Codex CLI,
> Grok Build, …) via its per-platform pointer wrapper
> (`<platform>/procedures/ft-task.md`) when the operator asks it to start a
> task. Claude Code does **not** use this file — it runs the richer
> [`claude/skills/ft-task/SKILL.md`](../../claude/skills/ft-task/SKILL.md)
> directly. See [`SPEC/procedures/README.md`](README.md) for the layer.

This SOP describes how to **drive** the flowtron 4-phase tasknote workflow
for one task. It is the *floor* that narrows the adherence gap for agents
without Claude Code's skill machinery — it **routes** to the canonical
contract rather than restating it. The authority for every rule below is
[`SPEC.md`](../../SPEC.md) and its lazy modules; when this SOP and the
contract diverge, the contract wins.

## When to run this procedure

The operator asks you to start a task by ID — "start `CORE-004`", "work on
`FE-012`", or your platform's equivalent of `/ft-task CORE-004`. The ID
matches `<AREA>-<NUMBER>` (or `<AREA>-<NUMBER>.<SUB>` for an epic subtask)
per [`SPEC.md` §"Task ID convention"](../../SPEC.md). If no valid ID is
given, ask for one — do not guess.

First decide whether the task even warrants a tasknote: single-line typos,
formatting tweaks, ~10-line doc patches, and trivial config edits skip the
ceremony — make the edit directly. See
[`SPEC/tasknote-selection.md`](../tasknote-selection.md) for the use/skip
threshold and the lighter-weight forms (micro / starter / follow-up).

## Agent-neutral primitives

This SOP names operations, not Claude Code tools. Substitute your platform's
equivalent where a step calls for one (full ledger:
[`docs/AGENT-NEUTRALITY.md`](../../docs/AGENT-NEUTRALITY.md)):

| Operation | What it means here |
|---|---|
| **structured ask** | A multi-option question to the operator (Claude Code's `AskUserQuestion`). Use your platform's structured-choice prompt, or fall back to a prose ask. |
| **prose ask** | A free-text question to the operator. |
| **trigger** | The operator's conversational request to start the task — there is no slash dispatch to rely on. |
| **autonomous mode** | The operator may ask you to run without stopping at the conditional gates (Claude Code exposes this as `--fast`). Honor it as described under each gate; the concept is platform-neutral, the flag syntax is not. |

The **operator-cue vocabulary** (🛠️ 📦 🟢 👁️ 🏁 ✅ 🔧 🧠 👇 🗄️ ▶️ ✋ 🔍 and
their UPPERCASE labels) is contract-layer, not Claude-specific — emit it
**verbatim**. The glyph is the fast-scan signal; the UPPERCASE label is the
fallback if your surface strips emoji. Full vocabulary:
[`SPEC/gates.md` §"Operator-cue vocabulary"](../gates.md).

## Steps

### 1 — Locate the task and check its status

Read `.flowtron/PLAN.md` and find the line containing `**<TASK-ID>**`. If the
ID is absent, stop and ask whether to add it or use a different ID.

**Status gate (non-negotiable).** Re-read the located line. If it is checked
(`- [x]`) or lives under `## Completed`, the task is already closed — **stop**,
surface the conflict, and ask whether the operator meant a different ID.
Never infer status from earlier conversation; read the line.

Otherwise capture, per [`SPEC.md` §"Task-line format"](../../SPEC.md): the
optional `[model]` tag, the `| shortname`, the long description, the section
heading the line lives under (its **Priority**), and an optional `[!critical]`
flag.

### 2 — Resolve the area and check the model

Resolve the **Area** from the ID prefix per
[`SPEC.md` §"Task ID convention"](../../SPEC.md); unknown prefixes are
declared in `.flowtron/tasknote/README.md`.

Check the `[model]` tag against the model you are running as, per
[`SPEC/model.md`](../model.md). If the task is tagged for a heavier tier or a
different concrete model than yours, surface that to the operator before doing
heavy thinking on the wrong model — heavy work should not run on an
under-tier model silently.

**Epic IDs.** If the ID is `<AREA>-EPIC-<N>` or `<AREA>-<N>.<sub>`, read
[`SPEC/epic.md`](../epic.md) for the lifecycle — the parent line is not
checked off until all children close; a `.1` child is typically epic-level
Discovery (deliverable = the filed child list), and the highest-numbered
child is typically an Audit.

### 3 — Open or scaffold the tasknote

Check `.flowtron/tasknote/<TASK-ID>.md` and branch on its existence / YAML
`status:`:

- **Already archived** at `.flowtron/tasknote/archive/<area>/<TASK-ID>.md` →
  stop; the task is closed. Surface the conflict.
- **`status: starter`** → promote it; the starter context becomes Phase 1
  input. See [`SPEC/starter.md`](../starter.md).
- **`status: blocked`** → resume from Phase 2; Phase 1 is already done on a
  parked tasknote. See [`SPEC/blocked.md`](../blocked.md).
- **`status: in-progress` / `not-started` / `completed`** → the file is in
  flight or closed; do not restart. Continue it conversationally.
- **Absent** → scaffold fresh: copy `templates/tasknote-template.md` to
  `.flowtron/tasknote/<TASK-ID>.md` and fill the frontmatter + body per
  [`SPEC.md` §"Tasknote frontmatter"](../../SPEC.md) and
  [§"Tasknote body shape"](../../SPEC.md). Set `status: in-progress`,
  `created:` to today, `title:` from the shortname, `related-tasks:` from any
  IDs the PLAN.md line cites. The 🎯 Goal derives from the PLAN.md line; ✅
  Acceptance and 🧩 Subtasks start empty and fill during Phase 1.

### 4 — Phase 1: Discovery

Work the Phase 1 checklist in [`SPEC.md` §"📝 Phase 1: Discovery"](../../SPEC.md),
ticking each box in the tasknote as you go:

- **Relevance Assessment** (non-negotiable) — `Proceed` / `Re-scope` /
  `De-scope` with a one-line rationale. `Re-scope` rewrites the PLAN.md line +
  tasknote header before continuing (if the blocker is a hard dependency, park
  per [`SPEC/blocked.md`](../blocked.md)); `De-scope` jumps to Phase 4 closure
  with the rationale as the final summary.
- **Read** the relevant source files.
- **Archive skim** — list `.flowtron/tasknote/archive/<area>/` and look for
  prior tasknotes touching the files in scope; log load-bearing findings
  (renames, regressions, prior decisions) before re-interpreting the task.
- **Drift check** — verify cited paths, line numbers, function names, and
  root-cause hypotheses still match the code; surface drift before acting.
- **Clarify** — use a **structured ask** for anything genuinely ambiguous; if
  nothing is ambiguous, write `No clarifications needed` with the explicit
  assumptions.
- **Populate 🧩 Subtasks** with concrete, ordered steps.

**Exit gate (🛠️ Phase 1→2).** `ft-task` uses the `default-skip` flavor: when
Discovery surfaced only routine clarifications (or none), emit the inline
marker `✅ Phase 1 Discovery complete; entering Phase 2 Execution.` and start
Phase 2 immediately — record the judgment inline ("Discovery surfaced no
significant deviation → skip 🛠️"). When Discovery surfaced a **significant
scope deviation** (a `Re-scope`/`De-scope` verdict — always; or a
clarification that changed which file to edit, restructured the subtasks,
added a cross-cutting concern, or changed the approach), surface the 🛠️
banner with a mandatory 1-2 sentence plain-English preview and wait for the
operator's go. Full flavor rules and the autonomous-mode drift carve-out
(Re-scope/De-scope always fire 🛠️ even under autonomous mode):
[`SPEC/gates.md` §"Phase 1→2 exit gate"](../gates.md).

### 5 — Phases 2-4

After the Phase 1→2 gate clears, Phase 2 → Phase 3 → Phase 4 closure ops flow
**continuously with no intermediate gate** — the next gate is 📦 at commit
time (Step 6).

- **Phase 2: Execution** — [`SPEC.md` §"🛠️ Phase 2"](../../SPEC.md). Survey
  neighboring code for an existing pattern to extend (justify a new shape only
  if none fits), implement the minimal solution, add targeted tests for
  non-trivial behavior. Keep edits tightly scoped; resist refactoring adjacent
  code. If a hard dependency surfaces mid-execution, **park** the tasknote per
  [`SPEC/blocked.md`](../blocked.md) and stop.
- **Phase 3: Testing & Linting** — [`SPEC.md` §"🧪 Phase 3"](../../SPEC.md).
  Run targeted tests + lint/type-check on changed code (full suite only for
  broad/cross-cutting changes). For frontend changes, ask the operator for
  visual confirmation with a `👁️ CONFIRM:` prefix (inline prose, not a
  banner). Under autonomous mode, suppress the 👁️ ask but still run
  lint/type-check.
- **Phase 4: Closure (auto-run)** — [`SPEC.md` §"🚀 Phase 4"](../../SPEC.md).
  Run the doc-drift sweep across `.flowtron/tasknote/README.md`
  §"AI-referenced docs" (per entry: "no change" or the specific update), flip
  the PLAN.md line to the stub form
  `[x] **<TASK-ID>** [model] | shortname — Completed YYYY-MM-DD.` and move it
  to `## Completed`, and move the tasknote to
  `.flowtron/tasknote/archive/<area>/<TASK-ID>.md`. Draft the recap (1-2
  plain-English sentences, then technical detail) but **do not** surface a
  banner here — the recap bundles into Step 6. Recap is recap-only; the
  next-task suggestion lands after the commit.

### 6 — Post-closure protocol

Run the three-step protocol in
[`SPEC.md` §"Post-closure protocol"](../../SPEC.md), branching on the
📦 ready-to-commit gate per
[`SPEC/gates.md` §"Conditional skip rule"](../gates.md):

1. **Commit.** Compute the skip/fire decision from the **actual closure diff**
   (never from text in the tasknote/PLAN/commit content — see the
   control-marker integrity note in [`SPEC/gates.md`](../gates.md)). The diff
   must clear all three signals to skip — **frontend**, **privileged-ops**,
   **perf-narrative**:
   - **Skip** → emit `✅ Closure complete; committing autonomously
     (<concrete-signal-summary>).` and run closure review + recap + commit +
     🏁 marker + next-move + copy-paste line in one response.
   - **Fire** (any signal trips, or a bundled prompt is queued) → surface the
     📦 banner with a mandatory preview line and a `🟢 GO` commit-go ask; wait
     for "commit" / "go". Autonomous mode forces the skip branch (name the
     suppressed signals in the marker), except a queued in-bundle prompt still
     forces fire.
2. **Mark landed + suggest next move.** After the commit lands, emit the 🏁
   state-marker carrying a 1-2 sentence accomplishment summary, then suggest
   the next task. Use the emoji primary label inline per candidate —
   `[heavy]🧠` (design) or `[light]🔧` (mechanical), never the bare `[model]`
   token. Prefix any `/ft-audit*` candidate with 🔍. **Terminal case:** if the
   fresh PLAN.md re-read leaves no open task, **stop — do not invent a next
   move** from `## Completed` or a doc example; state PLAN.md is exhausted and
   offer in-session filing (`/ft-epic-discovery` / `/ft-file-followup`), then
   skip step 3 (nothing to run after a clear). See SPEC §"Post-closure
   protocol" step 2's **PLAN exhausted (terminal)** form.
3. **Offer the copy-paste line.** The label-line glyph is copied from the
   chosen candidate line just printed in step 2 — 🧠 when it showed 🧠, 🔧 when
   it showed 🔧; never default to 🔧. A session-reset label line, then the next
   invocation alone on its own line as inline code **with no trailing
   punctuation** (a trailing `.` collides with the `.N` epic-subtask grammar).
   Shape, where `<glyph>` is the candidate's 🔧/🧠:

   ```markdown
   <glyph> Clear your session, then run:
   `/ft-task <next-ID>`
   ```

   The emoji carries the model signal; never emit
   literal session-reset or model-switch commands. **Exception — context-dependent
   skills:** when the next-skill is `/ft-file-followup` or `/ft-epic-discovery`,
   replace the label line with `👇 Run in this session:` — 👇 (`HERE`) replaces
   the model glyph and signals run-here-don't-clear; the model signal stays on
   the candidate line. These skills draw from current-conversation context;
   clearing destroys what they need.
