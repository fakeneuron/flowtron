# Version history

Curated, moderately-coarse highlights of flowtron releases. Newest first.

This is **not** a [Keep a Changelog](https://keepachangelog.com/) file and not
a substitute for git tags. Full per-release notes, change groups, and adopter
migration steps live in each annotated tag message:

```sh
git show vX.Y.Z
```

**How to read an entry**

- **Minor / major** (`vX.Y.0` / `vX.0.0`) — headline + a few main themes;
  optional short “also” list for secondary wins.
- **Patch** (`vX.Y.Z` with `Z ≠ 0`) — one-line subject only.

**Maintenance.** `/ft-release` prepends a new entry when a cut lands (same
session as the annotated tag message). Do not hand-edit historical entries
unless correcting a factual error.

---

## v5.20.0 — the --unattended operator-less posture

- New `--unattended` posture (CORE-EPIC-473): callers with no operator
  present get a structured `status: blocked` park instead of a banner into
  an empty session, wired across `/ft-task`, `/ft-micro-task`,
  `/ft-goal-task`, and `/ft-close-epic`.
- New `park-reason:` frontmatter key (six-code closed set) and an
  interrupted-run resume path for a session stranded mid-flow.
- New `docs/EXTERNAL-AGENTS.md` §"The Orchestration Contract" for
  operator-less callers.
- `/ft-release`'s version-edit recipe trimmed from 5 pins to 3 (dead
  `VIZ_VERSION` constant removed); new Pair J drift gate for command
  `argument-hint:` flags.

Also: viz vitest-flake fix, `/api/plan` realpath-containment hardening, and
an internal registry/orphan-code trim.

## v5.19.0 — viz App decomposition, /ft-refactor depth-planner, PLAN.md rotation contract

- New `/ft-refactor` depth-planner skill: read-only survey (dependencies, seams, coverage) → sequenced, behavior-preserving refactor plan filed as an epic
- viz's `App.tsx` decomposed into extracted hooks and components (prefs/selection state, header, diagnostics, derived selectors)
- PLAN.md's `## Completed` section bounded by a rotation contract into a new sibling `.flowtron/PLAN-ARCHIVE.md`; viz and `/ft-stats` read both files
- `/ft-release` now publishes GitHub Releases on push-go, and its §7.1 drift checks also run in CI on every push

Also: Grok/Codex/Cursor platform-parity hardening (`--park`/`--worktree` flag parity, Codex trigger-table backfill), a viz major dependency bump (React 19, Vite 8, Tailwind 4), and a wave of doc-currency fixes.

## v5.18.0 — graph-lite planning YAML, epic fan-out, NAS/TERM cues

- Graph-lite: omit-when-absent YAML planning keys, Discovery `.1` fan-out, archive decision-link skim, viz optional-edge chips
- 📡 NAS and 💻 TERM destructive-action cues; ▶️ RUN narrowed to generic/agent-adjacent commands
- viz parser: completed rows by checkbox; tolerate adopter PLAN.md near-misses

Also: docs/SECURITY hygiene; CI full-history fetch for updater tests.

## v5.17.0 — Cursor wiring, viz fleet-scale watcher, CI + filing auto-commit

- Cursor first-class thin wiring (snippet + procedure pointer); fourth
  dogfood-gated row; Claude-wired projects already work via compat load
- viz fleet-scale watcher: split watch set + project-attributed SSE
- GitHub Actions CI; filing-skill auto-commit; 📦 fire set shrunk to
  privileged-ops + bundled prompts
- Curated VERSION-HISTORY prepended by `/ft-release`

Also: honest viz edge states; release-gate pairs F–H; canonical install-path
rule; YAML `!!omap` reject.

## v5.16.0 — release-gate hardening, fleet-updater fail-closed, viz correctness

- Standing release checks: mirror pairs, skill parity, self-wiring, README
  task-counter, SOP-currency (first end-to-end exercise of the post-v5.15.0 suite)
- Fleet updater fail-closed (unclassifiable tags treated as migration-bearing)
  plus exit/stderr hygiene and mid-fleet failure fixtures
- Large viz correctness cohort: fence-aware parsing, Escape precedence,
  near-miss diagnostics, modal-gated keyboard nav

Also: emoji-surface / tick-through / superseded-claim SPEC polish; archive-folder
naming rule; worktree isolation + portable Handoff + subagent-probe template.

## v5.15.0 — skill-roster rationalization (26→18) + SOP-currency gate

- Roster cut: fold `/ft-debug` → `/ft-task --debug`, `/ft-sidequest` →
  `/ft-file-followup --park`; retire `/ft-quality`; collapse five
  `ft-audit-*` siblings into parameterized `/ft-audit <domain>`
- SOP-currency flag-don't-bump check on every `/ft-release` cut
- Dogfooded under Claude Code, Grok Build, and Codex CLI at this version

Also: Phase 4 status/closure hygiene; flag-surface and wrapper invoke-name
sweeps; self-symlink / cross-artifact consistency.

### v5.14.1 — doc-currency + mirror fixes

