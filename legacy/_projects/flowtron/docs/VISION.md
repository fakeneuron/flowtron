## Flowtron Vision

Flowtron is an AI-first project management framework. It turns plans and task notes into a tight, iterative loop that agents can follow autonomously with human oversight.

### Purpose

- Provide a structured, machine-friendly workflow so AI can pick the next task, execute safely, validate, and close.
- Make otherwise hard-to-read artifacts (task notes, plans) visual and actionable.
- Allow ad hoc tasks to be added consistently without breaking orchestration.

### Principles

- Single source of truth; separate storage (source) from exchange (what AI reads/writes each step).
- Minimal, explicit states: Not Started → In Progress → Complete.
- Hard gates: Relevance Assessment before Execution; Validation before Closure.
- Auditability: every change attributable and reversible; archived tasks never duplicate.

### Domain Model (first principles)

- Plan (global) orchestrates sub-plans (areas like CORE, FE, BE, TEST, DEP, DB).
- Task belongs to one sub-plan; has priority, status, dependencies, tags.
- TaskNote is the guided execution log for a single task; phases: Discovery, Execution, Testing & Linting, Closure.
- Dependency: task-to-task edges; must not form cycles; surfaced in the UI.

Suggested fields (source of truth):

- plan: plan_id, last_updated, area list
- task: task_id, plan_id, title, status, priority, goal, tags, created_at, updated_at
- task_dependency: task_id, depends_on_task_id
- tasknote: task_id, summary, archived_at, metadata
- phase: task_id, index, name, status
- step: task_id, phase_index, step_id, description, status, progress (array of strings), updated_at

### Workflow Loop (agent-facing)

1. Prioritize: pick next task by priority, then lowest id, respecting dependencies.
2. Discovery: relevance gate; collect files; log assumptions or clarifications.
3. Execution: small, testable edits; keep progress logs high-signal.
4. Testing & Linting: run targeted checks; stabilize; visuals if needed.
5. Closure: update plan status; archive TaskNote; validate no duplicates.

### Storage Strategy

- Current: JSON files (simple, git-native, but poor for concurrency and queries).
- Options:
  - JSON/YAML: human-readable, easy diffs; weaker querying; concurrency hazards.
  - SQL (PostgreSQL-first): strong querying, constraints, relations, transactions, history via audit.
  - Supabase (managed PostgreSQL): Postgres + auth + RLS + realtime; good for multi-user UI.

Recommendation:

- Use PostgreSQL as the source of truth with a thin storage abstraction (schema Supabase-compatible).
- Provide an AI Exchange Format: canonical JSON snapshot for the currently checked-out task that agents read/write. The app reconciles snapshots into Postgres.
- Run locally with Dockerized Postgres; adopt Supabase for collaboration later.

### Migration Plan

- Add import/export commands to convert current JSON plans/tasknotes to/from the DB.
- Maintain deterministic ids and archive semantics; enforce constraints (unique ids, no duplicates between root and archive).

### MVP → Next

- MVP (now): local visualization; CLI validator; structure enforcement.
- Next:
  - Define SQL schema and storage adapter (Postgres/Supabase-first; keep portability).
  - Implement import/export and a read-only DB-backed UI page.
  - Add a “checkout task” workflow that emits the AI Exchange JSON for the agent.
  - Incrementally route writes through the adapter; keep JSON export for transparency.

### Why this path

- Agents need structured, granular context (phases/steps) and deterministic ids.
- SQL gives integrity (deps, unique ids, statuses) and scalable queries.
- JSON exchange keeps AI ergonomics while the DB guarantees correctness.
