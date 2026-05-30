# Multi-platform wiring pattern

Flowtron's contract is agent-neutral; its execution-surface wiring is
per-platform. This doc explains the two-layer model that separates them
and the symmetric plug-in pattern future platforms (Codex CLI, grok,
Cursor, …) follow if a contributor ships their wiring. Today only
Claude Code has wiring shipped; other platforms drive the contract
conversationally from `AGENTS.md`.

Audience: rare. Read this when adding a new platform's wiring,
auditing the wiring layer's structure, or writing a follow-up to
[`AGENT-NEUTRALITY.md`](AGENT-NEUTRALITY.md).

## The two-layer model

| Layer | What it is | Where it lives | Agent-neutrality |
|---|---|---|---|
| **Contract** | The workflow spec any AI can follow conversationally — relevance gate, 4-phase tasknote lifecycle, post-closure protocol, versioning rules. | `SPEC.md`, `SPEC/`, `templates/`, `docs/`, `README.md`, `SECURITY.md`, and the `AGENTS.md` paste-block. | Mandatory. Any AI reading `AGENTS.md` should be able to execute the contract without platform-specific machinery. |
| **Wiring** | The platform-specific execution surface — slash commands, skills, structured-ask primitives, operator flags, install/symlink mechanics. | `claude/` today; future sibling top-level dirs per the plug-in pattern below. | Per-platform. Constraints documented in [`AGENT-NEUTRALITY.md`](AGENT-NEUTRALITY.md). |

