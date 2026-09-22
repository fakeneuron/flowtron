---
title: gate-discipline-trim
status: blocked
park-reason: dependency — decay window opened by CORE-659 has observed 1 run, and that run is its own control
tags: []
created: 2026-09-22
due:
related-tasks: [CORE-659, CORE-661]
touches:
  - SPEC/gate-discipline.md
  - docs/GATE-DISCIPLINE.md
  - docs/CONTEXT-BUDGET.md
  - docs/AGENT-NEUTRALITY.md
  - README.md
  - SPEC.md
blocked-by:
  - CORE-659
---

# CORE-660 | gate-discipline-trim

[← PLAN.md](../PLAN.md) · ⏸ Blocked · 🔗 [[CORE-659]]

## 🎯 Goal

Trim `SPEC/gate-discipline.md` to the failure modes the CORE-659 decay window
actually observed, moving the rest to a `docs/` reference, without disturbing
the posture semantics `SPEC/gate-postures.md` owns.

## ✅ Acceptance

> Acceptance below describes the trim **when this task resumes**. It is parked
> at the Phase 1→2 boundary; nothing here is claimed as met.

- [ ] Decay window carries enough independent runs to read — `git log --diff-filter=A f8c44275..HEAD -- .flowtron/tasknote/archive/ | grep -c '^A'` returns the operator's agreed N (at park: 1, and that one is the window-opening task itself)
- [ ] `SPEC/gate-discipline.md` materially smaller — `wc -c SPEC/gate-discipline.md` well under the parked 16,077
- [ ] Moved material lands in `docs/GATE-DISCIPLINE.md` — `test -f docs/GATE-DISCIPLINE.md`
- [ ] No dangling inbound reference — every row of the Discovery Notes inbound table re-checked; `grep -rn 'gate-discipline' --include='*.md' .` (excluding `archive/`) resolves to surfaces that still exist
- [ ] `docs/AGENT-NEUTRALITY.md:40`'s 3-site count re-derived if a section heading was dropped — `judgment`: the ledger counts at heading granularity, so only a heading change moves it
- [ ] `SPEC/gate-postures.md` posture semantics untouched — `git diff --stat SPEC/gate-postures.md` shows prose-only changes; the red-full-suite park and `proceed-on-green` clauses caobunga depends on are byte-identical
- [ ] `README.md:293` + `SPEC.md:323` roster entries still accurate — `judgment`: both are prose rosters, no command decides wording

## 🧩 Subtasks

> Deferred with the park — populated so the resume path has concrete steps.

- [ ] Re-measure the decay window (`git log` since `f8c44275`); if still thin, re-gate with the operator before trimming
- [ ] Count the skip-path marker (`✅ Closure complete; committing autonomously`) across tasknotes archived in the window — CORE-659's stated measurement
- [ ] Classify the 22 §"Rationalizations" rows and 24 §"Red Flags" bullets: incident-backed (keep) vs. contract-restating (move)
- [ ] Create `docs/GATE-DISCIPLINE.md` with the moved material; add it to `README.md`'s `docs/` layout list
- [ ] Trim `SPEC/gate-discipline.md` to the retained material plus a pointer to the new reference
- [ ] Repair the inbound references in the Discovery Notes table; re-measure `docs/CONTEXT-BUDGET.md:161`
- [ ] Verify `SPEC/gate-postures.md:206`'s deep link into §"Refused carve-outs" still resolves

## 🔗 Related

- [[CORE-659]] — `blocked-by:` predecessor; opened the decay window (start SHA `f8c44275`) this task reads
- [[CORE-661]] — follow-up; adds a standing decay pass to `/ft-audit`'s `passes/context.md`
- [[CORE-665]] — filed by this task's 🛠️ gate; `SPEC/blocked.md` has no attended Phase-1 park, which is the state this note now sits in

---

## 📝 Phase 1: Discovery

- [x] Reviewed the task entry in PLAN.md

- [x] **Relevance Assessment**

  **Verdict:** Re-scope
  **Rationale:** PLAN.md line 17 is current, unchecked, under `## Medium`;
  `git status --porcelain` clean at start; no tasknote or archive file existed
  — fresh scaffold. But the task's stated evidence base does not exist: the
  decay window CORE-659 opened has observed **one** task run, CORE-659's own.
  "Trim to the failure modes the decay window actually observed" is not
  executable against n=1. Operator selected a park over a provenance-based
  re-scope, a literal zero-observation trim, or a De-scope (AskUserQuestion,
  2026-09-22), and pre-decided `docs/GATE-DISCIPLINE.md` as the destination for
  the moved material when the task does resume.

