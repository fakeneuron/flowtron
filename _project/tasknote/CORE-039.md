---
title: SPEC.md prose tightening sweep
status: starter
priority: Future Opportunities
area: core
tags: []
created: 2026-05-05
---

# CORE-039 | SPEC.md prose tightening sweep

[← PLAN.md](../PLAN.md) · 🌱 Starter (filed 2026-05-05)

## 🌱 Starter context

_Captured 2026-05-05 during the [[CORE-037]] workflow token-cost audit. Filed initially as a long PLAN.md entry; converted to starter as part of [[CORE-040]] dogfood pass._

### Why this exists

`SPEC.md` (~4,319w) loads on every `/task` invocation via the task skill. The [[CORE-037]] audit identified six discrete trim sites totalling ~600-700w of redundant or low-value prose. Each is a small mechanical edit; bundled into one sweep to avoid PLAN.md churn.

### Solution shape

Six discrete edits, applied in one Phase 2 pass. Each preserves the spec contract — this is prose tightening, not behavioral change.

### Files to touch (preliminary survey — drift-check at promotion)

- `SPEC.md` (six sites, see below)
- `SPEC.md` `**Version:**` header — patch bump (clarification only)

### The six trim sites

| # | Section | Lines (approx) | Action | ~Savings |
|---|---|---|---|---|
| 1 | §Epic lifecycle | 74-131 | Collapse worked-example block + tighten audit-follow-ups Few/Many branches + drop apply/skip prose pair (replace with "apply judgment") | ~330w |
| 2 | §Long-description conventions | 167-202 | Drop "matches the wikilink style introduced in §Tasknote body shape — adopting projects with markdown-vault tooling get cross-references for free" framing paragraph; tighten wikilink-only justification + carve-out prose | ~80-100w |
| 3 | §Tasknote frontmatter / §Tasknote body shape / §Model field | 232-238, 349-351, 608-609 | Consolidate three variants of the "archived tasknotes are write-once" / "Pre-v0.2.0 retired field" policy into one canonical statement near the top of SPEC; cite from each section | ~30-50w + drift-resilience |
| 4 | §Starter tasknotes | 296-298 | Drop "Starters are filed selectively..." paragraph that duplicates §"When to use a tasknote" filing rules | ~30w |
| 5 | §The 4-phase workflow Phase 1 prose | 368-380 | Compress the Re-scope / De-scope / drift detail to cite §"Blocked tasks" instead of restating | ~80w |
| 6 | §Blocked tasks Viz interaction | 503-513 | Compress to one sentence: "Adopting projects' tools render `Blocked by [[ID]]` and tasknote `status: blocked` as independent signals; either, both, or neither may show on a row." | ~50w |

### Decisions locked

- Patch version bump (clarification only — no contract change, no field changes, no parser changes).
- Adopting projects need no migration; the trim is additive in the sense that nothing they rely on is removed.

### Explicitly out of scope

- Skill changes ([[CORE-038]] covers skill cite-don't-restate)
- Template changes (template content is load-bearing per audit findings)
- Behavioral changes to any phase or convention (this is prose tightening only)

### Estimated savings

~600-700 words off every `/task` invocation (≈14-16% of SPEC.md).

### Open at promotion (Phase 1 should resolve)

- Site #3 (write-once policy consolidation) — where exactly does the canonical statement live? Top of SPEC §"Tasknote frontmatter"? A new top-level note? Lean: top of §"Tasknote frontmatter" with a back-reference from the other two sections.
- Should the §Versioning section also be reviewed for trim? Not on the audit's list but adjacent.
- Each site's word count is an estimate; verify post-edit total and update the SPEC version-bump line accordingly.

### Related

- [[CORE-037]] — audit that filed this task
- [[CORE-038]] — parallel skill trim (sibling task; prefer running this *before* CORE-038 so the citations CORE-038 makes point at the post-trim SPEC)
- [[CORE-040]] — PLAN.md filing discipline (sibling task; touches different SPEC sections — §"When to use a tasknote" / §"Starter tasknotes")
