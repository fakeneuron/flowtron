---
name: ft-flowtron
description: Display a flowtron info screen — version, what it is, core principles, and the full bundled skill roster with one-liner descriptions. Use when the user asks what flowtron is, its version, or wants to see the skill roster. No args. Read-only; writes nothing.
---

# flowtron — info screen

Output an info screen about the flowtron workflow system. This is read-only: write nothing, create no files, open no tasknotes.

## Step 0 — Resolve version

Determine which repo context you're in:

- **Flowtron-self:** repo-root `SPEC.md` exists with heading `# Flowtron — Workflow Specification`. Read it from `SPEC.md`.
- **Adopting project:** read it from `.flowtron/core/SPEC.md`.

Extract the `**Version:**` line near the top. Use that literal version string.

## Step 1 — Output the info screen

Print the following block in the conversation (fill in `VERSION` from Step 0). Do not wrap it in a code block — render it as formatted markdown.

---

# flowtron `VERSION`

A lightweight, project-agnostic tasknote system for solo AI-assisted coding. The four phases, the Relevance Assessment, and the Acceptance criteria are the checkpoints that catch the agent before it wastes a session — with no scripts, daemons, or databases.

**Spec:** `SPEC.md` (adopters: `.flowtron/core/SPEC.md`)
**Adoption guide:** `docs/MIGRATION.md`

## Core principles

1. **Markdown over JSON.** Plans and tasknotes are plain markdown — human-editable, diffable, AI-scannable.
2. **Zero scripts.** All operations are `cp`, `mv`, and editing markdown.
3. **One task per context window.** Tasks are sized so the full scope fits in working memory.
4. **Relevance before action.** Every task starts with a hard gate: is this still the right work?
5. **Versioned and pinned.** Adopters pin a specific flowtron commit; updates are deliberate.

## Bundled skills

