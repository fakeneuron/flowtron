---
paths: ['*-EPIC-*.md', '*.[0-9]*.md']
---

# Epic lifecycle

> Lazy-loaded SPEC module. Loaded by `/ft-task` when the task ID matches `<AREA>-EPIC-<N>` or `<AREA>-<N>.<sub>`. See `SPEC.md` for the always-loaded core spec.

Some epics — particularly **code sweeps** and **major multi-child features** —
benefit from bracketing their implementation children with two coordination
tasks: an **opening Discovery** subtask that surveys the codebase and files
the children, and a **closing Audit** subtask that verifies the completed
work sits well in the codebase as a whole. The Discovery + Audit shape
catches scoping misses up front and integration misses at the end. Simpler
implementations don't need it — apply judgment.

This is *epic-level* Discovery, distinct from the per-tasknote Phase 1
Discovery (§"The 4-phase workflow"). Phase 1 Discovery scopes one task; an
epic Discovery subtask scopes the whole epic and produces the child task
list filed in PLAN.md.

**Numbering convention.** Discovery is the first child (`<AREA>-<N>.1`);
audit is the highest-numbered child at filing time. Both are normal
subtasks — same grammar, same 4-phase tasknote, same model rules.

**Lifecycle:**

1. **File the epic** with a Discovery subtask (`.1`) and a placeholder Audit
   subtask at the end. Implementation children may be empty at filing — the
   Discovery subtask populates them.
2. **Run Discovery** via `/ft-epic-discovery` (which also files the epic in
   step 1) or `/ft-task <ID>.1` if filed manually. Deliverable: filed child
   entries in PLAN.md, not code.
3. **Run children** in order, normal flow.
4. **Run Audit** via `/ft-close-epic <ID>.<final>` (or `/ft-task <ID>.<final>`)
   once all implementation children are closed. Final summary records
   findings even when nothing is wrong.
5. **Audit follow-ups.** Misses surfaced by the audit get filed as `.<N+1>`
   children. For a few small follow-ups, close the audit and execute them
   as normal children. For many, also file a fresh Audit subtask at the new
   highest number to cover the second wave.

**Audit acceptance — fixed doc-drift line.** Every audit subtask's
`## ✅ Acceptance` includes a doc-drift sweep across
`_project/tasknote/README.md` §"AI-referenced docs": for each entry,
"no change" or the update. Always present — ticks fast when nothing
drifted, surfaces the cumulative slice-local staleness that per-task
Phase 4 closures can miss.

**Forward-looking.** Applies to new epics; existing in-flight epics need no
migration. Apply judgment — simple multi-subtask implementations don't need
the bracket.

**Skills.** The filing-and-Discovery side of the lifecycle (steps 1-2
above) is codified in `claude/skills/ft-epic-discovery/`; the audit-and-close
side (steps 4-5) is codified in `claude/skills/ft-close-epic/`. Both are
auto-wired into adopter projects via `claude/skills/ft-new-project/SKILL.md`
Step 3 + `docs/MIGRATION.md` §1.2.
