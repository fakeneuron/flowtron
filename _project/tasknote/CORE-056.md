---
title: repo conventions + tech-debt audit
status: starter
tags: []
created: 2026-05-09
related-tasks: [CORE-049, CORE-037]
---

# CORE-056 | repo conventions + tech-debt audit

[← PLAN.md](../PLAN.md) · 🌱 Starter (filed 2026-05-09)

## 🌱 Starter context

_Captured 2026-05-09 during post-CORE-053 retrospective — promote to full tasknote at `/task` checkout._

### Why this exists

Flowtron has accreted across 50+ tasks (CORE: 53 closed; FE: 16 closed). [[CORE-049]] audited the **token-cost axis** (workflow surfaces vs. AI context budget). This task audits the **conventions + tech-debt axis** (file naming, heading style, cross-references, code/template/SPEC/skill consistency, dead surfaces). Different axis from [[CORE-049]]; the two together cover the meta-quality picture.

The user explicitly framed this as "ensure we're adhering to conventions without too much technical debt while still optimizing the repo" — a coherence sweep, not a pure code-quality sweep.

### Solution shape (preliminary — inspection axes lock at promotion)

Mirror [[CORE-049]]'s audit-then-cohort model: survey → ranked findings → user walk → cohort filing → child fixes.

**Preliminary inspection axes:**

| # | Axis | Sample probes |
|---|---|---|
| 1 | File naming | hyphen vs underscore, casing, prefix consistency across `claude/skills/*`, `SPEC/*.md`, `templates/*.md` |
| 2 | Heading style | emoji + heading level patterns across SPEC.md, SKILL.md fragments, tasknotes, templates — drift? |
| 3 | Markdown formatting | code-fence languages, list shapes, table shapes, link-vs-cite styles, blank-line conventions |
| 4 | Cross-references | broken/stale links, orphan files, missing back-links, wikilink consistency in tasknotes |
| 5 | Templates | 4 template files (tasknote, starter, micro, README) + PLAN.md template — consistent shape, frontmatter parity, divider conventions? |
| 6 | SPEC modules | 5 lazy modules (`epic`, `starter`, `blocked`, `model`, `versioning`) — consistent prose style, similar sectioning, drift since each was filed? |
| 7 | Skill SKILL.md fragments | 4 skills × varying lazy fragments — consistent dispatch style, similar guards, similar verbosity? |
| 8 | Cross-doc restatements | beyond [[CORE-049]] — README.md vs PHILOSOPHY.md vs MIGRATION.md vs SPEC.md surfaces; non-token coherence |
| 9 | Dead surfaces | abandoned files, references to removed features, stale tag-message templates |
| 10 | viz/ code conventions | (out of scope here — covered by FE-018 code/token audit; flag boundary) |

### Files to touch (preliminary survey — drift-check at promotion)

Whole repo, scoped per finding. Likely heavy hitters:

- `SPEC.md` + `SPEC/*.md` (5 lazy modules)
- `claude/skills/*/SKILL.md` + lazy fragments
- `templates/*.md` (5 files)
- `docs/*.md` (PHILOSOPHY, MIGRATION)
- `README.md`
- `_project/tasknote/README.md` (template + flowtron's own)
- `claude/CLAUDE-snippet.md` (boundary with [[CORE-055]] — coordinate)

### Explicitly out of scope

- Token-cost axis (covered by [[CORE-049]] and follow-ups)
- viz/ code (covered by FE-018 code/token audit)
- CLAUDE-snippet best-practices (covered by [[CORE-055]] — separate concern)
- Skills expansion (covered by [[CORE-054]])

This task is the **convention/coherence axis**, distinct from the token, code, snippet, and skill-expansion concerns — they're parallel tracks.

### Decisions locked in this conversation

| Decision | Choice | Rationale |
|---|---|---|
| Filing shape | Starter (this file) | Pre-research/inspection-axis enumeration value worth capturing |
| Audit model | Mirror [[CORE-049]] | Survey → ranked findings → user walk → cohort filing |
| Axis distinction | Convention + coherence (not token cost, not code quality) | Different from [[CORE-049]] (token) and FE-018 (viz code) |
| Multi-child shape | Decide at Phase 1 (epic vs individual tasks) | Likely epic given likely finding-count |
| Model | opus | Cross-surface synthesis + judgment across many file types |

### Open at promotion (Phase 1 should resolve)

- **Inspection axes:** confirm/trim the 10 sketched axes. (Lean: walk all 10 at survey; user prioritizes.)
- **Cohort shape:** epic with `.1` Discovery + child fixes vs individual `/task` entries. (Lean: epic given likely finding-count and shared narrative.)
- **Boundaries with [[CORE-055]] and FE-018:** confirm what this task does NOT touch to avoid double-work.
- **Severity threshold:** what counts as "worth filing a follow-up" vs "noted but accepted as living-with"? Mirror [[CORE-049]]'s worth-trimming bar.

### Related

- [[CORE-049]] — workflow token audit (precedent: token-cost axis; this audits a different axis).
- [[CORE-037]] — original token-cost audit predecessor (reference for two-axis ranking model).
