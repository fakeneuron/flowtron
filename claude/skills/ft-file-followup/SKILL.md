---
name: ft-file-followup
description: File a mid-flow follow-up task from inside an active tasknote — and, with `--park`, park an idea or quick fix mid-session without losing it (tiny stub + PLAN line, priority flags, resume inline). Use when the user asks to file a quick follow-up task discovered mid-flow without a full tasknote, or to park a tangential idea, quick fix, or "don't lose this" thought while staying on the current work. Invoke with an optional task ID as args (e.g., args="CORE-058", "CORE-058 --park", or "--park --low fix null guard"); when omitted, the default flow suggests the next available ID for review and park mode auto-allocates one. Default flow writes one PLAN.md line and delivers a short context paragraph conversationally only — no tasknote artifact. Lighter than `/ft-starter-task`. See SPEC/tasknote-selection.md §"When to use a tasknote" for the threshold.
---

# file-followup — flowtron lightweight follow-up filer

You are filing a **follow-up task** for the task ID provided in `args`, or for
the suggested ID confirmed during input collection when `args` is omitted. The
full filing thresholds live in `SPEC/tasknote-selection.md` §"When to use a
tasknote (and when not to)" — this skill is the executable interpretation, not
a replacement. Treat SPEC.md as authoritative when this file is silent or in
tension.

A default `/ft-file-followup` filing produces **zero artifacts on disk beyond a single PLAN.md task line**. The "short context paragraph" — rationale + suspected scope + recommended priority/model — is delivered conversationally only, in the same response as the filing confirmation. There is no tasknote file. Active tasknotes (if `/ft-file-followup` runs mid-flow inside `/ft-task`) are **not** edited — no breadcrumb, no log entry. The active tasknote stays a record of what it was for, not a coordination ledger.

This skill is **filing-only and lighter than `/ft-starter-task`**: use it when the description fits in ≤50 words and no rich context (file survey / open questions / design decisions) needs to persist. If the description would breach 70 words or rich context warrants preserving, escalate to `/ft-starter-task` instead — the SKILL surfaces this gate at Step 2.

**Park mode (`--park`)** is the one deviation from both paragraphs above: it writes a tiny stub at `.flowtron/sidequest/<ID>.md` in addition to the PLAN.md line, skips the review gate and the reconciliation scan, and resumes the interrupted work inline instead of handing off. Full flow: `park-mode.md` (Step 0 loads it when the flag is present).

If the task ID is missing, suggest one during input collection instead of
requiring it up front. If a non-flag token is present but doesn't match
`<AREA>-<NUMBER>` (or `<AREA>-<NUMBER>.<SUB>` for epic subtasks), stop and ask
the user for a valid task ID.

## Step 0 — Resolve paths and parse args

Two layouts. Pick by which file exists:

- **Adopter project:** `.flowtron/core/SPEC.md` exists → SPEC=`.flowtron/core/SPEC.md`, SKILL_DIR=`.flowtron/core/claude/skills/ft-file-followup/`, template=`.flowtron/core/templates/sidequest-template.md`.
- **Flowtron self-host:** repo-root `SPEC.md` with heading `# Flowtron — Workflow Specification` → SPEC=`SPEC.md`, SKILL_DIR=`claude/skills/ft-file-followup/`, template=`templates/sidequest-template.md`.

If neither matches, bail. PLAN=`.flowtron/PLAN.md`, tasknote dir=`.flowtron/tasknote/`, sidequest dir=`.flowtron/sidequest/` either way.

**Parse `args`.** Treat `args` as an **unordered flag set** plus free text —
recognize each token independently; order never matters. Initialize
`park-mode = false`, then walk the tokens:

- **`--park` or `-p`** → set `park-mode = true`.
- **`--low` / `--med` / `--medium` / `--fut` / `--future` / `--high`** → a park-mode priority flag; strip and carry. Outside park mode these are meaningless — surface the usage notice below rather than silently ignoring them.
- **A `<AREA>-<NUMBER>` token** → the proposed task ID.
- **Any other `--`-prefixed token** → surface a one-line usage notice (``Unknown arg `<arg>`. Usage: `/ft-file-followup [TASK-ID] [--park [--low|--med|--fut|--high]]`.``) and ask whether the user meant `--park`, a priority flag, or the default flow. Do not proceed silently.
- **Remaining free text** → the idea text (park mode) or drafting context (default flow).

**When `park-mode = true`, Read `<SKILL_DIR>park-mode.md` now and follow it
instead of Steps 2–5 below.** Park mode is a distinct filing contract — it keeps
Step 1a's pre-flight checks and this step's path resolution, then bypasses the
AskUserQuestion collection, the review gate, the downstream-impact reconciliation
scan, the conversational paragraph, and the Step 5 hand-off. It writes a stub at
`.flowtron/sidequest/<ID>.md` alongside the PLAN.md line, replies in ≤70 words,
and continues the interrupted work inline. Emit the inline marker
`📌 --park active — no review gate, no reconcile scan; stub + PLAN line, then resume inline.`

Default flow (`park-mode = false`) is byte-identical to the pre-flag skill.

## Step 1 — Resolve or suggest the task ID

