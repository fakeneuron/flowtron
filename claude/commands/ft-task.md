---
description: Start a flowtron tasknote for the given task ID and drive it through the SPEC's 4-phase workflow. With `--debug`, adds a hypothesis-first cadence (expected/observed → ranked hypotheses → minimal repro → re-verify) for bugs and unexpected behavior. With `--unattended`, runs the operator-less posture — gates park the tasknote instead of firing a banner.
argument-hint: <TASK-ID> [--debug | -d] [--fast | -f] [--unattended]
---

Invoke the `ft-task` skill with `args="$ARGUMENTS"`. The skill scaffolds `.flowtron/tasknote/$ARGUMENTS.md` from the flowtron template, runs Phase 1 Discovery, and continues through phases 2-4 plus the post-closure protocol.

If `$ARGUMENTS` is empty, ask the user for a task ID before invoking the skill.

Usage:

- `/ft-task <TASK-ID>` — default flow with conditional gates per SPEC §"Operator-gate cues" (🛠️ fires on significant scope deviation under the `default-skip` flavor — Re-scope/De-scope always; clarifications that materially reshape execution; otherwise skips. 📦 fires when the closure diff trips signal rules).
- `/ft-task <TASK-ID> --fast` (or `-f`) — operator opt-in: suppresses the 👁️ frontend visual-confirmation prose ask and forces the 📦 ready-to-commit banner to its Skip branch regardless of signals. For the 🛠️ Phase 1→2 banner, `--fast` is a no-op for routine trips (default already skips); Re-scope/De-scope still fires 🛠️ (drift carve-out preserved). For routine runs where the operator wants autonomous execution end-to-end.
- `/ft-task <TASK-ID> --debug` (or `-d`) — debug mode for bugs, regressions, flaky behavior, and "why does X happen only under Y". Adds four hypothesis-first prompts inside Phase 1 Discovery (expected vs observed → generate & rank hypotheses → design & run a minimal repro) and a Phase 3 obligation to re-run that exact repro after the fix. Soft scaffolding — guidance, not a gate; no new banners. Skip it when the root cause is already known and the work is just landing the fix.

- `/ft-task <TASK-ID> --unattended` — operator-less posture, for a caller with nobody present to answer a gate. Supersets `--fast`'s autonomy, not its delegations (never pass both): the 📦 and 🛠️ suppressions apply, the 👁️ one does not, and the six gates an operator-less run cannot answer — the 🛠️ drift carve-out, a destructive-action escalation, a prerequisite ✋ ACTION, the Step 1.5 concrete-model STOP, a queued bundled in-📦 prompt, and the Phase 3 👁️ visual ask — **park** the tasknote (`status: blocked` + a `park-reason:` code) instead of firing a banner into an empty session. It removes pauses, never proof: the paper-complete guard holds in full, and a park *is* a stop. Resume by re-invoking `/ft-task <TASK-ID>` with an operator present.

The flags are orthogonal and compose in any order: `/ft-task <TASK-ID> --debug --fast` runs the hypothesis scaffolding without AskUserQuestion pauses, and the repro re-verify still runs. `--debug --unattended` does the same and parks rather than asking.

For small file + execute one-shots, use `/ft-micro-task <TASK-ID>`. For filing rich-context starters mid-flow, use `/ft-starter-task [TASK-ID]`. For lightweight follow-up filings (no tasknote artifact), use `/ft-file-followup [TASK-ID]`. For opening a new epic, use `/ft-epic-discovery`. For closing one, use `/ft-close-epic`. For bootstrapping a fresh repo with flowtron, use `/ft-new-project`.
