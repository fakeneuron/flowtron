---
name: ft-task
description: Start a flowtron tasknote and drive it through the SPEC's 4-phase workflow. Use when the user asks to start a full tasknote for a normal-sized, multi-step, or design-tradeoff-bearing task — and, with `--debug`, when the user asks to debug a bug, regression, flaky behavior, or other unexpected behavior whose root cause is not yet known (hypothesis-first cadence — expected vs observed → ranked hypotheses → minimal repro → re-verify). Invoke with the task ID as args (e.g., args="CORE-004", "CORE-004 --debug", or "CORE-195.2 --debug --fast"). Reads SPEC.md, scaffolds the tasknote from the template, runs Phase 1 Discovery, then continues conversationally through phases 2-4 and the post-closure protocol.
---

# task — flowtron tasknote runner

You are starting a tasknote for the task ID provided in `args` (e.g., `CORE-004`). The full workflow contract lives in flowtron's `SPEC.md` — this skill is the executable interpretation, not a replacement. Treat SPEC.md as authoritative when this file is silent or in tension.

If `args` is missing or its first token doesn't match `<AREA>-<NUMBER>` (or `<AREA>-<NUMBER>.<SUB>` for epic subtasks), stop and ask the user for a valid task ID. Do not guess. Trailing `--fast` / `-f` and `--debug` / `-d` flags are the only other accepted tokens — see Step 0.

## Step 0 — Resolve paths

Two layouts. Pick by which file exists:

- **Adopter project:** `.flowtron/core/SPEC.md` exists → `<root>` = `.flowtron/core/`.
- **Flowtron self-host:** repo-root `SPEC.md` with heading `# Flowtron — Workflow Specification` → `<root>` = repo-root.

If neither matches, bail.

Paths this skill uses:
- SPEC: `<root>SPEC.md` (always loaded core)
- SPEC_DIR (lazy modules `epic.md` · `starter.md` · `blocked.md` · `model.md` · `versioning.md`): `<root>SPEC/`
- SKILL_DIR (lazy fragments `step-1.5-model-edge.md` — shared, also loaded by `/ft-micro-task` + `/ft-goal-task` — · `step-3a-promote-starter.md` · `step-3c-resume-blocked.md` · `step-4-debug-mode.md`): `<root>claude/skills/ft-task/`
- Template: `<root>templates/tasknote-template.md`
- PLAN: `.flowtron/PLAN.md`, tasknote dir: `.flowtron/tasknote/` (always)

Subsequent steps name what to Read; the SPEC contract + matching SKILL fragment typically load in parallel.

**Parse `args`.** Split on whitespace into `(TASK-ID, rest...)`. `rest` is an **unordered flag set** — recognize each token independently; order never matters, and both flags may appear together. Initialize `fast-mode = false` and `debug-mode = false`, then walk the tokens:

- **`--fast` or `-f`** → set `fast-mode = true`.
- **`--debug` or `-d`** → set `debug-mode = true`.
- **Any unrecognized token** → surface a one-line usage notice (``Unknown arg `<arg>`. Usage: `/ft-task <TASK-ID> [--debug] [--fast]`.``) and ask via AskUserQuestion whether the user meant `--fast`, `--debug`, the default flow, or to abort. Do not proceed silently.

After path resolution, emit one inline marker per active flag (both, when both are set):

- `fast-mode` → `⚡ --fast active — 👁️ frontend ask and 📦 signal trips suppressed; Re-scope/De-scope still fires 🛠️ (🛠️ banner is no-op for routine trips under default-skip flavor).`
- `debug-mode` → `🔬 --debug active — hypothesis-first Phase 1 scaffolding + Phase 3 repro re-verify. Guidance, not a gate; no new banners.`

Then continue to Step 1.

