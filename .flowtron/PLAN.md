# Flowtron — PLAN.md

## Vision

A lightweight, versioned, project-agnostic tasknote system for solo
AI-assisted coding. One source of truth, consumed via git submodule by every
project under `~/code/`. Replaces the disjointed per-project workflow files
in fintown, InvisiPaw, and photard.

See [SPEC.md](../SPEC.md) for the canonical workflow contract.

## High

- [ ] **CORE-655** [light]🔧 | caller-surface-sweep — Sharpen the Phase 4 doc-drift line for `docs/EXTERNAL-AGENTS.md`: a moved stable-surface row files the cross-repo caller-side (caobunga) row in the same closure. Add a stable-surface row for `## <emoji> Phase N:` headings + per-phase checkboxes and `## 🎯 Goal` — caobunga's `phase_progress()` and brief parse them today.
- [ ] **CORE-656** [heavy]🧠 | review-probe — Phase 3 external review: a fresh read-only context grades the diff against `## ✅ Acceptance` by severity; Claude uses `/code-review`, other runners a `subagent-probe-template.md` variant; `N/A` on trivial diffs. Keep the Phase 3 heading; under `--unattended` a finding returns to Phase 2 or parks `input-needed` (no new code); `unattended-mode.md` stays put.
- [ ] **CORE-657** [medium]🧩 | spec-incident-history — Move incident rationale out of `SPEC.md` (nav-chip CORE-042.4 / CORE-393 anecdotes, "why we rejected X" prose) into `docs/PHILOSOPHY.md` or archive pointers; rules and section headings stay verbatim (owner citations in the EXTERNAL-AGENTS stable table). Recovers byte headroom under `docs/CONTEXT-BUDGET.md`.

## Medium

- [ ] **CORE-658** [light]🔧 | learnings-box — Add a Phase 4 checkbox: "did this task teach something the always-loaded layer (AGENTS.md / README §AI-referenced docs) should carry? `N/A` or the line." Push-memory beside the archive's pull-memory. Insert above `**Final Summary:**` in the templates so caobunga's lede regex is untouched.
- [ ] **CORE-659** [light]🔧 | gate-discipline-decay-window — Open the decay experiment: drop the two skip-path pointers to `SPEC/gate-discipline.md` (`SPEC/gates.md` §"Conditional skip rule", `SPEC/procedures/ft-task.md`), record the window-start SHA, and count gate skips over ~20 subsequent tasks. Evidence for CORE-660.
- [ ] **CORE-660** [medium]🧩 | gate-discipline-trim — Blocked by [[CORE-659]]. Trim `SPEC/gate-discipline.md` (16KB) to the failure modes the decay window actually observed; move the rest to a `docs/` reference. Prose-only in `SPEC/gate-postures.md` — posture semantics (red-full-suite park) stay; caobunga `proceed-on-green` depends on them.
- [ ] **CORE-661** [medium]🧩 | audit-decay-domain — Add a `decay` domain to `/ft-audit`: walk SPEC + gate modules, propose one clause to drop or demote per run, naming the failure mode it guards so the operator can test whether current models still exhibit it. Anthropic's harness-decay lesson as a standing pass.

## Low

- [ ] **FE-124** [light]🔧 | viz-ready-filter — Ready filter in the visualizer: open rows whose `Blocked by [[ID]]` / `blocked-by:` targets are all closed. Stay out of `viz/src/parser.ts` — caobunga re-verifies its grammar port against it on every pin bump.
- [ ] **CORE-662** [light]🔧 | context-budget-cells — Collapse `docs/CONTEXT-BUDGET.md` budget-table cells to one line each; move raise/lower history to a ledger section or leave it to git log.
- [ ] **CORE-641** [light]🔧 | typescript-7 — Bump typescript 5.9→7 once typescript-eslint supports TS 7.1+; tsc also TS2882 on CSS side-effect import. CORE-639.3 reverted.

## Future Opportunities

- [ ] **CORE-663** [heavy]🧠 | harness-survey-v2 — Wider-net pass appending to `docs/HARNESS-SURVEY.md`: the §"Not examined" product list, primary docs over comparison blogs, star/install velocity, one hands-on trial per family; re-rank gaps and overkill against whatever CORE-655…662 landed.

## Completed

