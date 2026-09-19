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

Checked on every push by the CI `drift` job and at every release cut by
`/ft-release` §7.1 (see "How this is enforced").

| Surface | Budget (chars) | Why this number |
|---|---|---|
| `SPEC.md` | 57,000 | The always-loaded contract, read in full by every lifecycle skill. Raised from 50,000 to 55,000 by [[CORE-555]]. The 50,000 figure was [[CORE-535.1]]'s *split target* — a destination for [[CORE-535.3]], which landed 49,005 and so left under 1,000 chars of working margin from the day it was set. A target and an operating ceiling are different instruments; this is the latter, sized to hold roughly two substantial contract tasks (see the `gates.md` row for the measured unit). Raised again to 57,000 by [[CORE-558.5]]: [[CORE-558.2]]'s fidelity restore added 2,281 chars, leaving 3,434 of the 5,715 CORE-555 sized in — about 1.3 units, below the two-unit standard. Re-measured across 45 touching commits, a substantial edit here runs +1,127 to +2,957, so the unit itself is unchanged; only the headroom had eroded. |
| `SPEC/gates.md` | 25,000 | Lazy in principle, per-task in practice: the first conditional gate loads it, and almost every task hits one. Set by [[CORE-535.1]]; brought under by [[CORE-535.5]], which split the cue vocabulary and the discipline prose into their own modules. Raised from 35,000 by [[CORE-555]]. That split deliberately overshot, landing 32,299 with ~2,700 chars of headroom — and a *single* substantial task, [[CORE-536]]'s gate-relaxation pass, consumed 2,567 of it. The old cap was not missing a margin so much as carrying one sized below a single working unit of contract change; 40,000 holds about two. Lowered to 25,000 by [[CORE-604.2]], which moved the 17,352-byte flag-posture run into `SPEC/gate-postures.md` and left `gates.md` at 20,804: keeping a 40,000 cap over a 21k file would have let the moved material escape the ratchet — the fragment-gaming case §Ledger names — and 25,000 keeps the same ~2 working units the CORE-555 sizing gave it. |
| `SPEC/gate-postures.md` | 23,000 | The `--fast` / `--unattended` postures and the flag×surface matrix, split out of `gates.md` by [[CORE-604.2]] at 19,029. Budgeted although lazy — it arrives only when a flag or the `[unattended]` row marker is set — because it sat under `gates.md`'s cap before the move, and a split that un-budgets what it moves has gamed the number rather than met it (§Ledger, lazy fragments). Sized like its parent: the file plus ~1.5 working units. |
| `claude/skills/*/SKILL.md` | 33,000 | One skill body is loaded per task, on top of `SPEC.md`. Set at 30,000 by [[CORE-535.2]], where every shipped skill except `ft-release` passed, so the cap bit on regrowth rather than demanding an unscoped rewrite. Raised to 33,000 by [[CORE-558.5]]: after [[CORE-558.4]]'s restore, `ft-task` measured 29,355 — **645 chars of headroom**, a quarter of one working unit on that body (its own substantial edits run +1,187 to +3,390). That is the same defect [[CORE-555]] corrected on `gates.md`, a margin sized below one edit. 33,000 gives `ft-task` ~1.5 units while `ft-goal-task` (27,140), `ft-epic-discovery` (26,986) and `ft-close-epic` (26,935) stay meaningfully capped. Not the only remedy: [[CORE-556.2]] met the same 685-char squeeze on `ft-release` by extracting a lazy fragment, which is the better move when a body is genuinely overgrown rather than merely near its line. |
| `claude/skills/ft-release/SKILL.md` | 40,000 | More specific row wins. A release cut is a whole-repo motion whose skill is loaded alone, never alongside a tasknote, and this body is already post-trim ([[CORE-507]] cut it from ~77,000 to 37,274). Budgeted rather than exempted so it still ratchets. |

**Precedence:** the most specific matching row wins. `ft-release`'s own row
governs it; every other `SKILL.md` falls under the glob row.

