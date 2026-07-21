---
name: ft-goal-task
description: Start a goal-loop tasknote for the given task ID and drive it through the SPEC's 4-phase workflow with the Phase 2↔3 execute→verify cycle run as an inline loop. Phase 1 additionally requires every Acceptance criterion to carry a machine-checkable verify command (taste criteria split to a one-time 👁️ ask); the loop iterates under the SPEC/loop.md budget + per-cycle relevance gate, commits per verified iteration, and logs to a 🔁 Iterations section. Sibling of /ft-debug; uses `templates/tasknote-template.md`. Invoke with the task ID as args (e.g., args="CORE-042", "CORE-195.2 --fast", or "CORE-042 --worktree").
---

# goal-task — goal-loop tasknote runner

You are starting a **goal-loop tasknote** for the task ID provided in `args`. The full workflow contract lives in flowtron's `SPEC.md`; the loop-specific contract lives in `SPEC/loop.md`. This skill is the executable interpretation — the standard 4-phase flow with the **Phase 2↔3 execute→verify cycle driven as an inline loop** against a verifiable Acceptance target. Treat `SPEC.md` + `SPEC/loop.md` as authoritative when this file is silent or in tension.

The value prop: some work is *converge-until-a-check-passes* rather than *do-it-once*. A goal loop repeats execute→verify against a fixed, **machine-checkable** Acceptance target until every check passes, a budget (`loop-max`) is exhausted, or a per-cycle relevance check says stop. All of it lives in a normal tasknote using `templates/tasknote-template.md` — plus three additive loop frontmatter keys and a `## 🔁 Iterations` log. No custom template, no replacement phases, no new gate banners (the loop *collapses* gates rather than adding them — see Step 5).

This skill is a **specialized driver, not a fork** — the same relationship `/ft-debug` has to `/ft-task`. ~90% of the flow (path resolution, locate, model gate, pre-flight, scaffold/promote/resume, Phase 4 closure, post-closure protocol) is byte-identical to `/ft-task`; the goal-loop additions are localized to Phase 1 (the verify-command rule) and Phase 2↔3 (the loop body).

Supported invocations:
- `/ft-goal-task <TASK-ID>`
- `/ft-goal-task <TASK-ID> --fast` (or `-f`)
- `/ft-goal-task <TASK-ID> --worktree`

`--fast` / `-f` and `--worktree` are the only accepted trailing tokens (either, both, or neither).

## Step 0 — Resolve paths + flag parse

Two layouts. Pick by which file exists:

- **Adopter project:** `.flowtron/core/SPEC.md` exists → `<root>` = `.flowtron/core/`.
- **Flowtron self-host:** repo-root `SPEC.md` with heading `# Flowtron — Workflow Specification` → `<root>` = repo-root.

If neither matches, bail.

Paths this skill uses:
- SPEC: `<root>SPEC.md` (always loaded core)
- SPEC_DIR (lazy modules `loop.md` · `epic.md` · `starter.md` · `blocked.md` · `model.md` · `versioning.md`): `<root>SPEC/`
- SKILL_DIR: `<root>claude/skills/ft-goal-task/` (no private fragments in v1; falls back to the same mental model as ft-task)
- Template: `<root>templates/tasknote-template.md`
- PLAN: `.flowtron/PLAN.md`, tasknote dir: `.flowtron/tasknote/` (always)

**Read `SPEC/loop.md` now** — it is the contract this skill drives (gate collapse, per-cycle relevance gate, `loop-max` budget, `## 🔁 Iterations` log, the three additive frontmatter keys). Steps 3b/4/5 below reference it constantly.

**Parse `args`.** Split on whitespace into `(TASK-ID, rest...)`. Branch on the flag set in `rest`:

