---
name: ft-task
description: Start or promote a Flowtron tasknote from Codex and drive the 4-phase workflow through closure. With `--debug`, drive it hypothesis-first for a bug, regression, or unexpected behavior whose root cause is not yet known.
---

# ft-task - Codex wrapper

Read and follow `../../../SPEC/procedures/ft-task.md` first. It is the agent-neutral execution SOP for this workflow.

If the SOP does not cover a needed edge case, read `../../../claude/skills/ft-task/SKILL.md` and translate Claude-specific details to Codex equivalents:
- Use a concise prose question when the source skill asks for a structured ask and no Codex structured prompt is available.
- Load lazy fragments from `../../../claude/skills/ft-task/` only when the source dispatch says they apply.
- Treat `.claude/` paths as Claude-only install paths; Codex install paths are documented in `../../../codex/AGENTS-snippet.md`.

Treat `../../../SPEC.md` and lazy modules under `../../../SPEC/` as authoritative when source instructions diverge from the contract.
