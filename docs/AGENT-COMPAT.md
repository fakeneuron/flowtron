# Agent compatibility matrix

A living, at-a-glance matrix of the AI coding agents flowtron is built to
work with: how each consumes the contract, what context entry-point it
reads, what skill/command primitive it offers, and when each row was last
verified. This is the *capability/currency* companion to
[`PLATFORMS.md`](PLATFORMS.md) (the *structural* doc — where wiring lives)
and [`AGENT-NEUTRALITY.md`](AGENT-NEUTRALITY.md) (the *content* ledger —
which Claude-specific references are intentionally load-bearing).

Audience: occasional. Read this to see at a glance which agents are
supported and how current each row is, before adopting flowtron under a
new agent or refreshing a row.

## Scope of this matrix

This matrix is **structural** — it records *how* each agent reaches and
runs the contract, not the agent's individual capability triggers. Per-agent
capability triggers (Claude effort/thinking levels and `--fast`; Grok
context-load quirks; each agent's force-skip and model-switch ergonomics)
live in the per-agent trigger references, documented separately from this
scaffold (Claude's in [`../claude/CAPABILITIES.md`](../claude/CAPABILITIES.md);
non-Claude agents in [`PLATFORMS.md` §"Non-Claude capability triggers"](PLATFORMS.md#non-claude-capability-triggers)). Keeping
triggers out of the matrix keeps it a stable index rather than a second copy
of the trigger detail.

The matrix carries agent-specific *facts* (entry-points, primitives) in
`docs/`, with neutral framing — the same posture PLATFORMS.md already uses
for its Grok Build notes. The agent-neutral workflow contract itself
(`SPEC.md`, `SPEC/`, `templates/`) carries none of this.

## The matrix

| Agent | Consume mode | Context entry-point | Skill / command primitive | Last verified |
|---|---|---|---|---|
| **Claude Code** | Wiring + contract | `AGENTS.md` (+ optional `CLAUDE.md`) | `.claude/skills/` + `.claude/commands/` slash commands — full `ft-*` bundle shipped | `v5.1.0 · 2026-06-02 (dogfooded)` |
| **Grok Build** | Contract only | `AGENTS.md` | `.grok/skills/` markdown skills, auto-wired as `/<name>` — no flowtron bundle shipped | `v5.1.0 · 2026-06-02 (dogfooded)` |
| **Codex CLI** | Contract only | `AGENTS.md` | Native primitive exists; no flowtron bundle | `v5.1.0 · 2026-06-02 (dogfooded)` |
| **Cursor** | Contract only | `AGENTS.md` | Native primitive exists; no flowtron bundle | unverified |
| **Gemini CLI** | Contract only | `AGENTS.md` | Native primitive exists; no flowtron bundle | unverified |
| **Aider** | Contract only | `AGENTS.md` | Native primitive exists; no flowtron bundle | unverified |
| **Sourcegraph Amp** | Contract only | `AGENTS.md` | Native primitive exists; no flowtron bundle | unverified |

### Reading the cells

- **Consume mode** — `Wiring + contract` means the agent has a shipped
  skill/command bundle that drives the 4-phase workflow inline;
  `Contract only` means the agent reads `AGENTS.md` and drives the
  contract conversationally with no flowtron-specific machinery. Mirrors
  PLATFORMS.md §"Today's surface".
- **Context entry-point** — flowtron's content reaches every agent through
  the open-standard `AGENTS.md` paste-block. Several agents also read a
  native context file (`CLAUDE.md`, `GROK.md`, `GEMINI.md`, `.cursorrules`,
  Aider's `CONVENTIONS.md`); those are orthogonal to flowtron, which
  targets `AGENTS.md` so one paste-block serves all agents.
- **Skill / command primitive** — whether the agent exposes a slash-command
  or skill mechanism, and whether flowtron ships a bundle for it. Only
  Claude Code has a bundle today; Grok Build's primitive is researched (see
  PLATFORMS.md §"Grok Build adoption notes") but no `grok/` bundle exists.
  The remaining five rows note only that a native primitive exists — their
  per-agent detail is filed with the non-Claude trigger reference.
- **Last verified** — when this row was last checked against reality. Format:
  `vX.Y.Z · YYYY-MM[-DD] (context-tag)` where the context tag is one of:
  - `dogfooded` — verified by running a flowtron session under this agent at
    the stated version
  - `docs-only · YYYY-MM (pre-adoption)` — verified against vendor
    documentation only; no flowtron session run under this agent
  - `unverified` — no verification conducted; row rests on launch coverage only

  A dogfooded row may additionally carry a `; skipped @ vX.Y.Z` suffix —
  e.g. `v4.4.0 · 2026-06-01 (dogfooded; skipped @ v5.0.0)`. It records that
  re-verification was *deliberately skipped* at release `vX.Y.Z` while the stamp
  prefix stays pinned to the last **real** verification (`v4.4.0` here, not the
  skipped version). The suffix carries the latest skip version; bump it each
  release the row is skipped again.

  Update obligation — **release gate (dogfood-or-explicit-skip).** Each row that
  carries a `dogfooded` history (today: Claude / Grok / Codex) must be *resolved*
  at every release — either refreshed from a real verification run at the new
  version, or recorded as `skipped @ vX.Y.Z`. Leaving a stale stamp silently
  untouched is not a valid release state: the skip must be a deliberate, recorded
  act. Rows never dogfooded (`unverified`, `docs-only`) are *noted-not-gated* —
  they rest on launch coverage until first dogfooded and are exempt from the gate.
  Enforced at release time by the release flow (`ft-release` §5/§7), which walks
  the dogfooded rows and forces per-row resolution before tagging. The same
  format and obligation apply to per-agent trigger-reference "Last verified"
  sections (e.g. `claude/CAPABILITIES.md`, `docs/PLATFORMS.md` agent stubs).
  For the agent-side session procedure that drives a dogfood run, see
  [`docs/DOGFOOD.md`](DOGFOOD.md).

## Pre-adoption verification

_Only Claude Code is verified by continuous dogfooding._ Contract-only rows
start from vendor documentation and launch coverage until a live flowtron
session is run under that agent. Grok Build and Codex CLI have now been
dogfooded and re-verified at v5.1.0; Cursor, Gemini CLI, Aider, and Sourcegraph Amp remain
pre-adoption expectations. Flowtron has not shipped wiring for any
contract-only agent. Update a row on first-use observation if anything
diverges. This mirrors the per-agent footers in [`PLATFORMS.md`](PLATFORMS.md)
§"Non-Claude capability triggers".

## Cross-agent cue fallback policy

Flowtron's operator cues are `<glyph> <UPPERCASE-LABEL>` pairs — the canonical
set lives in [`SPEC/gates.md` §"Operator-cue vocabulary"](../SPEC/gates.md). The
pairing *is* the cross-agent reliability mechanism: the glyph is a fast-scan
accelerator; the UPPERCASE ASCII label is the authoritative, durable token.

A cue can hit three non-render failure modes on a given agent surface:

- **Stripped** — the surface drops non-ASCII and the glyph vanishes.
- **Tofu** — the glyph renders as a missing-glyph box (□).
- **Mojibake** — the glyph is mis-decoded into garbage bytes.

In all three, the trailing label (`DB`, `RUN`, `ACTION`, `GO`, `CONFIRM`,
`AUDIT`) is plain ASCII and survives intact, so the cue's meaning is recoverable
without the glyph. Banner cues carry their label inside the
`AWAITING APPROVAL — <label>` line, so the same fallback holds for blocking
gates. **Agents and operators should scan on the label as the authoritative
token; the glyph never carries meaning alone.**

This is why a row can sit at `docs-only` or `unverified` (§"The matrix") and the
cues still convey reliably: legibility degrades gracefully to plain text, so
per-agent emoji-render dogfooding is a currency nicety, not a correctness
prerequisite. Live cue-render confirmation under a non-Claude agent refreshes
that agent's row per the §"Reading the cells" update obligation — the natural
next step for the still-unverified rows (Cursor, Gemini CLI, Aider, Sourcegraph Amp).

## Related

- [`PLATFORMS.md`](PLATFORMS.md) — the structural companion: the two-layer
  contract/wiring model, the symmetric plug-in pattern, and the Grok Build
  adoption notes this matrix's Grok row references
- [`AGENT-NEUTRALITY.md`](AGENT-NEUTRALITY.md) — the content ledger of
  intentional Claude-specific surfaces in the contract layer
- [`MIGRATION.md`](MIGRATION.md) — the Claude Code adoption guide; the shape
  a future per-agent adoption guide would mirror
- [`DOGFOOD.md`](DOGFOOD.md) — the versioned, pasteable dogfood procedure
  agents run to refresh a row
- [[CORE-EPIC-224]] — the epic that establishes this surface
- [[CORE-154.4]] — the platform plug-in pattern (`PLATFORMS.md`) this builds on
