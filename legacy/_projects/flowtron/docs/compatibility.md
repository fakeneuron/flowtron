# Compatibility Mapping (FinTown → Flowtron)

Map existing FinTown plan/tasknote concepts to Flowtron's generic schema without altering FinTown sources. Exact field names in FinTown may vary; treat this as a conceptual mapping and configure an adapter to handle name differences.

## Scope and Assumptions

- Non-destructive: FinTown artifacts are not modified. Flowtron imports produce new JSON files conforming to Flowtron v1 schema.
- Canonical store: Flowtron uses JSON with `schema_version: "1.0.0"` and validates via JSON Schema in CI.
- Unknowns: Unmapped fields are preserved under `metadata.extra` and/or `metadata.tags`.

## Core Entities and Fields

### Plan

| FinTown concept        | Flowtron field                  | Notes                                                                                                                  |
| ---------------------- | ------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Plan identifier        | `plan_id`                       | Stable identifier for the plan document.                                                                               |
| Last updated timestamp | `last_updated`                  | ISO 8601 string. Source-of-truth timestamp on import.                                                                  |
| Vision/description     | `vision`                        | High-level description of plan purpose.                                                                                |
| Estimated time         | `estimated_time`                | Optional free-text or structured.                                                                                      |
| Next priority task     | `next_priority`                 | Flowtron uses `CORE-###`/project codes to choose next task.                                                            |
| Current/target state   | `current_state`, `target_state` | Free-form objects describing state.                                                                                    |
| Tasks array            | `tasks[]`                       | Each entry has `task_id`, `title`, `status`, `goal`, `priority`, `steps[]`, `acceptance_criteria[]`, `dependencies[]`. |

Status mapping (example):

- FinTown `todo`/`not_started` → Flowtron `Not Started`
- FinTown `doing`/`in_progress` → Flowtron `In Progress`
- FinTown `done` → Flowtron `Complete`

### TaskNote (per-task execution record)

| FinTown concept | Flowtron field     | Notes                                                                                            |
| --------------- | ------------------ | ------------------------------------------------------------------------------------------------ |
| Task identifier | `task_id`          | Matches plan's `tasks[].task_id`.                                                                |
| Title           | `title`            | Short summary of task.                                                                           |
| Goal            | `goal`             | Brief objective.                                                                                 |
| Priority        | `priority`         | One of High/Medium/Low (or mapped from FinTown scale).                                           |
| Related files   | `file_inventory[]` | Paths to relevant files.                                                                         |
| Phases          | `phases[]`         | Four-phase TaskNote workflow: Discovery, Execution, Testing & Linting, Closure.                  |
| Metadata        | `metadata`         | `{ tags: string[], area: string, difficulty: string, estimated_impact: string, extra?: object }` |
| Summary         | `summary`          | Short completion note.                                                                           |

### Phases and Steps

Flowtron phases structure:

1. Task Discovery: research, relevance, clarifications, inventory, plan, starting commit
2. Task Execution: implement, tests, run targeted tests
3. Testing and Linting: run tests, fix issues, coverage, visual checks, stabilize
4. Task Closure: verify completion, update docs/inventories, archive

If FinTown tracks progress as a flat checklist or timeline, map items to the appropriate `phases[].steps[]` with `status` and `progress[]` arrays capturing notes/events.

## Ingest Guidance (Non-destructive)

1. Export FinTown items (JSON/YAML) for the target plan and its tasks.
2. Use an adapter (script/CLI) to transform each plan/task into Flowtron JSON:
   - Create or update `_project/plan-<project>.json` with Flowtron structure.
   - For each task, create `_project/tasknote/<TASK_ID>.json` following the TaskNote template.
   - Preserve unknown FinTown fields under `metadata.extra` and include labels in `metadata.tags`.
3. Validate the produced JSON against Flowtron v1 schema (CI step) and check in via PR.
4. Do not modify or delete FinTown sources; treat them as read-only during import.

Suggested CLI behavior:

- Dry-run mode prints a mapping report and diffs.
- Import mode writes files and runs validation.
- Idempotent runs; re-import updates existing Flowtron files while preserving manual edits in `progress[]`.

## Adapters and Backlog

Backlog items for adapters (no code required in this task):

- CORE-010: Implement `flowtron import --from=fintown` adapter (YAML/JSON autodetect) to generate Flowtron plan + tasknotes.
- CORE-011: Add schema validation command `flowtron check` that validates JSON files changed in a branch.
- CORE-012: Provide a mapping config file (e.g., `flowtron.mapping.json`) allowing users to map FinTown field names to Flowtron fields without code changes.

## Notes

- Preserve original semantics; avoid destructive changes.
- Capture any unmapped fields under `metadata.extra` and add a tag for traceability, e.g., `source:fintown`.
