# `--unattended` — operator-less posture (executable steps)

> Lazy-loaded SKILL fragment — **shared**. Loaded by `/ft-task`, `/ft-micro-task`, `/ft-goal-task`, and `/ft-close-epic` at their Step 0 when `unattended-mode = true`. The file is owned by `claude/skills/ft-task/`; the other three skills resolve it through their `<UNATTENDED>` path binding, the same way the runners resolve `step-1.5-model-edge.md` through `<MODEL_EDGE>`.
>
> **The contract lives in [`SPEC/gates.md`](../../../SPEC/gates.md) §"`--unattended` operator posture"** — this fragment is its executable interpretation across the three runners, not a second copy. Read the contract when this file is silent or in tension. The `park-reason:` key and its closed-set codes are canonical in [`SPEC.md`](../../../SPEC.md) §"Tasknote frontmatter"; the parked state and its resume path are canonical in [`SPEC/blocked.md`](../../../SPEC/blocked.md).
>
> **`<SKILL>` below stands for the invoking skill's own slash command** — `/ft-task`, `/ft-micro-task`, `/ft-goal-task`, or `/ft-close-epic`. Substitute it wherever it appears; never hard-code `/ft-task`.
>
> **Most of this file is written for the three runners.** `/ft-close-epic` shares the park recipe, the pre-scaffold stop shape, and the never-relaxed list, but it is **not** a `--fast` superset there and its parent-flip is *deferred* rather than parked — see §"`/ft-close-epic`" at the end, and `SPEC/gates.md` §"`/ft-close-epic` under the posture" for the contract.

## What the posture adds

`--unattended` declares that **no operator is present to answer a gate**. On the three runners it is a strict superset of `--fast`: setting `unattended-mode = true` also sets `fast-mode = true`, so all three `--fast` surfaces (📦 force-skip, 👁️ suppression, 🛠️ no-op for routine trips) apply exactly as written — the operator does not pass both flags. On `/ft-close-epic` there is no `--fast` to be a superset of, and the flag carries the posture directly.

On top of that, it adds **exactly one behavior**: where `--fast` still lets a gate fire, `--unattended` **parks the tasknote** instead of firing a banner into an empty session. A conversion *removes* a banner and never adds one. Mint no new cue glyph; the CORE-065 two-banner cap is untouched.

Flowtron ships no orchestrator, scheduler, or session daemon. This posture is the contract an orchestrator reports to — contract in flowtron, runtime in the caller.

## The park recipe

Every conversion below performs the same four writes, then stops:

1. Flip the tasknote's YAML `status:` to `blocked`.
2. Flip the nav-header chip from `🟢 In progress` to `⏸ Blocked`.
3. Write `park-reason: <code> — <one-line prose>` into the frontmatter, where `<code>` comes from the closed set in `SPEC.md` §"Tasknote frontmatter". A caller splits on the first ` — ` to read the code and never parses the prose, so put the classification in the code and the detail in the prose.
4. Emit one inline marker and **stop**:

   ```markdown
   ⏸ --unattended park — <code>: <one line>. Tasknote parked at `.flowtron/tasknote/<TASK-ID>.md`; PLAN.md line unchanged.
   ```

   `⏸` is the pre-existing nav chip, not a new cue glyph.

**Stop means stop.** Do not run Phase 3 or Phase 4. The tasknote stays at `.flowtron/tasknote/<TASK-ID>.md`, the PLAN.md line stays unchecked, and Phase 1 plus any partial Phase 2 work is preserved verbatim.

**A park never performs the operator's motion.** The drift park does not make the verdict's PLAN.md edit and does not delete the tasknote; the micro dependency park does not re-file the task. Record what the operator should do on resume in the `park-reason:` prose or the tasknote body — the resuming operator takes it under a real gate.

**Resume is unchanged.** Re-invoking `<SKILL> <TASK-ID>` against the parked tasknote takes `SPEC/blocked.md`'s normal resume path: drift-check the parked work, flip `status:` back to `in-progress`, flip the chip back to `🟢 In progress`, **remove `park-reason:`**, and continue.

## Conversion map

Five gates convert from *ask and wait* to *park and stop*. The sixth row is the mid-execution dependency park that predates the posture, listed here because the posture changes what the runners do about it.

| Gate | `park-reason` code | `/ft-task` | `/ft-micro-task` | `/ft-goal-task` |
|---|---|---|---|---|
| Step 1.5 **concrete-model mismatch** STOP | `model-mismatch` | Step 1.5 — scaffold, then park (see below) | Step 1.5 — same | Step 1.5 — same |
| 🛠️ Phase 1→2 **drift carve-out** (`Re-scope` / `De-scope`) | `drift` | Step 4 exit gate | Step 3 Relevance prompt | Step 4 exit gate |
| **Destructive-action escalation** 🗄️/▶️/📡/💻 | `destructive` | Step 5 Phase 2 | Step 3 execution | Step 5 loop (already parks — add the key) |
| ✋ `ACTION` that is a **prerequisite** for continuing | `prerequisite` | wherever it surfaces | wherever it surfaces | wherever it surfaces |
| A queued **bundled in-📦 prompt** | `input-needed` | Step 6 | Step 5 | Step 6 |
| Hard dependency mid-execution *(pre-existing park)* | `dependency` | Step 5 Phase 2 | Step 3 — park + promote note | Step 5 loop |

