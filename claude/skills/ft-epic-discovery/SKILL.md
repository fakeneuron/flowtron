---
name: ft-epic-discovery
description: Scaffold and drive a new flowtron epic from filing through its `.1` Discovery tasknote in one motion — files parent `<AREA>-EPIC-<N>` + `.1` Discovery + `.N` audit placeholder lines into PLAN.md, scaffolds the `.1` tasknote with tailored pre-fill, then drives the full 4-phase Discovery (deliverable = filed `.2..(N-1)` children). Auto-wired into adopters via `/ft-new-project` and `docs/MIGRATION.md` §1.2.
---

# ft-epic-discovery — flowtron epic filing + Discovery driver

You are filing a new epic and driving its `.1` Discovery tasknote in one motion. The full lifecycle contract lives in `<SPEC_DIR>/epic.md` — this skill is the executable interpretation of the lifecycle's filing-and-Discovery side, not a replacement. Treat `SPEC/epic.md` as authoritative when this file is silent or in tension.

The skill takes one optional argument: `--deep`. When passed, it stages a `constitution → specify → clarify` pre-pass for high-uncertainty epics before Phase 1 Discovery begins (see Step 1.5 + Step 5.5). All other inputs (area, shortname, priority, model, total-subtask-count N) are collected via AskUserQuestion in Step 2.

## Step 0 — Resolve paths

Two layouts. Pick by which file exists:

- **Adopter project:** `.flowtron/core/SPEC.md` exists → `<root>` = `.flowtron/core/`.
- **Flowtron self-host:** repo-root `SPEC.md` with heading `# Flowtron — Workflow Specification` → `<root>` = repo-root.

If neither matches, bail.

Paths this skill uses:
- SPEC: `<root>SPEC.md` (always loaded core)
- SPEC_DIR (lazy modules `epic.md`): `<root>SPEC/`
- Template: `<root>templates/tasknote-template.md`
- PLAN: `.flowtron/PLAN.md`, tasknote dir: `.flowtron/tasknote/` (always)

After resolving paths, Read `<SPEC_DIR>/epic.md` for the canonical lifecycle before drafting anything.

## Step 1 — Pre-flight

- `.flowtron/PLAN.md` must exist (cwd is a flowtron-adopting project or flowtron itself).
- The conversation should already have surfaced enough context to motivate filing an epic: a problem worth bracketing with Discovery + Audit subtasks, not a single-task scope. If the conversation has only surfaced a single-task scope, surface to the user: "This looks like single-task scope rather than an epic — recommend `/ft-starter-task <ID>` or a one-line PLAN.md filing instead." Do not proceed unless the user confirms epic scope.

## Step 1.5 — Parse `$ARGUMENTS`

The skill recognizes one optional argument: `--deep`. Branch:

- **Empty `$ARGUMENTS`** → default flow. Set internal flag `deep-mode = false` and continue to Step 2. Steps 5 and 5.5 are no-ops in this branch — flow is byte-identical to the pre-`--deep` skill.
- **`--deep`** → set `deep-mode = true`. Step 5 will inject a `## 🧭 Deep Pre-pass` placeholder section into the `.1` tasknote scaffold; Step 5.5 will drive three discrete pre-pass stages (constitution → specify → clarify) before Phase 1 Discovery begins.
- **Any other arg** → surface a one-line usage notice ("Unknown arg `<arg>`. Usage: `/ft-epic-discovery` or `/ft-epic-discovery --deep`.") and ask via AskUserQuestion whether the user meant `--deep`, the default flow, or to abort. Do not proceed silently.

`--deep` is opt-in for **high-uncertainty epics** — those where the shared design surface, contract impact, or per-child scope is genuinely unclear at filing time. For typical epics where the conversation has already crystallized the scope, prefer the default flow. The pre-pass adds three AskUserQuestion review-and-confirm gates between stages; reach for it when that upfront staging is worth the extra interruption.

## Step 2 — Collect inputs

