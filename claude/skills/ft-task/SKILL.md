---
name: ft-task
description: Start a flowtron tasknote and drive it through the SPEC's 4-phase workflow. Invoke with the task ID as args (e.g., args="CORE-004"). Reads SPEC.md, scaffolds the tasknote from the template, runs Phase 1 Discovery, then continues conversationally through phases 2-4 and the post-closure protocol.
---

# task — flowtron tasknote runner

You are starting a tasknote for the task ID provided in `args` (e.g., `CORE-004`). The full workflow contract lives in flowtron's `SPEC.md` — this skill is the executable interpretation, not a replacement. Treat SPEC.md as authoritative when this file is silent or in tension.

If `args` is missing or its first token doesn't match `<AREA>-<NUMBER>` (or `<AREA>-<NUMBER>.<SUB>` for epic subtasks), stop and ask the user for a valid task ID. Do not guess. A trailing `--fast` / `-f` flag is the only other accepted token — see Step 0.

## Step 0 — Resolve paths

Two layouts. Pick by which file exists:

- **Adopter project:** `_project/flowtron/SPEC.md` exists → `<root>` = `_project/flowtron/`.
- **Flowtron self-host:** repo-root `SPEC.md` with heading `# Flowtron — Workflow Specification` → `<root>` = repo-root.

If neither matches, bail.

Paths this skill uses:
- SPEC: `<root>SPEC.md` (always loaded core)
- SPEC_DIR (lazy modules `epic.md` · `starter.md` · `blocked.md` · `model.md` · `versioning.md`): `<root>SPEC/`
- SKILL_DIR (lazy fragments `step-1.5-model-edge.md` · `step-3a-promote-starter.md` · `step-3c-resume-blocked.md`): `<root>claude/skills/ft-task/`
- Template: `<root>templates/tasknote-template.md`
- PLAN: `_project/PLAN.md`, tasknote dir: `_project/tasknote/` (always)

Subsequent steps name what to Read; the SPEC contract + matching SKILL fragment typically load in parallel.

**Parse `args`.** Split on whitespace into `(TASK-ID, rest...)`. Branch on `rest`:

- **Empty** → set internal flag `fast-mode = false` and continue to Step 1.
- **`--fast` or `-f`** → set `fast-mode = true`. Emit exactly one inline marker after path resolution: `⚡ --fast active — 👁️ frontend ask and 📦 signal trips suppressed; Re-scope/De-scope still fires 🛠️ (🛠️ banner is no-op for routine trips under default-skip flavor).` Continue to Step 1.
- **Any other trailing arg** → surface a one-line usage notice (``Unknown arg `<arg>`. Usage: `/ft-task <TASK-ID>` or `/ft-task <TASK-ID> --fast`.``) and ask via AskUserQuestion whether the user meant `--fast`, the default flow, or to abort. Do not proceed silently.

`fast-mode` is operator-side opt-in for routine runs where the conditional gates would fire but the operator wants autonomous execution; behavioral branches reference it at Step 4 (Phase 1 exit gate), Step 5 (Phase 3 👁️ ask), and Step 6 (Conditional skip rule). Default flow (`fast-mode = false`) is byte-identical to the pre-flag skill — see SPEC §"Operator-gate cues" for the contract.

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
- The section heading the line lives under (`High` / `Medium` / `Low` / `Future Opportunities`) — this is the task's **Priority**
- The optional `[!critical]` segment — sets the urgency flag (orthogonal to priority; floats the row to the top of High). Legacy `## Critical` sections are soft-migrated to `priority: 'High'` with the flag implicit (see SPEC §"Task-line format").

The full task-line grammar is `- [ ] **TASK-ID** [!critical] [model] | shortname — long description`; all of `[!critical]`, `[model]`, and `| shortname` are optional. See SPEC §"Task-line format" for the canonical grammar.

**Filing-discipline check (advisory).** Word-count the captured long description (after `— `). If it exceeds the 70-word hard cap from SPEC §"PLAN.md filing-discipline thresholds", surface a one-line warning to the user:

```text
⚠️ PLAN.md description is <N> words (>70w cap). Should this have been filed
   as a starter? Proceeding with the existing line.
```