- **No flags** → `fast-mode = false`, `worktree-mode = false`. Continue to Step 1.
- **`--fast` or `-f`** → `fast-mode = true`. Emit exactly one inline marker after path resolution: `⚡ --fast active — 👁️ frontend ask and 📦 signal trips suppressed; Re-scope/De-scope still fires 🛠️.` Continue to Step 1. (Note: a goal loop already runs with `--fast` semantics once the loop starts — see Step 5 gate collapse — so `--fast` is largely redundant here; accepted for parity and for the one-time pre-loop Phase 1 surface.)
- **`--worktree`** → `worktree-mode = true`. Emit: `🌳 --worktree active — Phase 1 Discovery runs here, then I hand off to /ft-worktree-start; the loop runs in the isolated worktree.` Continue to Step 1.
- **Both `--worktree` and `--fast`/`-f`** → set both flags; the worktree handoff (Step 4) takes precedence — the operator carries `--fast` onto the in-worktree re-run if desired.
- **Any other trailing arg** → surface a one-line usage notice (``Unknown arg `<arg>`. Usage: `/ft-goal-task <TASK-ID> [--fast|-f] [--worktree]`.``) and ask via AskUserQuestion whether they meant `--fast`, `--worktree`, the default flow, or to abort. Do not proceed silently.

`fast-mode` semantics are identical to `/ft-task`. See `claude/skills/ft-task/SKILL.md` Step 0 for the full contract and operator-gate cue details.

## Step 1 — Locate the task in PLAN.md (identical to /ft-task)

Read PLAN.md. Find the line containing `**<TASK-ID>**`. Status gate (already-closed → stop and ask), model capture, `| shortname`, priority, `[!critical]`, filing-discipline word-count warning — all exactly as `/ft-task` Step 1.

## Step 1.5 — Model gate (identical to /ft-task)

Gate on the `[model]` segment before scaffolding. Satisfied → proceed. Category under-tier / concrete mismatch / legacy-absent → read `SPEC/model.md` + `claude/skills/ft-task/step-1.5-model-edge.md` and follow the matching branch. Same two-path AskUserQuestion; no silent overrides.

## Step 2 — Pre-flight checks & file-state branch (identical to /ft-task)

Resolve Area, epic-ID dispatch (read `SPEC/epic.md` for `<AREA>-EPIC-<N>` / `<AREA>-<N>.<sub>`), **foreign-dirt gate** (`git status --porcelain` hard stop per SPEC §"Paper-complete guard"), archive vs active tasknote checks, four-way status branch (starter / blocked / in-flight / fresh). Same routing to 3a / 3b / 3c. The goal-loop flavor changes *scaffold content* (Step 3b addendum below) and the Phase 2↔3 *drive* (Step 5), not the routing.

## Step 3a / 3b / 3c — Promote, Scaffold, Resume

Base mechanics identical to `/ft-task`:

- **3a Starter promotion** — read `SPEC/starter.md` + the promote fragment if present.
- **3b Fresh scaffold** — copy `templates/tasknote-template.md` to `.flowtron/tasknote/<TASK-ID>.md`, fill title from shortname or description, `status: in-progress`, created date, related-tasks from context.
- **3c Blocked resume** — read `SPEC/blocked.md` + resume fragment. A goal loop that parked mid-cycle (destructive step, or a surfaced hard dependency) resumes here; the `## 🔁 Iterations` log carries the loop's memory across the park.

**Goal-loop scaffold addendum (3b — fresh scaffold only).** After copying the template, apply the loop shape per `SPEC/loop.md`:

1. **Add the three additive frontmatter keys** to the YAML block:
   ```yaml
   loop: true
   loop-max: <N>          # hard iteration ceiling; ask the operator, default 10
   loop-last-run:         # set to the date of the last cycle once the loop runs
   ```
   These are additive per the write-once policy — legacy/non-loop tools ignore them.
2. **Inject a `## 🔁 Iterations` section** between `## 🧪 Phase 3` and `## 🚀 Phase 4`, per `SPEC/loop.md` §"`## 🔁 Iterations` log":
   ```markdown
   ## 🔁 Iterations

   <!-- one append-only line per cycle:
   - **1** · relevance: proceed · verify: ✅ pass · committed `<sha>`
   - **2** · relevance: proceed · verify: ❌ fail (<what>) · no commit → retry
   - **N** · relevance: stop (<reason>) · loop terminated -->
   ```
