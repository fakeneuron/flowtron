---
name: ft-file-followup
description: File a mid-flow follow-up task from inside an active tasknote. Invoke with an optional task ID as args (e.g., args="CORE-058"); when omitted, the skill suggests the next available ID for review. Writes one PLAN.md line and delivers a short context paragraph conversationally only — no tasknote artifact. Lighter than `/ft-starter-task`. See SPEC/tasknote-selection.md §"When to use a tasknote" for the threshold.
---

# file-followup — flowtron lightweight follow-up filer

You are filing a **follow-up task** for the task ID provided in `args`, or for
the suggested ID confirmed during input collection when `args` is omitted. The
full filing thresholds live in `SPEC/tasknote-selection.md` §"When to use a
tasknote (and when not to)" — this skill is the executable interpretation, not
a replacement. Treat SPEC.md as authoritative when this file is silent or in
tension.

A `/ft-file-followup` filing produces **zero artifacts on disk beyond a single PLAN.md task line**. The "short context paragraph" — rationale + suspected scope + recommended priority/model — is delivered conversationally only, in the same response as the filing confirmation. There is no tasknote file. Active tasknotes (if `/ft-file-followup` runs mid-flow inside `/ft-task`) are **not** edited — no breadcrumb, no log entry. The active tasknote stays a record of what it was for, not a coordination ledger.

This skill is **filing-only and lighter than `/ft-starter-task`**: use it when the description fits in ≤50 words and no rich context (file survey / open questions / design decisions) needs to persist. If the description would breach 70 words or rich context warrants preserving, escalate to `/ft-starter-task` instead — the SKILL surfaces this gate at Step 2.

If `args` is missing, suggest a task ID during input collection instead of
requiring one up front. If `args` is present but doesn't match
`<AREA>-<NUMBER>` (or `<AREA>-<NUMBER>.<SUB>` for epic subtasks), stop and ask
the user for a valid task ID.

## Step 0 — Resolve paths

Two layouts. Pick by which file exists:

- **Adopter project:** `.flowtron/core/SPEC.md` exists → SPEC=`.flowtron/core/SPEC.md`.
- **Flowtron self-host:** repo-root `SPEC.md` with heading `# Flowtron — Workflow Specification` → SPEC=`SPEC.md`.

If neither matches, bail. PLAN=`.flowtron/PLAN.md`, tasknote dir=`.flowtron/tasknote/` either way.

## Step 1 — Resolve or suggest the task ID

If `args` is missing, propose a **Suggested ID** before collecting the rest of
the fields:

1. Choose the likely **Area** from conversation context (`CORE`, `FE`, `BE`,
   `DB`, `DEPLOY`, `TEST`, or a project-specific prefix declared in
   `.flowtron/tasknote/README.md`). If the area is genuinely ambiguous, ask one
   short area question before suggesting an ID.
2. Scan `.flowtron/PLAN.md`, `.flowtron/tasknote/`,
   `.flowtron/tasknote/archive/`, and `.flowtron/sidequest/` for IDs with that
   prefix.
3. Suggest the lowest unused next numeric task ID for that prefix. Use the
   next integer after the highest existing non-epic task number; skip any ID
   already present in PLAN.md, active tasknotes, archived tasknotes, or sidequest
   stubs. Do not allocate epic decimal children unless the user explicitly asked
   to file an epic subtask.
4. Carry the suggested ID into Step 2 as a user-reviewable field. The user can
   accept it or provide a different valid ID before anything is written.

If `args` is present, use it as the proposed task ID.

## Step 1a — Pre-flight checks

- Resolve the **Area** from the task ID prefix per SPEC §"Task ID convention". Unknown prefix → read `.flowtron/tasknote/README.md`; if still unresolved, stop and ask.
- The task ID must NOT already exist in PLAN.md. If it does, stop and ask whether the user meant a different ID — `/ft-file-followup` files NEW tasks; reusing an existing entry is out of scope.
- `.flowtron/tasknote/<TASK-ID>.md` must NOT already exist. If it does, stop. Surface the conflict (could be in-flight, blocked, completed, starter, or already a follow-up that was promoted).
- `.flowtron/tasknote/archive/<area>/<TASK-ID>.md` must NOT already exist. If it does, stop — the ID has been used and archived; pick a fresh ID.

## Step 2 — Collect inputs

Use AskUserQuestion to confirm the key fields. Pre-populate from conversation context where possible — the AI proposes; the user confirms or overrides.

0. **Task ID** — use `args` when provided; otherwise use the Suggested ID from
   Step 1. The user may override before filing. If the user changes the ID,
   rerun Step 1a against the final ID before Step 3.
1. **Title (shortname)** — concise; up to ~30 chars. Used as the `| shortname` segment on the PLAN.md line.
2. **Priority** — `High | Medium | Low | Future Opportunities`. AI proposes its best read. For urgent rows, propose `High` with a `[!critical]` flag (see SPEC §"Task-line format").
3. **Model** — see `SPEC/model.md` §"Model field" (and its "Practical guidance and agent-aware defaults" subsection) for examples and realistic defaults (mid-tier models like Grok/Sonnet often `[medium]`, or `[light]` for mechanical work); AI proposes a token (primary labels or specific name); goes on the PLAN.md task line.
4. **Long description** — the one-line PLAN.md long description (everything after `— ` on the task line). AI drafts from conversation context.

