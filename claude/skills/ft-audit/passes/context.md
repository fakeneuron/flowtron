# context — /ft-audit pass library

> Loaded by `SKILL.md` §1 step 1. Supplies the `context` domain's deltas; the
> dispatcher owns the shared procedure (arg grammar, caps, finding format,
> closing sections, PLAN write step, core hard rules).

Audits the project's AI-coding context surfaces — `CLAUDE.md`, `AGENTS.md`,
`.claude/commands/`, `.claude/skills/` — for size pressure, redundancy with
flowtron's `AGENTS.md` paste-block, `ft-*` namespace conflicts, and drift from
flowtron's lean-context principle (small, scannable, project-task-focused, no
scripts, no validators). The scope is fixed by definition, so this file carries
no forker placeholders: it runs unforked (`.flowtron/core/claude/skills/ft-audit/`
with `context` as the domain) without tripping the §1 step 3 bootstrap.

**Attribution slug:** `audit-context`

## Scope & rubric hints (→ dispatcher §1)

- **Default scope (`all`/empty):** `CLAUDE.md`, `AGENTS.md`, and a one-level-deep listing of `.claude/commands/` and `.claude/skills/` (filenames and dir names; read a `SKILL.md` body only when a pass needs it). A path token narrows to that file or directory. At least one of the four must exist — otherwise stop with a one-line "no AI-coding context surfaces here — nothing to audit" and skip every pass.
- **Extra scope tokens:** none.
- **Rubric slots** — resolved by **flowtron-mode**, determined once before pass 1:
  - **Adopter mode** — `.flowtron/core/` submodule exists. Paste-block reference: `.flowtron/core/claude/AGENTS-snippet.md` §"Block to paste into AGENTS.md" (the fenced markdown block). Bundled-name reference: `.flowtron/core/claude/skills/` and `.flowtron/core/claude/commands/`.
  - **Flowtron-self mode** — repo-root `SPEC.md` exists with heading `# Flowtron — Workflow Specification`. Paste-block reference: `claude/AGENTS-snippet.md`. Bundled-name reference: `claude/skills/` and `claude/commands/`.
  - **No flowtron** — neither resolves. Passes 2 and 3 have no reference to compare against: skip them, report zero findings for each, and say so in the Summary. Passes 1, 4, and 5 still run.
- **Verification gates:** none — no tooling audits context files. Pass 1 takes its own measurements (`wc -c`, entry counts).

## The 5 passes (→ dispatcher §2)

