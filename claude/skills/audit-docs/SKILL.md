---
name: audit-docs
description: Documentation-focused audit — 5 passes (Claims vs. code · Cross-doc consistency · Cross-references · Currency · Stale content), capped findings, writes tickets to `_project/PLAN.md`. Stack-neutral scaffold; adopters fork into `.claude/skills/audit-docs/` and customize doc set + verification commands. See `docs/MIGRATION.md` §1.2.1.
---

# audit-docs — flowtron documentation audit skill

You are a principal engineer doing a **targeted, high-impact** audit of a project's documentation surface. Default behavior: find what matters, report concisely, **make no changes without explicit confirmation**.

This skill ships in flowtron as a **stack-neutral scaffold**. It is meant to be **forked** (copied) into the adopting project's `.claude/skills/audit-docs/` and customized — not symlinked. Per-project divergence in doc set, link conventions, and lint tooling is the reason; see `docs/MIGRATION.md` §1.2.1 for the install workflow.

## 0. Forker checklist (fill in before first run)

Walk this list once per fork. The placeholders in §1 and §2 below are the things to replace.

- [ ] `name:` and `description:` frontmatter — set to your fork's slash-command name and a project-specific blurb.
- [ ] §1 step 1 "Resolve scope" — set the default doc set for your project (typically: `README.md`, `_project/PLAN.md`, `docs/**/*.md`, root-level `*.md`, plus any in-tree SKILL / AGENT / ADR docs).
- [ ] §1 step 2 "Load the project rubric" — replace placeholder rubric paths with your project's actual doc-set contract (typically `_project/tasknote/README.md` §"AI-referenced docs" if the project uses flowtron, otherwise a single source-of-truth doc).
- [ ] §1 step 3 "Run verification gates" — replace placeholders with your project's markdown lint / link-check / spelling commands if you have them. Skip if you don't — `audit-docs` works without tooling.
- [ ] §2 each pass — replace generic-placeholder bullets with your project's concrete examples (specific docs that drift, link conventions you use, naming and versioning patterns).

Once the checklist is satisfied, delete this §0 block from your fork.

## 1. Scope & ground rules (do this first, always)

1. **Resolve scope** from `$ARGUMENTS`:
   - `all` or empty → `<default doc-set glob for your project>` _(forker: set this)_
   - a path or glob → just that
   - `last-commit` → markdown files touched in `HEAD`
   - `staged` → markdown files in `git diff --cached`
   - `ai-referenced` → walk the entries in `_project/tasknote/README.md` §"AI-referenced docs" (flowtron projects)
   - If ambiguous, **stop and ask** via `AskUserQuestion` before reading anything.
2. **Load the project rubric** — these are the contracts the docs must reflect, not generic "good writing":
   - `<rubric file 1>` — _(forker: e.g. `_project/tasknote/README.md` §"AI-referenced docs" — the canonical doc-set contract)_
   - `<rubric file 2>` — _(forker: e.g. `README.md` — the public-facing first-impression doc)_
   - `<rubric file 3>` — _(forker: e.g. `docs/ARCHITECTURE.md` — design source-of-truth)_
3. **Run verification gates** so passes 1–2 don't report noise the toolchain catches:
   ```sh
   <markdown lint command if any>
   <link-check command if any>
   ```
   Note failures — they become Medium findings in pass 2, not separate noise. Skip this step entirely if no doc tooling is configured.
4. **If something is unclear, stop and ask now.** Do not guess intent.

## 2. The 5 passes (in order)

Run in this exact order. **Cap each pass at 5 findings max.** If a pass has more, keep the top 5 by severity and note the tail count (`+3 more Low omitted`).

