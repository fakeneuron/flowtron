---
title: release dogfood-gate concurrent-write hardening
status: sidequest
priority: Medium
pickup: soon
created: 2026-09-12
parent: CORE-586
---

# CORE-588 | release dogfood-gate concurrent-write hardening

[← PLAN.md](../PLAN.md) · 📌 Sidequest (filed 2026-09-12)

## Idea

During the CORE-586 (v5.27.0) `/ft-release` dogfood-gate walk, the operator ran real Grok/Cursor/Codex dogfood sessions in the same working tree concurrently with this release-driving session. The result: a genuine write race (this session's Claude "Refreshed" stamp was silently overwritten to "skipped" by another writer) plus three mutually-contradictory self-reports relayed from the other sessions, one of which (Codex) described trying to drive the whole `/ft-release` itself rather than reporting its own dogfood evidence. `step-5-dogfood-sop.md`'s existing "Stamp-write ownership under parallel dogfooding" guidance and CORE-501's dirty-check backstop caught the race but didn't prevent the wasted premature writes/reverts, and gave no guidance for a release-driving session receiving unverifiable third-party self-reports. Consider: a sharper protocol for collecting dogfood evidence from parallel sessions (e.g., require the relaying operator to paste raw evidence, not a session's own summary-of-completion claim), and/or an explicit warning in the fragment that a parallel session's report of "I completed X" should be distrusted when X is release-orchestration work rather than that session's own agent-specific verification.

## Resume anchor

Mid-`/ft-release` CORE-586 (v5.27.0 cut), immediately after resolving the dogfood gate (Claude/Grok/Cursor refreshed, Codex skipped) and the SOP-currency check; continuing to Phase 3 validation next.
