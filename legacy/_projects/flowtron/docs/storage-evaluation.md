### Storage Strategy Evaluation (Flowtron)

**Recommendation (TL;DR):** Keep JSON + JSON Schema v1 as the authoritative format stored in Git, with schema validation in CI. Add optional YAML read/write adapters later if needed. Explore a PostgreSQL-backed service as a separate POC, not blocking current workflows.

### Context

- **Repo state:** JSON templates and plan/tasknote files exist; schema_version v1 defined. No runtime backend here.
- **Needs:** Human + AI friendly editing, diffable reviews, validation, and portability across repos.

### Comparison

| Criterion            | JSON (current)              | YAML                             | PostgreSQL                                  |
| -------------------- | --------------------------- | -------------------------------- | ------------------------------------------- |
| Human readability    | Good (strict)               | Excellent (succinct)             | Poor in raw; needs UI/CLI                   |
| AI parsing           | Excellent (deterministic)   | Good (indent-sensitive)          | Good via API/ORM                            |
| Schema validation    | Excellent (AJV/JSON Schema) | Good (convert to JSON, validate) | Excellent (DB constraints + app validation) |
| Diff/review in Git   | Excellent                   | Good (whitespace-sensitive)      | Not applicable (migrations instead)         |
| Tooling ecosystem    | Excellent                   | Good                             | Excellent (but requires service)            |
| Concurrency/collab   | OK (PR flow)                | OK (PR flow)                     | Excellent (row-level, locks)                |
| Querying/reporting   | Weak (jq/scripts)           | Weak                             | Excellent (SQL)                             |
| CI/CD integration    | Trivial (schema check)      | Trivial (convert + check)        | Medium (migrations + seeds)                 |
| Migration complexity | Low                         | Low (via JSON parity)            | High (schema + data migration)              |
| Security surface     | Low                         | Low                              | Higher (service, secrets)                   |

### Details and Implications

1. JSON as Source of Truth

- Maintain all plans/tasknotes in JSON with a versioned schema.
- Validate via JSON Schema (AJV) in a GitHub Action on PRs.

2. YAML (Optional)

- Provide adapters to load/save YAML while validating against the JSON Schema by converting YAML→JSON→validate.
- Keep JSON canonical to avoid whitespace/indent drift.

3. PostgreSQL (Future POC)

- Benefits: collaboration, queries, analytics, multi-user edits.
- Constraints: introduces a running service, migrations, secrets management, and access control.
- If pursued, design a POC using SQLite for local dev and PostgreSQL in staging, behind a CLI or lightweight service; keep Git JSON as export/import for auditability.

### CI/CD Notes

- Add a GitHub Action step to run a schema validation script on changed `*.json` under `_project/` and `templates/`.
- Lint docs/JSON for formatting; block merges on schema errors.

### Phased Plan

1. Phase 1 (Now): Standardize on JSON + JSON Schema v1; add CI validation.
2. Phase 2 (Optional): YAML read/write adapters with parity tests; JSON remains canonical.
3. Phase 3 (Optional): DB POC with import/export sync; evaluate operational overhead and security.

### Backlog Candidates

- CORE-004: YAML support (read/write) with schema-parity checks.
- CORE-006: PostgreSQL-backed TaskNotes/Plans POC (service + CLI + import/export).
