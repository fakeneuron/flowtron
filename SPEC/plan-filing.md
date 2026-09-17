# PLAN.md filing

> Lazy-loaded SPEC module. Loaded at the two moments a PLAN.md row changes hands with git: by the filing motions (`/ft-file-followup` and its `--park` / `--starter` modes, `/ft-audit`, `/ft-refactor`) when they commit their own filing, and by every closing runner (`/ft-task`, `/ft-micro-task`, `/ft-epic-discovery`, `/ft-close-epic`, `/ft-release`) at the Phase 4 stub flip — plus the visualizer as a `## Completed` history consumer. See `SPEC.md` for the always-loaded core spec, and the sibling [`SPEC/tasknote-selection.md`](tasknote-selection.md) for the use/skip thresholds, the filing-discipline word budget, and the downstream-impact reconciliation scan that decide *what* to file.

Three contracts, one subject — what happens to a PLAN.md row once it is
written: §"Filing commits" (how a filing lands in git), §"`## Completed`
archive convention" (how a closed row collapses), and §"`## Completed`
rotation" (how closed rows leave the plan file without being deleted).

## Filing commits

The filing motions — `/ft-file-followup` (default flow), its `--park`
and `--starter` modes, `/ft-audit`, and `/ft-refactor` — **commit their own
filing** at hand-off. Filing approval *is* commit authorization: the operator
already confirmed at the review gate (follow-up / starter), by passing the park
flag and answering the priority question (park mode), at `/ft-audit`'s
write-step confirmation (tickets plus any inline fixes), or at `/ft-refactor`'s
plan-review confirmation, and a second commit-go ask buys nothing. Left uncommitted, a filing carries into the next session
as working-tree dirt — which `SPEC.md` §"Paper-complete guard" then converts
into a hard stop at the next `/ft-task` entry, so the filing's cost lands on a
later, unrelated task.

Message shape, one per filing motion:

| Motion | Commit message |
|---|---|
| `/ft-file-followup` (default) | `chore: file <ID> follow-up — <shortname>` |
| `/ft-file-followup --park` | `chore: file <ID> park — <shortname>` |
| `/ft-file-followup --starter` | `chore: file <ID> starter — <shortname>` |
| `/ft-audit` | `chore: audit file tickets — <domain>` |
| `/ft-refactor` | `chore: file <AREA>-EPIC-<N> refactor plan — <shortname>` |

Rules:

- **Explicit pathspecs only.** Stage the filing's own paths by name —
  `.flowtron/PLAN.md`, plus `.flowtron/tasknote/<ID>.md` (starter) or
  `.flowtron/sidequest/<ID>.md` (park), plus each inline-fix source path
  (`/ft-audit` §5 trivial-fix carve-out). **Never** `git commit -a`,
  `git add .`, or `git add -A`. A follow-up is routinely filed from *inside*
  an active `/ft-task`, where the working tree legitimately carries the parent
  task's unfinished edits; a greedy stage would commit them under a `chore: file`
  message.
