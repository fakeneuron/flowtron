---
description: Adopter-context audit — 4 conversational passes (Bloat · Redundancy · Namespace · Drift) over `CLAUDE.md`, `AGENTS.md`, `.claude/{commands,skills}`. Soft prose recommendations with an offer to file PLAN tickets at the end. No auto-write.
---

Invoke the `audit-context` skill. The skill scans the current project's AI-coding context surfaces (`CLAUDE.md`, `AGENTS.md`, `.claude/commands/`, `.claude/skills/`) across four passes — Bloat (Claude Code's ~40k-char threshold) · Redundancy with flowtron's `AGENTS.md` paste-block · `ft-*` namespace conflicts · Workflow drift from flowtron's lean-context principle. Output is conversational prose with severity tags inline (no `Finding #N` scaffold). After the report, an `AskUserQuestion` offers to file any findings as `.flowtron/PLAN.md` tickets — no auto-write.

This skill is **global install** per `docs/MIGRATION.md` §1.0 — works in any cwd with adopter-side or flowtron-self context surfaces, no per-project wiring required.
