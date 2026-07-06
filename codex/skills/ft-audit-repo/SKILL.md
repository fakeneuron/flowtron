---
name: ft-audit-repo
description: Run the Flowtron first-contact repo audit from Codex. Use to map an unfamiliar repo, synthesize themes, and file milestone epics.
---

# ft-audit-repo - Codex wrapper

Read and follow `../../../claude/skills/ft-audit-repo/SKILL.md`.

Translate Claude-specific execution details to Codex equivalents:
- Use a concise prose question when the source skill asks for a structured ask and no Codex structured prompt is available.
- Invoke sibling Flowtron Codex skills by their `ft-*` names when a source step references another skill.
- Treat `.claude/` paths as Claude-only install paths; Codex install paths are documented in `../../../codex/AGENTS-snippet.md`.

Treat `../../../SPEC.md` and lazy modules under `../../../SPEC/` as authoritative when source instructions diverge from the contract.