**Not budgeted, deliberately:** `docs/`, archived tasknotes, `tools/`, `viz/`,
`SPEC/procedures/`, and the lazy `SPEC/` modules other than `gates.md` and
`gate-postures.md`. None of
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

Measured 2026-09-14 at v5.28.0, refreshed by [[CORE-599]] — the release cut,
which re-measured every row. Refreshed by
`/ft-release` §7.1 in the same cut that reads it — if these numbers are stale,
the cut that made them stale skipped its own standing check.

**Default-path cold start.** A ledger row, not a budget — nothing here is
CI-enforced; it sums the surfaces a flagless `/ft-task <ID>.<sub>` reads before
any Phase 1 write: `claude/commands/ft-task.md` (2,520) + `claude/skills/ft-task/SKILL.md`
(26,426) + `SPEC.md` (53,984) + `.flowtron/tasknote/README.md` (8,816) +
`templates/tasknote-template.md` (5,173) + `SPEC/gates.md` (20,804) +
`SPEC/epic.md` (6,127) = **123,850 chars**
(≈31k tokens; `.flowtron/PLAN.md`'s own band, below, is excluded since it isn't
a flowtron-shipped surface). Measured fresh at filing (2026-09-18, post this
task's own edits) rather than pulled from the tables below, which still carry
the standing v5.28.0 figures until the next `/ft-release` refresh — a small
apparent mismatch against those rows is that gap, not new drift. Tracks the
trend [[CORE-EPIC-604]] set out to cut: [[CORE-604.1]] measured ≈172k chars at
v5.28.0 before the epic's tiering (gate-postures split, runner/stub/`model.md`
trim, rotation-bound lower, and [[CORE-605]] dropping `SPEC/plan-filing.md`
off this sum by softening its three Closed-line/Step-3 citations to
consult-when-unclear pointers).

### Always loaded to run one task

| Surface | Chars |
|---|---|
| `SPEC.md` | 52,993 |
| `claude/skills/ft-task/SKILL.md` | 28,291 |
| `AGENTS.md` (`CLAUDE.md` is a symlink to it) | 6,800 |
| `.flowtron/tasknote/README.md` | 8,816 |
| `templates/tasknote-template.md` | 5,173 |
| `.flowtron/PLAN.md` | ~2–3k (band — see below) |

**Why `.flowtron/PLAN.md` carries a band and not a number.** Every other surface
in this ledger changes only when a task deliberately edits it, so a drifted
figure there is *signal* — it says an always-loaded surface grew, which is what
the ratchet exists to catch. PLAN.md changes on **every** closure regardless of
what the task was about, because closure itself rewrites a task line. Its exact
size therefore reports how many tasks happen to be open today, not the size of
anything flowtron ships: an adopter receives `templates/PLAN.md` (measured under
§"Adopter-side always-loaded") and then grows their own. A precise figure here
would be falsifiable on every commit and informative on none.

Do not "correct" the band back to a `wc -c` reading. [[CORE-537]] chose it over
*dropping* the row — `/ft-task` really does read PLAN.md in full, so the section
would understate its own total without it — and over *marking it
release-refreshed*, which the §"Ledger" stamp above already says of every row
and which would still leave this one stale between closures. The row stays
unbudgeted for the same reason it is banded: flowtron cannot cap a file it does
not ship.

### Lazy `SPEC/` modules

`procedures/ft-task.md` 33,964 · `gates.md` 20,804 ·
`gate-postures.md` 19,029 · `model.md` 17,070 · `gate-discipline.md` 15,367 ·
`plan-filing.md` 15,263 · `tasknote-selection.md` 15,217 ·
`cue-vocabulary.md` 15,119 ·
`blocked.md` 12,052 · `unattended-candidacy.md` 10,597 ·
`plan-parser.md` 8,609 · `loop.md` 8,042 ·
`epic.md` 6,127 · `procedures/README.md` 5,970 ·
`scope-boundaries.md` 5,347 · `layout.md` 5,232 ·
`tasknote-inserts.md` 4,615 · `purpose-blurb.md` 4,027 ·
`superseded-claims.md` 2,947 · `starter.md` 2,494 ·
`versioning.md` 1,219.

