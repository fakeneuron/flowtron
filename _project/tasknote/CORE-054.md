---
title: expand shipped skills
status: starter
tags: []
created: 2026-05-09
related-tasks: [CORE-049]
---

# CORE-054 | expand shipped skills

[← PLAN.md](../PLAN.md) · 🌱 Starter (filed 2026-05-09)

## 🌱 Starter context

_Captured 2026-05-09 during post-CORE-053 retrospective — promote to full tasknote at `/task` checkout._

### Why this exists

Flowtron currently ships 4 skills (`task`, `starter-task`, `micro-task`, `new-project`). Adopter workflows almost certainly have repetitive patterns that warrant additional shipped skills, but no systematic survey has been done. Mirror [[CORE-049]]'s audit-then-cohort model: survey candidates with rationale, walk with user, file approved children, implement.

### Solution shape (preliminary — survey at promotion)

Phase 1 = candidate survey. Examples to evaluate:

- **`/release` or `/bump-flowtron`** — automate flowtron submodule bumps in adopter projects: read tag annotation, walk migration steps from the per-release tasknote, scaffold a CORE task. Currently `docs/MIGRATION.md` §3 is manual.
- **`/audit-skill`** — formalize CORE-049's workflow-token-audit pattern as a reusable kickoff. Surface inventory + ranked candidates + cohort filing.
- **`/epic-discovery`** — first-subtask scaffolder for code-sweep epics (`<AREA>-<N>.1`). Formalize the Discovery pattern that today is informal SPEC convention.
- **`/close-epic`** — final-subtask audit scaffolder (highest `.N`). Formalize the closing Audit pattern.
- **`/file-followup`** — mid-flow lightweight follow-up filing while inside a tasknote. Lighter than `/starter-task`; outputs a single PLAN.md line + brief context note.
- **(probably out of scope)** — viz-specific skills, project-domain skills (those belong in adopter projects, not flowtron core).

Phase 2 = walk candidates with user, drop / approve / re-prioritize. Phase 3 = file approved as children of this task (single CORE-EPIC if ≥3 land, or individual tasks if fewer).

### Files to touch (preliminary survey — drift-check at promotion)

Per child skill:

- `claude/skills/<new>/SKILL.md` — skill body
- `claude/commands/<new>.md` — slash command stub
- `templates/<scaffold-target>.md` — if the skill scaffolds anything new
- `claude/CLAUDE-snippet.md` — only if the skill becomes adopter-facing surface
- `docs/MIGRATION.md` §1.2 — symlink wiring (if auto-installed alongside `/task`)
- `claude/skills/new-project/` — install logic (if auto-wired during fresh adoption)
- `SPEC.md` or `SPEC/<module>.md` — only if the skill introduces new contract concepts

### Explicitly out of scope

- Project-domain skills (those belong in adopter `~/code/<project>/.claude/skills/`, not in flowtron's shipped core).
- Replacing existing 4 skills — this task is purely additive.
- Skill-runtime improvements (lazy-load, etc.) — separate concern.

### Decisions locked in this conversation

| Decision | Choice | Rationale |
|---|---|---|
| Filing shape | Starter (this file) | Pre-research/survey value worth capturing; promote when ready to walk candidates |
| Audit model | Mirror [[CORE-049]] | Survey → ranked candidates → user walk → cohort filing → child implementation |
| Multi-child shape | Decide at Phase 1 (epic vs individual tasks) | Depends on how many candidates clear the bar |
| Model | opus | Survey + design judgment across multiple skill candidates |

### Open at promotion (Phase 1 should resolve)

- **Candidate set:** which of the sketched skills clear the worth-shipping bar? Are there missing candidates? (Lean: walk all six sketches; user picks.)
- **Cohort shape:** epic with `.1` Discovery + child skill tasks, vs individual `/task` entries. (Lean: epic if ≥3 approved; individual otherwise.)
- **Auto-wiring:** new skills auto-symlink during `/new-project` (like `/task` etc.), or opt-in per skill? (Lean: auto-wire by default for adopter ergonomics.)
- **Version bump:** new skills are minor (additive contract surface for adopter `.claude/`). Confirm at closure.

### Related

- [[CORE-049]] — workflow token audit (precedent: survey-then-cohort filing model).