Informational only — do not block scaffolding; the task is already filed and reworking the filing now is too late. The warning nudges future filings.

## Step 1.5 — Model gate (BEFORE scaffolding)

Gate on the `[model]` segment captured in Step 1 before any source reads — heavy thinking shouldn't run on the wrong model. The active model is whatever the assistant is currently running as (ask the user if uncertain).

- **Matches active model** → proceed silently to Step 2.
- **Differs from active model** → STOP. Read `<SPEC_DIR>/model.md` + `<SKILL_DIR>/step-1.5-model-edge.md` in parallel, then follow the "Mismatch" branch.
- **Absent (legacy line)** → Read `<SPEC_DIR>/model.md` + `<SKILL_DIR>/step-1.5-model-edge.md` in parallel, then follow the "Legacy entry" branch.

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
- For the Clarifying questions step: use AskUserQuestion for anything genuinely ambiguous. If nothing is ambiguous, write `No clarifications needed` in the tasknote with the explicit assumptions. **When `fast-mode = true`** (from Step 0), skip the AskUserQuestion call and write `No clarifications needed (--fast)` with the explicit assumptions the operator is asserting.
- For the "populate Subtasks" step: fill the tasknote's `## 🧩 Subtasks` checklist with concrete, ordered steps.
- Do not enter Phase 2 until every Phase 1 box is ticked. Once ticked, apply the SPEC §"📝 Phase 1: Discovery" exit gate's **`default-skip` flavor** (the flavor `/ft-task` uses): judge whether Discovery surfaced a significant scope deviation from the original plan.
  - **Skip branch (default)** — no significant scope deviation surfaced (small-clarifications-only or zero asks). Emit the inline marker `✅ Phase 1 Discovery complete; entering Phase 2 Execution.` and start Step 5 Phase 2 immediately. Plain prose, not a banner; not a new gate. Concrete skip cases: typo/format/style/naming/comment-style clarifications; explicit assumptions logged with no asks.
  - **Fire branch** — significant scope deviation surfaced. Surface the **🛠️ Phase 1→2 operator-gate cue** with the mandatory 1-2 sentence plain-English preview line (per SPEC §"Operator-gate cues") and wait for the user's go before starting Step 5 Phase 2. Concrete fire cases: Re-scope or De-scope verdict (always fire); clarifications that changed which file to edit, restructured the subtask list, added a cross-cutting concern, discovered a different root cause, or changed the approach.

  Record the judgment inline at the exit ("Discovery surfaced no significant deviation → skip 🛠️." or "Discovery surfaced <one-line reason> → fire 🛠️.") so the operator can spot misjudgments in the transcript.

**`--fast` interaction.** Under the `default-skip` flavor, `--fast`'s 🛠️ suppression is a **no-op for routine trips** — the default already skips them. `--fast` does not weaken the drift carve-out: Re-scope/De-scope verdicts always fire 🛠️ regardless of `--fast`. On a `Proceed` Verdict with `fast-mode = true`, the clarifying-questions step writes `No clarifications needed (--fast)` and the Skip branch fires. The flag stays meaningful for the 👁️ frontend ask (Step 5 Phase 3) and the 📦 ready-to-commit signal trips (Step 6).

## Step 5 — Phases 2-4 (drive conversationally)

After the Phase 1→2 cue clears, Phase 2 → Phase 3 → Phase 4 closure ops
flow continuously without an intermediate gate. The next operator-gate
cue is the 📦 ready-to-commit banner in Step 6.

