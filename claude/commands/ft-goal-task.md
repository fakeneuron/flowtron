---
description: Start a goal-loop tasknote for the given task ID and drive it through the SPEC's 4-phase workflow with the Phase 2↔3 execute→verify cycle run as an inline loop. Phase 1 requires every Acceptance criterion to carry a machine-checkable verify command (taste criteria split to a one-time 👁️ ask); the loop iterates under the SPEC/loop.md budget + per-cycle relevance gate, commits per verified iteration, and logs to a 🔁 Iterations section. Sibling of /ft-debug; uses the standard `templates/tasknote-template.md`.
argument-hint: <TASK-ID> [--fast | -f] [--worktree]
---

Invoke the `goal-task` skill with `args="$ARGUMENTS"`. The skill scaffolds `.flowtron/tasknote/$ARGUMENTS.md` from the standard flowtron template (plus the additive `loop:` / `loop-max:` / `loop-last-run:` frontmatter keys and a `## 🔁 Iterations` log), runs Phase 1 Discovery with the verify-command-per-Acceptance-criterion rule, then drives Phase 2↔3 as an inline execute→verify loop (per-cycle relevance gate → execute → run verify commands → commit-per-verified-iteration) until every Acceptance criterion passes, `loop-max` is hit, or the relevance gate says stop. Phase 4 closure + the post-closure protocol are unchanged.

The loop runs with `--fast` semantics by construction (`SPEC/loop.md` §"Gate collapse"): 📦 collapses to commit-per-verified-iteration, the 👁️ ask is deferred to a one-time post-loop check, and a destructive/irreversible step parks the tasknote via `status: blocked` rather than firing a banner into an unattended session.

If `$ARGUMENTS` is empty, ask the user for a task ID before invoking the skill.

Usage:

- `/ft-goal-task <TASK-ID>` — drive the goal loop inline in this session (self-paced) until convergence.
- `/ft-goal-task <TASK-ID> --fast` (or `-f`) — explicit `--fast`; largely redundant since the loop already collapses gates, accepted for parity and the one-time pre-loop Phase 1 surface.
- `/ft-goal-task <TASK-ID> --worktree` — run Phase 1 Discovery here, then hand off to `/ft-worktree-start <TASK-ID>`; re-run `/ft-goal-task <TASK-ID>` inside the fresh worktree session to drive the loop in isolation.

Reach for `/ft-goal-task` when "done" is a repeatable, machine-checkable signal (a suite going green, a number crossing a threshold, a linter/type-checker clean across many sites). For one-pass feature work or refactors with a clear diff, prefer `/ft-task <TASK-ID>` or `/ft-micro-task <TASK-ID>`. For investigating *unexpected* behavior where the root cause is unknown, use `/ft-debug <TASK-ID>`. For filing rich context without starting, use `/ft-starter-task`; for lightweight follow-ups, `/ft-file-followup`; for opening/closing epics, `/ft-epic-discovery` and `/ft-close-epic`.