## v5.14.0 — clean-code contract, portable release gates, Claude 5 model roster

- Clean-code contract across all four phases (Best Practices → Minimal
  Refactor Gate → Quality Assertions → evidence-based recap) without a new
  phase or validator
- Model roster refreshed for Claude 5; effort / context variants stay off
  the `[model]` token vocabulary
- Updater hardened + portable release-gate suite (`update-adopters` tests
  registered beside viz checks)

Also: epic-child closure placement under active parent until `/ft-close-epic`.

## v5.13.0 — paper-complete guard

- Paper-complete guard: no Completed without deliverables in the same commit;
  foreign-dirt hard stop; deliverable-covering 🏁
- Automated tests for `update-adopters`; workflow-state hygiene (archive
  consolidate, orphan sidequest cleanup)

## v5.12.0 — /ft-spec review-first spec skill + model-roster glyph refresh

- New `/ft-spec` — review-first design capture (never files PLAN/tasknotes
  on its own); adopter-installed on Claude + Codex
- 🧩 MEDIUM third glyph + effort-axis calibration; viz glyph tolerance
- Suggested-id filers; release-wiring guardrails and safety-net fixes

## v5.11.0 — Codex skill bundle and updater parity

- Full Codex `ft-*` wrapper inventory under `codex/skills` +
  `.agents/skills` wiring path
- Updater detects and wires newly shipped Codex skills when that surface
  already exists
- Docs: sidequest wording; Claude bootstrap verification count alignment

### v5.10.1 — patch release closing CORE-EPIC-342 audit

## v5.10.0 — /ft-sidequest mid-session idea parker

- `/ft-sidequest` parks ideas/quick fixes mid-session (tiny stub + PLAN
  line); priority via `--low` / `--med` / `--fut`
- (Later folded into `/ft-file-followup --park` at v5.15.0; stubs keep working)

### v5.9.1 — plan-exhausted terminal-state SPEC branch

## v5.9.0 — dotN subtask grammar, viz parser/UI resilience

- Reserved terminal `.N` audit-child grammar in epic skills + viz parser
  (numeric audit children stay backward-compatible)
- Viz resilience: exclude legacy unparsed noise, ProjectSelector overflow,
  HTML-comment-aware checkboxes, SSE write-error guard

## v5.8.0 — viz PLAN resilience, loop-integration, and adopter-surface polish

- Viz PLAN grammar tolerance (glyph/stacked models/status) that had been
  silently dropping rows; per-row ErrorBoundary; search reaches subtasks
- `/ft-goal-task` + `SPEC/loop.md` — execute→verify loop under budget
- Adopter-surface / agent-alignment sweep + new logo

### v5.7.2 — release migration sentinel hardening

### v5.7.1 — viz surface fixes + repo-best-practices sweep

## v5.7.0 — adopter version-currency visibility + batch updater

- Viz project chips show version-currency (green at latest / red behind)
- Maintainer-side `tools/update-adopters.mjs` batch-bumps clean adopters
  across `~/code` (dry-run default; never pushes)

## v5.6.0 — first-contact holistic audit skill

- `/ft-audit-repo` — first-contact holistic audit for freshly adopting projects

## v5.5.0 — clearer hand-off cues + fable model vocabulary

- Hand-off copy-paste de-anchored from a hardcoded 🔧 example glyph
- New 👇 HERE cue for in-session “run here, don’t clear” skills
- `fable` recognized as a heavy-tier concrete model token

## v5.4.0 — downstream-impact reconciliation

- Downstream-impact reconciliation scan on new filings and mid-flow
  direction changes — propose merge/nest/edit/delete/leave per impacted
  PLAN row; never auto-rewrite the plan

## v5.3.0 — adopter audit-fork overlays, drift detection, and release-flow hardening

- Thin audit-overlay fork path + fork-provenance markers so `/ft-update`
  can warn when upstream scaffolds moved
- `/ft-release` context-budget escape hatch; audit trivial-fix inline
  carve-out; worktree-end hardening

## v5.2.0 — cross-agent skill projection + /ft-update adopter bump

- `SPEC/procedures/` agent-neutral SOP layer + Grok/Codex pointer wrappers
- `/ft-update` — adopter pin bump to latest released tag (consumer
  counterpart to `/ft-release`)
- Claude / Grok / Codex all dogfooded at this version

## v5.1.0 — release-time dogfood gate

- Release-time dogfood gate: every dogfooded agent row must refresh or
  explicit-skip at each cut

## v5.0.0 — dotfolder convention (_project/ → .flowtron/)

- **Breaking layout:** `_project/` → `.flowtron/` across the contract,
  templates, migration, and skills
- Major line for the post-agent-neutral stack

## v4.5.0 — cross-agent operator cues + [medium] model tier

- Cross-agent operator-cue vocabulary
- `[medium]` third model tier on the light < medium < heavy ladder

## v4.4.0 — agent-compatibility surface

- Living agent-compatibility matrix + capabilities / platforms stamps
  (`docs/AGENT-COMPAT.md` and related)