1. **Claims vs. code** — prose asserts behavior, file paths, exports, commands, or APIs that the codebase no longer provides. Examples: README says "run `npm start`" but the script was removed; docstring claims behavior the function no longer has; in-tree SKILL.md file-tree out of sync with disk; ADR describes a pattern the code abandoned. _(forker: add project-specific examples — e.g. "OpenAPI annotations vs. actual route signatures", "config-file comments vs. how the code reads each field")_
2. **Cross-doc consistency** — the same fact stated differently in two places. Examples: version pin in `README.md` vs. `package.json` vs. `docs/MIGRATION.md`; command syntax in `CLAUDE.md` differs from `docs/`; port number in one doc disagrees with another; key term ("session" vs. "session token") used inconsistently. _(forker: add your project's known fact-duplication hotspots)_
3. **Cross-references & navigation** — broken links and lost navigability. Examples: relative `[link](path)` whose target doesn't exist; `[[wikilink]]` whose target isn't a real task / file / heading; dangling section anchors (`#some-section` after a heading rename); orphan doc no other doc links to (likely indexable but unreachable). _(forker: add your project's link conventions — Obsidian wikilinks, Foam, plain relative, etc.)_
4. **Currency & version pins** — stale time-locked content. Examples: "as of YYYY-MM-DD" dates predating the current quarter; "today's set" lists that no longer match reality; pinned versions (`v1.2.3`) for tools / deps the project has since bumped; copyright year; "next release" / "upcoming" sections that already shipped. _(forker: add your project's version-pinning patterns — submodule pins, lockfiles, docs-with-version-strings)_
5. **Stale / archived content** — content describing a state the project has moved past. Examples: section describing pre-refactor architecture; TODO stubs predating the current phase; "legacy" sections that should move to a historical archive or be deleted; commented-out doc blocks; deprecated patterns still in tutorials.

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
3. **Proposed tasks for `_project/PLAN.md`** — prioritized, actionable tickets using flowtron's task-line grammar. One ticket per thematic cluster, not per finding. Present them inline so the user can review before anything is written to disk.
4. **Questions for the user** — anything ambiguous that blocks implementation. Use `AskUserQuestion` for these, not prose.

## 5. Write the proposed tasks into `_project/PLAN.md` (required step, not optional)

The audit is not done until the proposed tickets land in `_project/PLAN.md`. This is the deliverable.

1. **After** sections 1–3 are presented, and **after** the user responds to any `AskUserQuestion` blockers, write tickets into `_project/PLAN.md` using flowtron's task-line grammar: `- [ ] **<AREA>-<N>** [opus|sonnet] | shortname — long description.` See `_project/flowtron/SPEC.md` §"Task-line format" (or `SPEC.md` §"Task-line format" if this skill is forked into flowtron-self).
2. Pick the next free `<N>` per area prefix. Valid prefixes for this project are listed in `_project/tasknote/README.md` §"Area prefixes".
3. Insert tickets in the correct priority section. Add a `Surfaced by audit-docs YYYY-MM-DD (Finding #N, <severity>)` parenthetical to each ticket's description so future-you can trace a ticket back to its origin.
4. Do **not** edit the audited docs directly. The audit writes tickets only — actual edits happen in separate task cycles via `/task`.
5. If the user pushes back on a proposed ticket during review, drop it from the write.

If every pass returned zero findings, say so explicitly and skip the write.

## 6. Hard rules

- **Targeted, not exhaustive.** Five findings per pass is a *ceiling*, not a target. A clean pass gets zero findings and moves on.
- **Write tickets, not fixes.** `_project/PLAN.md` gets updated; source docs do NOT. Do not open files in edit mode for fixes; do not run formatters; do not "fix while I'm in here."
- **Don't audit code, audit the docs about the code.** If the docs are accurate but the code is wrong, that's a code finding — out of scope here. Use `/audit` or `/audit-backend` etc. for that.
- **Archived tasknotes are write-once.** Skip `_project/tasknote/archive/` entirely — those are historical records, not living docs.
- **Subroutine-safe.** This skill is designed to be invoked from other skills (notably `/release`'s doc-drift sweep). When invoked as a subroutine with an explicit scope, skip §0 forker prompts and surface the report inline rather than blocking on `AskUserQuestion` for non-blocker items.
- **No final summary of what you just did.** The report + the `_project/PLAN.md` diff *are* the deliverable.
