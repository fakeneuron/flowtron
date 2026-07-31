---
name: ft-micro-task
description: Start and complete a flowtron micro-tasknote in one shot. Use when the user asks to start and finish a small task in one shot without the full 4-phase ceremony. Invoke with the task ID as args (e.g., args="CORE-050"). For tasks above the skip-tasknote threshold but small enough to skip the full 4-phase ceremony — single-section tasknote (do-the-work + recap), no Phase 3 boilerplate when no code changed, one closure step. See SPEC/tasknote-selection.md §"When to use a tasknote" for the threshold.
---

# micro-task — flowtron micro-tasknote runner

You are starting **and completing** a micro-tasknote for the task ID provided in `args` (e.g., `CORE-050`). The full workflow contract lives in flowtron's `SPEC.md` — this skill is the executable interpretation, not a replacement. Treat SPEC.md as authoritative when this file is silent or in tension.

A **micro-tasknote** is a single-section lightweight tasknote for tasks above the skip-tasknote threshold (more than a one-line typo, more than ~10 doc lines) but small enough that the full 4-phase ceremony is overkill — typically tasks under ~30 minutes of effort: small audits, focused doc patches, single-file behavior tweaks with no design tradeoffs to record. The non-negotiable contracts (relevance, drift, archive skim, best-practices review, and pattern survey) survive as **bold-prefix prompts** in a single `## ⚡ Notes` section rather than checklist boxes. Closure is one step (recap + flip PLAN + archive).

This skill is **file + execute (one-shot)**: it scaffolds the lightweight tasknote, drives execution inline, and closes — all in a single conversation. Compare with `/ft-task` (full 4-phase flow for normal-size tasks) and `/ft-starter-task` (filing-only for tasks discovered with rich context but not ready to start).

If `args` is missing or its first token doesn't match `<AREA>-<NUMBER>` (or `<AREA>-<NUMBER>.<SUB>` for epic subtasks), stop and ask the user for a valid task ID. Do not guess. A trailing `--fast` / `-f` flag is the only other accepted token — see Step 0.

## Step 0 — Resolve paths

Two layouts. Pick by which file exists:

- **Adopter project:** `.flowtron/core/SPEC.md` exists → `<root>` = `.flowtron/core/`.
- **Flowtron self-host:** repo-root `SPEC.md` with heading `# Flowtron — Workflow Specification` → `<root>` = repo-root.

If neither matches, bail.

Paths this skill uses:
- SPEC: `<root>SPEC.md` (always loaded core)
- SPEC_DIR (lazy modules `epic.md` · `model.md`): `<root>SPEC/`
- SKILL_DIR (lazy fragment `step-1.5-model-edge.md`): `<root>claude/skills/ft-micro-task/`
- Micro template: `<root>templates/tasknote-micro-template.md`
- PLAN: `.flowtron/PLAN.md`, tasknote dir: `.flowtron/tasknote/` (always)

Step 1.5 Reads `<SPEC_DIR>/model.md` and `<SKILL_DIR>/step-1.5-model-edge.md` in parallel on its edge-case branches (category under-tier / concrete mismatch / legacy); a satisfied tag proceeds without the read.

**Parse `args`.** Split on whitespace into `(TASK-ID, rest...)`. Branch on `rest`:

- **Empty** → set internal flag `fast-mode = false` and continue to Step 1.
- **`--fast` or `-f`** → set `fast-mode = true`. Emit exactly one inline marker after path resolution: `⚡ --fast active — 📦 signal trips suppressed at Step 5; Re-scope still promotes to /ft-task, De-scope still recaps.` Continue to Step 1.
- **Any other trailing arg** → surface a one-line usage notice (``Unknown arg `<arg>`. Usage: `/ft-micro-task <TASK-ID>` or `/ft-micro-task <TASK-ID> --fast`.``) and ask via AskUserQuestion whether the user meant `--fast`, the default flow, or to abort. Do not proceed silently.

`fast-mode` in `/ft-micro-task` targets Step 5's Conditional skip rule — `/ft-micro-task` has no banner-block Phase 1→2 gate and no separate 👁️ ask, so the 📦 fire branch is the only suppressible gate. Default flow (`fast-mode = false`) is byte-identical to the pre-flag skill — see SPEC/gates.md §"Operator-gate cues" for the contract.

