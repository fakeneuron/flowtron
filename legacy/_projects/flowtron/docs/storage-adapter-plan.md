## Storage Adapter Plan

Goal: Use SQL as the source of truth and a JSON Exchange Format for AI agents. Provide import/export commands to bridge current JSON files and the DB.

### Interfaces

- Adapter API (TypeScript):
  - `getNextTask(area?: string): Promise<Task>` — priority then lowest id while respecting dependencies
  - `checkoutTask(taskId: string): Promise<AiExchange>` — return task + tasknote snapshot for agent
  - `updateTasknote(exchange: AiExchange): Promise<void>` — reconcile agent progress into DB
  - `completeTask(taskId: string): Promise<void>` — mark complete, set archived_at, enforce archive rule
  - `importFromJson(paths: string[]): Promise<ImportReport>` — ingest existing JSON plans/tasknotes
  - `exportToJson(outDir: string): Promise<ExportReport>` — produce JSON snapshots for transparency

### AI Exchange Format (JSON)

Minimal shape designed for the currently checked-out task:

```
{
  "task": {"task_id":"CORE-010","title":"...","status":"In Progress","priority":"High","goal":"...","dependencies":["CORE-001"]},
  "tasknote": {
    "task_id":"CORE-010",
    "summary": null,
    "phases": [ {"phase_id":1,"name":"Task Discovery","steps":[{"step_id":1,"description":"...","status":"In Progress","progress":[]}]} ]
  }
}
```

### Import Plan (JSON → DB)

1. Parse `_project/plan.json` to discover sub-plans.
2. For each plan: insert `plan` and `task` rows; normalize priorities and statuses; enforce unique `task_id`.
3. Load TaskNotes from `_project/tasknote/` and archive; map phases/steps; set `archived_at` if archived.
4. Compute dependencies from `dependencies` arrays in plan tasks.
5. Validate DAG (no cycles) and integrity constraints; fail-fast with a report.

### Export Plan (DB → JSON)

1. Emit `plan-<area>.json` with tasks and dependencies.
2. Emit TaskNotes into `_project/tasknote/` or `_project/tasknote/archive/<area>/` based on `archived_at`.
3. Keep formatting stable for diffability.

### CLI Commands (future)

- `flowtron:db:init` — apply schema to PostgreSQL (Docker compose / env)
- `flowtron:db:import ...files` — import JSON files
- `flowtron:db:export --out _project` — export snapshots
- `flowtron:db:next --area FE` — print next task id/title
- `flowtron:db:checkout CORE-010` — write AI exchange JSON to `./.flowtron/current-task.json`
- `flowtron:db:update ./current-task.json` — reconcile progress

### Notes

- Postgres-first for dev and prod; use Docker locally and Supabase later.
- Schema remains Supabase-compatible; consider RLS/admin policies when moving.
- RLS policies (when on Postgres): allow read for all, write for maintainers/agents; track history via triggers or event tables.
