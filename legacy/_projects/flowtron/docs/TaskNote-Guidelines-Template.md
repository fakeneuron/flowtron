## TaskNote Guidelines (Template)

This document is a project-agnostic template. Copy it into your project (e.g., `docs/TaskNote-Guidelines.md`) and replace bracketed placeholders.

### Purpose
- **What**: A lightweight, consistent workflow for creating, executing, testing, and closing tasks using JSON TaskNotes.
- **Why**: Improves clarity, repeatability, and accountability across projects and teams.

### Core Principles
- **Terse over verbose**: Prefer checklists and high-signal progress notes.
- **Gate on relevance**: De-scope early if the task is no longer needed.
- **Single source of truth**: Plans define what, TaskNotes track how and proof of completion.
- **Archive cleanly**: A TaskNote must never exist in both root and archive.

### TaskNote Basics
- **Format**: JSON file based on `templates/tasknote-template.json`.
- **Location (root)**: `[PROJECT_ROOT]/_project/tasknote/`
- **Archive**: `[PROJECT_ROOT]/_project/tasknote/archive/` (see Mapping)
- **Linkage**: Each TaskNote should reference a corresponding plan entry where applicable.

### Minimal Lifecycle
1) **Discovery**
   - Review relevant plan entry and current code state
   - Decide relevance: Proceed / Re-scope / De-scope
   - Ask clarifications only if blocking; otherwise record assumptions
2) **Execution**
   - Implement changes in small, testable steps
   - Keep progress notes concise (what changed, why, where)
3) **Testing & Linting**
   - Run targeted tests and linters for the impacted area(s)
   - Fix failures; aim for agreed coverage thresholds
4) **Closure**
   - Ensure all steps complete; update docs/inventories if used
   - Archive TaskNote and update plan status

### IDs and Naming (Adapt Per Project)
- Choose and standardize an area-prefixed scheme: `[AREA]-[NNN]` (e.g., `CORE-012`, `FE-042`).
- Maintain monotonic sequence; avoid reuse.
- Reference your plan file(s) and reflect IDs there.

### File Locations (Adapt Per Project)
- **Plans**: `[PROJECT_ROOT]/_project/plan-*.json`
- **TaskNotes (root)**: `[PROJECT_ROOT]/_project/tasknote/`
- **Archive**: `[PROJECT_ROOT]/_project/tasknote/archive/` with subfolders if desired.

### Archive Mapping (Adapt Per Project)
Provide a simple mapping that fits your project. Example:
- `CORE-*` → `archive/core/`
- `FE-*` → `archive/frontend/`
- `BE-*` → `archive/backend/`
- Or keep a flat archive if prefixes are not used.

Archive checklist:
- Move file to archive subfolder based on ID/prefix
- Verify it exists in archive
- Remove original from root `tasknote/`
- Verify it no longer exists in root

### Commands and Tooling (Fill In For Your Stack)
Define canonical commands here and keep them minimal. Examples to replace:
- Frontend (example):
  - Test: `npx vitest run --coverage`
  - Lint: `npm run lint`
- Backend (example):
  - Test: `pytest -n auto --cov`
  - Lint/Type: `pylint ./src`, `mypy ./src`
- Full-stack: run both suites.

State your actual project commands here:
- Test: `[PROJECT_TEST_COMMAND]`
- Lint/Format: `[PROJECT_LINT_COMMAND]` / `[PROJECT_FORMAT_COMMAND]`
- Coverage target: `[PROJECT_COVERAGE_TARGET]%` (if applicable)

### Completion Criteria (Checklist)
- Discovery decision recorded (Proceed / Re-scope / De-scope)
- All lifecycle steps marked complete in the TaskNote
- Tests/linters run for impacted areas and pass
- Coverage threshold met or exception documented
- Plan entry updated (status, completion date) if applicable
- TaskNote archived per mapping with no duplicates between root and archive

### Usage Pattern
- Create TaskNote → execute in small steps → run targeted tests → stabilize → close and archive.
- Keep progress logs high-signal (what changed, where, tests run/results).

### Conventions
- Prefer descriptive titles and clear goals.
- Keep `file_inventory` up to date for created/modified/removed files if your template supports it.
- Avoid speculative subtasks; split only when scope is truly large or blocked.

### Anti-Patterns
- Leaving steps as "Pending" when declaring completion.
- Duplicating long instructions across templates and docs (link instead).
- Running full test suites for tiny, isolated changes when targeted tests suffice.

### Adaptation Guide (Fill These Placeholders)
- `[PROJECT_NAME]`:
- `[TASK_ID_SCHEME]` (e.g., `CORE-###`, `FE-###`):
- `[PLAN_FILES]` (paths):
- `[ARCHIVE_MAPPING]` (prefix → folder):
- `[TEST_COMMANDS]`:
- `[LINT_FORMAT_COMMANDS]`:
- `[COVERAGE_TARGET]`:

Once adapted, publish as `docs/TaskNote-Guidelines.md` (or similar) and link it from your TaskNote template.


