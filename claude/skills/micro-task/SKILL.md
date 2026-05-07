---
name: micro-task
description: Start and complete a flowtron micro-tasknote in one shot. Invoke with the task ID as args (e.g., args="CORE-050"). For tasks above the skip-tasknote threshold but small enough to skip the full 4-phase ceremony — single-section tasknote (do-the-work + recap), no Phase 3 boilerplate when no code changed, one closure step. See SPEC §"When to use a tasknote" for the threshold.
---

# micro-task — flowtron micro-tasknote runner

You are starting **and completing** a micro-tasknote for the task ID provided in `args` (e.g., `CORE-050`). The full workflow contract lives in flowtron's `SPEC.md` — this skill is the executable interpretation, not a replacement. Treat SPEC.md as authoritative when this file is silent or in tension.

A **micro-tasknote** is a single-section lightweight tasknote for tasks above the skip-tasknote threshold (more than a one-line typo, more than ~10 doc lines) but small enough that the full 4-phase ceremony is overkill — typically tasks under ~30 minutes of effort: small audits, focused doc patches, single-file behavior tweaks with no design tradeoffs to record. The non-negotiable contracts (relevance, drift, archive skim, pattern survey) survive as **bold-prefix prompts** in a single `## ⚡ Notes` section rather than checklist boxes. Closure is one step (recap + flip PLAN + archive).

This skill is **file + execute (one-shot)**: it scaffolds the lightweight tasknote, drives execution inline, and closes — all in a single conversation. Compare with `/task` (full 4-phase flow for normal-size tasks) and `/starter-task` (filing-only for tasks discovered with rich context but not ready to start).

If `args` is missing or doesn't match `<AREA>-<NUMBER>` (or `<AREA>-<NUMBER>.<SUB>` for epic subtasks), stop and ask the user for a valid task ID. Do not guess.

## Step 0 — Resolve paths

Determine which repo you're in:

- **Adopting project (typical):** `_project/flowtron/SPEC.md` exists. Use:
  - SPEC: `_project/flowtron/SPEC.md`
  - SPEC_DIR (lazy modules): `_project/flowtron/SPEC/`
  - Micro template: `_project/flowtron/templates/tasknote-micro-template.md`
  - PLAN: `_project/PLAN.md`
  - Tasknote dir: `_project/tasknote/`
- **Flowtron itself (self-hosted):** repo-root `SPEC.md` exists with the heading `# Flowtron — Workflow Specification`. Use:
  - SPEC: `SPEC.md`
  - SPEC_DIR (lazy modules): `SPEC/`
  - Micro template: `templates/tasknote-micro-template.md`
  - PLAN: `_project/PLAN.md`
  - Tasknote dir: `_project/tasknote/`

If neither layout matches, stop and tell the user this directory doesn't look like a flowtron-using project.

`SPEC.md` is the always-loaded core. `SPEC_DIR/` holds lazy modules (`epic.md`, `starter.md`, `blocked.md`, `model.md`, `versioning.md`) — load each only when the relevant branch fires (Step 1.5 model-gate, Step 1 epic-ID prefix). Each subsequent step names the module to read explicitly.

## Step 1 — Locate the task in PLAN.md and pre-flight

Read PLAN.md. Find the line containing `**<TASK-ID>**`. If the ID isn't in PLAN.md, stop and ask the user whether to add it or use a different ID. Do not invent an entry. (Filing-on-the-fly is out of scope for `/micro-task`; the PLAN.md entry must already exist.)

**Status gate (non-negotiable).** Re-read the PLAN.md line. If it is checked (`- [x]`) or lives under `## Completed`, stop. The task is already closed. Surface the conflict and ask whether the user meant a different ID. Do this check by re-reading the PLAN.md line — never infer status from prior conversation context.

Otherwise, capture from the line:

- The optional `[model]` segment (`opus` | `sonnet`) — see Step 1.5
- The optional `| shortname` segment
- The one-line long description (everything after ` — `; may be empty)
- The section heading the line lives under (`Critical` / `High` / `Medium` / `Low` / `Future Opportunities`) — this is the task's **Priority**

The full task-line grammar is `- [ ] **TASK-ID** [model] | shortname — long description`. See SPEC §"Task-line format" for the canonical grammar.