`fast-mode` is operator-side opt-in for routine runs where the conditional gates would fire but the operator wants autonomous execution; behavioral branches reference it at Step 4 (Phase 1 exit gate), Step 5 (Phase 3 👁️ ask), and Step 6 (Conditional skip rule). Default flow (`fast-mode = false`) is byte-identical to the pre-flag skill — see SPEC/gates.md §"Operator-gate cues" for the contract.

`debug-mode` is operator-side opt-in for bug / regression / unexpected-behavior work where the root cause is not yet known. **When `debug-mode = true`, Read `<SKILL_DIR>/step-4-debug-mode.md` now** — it carries the whole mode (four Phase 1 prompts, Phase 2 emphasis, Phase 3 repro re-verify) and is referenced at Step 4 and Step 5. The mode adds *content* only: scaffolding, gates, epic children, blocked handling, and closure are unchanged, and it creates no new banner. Per SPEC/tasknote-selection.md §"When to use a tasknote (and when not to)", debug mode is **explicit-opt-in only** — never infer it from a task description that sounds bug-shaped (CORE-042.5: the user picks the entry point at invocation time).

The two flags are orthogonal and compose: `--debug --fast` runs the hypothesis scaffolding without AskUserQuestion pauses, and the Phase 3 repro re-verify still runs (it is not a signal trip `--fast` may suppress).

## Step 1 — Locate the task in PLAN.md

Read PLAN.md. Find the line containing `**<TASK-ID>**`. If the ID isn't in PLAN.md, stop and ask the user whether to add it or use a different ID. Do not invent an entry.

**Status gate (non-negotiable).** Before doing anything else, check the located line:

- If the line is checked (`- [x]`), or
- if it lives under the `## Completed` heading,

the task is already closed. **Stop. Do not scaffold.** Surface the conflict to the user and ask whether they meant a different task ID. Do this check by re-reading the exact PLAN.md line — never infer status from prior conversation context.

Otherwise, capture:

- The optional `[model]` segment (`[heavy]` / `[light]` primary recommended; specific names e.g. `opus` / `sonnet` / `grok` remain valid per SPEC §"Model field") — see Step 1.5
- The optional `| shortname` segment
- The one-line long description (everything after ` — `; may be empty)
- The section heading the line lives under (`High` / `Medium` / `Low` / `Future Opportunities`) — this is the task's **Priority**
- The optional `[!critical]` segment — sets the urgency flag (orthogonal to priority; floats the row to the top of High). Legacy `## Critical` sections are soft-migrated to `priority: 'High'` with the flag implicit (see SPEC §"Task-line format").

The full task-line grammar is `- [ ] **TASK-ID** [!critical] [model] | shortname — long description`; all of `[!critical]`, `[model]`, and `| shortname` are optional. See SPEC §"Task-line format" for the canonical grammar.

**Filing-discipline check (advisory).** Word-count the captured long description (after `— `). If it exceeds the 70-word hard cap from SPEC/tasknote-selection.md §"PLAN.md filing-discipline thresholds", surface a one-line warning to the user:

```text
⚠️ PLAN.md description is <N> words (>70w cap). Should this have been filed
   as a starter? Proceeding with the existing line.
```

Informational only — do not block scaffolding; the task is already filed and reworking the filing now is too late. The warning nudges future filings.

## Step 1.5 — Model gate (BEFORE scaffolding)

Gate on the `[model]` segment captured in Step 1 before any source reads — heavy thinking shouldn't run on the wrong model. The active model is whatever the assistant is currently running as (ask the user if uncertain). A **concrete** tag (`opus`/`sonnet`/`grok`/…) is matched by exact identity; a **category** tag (`[heavy]`/`[medium]`/`[light]`) is matched by *tier*, not string — see `<SPEC_DIR>/model.md` §"Category-vs-concrete matching" for the tier ladder + rule.

