---
name: ft-audit-docs
description: Documentation-focused audit — 5 passes (Claims vs. code · Cross-doc consistency · Cross-references · Currency · Stale content), capped findings, writes tickets to `.flowtron/PLAN.md`. Stack-neutral scaffold; adopters fork into `.claude/skills/audit-docs/` and customize doc set + verification commands. See `docs/MIGRATION.md` §1.2.1.
---

# audit-docs — flowtron documentation audit skill

Principal-engineer audit of the docs surface: find what matters, report concisely, **make no changes without explicit confirmation**.

Stack-neutral scaffold — **fork**, don't symlink (doc-set + link conventions + lint tooling diverge). Install per `docs/MIGRATION.md` §1.2.1.



## 1. Scope & ground rules (do this first, always)

1. **Resolve scope** from `$ARGUMENTS`: `all`/empty → `<default doc-set glob>` _(forker: set this)_; a path/glob → just that; `last-commit` → markdown files in `HEAD`; `staged` → markdown files in `git diff --cached`; `ai-referenced` → walk `.flowtron/tasknote/README.md` §"AI-referenced docs". If ambiguous, **stop and ask** via `AskUserQuestion`.
2. **Load the project rubric** (contracts the docs must reflect, not generic good writing):
   - `<rubric file 1>` — _(forker: e.g. `.flowtron/tasknote/README.md` §"AI-referenced docs" — canonical doc-set contract)_
   - `<rubric file 2>` — _(forker: e.g. `README.md` — public-facing first impression)_
   - `<rubric file 3>` — _(forker: e.g. `docs/ARCHITECTURE.md` — design source-of-truth)_
3. **Run verification gates** so passes don't report toolchain noise:
   ```sh
   <markdown lint if any>
   <link-check if any>
   ```
   Failures become Medium findings in pass 2. Skip entirely if no doc tooling is configured.
4. If anything's unclear, stop and ask. Don't guess intent.

## 2. The 5 passes (in order)

Run in this exact order. **Cap each pass at 5 findings max.** If a pass has more, keep the top 5 by severity and note the tail count (`+3 more Low omitted`).

1. **Claims vs. code** — prose asserts behavior, file paths, exports, commands, or APIs that the codebase no longer provides. Examples: README says "run `npm start`" but the script was removed; docstring claims behavior the function no longer has; in-tree SKILL.md file-tree out of sync with disk; ADR describes a pattern the code abandoned. _(forker: add project-specific examples — e.g. "OpenAPI annotations vs. actual route signatures", "config-file comments vs. how the code reads each field")_
2. **Cross-doc consistency** — the same fact stated differently in two places. Examples: version pin in `README.md` vs. `package.json` vs. `docs/MIGRATION.md`; command syntax in `CLAUDE.md` differs from `docs/`; port number in one doc disagrees with another; key term ("session" vs. "session token") used inconsistently. _(forker: add your project's known fact-duplication hotspots)_
3. **Cross-references** — broken links and lost navigability. Examples: relative `[link](path)` whose target doesn't exist; `[[wikilink]]` whose target isn't a real task / file / heading; dangling section anchors (`#some-section` after a heading rename); orphan doc no other doc links to (likely indexable but unreachable). _(forker: add your project's link conventions — Obsidian wikilinks, Foam, plain relative, etc.)_
4. **Currency** — stale time-locked content and version pins. Examples: "as of YYYY-MM-DD" dates predating the current quarter; "today's set" lists that no longer match reality; pinned versions (`v1.2.3`) for tools / deps the project has since bumped; copyright year; "next release" / "upcoming" sections that already shipped. _(forker: add your project's version-pinning patterns — submodule pins, lockfiles, docs-with-version-strings)_
5. **Stale content** — content describing a state the project has moved past. Examples: section describing pre-refactor architecture; TODO stubs predating the current phase; "legacy" sections that should move to a historical archive or be deleted; commented-out doc blocks; deprecated patterns still in tutorials.

## 3. Finding format (use exactly this)

```text
**Finding #[N] – [Critical|High|Medium|Low] – [Pass # / Category]**
- Location: `path/to/file.md:LINE` (or section heading)
- Issue: one sentence
- Why it matters: brief — tie to user-facing accuracy / adopter-misleading risk / maintenance cost
- Recommended fix: concrete suggestion or ≤5-line snippet
```

Severity guide:
- **Critical** — security-relevant doc lying (e.g. doc says "TLS enforced" but it isn't), adopter-misleading instruction that breaks installs, broken canonical cross-link integrity (referenced spec / contract doesn't resolve).
- **High** — doc that misleads on a user-visible behavior; install or usage step that fails as written; missing-doc gap for a shipped feature.
- **Medium** — cross-doc inconsistency, stale version pin, dead link inside the doc set.
- **Low** — nit, formatting drift, minor word-choice inconsistency.

## 4. Required closing sections (always, in order)

1. **Summary** — health score 1–10 with one-sentence justification + top 3 issues (by severity, not pass order).
2. **Exploratory Insights** — what the findings reveal about how the documentation evolved. Patterns, not individual issues (e.g. "five claims-vs-code findings cluster around the CLI section — suggests the CLI changed without a doc-sweep").
3. **Proposed tasks for `.flowtron/PLAN.md`** — prioritized, actionable tickets using flowtron's task-line grammar. One ticket per thematic cluster, not per finding. Present them inline so the user can review before anything is written to disk.
4. **Questions for the user** — anything ambiguous that blocks implementation. Use `AskUserQuestion` for these, not prose.

## 5. Write the proposed tasks into `.flowtron/PLAN.md` (required, not optional)

The deliverable is tickets in PLAN.md.

1. **After** §§1–3 are presented and any `AskUserQuestion` blockers are answered, write tickets using flowtron's task-line grammar: `- [ ] **<AREA>-<N>** [model] | shortname — long description.` (primary labels `[heavy]🧠` / `[light]🔧` recommended; specifics e.g. `opus` / `sonnet` / `grok` remain valid per SPEC §"Model field"). See §"Task-line format".
2. Pick the next free `<N>` per area prefix (valid prefixes in `.flowtron/tasknote/README.md` §"Area prefixes").
3. Insert in correct priority section. Append `Surfaced by audit-docs YYYY-MM-DD (Finding #N, <severity>)`.
4. **No direct edits to audited docs.** Tickets only — edits happen in `/ft-task` cycles.
5. User pushes back on a ticket → drop it.

Zero findings across all passes → say so explicitly and skip the write.

## 6. Hard rules

- **Targeted, not exhaustive.** Five findings per pass is a *ceiling*, not a target. A clean pass gets zero findings and moves on.
- **Write tickets, not fixes.** `.flowtron/PLAN.md` gets updated; source docs do NOT. Do not open files in edit mode for fixes; do not run formatters; do not "fix while I'm in here."
- **Don't audit code, audit the docs about the code.** If the docs are accurate but the code is wrong, that's a code finding — out of scope here. Use `/ft-audit` or `/ft-audit-backend` etc. for that.
- **Archived tasknotes are write-once.** Skip `.flowtron/tasknote/archive/` entirely — those are historical records, not living docs.
- **Subroutine-safe.** This skill is designed to be invoked from other skills (notably `/ft-release`'s doc-drift sweep). When invoked as a subroutine with an explicit scope, skip §0 forker prompts and surface the report inline rather than blocking on `AskUserQuestion` for non-blocker items.
- **No final summary of what you just did.** The report + the `.flowtron/PLAN.md` diff *are* the deliverable.
