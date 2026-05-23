---
name: ft-audit-docs
description: Documentation-drift audit of flowtron's AI-referenced doc set — 5 passes (Claims vs. code · Cross-doc consistency · Cross-references · Currency · Stale content) across the AI-referenced docs set (default) or any path/glob ($ARGUMENTS). Capped at 5 findings/pass. Invoked standalone or as a subroutine by `/ft-release` §7.1. Forked from `claude/skills/ft-audit-docs/SKILL.md` per `docs/MIGRATION.md` §1.2.1.
---

# audit-docs — flowtron-self doc-drift audit

You are a principal engineer doing a **targeted, high-impact** audit of flowtron's documentation surface. Default behavior: find what matters, report concisely, **make no changes without explicit confirmation**.

This SKILL.md is a fork of the stack-neutral scaffold at `claude/skills/ft-audit-docs/SKILL.md`, customized for flowtron's own doc set per the §1.2.1 fork-not-symlink contract. The fork is yours — flowtron version bumps do not touch it.

## Invocation modes

- **Standalone** (`/ft-audit-docs [scope]`) — present the full report (Summary, Exploratory Insights, Proposed tasks, Questions) and write tickets into `_project/PLAN.md` per §5.
- **Subroutine** (called by `/ft-release` §7.1) — receive an explicit scope from the caller, present the report inline (no `AskUserQuestion` for non-blockers), surface drift back to `/ft-release` for inline fix-up rather than filing tickets. Skip §5 in this mode.

## 1. Scope & ground rules (do this first, always)

