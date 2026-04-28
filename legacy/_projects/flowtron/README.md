# Flowtron (Project-agnostic)

Flowtron provides a reusable TaskNote workflow (docs, templates, and a future visualization UI) that any repo can adopt with minimal setup.

## Layout

- `docs/`: Guidance and reference (prompt template, compatibility mapping, etc.)
- `templates/`: JSON templates for plans and tasknotes (versioned)
  - See `docs/Project-Setup-Guidelines.md` for required folder structure and archiving rules

## Quick Start

1. Create a plan from `templates/plan-template.json`.
2. Select the next `CORE-###` by priority, then lowest number.
3. Create a TaskNote from `templates/tasknote-template.json` at `_project/tasknote/<CORE-###>.json`.
4. Work through the four phases (Discovery → Execution → Testing/Linting → Closure).
5. On closure, update plan status and archive the TaskNote under `_project/tasknote/archive/core/`.

See also: `docs/Project-Setup-Guidelines.md` for base project structure and `docs/TaskNote-Guidelines-Template.md` for the task workflow template.

## Schema Versioning

Templates embed `schema_version` and are designed for lightweight validation and migration notes.

## Status

- Docs and templates are minimal by design; tailor locally without breaking schema.
