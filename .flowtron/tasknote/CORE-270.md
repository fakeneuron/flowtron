---
title: cross-agent-skill-projection
status: starter
tags: []
created: 2026-06-02
related-tasks: [CORE-EPIC-267, CORE-269]
---

# CORE-270 | cross-agent-skill-projection

[← PLAN.md](../PLAN.md) · 🌱 Starter (filed 2026-06-02) · 🔗 [[CORE-EPIC-267]] · 🔗 [[CORE-269]]

## 🌱 Starter context

_Captured 2026-06-02 during a design discussion mid-CORE-268 (v5.1.0 release, paused at the dogfood gate) — promote to full tasknote / scope via `/ft-epic-discovery` at checkout._

### Why this exists

flowtron's Claude skills (`claude/skills/ft-*`) are well-developed; other agents (Grok Build, Codex CLI, Cursor, Gemini, Aider, Amp) are **contract-only** — they read `AGENTS.md` and drive the 4-phase workflow conversationally with no procedural scaffolding. Observed quality gap: "Claude notably better than Grok." The strategic question: how to bridge the skills to other agents **without** per-agent copies that balloon maintenance (a "simple change" updating K files) and fall out of sync. This is general (all skills), not specific to any one skill. Rich enough to preserve as a starter rather than relitigate.

### Solution shape

The recommended architecture (worked out in conversation):

- **Skills fuse two things** — the *procedure* (agent-neutral: "to close an epic, audit the cohort, sweep docs, flip the parent") and the *Claude mechanics* (`AskUserQuestion`, `Skill` tool, deferred tools, `/clear`+`/model`). Redundancy pain = mirroring both per agent. Fix: only ever vary the mechanics.
- **Single source = agent-neutral procedure SOPs** (e.g. `SPEC/procedures/<intent>.md`), extending flowtron's existing lazy-SPEC-module pattern (`SPEC/epic.md`, `SPEC/gates.md`). Claude becomes *just another consumer* — its skill is a thin driver over the SOP (as `ft-close-epic` already cites `SPEC/epic.md` as authoritative).
- **Per-agent surface = thin generated pointer wrappers, not copies.** A `.grok/skills/close-epic.md` is ~3 lines: "load `SPEC/procedures/close-epic.md`, drive it, surface gates per `SPEC/gates.md`." Almost nothing to go stale because the content lives in the SOP it points at. **Generate the routing, not the procedure.**
- **Generator is a standalone build step** (its own skill/script), runnable anytime — NOT inside `ft-release` (release-time-only projection would lag HEAD between cuts and couples "cut a version" with "build wiring"). `ft-release` *gates* on currency ("are projected wrappers current?"), parallel to how the dogfood gate works.

### Explicitly out of scope

- `CORE-269` (dogfood-prompt-template) — the natural *first* agent-neutral artifact and cheapest proof of the "shared SOP, paste into any agent" pattern, but tracked separately; it's near-term and standalone.
- Erasing the capability gap — see Decisions: part of the gap is intrinsic to each agent and not flowtron-fixable.

### Decisions locked in this conversation

| Decision | Choice | Rationale |
|---|---|---|
| Thin pointers vs. thick copies | **Thin pointers** | Thick copies manufacture staleness drift, edit-the-generated-file traps, and K-way diff noise — the exact drift the CORE-267 dogfood gate exists to catch. |
| Source of truth | **Neutral SOP, not the Claude skill** | "Claude skill as source" puts canonical content in a Claude-specific file, drags Claude-isms into the transform, and violates flowtron's neutrality posture (`AGENT-NEUTRALITY.md`). A pure copy is broken on arrival (Grok has no `AskUserQuestion`). |
| Generator placement | **Standalone, not in `ft-release`** | Release-only projection lags HEAD; `ft-release` should gate on currency, not own generation. |
| Scope of the gap flowtron can close | **Narrow it, don't erase it** | Claude skills *enforce* gates (block on structured questions, deterministic tool sequences); a contract-only agent reading an SOP can skip steps. Residual gap is agent capability, not wiring. |

### Open at promotion (Phase 1 / `/ft-epic-discovery` should resolve)

- Which skill to prove the pattern on first? Lean: the `ft-task` 4-phase driver (highest-value, most-exercised) — one end-to-end vertical slice, dogfooded under Grok, before rolling the rest.
- Where do SOPs live — `SPEC/procedures/` (new dir) vs. extending existing `SPEC/` modules? Lean: new `SPEC/procedures/`.
- Build the generator now, or hand-author a couple thin wrappers first to validate the shape, then automate? Lean: hand-author the proof slice, then generator.
- This is epic-sized (shared design surface, multi-child, contract impact) → scope via `/ft-epic-discovery` (likely `--deep`), not a single tasknote.

### Related

- [[CORE-EPIC-267]] — the dogfood gate whose "refresh from real verification" obligation exposed both this gap and CORE-269's
- [[CORE-269]] — dogfood-prompt-template; sibling near-term artifact, the cheapest proof of the shared-SOP pattern
- `docs/PLATFORMS.md` — the two-layer contract/wiring model + "symmetric plug-in pattern"; this epic makes those plug-ins *thin*
- `docs/AGENT-NEUTRALITY.md` — the neutrality ledger this architecture extends (Claude as just-another-consumer)
- CORE-091 (archived) — "wiring-snippet single-source collapse"; flowtron's precedent for one-source → many-surfaces
