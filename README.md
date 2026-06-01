# flowtron

A lightweight, project-agnostic tasknote system for solo AI-assisted coding.
One source of truth, consumed by adopting projects via git submodule.

The goal: keep AI context windows small, make tasks self-contained, and
prevent scope drift — without scripts, daemons, databases, or schemas to
maintain.

## Documents

- [SPEC.md](SPEC.md) — canonical workflow contract (4-phase tasknote
  lifecycle, relevance gate, post-closure protocol, versioning rules)
- [docs/PHILOSOPHY.md](docs/PHILOSOPHY.md) — the "why": drift across prior
  per-project workflows and the principles that stuck
- [docs/VISION.md](docs/VISION.md) — outward-facing identity: who flowtron
  is for, the principles (recap of SPEC), and the PR/suggestion archetypes
  flowtron deliberately rejects
- [docs/GLOSSARY.md](docs/GLOSSARY.md) — alphabetized one-line definitions for
  ~51 load-bearing terms, phases, markers, and grammar elements (lazy-loaded
  pointer to SPEC anchors)
- [docs/MIGRATION.md](docs/MIGRATION.md) — adoption guide for fresh projects
  and migration from a prior workflow system
- [docs/CONVENTIONS.md](docs/CONVENTIONS.md) — conventions flowtron adheres to
  (Conventional Commits, SemVer, GFM, Diátaxis) and declines (CHANGELOG, ADR
  registry, release automation, pre-commit hooks) with rationale
- [docs/AGENT-NEUTRALITY.md](docs/AGENT-NEUTRALITY.md) — agent-neutrality
  contract: which contract-layer Claude-specific surfaces are intentional
  (load-bearing locators for the Claude Code wiring layer) and why
- [docs/PLATFORMS.md](docs/PLATFORMS.md) — multi-platform wiring pattern:
  the two-layer model (agent-neutral contract / per-platform wiring) and
  the symmetric plug-in shape for future platforms (Codex CLI / grok /
  Cursor)
- [docs/AGENT-COMPAT.md](docs/AGENT-COMPAT.md) — living agent-compatibility
  matrix: which AI coding agents flowtron supports, their contract
  entry-points, skill primitives, and last-verified currency
- [docs/WORKTREES.md](docs/WORKTREES.md) — worktree convention for parallel
  epic children: the five locked decisions (location, branch naming, skill
  pair, tasknote handling, cleanup) behind `/ft-worktree-start` +
  `/ft-worktree-end`
- [CONTRIBUTING.md](CONTRIBUTING.md) — solo-maintenance model, how to file
  issues, when PRs make sense
- [SECURITY.md](SECURITY.md) — threat model (prompt injection via
  user-authored markdown, submodule supply-chain trust, viz dev-server
  scope) and how to report a vulnerability

## Bootstrapping a new project

Run `/ft-new-project` in your project's root directory (git repo required;
`/ft-new-project` additionally checks for `CLAUDE.md` as a project-validity
heuristic) to add the flowtron submodule, wire the seven tasknote skills
(`/ft-task`, `/ft-starter-task`, `/ft-micro-task`, `/ft-file-followup`,
`/ft-epic-discovery`, `/ft-close-epic`, `/ft-debug`) plus the two worktree
utilities (`/ft-worktree-start`, `/ft-worktree-end`), and drop in the `_project/`
skeleton in one pass. See [docs/MIGRATION.md](docs/MIGRATION.md) §1.0 for the
one-time global install.

## Visualizer

`viz/` is a read-only Kanban view of every flowtron-adopting project under
your workspace, grouped by priority. Open tasks with an active tasknote in
each project's `_project/tasknote/` are flagged **In progress**. The
header-rail project selector swaps the active project;
the header subhead shows task counts, in-progress count, and the flowtron
version the selected project is using (from its `_project/flowtron/SPEC.md`).
filters and scroll position reset on switch.

Run **once per machine** from flowtron's own checkout — there is no
per-project install step. The dev server is pinned to port `5120` with
`strictPort`, so a second instance fails fast rather than scanning the same
workspace on a different port.

```sh
cd ~/code/flowtron/viz
npm install
npm run dev
```

The scanner globs `${FLOWTRON_VIZ_WORKSPACE:-~/code}/*/_project/PLAN.md` to
discover projects; the directory name (e.g., `myproject`) becomes the project
label. Dirs without a `_project/PLAN.md` are silently skipped. Set
`FLOWTRON_VIZ_WORKSPACE` if your projects live somewhere other than
`~/code/`.

Adopter projects' own `_project/flowtron/viz/` continues to work (read-only
submodule, unchanged) but is no longer the recommended path — prefer the
single global instance above.

## Working in markdown vaults

Flowtron is editor-agnostic — markdown files in git remain the source of
truth — but two of its choices happen to fit markdown-vault tools
(Obsidian, Foam, Logseq) natively:

- The `[[TASK-ID]]` cross-references in tasknote bodies are standard
  wikilink syntax (clickable links + surfaced in graph views).
- The YAML frontmatter on every tasknote (`status`, `tags`, `due`,
  `related-tasks`) is the shape vault-tool query plugins consume.

**Obsidian.** Open the project root (or just `_project/`) as a vault and
tasknotes become a queryable, graph-viewable knowledge base with no extra
wiring. A minimal
[Dataview](https://blacksmithgu.github.io/obsidian-dataview/) snippet
(Obsidian-only) to list open tasks:

````markdown
```dataview
TABLE status, due
FROM "_project/tasknote"
WHERE status != "completed"
SORT due
```
````

**Foam.** Wikilinks (including `[[note#Section]]` and `[[note|alias]]`)
and the graph view work out of the box in VS Code. No built-in query
plugin equivalent to Dataview.

**Logseq.** Wikilinks resolve natively. Frontmatter caveat: Logseq's
preferred form is block-properties (`key:: value`), not YAML — flat
markdown-with-YAML vaults still load, but querying tasknote metadata
uses Logseq's `:query` syntax rather than Dataview.

These tools are opt-in companion surfaces. None of the above is required.

## Repo layout

- `SPEC.md` — workflow contract (authoritative)
- `SPEC/` — lazy SPEC modules (epic, starter, blocked, model, versioning, gates, tasknote-selection); loaded on demand by skills
- `templates/` — canonical tasknote and `PLAN.md` templates
- `claude/` — Claude Code skills + slash commands (adopter-facing snippet + self-hosted skills like `/ft-task`, `/ft-release`); future non-Claude-Code platform wirings (e.g., `codex/`, `grok/`, `cursor/`) plug in symmetrically as sibling top-level dirs — see [`docs/PLATFORMS.md`](docs/PLATFORMS.md)
- `docs/` — philosophy, vision, glossary, migration, conventions, agent-neutrality, platforms, agent-compat, and worktrees docs
- `_project/` — flowtron's own roadmap and tasknotes (self-hosted)
- `viz/` — Vite/React Kanban visualizer
- `CONTRIBUTING.md` — solo-maintenance model; issue and PR guidance
- `SECURITY.md` — threat model and vulnerability reporting
- `LICENSE` — MIT
- pre-v0.1.0 source preserved in git tag `legacy-pre-v0.1.0`

## Version

See [SPEC.md](SPEC.md) for the current contract version, and the repo's git
tags for releases.

Adopting projects pin a specific flowtron commit via git submodule and bump
deliberately. Each release tag's annotated message lists migration steps for
major bumps (no separate `CHANGELOG.md`).

## License

Flowtron is [MIT-licensed](LICENSE).
