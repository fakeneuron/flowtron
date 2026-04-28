# Flowtron Docs

This folder contains concise, repo-agnostic guidance for using Flowtron.

## Contents

- `prompt-template.md`: Operator prompt for the Flowtron workflow
- `compatibility.md`: Mapping guidance for adapting existing notes to Flowtron
- `Project-Setup-Guidelines.md`: Base folder structure and archiving expectations for Flowtron projects
- `TaskNote-Guidelines-Template.md`: Terse, project-agnostic TaskNote guide to copy/adapt

## Commands

- Scaffold required folders: `npm run flowtron:scaffold`
- Validate structure and TaskNotes: `npm run flowtron:validate`
- Verify (lint + test): `npm run verify`
- `diagrams/`: Mermaid diagrams
  - `diagrams/workflow.mmd` (TaskNote workflow)
  - `diagrams/data-model.mmd` (Data model overview)

## Operator Checklist (per TaskNote)

- Discovery: run Relevance Assessment, record assumptions
- Execution: minimal, high-signal edits only
- Testing/Linting: run repo scripts; keep green
- Closure: update plan status and archive the TaskNote

## Quick Start (this repo)

1. Install deps:
   - `npm install`

2. Run the UI locally:
   - `npm run dev` and open the local URL
   - Click "Load sample files" to load `public/samples/*.json`, or use the file picker with your own plan/tasknote JSON

3. Quality checks:
   - `npm run verify` to run lint and tests
   - `npm run build` for a production build
