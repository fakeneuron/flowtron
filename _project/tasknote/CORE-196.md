---
title: worktree-convention
status: starter
tags: []
created: 2026-05-25
---

# CORE-196 | worktree-convention

[← PLAN.md](../PLAN.md) · 🌱 Starter (filed 2026-05-25) · 🔗 [[CORE-EPIC-195]]

## 🌱 Starter context

_Captured 2026-05-25 during a superpowers-vs-flowtron research conversation — promote to full epic at `/ft-epic-discovery` invocation. This is the sibling adoption to [[CORE-EPIC-195]] (ft-debug-skill); both surfaced from obra/superpowers as flowtron-adoption candidates._

### Why this exists

obra/superpowers ships a `using-git-worktrees` skill as one of its mandatory workflow stages. Flowtron currently has no convention for parallel epic-child work: every child queues serially even when independent. Adopters with parallel-friendly backlogs (e.g., fintown's BE-EPIC-3 wave has ~20 independent follow-up children, .6 through .30) pay a real cost in stash/branch-swap churn. A flowtron-level worktree convention + thin skill pair would let adopters pipeline independent children in isolated checkouts without that churn — workflow-orthogonal to the 4-phase contract.

### Solution shape

- **Doc convention** (likely in `docs/`, not `SPEC.md`) — when to reach for a worktree (independent child of a multi-child epic), how to name them (e.g., `wt-<TASK-ID>/`), where they live on disk (e.g., `~/code/<project>-worktrees/` or `<project>/.worktrees/`), branch-naming convention, merge/cleanup discipline.
- **Two thin skills**, not one mega-skill:
  - `/ft-worktree-start <ID>` — branches off main, creates the worktree, copies the active tasknote into the worktree so the agent can keep working in isolation.
  - `/ft-worktree-end <ID>` — verifies the worktree branch was merged (or explicitly discards), removes the worktree, archives the tasknote in the main checkout.
- **Per-project install** via `claude/AGENTS-snippet.md` §1.2 symlink bundle (alongside `/ft-task` et al.) — worktrees operate on the project's git repo, so they belong with the other tasknote skills.

### Files to touch (preliminary survey — drift-check at promotion)

- `claude/skills/ft-worktree-start/SKILL.md` — new skill body
- `claude/skills/ft-worktree-end/SKILL.md` — new skill body
- `claude/commands/ft-worktree-start.md` — command stub
- `claude/commands/ft-worktree-end.md` — command stub
- `docs/WORKTREES.md` (or similar) — doc convention (when/how/where)
- `claude/AGENTS-snippet.md` — paste-block skill enumeration + §"One-time symlink wiring" list (six → eight after both CORE-EPIC-195 and this epic land)
- `claude/skills/ft-new-project/SKILL.md` Step 3 symlink list
- `docs/MIGRATION.md` §1.2 prose
- `claude/skills/ft-flowtron/SKILL.md` roster table
- `docs/PLATFORMS.md` skill counts (19→21 after both land)
- Possibly `SPEC.md` §"Skill namespace" enumeration; verify §"The 4-phase workflow" needs no worktree-specific guidance

### Explicitly out of scope

- TDD red-green-refactor enforcement — separate (much larger) epic if pursued; reshape of flowtron's Phase 2/3 ordering, not workflow-orthogonal.
- Multi-branch dependency tracking — worktrees solve parallel **independent** children, not "this child depends on that one." Dependency-graph filing stays out of scope.
- Migrating existing in-flight epics to worktree workflow — additive, opt-in. Existing adopters' serial workflow keeps working.
- Automatic conflict resolution between worktrees — outside scope; standard `git merge`/rebase conventions apply.

### Decisions locked in this conversation

| Decision | Choice | Rationale |
|---|---|---|
| Adoption source | obra/superpowers `using-git-worktrees` | One of the three flowtron-relevant adoption candidates surfaced in the 2026-05-25 research conversation; sibling to [[CORE-EPIC-195]] |
| Flowtron-level vs adopter-level | Flowtron-level | All adopters benefit from worktree convention; pattern is project-agnostic |
| Workflow-contract impact | Workflow-orthogonal | Worktrees don't change the 4-phase serial contract — they parallelize across children, not within one |
| Skill granularity | Two thin skills (start + end) | Clean responsibilities; each one smaller and reviewable; cleanup discipline lives in its own skill |
| Install pattern | Per-project bundled (§1.2 symlink list) | Operates on the project's git repo; belongs with `/ft-task` family, not the global-install set |
| Use of `/ft-epic-discovery` | Standard (not `--deep`) | Shared design surface is small (2 skills + 1 doc + wiring); `--deep` upfront staging not worth the interruption |

### Open at promotion (Phase 1 should resolve)

- Worktree location convention — `~/code/<project>-worktrees/<branch>/`, `<project>/.worktrees/<branch>/`, or `<project>/../worktrees/<branch>/`? Lean: `~/code/<project>-worktrees/` (mirrors how viz/ + adopter checkouts coexist; no in-repo dirt).
- Branch-naming — `wt-<TASK-ID>`, `task/<TASK-ID>`, or `<TASK-ID>`? Lean: `wt-<TASK-ID>` (worktree prefix signals isolation; survives merge as a search-friendly history marker).
- Skill naming — `/ft-worktree-start` + `/ft-worktree-end` vs shorter (`/ft-wt-start`)? Lean: verbose names; flowtron prefers full words in skill IDs.
- Tasknote handling on worktree creation — copy active tasknote, hard-link, or just symlink? Lean: copy (worktree edits commit back to the main checkout's path via merge; symlink would surprise users).
- Subtask split (when `/ft-epic-discovery` runs against this) — likely N=5: Discovery + ft-worktree-start skill + ft-worktree-end skill + adopter wiring + audit. May collapse to N=4 if Discovery decides the two skills can be a single child.

### Related

- [[CORE-EPIC-195]] — sibling adoption from obra/superpowers (`/ft-debug` skill); filed in the same 2026-05-25 session
