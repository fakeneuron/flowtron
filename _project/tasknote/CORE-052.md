---
title: tasknote-README variant trim
status: starter
tags: []
created: 2026-05-08
related-tasks: [CORE-047, CORE-049]
---

# CORE-052 | tasknote-README variant trim

[← PLAN.md](../PLAN.md) · 🌱 Starter (filed 2026-05-08)

## 🌱 Starter context

_Captured 2026-05-08 by [[CORE-049]] workflow token audit — promote to full tasknote at `/task` checkout._

### Why this exists

`templates/tasknote-README.md` is 702w — heavy for an **adopter cold-start surface** that ships into every adopting project via `/new-project`. The "Tasknote variants" block (lines 25-28) is **290w of three long paragraphs** (one per variant: standard / starter / micro), each substantially restating SPEC contracts (frontmatter shape, body shape, lifecycle citations). The README already cites SPEC up top — a deeper SPEC-pointer at the variant level is consistent with its existing shape.

### Solution shape

Collapse the three variant paragraphs (lines 25-28) to one-sentence pointers + concrete citations:

- **Standard tasknote** → cite SPEC §"Tasknote frontmatter" + §"Tasknote body shape" + `templates/tasknote-template.md`. ~70w → ~30w.
- **Starter tasknote** → cite `SPEC/starter.md` + `templates/tasknote-starter-template.md`. ~70w → ~25w.
- **Micro-tasknote** → cite SPEC §"When to use a tasknote" micro carve-out + `templates/tasknote-micro-template.md`. ~80w → ~30w.
- Preserve the "Epic lifecycle" pointer at line 28 (already lean).

**Total: ~150-200w savings (702w → ~500-550w; ~21-28%).**

### Files to touch (preliminary survey — drift-check at promotion)

- `templates/tasknote-README.md` — lines 25-28 only

### Decisions locked in this conversation

| Decision | Choice | Rationale |
|---|---|---|
| Variant block shape | Collapse to one-sentence pointers + SPEC/template citations | README's purpose is "what's here" + "where the canonical contracts live", not "how to use each variant" (that's SPEC + skill territory) |
| Adopter migration | None required; additive change | Existing adopters' `_project/tasknote/README.md` was generated at adoption time and won't auto-update. Bumping flowtron picks up the new template only if they regenerate (rare) |
| Bump | Patch | Prose-only, no contract change |
| Model | opus | Adopter-facing surface; tradeoff judgment on inline context vs. SPEC pointer |

### Open at promotion (Phase 1 should resolve)

- **Inline-context preservation:** how much per-variant context to keep vs. defer to SPEC? Lean: **minimal** — one sentence per variant naming the shape + concrete citations. Adopters who want detail follow the citation.
- **MIGRATION.md note:** add a one-line note about the trimmed template? Lean: **no** — additive change, adopters can ignore. If a future adopter trips on the difference, file a fresh task.
- **Phase 3 testing:** none needed (adopter cold-start surface; no parser/test depends on this content).

### Out of scope

- Other sections of `tasknote-README.md` (Layout, Area prefixes, Archive layout, AI-referenced docs, Quick commands) — all load-bearing or recently-added by [[CORE-047]] and lean.
- Other templates — covered separately or already minimal.
- Flowtron-self's `_project/tasknote/README.md` — separate file (bootstrapped by [[CORE-047]]); not affected by template changes.

### Related

- [[CORE-047]] — doc-drift contract (added §"AI-referenced docs" to this template; precedent for additive template changes).
- [[CORE-049]] — workflow token audit (filed this).
- [[CORE-050]] / [[CORE-051]] — sibling SKILL trims from same audit cohort.
