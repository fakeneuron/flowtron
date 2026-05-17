---
name: ft-micro-task
description: Start and complete a flowtron micro-tasknote in one shot. Invoke with the task ID as args (e.g., args="CORE-050"). For tasks above the skip-tasknote threshold but small enough to skip the full 4-phase ceremony — single-section tasknote (do-the-work + recap), no Phase 3 boilerplate when no code changed, one closure step. See SPEC §"When to use a tasknote" for the threshold.
---

# micro-task — flowtron micro-tasknote runner

You are starting **and completing** a micro-tasknote for the task ID provided in `args` (e.g., `CORE-050`). The full workflow contract lives in flowtron's `SPEC.md` — this skill is the executable interpretation, not a replacement. Treat SPEC.md as authoritative when this file is silent or in tension.

A **micro-tasknote** is a single-section lightweight tasknote for tasks above the skip-tasknote threshold (more than a one-line typo, more than ~10 doc lines) but small enough that the full 4-phase ceremony is overkill — typically tasks under ~30 minutes of effort: small audits, focused doc patches, single-file behavior tweaks with no design tradeoffs to record. The non-negotiable contracts (relevance, drift, archive skim, pattern survey) survive as **bold-prefix prompts** in a single `## ⚡ Notes` section rather than checklist boxes. Closure is one step (recap + flip PLAN + archive).

This skill is **file + execute (one-shot)**: it scaffolds the lightweight tasknote, drives execution inline, and closes — all in a single conversation. Compare with `/ft-task` (full 4-phase flow for normal-size tasks) and `/ft-starter-task` (filing-only for tasks discovered with rich context but not ready to start).

If `args` is missing or doesn't match `<AREA>-<NUMBER>` (or `<AREA>-<NUMBER>.<SUB>` for epic subtasks), stop and ask the user for a valid task ID. Do not guess.

## Step 0 — Resolve paths

Determine which repo you're in:

- **Adopting project (typical):** `_project/flowtron/SPEC.md` exists. Use:
  - SPEC: `_project/flowtron/SPEC.md`
  - SPEC_DIR (lazy SPEC modules): `_project/flowtron/SPEC/`
  - SKILL_DIR (lazy SKILL fragments): `_project/flowtron/claude/skills/ft-micro-task/`
  - Micro template: `_project/flowtron/templates/tasknote-micro-template.md`
  - PLAN: `_project/PLAN.md`
  - Tasknote dir: `_project/tasknote/`
- **Flowtron itself (self-hosted):** repo-root `SPEC.md` exists with the heading `# Flowtron — Workflow Specification`. Use:
  - SPEC: `SPEC.md`
  - SPEC_DIR (lazy SPEC modules): `SPEC/`
  - SKILL_DIR (lazy SKILL fragments): `claude/skills/ft-micro-task/`
  - Micro template: `templates/tasknote-micro-template.md`
  - PLAN: `_project/PLAN.md`
  - Tasknote dir: `_project/tasknote/`

If neither layout matches, stop and tell the user this directory doesn't look like a flowtron-using project.

`SPEC.md` is the always-loaded core. `SPEC_DIR/` holds lazy SPEC modules (`epic.md`, `model.md`); `SKILL_DIR/` holds the lazy `step-1.5-model-edge.md` fragment. Each subsequent step names the modules to read; Step 1.5 Reads both `<SPEC_DIR>/model.md` and `<SKILL_DIR>/step-1.5-model-edge.md` in parallel.

## Step 1 — Locate the task in PLAN.md and pre-flight

Read PLAN.md. Find the line containing `**<TASK-ID>**`. If the ID isn't in PLAN.md, stop and ask the user whether to add it or use a different ID. Do not invent an entry. (Filing-on-the-fly is out of scope for `/ft-micro-task`; the PLAN.md entry must already exist.)

**Status gate (non-negotiable).** Re-read the PLAN.md line. If it is checked (`- [x]`) or lives under `## Completed`, stop. The task is already closed. Surface the conflict and ask whether the user meant a different ID. Do this check by re-reading the PLAN.md line — never infer status from prior conversation context.

Otherwise, capture from the line:

- The optional `[model]` segment (`opus` | `sonnet`) — see Step 1.5
- The optional `| shortname` segment
- The one-line long description (everything after ` — `; may be empty)
- The section heading the line lives under (`Critical` / `High` / `Medium` / `Low` / `Future Opportunities`) — this is the task's **Priority**

The full task-line grammar is `- [ ] **TASK-ID** [model] | shortname — long description`. See SPEC §"Task-line format" for the canonical grammar.

**Filing-discipline check (advisory).** Word-count the captured long description. If it exceeds the 70-word hard cap from SPEC §"PLAN.md filing-discipline thresholds", surface a one-line warning to the user — informational only; proceed.

**Pre-flight checks:**

- Resolve the **Area** from the task ID prefix per SPEC §"Task ID convention". Unknown prefix → read `_project/tasknote/README.md`; if still unresolved, stop and ask.
- **Epic-ID dispatch.** If the TASK-ID is `<AREA>-EPIC-<N>` or `<AREA>-<N>.<sub>`, Read `<SPEC_DIR>/epic.md` for the lifecycle contract before continuing. (Micro-tasknotes for epic subtasks are valid — same lifecycle, lighter ceremony.)
- If `_project/tasknote/<TASK-ID>.md` already exists: stop. The tasknote is in flight or already closed-but-not-archived. Surface the conflict; recommend the user continue conversationally rather than restarting.
- If `_project/tasknote/archive/<area>/<TASK-ID>.md` already exists: stop. The task is closed and archived. Surface the conflict.

## Step 1.5 — Model gate (BEFORE scaffolding)

The model decision is made at filing time on the PLAN.md task line. Gate on it now, before reading source files or scaffolding — heavy thinking should never run on the wrong model.

Three cases (decide via the `[model]` segment captured in Step 1):

- **PLAN.md `[model]` matches the active model** → proceed silently to Step 2.
- **PLAN.md `[model]` differs from the active model** → STOP. Read `<SPEC_DIR>/model.md` (contract) and `<SKILL_DIR>/step-1.5-model-edge.md` (operational steps), then follow the "Mismatch" branch.
- **PLAN.md `[model]` is absent (legacy entry, no `[model]` on the line)** → Read `<SPEC_DIR>/model.md` (contract) and `<SKILL_DIR>/step-1.5-model-edge.md` (operational steps), then follow the "Legacy entry" branch.

The active model is whatever the assistant is currently running as (visible in the runtime; if uncertain, ask the user).

## Step 2 — Scaffold the micro-tasknote

Copy the micro template (path resolved in Step 0) to `_project/tasknote/<TASK-ID>.md`. Frontmatter and body shape: see SPEC §"Tasknote frontmatter" + §"Tasknote body shape" + §"When to use a tasknote (and when not to)" micro carve-out for the `## ⚡ Notes` / `## ✅ Recap` skeleton.

**Skill-specific scaffold values:**

- `title:` — prefer PLAN.md `| shortname` (Step 1); else derive from long description.
- `status:` `in-progress`. `created:` today (`YYYY-MM-DD`). `tags:` / `due:` / `related-tasks:` from PLAN.md line context; default empty.
- 🎯 Goal — derived from the PLAN.md line; ask if too terse for a one-sentence goal.
- ⚡ Notes ships with bold-prefix prompts in place (filled in Step 3); ✅ Recap is placeholder (filled in Step 4).

## Step 3 — Drive execution inline

Fill the four bold-prefix prompts in `## ⚡ Notes` before touching code. They mirror SPEC §"📝 Phase 1: Discovery" (Relevance / Drift / Archive skim) + §"🛠️ Phase 2: Execution" (Pattern survey).

Skill-specific imperatives on top of the SPEC contracts:

- **Relevance:** if `Re-scope`, a meaningful re-scope usually means promote to `/ft-task` — archive the micro and re-invoke `/ft-task <ID>`. If `De-scope`, jump to Step 4 with the de-scope rationale as the recap.
- **Archive skim recipe:** `ls _project/tasknote/archive/<area>/`, then `grep -l <path> _project/tasknote/archive/<area>/*.md` for source paths in scope. Read hits; log load-bearing findings inline. Empty archive → `no prior tasknotes` and move on.

