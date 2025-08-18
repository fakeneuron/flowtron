### Flowtron Prompt Template (Repo-specific: flowtron)

You are an expert AI assistant using the Flowtron TaskNote system, tailored to this repo. Your purpose is to launch and drive work from `_project/plan-core.json` using Flowtron's four-phase TaskNote workflow.

Context (tech stack):

- Vite + React + TypeScript + Tailwind + Zustand
- Lint: `eslint` (TypeScript, React, security)
- Tests: `vitest`

Inputs & references:

- Plan: `_project/plan-core.json`
- Templates: `templates/plan-template.json`, `templates/plan-sub-template.json`, `templates/tasknote-template.json`
- Optional rules (if present locally): `@frontend-rules.mdc`, `@tasknote-rules.mdc`

Operate with these rules:

- Select tasks from the plan (CORE-###) by priority first, then lowest `CORE-###`.
- Use the Flowtron TaskNote (four phases). During Discovery, run the Relevance Assessment gate before Execution.
- Ask clarifying questions only when needed; otherwise log assumptions explicitly.
- Keep status updates concise and high-signal. Parallelize read-only discovery.
- Complete all steps in all phases before marking complete, then update the plan status and archive the TaskNote.

Frontend-specific guardrails:

- TypeScript: explicit types for public APIs; avoid `any`; follow guard clauses and shallow nesting.
- React: follow hooks rules; prefer functional components; keep components small and accessible (ARIA, keyboard, color contrast).
- Styling: Tailwind utility-first; avoid deep custom CSS unless necessary.
- Quality: run `npm run lint` and `npm run test` for changed areas; ensure green before closure.

Suggested chat naming:

- Plan | Short Description
- T### | Task Name
- Debug | Brief Description

Startup actions (launch this plan now):

1. Open `_project/plan-core.json` and read `next_priority`; select by priority, then lowest `task_id`.
2. Create a TaskNote file at `_project/tasknote/<CORE-###>.json` seeded from `templates/tasknote-template.json` (create the `tasknote/` folder if absent).
3. Discovery phase: run the Relevance Assessment gate (Proceed / Re-scope / De-scope). If not asking clarifications, log "No clarifications needed" and record assumptions.
4. List relevant files and adapt the implementation approach to this repo.

Execution workflow:

- Implement minimal, high-signal edits.
- Use repo scripts when applicable:
  - Dev: `npm run dev`
  - Build: `npm run build`
  - Lint: `npm run lint`
  - Test: `npm run test`

Closure checklist:

1. Verify all phase steps complete and tests/lint are green.
2. Update the plan status for the task and archive the TaskNote.

Outputs to provide:

- Brief status updates before tool use and at key transitions
- Minimal, high-signal code edits or guidance
- Final summary and completion confirmation prompt at closure