- [x] **CORE-654** [medium]🧩 | release v5.32.0 — Completed 2026-09-21.
- [x] **FE-122** [light]🔧 | handoff-chip — Completed 2026-09-21.
- [x] **CORE-653** [light] | security-spec-read-note — `SECURITY.md` §Visualizer names the one uncontained read: `.flowtron/core/SPEC.md` is followed through symlinks for its Version line only, nothing from it reaches the wire (`viz/src/workspace.ts`). Surfaced by audit 2026-09-21 (Finding #2, Low), fixed inline.
- [x] **FE-123** [light] | viz-readme-build-command — `viz/README.md` §Commands lists `npm --prefix viz run build`, matching AGENTS.md §"Validation", CI, and the justfile. Surfaced by audit 2026-09-21 (Finding #3, Low), fixed inline.
- [x] **CORE-EPIC-652** [heavy]🧠 | public-surface-decoupling — Completed 2026-09-21.
  - [x] **CORE-652.2** [medium]🧩 | natabula-ref-inventory — Completed 2026-09-21.
  - [x] **CORE-652.N** [light]🔧 | public-surface-decoupling audit — Completed 2026-09-21.
- [x] **CORE-EPIC-651** [heavy]🧠 | gate-reliability — Completed 2026-09-21.
  - [x] **CORE-651.2** [light]🔧 [unattended] | pair-q-out-of-repo-skip — Completed 2026-09-21.
  - [x] **CORE-651.3** [light]🔧 [unattended] | updater-test-cleanup-race — Completed 2026-09-21.
  - [x] **CORE-651.4** [light]🔧 [unattended] | engines-ci-matrix — Completed 2026-09-21.
  - [x] **CORE-651.5** [light]🔧 | lockfile-engines-sync — Completed 2026-09-21.
  - [x] **CORE-651.N** [light]🔧 | gate-reliability audit — Completed 2026-09-21.
- [x] **CORE-643** [light] | brand-kit-back-port — Completed 2026-09-21.
- [x] **CORE-640** [light]🔧 | js-yaml-5-gray-matter — Completed 2026-09-21.
- [x] **CORE-644** [medium]🧩 | audit-bootstrap-self-branch — Completed 2026-09-21.
- [x] **CORE-645** [light] | docs-audit-gates-claim — `docs/MIGRATION.md` §1.2.2 and `/ft-release` §7.1 no longer say the `docs` audit runs with no gates; both name the CI `drift` job's doc checks (Pair Q citation resolver, final-newline, context budget) as the local gate. Surfaced by audit-docs 2026-09-21 (Finding #1, Medium), fixed inline.
- [x] **CORE-646** [light] | neutrality-ledger-two-rows — `docs/AGENT-NEUTRALITY.md` ledger gains rows for `SPEC/unattended-candidacy.md` (`claude/skills/`, `.claude/skills/audit/`) and `templates/audit-overlay-template.md` (referenced-scaffold path, `CLAUDE.md` rubric example), both path facts. Surfaced by audit-docs 2026-09-21 (Finding #2, Medium), fixed inline.
- [x] **CORE-647** [light] | agents-layout-justfile — `AGENTS.md` §"Repo Layout" names the root `justfile` (CORE-637). Surfaced by audit-docs 2026-09-21 (Finding #3, Low), fixed inline.
- [x] **CORE-648** [light] | agents-model-mirror-pointer — `AGENTS.md:35` KEEP IN SYNC pointer now reads `claude/AGENTS-snippet.md:32` (the `[model]` bullet), matching the snippet's reverse pointer. Surfaced by audit-docs 2026-09-21 (Finding #4, Low), fixed inline.
- [x] **CORE-650** [light] | sweep-set-exclusion-note — `.flowtron/tasknote/README.md` §"AI-referenced docs" now states why `docs/PHILOSOPHY.md` (historical), `docs/DOGFOOD.md` (release-gated), `docs/CONTEXT-BUDGET.md` (CI-enforced + release-remeasured), and `docs/VERSION-HISTORY.md` (release-written) sit outside the sweep set. Surfaced by audit-docs 2026-09-21 (insight), fixed inline.
- [x] **CORE-649** [light] | platforms-wrapper-count — `docs/PLATFORMS.md` Codex "Structured ask" row says "every wrapper" instead of the stale "all 11 wrappers" (12 since `ft-seed`). Surfaced by audit-docs 2026-09-21 (Finding #5, Low), fixed inline.
- [x] **CORE-642** [medium]🧩 | release v5.31.0 — Completed 2026-09-20.
- [x] **CORE-EPIC-639** [heavy]🧠 | toolchain-currency — Completed 2026-09-20.
  - [x] **CORE-639.2** [light]🔧 [unattended] | ci-node-matrix — Completed 2026-09-20.
  - [x] **CORE-639.3** [medium]🧩 | viz-majors-triage — Completed 2026-09-20.
  - [x] **CORE-639.N** [light]🔧 | toolchain-currency audit — Completed 2026-09-20.
- [x] **CORE-EPIC-638** [heavy]🧠 | completed-rotation-debt — Completed 2026-09-20.
  - [x] **CORE-638.2** [light]🔧 [unattended] | rotate-completed-rows — Completed 2026-09-20.
  - [x] **CORE-638.3** [medium]🧩 [unattended] | rotation-advisory-mirrors — Completed 2026-09-20.
  - [x] **CORE-638.N** [light]🔧 | completed-rotation-debt audit — Completed 2026-09-20.
- [x] **CORE-637** [light]🔧 | root-justfile-viz — Completed 2026-09-20.
- [x] **CORE-636** [light]🔧 | remove-dead-claudeignore — Completed 2026-09-20.
- [x] **CORE-635** [light]🔧 [unattended] | plan-stub-shape-ratchet — Completed 2026-09-20.
- [x] **CORE-EPIC-632** [heavy]🧠 | adopter-footprint — Completed 2026-09-20.
  - [x] **CORE-632.2** [light]🔧 [unattended] | readme-logo-webp — Completed 2026-09-20.
  - [x] **CORE-632.3** [medium]🧩 | submodule-archive-exclusion-guidance — Completed 2026-09-20.
  - [x] **CORE-632.N** [light]🔧 | adopter-footprint audit — Completed 2026-09-20.
- [x] **CORE-634** [light]🔧 [unattended] | rotation-closed-month-append — Completed 2026-09-20.
- [x] **CORE-633** [light]🔧 [unattended] | ci-job-timeouts — Completed 2026-09-20.
- [x] **CORE-EPIC-631** [heavy]🧠 | budget-headroom — Completed 2026-09-20.
  - [x] **CORE-631.2** [heavy]🧠 | lifted-pairs-single-body — Completed 2026-09-20.
  - [x] **CORE-631.3** [medium]🧩 | procedures-postures-headroom — Completed 2026-09-20.
  - [x] **CORE-631.N** [light]🔧 | budget-headroom audit — Completed 2026-09-20.
- [x] **CORE-630** [light]🔧 | readme-maturity-note — Completed 2026-09-20.
- [x] **CORE-629** [medium]🧩 | release v5.30.0 — Completed 2026-09-20.
- [x] **CORE-625** [light]🔧 | gitleaks-checksum-verify — Completed 2026-09-20.
- [x] **CORE-624** [medium]🧩 | pair-h-lift-to-ci — Completed 2026-09-20.
- [x] **CORE-623** [medium]🧩 [unattended] | validation-roster-build-step — Completed 2026-09-20.
- [x] **CORE-626** [light] | tsconfig-vitest-globals-drop — `viz/tsconfig.json` `types` trimmed to `["node"]`; `vitest/globals` was dead ambient typing with `globals: false` and explicit imports everywhere. Surfaced by audit 2026-09-20 (Finding #2, Low), fixed inline.
- [x] **CORE-627** [light] | conventions-pair-g-stale — `docs/CONVENTIONS.md` §"Dependency audit cadence" release-only pair list now reads `D, F, H, I, K, and L` (Pair G retired at CORE-571). Surfaced by audit 2026-09-20 (Finding #4, Low), fixed inline.
- [x] **CORE-628** [light] | agents-layout-dependabot — `AGENTS.md` §"Repo Layout" `.github/` row now names `dependabot.yml`. Surfaced by audit 2026-09-20 (Finding #5, Low), fixed inline.
- [x] **CORE-621** [light]🔧 [unattended] | editorconfig-final-newline — Completed 2026-09-20.
- [x] **CORE-EPIC-622** [heavy]🧠 | drift-ratchet-gaps — Completed 2026-09-20.
  - [x] **CORE-622.2** [medium]🧩 [unattended] | skill-directory-budget-row — Completed 2026-09-20.
  - [x] **CORE-622.3** [medium]🧩 [unattended] | section-citation-resolver — Completed 2026-09-20.
  - [x] **CORE-622.4** [light]🔧 [unattended] | viz-shared-pure-node-guard — Completed 2026-09-20.
  - [x] **CORE-622.N** [light]🔧 | drift-ratchet-gaps audit — Completed 2026-09-20.
- [x] **CORE-620** [light]🔧 [unattended] | completed-rotation-2026-09 — Completed 2026-09-20.
- [x] **CORE-616** [light]🔧 | receipt-not-transcript — Completed 2026-09-19.
- [x] **CORE-619** [heavy]🧠 | ft-seed — Completed 2026-09-19.
- [x] **CORE-618** [heavy]🧠 | plan-grammar-fixtures — Completed 2026-09-19.
- [x] **CORE-617** [medium]🧩 | unattended-full-suite — Completed 2026-09-19.
- [x] **CORE-615** [light]🔧 [unattended] | task-counter-date-grep-anchor — Completed 2026-09-19.