Then **do the work**: minimal implementation, targeted tests + lint/type-check on changed files. Update **Implementation** bold-prefix as you go (what changed, key decisions). At closure-readiness fill **Docs touched:** per `_project/tasknote/README.md` §"AI-referenced docs" (the micro-tasknote equivalent of `/ft-task`'s Phase 4 doc-drift sweep): "no change" or the specific update.

If a hard dependency surfaces, abandon the micro-tasknote and re-file as `/ft-task` (or `/ft-starter-task`) — micro-tasks are not designed to park. Surface and ask.

## Step 4 — Recap and close

The single closure step. In one motion:

1. **Fill ✅ Recap** — brief final summary (what changed, key decisions).
2. **Set `Archived:`** — today's date (`YYYY-MM-DD`).
3. **Update PLAN.md** — flip the line to the stub form per SPEC §"`## Completed` archive convention" and move it to the `## Completed` section.
4. **Move the tasknote** — `mv _project/tasknote/<TASK-ID>.md _project/tasknote/archive/<area>/<TASK-ID>.md`.
5. **Recap to the user** per SPEC §"🚀 Phase 4: Closure" — brief summary + optional verification request. **Recap is recap-only**; the next-task suggestion belongs in Step 5, not the recap. Wait for confirmation.

Closure flips PLAN.md line + tasknote location; YAML `status:` stays `in-progress` per SPEC §"Tasknote body shape".

## Step 5 — Post-closure protocol

Canonical protocol: SPEC §"Post-closure protocol", with the conditional skip rule for the commit-go gate in SPEC §"Post-closure protocol" §"Conditional skip rule".

Skill-specific orchestration:

- Evaluate the **conditional skip rule** against the closure diff. `/ft-micro-task` carries no explicit 📦 banner today — its commit-go is a prose ask, not a banner block — but the same rule applies: signals clear → autonomous-commit motion; signals fire → prose commit-go ask. Branch:
  - **Skip branch** (zero frontend files AND zero privileged-ops paths AND no perf-narrative concern) — emit the inline marker `✅ Closure complete; committing autonomously (<concrete-signal-summary>).` (e.g., `single-file doc patch; no frontend/privileged surface`), then run recap + commit + 🏁 state-marker + suggest-next-move + copy-paste line in a single response. Do not surface the prose commit-go ask. Micro-tasknotes hit this branch often by design — their threshold ("small audits, focused doc patches, single-file behavior tweaks with no design tradeoffs") aligns with the rule's clean-diff target.
  - **Fire branch** (any signal hits — e.g., a single-file `viz/` tweak, an `auth/` config touch, a perf-narrative concern surfaced inline) — surface the prose commit-go ask ("Ready to commit? Reply `commit`/`go`/`yes`."). Confirm before committing — never commit unprompted.
- **One continuous flow** in both branches. On the fire branch the user's commit-go ("commit", "go", "yes") is the gate; on the skip branch the inline marker stands in for it. Suggest-next-move and copy-paste-line follow **in the same response as the commit confirmation** (skip branch: same response as the marker; fire branch: same response as the commit-go reply).
- **Commit message:** `feat: <TASK-ID> — <title>` (or `fix:` / `docs:` / `chore:`). Scaffold + closure typically bundle into one commit alongside the code/doc change.
- Name the recommended model alongside the next task ID.
- **Copy-paste line:** `/clear then /model <opus|sonnet> then /<ft-task|ft-micro-task|ft-starter-task> <NEXT-ID>` — substitute the next task's PLAN-line `[model]` and the right slash command.

## Notes

- **When NOT to use this skill** — see SPEC §"When to use a tasknote (and when not to)" micro carve-out. If the task touches multiple files, has design tradeoffs to record, or is likely to take more than ~30 minutes, use `/ft-task` instead. If unsure, default to `/ft-task` — the 4-phase ceremony pays for itself.
- **Compare with `/ft-task`** — full 4-phase flow with per-phase checklists; for normal-size tasks. **Compare with `/ft-starter-task`** — filing-only for tasks discovered mid-flow with rich context not ready to start. Each owns one workflow entry point.
- **Sub-tasks of an epic** (`<AREA>-<NUMBER>.<SUB>`) follow the same flow. The parent epic line is not flipped to complete until all children are. Full lifecycle in `<SPEC_DIR>/epic.md`.