- **Pre-check, then skip on dirt.** Two readings, both must be clean:
  `.flowtron/PLAN.md` carries no uncommitted changes
  (`git status --porcelain -- .flowtron/PLAN.md` prints nothing) **and** the
  index is empty (`git diff --cached --quiet` exits 0). Both clean → after the
  append the only delta the commit can publish is the filing's own, so commit.
  **Either dirty → do not commit:** say so in one line and leave the filing for
  the surrounding commit (the pre-CORE-429 behavior). Never resolve foreign PLAN
  dirt on the operator's behalf, and never fold it into the filing commit. The
  index reading exists because the commit below publishes the *whole* index,
  not just the filing's paths: a closure that has already staged deliverables
  (`git rm`s, source edits) but not yet its PLAN flip leaves PLAN.md reading
  clean, and a PLAN-only pre-check then lets that content ride out under a
  `chore: file` subject (seen in an adopter 2026-09-13; the fix is CORE-591).
  **Placement is load-bearing:** run it immediately before the filing's *first
  write*, not at ID pre-flight. Every filing motion pauses for the operator
  between those two points (the AskUserQuestion collection and review gate, or
  park mode's priority question), and the tree can gain PLAN.md edits while it
  waits — a reading taken before the pause can be stale by the time it is used.
- **Post-stage verification, then skip on a foreign hunk.** Correct placement
  shrinks the pre-check's staleness window to agent-only time; it does not close
  it. A write landing between the pre-check and `git add` — an editor autosave, a
  format-on-save, a concurrent session — is staged unseen and published under a
  `chore: file` message. So after staging and **before** committing, read the
  whole staged diff (`git diff --cached`, **no pathspec** — the commit publishes
  the whole index, so the read must cover the whole index). Every hunk must
  be one this filing wrote: the appended PLAN row, any confirmed reconcile edit,
  the starter/sidequest file, each named inline fix. **An unrecognized hunk →
  do not commit:** `git restore --staged` the filing's own pathspecs, then take
  the skip-on-dirt branch above — one line saying so, filing left for the
  surrounding commit. This is the same outcome, not a new one; it adds no gate,
  no report shape, and no 🏁. Do not unstage the foreign hunk and commit the
  rest — that resolves the operator's dirt on their behalf, which the bullet
  above forbids. **Why this closes the window rather than narrowing it:**
  `git commit -m` with no pathspec publishes the index as it stands, so a write
  landing *after* `git add` cannot reach the commit. The exposure is exactly the
  pre-check → `git add` span, and the unscoped staged diff is the very content
  the commit will publish — so every write that could have slipped in is visible
  to this read. Re-running the pre-check nearer the stage only makes the same
  window smaller and is not a substitute. For the same reason the commit never
  takes a pathspec (`git commit --only <path>` / `git commit <path>`): that
  form commits the *working tree* of the named paths, bypassing the index the
  read just verified, and re-opens the post-`git add` window.
- **Commit, never push.** Pushing stays the operator's call in their own
  session.
- **Confirmed reconcile edits ride along.** Where the operator confirmed edits
  from [`SPEC/tasknote-selection.md`](tasknote-selection.md)
  §"Downstream-impact reconciliation", they are part of the same filing and
  land in the same commit — so the commit is the filing's **last** write.
- **Not a closure commit.** A filing commit closes nothing: no PLAN.md
  checkbox flip, no archive move, no tasknote `status:` change. It therefore
  carries **no 🏁 marker** — `SPEC.md` §"Paper-complete guard" §3 reserves 🏁
  for a closure SHA covering Acceptance deliverables, which a filing has none
  of. Report the result as plain text instead (`committed <sha>`), the same
  shape `SPEC/loop.md`'s `## 🔁 Iterations` log uses for its per-cycle commits.
- **No new gate.** Filing skills surface neither standing phase-gate banner,
  and this adds none — the two-banner cap in `SPEC/gates.md` §"Operator-gate
  cues" is unaffected.

**Unattended filing authority.** The grounding above assumes an operator act
exists to point at. `/ft-file-followup --unattended` has none — no review gate
was answered, no priority question, no write-step confirmation — yet
`SPEC.md` §"Deferred hand-off filing" still obliges an operator-less closure to
file the deferred step as its own unchecked PLAN.md row. The authorization is
therefore **the duty itself**: the run is discharging an obligation the contract
imposes, not exercising discretion, and the operator authorized it upstream by
launching an unattended run against a SPEC that imposes it. Every rule above
holds verbatim — explicit pathspecs, the pre-check and its skip-on-dirt, the
post-stage verification and its skip-on-a-foreign-hunk, commit never push,
no 🏁. What the posture removes is the *pause* before the commit,
never the proof after it (`SPEC/gates.md` §"`--unattended` operator posture").

Three limits come with it. **`--park` is out of scope:** park mode preserves an
operator's tangential mid-session thought and resumes their interrupted work
inline, and both halves presume an operator to have the thought — the
combination is refused rather than given an unattended meaning. **`--starter`
is out of scope too:** a starter body is AI-drafted rich context that exists
to be reviewed, so it keeps the review gate this posture suppresses — the
over-cap stop routes the absent operator to an attended `--starter` filing
rather than the run drafting one unreviewed. And
**reconciliation applies nothing:** [`SPEC/tasknote-selection.md`](tasknote-selection.md)
§"Downstream-impact reconciliation" is one of the things the posture never
relaxes, so an unattended filing still runs the scan and still reports what it
found, but confirms and applies no edit — a run with no operator never performs
the operator's motion.

**Execution skills keep their commit-go gate.** This section governs the five
filing motions above and nothing else. `/ft-task`, `/ft-micro-task`,
`/ft-epic-discovery`, `/ft-close-epic`, `/ft-release`,
`/ft-new-project`, and `/ft-update` are unchanged: their commits
land deliverables or cut releases, and it is the 📦 conditional skip rule
(`SPEC/gates.md`) — not this section — that decides when they commit
autonomously.

## `## Completed` archive convention

Closed task lines collapse to a stub form:

```markdown
- [x] **TASK-ID** [model] | shortname — Completed YYYY-MM-DD.
```

The long description drops — the archived tasknote at
`.flowtron/tasknote/archive/<area>/<TASK-ID>.md` is the canonical record. So
never park anything durable there: a correction, caveat, or decision left in a
long description is deleted on a schedule (`SPEC.md` §"Tasknote frontmatter" →
factual corrections). Phase 4 closure rewrites the line to the stub form (not just the
checkbox + date); `| shortname` is required so visualizers have a row
title, `[model]` stays optional. The stub form above omits `[unattended]`
and other trailing bracket tokens only because the example row never carried
one — a row that does must keep it: the closure rewrite copies the full
trailing bracket-token run verbatim from the original line (`SPEC.md`
§"Task-line format"), it does not reconstruct the line from `[model]` alone.
Adopting projects pick up the
convention on their next bump (additive change; legacy paragraph-form
entries continue to parse).

**Placement rule.** A standalone closed task moves to the top of
`## Completed`. An epic child uses the same checked stub form but remains
2-space nested beneath its active parent in the parent's priority section;
`/ft-close-epic` moves the parent and complete cohort to `## Completed`
atomically after parent-flip approval. Never strand an individual child as a
top-level Completed row.

**Exception — inline audit fixes.** A trivial fix applied inline by an
audit skill (the `/ft-audit*` §5 trivial-fix carve-out: skip-the-tasknote-sized
patches done at audit time instead of filed as a `## Low` ticket) has no
tasknote and no archive file, so its `## Completed` line **retains** a
short self-contained description plus `Surfaced by <audit-label>
YYYY-MM-DD (Finding #N, <severity>), fixed inline` — here the line itself
is the canonical record.

## `## Completed` rotation

`## Completed` grows without bound: every closure appends a row and nothing
ever removes one. Tasknotes rotate to `.flowtron/tasknote/archive/<area>/`,
but their PLAN lines never did — so the plan file, which every task reads at
Step 1 and re-reads at post-closure, carries the entire project history
forever. **Rotation bounds the section without deleting anything.**

**The bound.** `## Completed` holds at most **100** checked rows (nested epic
children counted). Past that, older rows belong in the rotation file.

**The rotation file.** `.flowtron/PLAN-ARCHIVE.md`, a sibling of `PLAN.md`.
Rotated rows are grouped under `## Completed <YYYY-MM>` headings, newest month
first. Rows move **verbatim** — same stub form, same nesting, same text. The
file is **append-only**: rotation adds month blocks, and nothing ever rewrites
an existing one. This is what keeps the §"Exception — inline audit fixes"
rows above safe, since those lines *are* their own canonical record and have
no archived tasknote to fall back on.

**Granularity: whole calendar months.** A rotation moves the oldest complete
month blocks until `## Completed` is at or below the bound. Never a partial
month — a month block that would cross the boundary stays where it is.

**Date resolution.** A row's month comes from its `Completed <YYYY-MM-DD>.`
token. Inline-audit-fix rows (§"Exception — inline audit fixes") carry no such
token — for those, read the date from their mandatory `Surfaced by <audit-label>
<YYYY-MM-DD>` clause, which is the same day the fix landed. A row that resolves
to neither is not rotated; leave it in `PLAN.md` and fix its filing instead.

**Two rules that override the bound:**

- **Never rotate the current calendar month.** Recent closures are the context
  a reader actually wants in the plan file. This rule wins, so `## Completed`
  may legitimately sit *above* 100 whenever the current month alone exceeds it.
  The bound is a target, not an invariant.
- **Never split an epic cohort.** A 2-space-nested child always travels with
  its parent's block, even when its own `Completed` date falls in an earlier
  month.

**Rotation is an operator motion.** Nothing applies it automatically. When a
runner skill reads `PLAN.md` and finds `## Completed` over **150** rows, it
surfaces a one-line advisory and continues — never blocking, never editing.
The gap between the 100 bound and the 150 advisory is deliberate hysteresis:
rotation is periodic hygiene, not a per-task chore. This mirrors the ~50/70-word
filing-discipline advisory in [`SPEC/tasknote-selection.md`](tasknote-selection.md)
§"PLAN.md filing-discipline thresholds" — the control is the human at the
gate, not a validator (`SPEC.md` §"What flowtron does NOT provide").

**Why a second file and not a retention window.** Deleting rows past a window
would destroy the inline-audit-fix records described above, and truncate the
all-time history the visualizer reads. Rotation loses nothing.

**Why this does not re-open the single-plan-file decision.** flowtron's
founding adopter migrations collapsed `PLAN.md` + `ROADMAP.md` +
`PLAN_ARCHIVE.md` + `FUTURE_OPPORTUNITIES.md` into one file, because *active*
planning spread across four files meant no single place answered "what is
open?". `PLAN-ARCHIVE.md` holds **closed rows only** and never carries active
work, so that property is unchanged: `PLAN.md` remains the one file that
answers what is open. Do not extend the rotation file to hold anything but
closed rows.

**Consumers.** Readers that need full history — the visualizer's parser —
read both files and concatenate. Readers that only care about
open work (every runner skill's Step 1) read `PLAN.md` alone and are the
motion's beneficiary. The file is absent until a project's first rotation;
consumers treat absence as an empty archive, never an error.

