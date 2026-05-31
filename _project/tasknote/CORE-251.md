---
title: reject-runtime-sec-tooling
status: starter
tags: [security, docs]
created: 2026-05-31
---

# CORE-251 | reject-runtime-sec-tooling

[← PLAN.md](../PLAN.md) · 🌱 Starter (filed 2026-05-31) · 🔗 [[CORE-250]] [[CORE-EPIC-194]]

## 🌱 Starter context

_Captured 2026-05-31 during a session that evaluated (and rejected) an external AI's proposal to adopt "Truvent/truvent.ai-style" security tooling into flowtron, then hardened the threat model instead (→ CORE-250). Promote to full tasknote at `/ft-task` checkout._

### Why this exists

An external AI proposed adopting a security stack into flowtron: (1) **Local MCP repo tools** (filesystem + git MCP servers under `claude/mcp/`), (2) a **FastMCP "Security Auditor" skill** (`claude/security/audit.py`, ~150 LOC Python with `risk_assess()` / `scan_skill_or_plugin()`), (3) a **new 5th SPEC lifecycle phase** ("Security Gate"), and (4) a `flowtron-sec` companion submodule for "Truvant-style heavy runtime enforcement / tamper protection."

It was assessed as **~80% direct DNA collision** and rejected. The *reasoning* is the value worth preserving — without it, the next AI (or the same proposal re-pitched) re-derives the whole analysis from scratch. This task records the rejection in `docs/VISION.md` §"What we won't accept" so it has a ready, citable answer, mirroring how CORE-EPIC-194's "considered-and-declined" list documents why flowtron deliberately skips obvious patterns from larger systems.

This is a **documentation guardrail**, not new capability. The actual security improvement that session produced already shipped as **CORE-250** (threat-model hardening, markdown-only).

### Solution shape

- Add one bullet to `docs/VISION.md` §"What we won't accept" — e.g. **"Runtime security scanners / agent-callable audit servers."** Markdown is the schema and the human-at-the-gate is the control; an advisory risk-scorer adds attack surface + false confidence without an enforcement chokepoint. Deterministic enforcement (block-secrets, restrict-shell) belongs in per-project Claude Code permission hooks, not in flowtron.
- Optionally add the terse PR-rejection mirror to `SPEC.md` §"PR / suggestion archetypes flowtron does not accept" (the AI-facing mid-task version), matching the existing four archetypes.
- Keep it tight — this is a one-bullet (maybe two-surface) addition, not an essay. The full argument lives in this starter + the git history of CORE-250.

### Files to touch (preliminary survey — drift-check at promotion)

- `docs/VISION.md` — §"What we won't accept": add the runtime-security-tooling bullet (alongside Schema validators / Abstractions-without-precedent / Cross-project-query / Multi-user).
- `SPEC.md` — §"PR / suggestion archetypes flowtron does not accept": optional terse mirror bullet (decide at promotion whether the SPEC mirror is worth the token cost or VISION-only suffices).
- `_project/tasknote/README.md` — `SECURITY.md`/`docs/VISION.md` already in the AI-referenced list; no new entry expected. Doc-drift sweep at closure.

### Why the proposal collided (compressed — full detail in CORE-250 git history)

| Proposal item | flowtron rule it breaks |
|---|---|
| `audit.py` FastMCP process (~150 LOC) | **Zero scripts** (SPEC #2) — repo has zero Python outside `viz/`; this is the first daemon |
| `risk_assess()` / `scan_skill_or_plugin()` | **Schema validators rejected** — markdown is the schema, the assistant catches drift |
| 5th "Security Gate" SPEC phase | 4-phase rhythm is the hardened core; `gates.md` caps operator surface at **up-to-two banners** |
| MCP fs+git servers | Redundant (Claude Code has native fs+git); needs `npx`/`uvx` runtime (breaks the proposal's *own* "no `npm install` per project" boundary); breaks **agent-neutrality** |
| `flowtron-sec` daemon / tamper-protection | Daemons / OS hooks — the explicit antithesis |

Already-shipped that the proposal missed: `ft-audit-security` (markdown skill, 5 passes) + `SECURITY.md` threat model already cover the "security auditor" need the flowtron-native way.

### Decisions locked in this conversation

| Decision | Choice | Rationale |
|---|---|---|
| Adopt the truvent.ai/MCP proposal? | **No** | ~80% DNA collision with `docs/VISION.md` §"What we won't accept" + the security-auditor need already ships as `ft-audit-security` |
| Does "light scripting" add security here? | **No — avoid entirely** | More code = more attack surface + false confidence; flowtron's control is human-at-the-gate, not a scanner. Scripts add security only as deterministic enforcement at a real chokepoint → that's Claude Code permission hooks (per-project), not flowtron |
| How to record the rejection | VISION.md memo (this task) | Mirrors CORE-EPIC-194's declined-list precedent; gives future AIs a citable answer |

### Open at promotion (Phase 1 should resolve)

- Include the terse `SPEC.md` PR-archetype mirror, or VISION-only? Lean: **VISION-only** unless the SPEC mirror reads naturally as a fifth archetype (low token cost if so).
- Exact bullet wording / label for the rejected category. Lean: **"Runtime security scanners / agent-callable audit servers."**

### Related

- [[CORE-250]] — the threat-model hardening this session shipped (the *yes* half; this starter is the *no* half — record the rejection)
- [[CORE-EPIC-194]] — precedent: gsd-pi-learnings "considered-and-declined" list pattern this memo mirrors
