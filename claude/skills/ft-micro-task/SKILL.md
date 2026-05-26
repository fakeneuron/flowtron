---
name: ft-micro-task
description: Start and complete a flowtron micro-tasknote in one shot. Invoke with the task ID as args (e.g., args="CORE-050"). For tasks above the skip-tasknote threshold but small enough to skip the full 4-phase ceremony — single-section tasknote (do-the-work + recap), no Phase 3 boilerplate when no code changed, one closure step. See SPEC §"When to use a tasknote" for the threshold.
---

# micro-task — flowtron micro-tasknote runner

You are starting **and completing** a micro-tasknote for the task ID provided in `args` (e.g., `CORE-050`). The full workflow contract lives in flowtron's `SPEC.md` — this skill is the executable interpretation, not a replacement. Treat SPEC.md as authoritative when this file is silent or in tension.

A **micro-tasknote** is a single-section lightweight tasknote for tasks above the skip-tasknote threshold (more than a one-line typo, more than ~10 doc lines) but small enough that the full 4-phase ceremony is overkill — typically tasks under ~30 minutes of effort: small audits, focused doc patches, single-file behavior tweaks with no design tradeoffs to record. The non-negotiable contracts (relevance, drift, archive skim, pattern survey) survive as **bold-prefix prompts** in a single `## ⚡ Notes` section rather than checklist boxes. Closure is one step (recap + flip PLAN + archive).

This skill is **file + execute (one-shot)**: it scaffolds the lightweight tasknote, drives execution inline, and closes — all in a single conversation. Compare with `/ft-task` (full 4-phase flow for normal-size tasks) and `/ft-starter-task` (filing-only for tasks discovered with rich context but not ready to start).

If `args` is missing or its first token doesn't match `<AREA>-<NUMBER>` (or `<AREA>-<NUMBER>.<SUB>` for epic subtasks), stop and ask the user for a valid task ID. Do not guess. A trailing `--fast` / `-f` flag is the only other accepted token — see Step 0.

## Step 0 — Resolve paths

Two layouts. Pick by which file exists:

- **Adopter project:** `_project/flowtron/SPEC.md` exists → `<root>` = `_project/flowtron/`.
- **Flowtron self-host:** repo-root `SPEC.md` with heading `# Flowtron — Workflow Specification` → `<root>` = repo-root.

If neither matches, bail.

Paths this skill uses:
- SPEC: `<root>SPEC.md` (always loaded core)
- SPEC_DIR (lazy modules `epic.md` · `model.md`): `<root>SPEC/`
- SKILL_DIR (lazy fragment `step-1.5-model-edge.md`): `<root>claude/skills/ft-micro-task/`
- Micro template: `<root>templates/tasknote-micro-template.md`
- PLAN: `_project/PLAN.md`, tasknote dir: `_project/tasknote/` (always)

Step 1.5 Reads `<SPEC_DIR>/model.md` and `<SKILL_DIR>/step-1.5-model-edge.md` in parallel.

**Parse `args`.** Split on whitespace into `(TASK-ID, rest...)`. Branch on `rest`:

- **Empty** → set internal flag `fast-mode = false` and continue to Step 1.
- **`--fast` or `-f`** → set `fast-mode = true`. Emit exactly one inline marker after path resolution: `⚡ --fast active — 📦 signal trips suppressed at Step 5; Re-scope still promotes to /ft-task, De-scope still recaps.` Continue to Step 1.
- **Any other trailing arg** → surface a one-line usage notice (``Unknown arg `<arg>`. Usage: `/ft-micro-task <TASK-ID>` or `/ft-micro-task <TASK-ID> --fast`.``) and ask via AskUserQuestion whether the user meant `--fast`, the default flow, or to abort. Do not proceed silently.

`fast-mode` in `/ft-micro-task` targets Step 5's Conditional skip rule — `/ft-micro-task` has no banner-block Phase 1→2 gate and no separate 👁️ ask, so the 📦 fire branch is the only suppressible gate. Default flow (`fast-mode = false`) is byte-identical to the pre-flag skill — see SPEC §"Operator-gate cues" for the contract.

## Step 1 — Locate the task in PLAN.md and pre-flight

Read PLAN.md. Find the line containing `**<TASK-ID>**`. If the ID isn't in PLAN.md, stop and ask the user whether to add it or use a different ID. Do not invent an entry. (Filing-on-the-fly is out of scope for `/ft-micro-task`; the PLAN.md entry must already exist.)

**Status gate (non-negotiable).** Re-read the PLAN.md line. If it is checked (`- [x]`) or lives under `## Completed`, stop. The task is already closed. Surface the conflict and ask whether the user meant a different ID. Do this check by re-reading the PLAN.md line — never infer status from prior conversation context.

