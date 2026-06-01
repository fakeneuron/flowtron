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
Step 1.5). The gate matches a **concrete** tag (`opus`/`sonnet`/`grok`/…) by exact
identity and a **category** tag (`[heavy]`/`[light]`) by *tier* — see
§"Category-vs-concrete matching" below:

- Tag satisfied — concrete tag equals the active model, OR category tag whose
  tier the active model meets or exceeds → proceed silently.
- Concrete tag differs from the active model → block and offer two paths: switch
  the active model via `/model <X>` then re-invoke `/ft-task`, or retag the
  PLAN.md line to the active model and proceed. No silent overrides.
- Category tag tagged heavier than the active model's tier (e.g. `[heavy]` on a
  light-tier model like grok) → emit a ⚠️ inline advisory note and proceed; the
  operator decides whether to escalate or keep the lighter model. Never a silent
  block.
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

## Category-vs-concrete matching

The `[model]` tag is matched against the active model by one of two rules,
depending on whether the tag is a **category** label or a **concrete** name.

**Concrete tag** (`opus`, `sonnet`, `grok`, `gpt-5`, `haiku`, …) — matched by
exact identity. The operator filed a specific assignment, so a different concrete
active model is a hard mismatch (block + offer switch-or-retag). Unchanged from
the original gate.

**Category tag** (`[heavy]` / `[light]`) — matched by **tier**, not string. Tiers
form an ordered ladder:

```text
light  <  heavy
```

Two tiers today; the rule reads the ladder, so a future middle tier slots in
without changing the matching logic (a deliberate tier-count-agnostic design — a
3rd-rung expansion is tracked separately, not pre-built here).

Each concrete model has an inherent tier. This is **guidance for the agent to
self-assess at gate time, not a frozen lookup table** — flowtron does not pin a
cross-provider model→tier table that needs maintenance every release. Calibration
baseline:

- **`heavy`** — deep-reasoning, large/long-context models: `opus`, upper-tier
  GPT-5.5-class, and peers.
- **`light`** — capable, well-scoped implementation models: `sonnet`, `grok`,
  `haiku`, and peers. Note `grok` reads as **light-tier** for the gate: fast and
  reliable on well-scoped work, but not the deep-reasoning / large-context profile
  that defines `heavy`.

The match compares the active model's tier against the tag's tier:

| Active vs. tag tier | Gate action |
|---|---|
| equal (`[light]` on light-tier, `[heavy]` on heavy-tier) | proceed silently |
| active **heavier** than tag (`[light]` on a heavy-tier model) | proceed — overkill is harmless, no flag |
| active **lighter** than tag (`[heavy]` on a light-tier model, e.g. grok) | ⚠️ inline advisory note, then proceed — operator decides whether to escalate; **not** a block |

The ⚠️ note is an inline advisory only (like the `👁️` Phase 3 prefix) — not an
operator-gate banner and not an approval pause; the standing phase-gate count is
unaffected.

**No auto-retag.** A satisfied category tag is **never** rewritten to the concrete
running model. `[heavy]` stays `[heavy]` even when it runs on opus — the category
carries the task's cognitive-load signal (feeding `/ft-stats` buckets and
scannable, agent-neutral filing), which a silent rewrite to the run's model would
destroy.

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
