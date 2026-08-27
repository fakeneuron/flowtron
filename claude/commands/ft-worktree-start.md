---
description: Create an isolated git worktree for an independent epic child tasknote. Branches `wt-<TASK-ID>`, adds the worktree under ~/code/<project>-worktrees/wt-<TASK-ID>/, copies the active tasknote for context continuity, and hands off to a fresh session. Thin utility skill; does not drive tasknotes itself. Pair with /ft-worktree-end. See docs/WORKTREES.md for the full convention and when to use.
argument-hint: <TASK-ID>
---

Invoke the `ft-worktree-start` skill with `args="$ARGUMENTS"`. The skill performs the four mechanical steps from the convention (create `wt-<ID>` branch, `git worktree add` at the canonical sibling location, copy the live `.flowtron/tasknote/<ID>.md` into the worktree, and print a precise handoff block with the `cd` target + "Clear your session, then use 🔧/🧩/🧠/🔭 /ft-task <ID>" line, emoji chosen to match the task's [model] tag per the skill's copy-paste rule).

The skill enforces preconditions (main checkout, clean-ish status preferred, tasknote already exists for the ID) and collision checks (existing branch or worktree dir). It never mutates the source tasknote in the main checkout.

Supports only a bare `<TASK-ID>`. The `--fast` flag is not applicable here (it is for the `/ft-task` the operator will invoke *after* the handoff inside the worktree).

If `$ARGUMENTS` is empty, ask the user for a task ID before invoking the skill.

Usage:

- `/ft-worktree-start <TASK-ID>` — full safety-checked setup + conversational handoff. Use only for independent children of a multi-child epic per `docs/WORKTREES.md`.
- After handoff, the operator runs the normal `/ft-task <TASK-ID>` (or `/ft-task <TASK-ID> --fast`) inside the fresh worktree context.

This skill + its end sibling (`/ft-worktree-end`) complete the worktree-convention epic. The convention itself is workflow-orthogonal to the 4-phase contract.