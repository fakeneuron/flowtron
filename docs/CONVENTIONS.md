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

The annotated tag message for the corresponding release lists migration steps regardless of indicator style. Pre-v3.0.0 commits used a parenthetical `(...BREAKING)` form in the subject; the canonical `!` is the going-forward convention.

### Semantic Versioning 2.0

Flowtron releases follow [Semantic Versioning 2.0](https://semver.org/spec/v2.0.0.html). The patch/minor/major split is enforced through the workflow contract — see [SPEC/versioning.md](../SPEC/versioning.md) for flowtron's specific definitions of each bump tier and for the adopter-side migration motion.

The cross-link is deliberate: `SPEC/versioning.md` is the operational doc (what the bump tiers mean for flowtron); the canonical spec is the underlying contract.

### GitHub Flavored Markdown

All flowtron markdown — `SPEC.md`, `SPEC/`, templates, tasknotes, `docs/`, `README.md`, and the bundled skills — targets [GitHub Flavored Markdown](https://github.github.com/gfm/) (a CommonMark superset). Features in use: fenced code blocks with language tags, tables, task lists, emoji shortcodes, and `[[wikilink]]` syntax for cross-task references in tasknotes.

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

## Declines

### CHANGELOG.md

Flowtron does not maintain a separate `CHANGELOG.md`. The pattern declined is [Keep a Changelog 1.1](https://keepachangelog.com/en/1.1.0/).

Each release tag's annotated message carries the per-release summary and migration steps. From the `README.md` §"Version": _"Each release tag's annotated message lists migration steps for major bumps (no separate `CHANGELOG.md`)."_ A duplicate CHANGELOG.md would have to be hand-maintained alongside the tag messages without adding information.

The annotated-tag-as-CHANGELOG pattern is visible in the release tasknotes — e.g. `CORE-043` (v1.0.0) and `CORE-046` (v1.1.0) both record the tag-message structure: subject + summary + changes + adopter migration block.

### ADRs as a separate registry

The pattern declined is a separate `adr/` directory of numbered decision records (e.g. [adr.github.io](https://adr.github.io/) / Michael Nygard's template).

Important nuance: flowtron's tasknote shape already carries decision records. Each tasknote opens with spec-on-top (Goal, Acceptance, Subtasks, Related) and concludes with a log-below (4 phases of execution + final summary). That structure mirrors Context / Decision / Consequences. Tasknotes are searchable, cross-linked via `[[wikilink]]`, and archived alongside the code change they justify.

What flowtron declines is the separate registry — not the act of recording decisions. A new `adr/0001-*.md` would duplicate the tasknote it's mirroring.

### Release automation

Flowtron does not use tools like [release-please](https://github.com/googleapis/release-please) or [semantic-release](https://github.com/semantic-release/semantic-release). Releases are cut manually via the `/ft-release` skill.

Two reasons. First, release-automation tooling typically reads Conventional Commits to generate a CHANGELOG — which flowtron declines (see above). Second, automation couples release timing to commit history, where flowtron prefers release timing to be a deliberate human judgment ("is this a coherent release-worthy unit?"). The skill encodes the recipe; the decision to cut a release stays with the maintainer.

Backing principle: [PHILOSOPHY.md](PHILOSOPHY.md) §"Zero scripts" — flowtron's "operations" are markdown edits and `cp` / `mv`, executed by the assistant via skills, not by background tooling.

### Pre-commit hooks

Flowtron does not ship pre-commit hooks. The pattern declined is [pre-commit](https://pre-commit.com/)-style framework hooks.

Validation runs inline as Phase 3 of every tasknote — targeted tests, lint and type-check on changed code, optional visual confirmation for frontend changes. Phase 3 is part of the workflow contract (see [SPEC.md](../SPEC.md)) and runs in the same context where the change was authored; hooks would duplicate the check at commit time.

Same backing principle as release automation: [PHILOSOPHY.md](PHILOSOPHY.md) §"Zero scripts" — the assistant is the validator, and the workflow phase is the gate.
