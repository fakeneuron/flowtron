---
title: PLAN.md Completed section archive strategy
status: starter
tags: []
created: 2026-05-05
---

# CORE-036 | PLAN.md Completed section archive strategy

[← PLAN.md](../PLAN.md) · 🌱 Starter (filed 2026-05-05)

## 🌱 Starter context

_Captured 2026-05-05 during the [[CORE-037]] workflow token-cost audit — promote to full tasknote at `/task` checkout. Originally filed inline in PLAN.md; converted to starter as part of [[CORE-040]] dogfood pass._

### Why this exists

The `## Completed` section in `_project/PLAN.md` grows unboundedly and is pulled into AI context every workflow read, paying token cost regardless of recency. The [[CORE-037]] audit measured this section at ~3,200 words / **~78% of PLAN.md's total tokens** (41 entries × 200-450w average). Many entries are paragraph-length duplicates of their archived tasknote summaries. The active-task index is ~1,200w; the rest is history.

### Solution shape

Three candidate approaches — Discovery should compare and pick:

- **(a) Periodic rollup** — at a cadence (monthly? per-tag? when threshold hit), move the oldest completed entries to `_project/PLAN-archive.md` or `_project/archive/PLAN-YYYY-MM.md`. PLAN.md keeps recent history; older context is one click away.
- **(b) ID + completion-date stub** — completed entries collapse to one line: `- [x] **TASK-ID** — completed YYYY-MM-DD. See archive/<area>/<TASK-ID>.md.` Full long-description lives only in the archived tasknote. Maximum compression; preserves cross-reference accessibility.
- **(c) Age- or size-based truncation** — keep the last N completed entries (or last N weeks) in PLAN.md verbatim, truncate older with a "see archive" pointer. Hybrid.

Each has a token-impact estimate worth computing in Discovery.

### Files to touch (preliminary survey — drift-check at promotion)

- `_project/PLAN.md` — primary target
- `templates/PLAN.md` — propagate the new `## Completed` shape to adopting projects
- `viz/src/parser.ts` — verify completed-section parsing still works after the chosen shape lands; add archive-source parsing if option (a)
- `SPEC.md` §"Versioning" / §"Layout in adopting projects" — document the convention if it's adopting-project-facing
- `docs/MIGRATION.md` — add a section on the migration if (a) or (b) requires adopting-project action

### Explicitly out of scope

- Active-section filing discipline ([[CORE-040]] covers that — orthogonal layer)
- Per-entry word-count convention for new completed entries (downstream of whichever strategy is picked)

### Open at promotion (Phase 1 should resolve)

- Which strategy? Lean toward (b) for simplicity — the archived tasknote already holds the full record; PLAN.md doesn't need to duplicate.
- If (a): rollup cadence, threshold, naming convention.
- If (b): is the stub line still parseable by viz? Does `Task.completed = true` survive without the long-form completion summary?
- Backwards compatibility — does this require a one-time migration of the existing 41 entries, or apply prospectively only?

### Related

- [[CORE-037]] — audit that filed this task; broader workflow context
- [[CORE-040]] — active-section filing discipline (parallel layer; orthogonal but related)