**Filing-discipline check (advisory).** Word-count the captured long description. If it exceeds the 70-word hard cap from SPEC §"PLAN.md filing-discipline thresholds", surface a one-line warning to the user — informational only; proceed.

**Pre-flight checks:**

- Resolve the **Area** from the ID prefix using SPEC §"Task ID convention":
  - `CORE-` → core, `BE-` → backend, `FE-` → frontend, `DB-` → database, `DEPLOY-` → deployment, `TEST-` → testing
  - Unknown prefix: read `_project/tasknote/README.md` for project-specific prefixes. If still unresolved, stop and ask.
- **Epic-ID dispatch.** If the TASK-ID is `<AREA>-EPIC-<N>` or `<AREA>-<N>.<sub>`, Read `<SPEC_DIR>/epic.md` for the lifecycle contract before continuing. (Micro-tasknotes for epic subtasks are valid — same lifecycle, lighter ceremony.)
- If `_project/tasknote/<TASK-ID>.md` already exists: stop. The tasknote is in flight or already closed-but-not-archived. Surface the conflict; recommend the user continue conversationally rather than restarting.
- If `_project/tasknote/archive/<area>/<TASK-ID>.md` already exists: stop. The task is closed and archived. Surface the conflict.

## Step 1.5 — Model gate (BEFORE scaffolding)

The model decision is made at filing time on the PLAN.md task line. Gate on it now, before reading source files or scaffolding — heavy thinking should never run on the wrong model.

Three cases (decide via the `[model]` segment captured in Step 1):

- **PLAN.md `[model]` matches the active model** → proceed silently to Step 2.
- **PLAN.md `[model]` differs from the active model** → STOP. Read `<SPEC_DIR>/model.md` for the full contract, then surface the mismatch and offer two paths via AskUserQuestion:
  1. "Switch active model: I'll stop. Run `/model <PLAN-model>` then re-invoke `/micro-task <TASK-ID>`." (recommended)
  2. "Retag the PLAN.md line to `<active-model>` and proceed." If chosen, edit the PLAN.md line's `[model]` segment in place, then proceed to Step 2.
  Do not silently override.
- **PLAN.md `[model]` is absent (legacy entry)** → Read `<SPEC_DIR>/model.md`, then ask the user via AskUserQuestion to choose `opus` or `sonnet`. Write `[<chosen>]` into the PLAN.md line in place, then proceed to Step 2.

The active model is whatever the assistant is currently running as (visible in the runtime; if uncertain, ask the user).

## Step 2 — Scaffold the micro-tasknote

Copy the micro template (path resolved in Step 0) to `_project/tasknote/<TASK-ID>.md`. The frontmatter schema is canonical in SPEC §"Tasknote frontmatter"; the body shape is a micro-specific variant of SPEC §"Tasknote body shape" (see SPEC §"When to use a tasknote" micro carve-out).

**Skill-specific values at scaffold time:**

- `title:` — prefer the PLAN.md `| shortname` (Step 1) when present; otherwise derive from the long description.
- `status:` — `in-progress`.
- `created:` — today's date (`YYYY-MM-DD`).
- `tags:` / `due:` / `related-tasks:` — from PLAN.md line context where applicable; default to empty.
- H1 — `# <TASK-ID> | <title>`.
- Nav header — `[← PLAN.md](../PLAN.md) · 🟢 In progress` plus `· 🔗 [[RELATED]]` chips if `related-tasks:` is non-empty.
- 🎯 Goal — derived from the PLAN.md line at scaffold; ask the user if it's too terse for a clear one-sentence goal.
- ⚡ Notes — leave the bold-prefix prompts in place as scaffolding; they get filled during Step 3.
- ✅ Recap — leave the placeholder; filled at Step 4.

## Step 3 — Drive execution inline

Walk through the four bold-prefix prompts in `## ⚡ Notes` and fill each before touching code. They mirror the non-negotiable Phase 1 + Phase 2 contracts from `/task`'s 4-phase flow:

