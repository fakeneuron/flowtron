# Procedure SOPs

Agent-neutral **procedure SOPs**: the source-of-truth projection of a
flowtron *execution procedure* (e.g. driving the `/ft-task` 4-phase
workflow) for contract-only agents that lack Claude Code's skill
machinery.

Each `SPEC/procedures/<procedure>.md` describes how to *execute* a
procedure in plain, agent-neutral steps — distinct from the `SPEC/*.md`
lazy modules one level up, which carry contract *rules* loaded on demand
by the Claude `/ft-task` SKILL dispatch. A procedure SOP is loaded
instead by a thin per-agent **pointer wrapper**
(`<platform>/procedures/<procedure>.md`, e.g.
`grok/procedures/ft-task.md`, `codex/procedures/ft-task.md`) that
routes the agent here rather than copying the steps — the "route, don't
copy" posture locked at [[CORE-091]] and [[CORE-270]].

## Why this layer exists

Claude Code enforces the 4-phase gates deterministically through its
skill files; a contract-only agent (Codex CLI, Grok Build, …) drives the
same workflow conversationally from `AGENTS.md` + `SPEC.md`. A
hand-authored neutral SOP narrows the resulting adherence gap without
copying Claude-specific machinery (`AskUserQuestion`, slash dispatch)
that is broken on arrival elsewhere. See
[`docs/PLATFORMS.md`](../../docs/PLATFORMS.md) for the two-layer
contract/wiring model and [`docs/AGENT-NEUTRALITY.md`](../../docs/AGENT-NEUTRALITY.md)
for the neutrality posture.

This is a **separate layer** from
[`docs/DOGFOOD.md`](../../docs/DOGFOOD.md): DOGFOOD.md is an *operator*
verification runbook ("how to run a dogfood session"); a procedure SOP
is an *agent-loaded* execution guide ("how to drive the procedure").
Different audience, different load time — no collision.

## Frontmatter schema

Every `SPEC/procedures/<procedure>.md` opens with a YAML frontmatter
block carrying three fields:

| Field | Required | Meaning |
|---|---|---|
| `procedure:` | yes | The procedure slug, matching the `ft-` skill/command name cross-platform per [`SPEC.md` §"Skill namespace"](../../SPEC.md) (e.g. `ft-task`). |
| `source:` | yes | The canonical Claude skill this SOP is derived from and kept in sync with — the drift-tracking anchor (e.g. `claude/skills/ft-task/SKILL.md`). |
| `last-verified:` | yes | Currency stamp, mirroring the [`docs/PLATFORMS.md`](../../docs/PLATFORMS.md) / [`claude/CAPABILITIES.md`](../../claude/CAPABILITIES.md) convention — `<version> · <YYYY-MM-DD>`. Bumped when the SOP is re-checked against `source:`. |

**Flagged at release, never bumped by it.** `last-verified:` records a SOP↔source
sync event, not a release pin — a release cut leaves it untouched even though it
carries a version prefix ([[CORE-361]] / [[CORE-356]] precedent). But a stamp
nothing ever reads is a stamp that goes stale silently, which is how
[[CORE-390]]'s fold sat un-mirrored in the `ft-task` SOP until [[CORE-395]]
caught it by hand. `/ft-release` Step 5 therefore runs a **flag-don't-bump**
check: it lists `source:` commits since the stamp's **date** that did not also
touch the SOP, and routes a real finding to a follow-up tasknote. The date is
the anchor because the version half decouples from it whenever a SOP is
re-checked mid-cycle. Advisory only — a stale SOP never blocks a release.

Example:

```yaml
---
procedure: ft-task
source: claude/skills/ft-task/SKILL.md
last-verified: v5.1.0 · 2026-06-02
---
```

Unlike the `SPEC/*.md` lazy modules, procedure SOPs do **not** carry a
`paths:` field — they are not filename-triggered into the `/ft-task`
SKILL dispatch. The `source:` field intentionally records derivation
rather than ownership: per [[CORE-270]], the long-term source of truth
is the neutral SOP, but the Claude skill stays canonical wiring until a
later generator epic reconciles the two; today the SOP is hand-authored
*from* `source:` and `last-verified:` tracks that sync.

## Loading convention

1. A contract-only agent is asked to run a flowtron procedure (e.g.
   "start CORE-123" → the `ft-task` procedure).
2. The agent's per-platform wrapper `<platform>/procedures/<procedure>.md`
   routes it to `SPEC/procedures/<procedure>.md` (it points; it does not
   restate the steps).
3. The agent loads this SOP and executes the procedure conversationally,
   substituting its own primitives where the SOP names a Claude-specific
   one (e.g. a prose ask in place of `AskUserQuestion`).

Claude Code does not use this layer — it runs the richer
`claude/skills/<procedure>/SKILL.md` directly. The SOP is the floor for
agents without that wiring, not a replacement for it.