- [x] Read relevant source files — when the read set is broad or its shape is unknown, consider isolating the search in a **probe** (`templates/subagent-probe-template.md`) and recording only its distilled return in Discovery Notes

- [x] **Best Practices Review** — `N/A`: no execution reached. The intended
  edit is a prose split of one SPEC module into a `docs/` reference; the
  module-boundary question (what stays a loaded contract vs. what becomes a
  reference) is the task's substance, not a side concern, and is deferred with
  the task.

- [x] **Archive skim** — skim `.flowtron/tasknote/archive/<area>/` for prior tasknotes that touched the source paths in scope (prefer YAML `touches:` when set); also follow Related / `supersedes` / ⚠️ pointers; when the grep returns more than a handful of notes (~3 is a fair line), prefer handing the reading to a **probe**; log relevant findings in Discovery Notes before re-interpreting the task; an absent or empty `archive/<area>/` is a prompt to re-check `<area>` against the README table before logging "no prior tasknotes" — a derived-and-wrong folder is indistinguishable from a genuinely empty one
  — `archive/core/` confirmed against the README table (12 notes cite
  `gate-discipline`); read CORE-659 in full, logged below.

- [x] **Drift check** — see Discovery Notes. The task description's own premise
  drifted: the decay window it reads is one run long. Two smaller drifts also
  logged (`docs/CONTEXT-BUDGET.md:183`, `docs/AGENT-NEUTRALITY.md:40`).

- [x] Asked clarifying questions OR logged "No clarifications needed" with explicit assumptions — asked via AskUserQuestion; answers recorded in the Relevance Assessment and Discovery Notes.

- [x] Subtasks above populated with concrete, ordered steps, and YAML `touches:` declared with the paths this task expects to edit (omit only on a task with no file deliverable)

**Discovery Notes:**

**The decay window is one run long.** CORE-659 recorded window-start SHA
`f8c44275` (`docs: CORE-664 — spec-section-extract`). Measured at this task's
start:

- `git log --oneline f8c44275..HEAD` → a single commit, `9d502321`
  (`docs: CORE-659 — gate-discipline-decay-window`).
- `git log --diff-filter=A f8c44275..HEAD -- .flowtron/tasknote/archive/` → one
  tasknote archived, `archive/core/CORE-659.md` — the window-opening task
  itself, which ran `[unattended]` (fast-mode, skip branch).

So the window has observed zero *independent* runs under the removed triggers.
CORE-659's Final Summary asks CORE-660 to "count the shared skip-path inline
marker (`✅ Closure complete; committing autonomously`) across tasknotes
archived after this SHA" — that count is 1, and its one sample is the
experiment's own control. The window was opened and read on the same day.

**What the trim would target, when it resumes.** `SPEC/gate-discipline.md` is
16,077 bytes in three sections: §"Rationalizations" (22-row excuse/refutation
table), §"Red Flags" (24 observer-symptom bullets), §"Refused carve-outs" (the
CORE-495 Q1 / CORE-503 visual-baseline argument, recorded in full). Only a
minority of rows cite a concrete motivating incident (InvisiPaw FE-64 on
paper-complete; CORE-432.2 on next-move-before-SHA; CORE-495/503 on the
carve-out; CORE-386/388 on the standing rule); the rest restate
`gates.md` / `gate-postures.md` clauses in excuse form. That provenance split
is the natural trim axis and needs no window — it was offered and not chosen.

**Destination pre-decided:** `docs/GATE-DISCIPLINE.md`, a new dedicated `docs/`
reference (operator answer, 2026-09-22), rather than folding into
`docs/PHILOSOPHY.md` or `docs/HARNESS-SURVEY.md`.

**Inbound references a trim must repair** (all outside `archive/`):

| File | Line | What it asserts |
|---|---|---|
| `SPEC.md` | 323 | Roster entry — "the discipline" |
| `README.md` | 293 | `SPEC/` module list |
| `SPEC/gate-postures.md` | 206 | Deep link into §"Refused carve-outs" |
| `docs/AGENT-NEUTRALITY.md` | 40 | Counts **3 sites** = the three section headings; a trim that drops a section changes this count |
| `docs/CONTEXT-BUDGET.md` | 161 | Measured size `16,077` (unbudgeted — no cap row) |
| `docs/CONTEXT-BUDGET.md` | 183 | "loaded when about to skip a gate" |
| `docs/HARNESS-SURVEY.md` | 61 | Overkill finding #1 — the trim's motivation |

