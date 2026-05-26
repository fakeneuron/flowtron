---
name: ft-file-followup
description: File a mid-flow follow-up task from inside an active tasknote. Invoke with the task ID as args (e.g., args="CORE-058"). Writes one PLAN.md line and delivers a short context paragraph conversationally only — no tasknote artifact. Lighter than `/ft-starter-task`. See SPEC §"When to use a tasknote" for the threshold.
---

# file-followup — flowtron lightweight follow-up filer

You are filing a **follow-up task** for the task ID provided in `args`. The full filing thresholds live in `SPEC.md` §"When to use a tasknote (and when not to)" — this skill is the executable interpretation, not a replacement. Treat SPEC.md as authoritative when this file is silent or in tension.

A `/ft-file-followup` filing produces **zero artifacts on disk beyond a single PLAN.md task line**. The "short context paragraph" — rationale + suspected scope + recommended priority/model — is delivered conversationally only, in the same response as the filing confirmation. There is no tasknote file. Active tasknotes (if `/ft-file-followup` runs mid-flow inside `/ft-task`) are **not** edited — no breadcrumb, no log entry. The active tasknote stays a record of what it was for, not a coordination ledger.

This skill is **filing-only and lighter than `/ft-starter-task`**: use it when the description fits in ≤50 words and no rich context (file survey / open questions / design decisions) needs to persist. If the description would breach 70 words or rich context warrants preserving, escalate to `/ft-starter-task` instead — the SKILL surfaces this gate at Step 2.

If `args` is missing or doesn't match `<AREA>-<NUMBER>` (or `<AREA>-<NUMBER>.<SUB>` for epic subtasks), stop and ask the user for a valid task ID. Do not guess.

## Step 0 — Resolve paths

Two layouts. Pick by which file exists:

- **Adopter project:** `_project/flowtron/SPEC.md` exists → SPEC=`_project/flowtron/SPEC.md`.
- **Flowtron self-host:** repo-root `SPEC.md` with heading `# Flowtron — Workflow Specification` → SPEC=`SPEC.md`.

If neither matches, bail. PLAN=`_project/PLAN.md`, tasknote dir=`_project/tasknote/` either way.

## Step 1 — Pre-flight checks

- Resolve the **Area** from the task ID prefix per SPEC §"Task ID convention". Unknown prefix → read `_project/tasknote/README.md`; if still unresolved, stop and ask.
- The task ID must NOT already exist in PLAN.md. If it does, stop and ask whether the user meant a different ID — `/ft-file-followup` files NEW tasks; reusing an existing entry is out of scope.
- `_project/tasknote/<TASK-ID>.md` must NOT already exist. If it does, stop. Surface the conflict (could be in-flight, blocked, completed, starter, or already a follow-up that was promoted).
- `_project/tasknote/archive/<area>/<TASK-ID>.md` must NOT already exist. If it does, stop — the ID has been used and archived; pick a fresh ID.

## Step 2 — Collect inputs

Use AskUserQuestion to confirm the key fields. Pre-populate from conversation context where possible — the AI proposes; the user confirms or overrides.

1. **Title (shortname)** — concise; up to ~30 chars. Used as the `| shortname` segment on the PLAN.md line.
2. **Priority** — `High | Medium | Low | Future Opportunities`. AI proposes its best read. For urgent rows, propose `High` with a `[!critical]` flag (see SPEC §"Task-line format").
3. **Model** — recommended primary labels: `[heavy]` (design/ambiguity) or `[light]` (mechanical); adopters may use any short token (e.g. `opus`, `sonnet`, project-specific) per SPEC §"Model field". AI proposes; goes on the PLAN.md task line.
4. **Long description** — the one-line PLAN.md long description (everything after `— ` on the task line). AI drafts from conversation context.

**Filing-discipline gate** (per SPEC §"PLAN.md filing-discipline thresholds"). Word-count the drafted long description:

- **≤50 words:** proceed.
- **51-70 words:** trim if practical; otherwise proceed with a yellow-flag note in the review surface (Step 3).
- **>70 words:** STOP. The description breaches the hard cap — `/ft-file-followup` is the wrong tool. Surface to the user: "The drafted description is `<N>` words (>70w cap). This belongs in a starter body, not a one-line PLAN.md entry. Recommend `/ft-starter-task <ID>` instead." Do not proceed unless the user trims the description below the cap.

The 70w cap exists so PLAN.md stays scannable; rich context belongs in starter bodies (`/ft-starter-task`) or full tasknotes (`/ft-task`). `/ft-file-followup`'s niche is the ≤50w + ephemeral-context band only.

## Step 3 — Draft and surface for review

Draft the conversational paragraph from prior conversation context. **Free-form prose**, no fixed schema or bold-prefix prompts; the SKILL prescribes intent only:

- **What surfaced this follow-up** (the rationale tying it to the current conversation or active tasknote).
- **Suspected scope** (files / paths / hypotheses, when the conversation has surfaced any).
- **Why this priority and model** (one short clause when non-obvious; skip if obvious from the line itself).

Keep the paragraph under ~80 words. If the conversation has surfaced more context than fits, that is itself a signal to use `/ft-starter-task` instead — surface to the user.

**Surface for review.** Show the user, in one short message:

- The proposed PLAN.md line, exactly as it will be appended.
- The drafted conversational paragraph.

Edit per their feedback before writing anything. Do not skip the review.

## Step 4 — File the entry

In one continuous motion:

1. **Append the PLAN.md entry.** Append a new entry under the appropriate `## <Priority>` heading using the canonical task-line grammar (SPEC §"Task-line format"):

   ```
   - [ ] **<TASK-ID>** [<model>] | <shortname> — <one-line long description>
   ```

   Placement:
   - If the priority section already has entries, append to the bottom of that section.
   - If the section carries a `(none)` placeholder, replace the placeholder with the new entry.

   No `Filed with starter at ...` pointer (that suffix is `/ft-starter-task`'s contract). The new line carries only the long description — no breadcrumb to a tasknote that doesn't exist.

2. **Deliver the conversational paragraph.** Surface the reviewed paragraph from Step 3 in the same response as the filing confirmation. The paragraph is **chat-only** — never persisted to disk, never written into the active tasknote.

## Step 5 — Hand off

Surface to the user, in one short message:

- `<TASK-ID>` filed at `_project/PLAN.md` under `## <Priority>` with model `<model>`.
- The follow-up sits as a one-line PLAN.md entry until `/ft-task <TASK-ID>` (or `/ft-micro-task` / `/ft-starter-task` for promotion) fires.
- (Conversational paragraph from Step 4.2 is included in this response.)

Do **not** commit unprompted. The new PLAN.md line is typically bundled into whatever commit the surrounding conversation produces (if any) or left for the user to handle. If the user asks for a commit, the message format is `chore: file <TASK-ID> follow-up — <shortname>`.

## Notes

- **Filing-only — no design decisions in the skill flow itself.** All context (rationale, suspected files, recommended priority/model) comes from the prior conversation; the skill just records the line and surfaces the paragraph.
- **Routing across the filing cohort:** see SPEC §"When to use a tasknote (and when not to)" for the full decision tree. `/ft-file-followup`'s niche: ≤50w + ephemeral context only. Above 50w → `/ft-starter-task`. Filing+executing in one shot → `/ft-micro-task`. Starting an existing PLAN.md entry → `/ft-task`.
- **No active-tasknote breadcrumb.** When invoked from inside `/ft-task`, `/ft-file-followup` does not write into the active tasknote — keeps the active tasknote a record of what it was for, not a coordination ledger. This is the strict reading of "only one PLAN.md line on disk."
