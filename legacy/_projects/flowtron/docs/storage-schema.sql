-- Flowtron storage schema (SQLite / Postgres-compatible subset)
-- Source of truth schema; keep Postgres-compatible types and constraints

-- PostgreSQL primary target; SQLite compatibility is not required anymore.

-- Plans by area (e.g., CORE, FE, BE, TEST, DEP, DB)
CREATE TABLE IF NOT EXISTS plan (
  plan_id TEXT PRIMARY KEY,
  area TEXT NOT NULL,              -- e.g., core, frontend
  vision TEXT,
  last_updated TEXT NOT NULL       -- ISO8601
);

-- Tasks in a plan
CREATE TABLE IF NOT EXISTS task (
  task_id TEXT PRIMARY KEY,        -- e.g., CORE-001
  plan_id TEXT NOT NULL REFERENCES plan(plan_id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Not Started','In Progress','Complete')),
  goal TEXT,
  priority TEXT NOT NULL CHECK (priority IN ('Critical','High','Medium','Low','Backlog')),
  tags TEXT,                       -- JSON array (text) for portability
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Directed acyclic dependencies between tasks
CREATE TABLE IF NOT EXISTS task_dependency (
  task_id TEXT NOT NULL REFERENCES task(task_id) ON DELETE CASCADE,
  depends_on_task_id TEXT NOT NULL REFERENCES task(task_id) ON DELETE RESTRICT,
  PRIMARY KEY (task_id, depends_on_task_id)
);

-- High-level TaskNote entity (archival metadata)
CREATE TABLE IF NOT EXISTS tasknote (
  task_id TEXT PRIMARY KEY REFERENCES task(task_id) ON DELETE CASCADE,
  summary TEXT,
  archived_at TEXT,                -- when moved to archive
  metadata TEXT                    -- JSON blob for extensions
);

-- Phases within a TaskNote (Discovery, Execution, Testing & Linting, Closure)
CREATE TABLE IF NOT EXISTS tasknote_phase (
  task_id TEXT NOT NULL REFERENCES tasknote(task_id) ON DELETE CASCADE,
  phase_index INTEGER NOT NULL CHECK (phase_index BETWEEN 1 AND 10),
  name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Pending','In Progress','Completed')),
  description TEXT,
  completion_check TEXT,
  PRIMARY KEY (task_id, phase_index)
);

-- Steps within a phase
CREATE TABLE IF NOT EXISTS tasknote_step (
  task_id TEXT NOT NULL,
  phase_index INTEGER NOT NULL,
  step_id INTEGER NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Pending','In Progress','Completed')),
  progress TEXT,                   -- JSON array of strings
  updated_at TEXT,
  PRIMARY KEY (task_id, phase_index, step_id),
  FOREIGN KEY (task_id, phase_index) REFERENCES tasknote_phase(task_id, phase_index) ON DELETE CASCADE
);

-- Views (optional) for convenience
-- Tasks with counts by status could be derived in the UI; keep schema minimal here


