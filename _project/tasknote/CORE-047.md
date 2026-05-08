---
title: doc-set drift contract
status: starter
tags: [workflow, docs, drift]
created: 2026-05-08
---

# CORE-047 | doc-set drift contract

[← PLAN.md](../PLAN.md) · 🌱 Starter (filed 2026-05-08) · 🔗 [[CORE-046]] [[CORE-EPIC-042]] [[CORE-040]]

## 🌱 Starter context

_Captured 2026-05-08 during a workflow-gap discussion triggered by bananapeel's README drifting across the BP-300 epic — promote to full tasknote at `/task` checkout._

### Why this exists

Per-task Phase 4 ("Updated docs/inventories affected by the change") gets read narrowly — typically as "did this slice add a new tech-stack entry or break a documented file?" Bananapeel BP-300.2 → BP-300.6 (five sequential implementation slices of [[BP-EPIC-300]]) each ticked the box with prose like "no new tech-stack additions to document" / "no CLAUDE.md / tasknote README change needed", while the project README's `## Features (MVP)` section stayed in forward-looking voice and CLAUDE.md never picked up the shipped feature surface. The closing audit subtask (BP-300.7) caught technical drift (RLS coverage, dead-code sweep, Vitest harness) but had no acceptance line for user-facing or AI-referenced doc drift. Cumulative incremental staleness is invisible to slice-local closure — no single slice "changed" the README in a way that violates its slice-local contract; the README was always aspirational, and stayed aspirational past the point it should have flipped to "shipped."

The cost is concrete: future AI sessions consume CLAUDE.md / README / architecture / schema / ADR docs as cold-start ground truth. If those drift, every fresh `/clear`'d conversation reasons from a stale baseline. The Phase 4 closure step is the natural enforcement point — but only if it's worded to fire, and only if it sees the full set of docs the project considers authoritative.

### Solution shape

**A. Tighten Phase 4 wording (light prescription).** Replace the generic `Updated docs/inventories affected by the change` checkbox with a prompt that forces enumeration over the project-declared doc set: per-doc verdict — "no change" or specific update. The forced enumeration breaks the "no new tech-stack" reflex; the project-list-driven shape avoids per-slice boilerplate (the assistant only walks docs the project cares about).

**B. Fix line in epic-audit acceptance (strict prescription).** `SPEC/epic.md`'s audit-subtask contract gains a fixed acceptance line: doc-drift sweep across the project-declared doc set. Always present in audit acceptance; ticks fast when nothing drifted, surfaces drift when it exists. Audits are rare enough that boilerplate cost is fine, and cumulative drift is exactly what an audit should catch.

**C. Project-declared AI-referenced doc set, single home.** Each project lists its canonical AI-referenced docs in `_project/tasknote/README.md` under a new `## AI-referenced docs` section — path + one-line purpose per doc. Includes whatever the project keeps for AI cold-start context: README, CLAUDE.md, architecture docs, API specs, DB schema docs, design-decision logs (ADRs), inventories. CLAUDE.md points at it. Flat list, one-line purpose, no per-doc "kind" tagging.

### Files to touch (preliminary survey — drift-check at promotion)

- `SPEC.md` §"🚀 Phase 4: Closure" (~lines 282-291) — rewrite the first checkbox + prose pointing at the project-declared doc set.
- `SPEC.md` §"Tasknote frontmatter" / §"Tasknote body shape" — possibly cross-reference the new convention; verify nothing conflicts.
- `SPEC/epic.md` — add fixed doc-drift acceptance line to the audit-subtask contract.
- `templates/tasknote-template.md` Phase 4 (~line 68) — first checkbox wording.
- `templates/tasknote-micro-template.md` `## ⚡ Notes` (~lines 18-24) — add a `**Docs touched:**` bold-prefix line.
- `templates/tasknote-README.md` — add `## AI-referenced docs` template section with seed entries (`README.md`, `CLAUDE.md`, `_project/PLAN.md`) + project-extension note.
- `claude/skills/task/SKILL.md` Step 5 — Phase 4 prose update to reference the doc set.
- `claude/skills/micro-task/SKILL.md` Step 4 — closure prose update mirroring the bold-prefix line.
- `claude/skills/new-project/SKILL.md` — verify the new template section seeds correctly into adopting projects.

### Decisions locked in this conversation

| Decision | Choice | Rationale |
|---|---|---|
| Where the doc set lives | `_project/tasknote/README.md` `## AI-referenced docs` section | Single home, project-owned, already where adopters keep prefix declarations. CLAUDE.md points at it rather than holding the list. |
| Per-slice prescription | Light: prose + per-doc verdict | Bananapeel evidence shows light wording got skipped, but enumerated checklist per-slice is boilerplate. Light + project-list-driven is the compromise. |
| Epic-audit prescription | Strict: fixed acceptance line | Audits are rare; boilerplate cost is fine; cumulative drift is exactly what the audit should catch. |
| Audit always runs the sweep | Yes — fixed line, not conditional | "Always tick when none" is cheap; conditional ("when scope warrants") risks audit hand-waving. |
| Per-doc "kind" tagging | No — flat list, one-line purpose | Simpler; project owners can categorise in the purpose blurb if useful. |

### Explicitly out of scope

- Migrating existing adopting projects (fintown, InvisiPaw, photard, bananapeel) to add the `## AI-referenced docs` section — adopters pick up on next flowtron version bump (additive, like prior SPEC changes). A separate retroactive doc-drift sweep on bananapeel's README + CLAUDE.md is a candidate follow-up `BP-` task; not bundled here.
- A `/audit-docs` skill that diffs PLAN.md `## Completed` against README claims — held off; A+B should suffice. Re-evaluate if drift recurs after this lands.
- The micro-task body shape — micro carve-out gets one bold-prefix `**Docs touched:**` line, not an enumerated checklist.

### Open at promotion (Phase 1 should resolve)

- **Exact Phase 4 wording.** Lean: `Doc-drift sweep — for each entry in `_project/tasknote/README.md` §"AI-referenced docs", state "no change" or the update.`
- **Seed doc set in `/new-project`.** Lean: yes, with `README.md` + `CLAUDE.md` + `_project/PLAN.md` as the starter set; project owner extends as the architecture matures.
- **Whether `SPEC.md` §"Tasknote body shape" needs the cross-reference**, or whether keeping the convention scoped to Phase 4 + epic.md is cleaner. Lean: scope to Phase 4 + epic.md only; body-shape section already cites Phase 4.
- **Version bump.** Lean: v1.2.0 (additive contract; adopting projects pick up opportunistically).

### Related

- [[CORE-046]] — flowtron v1.1.0 (post-closure /model + recap-only) — same Phase 4 closure-contract surface; this rides on the same wording layer.
- [[CORE-EPIC-042]] — workflow architecture rethink — kindred SPEC-tightening epic; precedent for the kind of contract change A+B represent.
- [[CORE-040]] — PLAN.md filing discipline — kindred discipline contract at the *filing* boundary; this is its *closure-time* counterpart.
