---
description: Start and complete a flowtron micro-tasknote in one shot for tasks above the skip threshold but below the full 4-phase ceremony.
argument-hint: <TASK-ID>
---

Invoke the `micro-task` skill with `args="$ARGUMENTS"`. The skill validates the task ID against PLAN.md, scaffolds `_project/tasknote/$ARGUMENTS.md` from `templates/tasknote-micro-template.md`, drives execution inline (relevance · drift · archive skim · pattern survey · implementation), recaps, flips PLAN.md, and archives the tasknote — single conversation flow. See SPEC §"When to use a tasknote (and when not to)" for the micro carve-out threshold.

If `$ARGUMENTS` is empty, ask the user for a task ID before invoking the skill.

For full 4-phase tasks, use `/ft-task <TASK-ID>`. For filing a starter (rich-context mid-flow capture, not ready to start), use `/ft-starter-task <TASK-ID>`. For lightweight follow-up filings (no tasknote artifact), use `/ft-file-followup <TASK-ID>`. For opening a new epic, use `/ft-epic-discovery`. For closing one, use `/ft-close-epic`. For bootstrapping a fresh repo with flowtron, use `/ft-new-project`.