## Step 1 — Locate the task in PLAN.md and pre-flight

Read PLAN.md. Find the line containing `**<TASK-ID>**`. If the ID isn't in PLAN.md, stop and ask the user whether to add it or use a different ID. Do not invent an entry. (Filing-on-the-fly is out of scope for `/ft-micro-task`; the PLAN.md entry must already exist.)

**Status gate (non-negotiable).** Re-read the PLAN.md line. If it is checked (`- [x]`) or lives under `## Completed`, stop. The task is already closed. Surface the conflict and ask whether the user meant a different ID. Do this check by re-reading the PLAN.md line — never infer status from prior conversation context.

Otherwise, capture from the line:

- The optional `[model]` segment (`[heavy]` / `[light]` primary recommended; specific names e.g. `opus` / `sonnet` / `grok` remain valid per SPEC §"Model field") — see Step 1.5
- The optional `| shortname` segment
- The one-line long description (everything after ` — `; may be empty)
- The section heading the line lives under (`High` / `Medium` / `Low` / `Future Opportunities`) — this is the task's **Priority**

The full task-line grammar is `- [ ] **TASK-ID** [!critical] [model] | shortname — long description`. See SPEC §"Task-line format" for the canonical grammar.

**Filing-discipline check (advisory).** Word-count the captured long description. If it exceeds the 70-word hard cap from SPEC/tasknote-selection.md §"PLAN.md filing-discipline thresholds", surface a one-line warning to the user — informational only; proceed.

**Pre-flight checks:**

- Resolve the **Area** from the task ID prefix per SPEC §"Task ID convention". Unknown prefix → read `.flowtron/tasknote/README.md`; if still unresolved, stop and ask.
- **Epic-ID dispatch.** If the TASK-ID is `<AREA>-EPIC-<N>` or `<AREA>-<N>.<sub>`, Read `<SPEC_DIR>/epic.md` for the lifecycle contract before continuing. (Micro-tasknotes for epic subtasks are valid — same lifecycle, lighter ceremony.)
- **Foreign-dirt gate (paper-complete guard).** Before scaffold writes, run `git status --porcelain`. If non-empty: **STOP**, surface the dirt list, ask the operator to commit / stash / discard themselves, then re-invoke. Do not auto-clean. See SPEC §"Paper-complete guard".
- If `.flowtron/tasknote/<TASK-ID>.md` already exists: stop. The tasknote is in flight or already closed-but-not-archived. Surface the conflict; recommend the user continue conversationally rather than restarting.
- If `.flowtron/tasknote/archive/<area>/<TASK-ID>.md` already exists: stop. The task is closed and archived. Surface the conflict.

## Step 1.5 — Model gate (BEFORE scaffolding)

Gate on the `[model]` segment captured in Step 1 before any source reads — heavy thinking shouldn't run on the wrong model. The active model is whatever the assistant is currently running as (ask the user if uncertain). A **concrete** tag (`opus`/`sonnet`/`grok`/…) is matched by exact identity; a **category** tag (`[heavy]`/`[medium]`/`[light]`) is matched by *tier*, not string — see `<SPEC_DIR>/model.md` §"Category-vs-concrete matching" for the tier ladder + rule.

- **Satisfied** — concrete tag equals the active model, OR a category tag whose tier the active model meets or exceeds (e.g. `[light]` on sonnet, `[heavy]` on opus) → proceed silently to Step 2.
- **Category under-tier** — a category tag tagged heavier than the active model's tier (e.g. `[heavy]` on a lower-tier model such as grok (medium) or haiku (light)) → Read `<SPEC_DIR>/model.md` + `<SKILL_DIR>/step-1.5-model-edge.md` in parallel, then follow the "Category under-tier" branch (⚠️ inline note, then proceed — not a STOP, not an auto-retag).
- **Concrete mismatch** — a concrete tag differs from the active model → STOP. Read `<SPEC_DIR>/model.md` + `<SKILL_DIR>/step-1.5-model-edge.md` in parallel, then follow the "Mismatch" branch.
- **Absent (legacy line)** → Read `<SPEC_DIR>/model.md` + `<SKILL_DIR>/step-1.5-model-edge.md` in parallel, then follow the "Legacy entry" branch.

## Step 2 — Scaffold the micro-tasknote

