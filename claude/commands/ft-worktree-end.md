---
description: Clean up an isolated git worktree for an independent epic child tasknote. From the main checkout: verifies the `wt-<TASK-ID>` branch was merged (or operator explicitly discards), removes the worktree, archives the copied tasknote from the worktree into the main checkout's canonical archive, and optionally prunes the local `wt-` branch. Thin utility skill; does not drive tasknotes itself. Pair with /ft-worktree-start. See docs/WORKTREES.md for the full convention and when to use.
argument-hint: <TASK-ID>
---

Invoke the `worktree-end` skill with `args="$ARGUMENTS"`. The skill performs the cleanup sequence from the convention (verify merged-or-explicit-discard from the main checkout, `git worktree remove`, explicit "archive the copied tasknote" copy from the worktree's `_project/tasknote/` tree into the main's canonical archive location, optional confirmed branch prune, and a concise success block).

The skill enforces preconditions (main checkout only, TASK_ID must have a corresponding `wt-` worktree or branch) and the critical safety gate (unmerged branch requires explicit discard confirmation before any deletion). It never mutates the source tasknote or PLAN.md in the main checkout — those updates arrive via the operator's preceding `git merge` of the worktree branch (or are left open on explicit discard).

Supports only a bare `<TASK-ID>`. The `--fast` flag is not applicable here (it is for the `/ft-task` the operator ran *inside* the worktree).

If `$ARGUMENTS` is empty, ask the user for a task ID before invoking the skill.

Usage:

- `/ft-worktree-end <TASK-ID>` — full safety-checked verification + cleanup + canonical archive capture. Use only after completing (or deciding to discard) an independent child of a multi-child epic per `docs/WORKTREES.md`.
- The skill is the symmetric counterpart to `/ft-worktree-start`; together they implement the full start/end lifecycle for isolated epic-child execution.

This skill + its start sibling (`/ft-worktree-start`) plus the wiring in CORE-215.5 complete the worktree-convention epic. The convention itself is workflow-orthogonal to the 4-phase contract.