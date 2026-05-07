# Model field

> Lazy-loaded SPEC module. Loaded by `/task` Step 1.5 only on the model-gate edge cases (PLAN-tag mismatches the active model, or PLAN line lacks a `[model]` segment). See `SPEC.md` for the always-loaded core spec.

The model assignment (`opus` | `sonnet`) lives on the PLAN.md task line — the
`[model]` segment of §"Task-line format". PLAN.md is the source of truth.

`/task` reads the model BEFORE scaffolding (see `claude/skills/task/SKILL.md`
Step 1.5):

- Active model matches the PLAN.md `[model]` → proceed silently.
- Active model differs → block and offer two paths: switch the active model
  via `/model <X>` then re-invoke `/task`, or retag the PLAN.md line to the
  active model and proceed. No silent overrides.
- PLAN.md line has no `[model]` (legacy entry) → ask the user via
  AskUserQuestion at `/task` entry, before any scaffolding work.

A task runs end-to-end on a single model — no swapping mid-task between
Discovery, Execution, Testing, or Closure. If scope grows and the tagged
model no longer fits, retag the PLAN.md line and re-invoke; do not silently
swap.

When suggesting a next task, name the recommended model alongside the task
ID — the model is part of the PLAN.md grammar, so it's already known without
asking. Default to `opus` for design, multi-file changes, or ambiguity;
reserve `sonnet` for mechanical work with a clear diff in mind.
