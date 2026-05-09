---
title: starter-task SKILL cite-don't-restate
status: starter
tags: []
created: 2026-05-08
related-tasks: [CORE-038, CORE-040, CORE-049, CORE-050]
---

# CORE-051 | starter-task SKILL cite-don't-restate

[← PLAN.md](../PLAN.md) · 🌱 Starter (filed 2026-05-08)

## 🌱 Starter context

_Captured 2026-05-08 by [[CORE-049]] workflow token audit — promote to full tasknote at `/task` checkout._

### Why this exists

`claude/skills/starter-task/SKILL.md` is 1,343w with three duplication sites that the cite-don't-restate pattern absorbs cleanly. Sibling-of-[[CORE-050]] in shape; both descend from [[CORE-038]]'s proven pattern.

### Solution shape

Apply cite-don't-restate across three sites:

1. **Step 0 — Resolve paths** (~170w → ~100w; **~50-80w savings**). Same path-resolve duplication as [[CORE-050]] — tighten phrasing in place. The block is identical to `task/SKILL.md` Step 0 modulo the template name.
2. **Step 3 — Draft the starter body** (~170w → ~100w; **~50-80w savings**). The sub-heading list (lines 62-69) restates `templates/tasknote-starter-template.md` and `SPEC/starter.md`. Cite both instead of restating.
3. **Step 5 — Append the PLAN.md entry** (~260w → ~170w; **~80-100w savings**). The filing-discipline threshold check (lines 109-115) restates SPEC §"PLAN.md filing-discipline thresholds" inline (the table). Cite SPEC; preserve only the skill-specific override clause (the ">70w → must trim, or document the override in starter body's `## 🌱 Starter context`" mechanism).

**Total: ~200-300w savings (1,343w → ~1,100-1,150w; ~15-22%).**

### Files to touch (preliminary survey — drift-check at promotion)

- `claude/skills/starter-task/SKILL.md` — Steps 0, 3, 5

### Decisions locked in this conversation

| Decision | Choice | Rationale |
|---|---|---|
| Pattern | cite-don't-restate | Same as [[CORE-050]] / [[CORE-038]]; minimal risk |
| Step 5 override clause | Preserve verbatim | Skill-specific filing logic SPEC doesn't carry |
| Model | opus | Same sensitivity as [[CORE-050]]; cold re-read mandatory |

### Open at promotion (Phase 1 should resolve)

- **Step 5 — override clause depth:** keep verbatim (lean) or compress further? Lean: **keep verbatim** — short already, and SPEC doesn't carry the "document override rationale in starter body" mechanism.
- **Step 3 — sub-heading list:** cite `templates/tasknote-starter-template.md` (which has the canonical sub-headings) vs. cite `SPEC/starter.md` (which has the contract). Lean: cite **both** in one line — template for the literal sub-heading text, SPEC for the contract.
- **Verification:** cold re-read after edit ([[CORE-038]] / [[CORE-050]] precedent).
- **Version bump:** patch.

### Out of scope

- `task/SKILL.md` and `micro-task/SKILL.md` — covered separately ([[CORE-050]]).
- SPEC §"PLAN.md filing-discipline thresholds" content itself — [[CORE-040]] set this contract; not changing.

### Related

- [[CORE-038]] — task SKILL.md cite-don't-restate (pattern source).
- [[CORE-040]] — PLAN.md filing-discipline thresholds (SPEC anchor for Step 5 trim).
- [[CORE-049]] — workflow token audit (filed this).
- [[CORE-050]] — micro-task SKILL parallel trim (sibling).
- [[CORE-052]] — tasknote-README variant trim (sibling, same audit cohort).
