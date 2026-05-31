---
title: reject-wiki-layer-subsystem
status: starter
tags: [docs]
created: 2026-05-31
---

# CORE-252 | reject-wiki-layer-subsystem

[← PLAN.md](../PLAN.md) · 🌱 Starter (filed 2026-05-31) · 🔗 [[CORE-251]] [[CORE-EPIC-194]]

## 🌱 Starter context

_Captured 2026-05-31 during a session that evaluated (and rejected) an external AI's "Karpathy-inspired Wiki Layer" proposal — the sibling pitch to the truvent/MCP one rejected the same day (→ CORE-251). Promote to full tasknote at `/ft-task` checkout._

### Why this exists

An external AI proposed adopting a "Wiki Layer" knowledge-base subsystem into flowtron: `raw/` (immutable source files) + `wiki/` (LLM-maintained clean markdown) + `instructions/` folders, new `/ft-wiki-ingest` / `/ft-wiki-query` / `/ft-wiki-update` skills, a `SPEC/wiki-layer.md` lazy module, a "Knowledge Gate" 5th lifecycle phase, a `flowtron-wiki` companion submodule with MCP sync tools, and Obsidian graph/Dataview wiring.

It was assessed as **mostly DNA collision and rejected**. The proposal explicitly bills itself as the companion to the truvent/MCP "Security Auditor" pitch (→ CORE-251), and re-imports the same rejected shapes under new names. The *reasoning* is worth preserving so the next AI (or this proposal re-pitched) doesn't re-derive it.

This is a **documentation guardrail**, not new capability.

### Solution shape

- Add one bullet to `docs/VISION.md` §"What we won't accept" — e.g. **"LLM knowledge-base / 'wiki layer' subsystems."** Tasknotes + `PLAN.md` + `archive/` already ARE the clean LLM-maintained markdown layer; `[[wikilinks]]` already exist (SPEC FE-003) and the viz already resolves them. A parallel `raw/`+`wiki/`+`instructions/` tree duplicates the single source of truth in a second, unsynchronized place.
- Optionally add the terse PR-rejection mirror to `SPEC.md` §"PR / suggestion archetypes flowtron does not accept" (decide VISION-only vs. mirror at promotion, per CORE-251's same call).
- Keep it tight — one bullet (maybe two surfaces). Full argument lives in this starter + the proposal in git history.

### Files to touch (preliminary survey — drift-check at promotion)

- `docs/VISION.md` — §"What we won't accept": add the wiki-layer bullet.
- `SPEC.md` — §"PR / suggestion archetypes flowtron does not accept": optional terse mirror.
- `_project/tasknote/README.md` — `docs/VISION.md` already in AI-referenced list; no new entry expected. Doc-drift sweep at closure.

### Why the proposal collided (compressed)

| Proposal item | flowtron rule it breaks |
|---|---|
| `raw/`+`wiki/`+`instructions/` parallel tree | Duplicates the tasknote/PLAN/archive SSOT — the LLM-maintained-markdown layer already exists |
| "Knowledge Gate" 5th SPEC phase | 4-phase rhythm is the hardened core; `gates.md` caps operator surface at two banners (identical to CORE-251's rejected "Security Gate") |
| `flowtron-wiki` submodule + MCP sync tools | Daemons / `npx`-`uvx` runtime; breaks agent-neutrality; redundant with native fs+git (identical to CORE-251's rejected `flowtron-sec`) |
| "consistency linting / missing-link detection" | **Schema validators** — markdown is the schema, the assistant catches drift (VISION bullet 1) |
| Visualizer cross-surfacing of wiki concepts | viz is the *one* bounded read-only aggregated surface (VISION §"Cross-project query layers") |
| Obsidian graph/Dataview as headline payoff | Obsidian is positioning for adopters, not a flowtron-native dependency; not a felt need here |

### Salvaged-nugget review (post mined before declining)

The post's underlying insight — *distill messy source once, then operate against the clean layer* — is sound and already the spine of flowtron. Coverage map:

- "Distill once / query the clean layer" → `PHILOSOPHY.md` §"One task per context window" + tasknotes-as-distillation + the Discovery `archive/` skim.
- Concept-oriented pages → `SPEC/` modules + `docs/` + the CORE-EPIC-194 "considered-and-declined" list already *are* concept pages.
- Source-citation discipline → Discovery Notes already cite `[[TASK-ID]]` / archive hits.
- A `raw/` inbox for un-distilled source artifacts → the one genuinely-absent convention; consciously declined (distilled note is the artifact; raw source is intentionally ephemeral — invites binary/cruft accumulation). This very rejection ran the wiki pattern by hand with zero new machinery.

### Decisions locked in this conversation

| Decision | Choice | Rationale |
|---|---|---|
| Adopt the Wiki Layer proposal as an epic? | **No** | Sibling of the CORE-251-rejected archetype; ~70% direct DNA collision; novel kernel already shipped as tasknotes/PLAN/archive/wikilinks |
| Build a thin `raw/` inbox kernel anyway? | **No** | Marginal value; arguably outside flowtron's scope as a *task* system; user doesn't use Obsidian, where the payoff would land |
| How to record the rejection | VISION.md memo (this task) | Mirrors CORE-251 + CORE-EPIC-194's declined-list precedent; gives future AIs a citable answer |

### Open at promotion (Phase 1 should resolve)

- Include the terse `SPEC.md` PR-archetype mirror, or VISION-only? Lean: **VISION-only** unless it reads naturally as another archetype.
- Could CORE-251 and CORE-252 land as one combined "external-subsystem proposals we decline" sweep? Lean: **keep separate** — different categories (security tooling vs. knowledge-base), each citable on its own. Promote whichever fires first; cross-link.

### Related

- [[CORE-251]] — sibling rejection (truvent/MCP security tooling), same session, same archetype
- [[CORE-250]] — the threat-model hardening that session's *yes* half shipped
- [[CORE-EPIC-194]] — precedent: gsd-pi-learnings "considered-and-declined" list pattern this memo mirrors
