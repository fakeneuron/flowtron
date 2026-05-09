---
title: micro-task SKILL cite-don't-restate
status: starter
tags: []
created: 2026-05-08
related-tasks: [CORE-038, CORE-042.9, CORE-049]
---

# CORE-050 | micro-task SKILL cite-don't-restate

[← PLAN.md](../PLAN.md) · 🌱 Starter (filed 2026-05-08)

## 🌱 Starter context

_Captured 2026-05-08 by [[CORE-049]] workflow token audit — promote to full tasknote at `/task` checkout._

### Why this exists

`claude/skills/micro-task/SKILL.md` is 1,904w — **larger than `claude/skills/task/SKILL.md` (1,895w)** despite a simpler workflow. The [[CORE-049]] audit identified that micro-task carries multiple sites of duplication that the cite-don't-restate pattern from [[CORE-038]] would absorb cleanly. Sibling-of-[[CORE-038]] in shape.

### Solution shape

Apply cite-don't-restate across four sites plus a structural cleanup at Step 0:

1. **Step 1.5 — Model gate** (~228w → ~90w; **~140w savings**). Lazy-load the mismatch + legacy-entry branches per [[CORE-042.9]] precedent — extract into a new `claude/skills/micro-task/step-1.5-model-edge.md` fragment (mirrors `claude/skills/task/step-1.5-model-edge.md`).
2. **Step 2 — Scaffold** (~160w → ~110w; **~30-50w savings**). Cite SPEC §"Tasknote frontmatter" + §"Tasknote body shape" instead of restating the frontmatter contract.
3. **Step 4 — Recap and close** (~250w → ~140w; **~80-120w savings**). Cite SPEC §"🚀 Phase 4: Closure" + §"`## Completed` archive convention" + the recap-only callout. Preserve only skill-specific orchestration (single closure motion, two-place flip).
4. **Step 5 — Post-closure** (~180w → ~100w; **~80w savings**). Cite SPEC §"Post-closure protocol" — mirrors `task/SKILL.md` Step 6 post-[[CORE-038]]. Preserve "one continuous flow", commit-go gate, slash-command alternation.
5. **Step 0 — Resolve paths** (~190w → ~120w; **~50-80w savings**). Tighten duplicate phrasing with `task/SKILL.md` Step 0; the path-resolve logic is identical across both skills.

**Total: ~400-500w savings (1,904w → ~1,400-1,500w; ~21-26%).**

### Files to touch (preliminary survey — drift-check at promotion)

- `claude/skills/micro-task/SKILL.md` — Steps 0, 1.5, 2, 4, 5 (verify line ranges at promotion)
- New: `claude/skills/micro-task/step-1.5-model-edge.md` (lazy fragment)

### Decisions locked in this conversation

| Decision | Choice | Rationale |
|---|---|---|
| Pattern | cite-don't-restate, mirroring [[CORE-038]] | Proven; preserves contract, kills duplication |
| Bundling | Standalone task (sibling, not subtask of [[CORE-049]] or [[CORE-051]]) | Independent surface; no shared decisions across the three audit-filed trims |
| Model | opus | Cite-don't-restate is sensitive — every skill-specific imperative must survive; cold re-read mandatory |

### Open at promotion (Phase 1 should resolve)

- **Step 1.5 lazy-load shape:** new sibling fragment in `claude/skills/micro-task/` (clean per-skill organization) vs. shared with `claude/skills/task/step-1.5-model-edge.md` (DRY but cross-skill coupling). Lean: **new sibling fragment** — mirrors [[CORE-042.9]]'s per-skill organization; cross-skill citation is awkward when path-resolve differs.
- **Step 0 trim depth:** tighten phrasing in place (lean) vs. cite `task/SKILL.md`'s Step 0 directly (cross-skill citation problem — `task/SKILL.md` isn't always loaded for `/micro-task`). Lean: **tighten in place**.
- **Verification:** cold re-read after edit ([[CORE-038]] precedent caught a template-path regression in cold re-read; this task carries similar risk).
- **Version bump:** patch ([[CORE-038]] precedent — prose-only, no contract change).

### Out of scope

- `task/SKILL.md` re-trim — already at minimum post-[[CORE-038]] / [[CORE-046]].
- `starter-task/SKILL.md` parallel trim — filed separately as [[CORE-051]] (sibling).
- SPEC.md changes — none needed; this is SKILL-side trim only.

### Related

- [[CORE-038]] — task SKILL.md cite-don't-restate (pattern source; same shape).
- [[CORE-042.9]] — SKILL-side lazy-load (precedent for Step 1.5 fragment extraction).
- [[CORE-049]] — workflow token audit (filed this).
- [[CORE-051]] — starter-task SKILL parallel trim (sibling).
- [[CORE-052]] — tasknote-README variant trim (sibling, same audit cohort).
