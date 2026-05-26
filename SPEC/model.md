---
paths: []
---

# Model field

> Lazy-loaded SPEC module. Loaded by `/ft-task` Step 1.5 only on the model-gate edge cases (PLAN-tag mismatches the active model, or PLAN line lacks a `[model]` segment). See `SPEC.md` for the always-loaded core spec.

The model assignment lives on the PLAN.md task line — the `[model]` segment
of §"Task-line format". PLAN.md is the source of truth. The token is a short
identifier representing the cognitive load of the task.

Flowtron's recommended primary labels are `[heavy]` (design, multi-file,
high ambiguity, or exploratory work) and `[light]` (mechanical, well-scoped,
clear-diff implementation). Adopters MAY use any short token they prefer
(e.g. `opus`, `sonnet`, `haiku`, `gpt-5`, `gemini-pro`, project-specific names).
The visualizer parser accepts any short lowercase token (`[a-z][\w.-]*`), and
`/ft-stats` buckets unknown tokens as `other`.

`/ft-task` reads the model BEFORE scaffolding (see `claude/skills/ft-task/SKILL.md`
Step 1.5):

- Active model matches the PLAN.md `[model]` → proceed silently.
- Active model differs → block and offer two paths: switch the active model
  via `/model <X>` then re-invoke `/ft-task`, or retag the PLAN.md line to the
  active model and proceed. No silent overrides.
- PLAN.md line has no `[model]` (legacy entry) → ask the user via a
  structured ask at `/ft-task` entry, before any scaffolding work.

A task runs end-to-end on a single model — no swapping mid-task between
Discovery, Execution, Testing, or Closure. If scope grows and the tagged
model no longer fits, retag the PLAN.md line and re-invoke; do not silently
swap.

When suggesting a next task, name the recommended model alongside the task
ID — the model is part of the PLAN.md grammar, so it's already known without
asking. Specific model names (`opus`, `sonnet`, `haiku`, `grok`, etc.) remain
fully valid tokens.

## Practical guidance and agent-aware defaults

The labels exist to let the operator (and the agent) match the *cognitive shape*
of the work to the model's "thinking budget" for that turn. They are
observations from real usage, not rigid policy.

**Typical `[light]` work** (start here by default for most flowtron tasks):

- Single-file edits, small refactors with a clear local pattern, adding tests
  or assertions, doc patches, config tweaks, simple bug fixes with obvious
  root cause.
- Current Grok 4.x usage (2026-05): the large majority of routine development,
  maintenance, and even many multi-step but well-scoped flows stay effective
  and low-drift on `[light]`. This task itself (model guidance improvement)
  ran under `[grok]` after a routine retag and stayed on the light-appropriate
  side of the spectrum.

**When to choose `[heavy]`** (even on agents that otherwise favor light):

- Design decisions, high ambiguity, exploratory research that may re-scope
  mid-Discovery, new skills or epic children, anything requiring synthesis
  across distant modules or contract surfaces, multi-file coordination
  without an obvious precedent.
- Rule of thumb: if Phase 1 Discovery surfaces "this is more than a clear-diff
  implementation or has hidden cross-cutting concerns," escalate the tag on
  the PLAN line and re-invoke rather than pushing a light model past its
  useful horizon.

**Cross-provider calibration** (real capability differences exist):

- Different agents have different cost/quality curves on long context and
  sustained reasoning. Some Claude Opus sessions benefit from `[heavy]` on
  extended explorations where context retention across many turns matters;
  current Grok stays crisp and reliable on `[light]` for the majority of
  well-scoped implementation even when the initial description sounds
  moderately complex.
- The model edge case exercised at the very start of *this* task (PLAN.md
  tagged `[sonnet]`, active assistant Grok 4.3 → user chose retag to `[grok]`)
  is a live demonstration of the Step 1.5 mismatch gate working as intended
  across providers.
- When in doubt, start with the label that matches the *actual cognitive
  shape* surfaced in Discovery. Escalate only when the work proves heavier
  than the filing description suggested.

The primary labels `[heavy]` / `[light]` are the recommended starting
vocabulary for new filers and for keeping PLAN.md scannable. Specific names
are the precision escape hatch when you have a strong observed preference
for a particular agent on a particular class of task.