3. `loop-max` is asked at scaffold or during Phase 1 (default 10) — it is the runaway backstop, independent of the relevance gate.

(On the 3c resume path the keys + section already exist; do not re-add them.)

## Step 4 — Phase 1: Discovery (standard checklist + the verify-command rule)

Work through the Phase 1 checklist in the scaffolded tasknote **exactly as `/ft-task` does** (tick boxes, archive skim via `ls` + `grep -l`, drift check, AskUserQuestion for genuine ambiguity, populate 🧩 Subtasks, Relevance Assessment). The 🛠️ Phase 1→2 exit gate uses the `default-skip` flavor (same as `/ft-task`/`/ft-debug`): skip on routine clarifications, fire only on significant scope deviation (Re-scope/De-scope always fire). This gate is a **one-time pre-loop event** — it is not re-run each cycle.

**Goal-loop-specific Phase 1 obligation — the verify-command rule (do this while populating `## ✅ Acceptance`):**

Every `## ✅ Acceptance` criterion must be *loop-verifiable* — it carries a **verify command**: a concrete shell / test invocation whose exit status (or a grep on its output) is the pass/fail signal for that criterion. This is what makes the loop terminable — the union of all verify commands passing **is** the termination condition. Record each criterion with its command inline, e.g.:

```markdown
## ✅ Acceptance

- [ ] All unit tests pass — `npm --prefix viz test`
- [ ] No type errors — `npm --prefix viz run typecheck`
- [ ] Endpoint returns 200 for the happy path — `curl -sf localhost:8000/health`
```

**Taste criteria → one-time 👁️ ask (split out of the loop).** A criterion that can only be judged by eye — visual polish, "reads naturally", subjective UX — is **not loop-verifiable**. Do not fake a command for it. Instead:

- Move it to a clearly marked **`### 👁️ One-time visual checks (outside the loop)`** subsection under Acceptance.
- These are checked **once, after the loop converges** (Step 6), via a single `👁️` prose ask — never inside the cycle (the loop runs with `--fast` semantics, which suppresses the per-cycle 👁️ ask; see Step 5).

**Edge case — no machine-verifiable criteria.** If *every* criterion is taste-only, this is not a goal loop — there is nothing for the loop to converge on. Stop and tell the operator to use `/ft-task` (with a Phase 3 👁️ confirmation) instead. Do not enter the loop.

**Set `loop-max`** here if not already set at scaffold (default 10). Populate `## 🧩 Subtasks` with the ordered per-cycle work.

**When `fast-mode = true`:** write the verify commands + the taste-split directly, skipping extra AskUserQuestion pauses (the operator asserts the Acceptance shape).

**`--worktree` handoff (if `worktree-mode = true`).** Once Phase 1 is complete and the exit gate has cleared, **do NOT enter the loop.** `/ft-worktree-start` requires a pre-existing, Phase-1-scoped tasknote and hands off to a *fresh session* — exactly the state you now have. Hand off:

```markdown
🌳 Phase 1 Discovery complete + tasknote scoped. To run the goal loop in isolation:

  /ft-worktree-start <TASK-ID>

Then, in the fresh worktree session:

  /ft-goal-task <TASK-ID>          (add --fast if you want it; drop --worktree)
```

Stop here on the worktree path — the loop runs in the worktree, driven by the re-invocation there (which sees an ordinary Phase-1-complete goal-loop tasknote and enters Step 5 directly).

## Step 5 — Phase 2↔3: the loop body (inline, self-paced)

This is the heart of the skill. Instead of running Phase 2 then Phase 3 once, **iterate the execute→verify cycle inline** until convergence, budget exhaustion, or a relevance stop, per `SPEC/loop.md`. The loop is **autonomous by construction**, so it runs with **`--fast` semantics** (`SPEC/loop.md` §"Gate collapse") regardless of whether `--fast` was passed:

- **📦 ready-to-commit gate → commit-per-verified-iteration.** Each cycle whose verify commands all pass commits autonomously behind an `✅` marker; a cycle that fails verification does **not** commit.
- **👁️ visual-confirmation ask → suppressed inside the loop.** Taste criteria were split to the one-time post-loop 👁️ ask in Step 4.
- **🛠️ Phase 1→2 gate** was the one-time pre-loop event in Step 4 — not re-run per cycle.

**Per-cycle procedure** (repeat until a termination condition below):

1. **Per-cycle relevance gate** (`SPEC/loop.md` §"Per-cycle relevance gate"). Before doing work, ask: *is another iteration still the right work?* Terminate cleanly (not a failure) if: all Acceptance verify commands already pass (goal met — the normal clean exit); the intended change is empty / a no-op; or Discovery-level assumptions no longer hold (the target moved → hand back to the operator).
2. **Execute (Phase 2).** On the **first** cycle, do the pattern survey (neighboring code / existing shape) before the first edit; check DRY and single-responsibility boundaries, and prefer composition when it reduces coupling. Each cycle makes the **minimal** change targeting the currently-failing verify command(s). Refactor only when Acceptance requires it or the touched path would otherwise introduce duplication, obscure responsibility, or violate a dependency boundary; record the reason and defer unrelated cleanup.
3. **Verify (Phase 3).** Run the Acceptance verify commands (targeted — only what the change could affect, or the full set near convergence). Also run lint/type-check and the canonical structural quality assertions on changed code.
4. **Commit-or-retry.**
   - **All pass** → commit autonomously (`feat: <TASK-ID> — <cycle summary>` or `fix:`/`chore:`), append a `## 🔁 Iterations` line with the sha, update `loop-last-run:` to today. If this cycle's pass means *every* Acceptance criterion is now green → the loop is converged; break to Step 6.
   - **Any fail** → append a `## 🔁 Iterations` line noting the failure, **no commit**, and loop back to step 1 with the failure as new evidence (adjust the next change).
5. **Budget check.** If the cycle count reaches `loop-max` without convergence → **soft stop** (`SPEC/loop.md` §"max-iterations budget"): halt, record budget-exhaustion in `## 🔁 Iterations`, and **hand the tasknote back to the operator** (not auto-parked, not auto-closed — the operator decides to raise the budget, re-scope, or park). Do not silently keep going past `loop-max`.

**Destructive-action carve-out (does NOT collapse).** If a cycle needs a destructive or irreversible command — a migration, `git push`, `rm`, a release step — the `--fast` collapse does **not** cover it (`SPEC/loop.md` §"Gate collapse" → destructive carve-out). An autonomous loop cannot fire a blocking banner into an unattended session, so **park the tasknote via `status: blocked`** (read `SPEC/blocked.md`, flip status, update the nav header to `⏸ Blocked`, log the reason in `## 🔁 Iterations`) and stop. The operator resumes with the destructive step under a real gate (Step 3c).

**Hard dependency surfaces mid-loop.** Same as `/ft-task` — read `SPEC/blocked.md` and park. The `## 🔁 Iterations` log preserves the loop's memory across the park so resume is cheap.

## Step 6 — Phase 4: Closure + Post-closure (identical to /ft-task)

Once the loop converges (all Acceptance verify commands green):

1. **One-time taste checks.** If Phase 1 split any criteria into `### 👁️ One-time visual checks`, surface them now as a single `👁️` prose ask (suppressed only when `fast-mode = true`, where the operator owns visual confirmation). This is the *only* 👁️ ask in the whole run.
2. **Phase 4 closure — identical to `/ft-task`.** Doc-drift sweep across the AI-referenced docs in `.flowtron/tasknote/README.md`; flip **only this task's** PLAN.md line to the stub `Completed YYYY-MM-DD.` form and move the tasknote to `archive/<area>/` only when ready for the atomic closure commit (SPEC §"Paper-complete guard"); draft the evidence-based recap: 1-2 sentence plain-English summary first — mention the loop converged in N iterations against which verify target — then paths/LOC where meaningful, verification results, refactors made or deferred with rationale, documentation verdict, and maintainability effect.
3. **Post-closure protocol — identical to `/ft-task`.** Because the loop ran under `--fast` semantics, the closure's own commit (PLAN flip + archive move + any remaining deliverables) routes to the **Skip branch** behind an `✅ Closure complete; committing autonomously (…)` marker. Then verify deliverable-covering SHA and emit 🏁 (never invent a SHA), suggest-next-move (re-read PLAN.md fresh), and the copy-paste line — all exactly as `/ft-task` Step 6. Per-cycle commits during the loop are intermediate; the final closure commit still must land PLAN/archive under the paper-complete guard.