Use AskUserQuestion to gather all inputs in one motion. Pre-populate from conversation context where possible — the AI proposes; the user confirms or overrides:

1. **Area** — per SPEC §"Task ID convention"; any project-specific prefixes declared in `.flowtron/tasknote/README.md`. AI proposes from conversation context.
2. **Shortname** — concise label up to ~30 chars (e.g., `expand-shipped-skills`, `viz-keyboard-overhaul`). Used as the parent epic's `| shortname` segment.
3. **Priority** — `High | Medium | Low | Future Opportunities`. AI proposes its best read. For urgent epics, propose `High` with a `[!critical]` flag on the parent (see SPEC §"Task-line format").
4. **Model** — see `SPEC/model.md` §"Model field" (and its "Practical guidance and agent-aware defaults" subsection) for examples and realistic defaults (mid-tier models like Grok/Sonnet often `[medium]`, or `[light]` for mechanical work); AI proposes a token (primary labels or specific name); goes on every PLAN.md line this skill writes.
5. **Total-subtask-count N** — total number of children including Discovery (`.1`) and audit (`.N`). E.g., 3 children + Discovery + audit = N=5. The Discovery's deliverable is filing `.2..(N-1)` (the implementation children).

The user may decline the audit subtask if the epic is a simple multi-child implementation that doesn't warrant the audit bracket (per `SPEC/epic.md` line 11: "Simpler implementations don't need it — apply judgment"). In that case, set N = Discovery + implementation-children-count and skip the audit-line filing in Step 4.

## Step 3 — Resolve next available `<AREA>-EPIC-<N>`

Scan `.flowtron/PLAN.md` AND `.flowtron/tasknote/archive/<area>/` for the highest used numeric suffix in the chosen area, considering BOTH regular task IDs (`<AREA>-NNN`, `<AREA>-NNN.M`) AND epic IDs (`<AREA>-EPIC-NNN`). Per SPEC §"Task ID convention": `<AREA>-EPIC-<N>` and `<AREA>-<N>.<sub>` share the numeric suffix — the epic and its children use the same N.

Compute `next-N = max-used + 1`. The new parent epic ID = `<AREA>-EPIC-<next-N>`; children will be `<AREA>-<next-N>.1` (Discovery), `<AREA>-<next-N>.<N>` (audit), and `<AREA>-<next-N>.2..(N-1)` (implementation, filed during Phase 2).

Surface to the user:

```text
Filing new epic:
  Parent:    <AREA>-EPIC-<next-N> | <shortname>
  Discovery: <AREA>-<next-N>.1
  Audit:     <AREA>-<next-N>.<N>     (skip this line if N excludes audit)
  Children:  <AREA>-<next-N>.2 .. <AREA>-<next-N>.<N-1>  (filed in Phase 2)

Confirm or override?
```

The user may override the numeric suffix (e.g., to align with an externally-tracked ID). Once locked, use this `<TASK-ID>` shape throughout.

## Step 4 — File the PLAN.md lines

Append to `.flowtron/PLAN.md` under the chosen `## <Priority>` heading. Use the canonical task-line grammar (SPEC §"Task-line format"). Three lines (or two if N excludes audit), nested with 2-space indent under the parent for the subtask lines:

```markdown
- [ ] **<AREA>-EPIC-<next-N>** [<model>] | <shortname> — One-paragraph epic description (filed via /ft-epic-discovery; refined at .1 closure).
  - [ ] **<AREA>-<next-N>.1** [<model>] | discovery — Scope shared design and file children .2..(N-1) per SPEC/epic.md.
  - [ ] **<AREA>-<next-N>.<N>** [<model>] | audit — Final-subtask audit per SPEC/epic.md (fixed doc-drift sweep acceptance line). Filed at filing time as highest `.N` child.
```

Placement:

- If the priority section already has entries, append to the bottom of that section.
- If the section carries a `(none)` placeholder, replace the placeholder with the new entries.
- Preserve the 2-space child indent on the `.1` and `.N` lines (per CORE-EPIC-057 cohort in `.flowtron/PLAN.md`: `  - [ ] **CORE-057.1** ...`).

