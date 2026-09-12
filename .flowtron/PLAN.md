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

- [ ] **CORE-EPIC-575** [medium]🧩 | viz-dependency-posture — Make `npm --prefix viz audit` a signal again and settle the gray-matter → js-yaml 3.x residue. Audit reports 5 advisories (2 high): vitest 4.1.6 (@vitest/mocker GHSA-82fw-gwwq-j7x9), browserslist ×2, baseline-browser-mapping, and js-yaml 3 via gray-matter — the last already neutralised in `viz/src/tasknote-parse.ts` by the engine override but still in the tree, so audit stays permanently red. No audit gate in CI, no Dependabot. Discovery supplied by audit-repo 2026-09-11. Surfaced by audit-repo 2026-09-11 (Theme: Dependency hygiene is a blind spot).
  - [ ] **CORE-575.2** [light] [unattended]🔧 | npm-audit-fix-in-range — `npm audit fix` for the in-range set (vitest / browserslist / baseline-browser-mapping); rerun the full AGENTS.md §"Validation" gates.
  - [ ] **CORE-575.3** [medium]🧩 | gray-matter-js-yaml-residue — Choose an npm `overrides` pin of gray-matter's js-yaml to 4.x (verify `tasknote.test.ts` engine-override tests still pass) or a named accept in `SECURITY.md`; either way `npm audit` exits 0 or every remaining advisory is documented with a reason.
  - [ ] **CORE-575.4** [light]🔧 | audit-in-ci-or-cadence — Decide `npm --prefix viz audit --audit-level=high` as a `validate` step (respecting Pair H's byte-for-byte binding to AGENTS.md §"Validation") vs a documented manual cadence in `docs/CONVENTIONS.md`; implement the choice.
  - [ ] **CORE-575.N** [light]🔧 | viz-dependency-posture audit — Epic closure audit + doc-drift sweep.

## Low

- [ ] **CORE-578** [light]🔧 | gitleaks-ci-step — Add secret-scanning: deposit `.gitleaks.toml` + `.pre-commit-config.yaml` (copy natabula's canonical templates at `configs/.gitleaks.toml` / `configs/.pre-commit-config.yaml`) and wire a `gitleaks` step into `.github/workflows/ci.yml`'s `validate` job (curl-fetch pinned `gitleaks v8.30.1`, run `gitleaks dir . --config .gitleaks.toml --no-banner --redact` — natabula's own `ci.yml` is the canonical shape). Neither deposit exists here yet, unlike most other fleet repos. Routed by natabula `NAT-245` (lazy fleet backfill per `NAT-103.4`).
- [ ] **CORE-576** [light] [unattended]🔧 | stale-spec-draft-cleanup — Delete or mark `status: superseded` on `.flowtron/specs/spec-to-work-handoff.md` (the only spec in the dir; `status: draft` from 2026-07-12, parent CORE-EPIC-352 closed the same day; cites the retired `/ft-spec` and `/ft-starter-task`). Surfaced by audit-repo 2026-09-11 (Theme: Fast retirement leaves small residue).
- [ ] **CORE-579** [light]🔧 [unattended] | external-agents-candidates-row — Add a `docs/EXTERNAL-AGENTS.md` §"Stable surfaces for callers" row classifying the `unattended-candidates:` line — literal prefix, bare comma-separated IDs in PLAN order or `none`, transcript-only under `--fast` / standalone `--unattended`, persisted in the discharging runner's Final Summary / `## ✅ Recap`. Owner `SPEC/unattended-candidacy.md`. Surfaced by CORE-577.N audit.

## Future Opportunities

(none)

## Completed

- [x] **CORE-EPIC-574** [heavy]🧠 | drift-ci-and-budget-headroom — Completed 2026-09-11.
  - [x] **CORE-574.2** [light]🔧 | ci-context-budget-check — Completed 2026-09-11.
  - [x] **CORE-574.3** [light] [unattended]🔧 | ci-pairs-j-m — Completed 2026-09-11.
  - [x] **CORE-574.4** [heavy]🧠 | ft-task-headroom-trim — Completed 2026-09-11.
  - [x] **CORE-574.5** [medium]🧩 | spec-md-headroom-trim — Completed 2026-09-11.
  - [x] **CORE-574.N** [medium]🧩 | drift-ci-and-budget-headroom audit — Completed 2026-09-11.

- [x] **CORE-EPIC-577** [heavy]🧠 | unattended-candidacy — Completed 2026-09-11.
  - [x] **CORE-577.1** [heavy]🧠 | unattended-candidacy discovery — Completed 2026-09-11.
  - [x] **CORE-577.2** [heavy]🧠 | candidacy-contract — Completed 2026-09-11.
  - [x] **CORE-577.3** [medium]🧩 | epic-discovery-candidacy — Completed 2026-09-11.
  - [x] **CORE-577.4** [heavy]🧠 | file-followup-candidacy — Completed 2026-09-11.
  - [x] **CORE-577.5** [medium]🧩 | audit-refactor-candidacy — Completed 2026-09-11.
  - [x] **CORE-577.6** [light]🔧 | repo-context-candidacy — Completed 2026-09-11.
  - [x] **CORE-577.N** [heavy]🧠 | unattended-candidacy audit — Completed 2026-09-11.
- [x] **CORE-568** [light]🔧 | template-test-strategy-pointer — Completed 2026-09-11.
- [x] **CORE-573** [medium]🧩 | ft-spec-demote — Completed 2026-09-10.
- [x] **CORE-570** [heavy]🧠 | starter-followup-merge — Completed 2026-09-10.
- [x] **CORE-572** [heavy]🧠 | worktree-pair-demote — Completed 2026-09-10.
- [x] **CORE-571** [heavy]🧠 | goal-task-demote — Completed 2026-09-10.
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
