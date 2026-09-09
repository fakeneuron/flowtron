---
name: ft-goal-task
description: Start and drive a Flowtron goal-loop tasknote from Codex with execute-verify iterations until acceptance is proven. With `--worktree`, run Phase 1 then hand off so the loop runs in an isolated git worktree. With `--unattended`, run it with no operator present — the gates the loop cannot answer park the tasknote with a machine-readable stop reason. `--fast` is accepted for parity and reaches only the one-time pre-loop Phase 1 surface; the loop itself already runs with `--fast` semantics.
---

# ft-goal-task - Codex wrapper

Read and follow `../../../claude/skills/ft-goal-task/SKILL.md`, applying the Codex translation rules in `../../AGENTS-snippet.md` §"Translation rules".