| Skill | Description |
|---|---|
| `/ft-task` | Drive a full 4-phase tasknote (Discovery → Execution → Testing & Linting → Closure). Primary workflow for normal-size tasks. `--debug` drives it hypothesis-first for a bug, regression, or unexpected behavior whose root cause is unknown (expected vs observed → ranked hypotheses → minimal repro → re-verify). |
| `/ft-micro-task` | Single-section lightweight tasknote for tasks above the skip threshold but too small for full ceremony (~30 min or under). |
| `/ft-starter-task` | File a rich-context starter tasknote discovered mid-flow — writes the artifact and PLAN entry, does not start it. |
| `/ft-spec` | Draft a review-first design spec (fixed section order: Goal · Requirements · Design · Tasks · Risks/Open Q · Validation Approach) from a brief or conversation context — only on your go, optionally writes it to `.flowtron/specs/<slug>.md`. Planning peer; never files a PLAN entry or tasknote. `--fast` skips the review pause, still never auto-writing. |
| `/ft-refactor` | Plan a refactor of one named target (file, module, directory, subsystem) as a sequenced, behavior-preserving epic — read-only depth survey, operator-reviewed plan, then files parent + implementation children from `.2` + a `.N` audit, each child a starter seeded with characterization-test acceptance. Never edits source. Depth counterpart to `/ft-audit structure`'s breadth sweep. `--fast` skips the review pause, still read-only. |
| `/ft-file-followup` | File a follow-up task from inside an active tasknote — one PLAN line + context paragraph only, no tasknote artifact. `--park` parks an idea or quick fix instead: tiny stub + PLAN line, `--low`/`--med`/`--fut`/`--high` flags or one short priority question, no review gate, then resume inline. |
| `/ft-epic-discovery` | Scaffold and drive a new epic: files parent + `.1` Discovery + audit placeholder, then drives Discovery inline. `--deep` stages a `constitution → specify → clarify` pre-pass first, for high-uncertainty epics. |
| `/ft-close-epic` | Close an epic by scaffolding and driving its audit subtask, then flips the parent entry to Completed. |
| `/ft-goal-task` | Drive a full 4-phase tasknote with the Phase 2↔3 execute→verify cycle run as an inline loop against a machine-checkable Acceptance target (per-cycle relevance gate, `loop-max` budget, commit-per-verified-iteration, `🔁 Iterations` log). Peer to `/ft-task`; for converge-until-a-check-passes work. `--worktree` runs Phase 1 here then hands off to `/ft-worktree-start` so the loop runs in an isolated worktree. Heartbeat shape: `templates/loop-heartbeat-template.md`. See `SPEC/loop.md`. |
| `/ft-worktree-start` | Create an isolated git worktree for an independent epic child tasknote (branch `wt-<ID>`, copy active tasknote, handoff to fresh session). Thin procedural utility; pair with `/ft-worktree-end`. See `docs/WORKTREES.md`. |
| `/ft-worktree-end` | From main: verify branch merged (or explicit discard), `git worktree remove`, archive the *copied* tasknote into main, optional prune. Thin procedural utility. See `docs/WORKTREES.md`. |
| `/ft-audit-repo` | First-contact holistic repo audit — Repo Map before judging, thin capped sweep, 3–5 themes (won't-fix tradeoffs + done-signals), milestone plan filed as flowtron epics, delegation to `/ft-audit`. Stack-neutral, read-only, no fork — run from the submodule path. |
| `/ft-audit` | Parameterized principal-engineer audit — `/ft-audit <domain> [scope]` runs 5 domain-specific passes, capped findings, writes tickets to PLAN. Domains: general (default) · backend · frontend · security · performance · docs · structure. Stack-neutral scaffold — fork the whole directory (`SKILL.md` + `passes/`) and customize per stack. |
| `/ft-audit-context` | Adopter-context audit — 4 conversational passes (Bloat · Redundancy · Namespace · Drift) over `CLAUDE.md`, `AGENTS.md`, `.claude/{commands,skills}`. Soft prose with an offer to file PLAN tickets (no auto-write). Global install per `docs/MIGRATION.md` §1.0. |
| `/ft-stats` | Show flowtron stats — `[model]` distribution, completion velocity, per-area volume — aggregated from PLAN.md `## Completed`. Read-only screen; `--write` also flushes to `.flowtron/STATS.md`. |
| `/ft-new-project` | Bootstrap a fresh repo with flowtron — submodule, PLAN.md, tasknote README, AGENTS.md patch, staged commit. |
| `/ft-release` | Cut a flowtron release — version bump, doc shifts, drift sweep (via `/ft-audit docs`), single feat: commit, annotated tag, VERSION-HISTORY prepend, push. (Flowtron-self only.) |
| `/ft-update` | Bump an adopter project's pinned `.flowtron/core/` submodule to the latest tag — current→target + tag changelog, move pin, re-wire symlinks for newly shipped skills, smoke check, staged commit. Consumer-side counterpart to `/ft-release`. (Adopters only.) |
| `/ft-flowtron` | Display this info screen — version, core principles, and the full bundled-skill roster. No args; read-only. |

## Key docs

- `SPEC.md` — canonical workflow contract (4-phase lifecycle, relevance gate, post-closure protocol, versioning)
- `docs/PHILOSOPHY.md` — design rationale and the problems flowtron solves
- `docs/MIGRATION.md` — adoption guide, global skill install recipe, migration from legacy systems
- `docs/CONVENTIONS.md` — conventions flowtron adheres to and declines (commits, versioning, formatting) with rationale
- `docs/VERSION-HISTORY.md` — curated, moderately-coarse release highlights (tags remain full SSOT)
- `docs/AGENT-NEUTRALITY.md` — agent-neutrality contract: which contract-layer Claude-specific surfaces are intentional (load-bearing locators for the Claude Code wiring layer) and why
- `docs/PLATFORMS.md` — multi-platform wiring pattern: two-layer model (agent-neutral contract / per-platform wiring) and the symmetric plug-in shape for shipped siblings (`codex/` full wrappers, `cursor/` and `grok/` thin; future platforms plug in the same way)
- `CONTRIBUTING.md` — solo-maintenance model; issue and PR guidance
- `SECURITY.md` — threat model (prompt injection, submodule supply-chain trust, viz dev-server scope) and vulnerability reporting
- `templates/` — tasknote templates (full, micro, starter, sidequest) plus spec, loop-heartbeat, audit-overlay, and subagent-probe templates

---

After printing the screen, stop. Do not open a tasknote, ask a follow-up question, or offer next steps unless the user asks.
