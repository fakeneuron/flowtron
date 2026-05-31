# Worktree Convention for Parallel Epic Children

Flowtron's default execution model is strictly serial within a tasknote and serial across siblings under an epic. For adopters with large backlogs of *independent* children (e.g. a 20-child follow-up wave after a discovery epic), the stash/branch-swap overhead becomes real.

This document records the adopted convention for executing independent epic children in isolated git worktrees. It is a direct adoption of the `using-git-worktrees` pattern from obra/superpowers, lifted into flowtron as a thin, project-agnostic skill pair plus this convention doc. The pattern is **workflow-orthogonal**: it does not change the 4-phase contract, the relevance gate, or any post-closure protocol inside a tasknote.

See [[CORE-EPIC-215]] (and its .1 Discovery [[CORE-215.1]]) for the origin, locked decisions, and sibling precedent [[CORE-EPIC-195]].

## The Five Locked Conventions

| Area                  | Choice                                      | Rationale |
|-----------------------|---------------------------------------------|-----------|
| Location              | `~/code/<project>-worktrees/wt-<TASK-ID>/` | Keeps the primary project checkout clean; mirrors the `viz/` co-location pattern used in flowtron self-host; global viz workspace scans (`~/code/*/_project/PLAN.md`) continue to work without special config. |
| Branch naming         | `wt-<TASK-ID>` (e.g. `wt-CORE-215.3`)      | Short, unambiguous, instantly recognizable as a flowtron worktree; avoids collision with normal feature branches. |
| Skill naming          | `/ft-worktree-start` + `/ft-worktree-end` (verbose) | Matches flowtron's full-word preference; the pair is self-documenting; no need for ultra-short aliases. |
| Tasknote handling     | Copy the active tasknote into the worktree | The agent working in the isolated checkout needs the full Phase 1 context (Goal, Acceptance, Discovery Notes, resolved questions). Copy is simple, reviewable, and avoids symlink/hardlink edge cases across machines. |
| Merge / cleanup       | Verify merge (or explicit discard), `git worktree remove`, archive the *copied* tasknote from the *main* checkout | The worktree is a throwaway execution environment. Cleanup discipline lives in the end skill so the main checkout's archive and git history remain the source of truth. |

All five choices were explicitly resolved during the re-scope documented in CORE-EPIC-215 (and its Discovery child CORE-215.1). Future changes require a new tasknote + rationale.

## When to Reach for a Worktree

Use the worktree pair **only** for independent children of a multi-child epic:

- The epic has a `.1` Discovery that filed the children (or equivalent explicit scoping).
- The specific child has **no hard dependencies** on prior siblings still in flight.
- You want to pipeline two or more such children on the same machine without constant stashing.

Do **not** use for:
- Single-task work
- Dependent children (where order or shared state matters)
- Main-line development on `main` / your primary branch
- Anything that would require the worktree to become long-lived

The convention is deliberately narrow so the two thin skills stay thin and the mental model stays simple.

## Start / End Flow (Conceptual)

**Start** (`/ft-worktree-start <TASK-ID>`):
1. From the main checkout on the correct parent branch, create a new branch `wt-<TASK-ID>`.
2. Create a git worktree at `~/code/<project>-worktrees/wt-<TASK-ID>/` pointing at that branch.
3. Copy the currently active tasknote (`_project/tasknote/<TASK-ID>.md`) into the worktree's `_project/tasknote/` (so the agent there sees the identical Phase 1 record).
4. Hand off: the operator opens a fresh session in the worktree directory and invokes `/ft-task <TASK-ID>` (or the next appropriate command).

**End** (`/ft-worktree-end <TASK-ID>`):
1. In the main checkout, verify the worktree branch was merged into the expected target (or the operator explicitly confirms discard).
2. `git worktree remove` the isolated checkout (this also cleans `.git/worktrees/` metadata).
3. Archive the *copied* tasknote that lived inside the worktree (the main-checkout archive remains canonical).
4. Optionally prune the local `wt-` branch if it is no longer needed.

Exact mechanics, safety checks, and edge cases (unmerged work, dirty state, viz workspace implications) are implemented in the thin skill pair ([[CORE-215.3]] and [[CORE-215.4]]).

## Relationship to the Rest of Flowtron

- **No SPEC contract change.** The 4-phase workflow, relevance gate, operator cues (🛠️ / 📦), conditional skip rule, and post-closure protocol are unchanged inside any tasknote that happens to run inside a worktree.
- **Epic lifecycle unchanged.** The `.1` Discovery + children + `.N` Audit bracket (see [`SPEC/epic.md`](../SPEC/epic.md)) still governs multi-child work; worktrees are merely an execution accelerator for the independent subset of those children.
- **Adopter wiring.** The two new skills install via the same per-project symlink bundle as the rest of the tasknote family (see `docs/MIGRATION.md` §1.2 and the AGENTS.md paste block). Full surface updates landed in [[CORE-215.5]].

## Open Questions (None)

All scoping decisions for the convention itself were locked before this document was authored. Implementation details that surfaced during [[CORE-215.3]] / [[CORE-215.4]] were recorded in those tasknotes; no adoption-relevant changes required updates here.

---

**Related:** [[CORE-EPIC-215]] · [[CORE-215.1]] · [[CORE-215.3]] · [[CORE-215.4]] · [[CORE-215.5]] · [[CORE-215.6]] · [[CORE-EPIC-195]] (sibling pattern)
