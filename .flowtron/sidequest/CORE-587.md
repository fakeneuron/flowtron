---
title: ft-task SOP behind on verify-receipt + park-reason fixes
status: sidequest
priority: Medium
pickup: soon
created: 2026-09-12
parent: CORE-586
---

# CORE-587 | ft-task SOP behind on verify-receipt + park-reason fixes

[← PLAN.md](../PLAN.md) · 📌 Sidequest (filed 2026-09-12)

## Idea

`SPEC/procedures/ft-task.md` (the agent-neutral SOP for Codex/Grok/Cursor) has fallen behind two Claude-skill fixes surfaced by the CORE-586 (v5.27.0) SOP-currency walk: CORE-557's Phase 3 "Verification receipt" evidence box (`command → exit code`, replacing the older self-tick shape) isn't restated in the SOP's Phase 3 section, and CORE-565.2's resume fix (clear the `park-reason:` key on resume, per `SPEC/blocked.md` §"Exit (resume)") isn't mirrored in the SOP's resume branch either. A non-Claude agent following only the SOP would produce the old evidence shape and leave a stale `park-reason:` code after resuming. Re-check both surfaces and mirror the fixes into the SOP; bump `last-verified:` once done.

## Resume anchor

Mid-`/ft-release` CORE-586 (v5.27.0 cut), right after resolving the SOP-currency check and the dogfood-gate concurrent-write race; the release cut continues on to Phase 3 validation next.
