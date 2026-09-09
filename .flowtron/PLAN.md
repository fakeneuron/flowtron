# Flowtron — PLAN.md

## Vision

A lightweight, versioned, project-agnostic tasknote system for solo
AI-assisted coding. One source of truth, consumed via git submodule by every
project under `~/code/`. Replaces the disjointed per-project workflow files
in fintown, InvisiPaw, and photard.

See [SPEC.md](../SPEC.md) for the canonical workflow contract.

## High

(none)

## Medium

- [ ] **CORE-555** [light]🔧 | budget-ceiling-recalibration — Raise `SPEC.md` 50,000 → 55,000 and `SPEC/gates.md` 35,000 → 40,000 in `docs/CONTEXT-BUDGET.md`. Both prior figures were CORE-535.1 split *targets* reused as operating ceilings; CORE-535.3 hit them to within 998 and 134 chars, leaving no working margin. Post-diet growth is +283 and +97 per release, so the caps still bite. Record the target-vs-ceiling distinction in each “Why this number” cell.
- [ ] **CORE-554** [medium]🧩 | micro-task-description-flags — `/ft-micro-task`'s `description:` names no flags on Claude or Codex, so `--unattended` is undiscoverable to description-dispatching agents despite being wired and documented on six other surfaces. Pairs B/E/J are blind — each skips a skill whose description yields an empty flag set. Fix both descriptions; consider whether the empty-set guards should distinguish "documents none" from "implements undocumented". Surfaced by audit-docs 2026-09-09 (Medium).

## Low

(none)

## Future Opportunities

(none)

## Completed

- [x] **CORE-553** [medium]🧩 | release v5.26.0 — Completed 2026-09-09.
- [x] **CORE-545** [light]🔧 | viz-version-lockstep — Completed 2026-09-09.
- [x] **CORE-552** [light] | epic-discovery-unattended-hang — Completed 2026-09-09.
- [x] **CORE-551** [heavy] | unattended-filing-authority — Completed 2026-09-09.
- [x] **CORE-544** [light] | release-gate-line-cite-drift — Completed 2026-09-09.
- [x] **CORE-543** [medium]🧩 | ci-drift-job-binding — Completed 2026-09-09.
- [x] **CORE-546** [light] | ci-pair-a-spec-split-drift — `.github/workflows/ci.yml` drift job grepped `SPEC.md` for the templates-roster clause CORE-535.3 had moved to `SPEC/layout.md`, failing the job on every push since the v5.25.0 cut and reddening the README CI badge; fixed the Pair A target (line 73) plus two stale `SPEC.md §"Skill namespace"` labels (lines 35, 54). Surfaced by audit-docs 2026-09-09 (Finding #1, High), fixed inline.
- [x] **CORE-547** [light] | neutrality-ledger-sop-cite — `docs/AGENT-NEUTRALITY.md` ledger row cited `SPEC.md` §"Procedure SOPs (`SPEC/procedures/`)"; CORE-535.3 moved that section to `SPEC/layout.md` and updated sibling rows but missed this one. Only unresolvable section citation in the 18-doc set (490 citations checked). Surfaced by audit-docs 2026-09-09 (Finding #2, Medium), fixed inline.
- [x] **CORE-548** [light] | readme-task-counter — README closed-task count 849 → 851 (canonical `find .flowtron/tasknote/archive -name "*.md" | wc -l` at HEAD; it was already 850 at the v5.25.0 tag, so the standing check missed it at the cut). Date range unchanged and verified correct. Surfaced by audit-docs 2026-09-09 (Finding #3, Medium), fixed inline.
- [x] **CORE-549** [light] | agents-mirror-line-cite — `AGENTS.md`'s CORE-516 KEEP IN SYNC comment cited `claude/AGENTS-snippet.md:29`; CORE-519 inserted a comment above it, shifting the mirror to :30 without updating the back-citation. Surfaced by audit-docs 2026-09-09 (Finding #4, Low), fixed inline.
- [x] **CORE-550** [light] | compat-xheavy-label — `docs/AGENT-COMPAT.md` §"Cross-agent cue fallback policy" enumerated 12 ASCII fallback labels against the 13 canonical in `SPEC/cue-vocabulary.md`; added the missing `XHEAVY` (the 🔭 fallback). Surfaced by audit-docs 2026-09-09 (Finding #5, Low), fixed inline.
- [x] **CORE-542** [medium]🧩 | ft-task-sop-probe-hint — Completed 2026-09-08.
- [x] **CORE-541** [medium]🧩 | release v5.25.0 — Completed 2026-09-08.
- [x] **FE-105** [heavy]🧠 | ui-shell-structure-pass — Completed 2026-09-08.
- [x] **CORE-540** [light] | updater-unreadable-root-exit — Completed 2026-09-08.
- [x] **FE-104** [medium] | node-tier-contained-read-dedup — Completed 2026-09-08.
- [x] **FE-103** [light] | fence-mask-shared-module — Completed 2026-09-08.
- [x] **FE-102** [medium] | api-cross-site-navigation-guard — Completed 2026-09-08.
- [x] **CORE-539** [medium] | release-ledger-refresh-gap — Completed 2026-09-07.
- [x] **CORE-537** [light] | plan-row-ledger-churn — Completed 2026-09-07.
- [x] **CORE-538** [medium] | skill-citation-count-claim — Completed 2026-09-07.
- [x] **CORE-536** [heavy] | gate-relaxation-pass — Completed 2026-09-07.
- [x] **CORE-EPIC-535** [heavy] | context-load-diet — Completed 2026-09-07.
  - [x] **CORE-535.1** [heavy] | context-load-diet discovery — Completed 2026-09-06.
  - [x] **CORE-535.2** [medium] | context-load-ledger — Completed 2026-09-06.
  - [x] **CORE-535.3** [heavy] | spec-core-lazy-split — Completed 2026-09-06.
  - [x] **CORE-535.4** [heavy] | skills-cite-dont-restate — Completed 2026-09-07.
  - [x] **CORE-535.5** [heavy] | gate-logic-untangle — Completed 2026-09-07.
  - [x] **CORE-535.N** [heavy] | context-load-diet audit — Completed 2026-09-07.

- [x] **CORE-534** [light]🔧 | adopter-filing-check — Completed 2026-09-06.
- [x] **CORE-533** [medium]🧩 | narrow-caobunga-batch — Completed 2026-09-06.
- [x] **CORE-532** [light]🔧 | neutrality-ledger-gates-count — Completed 2026-09-06.
- [x] **CORE-530** [light]🔧 | preserve-bracket-tokens — Completed 2026-09-06.
- [x] **CORE-529** [light]🔧 | deferred-handoff-filing-discipline — Completed 2026-09-06.
- [x] **CORE-528** [light]🔧 | handoff-persistence-rule — Completed 2026-09-06.
- [x] **CORE-531** [light]🔧 | blocked-by-grammar-discipline — Completed 2026-09-06.
- [x] **CORE-527** [medium]🧩 | blocked-by-closure-sweep — Completed 2026-09-06.
- [x] **CORE-526** [medium]🧩 | early-purpose-blurb — Completed 2026-09-06.
