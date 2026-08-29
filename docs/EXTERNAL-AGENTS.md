# Handing Tasknotes to External CLI Agents

Flowtron is agent-neutral: the tasknote, `PLAN.md`, and `SPEC.md` are plain markdown, so any coding agent that can read a repo can pick up a flowtron task. This document records the convention for **handing a single tasknote off to an external CLI coding agent** — Kiro, Claude Code, Codex, or any equivalent — and getting its work back cleanly.

It is a documentation pattern, not a subsystem. Flowtron ships **no orchestrator, no scheduler, and no multi-agent runtime** — see [Not an orchestration runtime](#not-an-orchestration-runtime) below. What it *does* ship for a caller running tasknotes with nobody watching is a markdown contract: [The Orchestration Contract](#the-orchestration-contract). The tools named here are **examples**, not dependencies; the convention is tool-agnostic.

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

This is distinct from the optional `## 🔄 Handoff` tasknote section (SPEC.md §"Tasknote body shape"), which captures mid-task resume state for the *same* task's next session rather than transferring ownership to another agent.

## Isolating Parallel Agents: Use Worktrees

Running two external agents at once on the same checkout means two agents stepping on each other's working tree. The isolation convention already exists — see [WORKTREES.md](WORKTREES.md).

For each independent epic child you want to run in parallel:

1. `/ft-worktree-start <TASK-ID>` creates a `wt-<TASK-ID>` branch + worktree at `<project>-worktrees/wt-<TASK-ID>/` (sibling of the project checkout) and copies the active tasknote into it.
2. Open a fresh session for **one** external agent in that worktree directory and hand it `<TASK-ID>`.
3. `/ft-worktree-end <TASK-ID>` verifies the merge (or explicit discard), removes the worktree, and archives the tasknote from the main checkout.

One agent, one tasknote, one worktree. The worktree convention's "when to reach for it" rules (independent children of a discovery-scoped epic; no hard dependencies on in-flight siblings) apply unchanged — worktrees are the isolation primitive; this doc is about *who* runs inside one.

## The Return

When an external agent runs a tasknote to completion, its output is exactly what any flowtron session produces: the tasknote archived to `.flowtron/tasknote/archive/<area>/`, the `PLAN.md` line flipped to the `Completed YYYY-MM-DD.` stub, and a commit. Reviewing that work is the same operator gate as always — the 📦 ready-to-commit recap and the closure diff. Nothing about an external agent changes the post-closure protocol (SPEC.md §"Post-closure protocol").

**A run has three possible endings, not one.** A run driven with no operator present (see [The Orchestration Contract](#the-orchestration-contract) below) may also stop deliberately, or refuse to start at all. All three are filesystem facts, so a caller reads the outcome from the repo rather than from a transcript:

- **Closed** — tasknote archived, `PLAN.md` line stubbed `[x]`, one atomic commit covering deliverables + PLAN flip + archive move.
- **Parked** — tasknote still at `.flowtron/tasknote/<TASK-ID>.md` with `status: blocked` and a `park-reason:` code, `PLAN.md` line still `[ ]`, no commit. Phase 1 and any partial Phase 2 are preserved verbatim.
- **Refused** — nothing written at all. A pre-scaffold stop (a dirty tree, an already-closed ID, an existing archive) is reported and the run terminates rather than leaving a half-scaffolded note behind.

**The control point moves; it does not disappear.** With an operator at the 📦 gate, the diff review is the control. With none, two things hold that line in its place: the park conversions, which stop the run at any question an absent operator would have answered, and the **paper-complete guard** (SPEC.md §"Paper-complete guard"), which the posture leaves untouched — the foreign-dirt gate still refuses a dirty tree, closure is still one atomic commit, and 🏁 still requires a real deliverable-covering SHA. Review is deferred to the accumulated commits, not removed from the loop.

If the external agent worked in a worktree, `/ft-worktree-end` is the merge-and-clean step. If it worked on the main checkout in its own session, the returned commit is reviewed and kept like any other.

## The Orchestration Contract

Everything above assumes an operator choosing when to hand a tasknote out and reading the result when it comes back. A caller may also drive a tasknote with **nobody present** — a headless session, a scheduled run, a process handing out children of an epic. Flowtron supports that the same way it supports loops and worktrees: with a contract, not a runtime. The caller declares the posture; flowtron guarantees a readable outcome in the repo.

What follows is the whole of what such a caller may rely on. Each rule names its canonical owner rather than restating it — the contract lives in `SPEC/`, and a second copy here would be the first thing to drift.

1. **Declare the posture.** Pass `--unattended` to the skill driving the tasknote. It declares something `--fast` never claims: that no operator is present to answer a gate. Four skills accept it — the three runners (`/ft-task`, `/ft-micro-task`, `/ft-goal-task`), where it supersets `--fast`'s autonomy (but not its 👁️ delegation, per step 3) and the two are never passed together, and `/ft-close-epic`, which never accepted `--fast`, so there it carries the posture directly. `/ft-epic-discovery` deliberately accepts neither: filing an epic is a scoping conversation, and there is nobody to have it with. Contract: SPEC/gates.md §"`--unattended` operator posture". Per-agent availability and routing: [PLATFORMS.md](PLATFORMS.md).

2. **Deny by default when choosing what to dispatch.** A PLAN.md row may carry an optional `[unattended]` marker after its `[model]` token — the operator's declaration that *this row* is safe to drive with nobody present. Flowtron never writes it; seeding is an operator act, and a caller that files rows cannot mark its own. So an **unmarked row is undecided, not approved**: a caller selecting work autonomously takes marked rows only, and leaves the rest for a session with somebody in it. The marker is row-level and the posture in step 1 is invocation-level; neither implies the other. Grammar, position, and the two ways authors mis-write it: SPEC.md §"Task-line format".

3. **Expect a park wherever a gate needs a person.** Most gates that survive `--fast` do so because they need a decision, not merely patience — a scope verdict, a destructive command, a manual prerequisite. One converts for the opposite reason: `--fast` *suppresses* the 👁️ visual-confirmation ask precisely by handing it to the operator standing there, so with nobody present it parks rather than vanishing. Under the posture each of these stops the run rather than blocking on an answer nobody is there to give. A park is not a failure: it is Phase 1 and any partial Phase 2 preserved at the exact point a decision was needed. SPEC/gates.md enumerates which gates convert; a caller needs only to know that a park is an expected ending, not an error.

4. **Classify a stop by its code, not its prose.** A parked tasknote carries `park-reason: <code> — <explanation>`. Split on the first ` — `, branch on the code, and never parse the explanation. The codes are a **closed set**: a new stop cause adds a row upstream rather than inventing a value, so exhaustive branching is safe and an unrecognized code is a bug rather than a variant. The set and each code's meaning: SPEC.md §"Tasknote frontmatter" → "Park reason".

5. **Resume by re-invoking the same skill.** A parked tasknote is paused, not closed. Running `<SKILL> <TASK-ID>` against it takes the resume path automatically, restores `in-progress`, clears the reason, and continues where the park left off. Nothing is reconstructed and Discovery is not re-run — that preservation is the point. Most codes describe a question, so the natural resume is an attended one with somebody there to answer it. Contract: SPEC/blocked.md.

6. **Annotate a run that ended without stopping.** A killed process, an exhausted context, or a lost session leaves a tasknote at `in-progress` with no gate having fired and no reason written — a state the runners refuse, because restarting a half-executed task would re-run Discovery over finished work. The caller converts it into the parked state above with two frontmatter writes (`status: blocked` plus an `interrupted` reason) and re-invokes normally. **Flowtron performs neither write**: it ships no crash detector, supervisor, or session daemon, and a runner cannot annotate a note in a session that no longer exists. Contract: SPEC/blocked.md §"Resuming an interrupted run".

7. **Expect one deferred motion when closing an epic.** Under the posture, the epic-close runner drives the terminal audit child to full closure and commits it, then leaves the parent-flip unanswered: the parent line stays `[ ]` above a cohort of `[x]` children, which is structurally what "flip pending" looks like. The audit is reachable; the irreversible cohort move stays operator-owned. Terms: SPEC/gates.md §"`/ft-close-epic` under the posture".

The posture removes *pauses*, never *proof* — every part of the paper-complete guard holds with no unattended variant. What it deliberately does **not** provide is the subject of the next section.

## Not an Orchestration Runtime

This document describes a **convention and a markdown contract**, for an operator who chooses to run more than one agent and for a caller running one with nobody watching. Neither is a runtime. Flowtron deliberately does not provide, and will not accept:

- A multi-agent scheduler or dispatcher that assigns tasknotes to agents.
- A session daemon that keeps external agents alive or polls their state.
- A "fan-out" or "swarm" runtime that runs children in parallel automatically.
- A job graph or lock over `## 🌳 Fan-out` / YAML `blocked-by:` / `parallel-safe-with:` — those are markdown facts, not a scheduler. `/ft-worktree-start` may warn on an open blocker; it must not refuse.

These are the same rejections VISION.md §"What we won't accept" makes for loop runtimes, graph / multi-agent execution runtimes, and cross-project query layers: flowtron ships the **markdown contract** the agents report to (the tasknote, the 4-phase workflow, the operator cues, the Fan-out declaration, and the operator-less posture above), and the *runtime* — which agent, when, in which session — stays with the operator and whatever CLI they chose. If you want parallelism, the worktree pair plus a fresh session per child is the whole mechanism. See [PHILOSOPHY.md](PHILOSOPHY.md) §"What flowtron deliberately is not."

## Relationship to the Rest of Flowtron

- **The contract does not vary by agent; it varies by posture.** The 4-phase workflow, relevance gate, operator cues (🛠️ / 📦), and post-closure protocol are identical whether the agent running a tasknote is Claude Code, Codex, Kiro, or the operator by hand. What differs is the posture the *caller* declares: the operator-less posture (§"The Orchestration Contract") is an opt-in, additive SPEC contract that converts unanswerable gates into parks. A run that does not declare it sees the contract exactly as it was before the posture existed.
- **Agent-neutral by construction.** See [AGENT-NEUTRALITY.md](AGENT-NEUTRALITY.md) and [AGENT-COMPAT.md](AGENT-COMPAT.md) for the per-agent consume-mode matrix. An external agent that can read markdown and run `cp` / `mv` / `git` can run a tasknote; a contract-only agent uses the procedure SOPs (`SPEC/procedures/`).
- **Worktrees are the isolation layer.** [WORKTREES.md](WORKTREES.md) owns the parallel-execution convention; this doc adds only the "one external agent per tasknote" framing on top of it.

---

**Related:** [WORKTREES.md](WORKTREES.md) · [AGENT-NEUTRALITY.md](AGENT-NEUTRALITY.md) · [AGENT-COMPAT.md](AGENT-COMPAT.md) · [PLATFORMS.md](PLATFORMS.md) · [VISION.md](VISION.md) §"What we won't accept"
