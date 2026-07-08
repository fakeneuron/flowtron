---
description: Bootstrap a fresh ~/code/ project with flowtron — adds the submodule, wires /ft-task, drops in PLAN.md + tasknote README, creates/patches AGENTS.md, and stages the commit.
---

Invoke the `new-project` skill. The skill verifies preconditions (cwd is a git repo with `CLAUDE.md`, no existing flowtron wiring), collects the project name and pinned flowtron version, and walks through the bootstrap steps from flowtron's `docs/MIGRATION.md` §1 conversationally. Stages all bootstrap files and surfaces the commit message for user approval — does not commit unprompted.

For starting an existing PLAN.md task (starter, follow-up line, or fresh), use `/ft-task <TASK-ID>`. For small file + execute one-shots, use `/ft-micro-task <TASK-ID>`. For filing a rich-context starter mid-flow, use `/ft-starter-task [TASK-ID]`. For lightweight follow-up filings (no tasknote artifact), use `/ft-file-followup [TASK-ID]`. For opening a new epic, use `/ft-epic-discovery`. For closing one, use `/ft-close-epic`. For migrating an existing project from a prior workflow system, use flowtron's `docs/MIGRATION.md` §2 manually — that path involves judgment calls and is not automated by this skill.
