---
title: Document the (none) placeholder convention
status: sidequest
priority: Low
pickup: next-chat
created: 2026-09-22
parent: CORE-668
---

# CORE-669 | Document the (none) placeholder convention

[← PLAN.md](../PLAN.md) · 📌 Sidequest (filed 2026-09-22)

## Idea

`templates/PLAN.md` ships `(none)` under every empty priority section, and `viz/src/parser.test.ts` has two dedicated tests confirming the parser recognizes and safely ignores it as a placeholder — but no SPEC module documents the convention. That's why it silently dropped out of the live `.flowtron/PLAN.md` once (`b39eb024` removed it while filing rows under `## High`, and nothing restored it once that section emptied back out — CORE-668 fixed the drift). Add a short paragraph to `SPEC/plan-filing.md` stating `(none)` as the canonical empty-section placeholder, so a future drift like this has a contract to point at.

## Resume anchor

Surfaced during CORE-668's Phase 4 Learnings step, while closing out the `(none)` restoration in `.flowtron/PLAN.md`'s `## High` section.
