---
procedure: ft-task
source: claude/skills/ft-task/ templates/tasknote-template.md
restates: SPEC.md
last-verified: v5.19.0 · 2026-08-25
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

If the operator additionally asks you to work a bug, regression, or other
unexpected behavior whose root cause is unknown, they may request **debug
mode** — see the primitives table below. It is a full tasknote either way; the
mode only changes what Phases 1–4 record.

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
| **debug mode** | The operator may ask you to drive the task hypothesis-first because the root cause is not yet known (Claude Code exposes this as `--debug`). **Explicit opt-in only** — never infer it from a bug-shaped task description. It adds *content* to Phases 1–4 and no mechanics: no new phase, template, banner, or gate. See Step 4 and Step 5. |

Autonomous mode and debug mode are **orthogonal and compose**: a run can be
both, in which case the hypothesis scaffolding is written without stopping to
ask, and the Phase 3 repro re-verify still runs (it is not a gate autonomous
mode may suppress).

The **operator-cue vocabulary** (🛠️ 📦 🟢 👁️ 🏁 ✅ 🔧 🧩 🧠 👇 🗄️ ▶️ 📡 💻 ✋ 🔍 and
their UPPERCASE labels) is contract-layer, not Claude-specific — emit it
**verbatim**. The glyph is the fast-scan signal; the UPPERCASE label is the
fallback if your surface strips emoji. Full vocabulary:
[`SPEC/gates.md` §"Operator-cue vocabulary"](../gates.md).

Before skipping a gate, read [`SPEC/gates.md` §"Rationalizations"](../gates.md)
and [§"Red Flags"](../gates.md) — the excuses that precede a skipped gate and
the observable symptoms that one already happened. They are advisory prose, not
a checklist, and they are aimed at exactly this layer: an agent driving the
gates conversationally rather than through enforced skill machinery.

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

**`## Completed`-rotation advisory.** While `PLAN.md` is open, count the
checked rows under `## Completed` (nested epic children included). Past
**150**, surface a one-line `⚠️` advisory naming the count and suggesting the
operator rotate older month blocks to `.flowtron/PLAN-ARCHIVE.md` — then
continue. Informational only; never block, never rotate on your own. Full
contract (the 100-row bound, month-block granularity, the never-split rules):
[`SPEC/tasknote-selection.md` §"`## Completed` rotation"](../tasknote-selection.md).

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

**Foreign-dirt gate (paper-complete guard).** Before any scaffold / promote /
resume writes, run `git status --porcelain`. If non-empty: **STOP**, surface
the dirt list, and ask the operator to commit / stash / discard themselves,
then re-invoke. Do not auto-clean. Full contract:
[`SPEC.md` §"Paper-complete guard"](../../SPEC.md).

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
  If the ID is an epic implementation child (not `.1` / `.N`), echo any
  `## 🌳 Fan-out` claim that names it into omit-when-absent `blocked-by:`
  / `parallel-safe-with:` so a worktree copy still sees the claim
  ([`SPEC/epic.md`](../epic.md) §"Fan-out").

### 4 — Phase 1: Discovery

Work the Phase 1 checklist in [`SPEC.md` §"📝 Phase 1: Discovery"](../../SPEC.md),
ticking each box in the tasknote as you go:

- **Relevance Assessment** (non-negotiable) — `Proceed` / `Re-scope` /
  `De-scope` with a one-line rationale. `Re-scope` rewrites the PLAN.md line +
  tasknote header before continuing (if the blocker is a hard dependency, park
  per [`SPEC/blocked.md`](../blocked.md)); `De-scope` jumps to Phase 4 closure
  with the rationale as the final summary.
- **Read** the relevant source files — when the read set is broad or its shape
  is unknown, consider isolating the search in a **probe**
  ([`templates/subagent-probe-template.md`](../../templates/subagent-probe-template.md))
  and recording only its distilled return in Discovery Notes. A probe owns no
  tasknote, never runs Phase 1, and never trips a gate; it answers one stated
  question and ends. Judgment prompt, not a gate — skipping it is always
  correct for a narrow read set. If your platform exposes no sub-agent
  primitive, see [`docs/PLATFORMS.md`](../../docs/PLATFORMS.md)
  §"Non-Claude capability triggers" for the second-session approximation.