`gates.md` and `tasknote-selection.md` are lazy by declaration and
near-universal in practice; `plan-filing.md` was too until [[CORE-605]]
softened its three Closed-line/Step-3 citers (`SPEC.md`,
`templates/tasknote-template.md`, `claude/skills/ft-micro-task/SKILL.md`) from
inline "per ..." loads to consult-when-unclear pointers, so it now loads only
when a closure genuinely needs the exception/rotation/filing-commit detail;
the rest genuinely load only on their task shape. [[CORE-535.3]]
added six of the modules above by moving narrow-use sections out of `SPEC.md`
— which is why the `SPEC/` total grew while the always-loaded set shrank.
[[CORE-535.5]] added two more the same way, out of `gates.md`: neither
`cue-vocabulary.md` (reference — loaded when composing or interpreting a cue)
nor `gate-discipline.md` (loaded when about to skip a gate) is consulted by an
ordinary run, which is why neither earns a budget row. [[CORE-595]] split
`tasknote-selection.md` (28,952 → 15,236) the same way, moving its three
PLAN.md-row contracts — filing commits, the `## Completed` stub form, and
rotation — into `plan-filing.md`; both halves are near-universal (every
closure loads the stub form) but each is now half the size, so neither is
close to earning a budget row. [[CORE-604.2]] split `gates.md` (35,910 →
20,804) the same way, moving the `--fast` / `--unattended` postures and the
flag×surface matrix into `gate-postures.md` (19,029) — genuinely lazy, loaded
only when a flag or the `[unattended]` row marker is set, and budgeted anyway
because it was budgeted before it moved.

### Skill bodies (`SKILL.md` only)

ft-release 31,620 · ft-epic-discovery 29,501 · ft-task 28,291 · ft-audit
27,185 · ft-file-followup 27,117 · ft-close-epic 27,036 · ft-micro-task 20,721 ·
ft-refactor 16,525 · ft-update 16,460 · ft-audit-context 11,438 ·
ft-new-project 11,337 · ft-audit-repo 9,873 · ft-stats 8,872 · ft-flowtron
8,299.

`ft-goal-task`, `ft-spec`, `ft-starter-task`, `ft-worktree-start`, and
`ft-worktree-end` were retired at v5.27.0 (CORE-570/571/572/573), folded into
`ft-task`, `ft-file-followup --starter`, and demoted content — five fewer rows
here, not five fewer surfaces flowtron covers.

Lazy fragments are not counted against a skill's row — they arrive later, and
only on the branch that needs them. Whole-directory totals for the two largest:
`ft-release` 114,846, `ft-task` 73,390. Splitting a body into fragments defers
load; it does not remove it ([[CORE-507]] §2.5), so a skill that fragments its
way under the cap without shedding content has gamed the number rather than met
it.

### Adopter-side always-loaded

`claude/AGENTS-snippet.md` 15,054 (pasted into the adopter's `AGENTS.md`) ·
`templates/tasknote-README.md` 4,837 · `templates/PLAN.md` 3,063.

## How this is enforced

Two layers, both reading this table rather than restating it. A `drift` CI
step (`.github/workflows/ci.yml`, bound to its source by `/ft-release` §7.1
**Pair L**) runs a `wc -c`-and-compare script against the Budgets table above
on every push and pull request, catching a regression on the commit that
lands it. The standing check in
[`claude/skills/ft-release/step-7.1-standing-checks.md`](../claude/skills/ft-release/step-7.1-standing-checks.md)
runs the identical script by hand at every release cut, then additionally
applies the §"Known over budget" judgment above (which needs
`.flowtron/PLAN.md` ownership context CI does not have) and refreshes the
§"Ledger" below — both stay release-only.

**Every number lives here and is restated nowhere.** The check measures; this doc
decides. That is deliberate: [[CORE-465]] retired a §7.1 check whose failure mode
was a hand-maintained roster kept in two places, and its lesson — "stop counting,
start deriving" — applies to a budget as much as to a skill list. A budget
duplicated into the check would drift from the budget written here, and the gate
would be guarding its own stale copy.

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
