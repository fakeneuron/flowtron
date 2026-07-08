---
description: File a mid-flow follow-up task — one PLAN.md line + a short conversational context paragraph (no tasknote artifact). Lighter than /ft-starter-task.
argument-hint: [TASK-ID]
---

Invoke the `file-followup` skill with `args="$ARGUMENTS"`. The skill validates the task ID against PLAN.md when provided, or suggests the next available task ID for review when omitted. It collects task ID / priority / model / title / long-description via AskUserQuestion, enforces the SPEC/tasknote-selection.md §"PLAN.md filing-discipline thresholds" cap (>70w → suggests `/ft-starter-task` instead), drafts a short conversational context paragraph, surfaces both for review, then appends the PLAN.md entry and delivers the paragraph in chat. Does not commit unprompted; produces zero artifacts on disk beyond the one new PLAN.md line.

For parking an idea or quick fix with zero review gate, use `/ft-sidequest [--low|--med|--fut] [TASK-ID]` (lighter — tiny stub, resume inline). For tasks with rich context (file survey / design decisions / open questions) that warrant persisting, use `/ft-starter-task [TASK-ID]`. For starting an existing task (starter, follow-up line, or fresh), use `/ft-task <TASK-ID>`. For small file + execute one-shots, use `/ft-micro-task <TASK-ID>`. For opening a new epic, use `/ft-epic-discovery`. For closing one, use `/ft-close-epic`. For bootstrapping a fresh repo with flowtron, use `/ft-new-project`.