- **Satisfied** — concrete tag equals the active model, OR a category tag whose tier the active model meets or exceeds (e.g. `[light]` on sonnet, `[heavy]` on opus) → proceed silently to Step 2.
- **Category under-tier** — a category tag tagged heavier than the active model's tier (e.g. `[heavy]` on a lower-tier model such as grok (medium) or haiku (light)) → Read `<SPEC_DIR>/model.md` + `<SKILL_DIR>/step-1.5-model-edge.md` in parallel, then follow the "Category under-tier" branch (⚠️ inline note, then proceed — not a STOP, not an auto-retag).
- **Concrete mismatch** — a concrete tag differs from the active model → STOP. Read `<SPEC_DIR>/model.md` + `<SKILL_DIR>/step-1.5-model-edge.md` in parallel, then follow the "Mismatch" branch.
- **Absent (legacy line)** → Read `<SPEC_DIR>/model.md` + `<SKILL_DIR>/step-1.5-model-edge.md` in parallel, then follow the "Legacy entry" branch.

## Step 2 — Pre-flight checks & file-state branch

- Resolve the **Area** from the task ID prefix per SPEC §"Task ID convention". Unknown prefix → read `.flowtron/tasknote/README.md`; if still unresolved, stop and ask.
- **Epic-ID dispatch.** If the TASK-ID is `<AREA>-EPIC-<N>` (parent epic) or `<AREA>-<N>.<sub>` (epic subtask), Read `<SPEC_DIR>/epic.md` for the lifecycle contract before continuing. Plain `<AREA>-<N>` IDs do not load this module.
- **Foreign-dirt gate (paper-complete guard).** Before any scaffold / promote / resume writes, run `git status --porcelain`. If non-empty: **STOP**, surface the dirt list, ask the operator to commit / stash / discard themselves, then re-invoke. Do not auto-clean. See SPEC §"Paper-complete guard".
- If `.flowtron/tasknote/archive/<area>/<TASK-ID>.md` already exists: stop. The task is already closed and archived. Surface the conflict and ask whether the user meant a different task ID — do not scaffold a duplicate.
- Check `.flowtron/tasknote/<TASK-ID>.md`. **Four-way branch on the file's YAML `status:`:**
  - **`status: starter`** — starter tasknote awaiting promotion. Continue at **Step 3a (Promote a starter)**.
  - **`status: blocked`** — parked tasknote awaiting resume. Continue at **Step 3c (Resume a blocked tasknote)**.
  - **Any other `status:`** (`not-started` / `in-progress` / `completed`) — file is in flight or already closed. Stop. Tell the user the tasknote exists and recommend they continue conversationally (e.g., "continue CORE-004") rather than restarting. This skill is start-only by design.
  - **File absent** — fresh scaffold path. Continue at **Step 3b (Scaffold a fresh tasknote)**.

## Step 3a — Promote a starter (existing file with `status: starter`)

Read `<SPEC_DIR>/starter.md` (lifecycle contract) and `<SKILL_DIR>/step-3a-promote-starter.md` (executable steps), then continue at **Step 4 (Phase 1: Discovery)**.

## Step 3b — Scaffold a fresh tasknote (no existing file)

Copy the template (path resolved in Step 0) to `.flowtron/tasknote/<TASK-ID>.md`. The frontmatter schema and body layout are canonical in SPEC §"Tasknote frontmatter" and §"Tasknote body shape" — fill them as specified there. The template ships the canonical phase checklists; leave them exactly as they ship.

**Skill-specific values at scaffold time:**

- `title:` — prefer the PLAN.md `| shortname` (Step 1) when present; otherwise derive from the long description.
- `status:` — `in-progress`.
- `created:` — today's date.
- `related-tasks:` — from PLAN.md if the line cites parent epics, predecessors, or follow-ups; otherwise `[]`.
- **Epic implementation-child YAML echo.** If the TASK-ID is `<AREA>-<N>.<sub>` and is *not* `.1` / `.N`, look at the sibling Discovery `.1` (active or archived) for a `## 🌳 Fan-out` section. Copy any Parallel / Sequential claim that names this child into omit-when-absent `blocked-by:` / `parallel-safe-with:` on *this* note (bare IDs; Sequential "after X" → `blocked-by: [X]`; Parallel peers → `parallel-safe-with`). Omit the keys when Fan-out does not name this child. A worktree copies only the child note, so the `.1` heading alone is not visible there. Contract: [`SPEC/epic.md`](../../../SPEC/epic.md) §"Fan-out." Do not invent a parser or a lock.

