---
title: task SKILL.md cite-don't-restate
status: starter
priority: Future Opportunities
area: core
tags: []
created: 2026-05-05
---

# CORE-038 | task SKILL.md cite-don't-restate

[← PLAN.md](../PLAN.md) · 🌱 Starter (filed 2026-05-05)

## 🌱 Starter context

_Captured 2026-05-05 during the [[CORE-037]] workflow token-cost audit. Filed initially as a long PLAN.md entry; converted to starter as part of [[CORE-040]] dogfood pass._

### Why this exists

`.claude/skills/task/SKILL.md` (~2,653w) loads on every `/task` invocation. The [[CORE-037]] audit found Steps 3b, 4, and 6 each restate procedural contracts that already exist canonically in SPEC.md — duplicate prose paying token cost on every load.

### Solution shape

Replace duplicated SPEC contracts with concise citations to the canonical sections. Keep the skill's own value-add (gating language, sequencing, conditional branches) intact.

### Files to touch (preliminary survey — drift-check at promotion)

- `.claude/skills/task/SKILL.md` Step 3b (lines 101-128, ~440w) — replace YAML frontmatter field-by-field semantics + body section-by-section semantics with a citation to SPEC §"Tasknote frontmatter" + §"Tasknote body shape" + a concise "fill these fields per SPEC" reference table
- `.claude/skills/task/SKILL.md` Step 4 (lines 140-154, ~290w) — replace Phase 1 checklist + Re-scope/De-scope/drift behavioral notes with citation to SPEC §"4-phase workflow" / §"Blocked tasks"
- `.claude/skills/task/SKILL.md` Step 6 (lines 164-178, ~200w) — replace post-closure 1-2-3 enumeration with citation to SPEC §"Post-closure protocol", keeping only the "one continuous flow / commit-go is the gate" guidance which is skill-specific

### Skill-specific value-add to preserve

- Step 6: "one continuous flow" framing + "commit-go is the only gate" sequencing — this is skill behavior, not SPEC contract
- Step 2: four-way file-state branch summary (`starter` / `blocked` / other / absent → 3a / 3c / stop / 3b) — this is skill orchestration, keep
- Step 1.5: model gate three-case branch — open question (see below)

### Explicitly out of scope

- SPEC.md prose changes ([[CORE-039]] covers that)
- Template changes
- `/starter-task` skill changes ([[CORE-040]] covers skill filing-time gating)
- `claude/commands/task.md` (thin pointer file, no substance)

### Estimated savings

~500-580 words off every `/task` invocation (≈19-22% of SKILL.md).

### Open at promotion (Phase 1 should resolve)

- Step 1.5 (model gate, ~270w) — also restates SPEC §"Model field" branches. Should it cite the SPEC section, or stay restated because it's a hot path? Lean: keep mostly-restated; the model gate runs before SPEC fully loads in some flows, and the cost of getting it wrong is high.
- Should the "fill these fields per SPEC" reference table in Step 3b enumerate the field names, or just point at the YAML frontmatter spec block?
- After the trim, does the skill still read coherently to a fresh agent, or do the citations require the agent to be already familiar with SPEC.md? Verify by simulating a fresh-context `/task` run.

### Related

- [[CORE-037]] — audit that filed this task
- [[CORE-039]] — parallel SPEC.md trim (sibling task)
- [[CORE-040]] — PLAN.md filing discipline + skill gating (sibling task)
