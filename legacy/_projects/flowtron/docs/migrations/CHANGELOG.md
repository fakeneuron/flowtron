# Flowtron Schema CHANGELOG

## v1.0.0 (Baseline)

- Introduced `schema_version: "1.0.0"` across templates and plans
- Plan required fields: `$schema`, `schema_version`, `plan_id`, `last_updated`, `vision`, `next_priority`, `tasks`
- Plan optional fields: `estimated_time`, `guidance_notes`, `current_state`, `target_state`
- TaskNote required fields: `$schema`, `schema_version`, `task_id`, `title`, `goal`, `priority`, `file_inventory`, `phases`
- TaskNote optional fields: `metadata`, `summary`, `guidance_notes`
- Four-phase TaskNote workflow defined with step tracking via `status` and `progress`

Migration guidance:

- When adding fields, bump `schema_version` and document changes here
- Avoid breaking changes; if unavoidable, provide transformation notes and example diffs

