---
name: ft-audit
description: Run the Flowtron parameterized audit workflow from Codex — `ft-audit <domain> [scope]` (general/backend/frontend/security/performance/docs/structure). Use for any audit/review/harden request matching one of these domains.
---

# ft-audit - Codex wrapper

> **Fork, don't symlink.** The scaffold this points at is stack-neutral — its
> rubrics and verification commands diverge per stack — which is why `ft-audit`
> is deliberately absent from `../../../codex/AGENTS-snippet.md` §"One-time skill
> wiring". Fork the whole `claude/skills/ft-audit/` directory (`SKILL.md` +
> `passes/`) into an unprefixed adopter skill dir (`.agents/skills/audit/` under
> Codex, per SPEC §"Skill namespace") and fill it in; symlinking this wrapper
> gets you the unfilled scaffold. Fork procedure: `../../../docs/MIGRATION.md`
> §1.2.1 — its `cp -R` block is written in Claude paths, so translate the
> destination the same way the bullets below translate `.claude/`.

Read and follow `../../../claude/skills/ft-audit/SKILL.md`.

Translate Claude-specific execution details to Codex equivalents:
- Use a concise prose question when the source skill asks for a structured ask and no Codex structured prompt is available.
- Invoke sibling Flowtron Codex skills by their `ft-*` names when a source step references another skill.
- Treat `.claude/` paths as Claude-only install paths; Codex install paths are documented in `../../../codex/AGENTS-snippet.md`.

Treat `../../../SPEC.md` and lazy modules under `../../../SPEC/` as authoritative when source instructions diverge from the contract.