If no task ID token was parsed in Step 0, propose a **Suggested ID** before
collecting the rest of the fields (park mode auto-allocates instead — see
`park-mode.md` Step P1):

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

If a task ID token was parsed in Step 0, use it as the proposed task ID.

## Step 1a — Pre-flight checks

- Resolve the **Area** from the task ID prefix per SPEC §"Task ID convention". Unknown prefix → read `.flowtron/tasknote/README.md`; if still unresolved, stop and ask.
- The task ID must NOT already exist in PLAN.md. If it does, stop and ask whether the user meant a different ID — `/ft-file-followup` files NEW tasks; reusing an existing entry is out of scope.
- `.flowtron/tasknote/<TASK-ID>.md` must NOT already exist. If it does, stop. Surface the conflict (could be in-flight, blocked, completed, starter, or already a follow-up that was promoted).
- `.flowtron/tasknote/archive/<area>/<TASK-ID>.md` must NOT already exist. If it does, stop — the ID has been used and archived; pick a fresh ID.
- **Park mode only:** `.flowtron/sidequest/<TASK-ID>.md` must NOT already exist either. On conflict, stop and ask for a different ID.

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

1. **Filing-commit pre-check.** Run `git status --porcelain -- .flowtron/PLAN.md` **before any write** and record the result as `auto-commit`: clean output → `auto-commit = true`; any output → `auto-commit = false` (PLAN.md already carries foreign edits, so the filing rides along in the surrounding commit instead). It must run here, immediately before the append — Steps 2-3 span operator turns, so a reading taken at pre-flight can go stale. Not a gate: nothing stops either way; it only decides whether item 4 below runs. Contract: SPEC/tasknote-selection.md §"Filing commits".

2. **Append the PLAN.md entry.** Append a new entry under the appropriate `## <Priority>` heading using the canonical task-line grammar (SPEC §"Task-line format"):

   ```
   - [ ] **<TASK-ID>** [<model>] | <shortname> — <one-line long description>
   ```

   Placement:
   - If the priority section already has entries, append to the bottom of that section.
   - If the section carries a `(none)` placeholder, replace the placeholder with the new entry.

   No `Filed with starter at ...` pointer (that suffix is `/ft-starter-task`'s contract). The new line carries only the long description — no breadcrumb to a tasknote that doesn't exist.

3. **Apply confirmed reconcile edits.** If the Step 3 scan surfaced impacted entries and the user accepted (or amended) any proposed actions, apply those PLAN.md edits in the same motion — merge / nest / edit / delete the affected lines per the confirmed action. Apply nothing the user rejected or didn't see. No impact (or scan skipped) → no-op.

4. **Commit the filing** (when `auto-commit = true` from step 1 above). The filing's **last** write, so confirmed reconcile edits land with it. Stage the one path by name — never `git commit -a` / `git add .` / `git add -A`, since a mid-flow filing sits in a working tree carrying the parent `/ft-task`'s unfinished edits:

   ```sh
   git add .flowtron/PLAN.md
   git commit -m "chore: file <TASK-ID> follow-up — <shortname>"
   ```

   Commit only — never push. `auto-commit = false` → skip this step entirely and note it in Step 5. Full contract: SPEC/tasknote-selection.md §"Filing commits".

5. **Deliver the conversational paragraph.** Surface the reviewed paragraph from Step 3 in the same response as the filing confirmation. The paragraph is **chat-only** — never persisted to disk, never written into the active tasknote.

## Step 5 — Hand off

Surface to the user, in one short message:

- `<TASK-ID>` filed at `.flowtron/PLAN.md` under `## <Priority>` with model `<model>`, `committed <sha>` — or, when Step 4.4 was skipped, `left uncommitted (PLAN.md already carried other edits)`.
- The follow-up sits as a one-line PLAN.md entry until `/ft-task <TASK-ID>` (or `/ft-micro-task` / `/ft-starter-task` for promotion) fires.
- (Conversational paragraph from Step 4.5 is included in this response.)

The filing is committed by Step 4.4 — the Step 3 review approval **is** the commit authorization, so there is no separate commit-go ask. Report the SHA as plain text; emit **no 🏁 marker** (that glyph is reserved for a closure commit covering Acceptance deliverables — SPEC.md §"Paper-complete guard" §3). Never push. When the pre-check set `auto-commit = false`, the new PLAN.md line is instead bundled into whatever commit the surrounding conversation produces, exactly as before.

## Notes

- **Filing-only — no design decisions in the skill flow itself.** All context (rationale, suspected files, recommended priority/model) comes from the prior conversation; the skill just records the line and surfaces the paragraph.
- **Routing across the filing cohort:** see SPEC/tasknote-selection.md §"When to use a tasknote (and when not to)" for the full decision tree. The default flow's niche: ≤50w + ephemeral context only. Tangential idea + resume inline + no review gate → add `--park` (lighter; see `park-mode.md`). Above 50w → `/ft-starter-task`. Filing+executing in one shot → `/ft-micro-task`. Starting an existing PLAN.md entry → `/ft-task`.
- **No active-tasknote breadcrumb.** When invoked from inside `/ft-task`, `/ft-file-followup` does not write into the active tasknote — keeps the active tasknote a record of what it was for, not a coordination ledger. This is the strict reading of "only one PLAN.md line on disk."
