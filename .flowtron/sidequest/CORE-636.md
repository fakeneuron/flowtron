---
title: Remove dead root .claudeignore
status: sidequest
priority: Low
pickup: next-chat
created: 2026-09-20
parent: CORE-632.N
touches:
  - .claudeignore
---

# CORE-636 | Remove dead root .claudeignore

[← PLAN.md](../PLAN.md) · 📌 Sidequest (filed 2026-09-20)

## Idea

Flowtron's root `.claudeignore` (one line, `SCRATCH.md`, from CORE-029 `a6e4f47`) is dead on both counts: `SCRATCH.md` no longer exists, and CORE-632.3 verified Claude Code has no `.claudeignore` mechanism — the documented control is a `Read` deny rule (`docs/MIGRATION.md` §1.1 now says so). `git rm .claudeignore`; confirm `git grep claudeignore` outside `.flowtron/` hits only MIGRATION §1.1's "there is no `.claudeignore`" sentence.

## Resume anchor

CORE-632.N audit closed and CORE-EPIC-632 flipped at `6d6f740`; filing the audit's one follow-up candidate before the next task.
