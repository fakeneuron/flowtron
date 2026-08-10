---
description: File a starter tasknote for a task discovered mid-flow with rich AI-captured context.
argument-hint: [TASK-ID]
---

Invoke the `ft-starter-task` skill with `args="$ARGUMENTS"`. The skill validates the task ID against PLAN.md when provided, or suggests the next available task ID for review when omitted. It collects task ID / priority / model / title via AskUserQuestion, drafts the `## 🌱 Starter context` body from prior conversation context, writes `.flowtron/tasknote/<TASK-ID>.md` from `templates/tasknote-starter-template.md`, appends a new PLAN.md entry under the chosen priority, and auto-commits both (`chore: file <ID> starter — <shortname>`, staged path-explicitly; skipped when PLAN.md already carried other edits).

For starting an existing task (starter or fresh), use `/ft-task <TASK-ID>`. For parking an idea or quick fix with minimal disruption, use `/ft-file-followup --park [--low|--med|--fut] [TASK-ID]`. For lighter mid-flow filings without a tasknote artifact, use `/ft-file-followup [TASK-ID]`. For small file + execute one-shots, use `/ft-micro-task <TASK-ID>`. For filing an epic instead of a single task, use `/ft-epic-discovery`. For closing an epic, use `/ft-close-epic`. For bootstrapping a fresh repo with flowtron, use `/ft-new-project`.