Do NOT pre-write `.2..(N-1)` lines here — that is the Discovery's Phase 2 deliverable.

The parent epic's long description is a placeholder that the Discovery `.1` will refine at closure time (the epic's actual scope crystallizes from Discovery, not from filing-time guesswork). Keep it under the 70w hard cap (SPEC/tasknote-selection.md §"PLAN.md filing-discipline thresholds").

## Step 5 — Scaffold the `.1` Discovery tasknote

Copy `<template>` to `<tasknote dir>/<AREA>-<next-N>.1.md` and fill the frontmatter per SPEC §"Tasknote frontmatter":

- `title:` — `<shortname> discovery` (e.g., `expand-shipped-skills discovery`).
- `status:` — `in-progress`.
- `created:` — today's date (`YYYY-MM-DD`).
- `related-tasks:` — `[<AREA>-EPIC-<next-N>]` plus any predecessor IDs the user surfaced in Step 2.

Replace the H1 with `# <AREA>-<next-N>.1 | <shortname> discovery` and update the nav header `🔗` chip to `[[<AREA>-EPIC-<next-N>]]`.

Pre-populate `## 🎯 Goal`, `## ✅ Acceptance`, and `## 🧩 Subtasks` with the canonical epic-Discovery shape parameterized to the locked inputs:

**Goal (one sentence):**

> Scope the `<AREA>-EPIC-<next-N>` epic (`<shortname>`) before any implementation child fires; deliverable = filed concrete child scopes for `<AREA>-<next-N>.2..(N-1)` in `.flowtron/PLAN.md`.

**Acceptance (parameterized):**

```markdown
- [ ] Shared design surface inventoried for the epic (sources, adopter wiring, SPEC contract impact, templates) — captured in Discovery Notes
- [ ] Open scoping questions resolved with the user via AskUserQuestion — captured in a "Resolved scoping" table in Discovery Notes
- [ ] Concrete child scopes for <AREA>-<next-N>.2 .. <AREA>-<next-N>.<N-1> filed in .flowtron/PLAN.md (each line under the 50w target / 70w hard cap per SPEC/tasknote-selection.md §"PLAN.md filing-discipline thresholds")
- [ ] Audit line <AREA>-<next-N>.<N> reviewed and confirmed as-filed (or rewritten if the Discovery surfaces a scope shift)
- [ ] Phase 4 doc-drift sweep at closure: typically no AI-referenced doc updates land in pure Discovery filing (contract edits land inside the implementation children)
```

**Subtasks (parameterized):**

```markdown
- [ ] Inventory shared design surface (source files, adopter-wiring surfaces, SPEC contract impact, templates) — log in Discovery Notes
- [ ] Skim .flowtron/tasknote/archive/<area>/ for relevant precedents — log load-bearing findings in Discovery Notes
- [ ] Drift check on cited paths and concepts — flag any drift before re-interpreting the epic
- [ ] Surface open scoping questions via AskUserQuestion (typical: per-child shortname + scope + adopter-wiring policy) — record answers in a "Resolved scoping" table
- [ ] Draft refined long descriptions for <AREA>-<next-N>.2 .. <AREA>-<next-N>.<N-1>; word-count each (≤50w target / 70w hard cap)
- [ ] Phase 2: write the drafted child lines into .flowtron/PLAN.md under <AREA>-EPIC-<next-N> with 2-space indent
- [ ] Phase 3: markdown mental-pass on the PLAN.md edits (grammar / indent / cross-refs)
- [ ] Phase 4: doc-drift sweep + flip .1 PLAN line to stub form + archive tasknote
```

Leave the standard 4-phase checklist sections from the template intact below the populated Goal / Acceptance / Subtasks. Drop the audit-related Acceptance/Subtask line if N excluded audit in Step 2.

