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

## Repo layout

- `SPEC.md` — workflow contract (authoritative)
- `templates/` — canonical tasknote and `PLAN.md` templates
- `claude/` — Claude Code skills + slash commands (`/task`, `/new-project`)
- `docs/` — philosophy and migration guides
- `_project/` — flowtron's own roadmap and tasknotes (self-hosted)
- `viz/` — Vite/React Kanban visualizer (single-project MVP)
- `legacy/` — pre-v0.1.0 contents, retained for reference

## Version

See [SPEC.md](SPEC.md) for the current contract version, and the repo's git
tags for releases.

Adopting projects pin a specific flowtron commit via git submodule and bump
deliberately. Each release tag's annotated message lists migration steps for
major bumps (no separate `CHANGELOG.md`).
