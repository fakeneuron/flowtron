---
description: Cut a flowtron release — version bump, doc-currency shifts, doc-drift sweep, single feat: commit, annotated tag, VERSION-HISTORY prepend, push. Flowtron-self only.
---

Invoke the `ft-release` skill. The skill verifies cwd is the flowtron repo, scans `.flowtron/PLAN.md` for the next pending `release v*` task line (bails on 0 or >1 matches), classifies commits since the last tag to propose a bump kind (user confirms/overrides), scaffolds + drives a release tasknote through the 4-phase workflow, and at closure auto-drafts the annotated-tag message for user review before committing/tagging/pushing.

Takes no arguments — file the PLAN.md release line first (e.g., `**<TASK-ID>** [model] | release vX.Y.Z — ...`), then run `/ft-release`.

For starting a non-release task, use `/ft-task <TASK-ID>`. For small file + execute one-shots, use `/ft-micro-task <TASK-ID>`. For filing rich-context starters mid-flow, use `/ft-starter-task [TASK-ID]`. For lightweight follow-up filings (no tasknote artifact), use `/ft-file-followup [TASK-ID]`. For opening a new epic, use `/ft-epic-discovery`. For closing one, use `/ft-close-epic`. For bootstrapping a fresh repo with flowtron, use `/ft-new-project`. For bumping flowtron in an adopter project, use `/ft-update` (the consumer-side counterpart — `/ft-release` is flowtron-self only).