**If `deep-mode = true`** (set in Step 1.5), also inject a `## 🧭 Deep Pre-pass` placeholder section between the `## 🔗 Related` block and the `---` rule that precedes `## 📝 Phase 1: Discovery`, with three empty subsections — `### Constitution`, `### Specification`, `### Clarifications`. Step 5.5 populates them through three discrete review-and-confirm gates before Phase 1 begins. The section is part of the tasknote's permanent body and archives with it at Phase 4 closure.

## Step 5.5 — Deep pre-pass (only on `--deep`)

Skip this entire step if `deep-mode = false` (set in Step 1.5). On `--deep`, drive three discrete stages, writing each stage's output into the `## 🧭 Deep Pre-pass` section already injected into the `.1` tasknote in Step 5. Each stage ends with an AskUserQuestion review-and-confirm gate **before** the next stage begins.

These per-stage gates are **AskUserQuestion-driven review prompts** — not the banner-block 🛠️ / 📦 operator-gate cues from SPEC/gates.md §"Operator-gate cues". The 4-phase workflow's two-banner cap is preserved: the 🛠️ Phase 1→2 banner and the 📦 ready-to-commit banner remain the only banner-blocks in the run. Per SPEC: "Skill-level extensions … bundle into the 📦 gate rather than adding their own banners. … it does not introduce new gates."

### Stage 1 — Constitution

Write the epic's **principles and non-negotiables**: hard constraints, invariants the implementation must preserve, things explicitly out of scope. Source from the conversation context that motivated the epic filing plus Step 2's locked inputs. Update the `### Constitution` subsection of the tasknote.

Per-stage review gate (AskUserQuestion):

- **Looks good — proceed to Specification**
- **Edit before proceeding** (user provides edits inline; revise and re-gate)
- **Restart this stage** (discard and re-draft)

### Stage 2 — Specification

Write the epic's **specification** — a description of WHAT the epic delivers (not HOW). For each implementation child you currently anticipate, state its deliverable + acceptance shape + interaction with other children. This is upfront-thinking that the default Discovery compresses into Phase 1 + Phase 2 child filing; `--deep` separates it out so it can be reviewed in isolation. Update the `### Specification` subsection.

Per-stage review gate (AskUserQuestion): same three options as Stage 1.

### Stage 3 — Clarifications

Surface **open scoping questions** — ambiguities the specification revealed but did not resolve. Use AskUserQuestion to resolve each one with the user. Record the resolved Q&A in a table within the `### Clarifications` subsection.

Per-stage exit gate (AskUserQuestion):

- **All clarifications resolved — exit pre-pass, enter Phase 1 Discovery**
- **More questions to resolve** (re-enter the clarification loop)
- **Restart this stage** (discard and re-draft)

After all three stages clear, the `## 🧭 Deep Pre-pass` section is fully populated. Step 6's Phase 1 Discovery proceeds with this upfront work as ambient context — the Phase 1 checklist still ticks normally; the deep pre-pass does not skip any of it. In particular, Step 6's "clarifying questions" checklist item is usually satisfied directly by Stage 3's resolved-Q&A table (log "Resolved during deep pre-pass — see `## 🧭 Deep Pre-pass` §Clarifications" in the Phase 1 Discovery Notes).

## Step 6 — Drive Phase 1: Discovery

Walk the Phase 1 checklist per SPEC §"📝 Phase 1: Discovery". Tick boxes as each step completes. Skill-specific imperatives:

- **Reviewed PLAN.md** — already done (the parent + `.1` + `.N` lines were written in Step 4).
- **Relevance Assessment** — Verdict: Proceed (the user explicitly invoked `/ft-epic-discovery`, motivating filing an epic). Rationale: capture from the Step 1 conversation context.
- **Read relevant source files** — read the source files the conversation surfaced as in-scope for the epic. If none surfaced yet, ask the user which directories / modules / files the epic touches and read those.
- **Archive skim** — `ls <tasknote dir>/archive/<area>/` then `grep -l <source-path> <tasknote dir>/archive/<area>/*.md` for each source path. Read hits and log load-bearing findings (file moves, precedents, design decisions, regressions) in Discovery Notes.
- **Drift check** — verify file paths, line numbers, and concepts cited in the conversation context still match HEAD. Flag any drift.
- **Clarifying questions** — use AskUserQuestion to resolve open scoping decisions for the implementation children.
  Typical questions: per-child shortname + scope; cross-cutting adopter-wiring policy; SPEC contract impact per child. Record answers in a "Resolved scoping" table in Discovery Notes.