1. **Relevance:** State `Proceed` / `Re-scope` / `De-scope` with a one-line rationale. If `Re-scope`, update the PLAN.md line and the tasknote header before continuing — but a meaningful re-scope usually means this should be a full `/task`, not a micro-task; surface that to the user and consider archiving the micro and re-invoking `/task <ID>`. If `De-scope`, jump straight to Step 4 with the de-scope rationale as the recap.
2. **Drift check:** Read each path, line number, function name, and root-cause hypothesis cited in the PLAN.md description. Confirm they match current code; surface any drift to the user before re-interpreting the task.
3. **Archive skim:** `ls _project/tasknote/archive/<area>/`, then `grep -l <path> _project/tasknote/archive/<area>/*.md` for source paths in scope. Read hits and log anything load-bearing inline. If `archive/<area>/` is empty or absent, write `no prior tasknotes` and move on.
4. **Pattern survey:** Read sibling modules / parallel components for an existing shape to extend; justify a new shape if none fits.

Then **do the work**: minimal implementation, targeted tests on changed files where they matter, lint/type-check on changed code. Update the **Implementation** bold-prefix line as you go (ad-hoc free text — what changed, key decisions, anything load-bearing for future readers).

If a hard dependency surfaces mid-execution that wasn't visible at relevance, the right move is usually to abandon the micro-tasknote and re-file as a normal `/task` (or `/starter-task`) — micro-tasks are not designed to park. Surface the situation and ask.

## Step 4 — Recap and close

The single closure step. In one motion:

1. **Fill ✅ Recap** — brief final summary: what changed, key decisions, anything an audit pass should know.
2. **Set `Archived:`** — today's date (`YYYY-MM-DD`).
3. **Update PLAN.md** — flip the line to the stub form `- [x] **<TASK-ID>** [model] | shortname — Completed YYYY-MM-DD.` per SPEC §"`## Completed` archive convention" (drop the long description — the archived tasknote is the canonical record), and move it to the `## Completed` section.
4. **Move the tasknote** — `mv _project/tasknote/<TASK-ID>.md _project/tasknote/archive/<area>/<TASK-ID>.md`.
5. **Recap to the user** — brief summary of what changed and key decisions, plus an optional verification request (one concrete thing for the user to check before they confirm). **Recap is recap-only — do not include the next-task suggestion until the commit lands (Step 5); see SPEC §"🚀 Phase 4: Closure" callout.** Wait for confirmation.

Closure flips two places (PLAN.md line + tasknote location); the YAML `status:` stays `in-progress` per SPEC §"Tasknote body shape" (visualizers compute the canonical chip from YAML at render time; archived tasknote's YAML may lag — intentional and matches `/task`'s closure shape).

## Step 5 — Post-closure protocol

The three-step protocol (commit / suggest next move / offer copy-paste line) is canonical in SPEC §"Post-closure protocol".

Skill-specific orchestration on top of the SPEC contract:

- The motion is **one continuous flow**. The user's commit-go (e.g. "commit", "go", "yes") is the *only* gate; once the commit lands, the suggest-next-move and copy-paste-line steps follow **in the same response as the commit confirmation**.
- Confirm with the user before committing — do not commit unprompted.
- Commit message format: `feat: <TASK-ID> — <title>` or `fix:` / `docs:` / `chore:` as appropriate. The micro-tasknote scaffold + closure typically bundle into a single commit alongside the code/doc change.
- When suggesting the next move, name the recommended model alongside the task ID.
- The copy-paste line is `/clear then /model <opus|sonnet> then /<task|micro-task|starter-task> <NEXT-ID>` — you cannot run `/clear` yourself. Substitute the next task's PLAN-line `[model]` tag for `<opus|sonnet>` and the appropriate slash command for the alternation so the user pastes a fully resolved line.

## Notes

- **When NOT to use this skill** — see SPEC §"When to use a tasknote (and when not to)" micro carve-out. If the task touches multiple files, has design tradeoffs to record, or is likely to take more than ~30 minutes, use `/task` instead. If unsure, default to `/task` — the 4-phase ceremony pays for itself.
- **Compare with `/task`** — full 4-phase flow with per-phase checklists; for normal-size tasks. **Compare with `/starter-task`** — filing-only for tasks discovered mid-flow with rich context not ready to start. Each owns one workflow entry point.
- **Sub-tasks of an epic** (`<AREA>-<NUMBER>.<SUB>`) follow the same flow. The parent epic line is not flipped to complete until all children are. Full lifecycle in `<SPEC_DIR>/epic.md`.
- **Date format:** always use `YYYY-MM-DD` for `created:`, `Completed`, and `Archived` fields.
