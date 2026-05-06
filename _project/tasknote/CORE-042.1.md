---
title: workflow architecture rethink — Discovery
status: starter
priority: Medium
area: core
tags: []
created: 2026-05-06
related-tasks: [CORE-037, CORE-038, CORE-039, CORE-040, CORE-036, CORE-041]
---

# CORE-042.1 | workflow architecture rethink — Discovery

[← PLAN.md](../PLAN.md) · 🌱 Starter (filed 2026-05-06)

## 🌱 Starter context

_Captured 2026-05-06 during a prophylactic architecture review. User asked whether flowtron's whole workflow is over-engineered, AI-optimized, and whether context is being bloated. After surveying SPEC + PLAN + task SKILL + the recent [[CORE-037]] audit and the trims it spawned, four direction-setting questions resolved scope. This starter captures the diagnostic, the user's decisions, and the open questions Discovery should resolve before children are filed._

### Why this exists

[[CORE-037]] measured the per-`/task` load at ~11,400 words (PLAN.md 4,459 + SPEC.md 4,014 + task SKILL.md 2,319) and spawned [[CORE-038]] / [[CORE-039]] / [[CORE-040]], landing ~1,099w of trim. Further prose-trim has diminishing returns. The unrealized win is **shape, not size**: every `/task` invocation pays the full entry tax, even though most tasks never touch starters, blocked-task lifecycle, epic machinery, model-gate edge cases, or filing-discipline thresholds. A 4-line typo fix pays the same load as a multi-child epic.

User framing: prophylactic. The system *feels* heavy and the question is whether the architecture is earning its keep — not whether to ship a feature. Optimize for long-term clarity over short-term token wins.

### Solution shape

Three complementary thrusts. Discovery should size each, propose ordering, and file children.

**Thrust A — SPEC modularization (always-loaded core + lazy modules)**

Split `SPEC.md` into a tight always-loaded core plus on-demand sub-docs that the `/task` skill loads only when the file-state branch (Step 2) hits the relevant shape:

- **Core (always loaded):** principles, layout in adopting projects, task-ID convention, task-line grammar, 4-phase headings (no body), post-closure protocol, what-flowtron-does-NOT-provide. Target: ≤1,500w.
- **Modules (lazy loaded):** `SPEC/epics.md` (epic lifecycle), `SPEC/blocked.md` (blocked-task two-signals + resume), `SPEC/starters.md` (starter shape + promotion), `SPEC/model-gate.md` (model field + Step 1.5 contract), `SPEC/filing-discipline.md` (≤50w/70w cap), `SPEC/frontmatter.md` (YAML schema), `SPEC/body-shape.md` (spec-on-top + log-below).
- **Skill dispatch:** `/task` Step 2 already branches on file state — extend to load only the relevant module(s). E.g., `status: starter` → load `SPEC/starters.md`; `status: blocked` → load `SPEC/blocked.md`; epic ID prefix → load `SPEC/epics.md`.
- **Discoverability:** SPEC.md becomes a thin index pointing at modules; the always-loaded core sits inline. Markdown vault tooling (Obsidian) still gets one repo-root entry point.

Likely a **major version bump (v1.0 candidate)** — additive on the always-loaded surface but breaking if anything moves out of `SPEC.md` that adopters cite directly. Migration is a deliberate submodule re-read.

**Thrust B — workflow rigidity (micro-tasknote + phase rethink)**

Two complementary moves; user wants both on the table.

- **Micro-tasknote shape:** a single-section tasknote (do-the-work + recap) for tasks above the skip-tasknote threshold but under ~30 min of effort. Inline drift-check + relevance assessment (one paragraph), no Phase 3 boilerplate when no code changed (audits, doc patches), one closure step. SPEC carve-out + either a new `/micro-task` skill or a `/task --micro` flag.
- **Phase rethink:** question whether 4 named phases is the right primitive at all. Discovery should produce a side-by-side comparison: 4-phase status quo vs. continuous-flow with named gates (Relevance Assessment → Pattern Survey → Test Pass → Recap). Goal is the same contract in less ceremony.

Non-negotiable contracts that must survive any shape: relevance assessment, drift check, archive skim, pattern survey.

**Thrust C — frontmatter + status-duplication audit**

Status currently lives in **three places**: YAML `status:`, nav header chip (`🟢 In progress` / `✅ Completed` / `⏸ Blocked`), and PLAN.md checkbox. Phase 4 closure explicitly requires updating two of them; PLAN.md flip is a third. Sync drift is a real cost.

Frontmatter has 9 fields: `title`, `status`, `priority`, `area`, `model`, `tags`, `created`, `due`, `related-tasks`. `model:` was already moved to the PLAN line ([[CORE-023]] precedent). `priority:` is derivable from PLAN.md section heading; `area:` is derivable from the ID prefix. Audit which fields are load-bearing for viz/tools vs. vestigial.

`/starter-task` and `/task` Step 3a (promotion) overlap heavily on frontmatter writing and PLAN.md munging — candidate for consolidation.

### Files to touch (preliminary survey — drift-check at promotion)

