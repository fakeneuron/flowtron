---
description: Start a hypothesis-first debugging tasknote for the given task ID and drive it through the SPEC's 4-phase workflow with structured prompts for expected/observed, hypotheses, and minimal repro inside Phase 1 Discovery. Soft pragmatic tone; no Iron Law framing. Uses the standard `templates/tasknote-template.md`.
argument-hint: <TASK-ID> [--fast | -f]
---

Invoke the `debug` skill with `args="$ARGUMENTS"`. The skill scaffolds `_project/tasknote/$ARGUMENTS.md` from the standard flowtron template, runs Phase 1 Discovery with explicit hypothesis-first scaffolding (capture expected vs observed → generate & rank hypotheses → design & run minimal repro), then continues conversationally through Phases 2-4 and the post-closure protocol.

Supports the same `--fast` / `-f` flag semantics as `/ft-task` (autonomous execution; still fires 🛠️ on Re-scope/De-scope).

If `$ARGUMENTS` is empty, ask the user for a task ID before invoking the skill.

Usage:

- `/ft-debug <TASK-ID>` — default flow with conditional gates per SPEC §"Operator-gate cues".
- `/ft-debug <TASK-ID> --fast` (or `-f`) — operator opt-in for fully autonomous runs (👁️ and 📦 signals suppressed where safe).

For non-debug implementation or refactors, prefer `/ft-task <TASK-ID>` or `/ft-micro-task <TASK-ID>`. For filing rich context without starting, use `/ft-starter-task`. For lightweight follow-ups, `/ft-file-followup`. For opening/closing epics, `/ft-epic-discovery` and `/ft-close-epic`.