The recap should state the convergence: how many iterations ran, which verify target closed the loop, and (if applicable) that `loop-max` was hit or a taste check remains for the operator.

## Notes

- **Relationship to /ft-task and /ft-debug.** All three share the same skeleton (scaffolding, model gate, gates, fast-mode, epic children, blocked handling, closure, post-closure). `/ft-debug` adds hypothesis-first Phase 1 scaffolding + a Phase 3 re-verify obligation; `/ft-goal-task` adds the verify-command-per-criterion Phase 1 rule + the inline Phase 2↔3 loop body. Operators who know `/ft-task` will feel at home; the only genuinely new surface is the loop drive in Step 5.

- **When to reach for /ft-goal-task vs /ft-task vs /ft-debug:**
  - Use **/ft-goal-task** when the work is *converge-until-a-check-passes* and the "done" signal is one or more **machine-checkable** commands: drive a flaky suite to green, iterate a perf number under a threshold, satisfy a linter/type-checker across many sites, make a fuzzer/property test stop finding cases.
  - Use **/ft-task** (or micro) for straightforward one-pass feature work / refactors with a clear diff, or when there is no repeatable verify command to loop on.
  - Use **/ft-debug** for investigating *unexpected* behavior where the root cause is unknown (hypothesis-first). A goal loop assumes the target is known and verifiable; debug assumes it must be discovered first.

- **Gate collapse recap (no new banners).** A goal loop *removes* operator pauses rather than adding them: 📦 → commit-per-verified-iteration, 👁️ → one-time post-loop ask, 🛠️ → one-time pre-loop event. The only thing that stops an autonomous loop for the operator is a destructive/irreversible step, which **parks via `status: blocked`** — never a banner fired into an unattended session. See `SPEC/loop.md` §"Gate collapse".

- **`--worktree` pairing.** `--worktree` runs Phase 1 here, then hands off to `/ft-worktree-start <ID>` (fresh-session isolation per `docs/WORKTREES.md`); the operator re-runs `/ft-goal-task <ID>` inside the worktree to drive the loop with blast-radius control. Reach for it when a loop will churn many files and you want it quarantined on a `wt-<ID>` branch. Never use it for a small, low-blast-radius loop — the isolation overhead isn't worth it.

- **`loop-max` is a backstop, not a target.** It stops a loop that *won't* converge (diminishing returns), independent of the relevance gate that stops one that *has* converged. Reaching it is a soft stop that hands back to the operator — a signal to re-scope, not a failure to hide.

- **Epic children.** Fully supported. A goal-loop epic child (e.g. `CORE-330.4`) works like any other ID; the parent epic flips to complete only when all children are.

- **Future evolution.** If the goal-loop flow accumulates reusable fragments (a standard verify-command table, a convergence-summary helper), later children can add `step-*.md` files under this directory and load them from SKILL_DIR. v1 keeps the surface minimal — all guidance lives inline here.

- **Cross-references (after sibling child `.5` wires the bundle):** `SPEC/tasknote-selection.md` §"When to use a tasknote (and when not to)" for the positioning bullet, `claude/skills/ft-flowtron/SKILL.md` for the roster entry, `docs/MIGRATION.md` §1.2 for the per-project symlink count, and `claude/AGENTS-snippet.md` for the adopter Workflow-block listing.

- **Standalone safety.** This SKILL is designed to be invoked directly. It requires only the shared SPEC + `SPEC/loop.md` + template surface; it does not depend on any other ft- skill being present, except that `--worktree` hands off to `/ft-worktree-start` (which must be wired for that flag to be useful).
