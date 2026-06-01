# Tasknote Directory (flowtron self-host)

This directory holds active tasknotes and archived tasknotes for flowtron's
own development. The canonical workflow lives in [`SPEC.md`](../../SPEC.md)
at the repo root; canonical tasknote templates ship at `templates/`.

## Layout

- `<TASK-ID>.md` — active tasknote (one per task in flight)
- `archive/<area>/<TASK-ID>.md` — completed tasknotes, one folder per area
- `templates/` (at repo root) — `tasknote-template.md`, `tasknote-starter-template.md`, `tasknote-micro-template.md`, `tasknote-README.md`, `PLAN.md`

## Area prefixes

Flowtron uses only the canonical prefixes defined in [`SPEC.md` §"Task ID convention"](../../SPEC.md) — `CORE-`, `BE-`, `FE-`, `DB-`, `DEPLOY-`, `TEST-`. No project-specific prefixes.

## Archive layout

| Prefix | Folder |
|--------|--------|
| `CORE-*` | `archive/core/` |
| `FE-*` | `archive/frontend/` |

Other area folders are created when the first tasknote in that area lands.

## AI-referenced docs

Canonical docs that AI sessions consume as cold-start ground truth — the
project-declared doc set walked at every Phase 4 closure (per
[`SPEC.md` §"🚀 Phase 4: Closure"](../../SPEC.md)) and at every epic-audit
subtask (per [`SPEC/epic.md`](../../SPEC/epic.md)). Flat list, one-line
purpose each.

- `README.md` — public-facing flowtron repo overview
- `SPEC.md` — canonical workflow contract; primary AI cold-start surface
- `docs/MIGRATION.md` — adoption + bump procedures for adopting projects
- `claude/AGENTS-snippet.md` — block adopters paste into their AGENTS.md (defines adopters' assistant-facing surface; agent-neutral)
- `docs/CONVENTIONS.md` — conventions flowtron adheres to and declines (commits, versioning, formatting, CHANGELOG, ADRs) with rationale
- `CONTRIBUTING.md` — solo-maintenance model; how to file issues; when PRs make sense
- `SECURITY.md` — prompt-injection and supply-chain threat model; informs how skills handle contributor-authored content and submodule bumps
- `docs/AGENT-NEUTRALITY.md` — ledger of intentional Claude-specific surfaces; audits and Phase 4 sweeps consult this before flagging Claude-Code references in the contract layer
- `docs/PLATFORMS.md` — two-layer contract/wiring model and symmetric plug-in pattern for shipping new platform wiring
- `claude/CAPABILITIES.md` — Claude Code capability-trigger reference; carries a last-verified stamp that the doc-drift sweep should verify on each version bump
- `docs/AGENT-COMPAT.md` — living agent-compatibility matrix: per-agent consume-mode, context entry-point, skill/command primitive, and last-verified currency

`SPEC/*.md` (lazy modules) and `claude/skills/*/SKILL.md` are loaded on
demand by skill stubs — authoritative when fired, but not part of the
default cold-start sweep.

## Project quick commands

These assume you are at the repository root (parent of `viz/`). Use
`npm --prefix viz ...` style:

- Viz tests: `npm --prefix viz test`
- Viz typecheck: `npm --prefix viz run typecheck`
- Viz lint: `npm --prefix viz run lint`
- Viz dev server: `npm --prefix viz run dev`

If your shell is already inside `viz/`, drop the prefix:

- `npm test`, `npm run typecheck`, `npm run lint`, `npm run dev`
