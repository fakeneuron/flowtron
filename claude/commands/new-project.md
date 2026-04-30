---
description: Bootstrap a fresh ~/code/ project with flowtron — adds the submodule, wires /task, drops in PLAN.md + tasknote README, patches CLAUDE.md, and stages the commit.
---

Invoke the `new-project` skill. The skill verifies preconditions (cwd is a git repo with `CLAUDE.md`, no existing flowtron wiring), collects the project name and pinned flowtron version, and walks through the bootstrap steps from flowtron's `docs/MIGRATION.md` §1 conversationally. Stages all bootstrap files and surfaces the commit message for user approval — does not commit unprompted.

For migrating an existing project from a prior workflow system, use flowtron's `docs/MIGRATION.md` §2 manually — that path involves judgment calls and is not automated by this skill.
