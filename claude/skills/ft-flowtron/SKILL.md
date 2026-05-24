---
name: ft-flowtron
description: Display a flowtron info screen — version, what it is, core principles, and the full bundled skill roster with one-liner descriptions. No args. Read-only; writes nothing.
---

# flowtron — info screen

Output an info screen about the flowtron workflow system. This is read-only: write nothing, create no files, open no tasknotes.

## Step 0 — Resolve version

Determine which repo context you're in:

- **Flowtron-self:** repo-root `SPEC.md` exists with heading `# Flowtron — Workflow Specification`. Read it from `SPEC.md`.
- **Adopting project:** read it from `_project/flowtron/SPEC.md`.

Extract the `**Version:**` line near the top. Use that literal version string.

## Step 1 — Output the info screen

Print the following block in the conversation (fill in `VERSION` from Step 0). Do not wrap it in a code block — render it as formatted markdown.

---

# flowtron `VERSION`

A lightweight, project-agnostic tasknote system for solo AI-assisted coding. Keeps context windows small, tasks self-contained, and scope from drifting — with no scripts, daemons, or databases.

**Spec:** `SPEC.md` (adopters: `_project/flowtron/SPEC.md`)
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
| `/ft-task` | Drive a full 4-phase tasknote (Discovery → Execution → Testing & Linting → Closure). Primary workflow for normal-size tasks. |
| `/ft-micro-task` | Single-section lightweight tasknote for tasks above the skip threshold but too small for full ceremony (~30 min or under). |
| `/ft-starter-task` | File a rich-context starter tasknote discovered mid-flow — writes the artifact and PLAN entry, does not start it. |
| `/ft-file-followup` | File a follow-up task from inside an active tasknote — one PLAN line + context paragraph only, no tasknote artifact. |
| `/ft-epic-discovery` | Scaffold and drive a new epic: files parent + `.1` Discovery + audit placeholder, then drives Discovery inline. |
| `/ft-close-epic` | Close an epic by scaffolding and driving its audit subtask, then flips the parent entry to Completed. |
| `/ft-audit` | Stack-neutral scaffold for a ruthless principal-engineer code audit — 5 passes (Security · Idioms · Hygiene · Orphans · Doc drift), capped findings, writes tickets to PLAN. Fork and customize per stack. |
| `/ft-audit-docs` | Documentation-drift audit — 5 passes (Claims vs. code · Cross-doc consistency · Cross-references · Currency · Stale content). Forkable; invoked standalone or as a subroutine by `/ft-release` §7.1. |
| `/ft-audit-security` | Security audit — 5 passes (Secrets · Input handling · Auth & authz · Network & boundaries · Dependencies). Forkable; pin sacred invariants and wire your scanner stack. |
| `/ft-audit-frontend` | Frontend audit — 5 passes (Bundle & payload · Accessibility · Render perf · Browser hygiene · Component health). Forkable; pin design-system / perf-budget / framework. |
| `/ft-audit-backend` | Backend audit — 5 passes (Input & contracts · Error & lifecycle · Persistence · Async correctness · Observability). Forkable; pin API contract / ORM / framework. |
| `/ft-audit-performance` | Performance audit — 5 passes (Hot paths · Payload & bundle · Data access · Memory & resource · Caching). Measurements required. Cross-cuts frontend / backend specialists. |
| `/ft-audit-context` | Adopter-context audit — 4 conversational passes (Bloat · Redundancy · Namespace · Drift) over `CLAUDE.md`, `AGENTS.md`, `.claude/{commands,skills}`. Soft prose with an offer to file PLAN tickets (no auto-write). Global install per `docs/MIGRATION.md` §1.0. |
| `/ft-stats` | Show flowtron stats — `[model]` distribution, completion velocity, per-area volume — aggregated from PLAN.md `## Completed`. Read-only screen; `--write` also flushes to `_project/STATS.md`. |
| `/ft-quality` | Run a lint + typecheck + test sweep against the project (fail-fast). Heuristic stack detection (Node / Python / Go / Rust). Runs outside the tasknote flow. |
| `/ft-new-project` | Bootstrap a fresh repo with flowtron — submodule, PLAN.md, tasknote README, AGENTS.md patch, staged commit. |
| `/ft-release` | Cut a flowtron release — version bump, doc shifts, drift sweep (via `/ft-audit-docs`), single feat: commit, annotated tag, push. (Flowtron-self only.) |
| `/ft-flowtron` | Display this info screen — version, core principles, and the full bundled-skill roster. No args; read-only. |

## Key docs

- `SPEC.md` — canonical workflow contract (4-phase lifecycle, relevance gate, post-closure protocol, versioning)
- `docs/PHILOSOPHY.md` — design rationale and the problems flowtron solves
- `docs/MIGRATION.md` — adoption guide, global skill install recipe, migration from legacy systems
- `docs/CONVENTIONS.md` — conventions flowtron adheres to and declines (commits, versioning, formatting) with rationale
- `docs/AGENT-NEUTRALITY.md` — agent-neutrality contract: which contract-layer Claude-specific surfaces are intentional (load-bearing locators for the Claude Code wiring layer) and why
- `docs/PLATFORMS.md` — multi-platform wiring pattern: two-layer model (agent-neutral contract / per-platform wiring) and the symmetric plug-in shape for future platforms (Codex CLI / grok / Cursor)
- `CONTRIBUTING.md` — solo-maintenance model; issue and PR guidance
- `SECURITY.md` — threat model (prompt injection, submodule supply-chain trust, viz dev-server scope) and vulnerability reporting
- `templates/` — tasknote templates (full, micro, starter)

---

After printing the screen, stop. Do not open a tasknote, ask a follow-up question, or offer next steps unless the user asks.