Copy the micro template (path resolved in Step 0) to `.flowtron/tasknote/<TASK-ID>.md`. Frontmatter and body shape: see SPEC §"Tasknote frontmatter" + §"Tasknote body shape" + §"When to use a tasknote (and when not to)" micro carve-out for the `## ⚡ Notes` / `## ✅ Recap` skeleton.

**Skill-specific scaffold values:**

- `title:` — prefer PLAN.md `| shortname` (Step 1); else derive from long description.
- `status:` `in-progress`. `created:` today (`YYYY-MM-DD`). `tags:` / `due:` / `related-tasks:` from PLAN.md line context; default empty.
- 🎯 Goal — derived from the PLAN.md line; ask if too terse for a one-sentence goal.
- ⚡ Notes ships with bold-prefix prompts in place (filled in Step 3); ✅ Recap is placeholder (filled in Step 4).

## Step 3 — Drive execution inline

Fill the five bold-prefix prompts in `## ⚡ Notes` before touching code. They mirror SPEC §"📝 Phase 1: Discovery" (Relevance / Best Practices Review / Drift / Archive skim) + §"🛠️ Phase 2: Execution" (Pattern survey).

Skill-specific imperatives on top of the SPEC contracts:

- **Relevance:** if `Re-scope`, a meaningful re-scope usually means promote to `/ft-task` — archive the micro and re-invoke `/ft-task <ID>`. If `De-scope`, jump to Step 4 with the de-scope rationale as the recap.
- **Archive skim recipe:** `ls .flowtron/tasknote/archive/<area>/`, then `grep -l <path> .flowtron/tasknote/archive/<area>/*.md` for source paths in scope. Read hits; log load-bearing findings inline. Empty archive → `no prior tasknotes` and move on.

