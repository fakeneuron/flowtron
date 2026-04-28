## Flowtron Project Setup (Base Expectations)

This guide defines the minimal folder and file conventions Flowtron expects, so humans and AI agents can operate consistently across projects.

### Goals

- **Consistency**: Plans and TaskNotes live in predictable places.
- **Traceability**: Each TaskNote ties back to a plan entry and archives cleanly.
- **Adaptable**: Prefixes and sub-plans are flexible; structure is stable.

### Required Folders

- `_project/`
  - `plan.json` — top-level aggregator that references functional sub-plans
  - `plan-core.json`, `plan-frontend.json`, `plan-testing.json`, `plan-deployment.json` — recommended sub-plans (add more as needed)
  - `tasknote/` — working TaskNotes (JSON)
    - `archive/` — completed TaskNotes, organized by subfolder
      - `core/`
      - `frontend/`
      - `backend/`
      - `deployment/`
      - `testing/`
      - `database/`

Example structure:

```text
_project/
  plan.json
  plan-core.json
  plan-frontend.json
  plan-testing.json
  plan-deployment.json
  tasknote/
    FE-004.json
    archive/
      core/
        CORE-001.json
      frontend/
      backend/
      deployment/
      testing/
      database/
```

### Required Files

- `/_project/plan.json`
  - Must reference the active sub-plan files via relative paths (e.g., `_project/plan-core.json`).
- `/_project/plan-*.json`
  - Functional plan files that list tasks with `task_id`, `title`, `status`, and acceptance details.
- `/_project/tasknote/*.json`
  - TaskNotes based on `templates/tasknote-template.json` (include `schema_version`).

### ID Scheme (Choose and Be Consistent)

- Use area prefixes per sub-plan, e.g. `CORE-###`, `FE-###`, `BE-###`, `TEST-###`, `DEPLOY-###`, `DB-###`.
- Be consistent within each plan file; avoid generic `TN-###`.

#### Standard prefixes (Flowtron default)

- `CORE-###` — core/docs/templates/schema
- `FE-###` — frontend/UI
- `BE-###` — backend/services
- `TEST-###` — testing/linting/quality
- `DEPLOY-###` — deployment/infra/CI
- `DB-###` — database/migrations

Notes:

- Mixed prefix lengths are acceptable; prefer clarity over brevity.
- Only introduce new prefixes if a new functional area is added; document it here.

### Archive Rules (Hard Requirements)

- A TaskNote must exist in exactly one location: root `tasknote/` or an `archive/*/` subfolder — never both.
- Default mapping (adaptable):
  - `CORE-*` → `archive/core/`
  - `FE-*` → `archive/frontend/`
  - `BE-*` → `archive/backend/`
  - `DEPLOY-*` → `archive/deployment/`
  - `TEST-*` → `archive/testing/`
  - `DB-*` → `archive/database/`

Archive checklist:

1. Move `{TASK_ID}.json` from `_project/tasknote/` to the mapped `archive/<area>/` folder
2. Verify the file exists in the archive
3. Remove the original from `_project/tasknote/`
4. Verify it no longer exists in root
5. Commit with a concise message

### Plan Conventions

- `plan.json` is the single reference for sub-plan locations and global status.
- Each sub-plan file:
  - Contains a stable `plan_id` and `last_updated`
  - Lists `tasks[]` with `task_id`, `title`, `status`, `priority`, `steps`, and `acceptance_criteria`
  - May include `dependencies` to other task IDs

### TaskNote Conventions

- Use `templates/tasknote-template.json` as the source of truth for fields and phases.
- Keep progress notes high-signal; avoid duplicating plan details.
- Use the Relevance Assessment gate to De-scope quickly if obsolete.

### AI Enforcement Guidance

- When creating a TaskNote:
  - Confirm `task_id` not already archived under `_project/tasknote/archive/**`
  - Place new file under `_project/tasknote/` only
  - Ensure the related sub-plan contains the `task_id` (or create an ad hoc entry with consistent format)
- On closure:
  - Update the corresponding plan entry `status` to `Completed` with a completion date
  - Move the TaskNote per archive mapping and verify root cleanup

### Links

- Task workflow guide (terse template): `_projects/flowtron/docs/TaskNote-Guidelines-Template.md`

### Validation (Required)

- Use the CLI to validate structure and TaskNotes:
  - Scaffold folders (one-time): `npm run flowtron:scaffold`
  - Validate current TaskNotes and plan integration: `npm run flowtron:validate`
- Expectation: validation runs clean before closing any TaskNote.
