# Project Name — PLAN.md

## Vision

One-paragraph statement of the project's purpose and end state. Replace this
with the actual project vision.

See [.flowtron/core/SPEC.md](flowtron/SPEC.md) for the canonical workflow contract.

## High

- [ ] **TASK-ID** [!critical] [heavy] | shortname — Optional `[!critical]` flag floats this row to the top of High.
- [ ] **TASK-ID** [medium] | shortname — One-line description of a moderate, multi-step but well-scoped task.
- [ ] **TASK-ID** [light] | shortname — One-line description of a mechanical, clear-diff task.

## Medium

(none)

## Low

(none)

## Future Opportunities

(none)

## Completed

- [x] **TASK-ID** [light] | shortname — Completed YYYY-MM-DD.

<!--
Task-line grammar (see .flowtron/core/SPEC.md §"Task-line format"):

  - [ ] **TASK-ID** [!critical] [model] | shortname — long description

All of `[!critical]`, `[model]` (see `SPEC/model.md` §"Model field" and its
"Practical guidance and agent-aware defaults" subsection for examples,
realistic defaults such as mid-tier models like Grok/Sonnet often `[medium]`
(or `[light]` for mechanical work), and the full agent-aware notes; any short
token is valid), and `| shortname` are
optional. Canonical ordering: `[!critical]` BEFORE `[model]`. Flagged tasks
float to the top of the High column with a red marker chip. The minimal
legacy form `- [ ] **TASK-ID** — description` keeps parsing for backwards
compatibility, but new entries should declare a model so /ft-task can gate on
it without re-asking at scaffold time.
-->

