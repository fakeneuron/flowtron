---
description: Park an idea or quick fix mid-session — tiny stub + PLAN line, then resume. Use --low/--med/--fut to skip the priority question.
argument-hint: [--low|--med|--fut] [TASK-ID] [idea text]
---

Invoke the `sidequest` skill with `args="$ARGUMENTS"`. The skill auto-allocates a TASK-ID when omitted. Priority: `--low` → `## Low`, `--med`/`--medium` → `## Medium`, `--fut`/`--future` → `## Future Opportunities`, `--high` → `## High` (any position in args). **No flag → one short priority question, then wait** before writing. With a flag (or after the user answers), writes `.flowtron/sidequest/<ID>.md` + one PLAN line, replies in ≤70 words with priority + resume anchor, then continues the interrupted work inline.

If the idea needs a review gate, downstream reconciliation, or a >30w PLAN line, use `/ft-file-followup <TASK-ID>` instead. For rich persistent context, use `/ft-starter-task <TASK-ID>`. For starting parked work later, use `/ft-task <TASK-ID>`, `/ft-micro-task <TASK-ID>`, or `/ft-starter-task <TASK-ID>`.