- **Subtasks populated** — the Step 5 scaffold pre-filled the canonical epic-Discovery subtask list; refine them now if Discovery surfaced a scope shift.

Do not enter Phase 2 until every Phase 1 box is ticked. Once ticked, apply the SPEC/gates.md §"Phase 1→2 exit gate"'s **`default-fire-on-clarifications` flavor** (this skill follows the higher-checkpoint flavor, not `/ft-task`'s `default-skip` — epic-opening is lower-volume and higher-stakes, so any surfaced clarification gates):

- **"No clarifications needed" branch** — emit the inline marker `✅ Phase 1 Discovery complete; entering Phase 2 Execution.` and start Step 7 Phase 2 immediately. Plain prose, not a banner; not a new gate.
- **Clarifications-surfaced branch** — surface the **🛠️ Phase 1→2 operator-gate cue** with the mandatory 1-2 sentence plain-English preview line (per SPEC/gates.md §"Operator-gate cues") and wait for the user's go before starting Step 7 Phase 2.

## Step 7 — Drive Phase 2: Execution

The Phase 2 deliverable is the filed child lines. Walk the Phase 2 checklist:

- **Pattern survey** — the existing CORE-EPIC-057 children are the closest precedent for the cohort-children filing pattern (2-space indent under the parent; `[<model>]` tag preserved on every line; em-dash separator; per-child long description ≤50w target / 70w hard cap).
- **Implemented the minimal solution** — write the drafted `.2..(N-1)` child lines into `.flowtron/PLAN.md` directly under the existing `.1` Discovery line, before the `.N` audit line (or at the bottom if N excluded audit). Preserve the 2-space child indent. Word-count each line; rewrite if any breach the 70w cap.
- **Updated/added tests** — N/A (pure PLAN.md filing; no executable code surface).

**Downstream-impact reconciliation scan** (per SPEC/tasknote-selection.md §"Downstream-impact reconciliation" — authoritative for triggers, scan steps, and vocabulary). The child cohort is a **new-task filing** trigger, so after writing the `.2..(N-1)` lines, scan the **rest of** the active PLAN (`High` / `Medium` / `Low` / `Future Opportunities`; the just-filed children and the `## Completed` section are out of scope) for existing entries that share a surface with any new child — same files, subsystem, contract, or a cited `[[wikilink]]` dependency. For each, classify impact (stale / contradictory / redundant / unaffected) and propose one reconcile action (merge / nest / edit / delete / leave). Surface the impacted-entry list — one line each with classification + proposed action — and wait for explicit user confirmation before editing any existing line; apply only the confirmed edits (amend or reject per the user). A fresh-area epic whose children obviously touch nothing already filed skips the scan (judgment) — note "no downstream impact" and move on. This user-confirm is an **AskUserQuestion-style review prompt, not a new banner** — the two-banner cap (🛠️ Phase 1→2 + 📦 ready-to-commit) is preserved, consistent with Step 5.5's per-stage gates.