Then **do the work**: extend an established pattern or justify a new one; check DRY and responsibility boundaries; refactor only when Acceptance requires it or the touched path would otherwise introduce duplication, obscure responsibility, or violate a dependency boundary. Record that reason and defer unrelated cleanup. Run targeted tests + lint/type-check on changed files, then confirm the canonical structural quality assertions for changed code (otherwise `N/A` with reason). Update **Implementation** bold-prefix as you go (what changed, key decisions). At closure-readiness fill **Docs touched:** per `.flowtron/tasknote/README.md` §"AI-referenced docs" (the micro-tasknote equivalent of `/ft-task`'s Phase 4 doc-drift sweep): "no change" or the specific update.

If a hard dependency surfaces, abandon the micro-tasknote and re-file as `/ft-task` (or `/ft-starter-task`) — micro-tasks are not designed to park. Surface and ask.

## Step 4 — Recap and close

The single closure step. Per SPEC §"Paper-complete guard", flip PLAN/archive only when deliverables are ready for the same atomic commit; flip **only this task's** line (no collateral Completed flips). In one motion:

1. **Fill ✅ Recap** — evidence-based final summary: changed paths/LOC where meaningful, verification results, refactors made or deferred with rationale, documentation verdict, and maintainability effect.
2. **Flip YAML `status:`** — `in-progress` → `completed`; set `Archived:` to today's date (`YYYY-MM-DD`).
3. **Update PLAN.md** — flip the line to the stub form per SPEC/tasknote-selection.md §"`## Completed` archive convention". For a standalone task, move the row to the top of `## Completed`; for an epic child, preserve its 2-space nesting beneath the active parent until `/ft-close-epic` moves the whole cohort.
4. **Move the tasknote** — `mv .flowtron/tasknote/<TASK-ID>.md .flowtron/tasknote/archive/<area>/<TASK-ID>.md`.
5. **Recap to the user** per SPEC §"🚀 Phase 4: Closure" — brief summary + optional verification request. **Recap is recap-only**; the next-task suggestion belongs in Step 5, not the recap. Wait for confirmation.

Closure flips three things — YAML `status:`, the PLAN.md line, and the tasknote location — matching `/ft-task`'s Phase 4 per SPEC §"🚀 Phase 4: Closure". The `status:` write lands while the tasknote is still active, so SPEC §"Tasknote frontmatter" write-once does not reach it. Do not treat archive/Completed as done until Step 5's commit lands with deliverables.

## Step 5 — Post-closure protocol

Run the protocol per SPEC §"Post-closure protocol" + §"Paper-complete guard", branching on SPEC/gates.md §"Conditional skip rule". `/ft-micro-task` carries no 📦 banner — its commit-go is a prose ask, not a banner block — but the same rule applies. Stage deliverables + PLAN + archive together; 🏁 only after a real deliverable-covering SHA (`git show --name-only`); never invent a SHA. Paper-complete guard is **not** suppressed by `--fast`.

- **Skip branch** (signals clear) — emit `✅ Closure complete; committing autonomously (<concrete-signal-summary>).` (e.g., `single-file doc patch; no frontend/privileged surface`), then run recap + commit + deliverable-covering check + 🏁 state-marker + suggest-next-move + copy-paste line in one response. Micro-tasknotes hit this branch often by design — their threshold aligns with the rule's clean-diff target.
- **Fire branch** (any signal hits) — surface the prose commit-go ask ("Ready to commit? Reply `commit`/`go`/`yes`."). Never commit unprompted. After commit + deliverable-covering check, same continuous flow.

**`--fast` override.** When `fast-mode = true` (from Step 0), force the Skip branch regardless of signal trips. Name the suppressed signals in the marker for transparency (e.g., `✅ Closure complete; committing autonomously (frontend files touched; suppressed via --fast).`).

Skill-specific:
- **Commit message:** `feat: <TASK-ID> — <title>` (or `fix:` / `docs:` / `chore:`). Scaffold + closure typically bundle into one commit alongside the code/doc change.
- **Re-read PLAN.md now** (fresh Read tool call — do not rely on the Step 1 cached parse; stale-context next-task suggestions are a known hallucination source). For each candidate, verify its task line is `- [ ]` (unchecked) and lives in an open section (`## High`, `## Medium`, `## Low`, or `## Future Opportunities`), not under `## Completed`. Drop any candidate that fails this check. **If none survives — PLAN.md holds no open task — do NOT invent one from `## Completed` or a doc example; follow SPEC §"Post-closure protocol" step 2's PLAN exhausted (terminal) form: state PLAN.md is exhausted, offer in-session filing (`/ft-epic-discovery` / `/ft-file-followup`), and skip the copy-paste line below.** Otherwise, name the recommended model from the verified line's `[model]` field.
- Copy-paste helper: emit a short visual cue that uses the same emoji primary label just printed for the chosen next-task candidate line (🔧 for [light] or light-appropriate tokens; 🧩 for [medium] or medium-appropriate tokens; 🧠 for [heavy] or heavy tokens). Put the invocation on its **own line as inline-code with no trailing period** — a trailing `.` collides with the `.N` epic-subtask grammar (`FE-132.3.`) and breaks copy/paste. Shape: a label line `<glyph> Clear your session, then run:` followed by `` `/<next-skill> <ID>` `` alone on the next line — where `<glyph>` is the exact 🔧/🧩/🧠 just printed on the chosen candidate line; never default to 🔧. Never emit a literal `/clear then /model ...` instruction in the user-facing suggestion. When *printing the list to the user*, emit only the emoji primary label (`[heavy]🧠` / `[medium]🧩` / `[light]🔧`) + "design / moderate / mechanical" prose + shortname — drop the bare bracketed token from the visible suggestion output. **Exception — context-dependent skills:** when the next-skill is `/ft-sidequest`, `/ft-file-followup`, or `/ft-epic-discovery`, replace the label line with `👇 Run in this session:` — 👇 replaces the model glyph and signals run-here-don't-clear (the model signal stays on the candidate line); these skills draw from current-conversation context; clearing destroys what they need.

## Notes

- **Routing:** see SPEC/tasknote-selection.md §"When to use a tasknote (and when not to)" micro carve-out. `/ft-micro-task`'s niche: above the skip threshold but under ~30 minutes, single-file, no design tradeoffs. Multi-file / design tradeoffs / >30min → `/ft-task` (the 4-phase ceremony pays for itself). Filing-only mid-flow → `/ft-starter-task` or `/ft-file-followup`. If unsure, default to `/ft-task`.
- **Sub-tasks of an epic** (`<AREA>-<NUMBER>.<SUB>`) follow the same flow. The parent epic line is not flipped to complete until all children are. Full lifecycle in `<SPEC_DIR>/epic.md`.
