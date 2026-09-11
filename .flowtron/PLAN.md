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

- [ ] **CORE-570** [heavy]🧠 | starter-followup-merge — Decide whether `/ft-starter-task` folds into `/ft-file-followup --starter` (one filer, three weights: line / `--park` stub / starter body). Evidence: 6 promotions in 880 archived notes since 2026-05-17, last 2026-08-08; adopter uptake 0; four paragraphs duplicated across the two bodies. Must keep the no-`SPEC.md`-load property. Filed by CORE-565.4.
- [ ] **CORE-571** [heavy]🧠 | goal-task-demote — Decide whether `/ft-goal-task` demotes to a `/ft-task --loop` flag (contract `SPEC/loop.md` stays; the 28k body, `--worktree` / Pair G, the heartbeat roster row, and two symlinks go) or retires. Evidence: zero `## 🔁 Iterations` logs in 10 weeks; the adopter wires it and never runs it. Filed by CORE-565.4.
- [ ] **CORE-572** [heavy]🧠 | worktree-pair-demote — Decide whether `/ft-worktree-start` + `/ft-worktree-end` demote to the procedure in `docs/WORKTREES.md` (convention stays; two bodies, four symlinks, two roster rows go). Evidence: no `wt-` branch, reflog entry, or merge commit has ever existed here, none in the adopter, 3.5 months shipped. Sequence with CORE-571 (`--worktree`). Filed by CORE-565.4.

## Low

- [ ] **CORE-568** [light]🔧 | template-test-strategy-pointer — Replace the "Choosing a test strategy" blockquote in `templates/tasknote-template.md` (a verbatim copy of `SPEC.md` §Phase 3, ~600 chars scaffolded into every tasknote) with a one-line pointer. Adopter-visible; lands with a release. Filed by CORE-565.2.
- [ ] **CORE-569** [light]🔧 | goal-task-closure-restatement — `claude/skills/ft-goal-task/SKILL.md` Steps 4–5 say "identical to `/ft-task`" and then restate Phase 4 closure and the post-closure protocol in full; collapse each to the cite. Filed by CORE-565.2. Blocked by [[CORE-571]] — moot if the demote lands.
- [ ] **CORE-573** [medium]🧩 | ft-spec-demote — Decide whether `/ft-spec` demotes to `templates/spec-template.md` plus the routing paragraph in `SPEC/tasknote-selection.md`. Evidence: one spec ever written (its own dogfood, 2026-07-12), no adopter `specs/` dir; the skill adds a slug, a stub, a Codex wrapper, two symlinks, and a roster row. Filed by CORE-565.4.

## Future Opportunities

(none)

## Completed

- [x] **CORE-566** [medium]🧩 | model-md-history-trim — Completed 2026-09-10.
- [x] **CORE-567** [heavy]🧠 | park-reason-table-home — Completed 2026-09-10.
- [x] **CORE-EPIC-565** [heavy]🧠 | harness-value-review — Completed 2026-09-10.
  - [x] **CORE-565.1** [heavy]🧠 | harness-value-review discovery — Completed 2026-09-10.
  - [x] **CORE-565.2** [heavy]🧠 | lifecycle-value — Completed 2026-09-10.
  - [x] **CORE-565.3** [heavy]🧠 | caobunga-contract-fit — Completed 2026-09-10.
  - [x] **CORE-565.4** [heavy]🧠 | roster-onboarding-value — Completed 2026-09-10.
  - [x] **CORE-565.N** [heavy]🧠 | harness-value-review audit — Completed 2026-09-10.
- [x] **CORE-561** [medium]🧩 | ft-audit-operator-action — Completed 2026-09-10.
- [x] **CORE-562** [medium]🧩 | pair-k-spec-md-roster — Completed 2026-09-10.
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
