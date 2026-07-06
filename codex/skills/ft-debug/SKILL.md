---
name: ft-debug
description: Start and drive a hypothesis-first Flowtron debugging tasknote from Codex. Use for bugs with expected vs observed behavior.
---

# ft-debug - Codex wrapper

Read and follow `../../../claude/skills/ft-debug/SKILL.md`.

Translate Claude-specific execution details to Codex equivalents:
- Use a concise prose question when the source skill asks for a structured ask and no Codex structured prompt is available.
- Invoke sibling Flowtron Codex skills by their `ft-*` names when a source step references another skill.
- Treat `.claude/` paths as Claude-only install paths; Codex install paths are documented in `../../../codex/AGENTS-snippet.md`.

Treat `../../../SPEC.md` and lazy modules under `../../../SPEC/` as authoritative when source instructions diverge from the contract.
