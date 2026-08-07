# Handing Tasknotes to External CLI Agents

Flowtron is agent-neutral: the tasknote, `PLAN.md`, and `SPEC.md` are plain markdown, so any coding agent that can read a repo can pick up a flowtron task. This document records the convention for **handing a single tasknote off to an external CLI coding agent** — Kiro, Claude Code, Codex, or any equivalent — and getting its work back cleanly.

It is a documentation pattern, not a subsystem. Flowtron ships **no orchestrator, no scheduler, and no multi-agent runtime** — see [Not an orchestration runtime](#not-an-orchestration-runtime) below. The tools named here are **examples**, not dependencies; the convention is tool-agnostic.

## The Core Rule: One Agent Per Tasknote

**A tasknote is the unit of handoff, and exactly one agent owns it at a time.**

The tasknote already exists to hold one task's entire scope in one context window (SPEC.md §"Core principles" #3). That property is what makes it a clean handoff boundary: the receiving agent gets the Goal, Acceptance criteria, Subtasks, and Discovery Notes as a self-contained brief, and the 4-phase workflow tells it exactly where to pick up.

Do **not** split one tasknote across two agents, and do **not** have two agents share a working tree on the same task. If work is genuinely parallelizable, it is *already* two tasknotes — file it as an epic with independent children (SPEC/epic.md) and hand each child to its own agent in its own worktree (below).

A **probe** is not a second owner: it owns no tasknote, never enters the 4-phase lifecycle, and returns a distilled summary to the agent that does own the tasknote — see README.md §"Sessions, loops, and sub-agents" for the probe/delegate split. This rule bounds *ownership*, not every context an owner may consult.

## The Handoff Contract

An external agent needs three things to run a flowtron tasknote, and nothing more:

1. **The tasknote file** — `.flowtron/tasknote/<TASK-ID>.md`, with Phase 1 Discovery complete (Relevance Assessment made, Acceptance + Subtasks populated). Discovery is where scope is locked; do the handoff *after* it, so the receiving agent executes rather than re-scopes.
2. **The contract** — `SPEC.md` (or the pinned `.flowtron/core/SPEC.md` submodule in an adopter project). Defines the 4-phase workflow, the relevance gate, and the operator cues the agent should emit.
3. **`PLAN.md`** — so the agent can flip the task line at closure and read related-task context.

All three are in the repo already. The "handoff" is therefore just: point the external agent at the repo and tell it which `<TASK-ID>` to run. No export step, no serialization, no shared state beyond the files git already tracks.

## Isolating Parallel Agents: Use Worktrees

Running two external agents at once on the same checkout means two agents stepping on each other's working tree. The isolation convention already exists — see [WORKTREES.md](WORKTREES.md).

For each independent epic child you want to run in parallel:

1. `/ft-worktree-start <TASK-ID>` creates a `wt-<TASK-ID>` branch + worktree at `~/code/<project>-worktrees/wt-<TASK-ID>/` and copies the active tasknote into it.
2. Open a fresh session for **one** external agent in that worktree directory and hand it `<TASK-ID>`.
3. `/ft-worktree-end <TASK-ID>` verifies the merge (or explicit discard), removes the worktree, and archives the tasknote from the main checkout.

One agent, one tasknote, one worktree. The worktree convention's "when to reach for it" rules (independent children of a discovery-scoped epic; no hard dependencies on in-flight siblings) apply unchanged — worktrees are the isolation primitive; this doc is about *who* runs inside one.

## The Return

When an external agent finishes, its output is exactly what any flowtron session produces: the tasknote archived to `.flowtron/tasknote/archive/<area>/`, the `PLAN.md` line flipped to the `Completed YYYY-MM-DD.` stub, and a commit. Reviewing that work is the same operator gate as always — the 📦 ready-to-commit recap and the closure diff. Nothing about an external agent changes the post-closure protocol (SPEC.md §"Post-closure protocol"); the operator reviewing the diff is still the control point.

If the external agent worked in a worktree, `/ft-worktree-end` is the merge-and-clean step. If it worked on the main checkout in its own session, the returned commit is reviewed and kept like any other.

## Not an Orchestration Runtime

This document describes a **convention for a human operator** who chooses to run more than one agent. Flowtron deliberately does not provide, and will not accept:

- A multi-agent scheduler or dispatcher that assigns tasknotes to agents.
- A session daemon that keeps external agents alive or polls their state.
- A "fan-out" or "swarm" runtime that runs children in parallel automatically.

These are the same rejections VISION.md §"What we won't accept" makes for loop runtimes and cross-project query layers: flowtron ships the **markdown contract** the agents report to (the tasknote, the 4-phase workflow, the operator cues), and the *runtime* — which agent, when, in which session — stays with the operator and whatever CLI they chose. If you want parallelism, the worktree pair plus a fresh session per child is the whole mechanism.

## Relationship to the Rest of Flowtron

- **No SPEC contract change.** The 4-phase workflow, relevance gate, operator cues (🛠️ / 📦), and post-closure protocol are identical whether the agent running a tasknote is Claude Code, Codex, Kiro, or the operator by hand.
- **Agent-neutral by construction.** See [AGENT-NEUTRALITY.md](AGENT-NEUTRALITY.md) and [AGENT-COMPAT.md](AGENT-COMPAT.md) for the per-agent consume-mode matrix. An external agent that can read markdown and run `cp` / `mv` / `git` can run a tasknote; a contract-only agent uses the procedure SOPs (`SPEC/procedures/`).
- **Worktrees are the isolation layer.** [WORKTREES.md](WORKTREES.md) owns the parallel-execution convention; this doc adds only the "one external agent per tasknote" framing on top of it.

---

**Related:** [WORKTREES.md](WORKTREES.md) · [AGENT-NEUTRALITY.md](AGENT-NEUTRALITY.md) · [AGENT-COMPAT.md](AGENT-COMPAT.md) · [PLATFORMS.md](PLATFORMS.md) · [VISION.md](VISION.md) §"What we won't accept"
