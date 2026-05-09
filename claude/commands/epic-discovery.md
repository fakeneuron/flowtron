---
description: File a new flowtron epic and drive its `.1` Discovery tasknote in one motion — files parent + `.1` + `.N` audit PLAN lines, scaffolds `.1` with tailored pre-fill, then drives the full 4-phase Discovery (deliverable = filed implementation children).
---

Invoke the `epic-discovery` skill. The skill verifies cwd is a flowtron-using project, collects inputs (area + shortname + priority + model + total-subtask-count N) via AskUserQuestion, scans `_project/PLAN.md` + archive for the next available `<AREA>-EPIC-<N>` numeric suffix, files three PLAN.md lines (parent epic + `.1` Discovery + `.N` audit placeholder) under the chosen priority, scaffolds the `.1` tasknote with tailored Goal / Acceptance / Subtasks, then drives the full 4-phase tasknote inline through closure (Phase 2 deliverable = filed implementation children `.2..(N-1)`).

Takes no arguments — all inputs collected via AskUserQuestion.

For starting an existing PLAN.md entry, use `/task <TASK-ID>`. For the closing audit subtask of an epic, use `/close-epic` (sibling skill that scaffolds + drives the audit `.N` tasknote and prompts to flip the parent epic line). For mid-flow follow-up filings, use `/file-followup <TASK-ID>` (lightweight, no tasknote artifact). For starter tasknotes (single-task scope, rich AI-captured context), use `/starter-task <TASK-ID>`. For bootstrapping a fresh repo with flowtron, use `/new-project`.