🎯 Goal is derived from the PLAN.md line at scaffold; ask the user if it's too terse for a clear one-sentence goal. ✅ Acceptance and 🧩 Subtasks are empty checklists at scaffold, populated during Phase 1 Discovery.

## Step 3c — Resume a blocked tasknote (existing file with `status: blocked`)

Read `<SPEC_DIR>/blocked.md` (lifecycle contract) and `<SKILL_DIR>/step-3c-resume-blocked.md` (executable steps), then continue at **Step 5** at Phase 2 (the lazy fragment's step 5 directs there; Phase 1 is already complete on a parked tasknote).

## Step 4 — Phase 1: Discovery (drive now)

Work through the Phase 1 checklist per SPEC §"📝 Phase 1: Discovery". Re-scope and De-scope behavior is canonical there; the Re-scope-to-blocked path defers to `<SPEC_DIR>/blocked.md` (Read it if Discovery surfaces a real-but-blocked prerequisite).

**When `debug-mode = true`** (from Step 0): run the four hypothesis-first prompts from `<SKILL_DIR>/step-4-debug-mode.md` §"Phase 1" after the Relevance Assessment, recording answers in Discovery Notes. They sit *inside* this checklist — they add no box and no gate, and the exit-gate judgment below is unchanged.

Skill-specific imperatives on top of the SPEC contract:

- Tick boxes in the tasknote as you complete them.
- The first checklist item (Reviewed PLAN.md) is already done in Step 1 of this skill.
- For the Archive skim step: `ls .flowtron/tasknote/archive/<area>/` to enumerate, then for each source path in scope run `grep -l <path> .flowtron/tasknote/archive/<area>/*.md`. Read the hits and log anything load-bearing in Discovery Notes (file moves, regressions, design decisions, hardlink notes, etc.). If `archive/<area>/` is empty or absent, log "no prior tasknotes" and tick the box.
- For the Clarifying questions step: use AskUserQuestion for anything genuinely ambiguous. If nothing is ambiguous, write `No clarifications needed` in the tasknote with the explicit assumptions.
  **When `fast-mode = true`** (from Step 0): skip the AskUserQuestion call and write `No clarifications needed (--fast)` with the explicit assumptions the operator is asserting.
- For the "populate Subtasks" step: fill the tasknote's `## 🧩 Subtasks` checklist with concrete, ordered steps.
- Do not enter Phase 2 until every Phase 1 box is ticked. Once ticked, apply the SPEC/gates.md §"Phase 1→2 exit gate"'s **`default-skip` flavor** (the flavor `/ft-task` uses): judge whether Discovery surfaced a significant scope deviation from the original plan.
  - **Skip branch (default)** — no significant scope deviation surfaced (small-clarifications-only or zero asks). Emit the inline marker `✅ Phase 1 Discovery complete; entering Phase 2 Execution.` and start Step 5 Phase 2 immediately. Plain prose, not a banner; not a new gate. Concrete skip cases: typo/format/style/naming/comment-style clarifications; explicit assumptions logged with no asks.
  - **Fire branch** — significant scope deviation surfaced. Surface the **🛠️ Phase 1→2 operator-gate cue** with the mandatory 1-2 sentence plain-English preview line (per SPEC/gates.md §"Operator-gate cues") and wait for the user's go before starting Step 5 Phase 2. Concrete fire cases: Re-scope or De-scope verdict (always fire); clarifications that changed which file to edit, restructured the subtask list, added a cross-cutting concern, discovered a different root cause, or changed the approach.

  Record the judgment inline at the exit ("Discovery surfaced no significant deviation → skip 🛠️." or "Discovery surfaced <one-line reason> → fire 🛠️.") so the operator can spot misjudgments in the transcript.

**`--fast` interaction.** Under the `default-skip` flavor, `--fast`'s 🛠️ suppression is a **no-op for routine trips** — the default already skips them. `--fast` does not weaken the **drift carve-out**: Re-scope/De-scope verdicts always fire 🛠️ regardless of `--fast`.

On a `Proceed` Verdict with `fast-mode = true`, the clarifying-questions step writes `No clarifications needed (--fast)` and the Skip branch fires. The flag stays meaningful for the 👁️ frontend ask (Step 5 Phase 3) and the 📦 ready-to-commit signal trips (Step 6).

## Step 5 — Phases 2-4 (drive conversationally)

After the Phase 1→2 cue clears, Phase 2 → Phase 3 → Phase 4 closure ops
flow continuously without an intermediate gate. The next operator-gate
cue is the 📦 ready-to-commit banner in Step 6.

- **Phase 2: Execution** — pattern survey first (look at sibling modules / parallel components for an existing shape to extend; justify a new shape if none fits), check DRY and single-responsibility boundaries, and prefer composition when it reduces coupling. Implement minimally; refactor only for Acceptance or to prevent duplication, obscured responsibility, or a dependency-boundary violation, recording the reason and deferring unrelated cleanup. Then run targeted tests on changed files. Tick boxes as you go. **If a hard dependency surfaces mid-execution**, Read `<SPEC_DIR>/blocked.md` and park the tasknote per its contract — flip `status: blocked`, update the nav header to `⏸ Blocked`, and stop. The next `/ft-task <ID>` invocation enters the resume path (Step 3c) automatically. **If a direction-changing decision surfaces mid-execution** — a choice that changes the approach, contract, data model, or sequencing in a way that reaches *beyond* the current task — run the **downstream-impact reconciliation scan** (per SPEC/tasknote-selection.md §"Downstream-impact reconciliation" — authoritative for triggers, scan steps, and vocabulary) before continuing: enumerate active PLAN entries (`High` / `Medium` / `Low` / `Future Opportunities`; `## Completed` out of scope) that share a surface with the decision, classify each (stale / contradictory / redundant / unaffected), and propose one reconcile action per impacted entry (merge / nest / edit / delete / leave). Surface the impacted-entry list for explicit user confirmation, apply only the confirmed edits, then resume execution. A decision whose effect stays inside the current task skips the scan (judgment). This user-confirm is an inline review prompt, **not** a new banner — the two-banner cap (🛠️ + 📦) holds; and like the Re-scope/De-scope drift carve-out it guards plan correctness, so it fires regardless of `fast-mode` (it proposes; the user owns the confirm).
- **Phase 3: Testing & Linting** — targeted tests, lint/type-check, and the canonical structural quality assertions for changed code; visual confirmation for frontend changes (emphasized `👁️ **CONFIRM**` ask — its own line, blank-line isolated, bold label — per SPEC §"🧪 Phase 3: Testing & Linting"; emphasis raised *within* the inline shape, still not a banner block). Run the full suite only for broad/cross-cutting changes. Flows directly into Phase 4 closure ops; no gate between them. **When `fast-mode = true`** (from Step 0), suppress the 👁️ CONFIRM prose ask — lint/type-check on changed code still runs, but the operator owns the visual-confirmation responsibility. **When `debug-mode = true`**, apply the Phase 2 emphasis and run the Phase 3 repro re-verify from `<SKILL_DIR>/step-4-debug-mode.md` — re-execute the exact minimal repro from Phase 1 and record the outcome in Testing Notes. The re-verify runs **even under `--fast`**; a still-failing repro sends you back to Phase 2 with updated hypotheses, not to closure.
- **Phase 4: Closure (auto-run)** — run the doc-drift sweep across `.flowtron/tasknote/README.md` §"AI-referenced docs" (per-entry verdict: "no change" or the specific update). Tick every `## ✅ Acceptance` criterion the work satisfied and annotate any it did not (`N/A` / not-met with a one-line reason) — never leave a box silently unticked. Do **not** flip the markdown nav chip to `✅ Completed` (retired by CORE-042.4; the chip is render-derived from YAML — see SPEC §"🚀 Phase 4: Closure"). Flip the tasknote's YAML `status:` to `completed` **before** the archive move — a pre-archive lifecycle write that SPEC §"Tasknote frontmatter" write-once explicitly does not reach. **Superseded-claim pointer (conditional)** — if this task falsified a *factual* claim in an already archived tasknote (the Phase 1 drift check is where this surfaces), append the one-line `> **⚠️ Superseded by [[<TASK-ID>]]** — <what was falsified>` blockquote under that note's nav header and stage it in the same closure commit; append-only, never rewriting the original text. Most closures falsify nothing and write no pointer. Contract + the three excluded cases: SPEC §"Tasknote frontmatter". Per SPEC §"Paper-complete guard": flip **only this task's** PLAN.md line to the stub form `[x] **<TASK-ID>** [model] | shortname — Completed YYYY-MM-DD.` (SPEC/tasknote-selection.md §"`## Completed` archive convention"). For a standalone task, move the row to the top of `## Completed`; for an epic child, preserve its 2-space nesting beneath the active parent in the current priority section until `/ft-close-epic` moves the whole cohort. Move the tasknote to `.flowtron/tasknote/archive/<area>/<TASK-ID>.md` **only when** deliverable paths are ready to stage in the same atomic closure commit — do not flip if you cannot proceed to commit in this turn; ban collateral Completed flips. Draft the evidence-based recap: 1-2 sentence plain-English summary first, then paths/LOC where meaningful, verification results, refactors made or deferred with rationale, documentation verdict, and maintainability effect. **Do not surface a banner here** — the recap bundles into Step 6's 📦 gate. **Recap is recap-only — do not include the next-task suggestion in the recap; that lands after the commit (Step 6); see SPEC §"🚀 Phase 4: Closure" callout.**

## Step 6 — Post-closure protocol

Run the three-step protocol (commit / suggest next move / copy-paste line) per SPEC §"Post-closure protocol" + §"Paper-complete guard", branching on SPEC/gates.md §"Conditional skip rule" against the closure diff. Stage **deliverable paths + PLAN + archive** together; refuse a Completed-only commit when Acceptance requires non-workflow deliverables.

- **Skip branch** (signals clear, no bundled in-📦 prompt) — emit `✅ Closure complete; committing autonomously (<concrete-signal-summary>).` where `<…>` names the cleared signal as diff facts (e.g., `4 markdown files; no privileged-ops surface`); the marker stands in for commit-go. Then run closure review + recap + commit; verify `git show --name-only` covers deliverables; then 🏁 with that real SHA (never invent a SHA) + suggest-next-move + copy-paste line in one continuous response.
- **Fire branch** (privileged-ops signal hits OR bundled in-📦 prompt queued) — surface the bundled 📦 ready-to-commit gate and **wait** for commit-go ("commit"/"go"/"yes"). Do **not** emit 🏁, next-move, or the copy-paste line in this turn. After commit lands and passes the deliverable-covering check, the 🏁 marker (with 1-2 sentence accomplishment summary) + next-move + copy-paste follow in that later response.

**`--fast` override.** When `fast-mode = true` (from Step 0), force the Skip branch regardless of signal trips. Name the suppressed signals in the marker for transparency (e.g., `✅ Closure complete; committing autonomously (privileged-ops path touched; suppressed via --fast).`). The drift carve-out at Step 4 means a `Re-scope`/`De-scope` task that flipped to fast-mode-via-flag still got the 🛠️ banner upstream — at Step 6, `fast-mode = true` always routes to Skip. The paper-complete guard is **not** suppressed by `--fast`.

Skill-specific:
- Suggest-next-move candidates: **re-read PLAN.md now** (fresh Read tool call — do not rely on the Step 1 cached parse; the `## Completed` section grows long and stale-context suggestions are a known hallucination source). For each candidate, verify its task line is `- [ ]` (unchecked) and lives in an open section (`## High`, `## Medium`, `## Low`, or `## Future Opportunities`), not under `## Completed`. Drop any candidate that fails this check. **If no candidate survives — PLAN.md holds no open task — do NOT invent one from `## Completed`, a doc example, or the Step-1 cached parse; follow SPEC §"Post-closure protocol" step 2's PLAN exhausted (terminal) form: state PLAN.md is exhausted, offer in-session filing (`/ft-epic-discovery` / `/ft-file-followup`), and skip the copy-paste line below (nothing to run after a clear).** Otherwise, read the verified line's `[model]` field to know the recommended model. When *printing the list to the user*, emit only the emoji primary label (`[heavy]🧠` / `[medium]🧩` / `[light]🔧`) + "design / moderate / mechanical" prose + shortname — drop the bare bracketed token from the visible suggestion output. The suggestion glyph mirrors the gate's tier ladder 1:1 — `[light]`→🔧, `[medium]`→🧩, `[heavy]`→🧠; concrete tokens bucket by inherent tier (see `<SPEC_DIR>/model.md` §"Tier ladder vs. the next-move suggestion glyph").
- Copy-paste helper: emit a short visual cue that uses the same emoji primary label just printed for the chosen next-task candidate line (🔧 for [light] or light-appropriate tokens; 🧩 for [medium] or medium-appropriate tokens; 🧠 for [heavy] or heavy tokens). Put the invocation on its **own line as inline-code with no trailing period** — a trailing `.` collides with the `.N` epic-subtask grammar (`FE-132.3.`) and breaks copy/paste. Shape: a label line `<glyph> Clear your session, then run:` followed by `` `/ft-task <next-ID>` `` alone on the next line — where `<glyph>` is the exact 🔧/🧩/🧠 just printed on the chosen candidate line; never default to 🔧. Never emit a literal `/clear then /model ...` instruction in the user-facing suggestion. The emoji on the candidate line + the matching cue glyph are the stable, agent-agnostic pattern (per SPEC §"Post-closure protocol" step 3). **Exception — context-dependent skills:** when the next-skill is `/ft-file-followup` (in either mode) or `/ft-epic-discovery`, replace the label line with `👇 Run in this session:` — 👇 replaces the model glyph and signals run-here-don't-clear (the model signal stays on the candidate line); these skills draw from current-conversation context; clearing destroys what they need.
- **Audit-family flag** — see SPEC §"Post-closure protocol" step 2 for the 🔍 AUDIT prefix convention on `/ft-audit*` next-move candidates.

## Notes

- **Sub-tasks of an epic** (`<AREA>-<NUMBER>.<SUB>`) follow the same flow. The parent epic line in PLAN.md is not flipped to complete until all children are. For code-sweep / multi-child feature epics, the first subtask (`.1`) is typically a **Discovery** task — its deliverable is the filed child task list in PLAN.md, not code — and the final subtask is an **Audit** task that verifies the completed epic sits well in the codebase. Full lifecycle in `<SPEC_DIR>/epic.md` (loaded at Step 2 for epic IDs).
- **Skip-the-tasknote cases** (single-line typo, formatting tweak, ~10-line doc patch, trivial config edit) — see SPEC/tasknote-selection.md §"When to use a tasknote (and when not to)". For these, decline to scaffold and tell the user to make the edit directly.
