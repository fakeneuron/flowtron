# Flowtron adoption snippet

Paste the block below into your project's `AGENTS.md`, then run the symlink commands once to wire flowtron's slash commands into your project's `.claude/`.

---

## Block to paste into AGENTS.md

<!-- KEEP IN SYNC: the peer-skill roster in the block below is also kept as a names-only list in AGENTS.md §Workflow; adding/removing a tasknote-family skill requires editing both. This comment sits outside the fence so adopters never paste it. Richer detail (flags, stubs, gates) stays in this paste-block and SPEC/tasknote-selection.md only. Version-bump skills are checkout-specific: this adopter paste-block names `/ft-update`; the self-host AGENTS.md names `/ft-release`. -->

```markdown
## Workflow

This project uses **flowtron** for task tracking. The canonical workflow contract lives at `.flowtron/core/SPEC.md` — read it before starting non-trivial work.

- Plans live in `.flowtron/PLAN.md`.
- Tasknotes live in `.flowtron/tasknote/<TASK-ID>.md` while active and `.flowtron/tasknote/archive/<area>/<TASK-ID>.md` once closed.
- Start a task with `/ft-task <TASK-ID>` (e.g., `/ft-task BE-014`). The slash command scaffolds the tasknote from the flowtron template and drives Phase 1 Discovery before any code is written. Contract-only agents without `/ft-task`: load `.flowtron/core/<platform>/procedures/ft-task.md` (if one exists for your platform) — it routes to the agent-neutral SOP at `.flowtron/core/SPEC/procedures/ft-task.md`.
- Other filing skills for non-task-shaped work: `/ft-starter-task [ID]` (rich-context filing, not yet ready to start; suggests an ID when omitted), `/ft-micro-task <ID>` (small task too light for the 4-phase ceremony), `/ft-file-followup [ID]` (≤50w note, no tasknote artifact; suggests an ID when omitted; add `--park [--low|--med|--fut|--high]` to park an idea or quick fix instead — tiny stub + PLAN line, flags skip the priority question else one short ask, no review gate, resume inline; lightest persistent filing), `/ft-epic-discovery` and `/ft-close-epic <ID>` (multi-child code-sweep or feature epics). See `.flowtron/core/SPEC/tasknote-selection.md` §"When to use a tasknote (and when not to)" and `.flowtron/core/SPEC/epic.md` for the per-skill shape and lifecycle details.
- Filing a new task and mid-flow direction-changing decisions run a **downstream-impact reconciliation** scan so the plan stays cohesive as it grows: the new task/decision is checked against existing active PLAN entries for stale / contradictory / redundant overlap, and one reconcile action (merge / nest / edit / delete / leave) is proposed per impacted entry behind a user-confirm gate — the plan is never auto-rewritten. Contract: `.flowtron/core/SPEC/tasknote-selection.md` §"Downstream-impact reconciliation".
- For independent children of a multi-child epic, the optional worktree convention (location `~/code/<p>-worktrees/wt-<ID>/`, branch `wt-<ID>`, tasknote copy) lets you execute siblings in parallel isolated checkouts. Full details: `.flowtron/core/docs/WORKTREES.md`. The two thin skills (`/ft-worktree-start` / `end`) wire the same way as the rest of the tasknote family.
- For bugs and unexpected behavior, `/ft-task <TASK-ID> --debug` adds a hypothesis-first cadence (expected/observed → ranked hypotheses → minimal repro → re-verify) inside Phase 1 Discovery, plus a Phase 3 obligation to re-run that exact repro after the fix. Soft scaffolding, not a gate; composes with `--fast` in either order.
- For converge-until-a-check-passes work (a suite going green, a metric crossing a threshold), `/ft-goal-task <TASK-ID>` is a peer to `/ft-task` that runs the Phase 2↔3 execute→verify cycle as an inline loop against a machine-checkable Acceptance target, under the `.flowtron/core/SPEC/loop.md` budget + per-cycle relevance gate. Autonomous by construction (`--fast` semantics: commits per verified iteration, parks on destructive steps). The recurring-maintenance (heartbeat) loop shape ships as `.flowtron/core/templates/loop-heartbeat-template.md`.
- To bump the flowtron version pin: `/ft-update` — shows the current→target changelog, moves the submodule, adds symlinks for any newly shipped skills, runs a smoke check, and stages the commit.
- Before filing, if a design has been worked out in conversation but isn't decomposed into tasks yet, `/ft-spec [brief] [--fast]` drafts a review-first spec (fixed section order: Goal · Requirements · Design · Tasks · Risks/Open Q · Validation Approach) and — only on your go — optionally writes it to `.flowtron/specs/<slug>.md`. It never files a PLAN.md line or scaffolds a tasknote; convert its Tasks section to real work via `/ft-epic-discovery`, `/ft-starter-task`, `/ft-task`, or a direct PLAN.md line. Peer to `/ft-starter-task` and `/ft-epic-discovery`; optional, never required.
- Standard tasknotes (`/ft-task`) run the 4-phase workflow in serial order — Discovery → Execution → Testing & Linting → Closure — followed by the post-closure protocol (commit + next-task suggestion). Do not skip phases. `/ft-micro-task` uses a lighter single-section ceremony in place of the full 4-phase flow.
- Each PLAN.md task line carries a `[model]` segment (see `.flowtron/core/SPEC/model.md` §"Model field" for practical/agent-aware guidance, examples, and realistic defaults such as mid-tier models like Grok/Sonnet often `[medium]` (or `[light]` for mechanical work); adopters may use any short token). The task runs end-to-end on the tagged model. If the loaded model doesn't match, surface the mismatch before continuing.
- The `.flowtron/core/` submodule is read-only here. Edits go upstream to flowtron and arrive via deliberate version bumps — see `.flowtron/core/SPEC/versioning.md` and `.flowtron/tasknote/README.md` for the pinned version.
```

