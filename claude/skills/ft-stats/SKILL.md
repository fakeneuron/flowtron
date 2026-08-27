---
name: ft-stats
description: Show flowtron stats — `[model]` distribution, completion velocity, per-area volume — aggregated from `.flowtron/PLAN.md` `## Completed` plus `.flowtron/PLAN-ARCHIVE.md` when present. Use when the user asks to see flowtron stats, completion velocity, or model distribution. Read-only; with `--write`, also flushes the screen to `.flowtron/STATS.md`.
---

# flowtron — stats screen

Output an analysis screen aggregating closed-row history from
`.flowtron/PLAN.md` `## Completed` **and** `.flowtron/PLAN-ARCHIVE.md` (when
present): `[model]` distribution, completion velocity, and per-area volume.
Read-only by default. With the `--write` arg, also flushes the same screen
content to `.flowtron/STATS.md` (overwrite).

The skill is markdown-only — the assistant does the parsing and aggregation
inline at invocation time, like every other flowtron skill. No CLI, no
executable surface (per `SPEC.md` §"What flowtron does NOT provide").

## Step 0 — Resolve inputs and args

- **PLAN.md path:** `.flowtron/PLAN.md` (identical in flowtron-self and adopter
  contexts — adopters keep their own PLAN.md at this path; flowtron-self uses
  the same path for its own roadmap). If the file is absent, stop and tell
  the user this directory doesn't look like a flowtron-using project.
- **PLAN-ARCHIVE.md path:** `.flowtron/PLAN-ARCHIVE.md`. Optional — absent
  until a project's first rotation. Treat absence as an empty archive (zero
  rows), never an error. Contract:
  `SPEC/tasknote-selection.md` §"`## Completed` rotation" · Consumers.
- **Args:** if `$ARGUMENTS` contains the token `--write` (whitespace-delimited),
  set `WRITE_OUT = .flowtron/STATS.md`; otherwise `WRITE_OUT = null`. Unknown
  args (anything other than `--write`) → stop and surface the usage:
  `Usage: /ft-stats [--write]`. Do not write or print stats.
- **Today's date:** use the conversation's `# currentDate` reminder if
  present; otherwise run `date +%Y-%m-%d`. Use this single value for both the
  screen header and the **Last 30d** cutoff (today − 30 days, inclusive).

## Step 1 — Parse `## Completed` entries

Collect checked rows from **both** history files, then concatenate
(PLAN first, archive second). Rotation moves rows; do not deduplicate.

**PLAN.md.** Find the bare `## Completed` heading. Read every list item
beneath it until the next H2 heading (`## …`) or end-of-file.

**PLAN-ARCHIVE.md** (when present). For every H2 matching
`## Completed <YYYY-MM>` (month form from the rotation contract), read every
list item beneath it until the next H2 or end-of-file. Ignore the file's
prose header above the first month heading. If the file is absent, contribute
zero rows.

For each candidate line in either file:

1. Strip optional leading indent (2-space child indent for epic subtasks).
2. Match against the closure stub form from `SPEC.md` §"`## Completed` archive
   convention" (inline-audit-fix rows use the self-contained description
   form from the same module's §"Exception — inline audit fixes"):

   ```text
   - [x] **<TASK-ID>** [<model>] | <shortname> — Completed <YYYY-MM-DD>.
   - [x] **<TASK-ID>** [<model>] | <shortname> — … Surfaced by <label> <YYYY-MM-DD> …, fixed inline.
   ```

   - `[<model>]` is the model token per SPEC §"Task-line format". Bucket: primary recommended tiers `[heavy]` / `[medium]` / `[light]` (from CORE-256) plus the manual-only `[xheavy]` tier (from CORE-482.3); named concrete buckets `fable` / `opus` / `sonnet` / `haiku` — the current Claude roster per SPEC/model.md (`opus`/`sonnet` also carry historical entries; `fable` added in CORE-303, `haiku` in CORE-373); any other (e.g. limited-access `mythos`, agent-specific `grok`, `gpt-5`, or historical) → `other`; absent `[<model>]` → `legacy`.
   - `| <shortname>` is optional (legacy entries may omit it).
   - **Date resolution** (same order as `SPEC/tasknote-selection.md`
     §"`## Completed` rotation"): prefer the trailing `Completed <YYYY-MM-DD>.`
     token when present; otherwise take the date from the mandatory
     `Surfaced by <audit-label> <YYYY-MM-DD>` clause on inline-audit-fix
     rows. Both stub-form and legacy paragraph-form lines that carry either
     token parse cleanly. When a line carries both (rare), prefer `Completed`.
3. Lines that don't start with `- [x] **<AREA>-...**` are skipped silently
   (blank lines, prose, sub-bullets).