**Pre-existing drift found, not fixed here** (no deliverable in this task, and
neither is CORE-660's to own):

1. `docs/CONTEXT-BUDGET.md:183` calls `gate-discipline.md` "loaded when about
   to skip a gate" as the reason it earns no budget row. CORE-659 removed both
   live skip-path triggers, so nothing loads it at that moment any more. The
   conclusion (no budget row) still holds — more strongly than before — but the
   stated reason is stale.
2. `docs/AGENT-NEUTRALITY.md:40` contains a duplicated clause: "the whole of
   `SPEC/post-closure.md` (1 site — …)" appears twice verbatim in the same row.

**Contract conflict surfaced at the Phase 1→2 boundary.**
[`SPEC/blocked.md`](../core/SPEC/blocked.md) §"Phase 1 entry (Re-scope path)"
reserves `status: blocked` for mid-Phase-2 parking and prescribes, for a
Phase-1 blocker: add `Blocked by [[ID]]` to the PLAN.md line, **delete the
just-scaffolded tasknote**, halt — on the rationale that "a Phase 1 blocker has
no Phase 2 work to preserve." The operator's selected disposition is a park
(`status: blocked` + `park-reason: dependency`), which the attended Phase-1
path does not admit.

That rationale does not hold on this task. There is no Phase 2 work, but
Discovery produced the window measurement, the inbound-reference table above,
the provenance axis the eventual trim will use, and two pre-existing drift
findings — all of which the prescribed delete-and-halt would discard.
`blocked.md`'s own `--unattended` Phase 1→2 boundary carve-out already makes
exactly this argument ("Phase 1 *is* complete at that boundary and its
Discovery is exactly the work worth preserving") and then scopes it to
operator-less runs; this run is the attended instance of the same case.

**Resolution (🛠️ gate, operator, 2026-09-22):** park as chosen, and file the
spec gap as [[CORE-665]] rather than leave the deviation silent. This note
therefore sits at `status: blocked` from a Phase-1 verdict — a state
`SPEC/blocked.md` does not currently describe. CORE-665 decides whether the
reservation widens or whether attended runs are meant to differ.

## 🛠️ Phase 2: Execution

- [ ] **Pattern survey** — extended an established pattern or justified a new shape; checked DRY and single-responsibility (SRP) boundaries; preferred composition when it reduced coupling

- [ ] **Minimal refactor gate** — refactored only for Acceptance or to prevent duplication, obscured responsibility, or a dependency-boundary violation in the touched path; recorded the reason and deferred unrelated cleanup

- [ ] Implemented the minimal solution

- [ ] Updated/added tests for non-trivial behavior

**Implementation Notes:**

## 🧪 Phase 3: Testing & Linting

- [ ] Ran targeted test suite for changed code

- [ ] Ran lint/type-check on changed code

- [ ] **Verification receipt** — recorded each Acceptance verify command in Testing Notes as `command → exit code`, with the first failure line when non-zero; and, for changed code, confirmed no avoidable duplication, dead code, unexplained complexity, unnecessary public-surface growth, or stale code-facing documentation (otherwise `N/A` with reason)

- [ ] **External review** — a context that did not write the diff graded it against `## ✅ Acceptance`, and every finding is recorded below with its disposition (**blocker** → back to Phase 2; **note** → fixed or filed). `N/A` with a one-line reason when the diff is too small to grade

- [ ] (frontend) Asked the user for visual confirmation (emphasized `👁️ **CONFIRM**` ask on its own line)

**Choosing a test strategy:** see SPEC.md §"🧪 Phase 3: Testing & Linting".

**Testing Notes:**

## 🚀 Phase 4: Closure

- [ ] **Doc-drift sweep** — for each entry in `.flowtron/tasknote/README.md` §"AI-referenced docs", state "no change" or the update

- [ ] Closed — every `## ✅ Acceptance` criterion ticked or explicitly annotated (`N/A` / not-met with a one-line reason), YAML `status:` flipped to `completed`, PLAN.md line flipped to stub form `Completed YYYY-MM-DD.` and placed (standalone → top of `## Completed`; epic child → kept nested beneath its active parent — see SPEC/plan-filing.md §"`## Completed` archive convention" if unclear), then tasknote moved to `.flowtron/tasknote/archive/<area>/`

- [ ] **Evidence-based recap** drafted — changed files/LOC where meaningful, verification commands/results, refactors made or deferred with rationale, documentation verdict, the `touches:` scope reconciliation (`git diff --name-only` vs declared; name undeclared paths), and concrete maintainability effect (surfaces at the 📦 ready-to-commit gate, or inline on conditional skip)

- [ ] **Learnings** — did this task teach something the always-loaded layer (AGENTS.md / README §AI-referenced docs) should carry? `N/A` or the line

**Final Summary:**

**Archived:** YYYY-MM-DD
