---
description: Start a flowtron tasknote for the given task ID and drive it through the SPEC's 4-phase workflow.
argument-hint: <TASK-ID>
---

Invoke the `task` skill with `args="$ARGUMENTS"`. The skill scaffolds `_project/tasknote/$ARGUMENTS.md` from the flowtron template, runs Phase 1 Discovery, and continues through phases 2-4 plus the post-closure protocol.

If `$ARGUMENTS` is empty, ask the user for a task ID before invoking the skill.

Usage:

- `/ft-task <TASK-ID>` — default flow with conditional gates per SPEC §"Operator-gate cues" (🛠️ fires when Discovery has clarifying questions; 📦 fires when the closure diff trips signal rules).
- `/ft-task <TASK-ID> --fast` (or `-f`) — operator opt-in: suppresses the 🛠️ Phase 1→2 banner, the 👁️ frontend visual-confirmation prose ask, and the 📦 ready-to-commit signal trips. Re-scope/De-scope still fires 🛠️ (drift carve-out). For routine runs where the operator wants autonomous execution end-to-end.

For small file + execute one-shots, use `/ft-micro-task <TASK-ID>`. For filing rich-context starters mid-flow, use `/ft-starter-task <TASK-ID>`. For lightweight follow-up filings (no tasknote artifact), use `/ft-file-followup <TASK-ID>`. For opening a new epic, use `/ft-epic-discovery`. For closing one, use `/ft-close-epic`. For bootstrapping a fresh repo with flowtron, use `/ft-new-project`.