The split is non-negotiable: leaking platform-specific assumptions into
the contract layer fails [[CORE-154.1]] Constitution principle 1 (the
[`AGENT-NEUTRALITY.md`](AGENT-NEUTRALITY.md) ledger records the
intentional load-bearing locators that may *reference* the Claude Code
wiring but don't *depend* on it for contract semantics).

## Today's surface

| Platform | How it consumes flowtron | What ships in this repo |
|---|---|---|
| **Claude Code** | Wiring layer + contract layer. Seven tasknote skills (`/ft-task`, `/ft-starter-task`, `/ft-micro-task`, `/ft-file-followup`, `/ft-epic-discovery`, `/ft-close-epic`, `/ft-debug`) plus two thin worktree utilities (`/ft-worktree-start`, `/ft-worktree-end`) drive the SPEC's 4-phase workflow inline (or accelerate independent epic children); the six `/ft-audit`-family skills run the 5-pass recipe; standalone skills `/ft-new-project`, `/ft-release`, `/ft-flowtron`, `/ft-stats`, `/ft-quality`, `/ft-audit-context` follow their own recipes. | `claude/` — `AGENTS-snippet.md` + `commands/*.md` + `skills/*/SKILL.md` (+ lazy fragments). Adopters symlink the bundle under `.claude/` per `claude/AGENTS-snippet.md` §"One-time symlink wiring". |
| **Codex CLI, Cursor, Sourcegraph Amp, Aider, Grok Build** | Contract layer only. The platform reads `AGENTS.md`, sees flowtron's paste-block, and drives the contract conversationally — relevance gate, phase boundaries, post-closure protocol all live in `SPEC.md`. No platform-specific machinery required. | Nothing platform-specific. Adopters paste the `AGENTS.md` block from `claude/AGENTS-snippet.md` §"Block to paste into AGENTS.md"; that block is agent-neutral by design. For Grok Build adoption specifics (context-load semantics, AGENTS.md visibility, skill/command primitives), see §"Grok Build adoption notes" below. |

A platform doesn't need its own wiring to be useful. Most adopters paste
the `AGENTS.md` block and drive conversationally. Wiring is an *optional
uplift* that adds slash-command ergonomics — relevant only when the
platform offers a skill/command primitive and a contributor wants to
expose flowtron through it.

## The symmetric plug-in pattern

When a contributor ships wiring for a new platform (`codex`, `grok`,
`cursor`, …), it lands as a **sibling top-level directory** at the
repo root, named after the platform:

```text
flowtron/
├── claude/         # Claude Code wiring (today)
├── codex/          # hypothetical Codex CLI wiring
├── grok/           # hypothetical grok-cli wiring
└── cursor/         # hypothetical Cursor wiring
```

The structural decision is locked at [[CORE-154.3]]: no parent
`wiring/` dir, no rename of `claude/`. Adopter symlinks already in
production (InvisiPaw, fintown, photard) point at
`../../_project/flowtron/claude/...` — that path stability is a
non-negotiable per [[CORE-154.1]] Constitution.

### Naming conventions

- **Directory name**: lowercase platform identifier, matching how the
  platform is conventionally referenced — `claude` (Claude Code),
  `codex` (OpenAI Codex CLI), `grok` (grok-cli), `cursor` (Cursor IDE),
  `aider` (Aider), `amp` (Sourcegraph Amp).
- **Skill prefix**: the `ft-` namespace stays reserved across platforms
  per SPEC §"Skill namespace". A platform's skill bundle uses the same
  `ft-<name>` slugs as Claude Code (e.g., `ft-task`, `ft-micro-task`),
  even if file extensions or formats differ. Adopters wiring multiple
  platforms then have semantically equivalent commands across them.
- **Adopter install location**: each platform decides. Claude Code uses
  `.claude/commands/` + `.claude/skills/` (the platform's own
  convention); other platforms use their own.

### Hard constraints

- **Don't rename `claude/`.** Adopter symlinks depend on path stability.
- **Don't move the `AGENTS.md` paste-block out of agent-neutral
  framing.** The paste-block in `claude/AGENTS-snippet.md` §"Block to
  paste into AGENTS.md" is agent-neutral — it lives under `claude/`
  for historical / single-source-of-truth reasons, not because it's
  Claude-specific. Sharing this content across platforms is the
  default; see §"Single-source-of-truth posture" below.
- **Don't leak platform-specific terms into the contract layer.** Any
  new platform wiring documents itself in its own dir and (if needed)
  in this doc; SPEC/, templates/, and the agent-neutral docs stay
  clean. The [`AGENT-NEUTRALITY.md`](AGENT-NEUTRALITY.md) ledger is the
  audit reference.
- **Don't add a CLI / daemon / validator.** Per [`PHILOSOPHY.md`](PHILOSOPHY.md)
  §"Zero scripts" — wiring is markdown + the platform's own primitives.

## Minimal scaffold sketch

A new platform's wiring directory follows this shape. This is an
example, not a `templates/` artifact — every speculative file extension
depends on the target platform's skill/command format, so concrete
template files would have to guess. The shape below is the contract.

```text
<platform>/
├── AGENTS-snippet.md                       # Adopter-facing paste-block + wiring commands
├── commands/                               # Slash-command-equivalent entry points (if the platform supports them)
│   ├── ft-task.<ext>
│   ├── ft-starter-task.<ext>
│   ├── ft-micro-task.<ext>
│   ├── ft-file-followup.<ext>
│   ├── ft-epic-discovery.<ext>
│   └── ft-close-epic.<ext>
└── skills/                                 # Skill bodies (each in its own dir)
    ├── ft-task/
    │   └── SKILL.<ext>
    ├── ft-starter-task/
    │   └── SKILL.<ext>
    └── ...
```

`<ext>` is whatever the target platform's skill format demands —
markdown for Claude Code (`.md`), platform-specific for others. The
naming convention (`ft-<name>`) stays constant; the contents adapt.

### What the `<PLATFORM>`-snippet must contain

Sectioned like `claude/AGENTS-snippet.md`:

1. **Block to paste into `AGENTS.md`** — the agent-neutral workflow
   block. By default, share the canonical text from
   `claude/AGENTS-snippet.md`; only duplicate if the new platform
   genuinely needs different paste-block content (which would
   defeat `AGENTS.md`'s open-standard purpose — surface the
   divergence in this doc if it happens).
2. **One-time wiring commands** — how an adopter installs the skill
   bundle under the platform's own convention. For Claude Code these
   are relative symlinks; for another platform they might be
   `cp` / `install` / a platform-specific registration command.
3. **Pinning notes** — how the platform's wiring tracks the
   submodule's pinned flowtron commit. Symlinks track automatically;
   copies need re-copying on bump; other mechanisms documented inline.

### Single-source-of-truth posture

Per [[CORE-091]]: each platform's `AGENTS-snippet.md` is the **sole**
source of truth for that platform's wiring commands.
[`MIGRATION.md`](MIGRATION.md) and any platform-specific adoption guide
point at the snippet; they don't duplicate the commands.

For the `AGENTS.md` paste-block itself: today the canonical text lives
in `claude/AGENTS-snippet.md` §"Block to paste into AGENTS.md". A new
platform's snippet should reference this single source rather than
duplicate the block, unless platform-specific content requires
divergence (and divergence is documented here).

### Mandatory vs. optional reference

| Surface | Status | Notes |
|---|---|---|
| `AGENTS.md` paste-block visible to the platform | **Mandatory** | The contract entry-point. Without this, the AI has no flowtron context. |
| `<platform>/AGENTS-snippet.md` (or equivalent adopter-facing doc) | Strongly recommended | Adopters need a single canonical doc for the wiring commands. |
| `<platform>/commands/` + `<platform>/skills/` | Optional | A platform without command/skill primitives runs flowtron conversationally — same path as Codex CLI / Cursor / Amp / Aider / Grok Build today. |
| Operator force-skip flag (e.g., `--fast`) | Optional | Mirror SPEC §"Operator-gate cues" in the platform's flag syntax if convenient. Concept is platform-neutral; syntax is wiring detail. |
| Install/symlink mechanism | Optional | Depends on the platform's skill-consumption model. Claude Code uses relative symlinks; others may use copies or registry calls. |
| `/ft-release` skill equivalent | Flowtron-self only | Release-cutting is only relevant if the platform is being used to maintain flowtron upstream. Skip in adopter contexts. |

## Worked example: Claude Code

The only platform with wiring shipped today. Concrete instantiation:

- **Sibling dir**: `claude/` at the repo root
- **Adopter-facing snippet**: `claude/AGENTS-snippet.md`
- **`commands/`**: 21 `.md` slash-command stubs (`ft-task.md`,
  `ft-starter-task.md`, `ft-micro-task.md`, `ft-file-followup.md`,
  `ft-epic-discovery.md`, `ft-close-epic.md`, `ft-debug.md`, `ft-worktree-start.md`, `ft-worktree-end.md`, the six `ft-audit`-family skills,
  plus `ft-new-project.md`, `ft-release.md`, `ft-flowtron.md`,
  `ft-stats.md`, `ft-quality.md`, `ft-audit-context.md`)
- **`skills/`**: 21 `SKILL.md` skill bodies (one per command), some with
  lazy-load fragments (`ft-task/step-*.md`); includes `ft-worktree-start/` and `ft-worktree-end/`
- **Adopter install**: relative symlinks from `.claude/commands/*` and
  `.claude/skills/*` into the submodule, per
  `claude/AGENTS-snippet.md` §"One-time symlink wiring". The relative
  paths survive `git clone` and pin to whichever flowtron commit the
  submodule is checked out at.
- **Operator force-skip flag**: `--fast` / `-f` on `/ft-task` and
  `/ft-micro-task`, per SPEC §"Operator-gate cues".

[`MIGRATION.md`](MIGRATION.md) is the full Claude Code adoption guide —
fresh adoption (§1), heavy migration with full archive lift (§2), and
lightweight migration with active-queue-only lift (§3). A future
sibling-platform adoption guide would mirror this shape inside its own
section (or its own doc) and reference `MIGRATION.md` for the parts
that stay agent-neutral (submodule pinning, AGENTS.md paste, PLAN.md
shape).

## Grok Build adoption notes

xAI's [Grok Build](https://x.ai/cli) CLI (launched May 2026) adopts
flowtron via the **contract-layer-only path** — same as Codex CLI /
Cursor / Amp / Aider. No `grok/` wiring directory exists today;
adopters paste the `AGENTS.md` block per [`MIGRATION.md`](MIGRATION.md)
§1.3 and drive the contract conversationally.

| Quirk | Behavior | Flowtron implication |
|---|---|---|
| **Context-load semantics** | Grok Build reads three context files: `AGENTS.md` (open standard), `CLAUDE.md` (Anthropic-popularized; Grok-compat fallback), and `GROK.md` (Grok-canonical, at `.grok/GROK.md` with cwd walk-up + `~/.grok/GROK.md` global fallback) | Use `AGENTS.md` — already the paste-block target and the cross-vendor canonical entry point. `GROK.md` is orthogonal to flowtron. |
| **AGENTS.md visibility** | Grok Build "picks up AGENTS.md before it does anything" per xAI launch coverage — same load-before-act semantic as Claude Code | Paste-block is visible without configuration; no truncation noted in launch narratives |
| **Skill / command primitives** | Skills live at `.grok/skills/<name>/` (cwd-walk to repo root) + `~/.grok/skills/` + plugin paths + custom paths via `[skills] paths` in `~/.grok/config.toml`. Skill bodies are markdown; user-invocable skills auto-wire as `/<skill-name>` slash commands | A future `grok/` sibling-dir contributor could mirror `claude/`'s shape 1:1: markdown skill bodies, relative symlinks from adopter `.grok/skills/<name>` into the submodule. The `ft-` namespace per SPEC §"Skill namespace" reserves skill names cross-platform. |

_Pre-adoption verification only._ Content above reflects xAI documentation
and Grok Build launch coverage as of May 2026; flowtron has not shipped
`grok/` wiring and has not run a Grok Build session against an adopting
project. Update on first-use observation if anything diverges.

## When this doc is useful

- **Adding a new platform's wiring.** Rare; most adopters paste the
  `AGENTS.md` block and drive conversationally. If you do ship wiring,
  follow the scaffold above + the §"Hard constraints" above.
- **Auditing the wiring layer's structure.** Confirms the sibling-top-level
  pattern hasn't drifted, the `ft-` namespace is intact, and adopter
  symlink paths are stable.
- **Writing a follow-up to [`AGENT-NEUTRALITY.md`](AGENT-NEUTRALITY.md).**
  Cross-reference the two: this doc is the *structural* layer (where
  wiring lives), `AGENT-NEUTRALITY.md` is the *content* layer (which
  Claude-specific references are intentionally load-bearing).

## Out of scope

This doc does **not**:

- Decide whether a new platform's wiring is worth shipping — judgment
  call by the contributor; flowtron makes no recommendation.
- Translate skill content for non-Claude-Code platforms — each
  platform's wiring author decides which skills to translate and how.
- Provide migration tooling for existing adopters — none needed by
  design ([[CORE-154.1]] Constitution non-negotiable on adopter-symlink
  stability).
- Adopt any specific platform's conventions (Codex CLI's command
  shape, grok-cli's skill format, Cursor's MCP semantics, …) — those
  are external; this doc is the *pattern*, not the per-platform
  content.

## Related

- [`SPEC.md`](../SPEC.md) §"Working in the flowtron repo itself" — repo
  layout including the `claude/` locator + this doc's forward-pointer
- [`AGENT-NEUTRALITY.md`](AGENT-NEUTRALITY.md) — the content-layer
  ledger this doc operationalizes structurally
- [`MIGRATION.md`](MIGRATION.md) — Claude Code adoption guide today;
  template shape for future per-platform adoption guides
- `claude/AGENTS-snippet.md` — concrete worked example of the
  `<platform>/AGENTS-snippet.md` shape
- [[CORE-154.1]] Discovery — Constitution + Specification §CORE-154.4
- [[CORE-154.2]] — agent-neutral surface audit + AGENT-NEUTRALITY.md
- [[CORE-154.3]] — wiring-layer structure: option (a) status-quo + sibling-top-level convention
- [[CORE-091]] — single-source-of-truth posture for AGENTS-snippet.md
