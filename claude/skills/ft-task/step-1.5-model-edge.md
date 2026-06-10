# Step 1.5 — Model-gate edge cases (executable steps)

> Lazy-loaded SKILL fragment. Loaded by `task` SKILL.md Step 1.5 when the concrete-mismatch, category under-tier, or legacy-entry branch fires. See `claude/skills/ft-task/SKILL.md` for the always-loaded core dispatch and the satisfied-match path, and `SPEC/model.md` §"Category-vs-concrete matching" for the tier ladder + rule.

## Mismatch — PLAN.md concrete `[model]` differs from the active model

Fires only when the tag is a **concrete** model name (`opus`/`sonnet`/`grok`/…) and the active model is a *different* concrete model. A **category** tag (`[heavy]`/`[medium]`/`[light]`) never reaches this branch — it either proceeds (tier met or exceeded) or routes to "Category under-tier" below.

STOP. Surface the mismatch and offer two paths via AskUserQuestion:

1. "Switch active model: I'll stop. ▶️ RUN: `/model <PLAN-model>` then re-invoke `/ft-task <TASK-ID>`." (recommended — preserves the filed assignment)
2. "Retag the PLAN.md line to `<active-model>` and proceed." If chosen, edit the PLAN.md line's `[model]` segment in place, then proceed to Step 2.

Do not silently override.

## Category under-tier — PLAN.md tag outranks the active model's tier

The active model's tier is *below* the category tag (e.g. a `[heavy]` task with the active model reading as medium-tier like grok, or light-tier like haiku; or a `[medium]` task on a light-tier model). This is a soft advisory, **not** a STOP. Emit a one-line ⚠️ inline note, then proceed to Step 2:

> ⚠️ Active model reads below the tagged tier (this task is tagged `[heavy]`). Consider switching to a higher-tier model (`/model <higher-tier>` then re-invoke), or retag the PLAN.md line if the lighter model is the deliberate choice. Proceeding as-is.

Do not block and do not auto-retag — the category tag stays as filed. The operator stays in control; the note exists so an under-powered run on deep-reasoning work is visible rather than silently accepted. The reverse case (a heavier model on a `[light]` task) proceeds silently — overkill is harmless. Tier calibration is in `SPEC/model.md` §"Category-vs-concrete matching".

## Legacy entry — PLAN.md `[model]` is absent (no `[model]` on the line)

Ask the user via AskUserQuestion to choose a model token. Recommended primary labels: `[heavy]` for design / multi-file / ambiguous work; `[medium]` for moderate, multi-step but well-scoped work; `[light]` for mechanical work with a clear diff in mind. You may use any short token (e.g. `fable` / `opus` / `sonnet` / `grok` / `haiku`, project-specific names) per SPEC §"Model field". Then write `[<chosen>]` into the PLAN.md line in place (insert immediately after `**TASK-ID**`), then proceed to Step 2. The next time `/ft-task` runs against this line, no question is asked.
