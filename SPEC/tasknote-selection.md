---
paths: []
---

# Tasknote selection

> Lazy-loaded SPEC module. Loaded by the filing/runner skills (`/ft-task`, `/ft-starter-task`, `/ft-micro-task`, `/ft-file-followup`, `/ft-debug`, `/ft-epic-discovery`, `/ft-close-epic`, `/ft-release`, `/ft-worktree-{start,end}`) when they need the use/skip thresholds, filing-discipline word budget, or `## Completed` archive convention. See `SPEC.md` for the always-loaded core spec.

## When to use a tasknote (and when not to)

**Use a tasknote when:**

- The change touches more than one file
- The work takes more than ~15 minutes
- The task has a `<AREA>-<NUMBER>` ID in PLAN.md
- The work involves design tradeoffs the assistant should record

**Skip the tasknote for:**

- Single-line typo fixes
- Pure formatting tweaks
- Documentation patches under ~10 lines
- Trivial config edits with no logic impact

**File a starter (`/ft-starter-task <ID>`) when:**

- The PLAN.md long description would exceed **~50 words (target) or 70 words (hard cap)** — richer context belongs in the starter body, not on the line
- A task is discovered mid-flow with rich context (rationale, design decisions, file survey, open questions) but isn't ready to start now
- The captured context would be lost or would bloat the PLAN.md long description if recorded as inline prose
- The right shape isn't fully obvious; the AI wants to preserve the survey and open questions for resolution at `/ft-task` checkout
- Rich mid-conversation context (epic brief, design conclusion, multi-step plan) won't be consumed in this session — park it in a starter now to protect against `/clear` loss, rather than surfacing it as a parenthetical "run `/ft-X` next and paste this" suggestion

**Skip the starter (just add a one-line PLAN.md entry) when:**

- The long description fits inside ~50 words (a scannable one-liner)
- The task is straightforward enough that the long description suffices
- No design decisions or file survey work has been done yet
- The next available `/ft-task <ID>` slot is the natural next move (file, then start; no sitting time)

**File a follow-up (`/ft-file-followup <ID>`) when:**

- A new task surfaces mid-flow (typically inside an active `/ft-task`) and the long description fits in ≤50 words, but the surrounding conversation context (why this came up, suspected files, recommended priority/model) is worth surfacing once at filing time without persisting it to disk
- The follow-up is clear enough that it doesn't need a starter body — but you still want a paragraph of rationale visible in chat alongside the new PLAN.md line
- You want the lightest filing motion in the cohort: one PLAN.md line written, a short paragraph delivered conversationally, zero edits to the active tasknote

A `/ft-file-followup` filing produces **no tasknote file** — the rationale paragraph lives in chat only, and the active tasknote (if any) is not edited.

**Skip the follow-up (use `/ft-starter-task` or just inline a PLAN.md line) when:**

- The description would breach 50 words — use `/ft-starter-task`; rich context belongs in the starter body
- Persistent context (file survey, open questions, design decisions) is worth preserving to disk — same call
- You're outside any active conversation that produced the rationale — write the PLAN.md line directly

**File a micro-tasknote (`/ft-micro-task <ID>`) when:**

- The task is above the skip threshold (more than a one-liner; touches code or non-trivial doc state) but small enough that the full 4-phase ceremony is overkill — typically under ~30 minutes of effort
- The change is single-file or near-single-file, with no design tradeoffs worth recording across multiple subtasks
- The shape is obvious enough that Acceptance/Subtasks checklists would just restate the goal — but you still want the relevance / drift / archive-skim / pattern-survey contracts before writing code
- Examples: small audits, focused doc patches, single-file behavior tweaks with clear scope

A micro-tasknote uses a single `## ⚡ Notes` section (bold-prefix prompts for relevance / drift / archive / pattern / implementation) instead of the four phase checklists; closure flips PLAN.md + the tasknote location like a normal tasknote. The `/ft-micro-task` skill is **file + execute (one-shot)** — scaffold, execute inline, close in one conversation.

**Skip the micro-tasknote (use `/ft-task` instead) when:**

- The task touches multiple files or has design tradeoffs to record
- The task is likely to take more than ~30 minutes
- The 4-phase log would carry useful state for downstream tasknotes or audits
- You're unsure — default to `/ft-task`. The Discovery phase pays for itself.

**Run a debug tasknote (`/ft-debug <ID>`) when:**

- The work is investigating a bug, regression, or other unexpected behavior where the root cause is not yet known
- Hypothesis-first cadence pays off: capturing expected vs. observed first, ranking hypotheses, and designing a minimal repro before code edits prevents shotgun-debugging
- The fix lives behind the investigation — Phase 1 produces the hypothesis, Phase 2 targets it, and Phase 3 re-verifies the same minimal repro to confirm the root cause (not just the symptom) is fixed

A `/ft-debug` tasknote uses the same standard 4-phase template as `/ft-task`; the debug cadence (expected/observed → ranked hypotheses → minimal repro → re-verify) lives inside the skill's Phase 1 and Phase 3 drive, not in the template itself.

**Skip the debug tasknote (use `/ft-task` instead) when:**

- The work is feature-shaped, not bug-shaped — the goal is to *add* behavior, not to explain *unexpected* behavior
- The root cause is already known at filing time and the work is just landing the fix — `/ft-task`'s standard Phase 1 is enough
- The bug is trivial (typo, one-liner) — `/ft-task` (or the skip-the-tasknote rule above) is the right shape

When in doubt, write the full tasknote. The 4-phase ceremony pays for itself.

## PLAN.md filing-discipline thresholds

Active PLAN.md long descriptions (everything after `— ` on the task line)
are subject to a hard word budget — the index reads cleanly only when each
line stays scannable, and rich context routes into starter bodies:

| Range | Status | Action |
|---|---|---|
| ≤50 words | Target — comfortably scannable | Keep the one-liner |
| 51-70 words | Yellow flag | Trim if practical; otherwise consider promoting to a starter |
| >70 words | Hard cap — exceeded | Move the rich context into a starter body via `/ft-starter-task <ID>`; PLAN.md line keeps a ≤50w summary |

The thresholds apply to **active** task lines (`High` / `Medium` /
`Low` / `Future Opportunities`). Lines under `## Completed`
are governed by §"`## Completed` archive convention" below.

`/ft-starter-task`, `/ft-file-followup`, and `/ft-task` flag filings that
breach the cap at filing/scaffold time — see the respective skill files
for the mechanism. `/ft-file-followup` declines at >70w and routes to
`/ft-starter-task`.

## `## Completed` archive convention

Closed task lines under `## Completed` collapse to a stub form:

```markdown
- [x] **TASK-ID** [model] | shortname — Completed YYYY-MM-DD.
```

The long description drops — the archived tasknote at
`.flowtron/tasknote/archive/<area>/<TASK-ID>.md` is the canonical record.
Phase 4 closure rewrites the line to the stub form (not just the
checkbox + date); `| shortname` is required so visualizers have a row
title, `[model]` stays optional. Adopting projects pick up the
convention on their next bump (additive change; legacy paragraph-form
entries continue to parse).

**Exception — inline audit fixes.** A trivial fix applied inline by an
audit skill (the `/ft-audit*` §5 trivial-fix carve-out: skip-the-tasknote-sized
patches done at audit time instead of filed as a `## Low` ticket) has no
tasknote and no archive file, so its `## Completed` line **retains** a
short self-contained description plus `Surfaced by <audit-label>
YYYY-MM-DD (Finding #N, <severity>), fixed inline` — here the line itself
is the canonical record.
