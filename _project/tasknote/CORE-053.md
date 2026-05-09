---
title: MIGRATION-variant-trim
status: starter
tags: []
created: 2026-05-09
related-tasks: [CORE-052, CORE-049]
---

# CORE-053 | MIGRATION-variant-trim

[← PLAN.md](../PLAN.md) · 🌱 Starter (filed 2026-05-09)

## 🌱 Starter context

_Captured 2026-05-09 by [[CORE-052]] Phase 4 doc-drift sweep — promote to full tasknote at `/task` checkout._

### Why this exists

`docs/MIGRATION.md` §1.5 contains a **parallel restatement** of the tasknote variant block and body shape, discovered during [[CORE-052]]'s doc-drift sweep. [[CORE-052]] just trimmed the same content from `templates/tasknote-README.md` (702w → 504w, -28.2%). The MIGRATION.md §1.5 restatement (lines 95–102) was deliberately left out of CORE-052's scope (filing discipline; different audience; "Skip MIGRATION.md note" decision). This task applies the same cite-don't-restate principle to MIGRATION.md.

**Audience difference:** MIGRATION.md §1.5 is **one-time adoption guidance** — adopters read it once when bootstrapping. The README template they just copied (and SPEC.md they're pointed to) carry the canonical shapes. Whether the MIGRATION.md context warrants more inline explanation than those surfaces is the key judgment call for Phase 1 Discovery.

### Verified line counts (from CORE-052's doc-drift sweep)

| Line | Content | Words |
|---|---|---|
| 95 | Body-shape restatement ("The README also describes the current tasknote shape: YAML frontmatter...") | 51w |
| 97 | Variant intro sentence ("Two lightweight tasknote variants exist...") | 10w |
| 99 | Starter variant description | 40w |
| 100 | Micro variant description | 51w |
| 102 | Epic lifecycle description | 38w |
| **Total restatement** | | **~190w** |

Line 93 (70w — "Declare any project-specific area prefixes...") is adoption instruction, not restatement — likely out of scope.

### Solution shape (preliminary — drift-check and audience judgment at promotion)

Apply cite-don't-restate to lines 95–102:
- **Line 95** (body-shape restatement): collapse to one-sentence cite → `_project/flowtron/SPEC.md` §"Tasknote frontmatter" + §"Tasknote body shape" + `_project/flowtron/templates/tasknote-template.md`. ~51w → ~20w.
- **Lines 97–100** (variant intro + starter + micro): collapse to two one-sentence cites → `_project/flowtron/SPEC/starter.md` and `_project/flowtron/SPEC.md` §"When to use a tasknote (and when not to)". ~101w → ~30w.
- **Line 102** (epic lifecycle): judge at promotion — may preserve (38w, already lean, mirrors CORE-052's decision) or trim.

**Estimated savings: ~100-160w (190w → ~30-90w remaining; ~50-85% of restatement block).**

Adoption-guidance lines (line 93, surrounding setup text) are out of scope.

### Files to touch (preliminary survey — drift-check at promotion)

- `docs/MIGRATION.md` — §1.5 lines 95–102 only

### Decisions locked in this conversation

| Decision | Choice | Rationale |
|---|---|---|
| Audience caution | Flag at Discovery | MIGRATION.md is one-time adoption guidance; may warrant slightly more inline context than the always-loaded README template or SKILL. Phase 1 should resolve how aggressive to be. |
| Epic lifecycle (line 102) | Defer to Discovery | CORE-052 preserved it (already lean); same call may apply here. Discovery judgment. |
| Version bump | Patch | Prose-only, no contract change |
| Model | opus | Adopter-facing surface; tradeoff judgment on inline context vs. cite; matches CORE-052 |

### Open at promotion (Phase 1 should resolve)

- **Audience judgment:** does MIGRATION.md §1.5's one-time-read adoption context warrant keeping more inline explanation than the README/SKILL surfaces? Or is the cite-only shape (same as CORE-052) correct?
- **Line 102 (epic, 38w):** preserve or trim? CORE-052 preserved the epic line in the README.
- **Line 95 scope:** collapse body-shape restatement to a cite, or drop entirely (preceding text already directs adopters to "inspect those files directly")?
- **Acceptance threshold:** verify line word counts at promotion before locking (CORE-051/052 both saw starter estimates drift vs actuals).
- **Phase 3 testing:** likely N/A (prose-only MIGRATION.md change; no parser/test depends on this content). Confirm at promotion.

### Out of scope

- Line 93 and surrounding setup text in §1.5 (adoption instructions, not restatement)
- Other §§ of MIGRATION.md — not flagged by the audit cohort
- Other files — CORE-052 already handled `templates/tasknote-README.md`

### Related

- [[CORE-052]] — tasknote-README variant trim (immediate predecessor; same pattern applied to the README template; doc-drift sweep that filed this).
- [[CORE-049]] — workflow token audit (filed the audit cohort; CORE-050/051/052 are the sibling trims).