**The ✋ split is biased conservative — park on doubt.** An *advisory* ✋ is recorded and the run continues; only a **prerequisite** ✋ parks. "It is probably advisory" is exactly the doubt this bias exists to refuse: an over-park costs one resume, an under-park reaches closure with the prerequisite never performed.

**`drift` vs `dependency`.** The code names what *stopped* the run, not what motivated it. A `Re-scope` verdict parks as `drift` even when a dependency drove the verdict.

**`/ft-micro-task`'s dependency park.** The attended guidance is *"micro-tasks are not designed to park — re-file as `/ft-task`"*, and it stands for the attended path. Under `--unattended` there is no operator to re-file, so park with `park-reason: dependency — <the dependency>; promote to /ft-task on resume` and stop. The promotion is a resume instruction, not an autonomous action.

**`/ft-goal-task`'s loop.** Step 5's destructive-action carve-out already parks without an operator, by construction. Under `--unattended` it gains one obligation: write `park-reason: destructive — …` alongside the `## 🔁 Iterations` entry, so a caller reading the file alone can classify the stop. The `loop-max` **soft stop** is *not* a conversion — it hands back to the operator with the tasknote intact and unparked, exactly as `SPEC/loop.md` specifies.

## Pre-scaffold stops

Step 1.5 and the Step-2 pre-flight checks run before the tasknote exists, so a "park" there may have nothing to park. Split by what the stop is *about*:

- **Concrete-model mismatch — scaffold, then park.** A task-level assignment problem, and the tree is known clean (the foreign-dirt gate already passed). Skip the AskUserQuestion two-path offer; write the tasknote with `status: blocked` and `park-reason: model-mismatch — PLAN.md tags [<tag>], active model is <model>`, then halt. The caller gets the same readable stop surface it gets everywhere else. Do **not** retag the PLAN.md line autonomously.
- **Foreign-dirt gate — terminate, write nothing.** Writing a new untracked file into a tree the paper-complete guard has just refused to touch makes that file its own foreign dirt on the next invocation — a self-blocking loop. Report the dirt and stop:

  ```markdown
  ⏸ --unattended stop — foreign-dirt: <N> uncommitted path(s). No tasknote written; commit, stash, or discard, then re-invoke.
  ```

  List the paths. Never stash, clean, or commit them.
- **`## Completed` status gate and archive collision — terminate, write nothing.** Both mean a tasknote for this ID already exists; there is nothing new to park, and scaffolding one would duplicate it. Same `⏸ --unattended stop — <cause>: …` shape.
- **An existing in-flight tasknote** (`status:` `not-started` / `in-progress` / `completed`) — the runners refuse this by design and recommend continuing conversationally. Unchanged; report it in the same stop shape and write nothing.

## What `--unattended` never relaxes

`SPEC.md` §"Paper-complete guard" holds in full — all three parts, with no unattended variant:

1. **Foreign-dirt gate.** Report the dirt machine-readably; never stash, clean, or commit it.
2. **Atomic single-commit closure.** Deliverables + PLAN flip + archive move land together or not at all.
3. **🏁 only with a deliverable-covering SHA.** Verify with `git show --name-only`; never invent a SHA. No operator watching is a reason to hold this line harder, not to relax it.

Nor does it relax the **downstream-impact reconciliation** user-confirm, which guards plan correctness rather than pacing: with no operator to confirm, a direction-changing decision that reaches beyond the current task is a `Re-scope`, and `Re-scope` parks as `drift`.

`--unattended` removes *pauses*, never *proof*.

## `/ft-close-epic`

The epic-close skill accepts the flag on its own terms (`SPEC/gates.md`
§"`/ft-close-epic` under the posture"). What it shares with the runners:

- **The park recipe** — used once, at its Step 4 Phase 1→2 exit gate. It runs
  the `default-fire-on-clarifications` flavor, so a clarification it cannot
  answer parks as `input-needed`; a `Re-scope` / `De-scope` verdict parks as
  `drift`. The audit tasknote exists by then, so all four writes apply.
- **The pre-scaffold stop shape** — every Step 1-2 bail terminates and writes
  nothing, including the open-siblings ask (whose own default is already
  "bail", so it is taken deterministically rather than asked).
- **The never-relaxed list, in full.** The audit commit is a real commit.

What differs:

- **Not a `--fast` superset.** Nothing to inherit.
- **The parent-flip is deferred, not parked.** The audit closes and commits;
  the parent line stays `- [ ]`, the cohort stays nested, and the run emits
  `⏸ --unattended stop — parent-flip: …`. There is nothing to park by then —
  the audit note is `completed` and archived, and a parked note is *paused,
  not closed*. The deferral is recorded in the archived note's Final Summary,
  and PLAN.md states it structurally: a parent `- [ ]` above a cohort of
  `- [x]` children means the flip is pending.

`/ft-epic-discovery` does not accept the flag at all.