4. Lines that match the prefix but resolve to **neither** date source are
   skipped with a 1-line footer warning citing the `<TASK-ID>`.

For each parsed entry, capture:

| Field | Source |
|---|---|
| `task_id` | bold ID (e.g., `CORE-097.2`, `FE-EPIC-033`) |
| `area` | prefix before the first `-` (`CORE`, `FE`, `BE`, `DB`, `DEPLOY`, `TEST`, or an adopter domain prefix) |
| `model` | `xheavy` \| `heavy` \| `medium` \| `light` \| `fable` \| `opus` \| `sonnet` \| `haiku` \| `other` \| `legacy` |
| `date` | `YYYY-MM-DD` from date resolution above |
| `is_subtask` | true if `task_id` matches `<AREA>-<N>.<SUB>` |
| `is_epic_parent` | true if `task_id` matches `<AREA>-EPIC-<N>` |

**Counting grain:** every parsed line counts as one data point. Subtasks
count separately; parent epic lines also count (no deduplication against
their children). This matches the model-tag dataset's natural grain — each
closed unit-of-work owns its own `[model]` tag.

## Step 2 — Compute the three sections

Compute against the parsed entries from Step 1. Two windows per section:
**All** (every entry) and **Last 30d** (entries whose `date` ≥ today − 30 days).

### Section A — Model distribution

| Model  | All | % | Last 30d | % (30d) |
|---|---:|---:|---:|---:|
| `xheavy` | N | X% | M | X% |
| `heavy` | N | X% | M | X% |
| `medium` | N | X% | M | X% |
| `light` | N | X% | M | X% |
| `fable` | N | X% | M | X% |
| `opus` | N | X% | M | X% |
| `sonnet` | N | X% | M | X% |
| `haiku` | N | X% | M | X% |
| `other` | N | X% | M | X% |
| `legacy` | N | X% | M | X% |

Percentage denominator is total parsed entries in that window. Round to the
nearest integer percent. Omit the `other` and `legacy` rows entirely if their
count is 0 in **both** windows; otherwise show them (zero counts render as
`0` / `0%`). The tier buckets (`xheavy`/`heavy`/`medium`/`light`) and
`fable`/`opus`/`sonnet`/`haiku` are always shown if present in the data (the
rare `xheavy` row, like the rest, appears only when the data carries it).

### Section B — Completion velocity

| Window | Tasks completed | Per week |
|---|---:|---:|
| Last 7d | N | N.N |
| Last 30d | N | N.N |
| All-time | N | N.N |

`Per week` for the fixed windows = `tasks / (window_days / 7)` rounded to one
decimal. All-time per-week uses `tasks / ((today − earliest_completed_date) /
7 days)`; if there is only one entry, render as `—`.

### Section C — Per-area volume

| Area | All | Last 30d |
|---|---:|---:|
| `CORE` | N | N |
| `FE` | N | N |
| … | N | N |

Sort rows by **All** count descending; ties break alphabetically by area code.
Omit areas with zero entries in both windows.

## Step 3 — Render the screen

Print this block as formatted markdown (do not wrap the whole thing in a
code fence — the inner tables render natively). Fill in the computed values
from Step 2.

```text
# flowtron stats — <today>

Source: `.flowtron/PLAN.md` `## Completed`[+ `.flowtron/PLAN-ARCHIVE.md`] — <N> entries parsed[, M skipped]
Last 30d window: <today − 30> → <today> (inclusive)

## Model distribution
<Section A table (expanded for current tiers: xheavy/heavy/medium/light + fable/opus/sonnet/haiku + other/legacy)>

## Completion velocity
<Section B table>

## Per-area volume
<Section C table>

<Skipped-lines footer if any — one line per skipped entry, citing the TASK-ID>
```

Bracketed segments in the Source line are optional. When
`.flowtron/PLAN-ARCHIVE.md` exists, append a space-plus-path segment naming
that file after the PLAN.md clause (even if the archive contributed zero rows
this run). When the archive file is absent, omit that segment. Omit the
`, M skipped` segment when no lines were skipped.

## Step 4 — Optional `--write`

If `WRITE_OUT` was set in Step 0, write the **same screen content** (exactly
what was printed in Step 3, verbatim) to `.flowtron/STATS.md` (overwrite). Then
print one confirmation line beneath the screen:

```text
Wrote `.flowtron/STATS.md` (<N> entries).
```

`.flowtron/STATS.md` is a regeneratable artifact — adopters may `.gitignore`
it or commit it at their own cadence. The skill does not stage or commit.

If `WRITE_OUT` is null, skip this step entirely.

## Step 5 — Stop

After printing the screen (and the optional write-confirmation line), stop.
Do not open a tasknote, ask a follow-up question, suggest a next move, or
offer the `📦` commit gate. `/ft-stats` is purely informational.
