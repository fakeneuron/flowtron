# Flowtron Conventions

This is the single canonical surface answering "what conventions does flowtron follow, and which does it deliberately decline?" For the workflow contract, see [SPEC.md](../SPEC.md). For the "why" behind flowtron's overall shape, see [PHILOSOPHY.md](PHILOSOPHY.md).

The list is scoped to external conventions flowtron has explicitly considered. An entry is here either because flowtron adopts the convention (often de-facto, undocumented elsewhere) or because flowtron declines it on purpose and the position is worth recording.

## Adheres to

### Conventional Commits 1.0

Commit subjects follow [Conventional Commits 1.0](https://www.conventionalcommits.org/en/v1.0.0/) with an em-dash separator and the originating task ID:

```text
<type>: <TASK-ID> — <description>
```

Types in active use: `feat:`, `fix:`, `chore:`, `docs:`. Scope segments (`feat(area):`) are not used — the `<TASK-ID>` prefix carries area information via its `CORE-` / `FE-` / `BE-` / `DB-` / `DEPLOY-` / `TEST-` prefix.

**Breaking changes** use the canonical `!` indicator on new commits:

```text
feat!: CORE-XXX — short description
```

The annotated tag message for the corresponding release lists migration steps regardless of indicator style. The v3.0.0 release commit itself (CORE-105) used a parenthetical `(BREAKING)` form in the subject; the canonical `!` is the going-forward convention.

### Semantic Versioning 2.0

Flowtron releases follow [Semantic Versioning 2.0](https://semver.org/spec/v2.0.0.html). The patch/minor/major split is enforced through the workflow contract — see [SPEC/versioning.md](../SPEC/versioning.md) for flowtron's specific definitions of each bump tier and for the adopter-side migration motion.

The cross-link is deliberate: `SPEC/versioning.md` is the operational doc (what the bump tiers mean for flowtron); the canonical spec is the underlying contract.

### GitHub Flavored Markdown

All flowtron markdown — `SPEC.md`, `SPEC/`, templates, tasknotes, `docs/`, `README.md`, and the bundled skills — targets [GitHub Flavored Markdown](https://github.github.com/gfm/) (a CommonMark superset). Features in use: fenced code blocks with language tags, tables, task lists, emoji shortcodes, `[[wikilink]]` syntax for cross-task references in tasknotes, and — in `README.md` only — inline raw HTML (`<p align="center">`, `<img>`, `<details>`/`<summary>`) for the landing-page layout GFM can't express natively.

GFM renders cleanly on GitHub and in Obsidian-family vault tools (Obsidian, Foam, Logseq) — the wikilink and frontmatter choices in tasknotes are compatible with those tools without flowtron depending on them. See `README.md` §"Working in markdown vaults" for the opt-in vault-tool integration surface.

### Diátaxis docs framework

The `docs/` and root-level documentation roughly follow [Diátaxis](https://diataxis.fr/)'s four-quadrant split:

| Quadrant     | File                                            |
|--------------|-------------------------------------------------|
| Reference    | [SPEC.md](../SPEC.md) — workflow contract       |
| How-to       | [docs/MIGRATION.md](MIGRATION.md) — adoption steps |
| Explanation  | [docs/PHILOSOPHY.md](PHILOSOPHY.md) — the "why" |
| Tutorial     | _(not provided)_                                |

The tutorial quadrant is intentionally absent. The `/ft-new-project` skill bootstraps a working flowtron-adopting repo in one pass; the tutorial substitute is "run the skill, then read MIGRATION.md if anything surprises you." A standalone tutorial would duplicate the skill's existing wiring and drift away from it.

### GitHub Actions CI

Flowtron ships a `.github/workflows/ci.yml` CI pipeline that runs on push and pull request to `main`, in two jobs. The `validate` job reuses [AGENTS.md](../AGENTS.md) §"Validation" verbatim — `npm --prefix viz test`, `npm --prefix viz run typecheck`, `npm --prefix viz run lint`, `node --test tools/update-adopters.test.mjs`, `node --check tools/update-adopters.test.mjs`, and `node --check tools/update-adopters.mjs` — on Node 24 with npm caching.

This reverses an earlier decision (`CORE-099.1`, `CORE-115`, `CORE-321`): CI was previously declined because Phase 3 and `/ft-release` already gate every change inline, and flowtron had no external contributor pull requests to gate automatically. That reasoning still holds for *enforcement* — the workflow doesn't replace Phase 3 or `/ft-release`, it duplicates their exact commands as a free, automatic check on every push, catching the case where a change lands without the assistant running the gate (e.g., a manual edit, or a Phase 3 step skipped under `--fast`). That off-machine placement is why this duplication is accepted: the workflow runs on GitHub-hosted runners, not where Phase 3 was (or wasn't) run. A pre-commit hook (§"Pre-commit hooks" below) would rerun the same checks on the authoring machine and would not add enforcement. The commands are identical by design (see AGENTS.md §"Validation"): AGENTS.md is the source of truth, and the four restatements (this workflow, `/ft-release` Step 6, `.flowtron/tasknote/README.md` §"Project quick commands", and this paragraph) are release-gated mirrors.

The second job, `drift`, runs the release-context-free subset of `/ft-release` §7.1's standing cross-file checks — wrapper-name invariant ([SPEC.md](../SPEC.md) §"Skill namespace"), shipped-skill parity, and mirror Pairs A, B, C, and E — as inline `run:` steps over a checkout-only runner. Same off-machine argument, one layer up: §7.1 is correct but only fires when a human cuts a release, and `CORE-469` was a live Pair B failure sitting in `main` between cuts. §7.1 remains the release gate and the broader superset; the checks that need release context or human judgment (SOP currency, the README task counter, installed-surface policy, self-wiring, Pairs D and F–K, and Pair A's content half) stay there and are not duplicated here. No script is added — the shell is lifted from §7.1, adapted only to fail the step on a finding.

The two jobs must stay separate. §7.1 Pair H pins the `validate` job's `run:` steps to AGENTS.md §"Validation" byte-for-byte by extracting every `      - run: ` line in this file; the `drift` job stays out of that extraction by writing its steps as `- name:` + `run: |` block scalars, which is also the shape its multi-line checks need. The workflow carries a comment saying so.

### Canonical source with labeled mirrors

When one rule has to be readable at several points of use, flowtron writes the justification **once** in a canonical section and restates it at each point of use as a **labeled mirror** — a restatement that names the canonical section it mirrors. It does not consolidate the restatements into bare pointers.

The worked example is the no-runtime rule (*contract in flowtron, runtime in the runner*). [VISION.md](VISION.md) §"What we won't accept" carries the justification; [SPEC.md](../SPEC.md) §"PR / suggestion archetypes flowtron does not accept" carries a terse per-bullet mirror for mid-task discipline; and [`SPEC/loop.md`](../SPEC/loop.md), [`SPEC/gates.md`](../SPEC/gates.md), [EXTERNAL-AGENTS.md](EXTERNAL-AGENTS.md), and [WORKTREES.md](WORKTREES.md) each restate the one rejection that bears on their own surface. Every one of those names VISION.

Two properties make this a convention rather than accumulated duplication:

- **A mirror is an application, not a copy.** Each restatement is the rule *as it bears on one surface* — a PR filter, a loop runner's boundary, the `--unattended` posture, a fan-out caveat. Collapsing them into one link loses the application, and it costs a doc-load at exactly the moment a reader is deciding something local. `SPEC.md`'s list declares itself "for future-AI mid-task discipline"; an assistant mid-task should not have to load `VISION.md` — which is deliberately *outside* the cold-start doc set (see `.flowtron/tasknote/README.md` §"AI-referenced docs") — to learn that a scheduler is out of scope.
- **A mirror is labeled, so drift is legible.** An unsourced restatement reads as accidental duplication to anyone auditing from outside, which is how this convention came to be written down at all (CORE-487, routed in from a cross-repo sweep that could not tell intent from drift). The label is what makes the difference visible without a validator.

Consistent with §"Schema validators" in VISION.md, the prose is not machine-checked: markdown is the schema and the assistant catches wording drift. What *is* mechanical is the label — `/ft-release` §7.1 **Pair K** checks that each mirror's citation resolves to a real canonical bullet and that each point-of-use section still names VISION. That guards pointer rot and citation rot, and claims nothing about paraphrase.

## Declines

### CHANGELOG.md

Flowtron does not maintain a separate `CHANGELOG.md`. The pattern declined is [Keep a Changelog 1.1](https://keepachangelog.com/en/1.1.0/) — no `[Unreleased]` section, no exhaustive Added/Changed/Fixed taxonomy, no parallel hand-maintained dump of every commit.

Each release tag's annotated message carries the per-release summary and migration steps. From the `README.md` §"Version": full notes live in the tags; adopters read them with `git show vX.Y.Z`. A Keep-a-Changelog file would have to be hand-maintained alongside those messages without adding information.

**Scannable highlights (not a CHANGELOG).** [`docs/VERSION-HISTORY.md`](VERSION-HISTORY.md) is a curated, moderately-coarse highlight reel (main themes + optional secondary wins; patches as one-liners). It is deliberately coarser than the tag bodies and is prepended by `/ft-release` when a cut lands — tags remain the SSOT for full notes and migration steps. The annotated-tag message structure (subject + summary + changes + adopter migration block) is also visible in the release tasknotes archived at `.flowtron/tasknote/archive/core/`.

### ADRs as a separate registry

The pattern declined is a separate `adr/` directory of numbered decision records (e.g. [adr.github.io](https://adr.github.io/) / Michael Nygard's template).

Important nuance: flowtron's tasknote shape already carries decision records. Each tasknote opens with spec-on-top (Goal, Acceptance, Subtasks, Related) and concludes with a log-below (4 phases of execution + final summary). That structure mirrors Context / Decision / Consequences. Tasknotes are searchable, cross-linked via `[[wikilink]]`, and archived alongside the code change they justify.

What flowtron declines is the separate registry — not the act of recording decisions. A new `adr/0001-*.md` would duplicate the tasknote it's mirroring.

### Release automation

Flowtron does not use tools like [release-please](https://github.com/googleapis/release-please) or [semantic-release](https://github.com/semantic-release/semantic-release). Releases are cut manually via the `/ft-release` skill.

Two reasons. First, release-automation tooling typically reads Conventional Commits to generate a CHANGELOG — which flowtron declines (see above). Second, automation couples release timing to commit history, where flowtron prefers release timing to be a deliberate human judgment ("is this a coherent release-worthy unit?"). The skill encodes the recipe; the decision to cut a release stays with the maintainer.

Backing principle: [PHILOSOPHY.md](PHILOSOPHY.md) §"The decisions that fall out" (Zero scripts) — flowtron's "operations" are markdown edits and `cp` / `mv`, executed by the assistant via skills, not by background tooling.

### Pre-commit hooks

Flowtron does not ship pre-commit hooks. The pattern declined is [pre-commit](https://pre-commit.com/)-style framework hooks.

Validation runs inline as Phase 3 of every tasknote — targeted tests, lint and type-check on changed code, optional visual confirmation for frontend changes. Phase 3 is part of the workflow contract (see [SPEC.md](../SPEC.md)) and runs in the same context where the change was authored. Hooks would duplicate that check at commit time on the same machine — if Phase 3 was skipped, a hook only repeats the gate in the same context; it does not catch a landed change the way §"GitHub Actions CI" does by running off the authoring machine.

Same backing principle as release automation: [PHILOSOPHY.md](PHILOSOPHY.md) §"The decisions that fall out" (Zero scripts) — the assistant is the validator, and the workflow phase is the gate.

### MCP servers

Flowtron does not ship an [MCP](https://modelcontextprotocol.io/) server. The pattern declined is exposing the workflow to the assistant as a tool surface rather than as markdown it reads — the shape taken by [claude-task-master](https://github.com/eyaltoledano/claude-task-master) and [Backlog.md](https://github.com/MrLesk/Backlog.md).

The objection is cost, not capability. An MCP server's tool definitions occupy the context window before any task work begins — task-master ships 36 tools totalling roughly 21k tokens, and added selective tool loading specifically to claw some of that back. That is a direct trade against [SPEC.md](../SPEC.md) §"Core principles" #3 (One task per context window), which sizes tasknotes so the assistant holds the whole scope in working memory. Flowtron spends its context budget on the task, not on the interface to the task.

Nothing in the workflow needs a tool call. A tasknote is a file the assistant reads; closure is a `mv`. Wrapping `cp` and `mv` in a protocol adds a server to run and a schema to version without changing what happens.

Backing principle: [PHILOSOPHY.md](PHILOSOPHY.md) §"The decisions that fall out" (Zero scripts) — "If a script feels needed, the answer is almost always 'no, that's the assistant's job.'"

### Package-manager and marketplace distribution

Flowtron is distributed as a git submodule only. The patterns declined are global package-manager install (`npm i -g backlog.md`, `uv tool install specify-cli`), agent plugin marketplaces (`/plugin marketplace add`), and skill-pack installers (`npx skills add …`).

The submodule is not incidental packaging — it *is* the mechanism behind [SPEC.md](../SPEC.md) §"Core principles" #5 (Versioned and pinned). An adopting project pins a specific flowtron commit, sees no change until a deliberate `/ft-update` bump, and can read its own pinned contract at `.flowtron/core/SPEC.md`. A package manager resolving a version range, or a marketplace pushing the current release, replaces that deliberate bump with an implicit one.

The skills also assume it. Every skill resolves its contract root to `.flowtron/core/` (see [`claude/skills/ft-task/SKILL.md`](../claude/skills/ft-task/SKILL.md) §"Step 0 — Resolve paths"). A marketplace install would deliver the skills without the contract they read, producing an inert install — or force a second bundled copy of SPEC.md, splitting the single source of truth the submodule exists to guarantee.

The cost is acknowledged: adoption is a `git submodule add` plus symlink wiring rather than one install command, which is real friction for a first-time adopter. `/ft-new-project` absorbs it in one pass. The friction buys the pin.

This is distinct from the CLI carve-out in [SPEC.md](../SPEC.md) §"What flowtron does NOT provide" — that entry rules out flowtron *being* a CLI; this one rules out flowtron being *delivered* by one. A package-manager-distributed flowtron would still be pure markdown, and is still declined.

### Template override stacking

Flowtron resolves each template from exactly one place: `templates/` in the pinned submodule. The pattern declined is layered template resolution — [spec-kit](https://github.com/github/spec-kit) stacks project overrides → presets → extensions → core defaults, four levels deep, with per-project override directories.

Customization is a real need and flowtron already answers it once, at a single seam: the `ft-audit` skill ships as a stack-neutral scaffold that adopters **fork** into `.claude/skills/audit/` (see [MIGRATION.md](MIGRATION.md) §1.2.1). A fork is legible — the adopter owns a file and can diff it against the scaffold. A four-level priority chain is not: answering "which template actually rendered, and why" requires resolving the stack in your head.

Backing principle: [SPEC.md](../SPEC.md) §"PR / suggestion archetypes flowtron does not accept" — "Abstractions without two-project precedent." No two adopters have yet needed the same override shape; until they do, forking a scaffold is cheaper than a resolution engine.
