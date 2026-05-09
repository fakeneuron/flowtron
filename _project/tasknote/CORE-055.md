---
title: CLAUDE-snippet review against current Claude Code best-practices
status: starter
tags: []
created: 2026-05-09
related-tasks: [CORE-047]
---

# CORE-055 | CLAUDE-snippet review against current Claude Code best-practices

[← PLAN.md](../PLAN.md) · 🌱 Starter (filed 2026-05-09)

## 🌱 Starter context

_Captured 2026-05-09 during post-CORE-053 retrospective — promote to full tasknote at `/task` checkout._

### Why this exists

`claude/CLAUDE-snippet.md` is the adopter-facing block pasted into project CLAUDE.md files (`docs/MIGRATION.md` §1.3). It defines the assistant-facing surface for every project that adopts flowtron. Currently 55 lines. The adopter community (X / Twitter posts, Claude Engineer repo, Anthropic official guidance) has evolved best-practices for Claude Code coding setup since the snippet was last revised — review whether flowtron's snippet incorporates current best-practices and revise.

This is **adopter-leverage work**: a single snippet revision propagates to every flowtron-adopting project's next bump. High impact for low effort if there are clear gaps.

### Solution shape (preliminary — research scope locks at promotion)

Three-phase research → analysis → revise:

1. **Research:** survey external sources for current Claude-Code-coding best-practices.
   - X / Twitter posts (search "Claude Code CLAUDE.md", "Claude Code setup", relevant authors)
   - **Claude Engineer** — https://github.com/Doriandarko/claude-engineer (or current equivalent) — opinionated agent setup with reference patterns
   - **Anthropic official docs** — https://docs.claude.com/en/docs/claude-code/ — official guidance, prompt engineering patterns
   - Public CLAUDE.md examples from prominent OSS repos using Claude Code
   - Claude Code release notes for new feature surfaces (hooks, slash commands, MCP, permission modes) that should be referenced
2. **Gap analysis:** what does flowtron's snippet cover today? What new best-practices are missing? Distinguish flowtron-specific guidance (workflow contract, tasknote shape) from universal good-coding guidance (the latter belongs in adopter's own CLAUDE.md, not the snippet).
3. **Revise:** trim restatements that duplicate SPEC.md or universal guidance; add missing best-practices that benefit every adopter; preserve flowtron-specific contract surface.

### Files to touch (preliminary survey — drift-check at promotion)

- `claude/CLAUDE-snippet.md` — primary target
- `docs/MIGRATION.md` §1.3 — points adopters at the snippet (no change unless snippet structure changes meaningfully)
- `templates/PLAN.md` and `templates/tasknote-README.md` — only if the snippet revision references them differently
- Possibly cross-references in `README.md` / `docs/PHILOSOPHY.md`

### Explicitly out of scope

- The user's personal `~/.claude/CLAUDE.md` and `~/code/CLAUDE.md` — those are the adopter's own surface, not flowtron's
- Skill SKILL.md fragments — separate concern (CORE-049-style audits cover those)
- New shipped skills — covered by [[CORE-054]]

### Decisions locked in this conversation

| Decision | Choice | Rationale |
|---|---|---|
| Filing shape | Starter (this file) | Pre-research/source-survey value worth capturing; promote when ready |
| Research scope | External (X, Claude Engineer, Anthropic docs) + internal gap analysis | User explicitly named X posts + Claude Engineer in conversation |
| Boundary | Universal good-coding guidance stays in adopter's own CLAUDE.md, not flowtron's snippet | Avoids snippet bloat; keeps flowtron's contract focused |
| Model | opus | Research synthesis + revision judgment across multiple sources |

### Open at promotion (Phase 1 should resolve)

- **Source list:** confirm concrete URLs / handles to research. (Lean: Anthropic official docs first, then Claude Engineer repo, then a focused X search; cap research time.)
- **Revision shape:** in-place trim/add vs. full rewrite. (Lean: in-place — preserve existing structure, surgical changes only.)
- **Version bump:** minor (contract change for adopters' CLAUDE.md content) or patch (prose refinements only)? Depends on revision depth.
- **Adopter migration:** if the snippet structure changes meaningfully, do existing adopters need migration guidance? (Lean: yes if structure changes; document in tag annotation.)

### Related

- [[CORE-047]] — doc-drift contract (precedent: extending adopter-facing surface contracts).
