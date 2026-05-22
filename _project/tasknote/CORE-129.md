---
title: AGENTS.md migration
status: starter
tags: []
created: 2026-05-22
---

# CORE-129 | AGENTS.md migration

[← PLAN.md](../PLAN.md) · 🌱 Starter (filed 2026-05-22)

## 🌱 Starter context

_Captured 2026-05-22 during the Option B agent-agnostic decoupling design discussion — promote to full tasknote at `/ft-task` checkout._

### Why this exists

Flowtron's adopter snippet lives at `claude/CLAUDE-snippet.md` and gets pasted into project-side `CLAUDE.md`. That ties adopters to Claude Code as discovery surface even though the snippet's content (workflow contract pointers) is agent-neutral. `AGENTS.md` is now an open standard read by Claude Code (as fallback), Codex CLI, Cursor, Sourcegraph Amp, and Aider — moving the canonical paste-block target from `CLAUDE.md` to `AGENTS.md` gives non-Claude adopters compatibility for free with zero Claude-side regression. Smallest, highest-leverage slice of the wider Option B agent-agnostic decoupling; the rest defers to a future `CORE-EPIC`.

### Solution shape

- Canonical paste-block target flips from project-side `CLAUDE.md` to project-side `AGENTS.md`.
- Flowtron's source-of-truth snippet renames from `claude/CLAUDE-snippet.md` to `claude/AGENTS-snippet.md` (directory rename deferred to the future epic).
- `docs/MIGRATION.md` §1.3 updates paste-block instructions; §1.6 commit step gets the new target path.
- SPEC §"Repo layout" + README.md + `ft-new-project` skill + `ft-flowtron` skill updated to point at the new home.
- Existing adopters: no forced migration. Claude Code reads both `AGENTS.md` and `CLAUDE.md`, so existing installations keep working. Opportunistic move on next touch.

### Files to touch (preliminary survey — drift-check at promotion)

- `claude/CLAUDE-snippet.md` → renames to `claude/AGENTS-snippet.md`
- `docs/MIGRATION.md` §1.3 + §1.6
- `SPEC.md` §"Repo layout" (currently references `claude/CLAUDE-snippet.md` around line 53)
- `README.md` — verify no stale references
- `claude/skills/ft-new-project/SKILL.md` — bootstrap writes the paste-block target
- `claude/skills/ft-flowtron/SKILL.md` — info screen mentions paste-block location

### Explicitly out of scope

- `claude/` → `agents/` directory tree rename (future epic subtask)
- `AskUserQuestion` references in skill bodies (future epic subtask)
- `[opus]/[sonnet]` model-tag enum opening (future epic subtask)
- `.codex/` or other agent-adapter scaffolding (future epic subtask)

### Decisions locked in this conversation

| Decision | Choice | Rationale |
|---|---|---|
| Filing shape | Single starter, not epic | 5–6 subtasks share one design decision + one test gate; fits a 🧩 Subtasks checklist (SPEC/epic.md threshold) |
| Scope boundary | AGENTS.md home only; defer rename, intent sweep, enum opening | Smallest viable Option B slice; the rest is its own CORE-EPIC |

### Open at promotion (Phase 1 should resolve)

- Does the snippet stay under `claude/` as `AGENTS-snippet.md`, or move to repo root as `AGENTS.md`? Lean: keep under `claude/` — the directory rename is a separate epic subtask, so moving the home twice would be churn.
- Is the old `claude/CLAUDE-snippet.md` deleted, kept as a redirect, or kept as an alias? Lean: delete with a git-history pointer in MIGRATION.md (write-once policy).
- Verify Claude Code's `AGENTS.md` fallback actually works before any rename. Lean: test in flowtron's own self-host (it already has CLAUDE.md).

### Related

- Parent: Option B agent-agnostic decoupling discussion (future `CORE-EPIC-<N>` once CORE-129 ships)
