---
name: ft-starter-task
description: File a starter tasknote for a task discovered mid-flow with rich AI-captured context that isn't ready to start. Invoke with the task ID as args (e.g., args="CORE-028"). Writes _project/tasknote/<ID>.md from templates/tasknote-starter-template.md, appends the PLAN.md entry, and hands off without committing. See SPEC/starter.md for when to file.
---

# starter-task — flowtron starter filer

You are filing a **starter tasknote** for the task ID provided in `args`. The full lifecycle contract lives in `<SPEC_DIR>/starter.md` (resolve `SPEC_DIR` via Step 0); Read it before drafting the body. This skill is the executable interpretation, not a replacement — treat the SPEC module as authoritative when this file is silent or in tension.

A starter tasknote captures rich AI-discovered context (rationale, suspected files, design decisions, open questions) at filing time, without bloating the PLAN.md long description. The starter sits at `status: starter` until `/ft-task <ID>` checkout promotes it into a full tasknote.

If `args` is missing or doesn't match `<AREA>-<NUMBER>` (or `<AREA>-<NUMBER>.<SUB>` for epic subtasks), stop and ask the user for a valid task ID. Do not guess.

This skill is **filing-only** and assumes the AI already has rich context from the current conversation — rationale, design decisions, a file survey, open questions. If the conversation hasn't surfaced that yet, do not invoke this skill: file a one-line PLAN.md entry directly instead (see SPEC §"When to use a tasknote (and when not to)" for the threshold).

## Step 0 — Resolve paths

Two layouts. Pick by which file exists:

- **Adopter project:** `_project/flowtron/SPEC.md` exists → `<root>` = `_project/flowtron/`.
- **Flowtron self-host:** repo-root `SPEC.md` with heading `# Flowtron — Workflow Specification` → `<root>` = repo-root.

If neither matches, bail.

Paths: SPEC=`<root>SPEC.md`, SPEC_DIR=`<root>SPEC/`, starter template=`<root>templates/tasknote-starter-template.md`, PLAN=`_project/PLAN.md`, tasknote dir=`_project/tasknote/`.

After resolving, Read `<SPEC_DIR>/starter.md` for the canonical starter lifecycle before drafting the body.

## Step 1 — Pre-flight checks

- Resolve the **Area** from the task ID prefix per SPEC §"Task ID convention". Unknown prefix → read `_project/tasknote/README.md`; if still unresolved, stop and ask.
- The task ID must NOT already exist in PLAN.md. If it does, stop and ask whether the user meant a different ID — `/ft-starter-task` files NEW tasks; converting an existing PLAN.md entry to a starter is a manual edit (write the file, flip nothing in PLAN.md).
- `_project/tasknote/<TASK-ID>.md` must NOT already exist. If it does, stop. Surface the conflict (could be in-flight, blocked, completed, or already a starter).
- `_project/tasknote/archive/<area>/<TASK-ID>.md` must NOT already exist. If it does, stop — the ID has been used and archived; pick a fresh ID.

## Step 2 — Collect inputs

Use AskUserQuestion to confirm the key fields. Pre-populate from conversation context where possible — the AI proposes; the user confirms or overrides.

1. **Title (shortname)** — concise; up to ~30 chars. Used as the YAML `title:` and the H1.
2. **Priority** — `High | Medium | Low | Future Opportunities`. AI proposes its best read. For urgent rows, propose `High` with a `[!critical]` flag (see SPEC §"Task-line format").
3. **Model** — recommended: `opus | sonnet`; adopters may substitute project-specific tokens per SPEC §"Model field". AI proposes; goes on the PLAN.md task line, not in frontmatter.

Optional inputs the AI may pre-fill silently (user corrects on Step 3 review): `tags:` (visualizer filter), `due:` (only if the conversation specified a deadline), `related-tasks:` (wikilinks to predecessors / parent epic / follow-ups surfaced in conversation).

## Step 3 — Draft the starter body

Compose the `## 🌱 Starter context` body from conversation context using the canonical sub-headings in the starter template (path resolved in Step 0); drop any sub-heading with nothing genuine to capture (per `<SPEC_DIR>/starter.md`, Read in Step 0). The whole body remains under the single `## 🌱 Starter context` section.

**Surface the drafted body and proposed PLAN.md entry to the user for review before writing anything.** Edit per their feedback.

## Step 4 — Write the starter file

Copy the starter template (path resolved in Step 0), then fill it:

```sh
cp <starter template path> _project/tasknote/<TASK-ID>.md
```

In `_project/tasknote/<TASK-ID>.md`:

- Fill YAML frontmatter per SPEC §"Tasknote frontmatter" using Step 2 inputs. Skill-specific values: `title:` = the shortname from Step 2; `status: starter` (already correct from template); `created:` = today's date in `YYYY-MM-DD`.
- Replace the H1 with `# <TASK-ID> | <title>` (matching frontmatter `title:`).
- Update the nav header: replace `🌱 Starter (filed YYYY-MM-DD)` with `🌱 Starter (filed <today>)`; if conversation context warrants it, append `· 🔗 [[RELATED]]` chips mirroring `related-tasks:`.
- Replace the `## 🌱 Starter context` placeholder body with the Step 3 draft.

## Step 5 — Append the PLAN.md entry

Append a new entry under the appropriate `## <Priority>` heading. Use the canonical task-line grammar (SPEC §"Task-line format"):

```text
- [ ] **<TASK-ID>** [<model>] | <shortname> — <one-line long description>. Filed with starter at `_project/tasknote/<TASK-ID>.md`.
```

Placement:

- If the priority section already has entries, append to the bottom of that section.
- If the section carries a `(none)` placeholder, replace the placeholder with the new entry.

**Threshold check.** Word-count the long description (excluding the trailing `Filed with starter at ...` pointer) and apply SPEC §"PLAN.md filing-discipline thresholds". **Skill-specific override:** at >70w, if the user insists, document the rationale in the starter body's `## 🌱 Starter context` (under a `Why the line couldn't be trimmed` sub-heading) before writing. Do not silently breach the cap.

The starter body is the canonical home for rationale, file surveys, and decisions — moving content there is the point of `/ft-starter-task`.

## Step 6 — Hand off

Surface to the user, in one short message:

- Starter filed at `_project/tasknote/<TASK-ID>.md`.
- PLAN.md entry appended under `## <Priority>` with model `<model>`.
- The starter sits until `/ft-task <TASK-ID>` is invoked — that promotion will drift-check the captured context against current code and scaffold the rest of the tasknote (see `<SPEC_DIR>/starter.md` lifecycle).

Do **not** commit unprompted. The new starter file + PLAN.md flip are typically bundled into whatever commit the conversation produces (if any) or left for the user to handle. If the user asks for a commit, the message format is `chore: file <TASK-ID> starter — <shortname>`.

## Notes

- This skill is filing-only — no design decisions are made in the skill flow itself. All rich context comes from the prior conversation; the skill just records it.
- **Routing:** see SPEC §"When to use a tasknote (and when not to)". `/ft-starter-task`'s niche: rich AI-captured context (file survey, open questions, design decisions) for a task not yet ready to start. One-liner suffices → write the PLAN.md line directly. Starting an existing entry → `/ft-task`. Bootstrapping a fresh repo → `/ft-new-project`.