Otherwise, capture from the line:

- The optional `[model]` segment (`[heavy]` / `[light]` primary recommended; specific names e.g. `opus` / `sonnet` / `grok` remain valid per SPEC §"Model field") — see Step 1.5
- The optional `| shortname` segment
- The one-line long description (everything after ` — `; may be empty)
- The section heading the line lives under (`High` / `Medium` / `Low` / `Future Opportunities`) — this is the task's **Priority**

The full task-line grammar is `- [ ] **TASK-ID** [!critical] [model] | shortname — long description`. See SPEC §"Task-line format" for the canonical grammar.

**Filing-discipline check (advisory).** Word-count the captured long description. If it exceeds the 70-word hard cap from SPEC §"PLAN.md filing-discipline thresholds", surface a one-line warning to the user — informational only; proceed.

**Pre-flight checks:**

- Resolve the **Area** from the task ID prefix per SPEC §"Task ID convention". Unknown prefix → read `_project/tasknote/README.md`; if still unresolved, stop and ask.
- **Epic-ID dispatch.** If the TASK-ID is `<AREA>-EPIC-<N>` or `<AREA>-<N>.<sub>`, Read `<SPEC_DIR>/epic.md` for the lifecycle contract before continuing. (Micro-tasknotes for epic subtasks are valid — same lifecycle, lighter ceremony.)
- If `_project/tasknote/<TASK-ID>.md` already exists: stop. The tasknote is in flight or already closed-but-not-archived. Surface the conflict; recommend the user continue conversationally rather than restarting.
- If `_project/tasknote/archive/<area>/<TASK-ID>.md` already exists: stop. The task is closed and archived. Surface the conflict.

## Step 1.5 — Model gate (BEFORE scaffolding)

Gate on the `[model]` segment captured in Step 1 before any source reads — heavy thinking shouldn't run on the wrong model. The active model is whatever the assistant is currently running as (ask the user if uncertain).

- **Matches active model** → proceed silently to Step 2.
- **Differs from active model** → STOP. Read `<SPEC_DIR>/model.md` + `<SKILL_DIR>/step-1.5-model-edge.md` in parallel, then follow the "Mismatch" branch.
- **Absent (legacy line)** → Read `<SPEC_DIR>/model.md` + `<SKILL_DIR>/step-1.5-model-edge.md` in parallel, then follow the "Legacy entry" branch.

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

Run the protocol per SPEC §"Post-closure protocol", branching on SPEC §"Conditional skip rule". `/ft-micro-task` carries no 📦 banner — its commit-go is a prose ask, not a banner block — but the same rule applies:

- **Skip branch** (signals clear) — emit `✅ Closure complete; committing autonomously (<concrete-signal-summary>).` (e.g., `single-file doc patch; no frontend/privileged surface`), then run recap + commit + 🏁 state-marker + suggest-next-move + copy-paste line in one response. Micro-tasknotes hit this branch often by design — their threshold aligns with the rule's clean-diff target.
- **Fire branch** (any signal hits) — surface the prose commit-go ask ("Ready to commit? Reply `commit`/`go`/`yes`."). Never commit unprompted. After commit, same continuous flow.

**`--fast` override.** When `fast-mode = true` (from Step 0), force the Skip branch regardless of signal trips. Name the suppressed signals in the marker for transparency (e.g., `✅ Closure complete; committing autonomously (frontend files touched; suppressed via --fast).`).

Skill-specific:
- **Commit message:** `feat: <TASK-ID> — <title>` (or `fix:` / `docs:` / `chore:`). Scaffold + closure typically bundle into one commit alongside the code/doc change.
- Name the recommended model alongside the next task ID (read from its PLAN line).
- Copy-paste helper: emit a short visual cue of the form "Clear your session, then use 🔧 /<next-skill> <ID>" (or equivalent tight phrasing). Never emit a literal `/clear then /model ...` instruction in the user-facing suggestion. When printing the suggest-next list, use only emoji primary labels + "design vs mechanical" prose (drop bare `[light]🔧` tokens from the visible output).

## Notes

- **Routing:** see SPEC §"When to use a tasknote (and when not to)" micro carve-out. `/ft-micro-task`'s niche: above the skip threshold but under ~30 minutes, single-file, no design tradeoffs. Multi-file / design tradeoffs / >30min → `/ft-task` (the 4-phase ceremony pays for itself). Filing-only mid-flow → `/ft-starter-task` or `/ft-file-followup`. If unsure, default to `/ft-task`.
- **Sub-tasks of an epic** (`<AREA>-<NUMBER>.<SUB>`) follow the same flow. The parent epic line is not flipped to complete until all children are. Full lifecycle in `<SPEC_DIR>/epic.md`.
