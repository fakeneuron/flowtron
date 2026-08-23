---
name: ft-refactor
description: Plan a refactor of one named target as a sequenced, behavior-preserving epic from Codex — `ft-refactor <target> [--fast]`. Read-only depth analysis, operator-reviewed plan, then files parent epic + implementation children + `.N` audit with starter tasknotes. Never edits code.
---

# ft-refactor - Codex wrapper

Read and follow `../../../claude/skills/ft-refactor/SKILL.md`.

Translate Claude-specific execution details to Codex equivalents:
- Use a concise prose question when the source skill asks for a structured ask and no Codex structured prompt is available.
- Invoke sibling Flowtron Codex skills by their `ft-*` names when a source step references another skill.
- Treat `.claude/` paths as Claude-only install paths; Codex install paths are documented in `../../../codex/AGENTS-snippet.md`.

Treat `../../../SPEC.md` and lazy modules under `../../../SPEC/` as authoritative when source instructions diverge from the contract.
