---
description: Close an epic by scaffolding and driving its audit `.N` tasknote, then prompting to flip the parent `<AREA>-EPIC-<N>` to `Completed`. Pre-fills the audit tasknote with the fixed doc-drift sweep acceptance line per `SPEC/epic.md`.
argument-hint: <AUDIT-SUBTASK-ID>
---

Invoke the `close-epic` skill with the audit subtask ID (e.g., `/ft-close-epic CORE-057.N`; legacy numeric audit IDs like `CORE-057.6` are also accepted). The skill verifies cwd is a flowtron-using project, parses the arg as `<AREA>-<NUMBER>.<SUB>`, walks `.flowtron/PLAN.md` to confirm the ID is the parent epic's audit child — the reserved `.N` suffix (canonical) or the highest numeric `.<SUB>` (legacy) — and hard-bails otherwise, warns-and-proceeds-on-user-confirm if any sibling implementation children are still open, scaffolds the audit tasknote with the fixed doc-drift sweep Acceptance line + parameterized cohort-coherence Subtasks, drives the full 4-phase audit inline through closure, then surfaces parent-epic state and asks the user whether to flip the parent line + move the cohort to `## Completed` (default Yes).

Bracket twin of `/ft-epic-discovery` (which opens an epic). For starting an existing standalone PLAN.md entry, use `/ft-task <TASK-ID>`. For mid-flow follow-up filings (typical: audit-surfaced misses), use `/ft-file-followup <TASK-ID>`. For starter tasknotes, use `/ft-starter-task <TASK-ID>`. For micro tasks, use `/ft-micro-task <TASK-ID>`. For bootstrapping a fresh repo with flowtron, use `/ft-new-project`.
