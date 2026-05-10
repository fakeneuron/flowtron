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
- [docs/MIGRATION.md](docs/MIGRATION.md) — adoption guide for fresh projects
  and migration from a prior workflow system

## Bootstrapping a new project

Run `/new-project` in a fresh `~/code/` repo (git repo + `CLAUDE.md` required)
to add the flowtron submodule, wire `/task`, and drop in the `_project/`
skeleton in one pass. See [docs/MIGRATION.md](docs/MIGRATION.md) §1.0 for the
one-time global install.

## Visualizer

`viz/` is a read-only Kanban view of every flowtron-adopting project under
your workspace, grouped by priority. Open tasks with an active tasknote in
each project's `_project/tasknote/` are flagged **In progress**. A
project-selector chip group in the header rail swaps the active project;
filters and scroll position reset on switch.

Run **once per machine** from flowtron's own checkout — there is no
per-project install step. The dev server is pinned to port `5176` with
`strictPort`, so a second instance fails fast rather than scanning the same
workspace on a different port.

```
cd ~/code/flowtron/viz
npm install
npm run dev
```

The scanner globs `${FLOWTRON_VIZ_WORKSPACE:-~/code}/*/_project/PLAN.md` to
discover projects; the directory name (e.g., `fintown`) becomes the project
label. Dirs without a `_project/PLAN.md` are silently skipped. Set
`FLOWTRON_VIZ_WORKSPACE` if your projects live somewhere other than
`~/code/`.

Adopter projects' own `_project/flowtron/viz/` continues to work (read-only
submodule, unchanged) but is no longer the recommended path — prefer the
single global instance above.

## Working in Obsidian

Flowtron is editor-agnostic — markdown files in git remain the source of
truth — but two of its choices happen to fit Obsidian natively:

- The `[[TASK-ID]]` cross-references in tasknote bodies are Obsidian's
  native wikilink syntax (clickable links + surfaced in the graph view).
- The YAML frontmatter on every tasknote (`status`, `tags`, `due`,
  `related-tasks`) is exactly what the
  [Dataview](https://blacksmithgu.github.io/obsidian-dataview/) plugin
  queries.

If you already work in Obsidian, open the project root (or just
`_project/`) as a vault and tasknotes become a queryable, graph-viewable
knowledge base with no extra wiring. A minimal Dataview snippet to list
open tasks:

````
```dataview
TABLE status, due
FROM "_project/tasknote"
WHERE status != "completed"
SORT due
```
````

Obsidian is opt-in companion tooling. None of the above is required.

## Repo layout

- `SPEC.md` — workflow contract (authoritative)
- `templates/` — canonical tasknote and `PLAN.md` templates
- `claude/` — Claude Code skills + slash commands (`/task`, `/new-project`)
- `docs/` — philosophy and migration guides
- `_project/` — flowtron's own roadmap and tasknotes (self-hosted)
- `viz/` — Vite/React Kanban visualizer (single-project MVP)
- pre-v0.1.0 source preserved in git tag `legacy-pre-v0.1.0`

## Version

See [SPEC.md](SPEC.md) for the current contract version, and the repo's git
tags for releases.

Adopting projects pin a specific flowtron commit via git submodule and bump
deliberately. Each release tag's annotated message lists migration steps for
major bumps (no separate `CHANGELOG.md`).