Capture in Implementation Notes: the count of lines written, word-count per line, any audit-number bump (if Discovery decided N was wrong and the audit's number shifted), and any reconcile edits applied to existing entries (or "no downstream impact").

Phase 2 flows continuously into the Step 8 markdown mental-pass and Step 9 closure ops without an intermediate gate; the next operator-gate cue is the 📦 ready-to-commit banner in Step 10.

## Step 8 — Drive Phase 3: Testing & Linting

Markdown-prose edits only — no test surface. Markdown mental-pass on the edited PLAN.md block:

- 2-space child indent preserved on every new line.
- `**<AREA>-<next-N>.<M>**` bold ID intact.
- `[<model>]` tag present on every new line.
- `| <shortname>` segment present and ≤30 chars.
- Em-dash separator (` — `) consistent.
- Long description ≤70w hard cap; ≤50w target.
- No trailing whitespace.
- Any reconcile-edited existing lines (the Step 7 scan) still parse — grammar, indent, and cross-refs intact.

Tick all three Phase 3 boxes (test suite N/A, lint N/A, frontend N/A).

## Step 9 — Drive Phase 4: Closure (auto-run)

Walk the closure steps in order. **No banner here** — closure ops auto-run; the recap drafted at the end bundles into Step 10's 📦 gate.

- **Doc-drift sweep** — for each entry in `<tasknote dir>/README.md` §"AI-referenced docs", state per-entry verdict ("no change" or the specific update). Pure Discovery filing typically lands "no change" across the board — contract edits live inside the implementation children.
- **Flip the `.1` PLAN.md line to stub form** — `- [x] **<AREA>-<next-N>.1** [<model>] | <shortname> discovery — Completed YYYY-MM-DD.` per SPEC/tasknote-selection.md §"`## Completed` archive convention". Keep nested under `<AREA>-EPIC-<next-N>` in its current `## <Priority>` section (per epic-cohort grouping; parent + cohort move to `## Completed` only when all children close — see CORE-057.1 / .2 closure precedents).
- **Move the `.1` tasknote** — `git mv <tasknote dir>/<AREA>-<next-N>.1.md <tasknote dir>/archive/<area>/<AREA>-<next-N>.1.md`. Set `**Archived:** YYYY-MM-DD` in the tasknote's Phase 4 block.
- **Draft the recap** — leads with a 1-2 sentence plain-English summary (epic filed, Discovery closed, children scoped), then technical detail (cohort surface inventoried, child line word-counts, any audit-number bump). Hold it for Step 10's 📦 bundle; do not surface a banner now.

## Step 10 — Post-closure protocol

The three-step post-closure protocol (commit / suggest next move / offer copy-paste line) is canonical in SPEC §"Post-closure protocol", with the conditional skip rule for the 📦 gate in SPEC/gates.md §"Conditional skip rule". Skill-specific orchestration:

- Evaluate the **📦 conditional skip rule** against the closure diff. For pure `/ft-epic-discovery` filings the diff is typically PLAN.md edits + a tasknote scaffold/archive — no frontend, no privileged-ops, no perf concern — so the skip branch is the common case. Branch:
  - **Skip branch** (signals clear; no bundled in-📦 prompt — `/ft-epic-discovery` carries none) — emit the inline marker `✅ Closure complete; committing autonomously (<concrete-signal-summary>).` (e.g., `PLAN.md edit + tasknote scaffold/archive; no frontend/privileged surface`), then run closure review + recap + commit + 🏁 state-marker + suggest-next-move + copy-paste line in a single response. Do not surface a 📦 banner.
  - **Fire branch** (any signal hits — rare for pure filing but possible if the Discovery surfaced a perf-narrative concern that bled into Implementation Notes) — surface the **bundled 📦 ready-to-commit gate** (per SPEC §"Post-closure protocol" step 1) and wait for commit-go.
- Proposed commit message (skill-specific): `feat: <AREA>-<next-N>.1 — file <AREA>-EPIC-<next-N> + scope children` (or a user-edited variant). Do not commit unprompted on the fire branch.
- The post-commit response carries a 🏁 state-marker line immediately above the next-move suggestion (per SPEC §"Post-closure protocol" step 2): `` 🏁 **<AREA>-<next-N>.1 — committed `<sha>`** · archived to `<archive-path>` ``. Visually closes the 🛠️ → 📦 → 🏁 lifecycle in the transcript (skip branch collapses 🛠️ and/or 📦 to inline markers but 🏁 still fires).
- When suggesting the next move, read the full PLAN.md task-line shape (including `[model]`) to know the recommended model for each child. When *printing the list to the user*, emit only the emoji primary label (`[heavy]🧠` / `[light]🔧`) + "design vs mechanical" prose + shortname — drop the bare bracketed token from the visible suggestion output. The next move is typically `/ft-task <AREA>-<next-N>.2` (first implementation child).
- Copy-paste helper: emit a short visual cue that uses the same emoji primary label just printed for the chosen next-task candidate line (🔧 for [light] or light-appropriate tokens; 🧠 for [heavy] or heavy tokens). Put the invocation on its **own line as inline-code with no trailing period** — a trailing `.` collides with the `.N` epic-subtask grammar (`FE-132.3.`) and breaks copy/paste. Shape: a label line `<glyph> Clear your session, then run:` followed by `` `/ft-task <next-ID>` `` alone on the next line — where `<glyph>` is the exact 🔧/🧠 just printed on the chosen candidate line; never default to 🔧. Never emit a literal `/clear then /model ...` instruction in the user-facing suggestion. The emoji on the candidate line + the matching cue glyph are the stable, agent-agnostic pattern (per SPEC §"Post-closure protocol" step 3). **Exception — context-dependent skills:** when the next-skill is `/ft-file-followup` or `/ft-epic-discovery`, replace the label line with `<glyph> Run in this session:` (same glyph rule) — these skills draw from current-conversation context; clearing destroys what they need.

## Notes

- **One-motion contract.** This skill files the parent + `.1` + `.N` PLAN lines AND drives the `.1` Discovery tasknote through closure in a single invocation. No seam where the user has to manually run `/ft-task <ID>.1` after filing — `/ft-task` would refuse to restart the in-progress tasknote anyway.
- **Audit subtask is optional.** Per `SPEC/epic.md` line 11, simpler multi-child implementations don't need the Discovery + Audit bracket. Step 2's AskUserQuestion offers the option to skip the audit; in that case Step 4 files only the parent + `.1` and `N` excludes the audit slot.
- **N can shift during Discovery.** If the Discovery surfaces that N was wrong (scope shrinks or grows), Phase 2 in Step 7 bumps the audit's number when filing children. Document the shift in Implementation Notes.
- **Parent description is a placeholder.** The parent epic's long description filed in Step 4 is a one-paragraph placeholder; the Discovery's Final Summary refines it at closure time. The visualizer parses both states identically.
- **Auto-wired into adopters.** Symlinked into adopter projects via `claude/skills/ft-new-project/SKILL.md` Step 3 + `docs/MIGRATION.md` §1.2 + `claude/AGENTS-snippet.md`'s "One-time symlink wiring" section. New adopter projects bootstrapping via `/ft-new-project` get this skill automatically; existing adopters pick it up on next flowtron version bump.
- **Compare with `/ft-close-epic`** — the sibling skill that scaffolds + drives the audit `.N` tasknote at the end of an epic and prompts the user to flip the parent line to `Completed`. `/ft-epic-discovery` opens an epic; `/ft-close-epic` closes it.
- **Compare with `/ft-task`** — `/ft-task <ID>` runs an existing PLAN.md entry (starter, in-progress, or fresh) through the 4-phase workflow. `/ft-epic-discovery` files a new epic AND its first child AND drives that first child to closure. The two skills don't overlap.
- **Compare with `/ft-starter-task`** — `/ft-starter-task <ID>` files a single starter tasknote with rich AI-captured context. `/ft-epic-discovery` files an epic + its first two child lines + drives a full Discovery. Use `/ft-starter-task` when scope is single-task; use `/ft-epic-discovery` when scope warrants the Discovery + Audit bracket. **Cross-session handoff:** when an epic brief is fully formed in the current session but `/ft-epic-discovery` itself will run in a fresh session (e.g., `/clear` planned, model swap), file a `/ft-starter-task` now to park the brief — next session reads the starter file as context before invoking `/ft-epic-discovery`. See `/ft-starter-task` SKILL.md §Notes "Proactive invocation on cross-session handoff".
