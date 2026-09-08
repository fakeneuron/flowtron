# Context budget

Per-file byte budgets for the surfaces an agent loads to run one flowtron task,
and the measured ledger of what each surface costs today.

This is a **mechanism** under [SPEC.md](../SPEC.md) Core Principle #3 ("One task
per context window"), not a new principle. [[CORE-382]] deliberately demoted
context economy from flowtron's pitch to a mechanism; this doc keeps it there.
Nothing below is a promise about how any particular agent allocates its window —
it is a promise flowtron makes about the size of the files it ships.

> **This doc is read at release time, not at task time.** It is not part of the
> always-loaded set it measures, and adding it there would defeat its own point —
> [[CORE-194.1]] declined a `CONTEXT.md` mega-doc for exactly that reason
> ("always-loaded competes with SPEC + SPEC modules + currently-loaded SKILL for
> context budget"). Read it when cutting a release, when a budget is questioned,
> or when planning a split.

## Why byte budgets

[[CORE-EPIC-223]] split `SPEC.md` at ~40,000 chars into `SPEC/gates.md` and
`SPEC/tasknote-selection.md`, projecting `SPEC.md` down to ~24,700. Its Phase 3
verified the result with `wc -c` and recorded the margin. Three months later
`SPEC.md` was 77,322 and `gates.md` 51,812 (measured at [[CORE-535.1]]).

Nothing went wrong except that no number was ever written down. The split had no
ratchet, so every task after it added a paragraph and none subtracted one, and
the ~40,000 figure survived only as an oral working number — [[CORE-508]] went
looking for it and found no cap in `SPEC.md`, `SPEC/`, `docs/`, `AGENTS.md`, or
`CONTRIBUTING.md`. The budgets below are that missing ratchet.

**Bytes, not tokens.** `wc -c` is exact, reproducible, and needs no tooling
(Core Principle #2, Zero scripts). Tokens are roughly chars/4 for English
markdown — good enough to reason with, too tokenizer-dependent to gate on.

## Budgets

Checked at every release cut by `/ft-release` §7.1 (see "How this is enforced").

| Surface | Budget (chars) | Why this number |
|---|---|---|
| `SPEC.md` | 50,000 | The always-loaded contract, read in full by every lifecycle skill. Set by [[CORE-535.1]] as the reachable target for the [[CORE-535.3]] lazy split — gentler than the 40,000 the same Discovery considered, trading a smaller cut for lower restructuring risk. |
| `SPEC/gates.md` | 35,000 | Lazy in principle, per-task in practice: the first conditional gate loads it, and almost every task hits one. Set by [[CORE-535.1]]; brought under by [[CORE-535.5]], which split the cue vocabulary and the discipline prose into their own modules. |
| `claude/skills/*/SKILL.md` | 30,000 | One skill body is loaded per task, on top of `SPEC.md`. At 30,000 every shipped skill except `ft-release` below passes today, so the cap bites on regrowth rather than demanding an unscoped rewrite. |
| `claude/skills/ft-release/SKILL.md` | 40,000 | More specific row wins. A release cut is a whole-repo motion whose skill is loaded alone, never alongside a tasknote, and this body is already post-trim ([[CORE-507]] cut it from ~77,000 to 37,274). Budgeted rather than exempted so it still ratchets. |

**Precedence:** the most specific matching row wins. `ft-release`'s own row
governs it; every other `SKILL.md` falls under the glob row.

**Not budgeted, deliberately:** `docs/`, archived tasknotes, `tools/`, `viz/`,
`SPEC/procedures/`, and the lazy `SPEC/` modules other than `gates.md`. None of
them is loaded to run an ordinary task, so capping them would ration bytes that
cost nothing. A lazy module that starts arriving on most tasks earns a row here;
until then it does not.

## Known over budget

Self-liquidating. A surface listed here **with an open owner** is informational
at the release gate; a surface over budget **without** one blocks the cut. Each
owning task deletes its own row at closure, so the exemption expires on its own
and needs no later flip.

*Empty.* [[CORE-535.5]] deleted the last row (`SPEC/gates.md`, 51,809 → 32,299)
at its own closure, as the rule above intends. Every budgeted surface is under
its cap.

## Ledger

Measured 2026-09-07 at v5.24.0, refreshed by [[CORE-535.N]] — the epic audit,
which re-measured every row and corrected the two that had drifted. Refreshed by
`/ft-release` §7.1 in the same cut that reads it — if these numbers are stale,
the cut that made them stale skipped its own standing check.

### Always loaded to run one task

| Surface | Chars |
|---|---|
| `SPEC.md` | 48,771 |
| `claude/skills/ft-task/SKILL.md` | 27,588 |
| `AGENTS.md` (`CLAUDE.md` is a symlink to it) | 6,816 |
| `.flowtron/tasknote/README.md` | 6,559 |
| `templates/tasknote-template.md` | 4,935 |
| `.flowtron/PLAN.md` | 2,253 |

### Lazy `SPEC/` modules

`gates.md` 34,866 · `procedures/ft-task.md` 30,315 ·
`tasknote-selection.md` 24,480 · `model.md` 18,699 ·
`gate-discipline.md` 15,386 · `cue-vocabulary.md` 15,138 ·
`plan-parser.md` 8,310 · `blocked.md` 8,034 · `loop.md` 7,971 ·
`layout.md` 6,567 · `procedures/README.md` 6,128 ·
`epic.md` 6,080 · `scope-boundaries.md` 5,116 ·
`tasknote-inserts.md` 4,626 · `purpose-blurb.md` 4,049 ·
`superseded-claims.md` 2,980 · `starter.md` 2,408 ·
`versioning.md` 1,074.

`gates.md` and `tasknote-selection.md` are lazy by declaration and near-universal
in practice; the rest genuinely load only on their task shape. [[CORE-535.3]]
added six of the modules above by moving narrow-use sections out of `SPEC.md`
— which is why the `SPEC/` total grew while the always-loaded set shrank.
[[CORE-535.5]] added two more the same way, out of `gates.md`: neither
`cue-vocabulary.md` (reference — loaded when composing or interpreting a cue)
nor `gate-discipline.md` (loaded when about to skip a gate) is consulted by an
ordinary run, which is why neither earns a budget row.

### Skill bodies (`SKILL.md` only)

ft-release 37,369 · ft-task 27,588 · ft-close-epic 26,935 · ft-epic-discovery
26,356 · ft-goal-task 26,176 · ft-audit 21,707 · ft-micro-task 18,533 ·
ft-update 16,095 · ft-file-followup 16,031 · ft-refactor 13,673 ·
ft-starter-task 13,253 · ft-worktree-end 12,598 · ft-worktree-start 12,008 ·
ft-new-project 11,425 · ft-audit-context 10,209 · ft-flowtron 9,134 · ft-stats
8,893 · ft-audit-repo 8,166 · ft-spec 7,684.

Lazy fragments are not counted against a skill's row — they arrive later, and
only on the branch that needs them. Whole-directory totals for the two largest:
`ft-release` 83,421, `ft-task` 54,601. Splitting a body into fragments defers
load; it does not remove it ([[CORE-507]] §2.5), so a skill that fragments its
way under the cap without shedding content has gamed the number rather than met
it.

### Adopter-side always-loaded

`claude/AGENTS-snippet.md` 15,884 (pasted into the adopter's `AGENTS.md`) ·
`templates/tasknote-README.md` 4,257 · `templates/PLAN.md` 2,736.

## How this is enforced

One standing check in
[`claude/skills/ft-release/step-7.1-standing-checks.md`](../claude/skills/ft-release/step-7.1-standing-checks.md),
walked at every release cut. It measures with `wc -c` and compares against the
Budgets table above.

**Every number lives here and is restated nowhere.** The check measures; this doc
decides. That is deliberate: [[CORE-465]] retired a §7.1 check whose failure mode
was a hand-maintained roster kept in two places, and its lesson — "stop counting,
start deriving" — applies to a budget as much as to a skill list. A budget
duplicated into the check would drift from the budget written here, and the gate
would be guarding its own stale copy.

No script, hook, or CI job runs this. `docs/CONVENTIONS.md` §"Release automation"
and §"Pre-commit hooks" both decline that shape, and the backing principle is the
same one this doc serves: the assistant is the validator, and the workflow phase
is the gate.

## Not on the doc-drift sweep list

`docs/CONTEXT-BUDGET.md` is deliberately **not** in `.flowtron/tasknote/README.md`
§"AI-referenced docs", and should not be added.

[[CORE-491]] settled that membership means *swept for drift*, which this doc's
numbers plainly do — on nearly every commit. But [[CORE-492]] records the
countervailing rule: every entry on that list is walked at *every* Phase 4
closure, and that per-task cost is why `SPEC/*.md` and the skill bodies are
excluded from it. These numbers already have a better owner than a per-task sweep
— the release check reads and refreshes them in the same motion. Adding the doc
would buy a permanent "no change (numbers owned by `/ft-release`)" line at every
closure and catch nothing the release gate misses.

The prose above still drifts like any doc. It is swept when a budget changes,
which is the only time it can go wrong.
