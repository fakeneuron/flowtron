---
name: ft-epic-discovery
description: Open a Flowtron epic from Codex by filing parent, discovery child, audit placeholder, and implementation children. With `--deep`, stage a constitution → specify → clarify pre-pass before Phase 1 Discovery for high-uncertainty epics.
---

# ft-epic-discovery - Codex wrapper

Read and follow `../../../claude/skills/ft-epic-discovery/SKILL.md`.

Translate Claude-specific execution details to Codex equivalents:
- Use a concise prose question when the source skill asks for a structured ask and no Codex structured prompt is available.
- Invoke sibling Flowtron Codex skills by their `ft-*` names when a source step references another skill.
- Treat `.claude/` paths as Claude-only install paths; Codex install paths are documented in `../../../codex/AGENTS-snippet.md`.

Treat `../../../SPEC.md` and lazy modules under `../../../SPEC/` as authoritative when source instructions diverge from the contract.
