---
description: Draft a lightweight, review-first design spec (fixed section order) from a brief or conversation context and optionally write it to .flowtron/specs/<slug>.md. Planning peer — never files PLAN entries or tasknotes. Interactive by default; --fast skips the review pause.
argument-hint: [brief/topic] [--fast | -f]
---

Invoke the `ft-spec` skill with `args="$ARGUMENTS"`. The skill assembles a design brief from `$ARGUMENTS` and/or the current conversation, drafts a spec in the fixed section order (Goal · Requirements · Design · Tasks · Risks/Open Q · Validation Approach) from `templates/spec-template.md`, surfaces it for operator review, and — only on the operator's go — optionally writes it to `.flowtron/specs/<slug>.md`. It **never** files a PLAN.md line, scaffolds a tasknote, or commits; the spec's Tasks section suggests Flowtron work types and the operator converts them by running the named skill.

Usage:

- `/ft-spec [brief/topic]` — draft interactively; review the spec, then choose whether/where to write.
- `/ft-spec [brief/topic] --fast` (or `-f`) — skip the review pause and write straight to `.flowtron/specs/<slug>.md`; still shows the final draft. `--fast` never authorizes a PLAN or tasknote write.

A spec is **optional** — never required before `/ft-task` or `/ft-epic-discovery`. Reach for `/ft-spec` when a design has been worked out in conversation and is worth capturing before decomposition. For filing a single not-yet-ready task with rich context, use `/ft-starter-task`. For opening an epic directly, use `/ft-epic-discovery`. For starting an existing task, use `/ft-task`; for small file + execute one-shots, `/ft-micro-task <TASK-ID>`. For parking an idea with minimal disruption, use `/ft-sidequest`. A one-liner idea needs neither a spec nor a starter — write the PLAN.md line directly.
