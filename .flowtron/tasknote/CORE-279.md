---
title: worktree-end-hardening
status: starter
tags: [worktree, dx]
created: 2026-06-04
---

# CORE-279 | worktree-end-hardening

[← PLAN.md](../PLAN.md) · 🌱 Starter (filed 2026-06-04) · 🔗 [[CORE-EPIC-215]] · [[CORE-215.4]]

## 🌱 Starter context

_Captured 2026-06-04 during an `/ft-epic-discovery` exploration of "should flowtron have branch management?" — promote to full tasknote at `/ft-task` checkout._

### Why this exists

The discovery established that **flowtron is deliberately main-centric**: it commits per-tasknote on your working branch (usually `main`), and everyday feature branches are the user's domain — flowtron stays out of that namespace. The *only* branch lifecycle flowtron owns is the `wt-<TASK-ID>` worktree (`docs/WORKTREES.md`, shipped in CORE-EPIC-215). So the right scope for "better branch close/collapse checks" is **narrowing in on hardening `/ft-worktree-end`**, not building a general branch subsystem.

The motivating pain: a `wt-` worktree opened for an epic child, then coding continued *past that child's scope* without closing the worktree — the branch drifts and nothing nudges a collapse. `/ft-worktree-end` today verifies merge-or-discard, removes the worktree, archives the copied tasknote, optionally prunes the branch — but its safety checks are thin around the drift / orphan / collision cases.

### Solution shape

- Add close-time **drift detection**: warn when the `wt-` branch has commits beyond what the tasknote scope implies (the "kept coding past the child" case) — surface the ahead-count and let the operator confirm.
- Add **unmerged / ahead-of-target warning** before `git worktree remove`: don't silently discard commits not present on the target branch.
- Add **orphaned `wt-` branch listing**: a `wt-<ID>` branch/worktree whose `/ft-worktree-start` never got a matching `/ft-worktree-end` (start-without-end). Surface these so they can be collapsed.
- Add a **collision guard** on reused `wt-<TASK-ID>` names (re-running start for an ID whose branch/worktree already exists).

### Files to touch (preliminary survey — drift-check at promotion)

- `claude/skills/ft-worktree-end/SKILL.md` — primary: add the four checks to the end-flow safety steps.
- `claude/commands/ft-worktree-end.md` — command mirror; keep in sync if it carries the same procedure text.
- `claude/skills/ft-worktree-start/SKILL.md` + `claude/commands/ft-worktree-start.md` — the collision guard belongs on the *start* side; touch if the reused-name check lands there.
- `docs/WORKTREES.md` — "Start / End Flow" section may need a line or two documenting the new checks (the "Open Questions (None)" framing means any behavior add should be reflected here).

### Explicitly out of scope

- Everyday (non-`wt-`) feature-branch lifecycle — deliberately left to the user per the discovery decision. No general "you're on a branch, collapse it?" nudge in the 4-phase flow.
- Any SPEC contract change. This is a skill-text/check hardening, not a workflow-contract edit.
- New skills. Hardening the existing pair only.

### Decisions locked in this conversation

| Decision | Choice | Rationale |
|---|---|---|
| Scope | Harden `/ft-worktree-end` checks only | Discovery ruled out a general branch subsystem (epic) and a docs-only stance codification; the real owned surface is the worktree close path. |
| Everyday branches | Stay the user's domain | flowtron is main-centric by design; `wt-` namespace deliberately avoids collision with user feature branches. |
| No SPEC change | Confirmed | The worktree convention is workflow-orthogonal; checks live in the thin skills, not the contract. |

### Open at promotion (Phase 1 should resolve)

- Does the collision guard belong in `/ft-worktree-start` (prevent reuse) or `/ft-worktree-end` (detect stale), or both? Lean: start-side prevent + end-side orphan-list.
- How to detect "drifted past scope" without false positives — commit-count heuristic vs. just surfacing ahead/behind vs. target. Lean: surface ahead-of-target count + let operator judge, no hard block.
- Whether orphan listing scans only the current project or the cross-project `~/code/*-worktrees/` space. Lean: current project only, keep the skill thin.

### Related

- [[CORE-EPIC-215]] — origin of the worktree convention + the five locked conventions.
- [[CORE-215.4]] — the `/ft-worktree-end` skill this task hardens.
