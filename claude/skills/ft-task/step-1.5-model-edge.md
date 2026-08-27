# Step 1.5 — Model-gate edge cases (executable steps)

> Lazy-loaded SKILL fragment — **shared**. Loaded by `/ft-task`, `/ft-micro-task`, and `/ft-goal-task` at their Step 1.5 when the concrete-mismatch, category under-tier, or legacy-entry branch fires. The file is owned by `claude/skills/ft-task/`; the other two skills resolve it through their `<MODEL_EDGE>` path. See the **invoking** skill's `SKILL.md` for the always-loaded core dispatch and the satisfied-match path, and `SPEC/model.md` §"Category-vs-concrete matching" for the tier ladder + rule.
>
> **`<SKILL>` below stands for the invoking skill's own slash command** — `/ft-task`, `/ft-micro-task`, or `/ft-goal-task`. Substitute it wherever it appears when surfacing a branch to the operator; never hard-code `/ft-task`. Sending the operator back through the wrong skill drops that skill's shape — a `/ft-goal-task` re-entry via `/ft-task` loses the `loop:` / `loop-max:` frontmatter and the `## 🔁 Iterations` log.

## Mismatch — PLAN.md concrete `[model]` differs from the active model

Fires only when the tag is a **concrete** model name (`opus`/`sonnet`/`grok`/…) and the active model is a *different* concrete model. A **category** tag (`[xheavy]`/`[heavy]`/`[medium]`/`[light]`) never reaches this branch — it either proceeds (tier met or exceeded) or routes to "Category under-tier" below.

STOP. Surface the mismatch and offer two paths via AskUserQuestion:

1. "Switch active model: I'll stop. ▶️ RUN: `/model <PLAN-model>` then re-invoke `<SKILL> <TASK-ID>`." (recommended — preserves the filed assignment)
2. "Retag the PLAN.md line to `<active-model>` and proceed." If chosen, edit the PLAN.md line's `[model]` segment in place, then proceed to Step 2.

Do not silently override.

## Category under-tier — PLAN.md tag outranks the active model's tier

The active model's tier is *below* the category tag (e.g. a `[heavy]` task with the active model reading as medium-tier like grok, or light-tier like haiku; or a `[medium]` task on a light-tier model). This is a soft advisory, **not** a STOP. Emit a one-line ⚠️ inline note, then proceed to Step 2:

> ⚠️ Active model reads below the tagged tier (this task is tagged `[heavy]`). Consider switching to a higher-tier model (`/model <higher-tier>` then re-invoke), or retag the PLAN.md line if the lighter model is the deliberate choice. Proceeding as-is.

Do not block and do not auto-retag — the category tag stays as filed. The operator stays in control; the note exists so an under-powered run on deep-reasoning work is visible rather than silently accepted. The reverse case (a heavier model on a `[light]` task) proceeds silently — overkill is harmless. Tier calibration is in `SPEC/model.md` §"Category-vs-concrete matching".

An **`[xheavy]` tag always lands here** — the manual-only exploratory rung sits above every roster model's default band, so no active model tier-satisfies it. The ⚠️ note is expected rather than exceptional: it marks the deliberate entry into operator-driven exploratory territory, and the operator proceeds (or retags) as they see fit. Automated choosers must never pick up an `[xheavy]` task (they cap at `[heavy]` — `SPEC/model.md` §"Category-vs-concrete matching").

## Legacy entry — PLAN.md `[model]` is absent (no `[model]` on the line)

Ask the user via AskUserQuestion to choose a model token. Recommended primary labels: `[heavy]` for design / multi-file / ambiguous work; `[medium]` for moderate, multi-step but well-scoped work (the round-up default — when in doubt, round up); `[light]` only for provably mechanical work with a clear diff in mind. Do not offer `[xheavy]` as an option — the manual-only exploratory rung is a deliberate operator filing, never a default pick (`SPEC/model.md` §"Practical guidance"). You may use any short token per SPEC §"Model field" — the current roster by tier is `fable` / `opus` / `gemini-pro` (heavy), `sonnet` / `grok` / `codex` / `gemini-flash` (medium), `haiku` (light); the full cross-provider mapping, including where `gpt-5` sub-families land and how effort settings shift a band, is `SPEC/model.md` §"Platform×model×effort calibration table". Project-specific names are equally valid. Use the bare family name: context-window and effort variants do not get their own token (see `SPEC/model.md` §"Effort axis"). Then write `[<chosen>]` into the PLAN.md line in place (insert immediately after `**TASK-ID**`), then proceed to Step 2. The next time `<SKILL>` runs against this line, no question is asked.
