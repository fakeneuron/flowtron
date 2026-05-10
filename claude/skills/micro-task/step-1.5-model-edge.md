# Step 1.5 — Model-gate edge cases (executable steps)

> Lazy-loaded SKILL fragment. Loaded by `micro-task` SKILL.md Step 1.5 when the model-mismatch or legacy-entry branch fires. See `claude/skills/micro-task/SKILL.md` for the always-loaded core dispatch and the match-case path.

## Mismatch — PLAN.md `[model]` differs from the active model

STOP. Surface the mismatch and offer two paths via AskUserQuestion:

1. "Switch active model: I'll stop. Run `/model <PLAN-model>` then re-invoke `/micro-task <TASK-ID>`." (recommended)
2. "Retag the PLAN.md line to `<active-model>` and proceed." If chosen, edit the PLAN.md line's `[model]` segment in place, then proceed to Step 2.

Do not silently override.

## Legacy entry — PLAN.md `[model]` is absent (no `[model]` on the line)

Ask the user via AskUserQuestion to choose `opus` or `sonnet` (default recommendation: `opus` for design / multi-file / ambiguous work; `sonnet` for mechanical work with a clear diff in mind). Then write `[<chosen>]` into the PLAN.md line in place (insert immediately after `**TASK-ID**`), then proceed to Step 2. The next time `/micro-task` runs against this line, no question is asked.
