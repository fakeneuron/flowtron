---
description: File a starter tasknote for a task discovered mid-flow with rich AI-captured context.
argument-hint: <TASK-ID>
---

Invoke the `starter-task` skill with `args="$ARGUMENTS"`. The skill validates the task ID against PLAN.md, collects priority / model / title via AskUserQuestion, drafts the `## 🌱 Starter context` body from prior conversation context, writes `_project/tasknote/$ARGUMENTS.md` from `templates/tasknote-starter-template.md`, and appends a new PLAN.md entry under the chosen priority. Does not commit unprompted.

If `$ARGUMENTS` is empty, ask the user for a task ID before invoking the skill.

For starting an existing task (starter or fresh), use `/task <TASK-ID>`. For lighter mid-flow filings without a tasknote artifact, use `/file-followup <TASK-ID>`. For small file + execute one-shots, use `/micro-task <TASK-ID>`. For filing an epic instead of a single task, use `/epic-discovery`. For closing an epic, use `/close-epic`. For bootstrapping a fresh repo with flowtron, use `/new-project`.
