---
name: ft-file-followup
description: File a Flowtron follow-up task from Codex with one PLAN row and conversational context, without creating a tasknote artifact. With `--park`, park an idea or quick fix as a tiny stub plus PLAN row, then resume the interrupted work inline.
---

# ft-file-followup - Codex wrapper

Read and follow `../../../claude/skills/ft-file-followup/SKILL.md`.

Translate Claude-specific execution details to Codex equivalents:
- Use a concise prose question when the source skill asks for a structured ask and no Codex structured prompt is available.
- Invoke sibling Flowtron Codex skills by their `ft-*` names when a source step references another skill.
- Treat `.claude/` paths as Claude-only install paths; Codex install paths are documented in `../../../codex/AGENTS-snippet.md`.

Treat `../../../SPEC.md` and lazy modules under `../../../SPEC/` as authoritative when source instructions diverge from the contract.