- **Phase 2: Execution** — pattern survey first (look at sibling modules / parallel components for an existing shape to extend; justify a new shape if none fits), then minimal implementation, then targeted tests on changed files. Tick boxes as you go. **If a hard dependency surfaces mid-execution**, Read `<SPEC_DIR>/blocked.md` and park the tasknote per its contract — flip `status: blocked`, update the nav header to `⏸ Blocked`, and stop. The next `/ft-task <ID>` invocation enters the resume path (Step 3c) automatically.
- **Phase 3: Testing & Linting** — targeted tests, lint/type-check on changed code, visual confirmation for frontend changes (`👁️` prefix on the prose ask, per SPEC §"🧪 Phase 3: Testing & Linting" — inline emoji only, not a banner block). Run the full suite only for broad/cross-cutting changes. Flows directly into Phase 4 closure ops; no gate between them. **When `fast-mode = true`** (from Step 0), suppress the 👁️ prose ask — lint/type-check on changed code still runs, but the operator owns the visual-confirmation responsibility.
- **Phase 4: Closure (auto-run)** — run the doc-drift sweep across `_project/tasknote/README.md` §"AI-referenced docs" (per-entry verdict: "no change" or the specific update), flip the PLAN.md line to the stub form `[x] **<TASK-ID>** [model] | shortname — Completed YYYY-MM-DD.` per SPEC §"`## Completed` archive convention" (drop the long description — the archived tasknote is the canonical record), move the line to the `## Completed` section, and move the tasknote file to `_project/tasknote/archive/<area>/<TASK-ID>.md` as a single closure write. Draft the recap (1-2 sentence plain-English summary first, then technical detail: file paths / LOC / key decisions + optional verification request) but **do not surface a banner here** — the recap bundles into Step 6's 📦 gate. **Recap is recap-only — do not include the next-task suggestion in the recap; that lands after the commit (Step 6); see SPEC §"🚀 Phase 4: Closure" callout.**

## Step 6 — Post-closure protocol

Run the three-step protocol (commit / suggest next move / copy-paste line) per SPEC §"Post-closure protocol", branching on SPEC §"Conditional skip rule" against the closure diff:

- **Skip branch** (signals clear, no bundled in-📦 prompt) — emit `✅ Closure complete; committing autonomously (<concrete-signal-summary>).` where `<…>` names the cleared signals as diff facts (e.g., `4 markdown files; no frontend/privileged surface`); the marker stands in for commit-go. Then run closure review + recap + commit + 🏁 state-marker (with 1-2 sentence accomplishment summary) + suggest-next-move + copy-paste line in one continuous response.
- **Fire branch** (any signal hits OR bundled in-📦 prompt queued) — surface the bundled 📦 ready-to-commit gate and wait for commit-go ("commit"/"go"/"yes"). After commit lands, the 🏁 marker (with 1-2 sentence accomplishment summary) + next-move + copy-paste follow in the same response.

**`--fast` override.** When `fast-mode = true` (from Step 0), force the Skip branch regardless of signal trips. Name the suppressed signals in the marker for transparency (e.g., `✅ Closure complete; committing autonomously (frontend files touched; suppressed via --fast).`). The drift carve-out at Step 4 means a `Re-scope`/`De-scope` task that flipped to fast-mode-via-flag still got the 🛠️ banner upstream — at Step 6, `fast-mode = true` always routes to Skip.

Skill-specific:
- Suggest-next-move candidates carry `[model]` **inline per option** in the PLAN.md task-line shape: `**<TASK-ID>** [model] | shortname — one-sentence "why now"`. Mirrors PLAN.md so the user scans model assignments without cross-referencing.
- Copy-paste line: `/clear then /model <opus|sonnet> then /<ft-task|ft-micro-task|ft-starter-task> <NEXT-ID>` — substitute the next task's PLAN-line `[model]` and the right slash command. (The assistant cannot run `/clear` itself.)

## Notes

- **Sub-tasks of an epic** (`<AREA>-<NUMBER>.<SUB>`) follow the same flow. The parent epic line in PLAN.md is not flipped to complete until all children are. For code-sweep / multi-child feature epics, the first subtask (`.1`) is typically a **Discovery** task — its deliverable is the filed child task list in PLAN.md, not code — and the final subtask is an **Audit** task that verifies the completed epic sits well in the codebase. Full lifecycle in `<SPEC_DIR>/epic.md` (loaded at Step 2 for epic IDs).
- **Skip-the-tasknote cases** (single-line typo, formatting tweak, ~10-line doc patch, trivial config edit) — see SPEC §"When to use a tasknote (and when not to)". For these, decline to scaffold and tell the user to make the edit directly.
