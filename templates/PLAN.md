# Project Name — PLAN.md

## Vision

One-paragraph statement of the project's purpose and end state. Replace this
with the actual project vision.

See [_project/flowtron/SPEC.md](flowtron/SPEC.md) for the canonical workflow contract.

## High

- [ ] **TASK-ID** [!critical] [opus] | shortname — Optional `[!critical]` flag floats this row to the top of High.
- [ ] **TASK-ID** [opus] | shortname — One-line description of the task

## Medium

(none)

## Low

(none)

## Future Opportunities

(none)

## Completed

- [x] **TASK-ID** [opus] | shortname — Completed YYYY-MM-DD.

<!--
Task-line grammar (see _project/flowtron/SPEC.md §"Task-line format"):

  - [ ] **TASK-ID** [!critical] [model] | shortname — long description

All of `[!critical]`, `[model]` (recommended: `opus` | `sonnet`; adopters MAY
substitute other tokens — see SPEC §"Task-line format"), and `| shortname`
are optional. Canonical ordering: `[!critical]` BEFORE `[model]`. Flagged tasks
float to the top of the High column with a red marker chip. The minimal
legacy form `- [ ] **TASK-ID** — description` keeps parsing for backwards
compatibility, but new entries should declare a model so /ft-task can gate on
it without re-asking at scaffold time.
-->