- `SPEC.md` → split into thin index + `SPEC/` sub-docs (Thrust A). Major restructure.
- `claude/skills/task/SKILL.md` → Step 2 dispatch loads relevant module(s); Step 3a/3c paths cite their respective modules instead of inline procedure (Thrust A). New micro-task path or flag (Thrust B).
- `claude/skills/starter-task/SKILL.md` → possibly merged into `/task`; possibly de-duped against Step 3a (Thrust C).
- `claude/skills/new-project/SKILL.md` → adoption flow may need updating if SPEC is no longer one file.
- `templates/tasknote-template.md` → possibly micro-tasknote variant; possibly status-derivation simplification (Thrust C).
- `templates/tasknote-starter-template.md` → audit for fields that drop out under Thrust C.
- `viz/src/parser.ts` and `viz/src/tasknote.ts` → frontmatter changes ripple; status-source-of-truth changes ripple to badge rendering.
- `templates/PLAN.md` → possibly status-source-of-truth changes (Thrust C).
- `docs/MIGRATION.md` → major-version migration notes (Thrusts A + C).
- `claude/CLAUDE-snippet.md` → adoption snippet may need updating.
- Adopting projects' CLAUDE.md (`photard`, `natabula`, etc.) — re-read on submodule bump; no in-place edits from here.

### Explicitly out of scope

- **PLAN.md `## Completed` archive strategy** — already filed as [[CORE-036]] (starter). Orthogonal: reduces PLAN.md size; not blocked by this epic and not blocking it.
- **Cross-project visualizer** ([[FE-002]]) — separate viz roadmap; out of architecture scope.
- **Dynamic frontmatter index / Dataview-style queries** ([[CORE-041]]) — Future Opportunity; this epic is the "lazy-load" half but the dynamic-query half is downstream.
- **In-flight tasknote bodies** — variable cost is task-author authoring, not structural; per [[CORE-037]] finding.
- **Adopting-project content** — flowtron-side changes only; adopters bump deliberately.

### Decisions locked in this conversation

| Decision | Choice | Rationale |
|---|---|---|
| Epic scope | AI-context architecture rethink | Highest leverage; trim has diminishing returns post-CORE-038/039/040 |
| Lazy-load shape | Split SPEC into core + modules | Preserves human-readable single-file entry point via index; biggest unrealized win |
| Workflow rigidity | Both micro-tasknote AND phase rethink | User flagged them as complementary, not either/or |
| Motivation | Prophylactic; long-term clarity over short-term wins | Sets bias toward clean architecture over quick savings |

### Open at promotion (Phase 1 should resolve)

- **Module boundaries** — exact split between always-loaded core and lazy modules. Lean: principles + layout + task-ID + task-line grammar + 4-phase skeleton (no body) + post-closure + NOT-provided list = core. Everything else lazy.
- **Skill dispatch granularity** — does `/task` load modules eagerly at Step 2 (post-branch) or per-step on demand? Lean: Step 2 loads what the file-state branch needs; Step 4+ stays in the loaded set.
- **Thrust ordering** — A first (foundation), then C (frontmatter), then B (workflow rigidity)? Or B first (smaller, faster feedback)? Lean: A first; B and C ride on the new module shape.
- **Micro-tasknote: new skill vs `/task --micro`** — separate skill is more discoverable; flag is leaner. Lean: separate skill `/micro-task` mirroring `/starter-task`'s shape.
- **Phase rethink: ship or just propose?** — Discovery may conclude the 4-phase shape is the right primitive after side-by-side. Lean: produce the comparison, decide at filing.
- **Status-source-of-truth** — drop YAML status (PLAN.md checkbox + nav header derived) or drop nav header (YAML + PLAN are canonical, viz renders chip)? Lean: keep YAML as canonical (viz already reads it); derive nav header at render time so closure only updates one place.
- **Frontmatter audit** — which fields drop, which stay? Lean: drop `priority` (derivable from PLAN section), drop `area` (derivable from ID prefix); keep title/status/tags/created/due/related-tasks.
- **Major version bump** — is this v1.0? Lean: yes. Annotated tag with explicit migration steps per SPEC §"Versioning" major-bump contract.
- **Back-compat for in-flight tasks** — additive module split is back-compat (core has same headings; modules are extra). Status-source-of-truth and frontmatter changes are breaking; gate behind major bump and leave archived tasknotes write-once per existing policy.

### Related

- [[CORE-037]] — workflow token-cost audit; parent diagnostic. This epic implements the structural follow-up the audit flagged but ruled out as too big for that pass.
- [[CORE-038]] — task SKILL.md cite-don't-restate; already-landed prose trim that establishes the "cite SPEC" pattern this epic generalizes.
- [[CORE-039]] — SPEC.md prose tightening sweep; already-landed prose trim; further section-level trim has diminishing returns.
- [[CORE-040]] — PLAN.md filing discipline; precedent for routing context off the always-loaded surface.
- [[CORE-036]] — PLAN.md `## Completed` archive strategy (starter); orthogonal but in the same spirit.
- [[CORE-041]] — dynamic-index direction; this epic is the "lazy-load" half of that broader exploration.
- [[CORE-023]] — moved `model:` from frontmatter to PLAN line; precedent for frontmatter-field migration in Thrust C.
