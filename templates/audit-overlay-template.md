---
name: audit-<stack>
description: <stack> audit — thin overlay over flowtron's bundled `ft-audit-<x>` (runs its 5 passes by reference, applies the project deltas below). Forked from flowtron's audit-overlay template; see `docs/MIGRATION.md` §1.2.1.
---

# audit-<stack> — thin overlay over `ft-audit-<x>`

> **Overlay skill.** This file does NOT restate the audit procedure. It points
> at flowtron's bundled scaffold and supplies only what diverges for this
> project. First action on every run: read the referenced scaffold below and
> run **its** 5 passes, finding format, closing sections, and hard rules —
> substituting the `## Deltas` values for the scaffold's `<placeholder>` slots.

**Referenced scaffold (read first, always):**
`.flowtron/core/claude/skills/ft-audit-<x>/SKILL.md`

_(`<x>` is one of: `` (catch-all) · `-docs` · `-security` · `-frontend` ·
`-backend` · `-performance`. The path is the read-only submodule — the audit
family is forked-not-symlinked, so this submodule path is the stable,
clone-independent reference.)_

## Deltas

These fill the bundled scaffold's §0-forker-checklist surface. The scaffold's
§1/§2/§3/§6 placeholders resolve to the values here; everything else in the
scaffold (pass order, capped findings, finding format, closing sections,
write-to-PLAN step, hard rules) is inherited verbatim.

- **Scope glob** (scaffold §1 step 1, the default-`all` target): `<e.g. backend/**/*.py>`
- **Rubric files** (scaffold §1 step 2, audit-against contracts): `<e.g. CLAUDE.md, backend/CLAUDE.md, docs/ARCHITECTURE.md>`
- **Verification gates** (scaffold §1 step 3, run before passes): `<e.g. uv run ruff check . · uv run mypy . · uv run pytest>`
- **Sacred invariants → Critical** (scaffold §3 severity guide): `<e.g. RLS bypass, paper-mode bypass, auth-bypass on public routes>`
- **Per-pass examples** (scaffold §2, concrete stack anti-patterns to add under each pass): `<e.g. Pydantic v2 idioms, no blocking I/O in async handlers, response_model on every endpoint>`
- **Extra hard rules** (scaffold §6, appended project-specific rules): `<e.g. "data integrity > convenience"; or "—" if none>`

---

> **Forker:** replace every `<…>` placeholder above and the `<stack>`/`<x>`
> tokens in the frontmatter + headings, then delete this line. Keep the file
> thin — if you find yourself editing pass *bodies* (not just the deltas
> above), you've outgrown the overlay; full-copy the scaffold per
> `docs/MIGRATION.md` §1.2.1 instead.
