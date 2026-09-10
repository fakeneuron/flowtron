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

- [ ] **CORE-561** [medium]🧩 | ft-audit-operator-action — Add an `Operator action: tell the agent to …` line to `/ft-audit`'s §3 finding format, and make a finding that cannot produce one **disqualified** for this workflow. Rationale: the existing `Recommended fix:` line states *what* should change but not who executes it or how it is dispatched — an audit's output earns its keep only when each finding converts into an instruction an operator can hand to an agent verbatim, and a finding that resists that conversion is an observation rather than an actionable finding. The disqualification is the load-bearing half and is a **detection filter, not a formatting rule**, so it belongs with the §6 hard rules (beside "Targeted, not exhaustive" and "Don't repeat the gates") and in §"Failure modes", not only in the format block. Surface: `claude/skills/ft-audit/SKILL.md` §3 (the fenced format block), §6, and §"Failure modes"; plus the seven `claude/skills/ft-audit/passes/*.md` — note `performance` already declares an extra finding line (`Measured impact:`) and §3 says *"Insert any extra finding-format lines the pass file declares"*, so the format is a per-pass extension point and each pass file's severity guide may need to say what disqualification means for its domain. Also check `templates/audit-overlay-template.md`, whose §"Deltas" preamble lists "finding format" as inherited verbatim, and decide whether `/ft-audit-repo` (same family, no §0 checklist, no fork) carries the line too. Routed from natabula **NAT-221** per `SPEC/scope-boundaries.md` §"Cross-repo edit remit"; evidence in that repo's `docs/QUALITY-STACK.md` §"Open questions" + §"Routed upstream". The proposal's second half — fork-per-repo vs one shared overlay — is deliberately **not** routed: `docs/MIGRATION.md` §1.2.1 already prefers the thin overlay, and the shared-overlay variant was refused natabula-side because every `## Deltas` slot is per-stack by construction.
- [ ] **CORE-562** [medium]🧩 | pair-k-spec-md-roster — `/ft-release` §7.1 Pair K2's roster and its deliberate-exclusions bullet both omit `SPEC.md` §"What flowtron does NOT provide", restored by [[CORE-558.2]]. Decide which list it joins — it labels the contract (`SPEC/scope-boundaries.md`), not the justification (`docs/VISION.md`) — and record the reason. Surface: `claude/skills/ft-release/step-7.1-mirror-pairs.md`.

## Low

(none)

## Future Opportunities

(none)

## Completed

- [x] **CORE-563** [medium]🧩 | filing-precheck-race — Completed 2026-09-10.
- [x] **CORE-564** [medium]🧩 | ft-task-area-resolution — Completed 2026-09-10.
- [x] **CORE-557** [heavy]🧠 | acceptance-verify-receipt — Completed 2026-09-10.
- [x] **CORE-559** [heavy]🧠 | touches-scope-contract — Completed 2026-09-10.
- [x] **CORE-EPIC-558** [heavy]🧠 | post-shrink-fidelity — Completed 2026-09-10.
  - [x] **CORE-558.1** [heavy]🧠 | post-shrink-fidelity discovery — Completed 2026-09-10.
  - [x] **CORE-558.2** [heavy]🧠 | spec-md-fidelity — Completed 2026-09-10.
  - [x] **CORE-558.3** [heavy]🧠 | gates-unattended-fidelity — Completed 2026-09-10.
  - [x] **CORE-558.4** [heavy]🧠 | skill-runner-fidelity — Completed 2026-09-10.
  - [x] **CORE-558.5** [heavy]🧠 | budget-ceilings — Completed 2026-09-10.
  - [x] **CORE-558.N** [heavy]🧠 | post-shrink-fidelity audit — Completed 2026-09-10.

- [x] **CORE-EPIC-556** [heavy]🧠 | release-skill-headroom — Completed 2026-09-09.
  - [x] **CORE-556.2** [heavy]🧠 | ft-release-fragment-split — Completed 2026-09-09.
  - [x] **CORE-556.N** [medium]🧩 | release-skill-headroom audit — Completed 2026-09-09.
- [x] **FE-EPIC-106** [medium]🧩 | viz-tier-guardrail — Completed 2026-09-09.
  - [x] **FE-106.2** [light]🔧 | eslint-node-tier-list — Completed 2026-09-09.
  - [x] **FE-106.3** [light]🔧 | js-yaml-merge-cve — Completed 2026-09-09.
  - [x] **FE-106.4** [light]🔧 | types-node-engines — Completed 2026-09-09.
  - [x] **FE-106.N** [medium]🧩 | viz-tier-guardrail audit — Completed 2026-09-09.
- [x] **CORE-554** [medium]🧩 | micro-task-description-flags — Completed 2026-09-09.
- [x] **CORE-555** [light]🔧 | budget-ceiling-recalibration — Completed 2026-09-09.
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
