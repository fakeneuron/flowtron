# Compatibility Mapping (FinTown → Flowtron)

Map existing plan/tasknote fields to Flowtron's generic schema.

## Entities

- Plan: `plan_id`, `last_updated`, `vision`, `next_priority`, `tasks[]`
- TaskNote: `task_id`, `priority`, `file_inventory`, `phases[]`, `metadata`, `summary`

## Notes

- Preserve original semantics; avoid destructive changes.
- Capture any unmapped fields under `metadata.tags` as a temporary measure.
