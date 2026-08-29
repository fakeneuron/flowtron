# Tasknote Directory (flowtron self-host)

This directory holds active tasknotes and archived tasknotes for flowtron's
own development. The canonical workflow lives in [`SPEC.md`](../../SPEC.md)
at the repo root; canonical tasknote templates ship at `templates/`.

## Layout

- `<TASK-ID>.md` — active tasknote (one per task in flight)
- `archive/<area>/<TASK-ID>.md` — completed tasknotes, one folder per area
- `templates/` (at repo root) — `tasknote-template.md`, `tasknote-starter-template.md`, `tasknote-micro-template.md`, `sidequest-template.md`, `tasknote-README.md`, `PLAN.md`, `spec-template.md`, `audit-overlay-template.md`, `loop-heartbeat-template.md`, `subagent-probe-template.md`

## Area prefixes

Flowtron uses only the canonical prefixes defined in [`SPEC.md` §"Task ID convention"](../../SPEC.md) — `CORE-`, `BE-`, `FE-`, `DB-`, `DEPLOY-`, `TEST-`. No project-specific prefixes.

## Archive layout

**Rule:** the archive folder for a prefix is the prefix lowercased, with the
trailing `-` dropped — e.g. `<AREA>-*` → `archive/<area>/`. Applies uniformly
to the canonical prefixes and any adopter-declared domain prefix.

| Prefix | Folder |
|--------|--------|
| `CORE-*` | `archive/core/` |
| `BE-*` | `archive/be/` |
| `FE-*` | `archive/fe/` |
| `DB-*` | `archive/db/` |
| `DEPLOY-*` | `archive/deploy/` |
| `TEST-*` | `archive/test/` |

Other area folders are created when the first tasknote in that area lands.

## AI-referenced docs

The project-declared doc set walked at every Phase 4 closure (per
[`SPEC.md` §"🚀 Phase 4: Closure"](../../SPEC.md)) and at every epic-audit
subtask (per [`SPEC/epic.md`](../../SPEC/epic.md)) for the doc-drift sweep.
Flat list, one-line purpose each.

Membership means **swept for drift** — it does not mean **loaded at cold
start**. The two are independent per-doc properties: `SPEC.md` is the primary
cold-start surface *and* is swept; `docs/VISION.md` is lazy-loaded *and* is
swept, because it drifts against the surfaces that mirror it. Conflating them
is what made CORE-489.3's correct sweep-coverage fix look like a reversal of
CORE-194.1 Q3's correct lazy-loading decision (settled by CORE-491).

- `README.md` — public-facing flowtron repo overview
- `AGENTS.md` — flowtron-self agent guide: repo layout, validation commands, workflow pointers, and platform wiring notes
- `SPEC.md` — canonical workflow contract; primary AI cold-start surface
- `docs/MIGRATION.md` — adoption + bump procedures for adopting projects
- `claude/AGENTS-snippet.md` — block adopters paste into their AGENTS.md (defines adopters' assistant-facing surface; agent-neutral)
- `codex/AGENTS-snippet.md` — Codex-specific `.agents/skills` wiring commands and invocation notes
- `cursor/AGENTS-snippet.md` — Cursor thin wiring (`.cursor/skills/` Cursor-only path; primary path reuses Claude `.claude/` wiring)
- `grok/AGENTS-snippet.md` — Grok thin wiring (`.grok/skills/` Grok-only path; primary path reuses Claude / Codex / Cursor wiring)
- `docs/CONVENTIONS.md` — conventions flowtron adheres to and declines (commits, versioning, formatting, CHANGELOG, ADRs) with rationale
- `CONTRIBUTING.md` — solo-maintenance model; how to file issues; when PRs make sense
- `SECURITY.md` — prompt-injection and supply-chain threat model; informs how skills handle contributor-authored content and submodule bumps
- `docs/AGENT-NEUTRALITY.md` — ledger of intentional Claude-specific surfaces; audits and Phase 4 sweeps consult this before flagging Claude-Code references in the contract layer
- `docs/PLATFORMS.md` — two-layer contract/wiring model and symmetric plug-in pattern for shipping new platform wiring
- `claude/CAPABILITIES.md` — Claude Code capability-trigger reference; carries a last-verified stamp that the doc-drift sweep should verify on each version bump
- `docs/AGENT-COMPAT.md` — living agent-compatibility matrix: per-agent consume-mode, context entry-point, skill/command primitive, and last-verified currency
- `docs/EXTERNAL-AGENTS.md` — one-agent-per-tasknote rule, the handoff contract for external CLI agents, the orchestration contract an operator-less caller reports to, and the not-an-orchestration-runtime boundary; contract edits that touch delegation, handoff, or the unattended posture routinely drift against it
- `docs/WORKTREES.md` — the locked isolation convention for parallel epic children (`wt-<ID>` branch + worktree pair); named by `docs/EXTERNAL-AGENTS.md` as the isolation layer and cited wherever parallelism is discussed
- `docs/VISION.md` — canonical statement of flowtron's scope boundaries; mirrored by SPEC.md §"What flowtron does NOT provide", `docs/CONVENTIONS.md`, and `docs/EXTERNAL-AGENTS.md`. Lazy-loaded: swept, not cold-start

`SPEC/*.md` (lazy modules) and `claude/skills/*/SKILL.md` sit outside this
sweep set, excluded on both counts, so the distinction above does not arise for
them. **Their exclusion is a volume decision, not a laziness one** — the
paragraph above severs lazy-loading from sweep membership, so it cannot also be
the reason these are excluded. The two trees run ~6,200 lines against a
~4,100-line sweep set, and walking them at every closure would roughly double a
per-task step Core Principle #3 exists to keep small.

**Accepted residual risk.** Skill bodies state facts *about* swept docs, so a
contract change can falsify one with no sweep reaching it —
`claude/skills/ft-release/SKILL.md:567` asserted a stale claim about this very
list for a day after CORE-489.3 added `docs/VISION.md` to it. The catch layer is
the epic-audit sweep, which is where CORE-489.N found it; per-task closure is
not expected to. CORE-492 weighed a release-time citation guard for this and
declined: all 63 skill-body `§"…"` citations resolve today, and a resolution
check would not have caught that miss anyway — the section it cited never moved,
only the truth of what was said about it.

## Project quick commands

These assume you are at the repository root (parent of `viz/`). Use
`npm --prefix viz ...` style:

- Viz tests: `npm --prefix viz test`
- Viz typecheck: `npm --prefix viz run typecheck`
- Viz lint: `npm --prefix viz run lint`
- Viz dev server: `npm --prefix viz run dev`
- Updater suite (release gate): `node --test tools/update-adopters.test.mjs`
- Updater syntax checks: `node --check tools/update-adopters.test.mjs && node --check tools/update-adopters.mjs`

If your shell is already inside `viz/`, drop the prefix:

- `npm test`, `npm run typecheck`, `npm run lint`, `npm run dev`