## v4.3.0 — hypothesis-first debugging + isolated worktrees

- Hypothesis-first debug cadence (later `/ft-task --debug`)
- Isolated worktrees for parallel epic children (`/ft-worktree-start` /
  `/ft-worktree-end`)

## v4.2.0 — agent-neutral [heavy]/[light] model labels + post-closure UX

- Agent-neutral category model labels (`[heavy]` / `[light]`)
- Post-closure UX refinements (model-agnostic suggestion quality)

## v4.1.0 — context-chain portability + viz header + SPEC signal improvements

- Context-chain verified under Grok; CLAUDE.md surface consolidated
  (flowtron-self)
- Viz header logo + live version subline
- SPEC signal trims (Model Selection; Shell discipline stays out of
  agent-neutral contract by deliberate decision)

## v4.0.0 — agent-neutral contract + AGENTS.md as the paste-block destination

- **Major:** agent-neutral contract layer; `AGENTS.md` (not Claude-only)
  as the adopter paste-block destination
- Two-layer model: neutral contract + per-platform wiring

## v3.2.0 — SECURITY.md integration, critical-as-flag, viz security + code-quality pass

- `SECURITY.md` threat model added to the AI-referenced doc set
- `[!critical]` PLAN-line flag replaces a separate Critical priority
  (board column when present)
- Viz origin-guard / Vite v6 / Node ≥20 + UI polish cohort

## v3.1.0 — open-source foundations, three new global skills, and viz theme system

- MIT LICENSE, CONTRIBUTING, CONVENTIONS, `.editorconfig`, vault-tool README
- Global skills: `/ft-stats`, `/ft-quality`, `/ft-epic-discovery --deep`
- Viz theme system (palette picker + semantic tokens) foundations

## v3.0.0 — ft- skill namespace prefix (BREAKING)

- **Breaking:** all skills/commands gain the `ft-` namespace prefix
  (`/task` → `/ft-task`, etc.)
- Migration steps in the annotated tag message for adopters with old
  symlink names

## v2.2.0 — viz visual overhaul, theme-system foundations, audit family bundle

- Large viz visual overhaul (typography, density, motion, board switcher,
  keyboard overlay, empty/loading states)
- Theme-system foundations (semantic tokens; pickable palettes later)
- Audit-family forkable scaffolds; `/release` invokes `/audit-docs` as
  subroutine

## v2.1.0 — /flowtron info skill, gate-UX overhaul, doc consolidation

- `/flowtron` info skill (version + roster; later `/ft-flowtron`)
- Conditional Phase 2 / pre-commit gates (skip when already seen)
- Symlink-wiring block collapsed to a single canonical owner

### v2.0.1 — patch: audit doc fixes + release-skill cleanup

## v2.0.0 — gate-UX overhaul, audit infrastructure, and viz polish

- Operator-gate banners trimmed 4 → 2; recap bundles into ready-to-commit
- `/audit` skill (stack-neutral 5-pass scaffold; forked-not-symlinked)
- Cite-don't-restate / doc-tightening + viz polish cohort
- Major *number* for cumulative weight — no migration-required break

## v1.3.0 — 4-skill cohort, cite-don't-restate sweep, cross-project viz

- `/file-followup`, `/epic-discovery`, `/close-epic` (adopter-facing)
  plus flowtron-self `/release`
- Cite-don't-restate sweep across skills/templates
- Global viz can scan `~/code/` projects

## v1.2.0 — viz back-refs + doc-set drift contract

- Viz inbound wikilink back-refs
- Phase 4 doc-drift sweep over `## AI-referenced docs` (forced per-entry)
- One-time adopter action: add that section to tasknote README (see tag)

## v1.1.0 — post-closure /model + recap-only

- Post-closure copy-paste gains `/model` hand-off
- “Recap is recap-only” promoted to an enforced SPEC callout

## v1.0.0 — major release: contract stability stamp

- Stability stamp on the post–CORE-EPIC-042 modular SPEC (lazy `SPEC/`
  modules, status SoT split, micro-tasknotes, epic/blocked/starter lifecycle)
- Filing-discipline thresholds; archive skim mandatory in Discovery
- Intermediate v0.5–v0.10 tags intentionally not backfilled — this tag
  covers v0.4.0 → v1.0.0

## v0.4.0 — starter tasknotes

- `status: starter` lightweight capture shape + `/starter-task`
- Viz starter chip / filter

## v0.3.0 — frontmatter, spec-on-top body, task-line grammar

- YAML frontmatter on tasknotes
- Spec-on-top + log-below body shape and wikilinks
- `[model]` + `| shortname` on PLAN lines; long-description conventions
- First viz cut (Kanban → priority-grouped list path)

### v0.1.1 — patch: ghost CHANGELOG refs removed; first cross-repo adoption

## v0.1.0 — first stable release

- SPEC.md 4-phase lifecycle, relevance gate, post-closure protocol, semver
- Templates + `/task` skill; self-hosted roadmap
- `docs/PHILOSOPHY.md` + `docs/MIGRATION.md`; public README