1. **Resolve scope** from `$ARGUMENTS`:
   - `all` or empty → the AI-referenced docs set declared in `_project/tasknote/README.md` §"AI-referenced docs":
     ```text
     README.md
     SPEC.md
     docs/MIGRATION.md
     claude/AGENTS-snippet.md
     docs/CONVENTIONS.md
     CONTRIBUTING.md
     SECURITY.md
     docs/AGENT-NEUTRALITY.md
     docs/PLATFORMS.md
     ```
   - `broad` → the full markdown contract surface (matches the broader `/ft-audit` skill's scope):
     ```text
     SPEC.md
     SPEC/**/*.md
     claude/skills/**/*.md
     claude/commands/**/*.md
     claude/AGENTS-snippet.md
     docs/**/*.md
     templates/**/*.md
     README.md
     CONTRIBUTING.md
     ```
   - a path or glob → just that
   - `last-commit` → markdown files touched in `HEAD`
   - `staged` → markdown files in `git diff --cached`
   - Excluded by design: `_project/tasknote/archive/` (write-once historical records), `legacy/`, `viz/` (own audit story).
2. **Load the project rubric** — these are the doc contracts to audit against:
   - `_project/tasknote/README.md` §"AI-referenced docs" — canonical doc-set contract; the nine files flowtron promises to keep in sync.
   - `SPEC.md` — workflow contract; primary AI cold-start surface.
   - `docs/MIGRATION.md` — adopter-facing contract; the example version pin near §1.1 is the doc-side mirror of the current `SPEC.md:3` version.
   - `README.md` — public-facing first impression.
   - `claude/AGENTS-snippet.md` — adopter paste-block; symlink-wiring and `AGENTS.md` snippet single-source-of-truth.
3. **Run verification gates**:
   ```sh
   # Wikilink integrity — any [[ID]] must resolve to a real PLAN.md entry (active or completed)
   grep -rnoE '\[\[([A-Z]+-(EPIC-)?[0-9]+(\.[0-9]+)?)\]\]' SPEC.md SPEC/ claude/ docs/ README.md templates/

   # Frontmatter shape parity — SKILL.md files should use `name:` + `description:` only
   grep -nE '^(when_to_use|argument-hint|disable-model-invocation):' claude/skills/*/SKILL.md
   ```
   Broken wikilinks become **Critical** findings in pass 3 (canonical-doc cross-link integrity is sacred). Frontmatter-shape violations become **Medium** findings in pass 1.
4. **If something is unclear, stop and ask now.** Do not guess intent.

## 2. The 5 passes (in order)

Run in this exact order. **Cap each pass at 5 findings max.** If a pass has more, keep the top 5 by severity and note the tail count (`+3 more Low omitted`).

1. **Claims vs. code** — prose asserts behavior, file paths, exports, commands, or skills that the codebase no longer provides. Flowtron-specific examples: README / SPEC claims about the bundled-skill roster that don't match `claude/skills/` on disk; `claude/AGENTS-snippet.md` symlink commands listing skills that aren't shipped; `docs/MIGRATION.md` `cp` / `ln -s` commands referencing non-existent paths; in-tree SKILL.md file-tree references out of sync with disk; `_project/tasknote/README.md` "AI-referenced docs" listing files that don't exist.
2. **Cross-doc consistency** — the same fact stated differently across the doc set. Flowtron-specific examples: `SPEC.md:3` version pin vs. `docs/MIGRATION.md` example version pin (the `(e.g., vX.Y.Z)` line near §1.1); bundled-skill roster in `claude/skills/ft-flowtron/SKILL.md` vs. counts cited in `docs/MIGRATION.md` §1.2 (e.g. "six slash commands"); symlink-wiring block in `claude/AGENTS-snippet.md` vs. install instructions in `docs/MIGRATION.md`; area-prefix set in `SPEC.md` §"Task ID convention" vs. `_project/tasknote/README.md` §"Area prefixes".
3. **Cross-references & navigation** — broken links and lost navigability. Examples: relative `[link](path)` whose target doesn't exist; `[[wikilink]]` whose target isn't a real task in `_project/PLAN.md` (active or completed); dangling section anchors after a heading rename in SPEC.md or MIGRATION.md; doc with no inbound link (orphan, likely indexed but unreachable). Wikilink integrity gate output from §1 step 3 lands here.
4. **Currency & version pins** — stale time-locked content. Examples: `SPEC.md:3` `**Version:**` doesn't match `git describe --tags --abbrev=0`; `docs/MIGRATION.md` example pin `(e.g., vX.Y.Z)` lags behind SPEC version; "Today's date is YYYY-MM-DD" lines that have drifted; `_project/PLAN.md` `## Completed` ordering broken; release tasknote `Completed YYYY-MM-DD` ordering vs. file mtime.
5. **Stale / archived content** — content describing a state flowtron has moved past. Examples: section describing pre-CORE-042 SPEC modularization in a doc that should reference current SPEC/*.md modules; TODO stubs in docs predating the current phase; "legacy" sections that belong in `legacy/` or should be deleted; commented-out doc blocks; deprecated patterns in templates that don't match the latest tasknote-template.md.

## 3. Finding format (use exactly this)

```text
**Finding #[N] – [Critical|High|Medium|Low] – [Pass # / Category]**
- Location: `path/to/file.md:LINE` (or section heading)
- Issue: one sentence
- Why it matters: brief — tie to adopter-misleading risk / canonical-contract integrity / maintenance cost
- Recommended fix: concrete suggestion or ≤5-line snippet
```

Severity guide:
- **Critical** — canonical-doc cross-link integrity broken ([[wikilink]] doesn't resolve); SPEC version pin doesn't match git tag; install instruction in MIGRATION.md fails as written; bundled-skill roster claim doesn't match disk.
- **High** — doc misleading on adopter-visible behavior; missing doc for a shipped skill; cross-doc inconsistency on a fact adopters consume directly (port mappings, symlink commands, paste-block content).
- **Medium** — internal cross-doc inconsistency that adopters don't consume directly; stale example pin lag-behind; frontmatter-shape violations.
- **Low** — formatting drift, word-choice inconsistency, nit.

## 4. Required closing sections (always, in order)

1. **Summary** — health score 1–10 with one-sentence justification + top 3 issues (by severity, not pass order).
2. **Exploratory Insights** — what the findings reveal about how flowtron's docs evolved. Patterns, not individual issues.
3. **Proposed tasks for `_project/PLAN.md`** — prioritized, actionable tickets using flowtron's task-line grammar. One ticket per thematic cluster, not per finding. Present them inline so the user can review before anything is written to disk.
4. **Questions for the user** — anything ambiguous that blocks implementation. Use `AskUserQuestion`, not prose.

**Subroutine mode (called by `/ft-release`):** skip ticket writing entirely. Instead, surface the report and any "fix now during release cut" recommendations back to the caller for inline handling in release Phase 2 / 7.1. The release skill decides whether to absorb the fix into the current cut or file followups.

## 5. Write the proposed tasks into `_project/PLAN.md` (standalone mode only)

Skip this entire section when invoked as a subroutine by `/ft-release`.

1. **After** sections 1–3 are presented, and **after** the user responds to any `AskUserQuestion` blockers, write tickets into `_project/PLAN.md` using flowtron's task-line grammar: `- [ ] **<AREA>-<N>** [opus|sonnet] | shortname — long description.` See `SPEC.md` §"Task-line format".
2. Pick the next free `<N>` per area prefix. Valid prefixes for flowtron are listed in `_project/tasknote/README.md` §"Area prefixes".
3. Insert tickets in the correct priority section. Add a `Surfaced by audit-docs YYYY-MM-DD (Finding #N, <severity>)` parenthetical.
4. Do **not** edit the audited docs directly.
5. If the user pushes back on a proposed ticket during review, drop it from the write.

If every pass returned zero findings, say so explicitly and skip the write.

## 6. Hard rules

- **Targeted, not exhaustive.** Five findings per pass is a *ceiling*, not a target.
- **Write tickets, not fixes** (standalone mode). Source docs do NOT get edited.
- **Subroutine mode skips ticket writing.** `/ft-release` is the orchestrator — it decides which findings to fix in the current cut.
- **Archived tasknotes are write-once.** Skip `_project/tasknote/archive/` entirely.
- **Wikilink integrity is sacred.** A broken `[[ID]]` is Critical regardless of how minor the surrounding context seems.
- **No final summary of what you just did.** The report (and the `_project/PLAN.md` diff in standalone mode) *is* the deliverable.