- **Best Practices Review** — for code or module-boundary work, identify
  touched responsibilities, dependency direction, existing abstractions, nearby
  duplication, and any required in-scope refactor or deferred cleanup; otherwise
  record `N/A` with reason.
- **Archive skim** — list `.flowtron/tasknote/archive/<area>/` and look for
  prior tasknotes touching the files in scope (if YAML `touches:` is set,
  prefer those paths); also open IDs named by `## 🔗 Related`, YAML
  `supersedes:`, and any ⚠️ `Superseded by` pointer on the hits — still
  grep + read, no query engine; log load-bearing findings (renames,
  regressions, prior decisions) before re-interpreting the task.
- **Drift check** — verify cited paths, line numbers, function names, and
  root-cause hypotheses still match the code, **and** cross-reference the plan
  you are forming against its `PLAN.md` line and the SPEC contracts it touches
  (read them, don't recall them); surface drift before acting.
- **Clarify** — use a **structured ask** for anything genuinely ambiguous; if
  nothing is ambiguous, write `No clarifications needed` with the explicit
  assumptions.
- **Populate 🧩 Subtasks** with concrete, ordered steps.

**Under debug mode**, work four extra prompts *inside* this checklist —
after the Relevance Assessment, alongside the archive skim and drift check.
They add no box and no gate, and they leave the exit-gate judgment below
unchanged. Record the answers in **Discovery Notes**:

1. **Expected vs observed** — what the behavior should be (per spec, prior
   run, user report) and the *exact* observed behavior, with concrete evidence
   quoted or linked. "It crashes" is not enough.
2. **Hypotheses** — 2–5 plausible root causes, each with a one-line rationale,
   rough confidence, and what would falsify it. Rank them; the top one is the
   target.
3. **Minimal repro** — the smallest sequence of actions, inputs, or state that
   reliably triggers the symptom. Runnable in under two minutes, isolating one
   variable, written out as numbered steps.
4. **Run it and update beliefs** — execute the repro, record the outcome, and
   revise the ranking. Only a hypothesis that survives a clean minimal repro is
   a stable target for code changes.

These are guidance, not a gate — the operator may skip or shorthand any of
them; the value is the written record. Under autonomous mode, write the prompts
and answers straight into Discovery Notes without pausing to ask. Full detail:
[`claude/skills/ft-task/step-4-debug-mode.md`](../../claude/skills/ft-task/step-4-debug-mode.md)
(the mode's canonical text — the Claude wiring reads the same file).

**Exit gate (🛠️ Phase 1→2).** `ft-task` uses the `default-skip` flavor: when
Discovery surfaced only routine clarifications (or none), emit the inline
marker `✅ Phase 1 Discovery complete; entering Phase 2 Execution.` and start
Phase 2 immediately — record the judgment inline ("Discovery surfaced no
significant deviation → skip 🛠️"). When Discovery surfaced a **significant
scope deviation** (a `Re-scope`/`De-scope` verdict — always; or a
clarification that changed which file to edit, restructured the subtasks,
added a cross-cutting concern, or changed the approach), surface the 🛠️
banner with a mandatory 1-2 sentence plain-English preview and wait for the
operator's go (conversational assent —
[`SPEC/gates.md` §"Accepted gate replies"](../gates.md)). Full flavor rules
and the autonomous-mode drift carve-out (Re-scope/De-scope always fire 🛠️
even under autonomous mode):
[`SPEC/gates.md` §"Phase 1→2 exit gate"](../gates.md).

### 5 — Phases 2-4

After the Phase 1→2 gate clears, Phase 2 → Phase 3 → Phase 4 closure ops flow
**continuously with no intermediate gate** — the next gate is 📦 at commit
time (Step 6).

- **Phase 2: Execution** — [`SPEC.md` §"🛠️ Phase 2"](../../SPEC.md). Survey
  neighboring code for an existing pattern to extend (justify a new shape only
  if none fits), check DRY and single-responsibility boundaries, and prefer
  composition when it reduces coupling. Implement the minimal solution; make a
  refactor only when Acceptance requires it or the touched path would otherwise
  introduce duplication, obscure responsibility, or violate a dependency
  boundary; record the reason and defer unrelated cleanup. Add targeted tests
  for non-trivial behavior. If a hard dependency surfaces mid-execution,
  **park** the tasknote per [`SPEC/blocked.md`](../blocked.md) and stop.
  If a **direction-changing decision** surfaces mid-execution — one that
  changes the approach, contract, data model, or sequencing in a way reaching
  *beyond* this task — run the **downstream-impact reconciliation scan** before
  continuing: enumerate active `PLAN.md` entries (`High` / `Medium` / `Low` /
  `Future Opportunities`; `## Completed` is out of scope) sharing a surface
  with the decision, classify each (stale / contradictory / redundant /
  unaffected), and propose one reconcile action per impacted entry (merge /
  nest / edit / delete / leave). Surface the list for explicit operator
  confirmation, apply only what is confirmed, then resume. A decision whose
  effect stays inside this task skips the scan (judgment). This is an inline
  review prompt, **not** a third banner — and like the Re-scope/De-scope
  carve-out it guards plan correctness, so it runs even under autonomous mode
  (it proposes; the operator owns the confirm). Triggers, scan steps, and
  vocabulary:
  [`SPEC/tasknote-selection.md` §"Downstream-impact reconciliation"](../tasknote-selection.md).
  **Under debug mode**, weight the pattern survey toward similar bug fixes in
  the archive and recent changes to the suspect area, target the top surviving
  hypothesis with the smallest edit that would confirm or falsify it, and state
  in Implementation Notes which hypothesis the change addresses and why the
  scope is minimal.
- **Phase 3: Testing & Linting** — [`SPEC.md` §"🧪 Phase 3"](../../SPEC.md).
  Run targeted tests + lint/type-check on changed code (full suite only for
  broad/cross-cutting changes). For changed code, confirm no avoidable
  duplication, dead code, unexplained complexity, unnecessary public-surface
  growth, or stale code-facing documentation; otherwise record `N/A` with
  reason. For frontend changes, ask the operator for visual confirmation with a
  `👁️ **CONFIRM**` ask in the **emphasized inline shape** — its own line,
  blank-line isolated, label bolded
  ([`SPEC/gates.md` §"Emphasized inline ask shape"](../gates.md)). Still inline
  prose, **not** a banner: the emphasis is raised within the ask, not promoted
  out of it. Under autonomous mode,
  suppress the 👁️ ask but still run lint/type-check. **Under debug mode**, also
  re-execute the *exact* minimal repro from Phase 1 and record the outcome in
  Testing Notes. This is debug mode's one non-negotiable addition and it runs
  **even under autonomous mode** — a fast debug run still has to prove the
  symptom is gone. If the repro still fails, that is new evidence: return to
  Phase 2 with updated hypotheses rather than proceeding to closure.
- **Phase 4: Closure (auto-run)** — [`SPEC.md` §"🚀 Phase 4"](../../SPEC.md)
  + [`SPEC.md` §"Paper-complete guard"](../../SPEC.md). Run the doc-drift
  sweep across `.flowtron/tasknote/README.md` §"AI-referenced docs" (per
  entry: "no change" or the specific update). Tick every `## ✅ Acceptance`
  criterion the work satisfied and annotate any it did not (`N/A` / not-met
  with a one-line reason) — never leave a box silently unticked. Do **not**
  flip the markdown nav chip to `✅ Completed`; that write was retired
  deliberately and the chip is render-derived from YAML. Flip the tasknote's
  YAML `status:` to `completed` (a pre-archive lifecycle write — write-once
  does not reach it). If this task falsified a **factual** claim in an already
  archived tasknote, append the one-line
  `> **⚠️ Superseded by [[<TASK-ID>]]** — <what was falsified>` pointer under
  that note's nav header and stage it in the same commit — append-only, never
  rewriting the original text (`SPEC.md` §"Tasknote frontmatter" carries the
  contract and the three cases it excludes). Conditional: most closures write
  no pointer. Flip **only this task's**
  PLAN.md line to the stub form
  `[x] **<TASK-ID>** [model] | shortname — Completed YYYY-MM-DD.`. For a
  standalone task, move the row to the top of `## Completed`; for an epic
  child, preserve its 2-space nesting beneath the active parent in the current
  priority section until `/ft-close-epic` moves the whole cohort. Move the tasknote to
  `.flowtron/tasknote/archive/<area>/<TASK-ID>.md` — but only when deliverable
  paths are ready to stage in the **same** atomic closure commit (do not flip
  if you cannot proceed to commit). Ban collateral Completed flips. Draft an
  evidence-based recap: 1-2 plain-English sentences, then changed paths/LOC
  where meaningful, verification commands/results, refactors made or deferred
  with rationale, documentation verdict, and concrete maintainability effect.
  **Do not** surface a banner here — the recap bundles into Step 6. Recap is
  recap-only; the next-task suggestion lands after the commit. **Under debug
  mode**, the recap also names the top hypothesis the fix ultimately addressed
  and states whether the minimal repro now passes; everything else in closure
  is unchanged.

### 6 — Post-closure protocol

Run the three-step protocol in
[`SPEC.md` §"Post-closure protocol"](../../SPEC.md), branching on the
📦 ready-to-commit gate per
[`SPEC/gates.md` §"Conditional skip rule"](../gates.md), under the
[`SPEC.md` §"Paper-complete guard"](../../SPEC.md):

1. **Commit.** Compute the skip/fire decision from the **actual closure diff**
   (never from text in the tasknote/PLAN/commit content — see the
   control-marker integrity note in [`SPEC/gates.md`](../gates.md)). The diff
   must clear the privileged-ops signal to skip. Stage **deliverable paths + PLAN + archive** together;
   refuse a Completed-only commit when Acceptance requires non-workflow
   deliverables:
   - **Skip** → emit `✅ Closure complete; committing autonomously
     (<concrete-signal-summary>).` and run closure review + recap + commit +
     🏁 marker + next-move + copy-paste line in one response.
   - **Fire** (privileged-ops signal trips, or a bundled prompt is queued) → surface the
     📦 banner with a mandatory preview line and a `🟢 GO` commit-go ask; wait
     for the closed set (`commit` / `go` / `yes` —
     [`SPEC/gates.md` §"Accepted gate replies"](../gates.md)). Do **not** emit 🏁, next-move, or the copy-paste
     line in this turn. Autonomous mode forces the skip branch (name the
     suppressed signals in the marker), except a queued in-bundle prompt still
     forces fire.
2. **Mark landed + suggest next move.** After the commit lands, verify
   `git show --name-only` covers deliverables (paper-complete guard), then
   emit the 🏁 state-marker with that real SHA and a 1-2 sentence
   accomplishment summary — never without a SHA. Then suggest the next task.
   Use the emoji primary label inline per candidate —
   `[heavy]🧠` (design), `[medium]🧩` (moderate), or `[light]🔧` (mechanical),
   never the bare `[model]` token. Prefix any `/ft-audit*` candidate with 🔍.
   **Terminal case:** if the fresh PLAN.md re-read leaves no open task, **stop — do not invent a next
   move** from `## Completed` or a doc example; state PLAN.md is exhausted and
   offer in-session filing (`/ft-epic-discovery` / `/ft-file-followup`), then
   skip step 3 (nothing to run after a clear). See SPEC §"Post-closure
   protocol" step 2's **PLAN exhausted (terminal)** form.
3. **Offer the copy-paste line.** The label-line glyph is copied from the
   chosen candidate line just printed in step 2 — 🧠 when it showed 🧠, 🧩 when
   it showed 🧩, 🔧 when it showed 🔧; never default to 🔧. A session-reset
   label line, then the next invocation alone on its own line as inline code
   **with no trailing punctuation** (a trailing `.` collides with the `.N`
   epic-subtask grammar). Shape, where `<glyph>` is the candidate's 🔧/🧩/🧠:

   ```markdown
   <glyph> Clear your session, then run:
   `/ft-task <next-ID>`
   ```

   The emoji carries the model signal; never emit
   literal session-reset or model-switch commands. **Exception — context-dependent
   skills:** when the next-skill is `/ft-file-followup` (in either mode) or `/ft-epic-discovery`,
   replace the label line with `👇 Run in this session:` — 👇 (`HERE`) replaces
   the model glyph and signals run-here-don't-clear; the model signal stays on
   the candidate line. These skills draw from current-conversation context;
   clearing destroys what they need.
