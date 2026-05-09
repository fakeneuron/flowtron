---
description: File a mid-flow follow-up task — one PLAN.md line + a short conversational context paragraph (no tasknote artifact). Lighter than /starter-task.
argument-hint: <TASK-ID>
---

Invoke the `file-followup` skill with `args="$ARGUMENTS"`. The skill validates the task ID against PLAN.md, collects priority / model / title / long-description via AskUserQuestion, enforces the SPEC §"PLAN.md filing-discipline thresholds" cap (>70w → suggests `/starter-task` instead), drafts a short conversational context paragraph, surfaces both for review, then appends the PLAN.md entry and delivers the paragraph in chat. Does not commit unprompted; produces zero artifacts on disk beyond the one new PLAN.md line.

If `$ARGUMENTS` is empty, ask the user for a task ID before invoking the skill.

For tasks with rich context (file survey / design decisions / open questions) that warrant persisting, use `/starter-task <TASK-ID>`. For starting an existing task (starter, follow-up line, or fresh), use `/task <TASK-ID>`. For small file + execute one-shots, use `/micro-task <TASK-ID>`. For bootstrapping a fresh repo with flowtron, use `/new-project`.
