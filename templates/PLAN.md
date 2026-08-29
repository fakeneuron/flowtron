# Project Name — PLAN.md

## Vision

One-paragraph statement of the project's purpose and end state. Replace this
with the actual project vision.

See [.flowtron/core/SPEC.md](core/SPEC.md) for the canonical workflow contract.

<!--
Task-line grammar (see .flowtron/core/SPEC.md §"Task-line format"):

  - [ ] **TASK-ID** [!critical] [model] [unattended] | shortname — long description

All of `[!critical]`, `[model]` (see `SPEC/model.md` §"Model field" and its
"Practical guidance and agent-aware defaults" subsection for examples,
realistic defaults such as mid-tier models like Grok/Sonnet often `[medium]`
(or `[light]` for mechanical work), and the full agent-aware notes; any short
token is valid), `[unattended]`, and `| shortname` are optional. Canonical
ordering: `[!critical]` BEFORE `[model]`, `[unattended]` AFTER it. Flagged
tasks float to the top of the High column with a red marker chip.
`[unattended]` marks a row safe to dispatch with no operator present — an
opt-in an operator seeds deliberately; most projects never use it. The
minimal legacy form
`- [ ] **TASK-ID** — description` keeps parsing for backwards compatibility,
but new entries should declare a model so /ft-task can gate on it without
re-asking at scaffold time.

Illustrative entries (replace TASK-ID with a real <AREA>-<N> id when filing):

  - [ ] **TASK-ID** [!critical] [heavy] | shortname — Optional `[!critical]` flag floats this row to the top of High.
  - [ ] **TASK-ID** [medium] | shortname — One-line description of a moderate, multi-step but well-scoped task.
  - [ ] **TASK-ID** [light] | shortname — One-line description of a mechanical, clear-diff task.
  - [x] **TASK-ID** [light] | shortname — Completed YYYY-MM-DD.

`## Completed` is bounded (see .flowtron/core/SPEC/tasknote-selection.md
§"`## Completed` rotation"): past ~150 rows, rotate the oldest whole-month
blocks into a sibling `.flowtron/PLAN-ARCHIVE.md`. That file does not exist
until your first rotation, and rotation is an operator motion — nothing here
auto-applies, and no closed row is ever deleted.

These examples live ABOVE the first `##` heading on purpose: the parser only
processes checkbox lines *inside* ## High / Medium / Low / Future Opportunities
/ Completed, so illustrative TASK-ID lines here never surface as unparsed
diagnostics. Add real entries under the headings below.
-->

## High

(none)

## Medium

(none)

## Low

(none)

## Future Opportunities

(none)

## Completed

(none)
