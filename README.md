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

`viz/` is a read-only Kanban view of the current project's `_project/PLAN.md`,
grouped by priority. Open tasks with an active tasknote in
`_project/tasknote/` are flagged **In progress**.

```
cd viz
npm install
npm run dev
```

Single-project for now (reads flowtron's own `_project/PLAN.md`). The
cross-project version that scans every `~/code/*/_project/PLAN.md` is queued
as **FE-002** in the plan.

## Working in Obsidian

Flowtron is editor-agnostic — markdown files in git remain the source of
truth — but two of its choices happen to fit Obsidian natively:

- The `[[TASK-ID]]` cross-references in tasknote bodies are Obsidian's
  native wikilink syntax (clickable links + surfaced in the graph view).
- The YAML frontmatter on every tasknote (`status`, `priority`, `area`,
  `tags`, `due`, `related-tasks`) is exactly what the
  [Dataview](https://blacksmithgu.github.io/obsidian-dataview/) plugin
  queries.

If you already work in Obsidian, open the project root (or just
`_project/`) as a vault and tasknotes become a queryable, graph-viewable
knowledge base with no extra wiring. A minimal Dataview snippet to list
open tasks:

````
```dataview
TABLE status, priority, area
FROM "_project/tasknote"
WHERE status != "completed"
SORT priority
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