1. **Context bloat** — size pressure on the always-loaded files against an *adherence budget*: the size past which an assistant reliably *reads* a directive but stops reliably *following* it. Measure `wc -c CLAUDE.md AGENTS.md` and count entries one level deep under `.claude/commands/` and `.claude/skills/`. Bands: **above 40,000 chars** → High (well past the budget; late-file directives compete with the whole rest of the window — treat them as unreliable until the file is cut down); **30,000–40,000** → Medium (trending high; name lift candidates — large reference tables, registries, stack inventories that belong in per-project docs or external references); **below 30,000** → no finding; **more than 30 commands or more than 25 skills** → Low (slash-command surface bloat; trim unused or rarely-invoked entries). Quote the size; name 2–3 concrete lift candidates from the file's structure, at most 5 per file. This is a budget, not a cliff: Claude Code loads a context file in full (its ceiling is measured in megabytes), and nothing past the band is dropped — it just stops winning. Flowtron's own shipped surfaces are governed separately by the hard per-file byte budgets in `docs/CONTEXT-BUDGET.md`; those numbers govern flowtron's files, not an adopter's — do not carry them into this pass.
2. **Paste-block redundancy** — content in the project's `AGENTS.md` that restates or contradicts flowtron's canonical paste-block (rubric: the flowtron-mode paste-block reference). Examples: `AGENTS.md` says tasknotes live at `tasks/` but the paste-block says `.flowtron/tasknote/` (contradiction); the 4-phase lifecycle bullets copied verbatim under a project heading (restatement — the paste-block is the single source of truth and a copy drifts on the next bump); a project-specific extension of a workflow concept (partial overlap, often intentional). Quote ~3–5 lines with line numbers per finding. Skipped in no-flowtron mode.
3. **`ft-*` namespace** — project-side `.claude/skills/*` and `.claude/commands/*` entries that shadow or collide with the bundled `ft-*` namespace (rubric: the flowtron-mode bundled-name reference). Examples: an `ft-`-prefixed entry that is *not* a symlink into the flowtron submodule (adopter mode) or a flowtron checkout (global install) — the prefix is reserved per `SPEC/layout.md` §"Skill namespace"; an entry sharing a bundled skill's base name with or without the prefix (a project `task` skill shadowing `/ft-task`'s mental model, an `audit` that isn't the sanctioned fork); an adopter name that loosely echoes bundled-skill semantics without colliding. Recommend rename, delete, or repoint as a symlink into the bundle. Skipped in no-flowtron mode.
4. **Lean-context drift** — prose in `CLAUDE.md` / `AGENTS.md` that drifts from small-scannable-project-focused. Examples: a long inline workflow tutorial that duplicates `SPEC.md` content (should reference, not restate); stale "WIP" / "in flight" / "TODO" notes lingering past their relevance (no recent commit churn; referencing completed work); personal scaffolding bleeding into project-shared files (single-developer preferences embedded in shared `CLAUDE.md`). Bias toward surfacing patterns, not enumerating paragraphs.
5. **Tooling & orphans** — `.claude/` entries and project-side tooling that fight the lean-context principle. Examples: `.claude/` entries with no clear purpose (orphan scratch files, half-finished skill drafts, stale command stubs); project-side schema validators, JSON converters, or plan/tasknote linters that fight flowtron's "markdown is the schema" principle; generated context files nothing regenerates. Each finding names a destination — delete, finish, or move out of the context surface.

## Severity guide (→ dispatcher §3)

- **Critical** — a context directive that contradicts a flowtron contract in a way that breaks the workflow (paths, phase gates, or archive locations the paste-block fixes), or an `ft-*` entry that silently shadows a bundled skill so the wrong body runs.
- **High** — a file past the 40,000-char adherence band; a paste-block contradiction; a non-symlink `ft-*` entry.
- **Medium** — a file in the 30,000–40,000 band; a direct paste-block restatement; a same-base-name collision with a bundled skill; project-side tooling that fights markdown-is-the-schema.
- **Low** — command/skill surface bloat (more than 30 commands / 25 skills); partial paste-block overlap; a loose name echo; stale notes, personal scaffolding, orphan `.claude/` entries.

## Specialist additions

- **Finding format:** Location may be a file plus line range, or a `.claude/` entry name; tie "Why it matters" to adherence (directives that stop winning), drift-on-bump risk, or wrong-skill-invoked risk.
- **Carve-out note** (dispatcher §5): most context findings are skip-the-tasknote sized — a stale note, an orphan stub, a restated bullet — and hit the trivial-fix carve-out.
- **Hard rules:**
  - **Audit the context files, not the code they describe.** A `CLAUDE.md` claim that the code no longer honors is a `docs` finding (Claims vs. code) — out of scope here.
  - **Never grade an adopter's files against `docs/CONTEXT-BUDGET.md`.** Those budgets bind flowtron's shipped surfaces at release; pass 1's bands are the only size rule for this domain.
  - **Archived tasknotes are write-once.** `.flowtron/tasknote/archive/` is outside the scope by definition; so is `.flowtron/core/` itself — the submodule is the reference, not the audited surface.
  - **Symlinks into the bundle are the sanctioned shape.** A `.claude/` entry whose `readlink` resolves under `.flowtron/core/` (or a flowtron checkout) is never a namespace finding, whatever its name.