**Filing-discipline gate** (per SPEC/tasknote-selection.md §"PLAN.md filing-discipline thresholds"). Word-count the drafted long description:

- **≤50 words:** proceed.
- **51-70 words:** trim if practical; otherwise proceed with a yellow-flag note in the review surface (Step 3).
- **>70 words:** STOP. The description breaches the hard cap — `/ft-file-followup` is the wrong tool. Surface to the user: "The drafted description is `<N>` words (>70w cap). This belongs in a starter body, not a one-line PLAN.md entry. Recommend `/ft-starter-task <ID>` instead." Do not proceed unless the user trims the description below the cap.

The 70w cap exists so PLAN.md stays scannable; rich context belongs in starter bodies (`/ft-starter-task`) or full tasknotes (`/ft-task`). `/ft-file-followup`'s niche is the ≤50w + ephemeral-context band only.

## Step 3 — Draft, scan, and surface for review

Draft the conversational paragraph from prior conversation context. **Free-form prose**, no fixed schema or bold-prefix prompts; the SKILL prescribes intent only:

- **What surfaced this follow-up** (the rationale tying it to the current conversation or active tasknote).
- **Suspected scope** (files / paths / hypotheses, when the conversation has surfaced any).
- **Why this priority and model** (one short clause when non-obvious; skip if obvious from the line itself).

Keep the paragraph under ~80 words. If the conversation has surfaced more context than fits, that is itself a signal to use `/ft-starter-task` instead — surface to the user.

**Downstream-impact reconciliation scan** (per SPEC/tasknote-selection.md §"Downstream-impact reconciliation" — authoritative for triggers, scan steps, and vocabulary). After drafting the new line, scan **active** PLAN entries (`High` / `Medium` / `Low` / `Future Opportunities`; `## Completed` is out of scope) for ones that share a surface with the new follow-up — same files, subsystem, contract, or a cited `[[wikilink]]` dependency. For each, classify impact (stale / contradictory / redundant / unaffected) and propose one reconcile action (merge / nest / edit / delete / leave). Routine filings that obviously touch nothing downstream (first task in a fresh area, a self-contained ticket) skip the scan — apply judgment, then note "no downstream impact" in the review surface. **Propose only — never edit an existing line before the user confirms** (the user-confirm gate is the existing review below, not a separate approval).

**Surface for review.** Show the user, in one short message:

- The proposed PLAN.md line, exactly as it will be appended.
- The drafted conversational paragraph.
- **Any proposed reconcile actions** — one impacted entry per line with its classification and proposed action (or "no downstream impact" when the scan found none or was skipped).

Edit per their feedback before writing anything. Do not skip the review. The reconcile proposals fold into this same review gate — they are not a separate approval step.

## Step 4 — File the entry

In one continuous motion, after the user has confirmed the Step 3 review (including any reconcile proposals):

1. **Append the PLAN.md entry.** Append a new entry under the appropriate `## <Priority>` heading using the canonical task-line grammar (SPEC §"Task-line format"):

   ```
   - [ ] **<TASK-ID>** [<model>] | <shortname> — <one-line long description>
   ```

   Placement:
   - If the priority section already has entries, append to the bottom of that section.
   - If the section carries a `(none)` placeholder, replace the placeholder with the new entry.

   No `Filed with starter at ...` pointer (that suffix is `/ft-starter-task`'s contract). The new line carries only the long description — no breadcrumb to a tasknote that doesn't exist.

2. **Apply confirmed reconcile edits.** If the Step 3 scan surfaced impacted entries and the user accepted (or amended) any proposed actions, apply those PLAN.md edits in the same motion — merge / nest / edit / delete the affected lines per the confirmed action. Apply nothing the user rejected or didn't see. No impact (or scan skipped) → no-op.

3. **Deliver the conversational paragraph.** Surface the reviewed paragraph from Step 3 in the same response as the filing confirmation. The paragraph is **chat-only** — never persisted to disk, never written into the active tasknote.

## Step 5 — Hand off

Surface to the user, in one short message:

- `<TASK-ID>` filed at `.flowtron/PLAN.md` under `## <Priority>` with model `<model>`.
- The follow-up sits as a one-line PLAN.md entry until `/ft-task <TASK-ID>` (or `/ft-micro-task` / `/ft-starter-task` for promotion) fires.
- (Conversational paragraph from Step 4.3 is included in this response.)

Do **not** commit unprompted. The new PLAN.md line is typically bundled into whatever commit the surrounding conversation produces (if any) or left for the user to handle. If the user asks for a commit, the message format is `chore: file <TASK-ID> follow-up — <shortname>`.

## Notes

- **Filing-only — no design decisions in the skill flow itself.** All context (rationale, suspected files, recommended priority/model) comes from the prior conversation; the skill just records the line and surfaces the paragraph.
- **Routing across the filing cohort:** see SPEC/tasknote-selection.md §"When to use a tasknote (and when not to)" for the full decision tree. `/ft-file-followup`'s niche: ≤50w + ephemeral context only. Tangential idea + resume inline + no review gate → `/ft-sidequest` (lighter). Above 50w → `/ft-starter-task`. Filing+executing in one shot → `/ft-micro-task`. Starting an existing PLAN.md entry → `/ft-task`.
- **No active-tasknote breadcrumb.** When invoked from inside `/ft-task`, `/ft-file-followup` does not write into the active tasknote — keeps the active tasknote a record of what it was for, not a coordination ledger. This is the strict reading of "only one PLAN.md line on disk."
