---
description: Cut a flowtron release — version bump, doc-currency shifts, doc-drift sweep, single feat: commit, annotated tag, push. Flowtron-self only.
---

Invoke the `release` skill. The skill verifies cwd is the flowtron repo, scans `_project/PLAN.md` for the next pending `release v*` task line (bails on 0 or >1 matches), classifies commits since the last tag to propose a bump kind (user confirms/overrides), scaffolds + drives a release tasknote through the 4-phase workflow, and at closure auto-drafts the annotated-tag message for user review before committing/tagging/pushing.

Takes no arguments — file the PLAN.md release line first (e.g., `**<TASK-ID>** [opus] | release vX.Y.Z — ...`), then run `/release`.

For starting a non-release task, use `/task <TASK-ID>`. For small file + execute one-shots, use `/micro-task <TASK-ID>`. For filing rich-context starters mid-flow, use `/starter-task <TASK-ID>`. For lightweight follow-up filings (no tasknote artifact), use `/file-followup <TASK-ID>`. For opening a new epic, use `/epic-discovery`. For closing one, use `/close-epic`. For bootstrapping a fresh repo with flowtron, use `/new-project`. For bumping flowtron in an adopter project, see flowtron's `docs/MIGRATION.md` §"Pinning and bumping" (manual procedure — `/release` is flowtron-self only).
