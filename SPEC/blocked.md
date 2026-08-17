---
paths: []
---

# Blocked tasks

> Lazy-loaded SPEC module. Loaded by `/ft-task` Step 3c when an existing tasknote has `status: blocked`, and at Step 5 if a hard dependency surfaces mid-Phase-2. See `SPEC.md` for the always-loaded core spec.

A task can be **blocked** at two distinct points in its lifecycle, and
flowtron records each at a different layer. The two signals are independent
— they describe different states and serve different consumers. A third,
optional tasknote-YAML key `blocked-by:` is a *planning* claim (durable
file ownership / predecessor), not a don't-start gate and not a park —
see `SPEC.md` §"Tasknote frontmatter". It does not replace either signal
below.

| Signal | Layer | Means | Entered when |
|---|---|---|---|
| `Blocked by [[ID]]` in PLAN.md long description | PLAN-line | Filed task, dependency cited, not yet started | At filing time, or via Phase 1 Re-scope |
| `status: blocked` in tasknote YAML frontmatter | Tasknote | Started and parked mid-execution | Mid-Phase-2 transition |

A task may carry one, both, or neither. Adopting projects' tools render the
two signals independently — the canonical viz parser extracts PLAN
`Blocked by [[ID]]` into `Task.blockedBy` (present whether or not the row
has a tasknote) and may show it as an opt-in row chip (default off). YAML
`blocked-by:` is separate TaskDetail meta, not that chip. The
tasknote-level `status:` drives the row's status badge for rows that have
a tasknote.

**Phase 1 entry (Re-scope path).** If Discovery surfaces a real-but-blocked
prerequisite, the verdict is `Re-scope`: add `Blocked by [[ID]]` to the
PLAN.md long description (canonical wikilink form, see §"Long-description
conventions"), delete the just-scaffolded tasknote, and halt. `status:
blocked` is reserved for mid-Phase-2 parking — a Phase 1 blocker has no
Phase 2 work to preserve. The task re-enters when the blocker clears
(remove the `Blocked by` clause; run `/ft-task <ID>` afresh). Blockers reuse
Re-scope rather than introducing a fourth Phase 1 verdict.

**Mid-Phase-2 parking.** If a hard dependency surfaces during Execution,
park the tasknote: flip YAML `status:` from `in-progress` to `blocked`,
flip the nav-header chip from `🟢 In progress` to `⏸ Blocked`, optionally
add `Blocked by [[ID]]` to the PLAN.md line (recommended for viz
visibility, not required — the two signals stay independent), and stop. Do
not run Phase 3 or Phase 4. The tasknote sits at
`.flowtron/tasknote/<TASK-ID>.md` until the blocker clears.

**Parked state.** A blocked tasknote is paused, not closed — Phase 4 is
reserved for actual completion (or a Phase 1 De-scope). The tasknote is not
archived, the PLAN.md task line stays unchecked, and Phase 1 + partial
Phase 2 work are preserved verbatim.

**Exit (resume).** Re-running `/ft-task <ID>` against a blocked tasknote enters
the resume path: drift-check the parked work first (Phase 2 progress may
rest on symbols that moved while the task was parked), flip `status:
blocked` → `in-progress`, flip the nav chip back to `🟢 In progress`,
optionally remove the `Blocked by` clause from PLAN.md (or leave it as
historical context), and continue Phase 2 from where parking left off.
Phase 1 is already complete — do not re-run it.

## Viz interaction

Adopting projects' tools render `Blocked by [[ID]]` (PLAN-line signal) and
tasknote `status: blocked` as independent signals; a row may show either,
both, or neither, and each rendering is correct in its own layer.
