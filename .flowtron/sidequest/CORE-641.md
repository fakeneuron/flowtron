---
title: typescript-7
status: sidequest
priority: Low
pickup: next-chat
created: 2026-09-20
parent: CORE-639.3
---

# CORE-641 | typescript-7

[← PLAN.md](../PLAN.md) · 📌 Sidequest (filed 2026-09-20)

## Idea

Bump `typescript` 5.9→7 after `typescript-eslint` supports TS ≥7.1 (it currently peer-ranges `<6.1.0` and hard-errors: "typescript-eslint does not support TS 7.0"). Isolate bump also failed `tsc` with TS2882 on `src/main.tsx`'s side-effect `import './styles.css'`. Do not jump 5→7 by ignoring peers; wait for eslint support, then re-run the full AGENTS.md roster. CORE-639.3 reverted.

## Resume anchor

CORE-639.3 viz-majors-triage, after reverting typescript 7; vitest 5 and four other majors already kept.