---

## One-time symlink wiring

Run these from the project root after adding the flowtron submodule at `.flowtron/core/`:

```sh
mkdir -p .claude/commands .claude/skills
ln -s ../../.flowtron/core/claude/commands/ft-task.md            .claude/commands/ft-task.md
ln -s ../../.flowtron/core/claude/commands/ft-starter-task.md    .claude/commands/ft-starter-task.md
ln -s ../../.flowtron/core/claude/commands/ft-micro-task.md      .claude/commands/ft-micro-task.md
ln -s ../../.flowtron/core/claude/commands/ft-file-followup.md   .claude/commands/ft-file-followup.md
ln -s ../../.flowtron/core/claude/commands/ft-epic-discovery.md  .claude/commands/ft-epic-discovery.md
ln -s ../../.flowtron/core/claude/commands/ft-close-epic.md      .claude/commands/ft-close-epic.md
ln -s ../../.flowtron/core/claude/skills/ft-task            .claude/skills/ft-task
ln -s ../../.flowtron/core/claude/skills/ft-starter-task    .claude/skills/ft-starter-task
ln -s ../../.flowtron/core/claude/skills/ft-micro-task      .claude/skills/ft-micro-task
ln -s ../../.flowtron/core/claude/skills/ft-file-followup   .claude/skills/ft-file-followup
ln -s ../../.flowtron/core/claude/skills/ft-epic-discovery  .claude/skills/ft-epic-discovery
ln -s ../../.flowtron/core/claude/skills/ft-close-epic      .claude/skills/ft-close-epic
ln -s ../../.flowtron/core/claude/commands/ft-worktree-start.md   .claude/commands/ft-worktree-start.md
ln -s ../../.flowtron/core/claude/commands/ft-worktree-end.md     .claude/commands/ft-worktree-end.md
ln -s ../../.flowtron/core/claude/skills/ft-worktree-start    .claude/skills/ft-worktree-start
ln -s ../../.flowtron/core/claude/skills/ft-worktree-end      .claude/skills/ft-worktree-end
ln -s ../../.flowtron/core/claude/commands/ft-update.md       .claude/commands/ft-update.md
ln -s ../../.flowtron/core/claude/skills/ft-update            .claude/skills/ft-update
ln -s ../../.flowtron/core/claude/commands/ft-goal-task.md    .claude/commands/ft-goal-task.md
ln -s ../../.flowtron/core/claude/skills/ft-goal-task         .claude/skills/ft-goal-task
ln -s ../../.flowtron/core/claude/commands/ft-spec.md         .claude/commands/ft-spec.md
ln -s ../../.flowtron/core/claude/skills/ft-spec              .claude/skills/ft-spec
```

The relative paths are intentional — they survive `git clone` and pin to whichever flowtron commit the submodule is checked out at. Commit the symlinks (`git add .claude/`).

This snippet wires the adopter-installed subset: tasknote family, worktree pair, and `/ft-update`. Global utilities live in the user's agent home when desired; `/ft-release` is flowtron-self-only.

To verify Claude Code wiring: invoke `/ft-task` in a fresh Claude Code session. The command should appear in the menu (alongside the other wired adopter-subset skills) with the description from `commands/ft-task.md`. For Codex, use the sibling `codex/AGENTS-snippet.md` wiring and invoke the skill through `/skills` or `$ft-task`. For Cursor, Claude wiring is already enough (Cursor loads `.claude/skills/` as a compatibility surface); Cursor-only projects use the sibling `cursor/AGENTS-snippet.md` instead.

## Bumping the pinned flowtron version

Run `/ft-update` from the project root to bump the pin: it shows the current→target version + the annotated-tag changelog for confirmation, moves the submodule pin, re-wires symlinks for any newly shipped skills, runs a smoke check, and stages the bump with a proposed commit. The symlinks above don't change for *existing* skills — they always track whatever the submodule currently points at; `/ft-update` only adds a symlink when the bump ships a brand-new tasknote-family skill.

Manual equivalent, if `/ft-update` isn't wired: flowtron has no `CHANGELOG.md` — release notes and migration steps live in the annotated tag message (`git -C .flowtron/core show vX.Y.Z`) and the per-release tasknote in `.flowtron/core/.flowtron/tasknote/archive/core/`. Fetch + checkout the target tag inside `.flowtron/core`, then `git add .flowtron/core` to record the new pin (not `git submodule update`, which restores the current pin).

## Visualizer

The flowtron visualizer is a single global instance — run it **once per machine** from flowtron's own checkout, not from this project's `.flowtron/core/viz/`:

```sh
cd ~/code/flowtron/viz
npm install
npm run dev
```

It scans `${FLOWTRON_VIZ_WORKSPACE:-~/code}/*/.flowtron/PLAN.md` and renders every adopting project; the header-rail project selector swaps the active project. The header subhead shows task counts, in-progress count, and the flowtron version the selected project is using (from its `.flowtron/core/SPEC.md`). Port `5120` is pinned with `strictPort`, so a second instance fails fast. The adopter-side `.flowtron/core/viz/` still works for offline / submodule-pinned use, but the global instance above is the recommended path.
