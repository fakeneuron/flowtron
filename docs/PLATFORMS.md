# Multi-platform wiring pattern

Flowtron's contract is agent-neutral; its execution-surface wiring is
per-platform. This doc explains the two-layer model that separates them
and the symmetric plug-in pattern additional platforms follow if a
contributor ships their wiring. Today Claude Code and Codex CLI have full
wiring shipped, Cursor ships a thin sibling (`AGENTS-snippet.md` +
procedure pointer), and Grok is Cursor-shaped: it scans `.claude/skills/`
and `.agents/skills/` as compatibility surfaces (so existing Claude or
Codex wiring already serves Grok) and ships a `grok/procedures/ft-task.md`
pointer; other platforms drive the contract conversationally from
`AGENTS.md`.

Audience: rare. Read this when adding a new platform's wiring,
auditing the wiring layer's structure, or writing a follow-up to
[`AGENT-NEUTRALITY.md`](AGENT-NEUTRALITY.md).

## The two-layer model

| Layer | What it is | Where it lives | Agent-neutrality |
|---|---|---|---|
| **Contract** | The workflow spec any AI can follow conversationally — relevance gate, 4-phase tasknote lifecycle, post-closure protocol, versioning rules. | `SPEC.md`, `SPEC/` (including `SPEC/procedures/` for agent-neutral execution SOPs), `templates/`, `docs/`, `README.md`, `SECURITY.md`, and the `AGENTS.md` paste-block. | Mandatory. Any AI reading `AGENTS.md` should be able to execute the contract without platform-specific machinery. |
| **Wiring** | The platform-specific execution surface — slash commands, skills, structured-ask primitives, operator flags, install/symlink mechanics. | `claude/` and `codex/` today (full bundles); `cursor/` ships a thin snippet + procedure pointer; `grok/` carries the `ft-task` procedure pointer and loads `.claude/skills/` / `.agents/skills/` as documented compatibility surfaces (Cursor-shaped); future full bundles use sibling top-level dirs per the plug-in pattern below. | Per-platform. Constraints documented in [`AGENT-NEUTRALITY.md`](AGENT-NEUTRALITY.md). |

The split is non-negotiable: leaking platform-specific assumptions into
the contract layer fails [[CORE-154.1]] Constitution principle 1 (the
[`AGENT-NEUTRALITY.md`](AGENT-NEUTRALITY.md) ledger records the
intentional load-bearing locators that may *reference* the Claude Code
wiring but don't *depend* on it for contract semantics).

## Today's surface

| Platform | How it consumes flowtron | What ships in this repo |
|---|---|---|
| **Claude Code** | Wiring layer + contract layer. Eight tasknote skills (`/ft-task` — which carries debug mode behind `--debug` — `/ft-starter-task`, `/ft-micro-task`, `/ft-file-followup` (which carries park mode behind `--park`), `/ft-epic-discovery`, `/ft-close-epic`, `/ft-goal-task` — which carries worktree handoff behind `--worktree` — `/ft-spec`) plus two thin worktree utilities (`/ft-worktree-start`, `/ft-worktree-end`) drive the SPEC's 4-phase workflow inline (or accelerate independent epic children); the parameterized `/ft-audit <domain>` skill runs the 5-pass recipe over six domains and `/ft-audit-repo` runs the first-contact holistic recipe; standalone skills `/ft-new-project`, `/ft-release`, `/ft-flowtron`, `/ft-stats`, `/ft-audit-context`, `/ft-update` follow their own recipes. | `claude/` — `AGENTS-snippet.md` + `commands/*.md` + `skills/*/SKILL.md` (+ lazy fragments). Adopter installs follow the subset policy below and the executable commands in `claude/AGENTS-snippet.md` §"One-time symlink wiring". |
| **Codex CLI** | Wiring layer + contract layer. Codex consumes the same `AGENTS.md` paste-block, then exposes the adopter subset as repo-scoped skills. `ft-task` routes through the agent-neutral SOP; the other shipped wrappers route to the canonical skill bodies with Codex primitive translation. | `codex/` — `AGENTS-snippet.md` + `skills/*/SKILL.md` wrappers, plus the retained `procedures/ft-task.md` pointer. Adopter installs follow the subset policy below and the executable commands in `codex/AGENTS-snippet.md`; Codex invocation is via `/skills` or `$ft-task` / `$ft-update`, not arbitrary custom `/ft-*` CLI commands. |
| **Cursor** | Wiring layer + contract layer (thin). Cursor reads `AGENTS.md` and discovers skills from `.cursor/skills/`, `.agents/skills/`, and `.claude/skills/` (compat). No Cursor-specific skill wrappers ship — adopters wire the canonical `claude/skills/` bodies. | `cursor/` — `AGENTS-snippet.md` + `procedures/ft-task.md` pointer only. If the project is already wired for Claude Code, it is already wired for Cursor; Cursor-only projects follow the `.cursor/skills/` block in `cursor/AGENTS-snippet.md`. |
| **Grok Build** | Wiring layer + contract layer (thin, Cursor-shaped). Grok reads `AGENTS.md` and discovers skills from `.grok/skills/` (native), `.claude/skills/` (Claude compat, default on), `.cursor/skills/` (Cursor compat, default on), and `.agents/skills/` at each tier. No Grok-specific skill wrappers ship — adopters reuse the canonical `claude/skills/` bodies already wired for Claude or Codex. `--fast` / `--debug` are those bodies' trailing flags. | `grok/` — `procedures/ft-task.md` pointer only today. If the project is already wired for Claude Code or Codex, it is already wired for Grok. Grok-only `.grok/skills/` install is the remaining thin-bundle piece. For Grok Build adoption specifics, see §"Grok Build adoption notes" below. |
| **Sourcegraph Amp, Aider, Gemini CLI** | Contract layer only. The platform reads `AGENTS.md`, sees flowtron's paste-block, and drives the contract conversationally — relevance gate, phase boundaries, post-closure protocol all live in `SPEC.md`. No full platform-specific skill bundle required. | Adopters paste the `AGENTS.md` block from `claude/AGENTS-snippet.md` §"Block to paste into AGENTS.md"; that block is agent-neutral by design. |

A platform doesn't need its own wiring to be useful. Most adopters paste
the `AGENTS.md` block and drive conversationally. Wiring is an *optional
uplift* that adds slash-command ergonomics — relevant only when the
platform offers a skill/command primitive and a contributor wants to
expose flowtron through it.

For the at-a-glance per-agent view — consume-mode, context entry-point,
skill/command primitive, and how current each row is — see the living
matrix in [`AGENT-COMPAT.md`](AGENT-COMPAT.md). This doc owns the
*structural* model; AGENT-COMPAT.md is its *capability/currency*
companion and references the table above rather than re-deriving it.

## Installed-surface policy

Four terms keep the wiring docs precise:

- **Shipped inventory** — the upstream files flowtron publishes under a
  platform directory (`claude/`, `codex/`). This can be broader than what an
  adopter installs into a project.
- **Adopter-installed subset** — symlinks or copies that belong in an adopting
  project's repo-scoped wiring directory, pinned through `.flowtron/core/`.
- **Global-only utilities** — machine-local skills used before a project is
  wired, across many projects, or while maintaining flowtron itself. These live
  under the user's agent home (`~/.claude/skills`, `~/.agents/skills`, or the
  platform equivalent), not in every adopter repo.
- **Flowtron-self-only skills** — upstream maintenance skills that must not be
  installed in adopter projects. They may still ship in the upstream inventory
  so flowtron can dogfood them under that platform.

Canonical policy:

| Surface | Shipped inventory | Adopter-installed subset | Global-only utilities | Flowtron-self-only |
|---|---|---|---|---|
| **Claude Code** | Full `ft-*` command + skill inventory under `claude/commands/` and `claude/skills/`. | The tasknote execution family (`ft-task`, `ft-starter-task`, `ft-micro-task`, `ft-file-followup`, `ft-epic-discovery`, `ft-close-epic`, `ft-goal-task`, `ft-spec`), the worktree pair, and `ft-update`. The `ft-audit` scaffold is forked/overlaid locally under an unprefixed name, not symlinked as an upstream `ft-*` project skill. | `ft-new-project`, `ft-flowtron`, `ft-stats`, `ft-audit-context`, and `ft-audit-repo`. | `ft-release`. |
| **Codex CLI** | Full `ft-*` wrapper inventory under `codex/skills/`, kept in parity with Claude's shipped skill slugs. | Same policy as Claude, translated to `.agents/skills/`: tasknote execution family (including `ft-spec`), worktree pair, and `ft-update`. Focused audits remain fork/overlay surfaces rather than verbatim upstream project symlinks. | Same utility set as Claude, installed in Codex's user skill directory when desired. | `ft-release`. |
| **Cursor** | Thin bundle: `cursor/AGENTS-snippet.md` + `cursor/procedures/ft-task.md` only — no `cursor/skills/` wrappers. | Same adopter subset as Claude, targeting either existing `.claude/skills/` (Cursor compat load — preferred when Claude is already wired) or `.cursor/skills/` for Cursor-only projects, always symlinking canonical `claude/skills/` bodies. | Same utility set as Claude, installed in Cursor's user skill directory when desired. | N/A — no Cursor `ft-release` surface. |
| **Grok Build** | Thin: `grok/procedures/ft-task.md` only — no `grok/skills/` wrappers. | Same adopter subset as Claude, targeting existing `.claude/skills/` (Grok Claude-compat — preferred when Claude is already wired) or `.agents/skills/` (when Codex is already wired). Grok-only projects can symlink the same canonical `claude/skills/` bodies into `.grok/skills/` (native). | Same utility set as Claude, installed in `~/.grok/skills/` when desired. | N/A — no Grok `ft-release` surface. |

The distinction is deliberate. Shipping a wrapper means flowtron can maintain,
test, and dogfood a platform-equivalent recipe; it does not automatically mean
every adopting project should expose that recipe as repo-scoped wiring. The
per-platform `AGENTS-snippet.md` files are the executable install source and
must be kept aligned to this policy. Release guardrails that verify these
surfaces stay aligned are tracked by [[CORE-349.5]].

**Flowtron's own checkout is not an adopter.** The adopter-installed subset
above governs projects that consume flowtron through `.flowtron/core/`. Flowtron
itself dogfoods everything it ships, so its repo-scoped `.claude/skills/` and
`.claude/commands/` mirror the **full** shipped inventory one-for-one —
including the global-only utilities and `ft-release`. A shipped `ft-*` slug with
no `.claude/` symlink is a wiring miss, not a policy choice; that is the exact
gap that left `/ft-spec` unrunnable in flowtron's own checkout for a month after
it shipped. Machine-global `~/.claude/` installs stay discretionary per
[`MIGRATION.md`](MIGRATION.md) §1.0 — but *discretionary* governs **which**
utilities you install, not how many copies of a slug exist; see the rule below.
Only *broken* links there are drift. `/ft-release` §7.1 verifies both surfaces.

### One canonical install path per project

The categories above say *which* skills install where. This says **how many
times**: once. Repo-scoped wiring is canonical — the copy that should run is the
one wired into the project you are working in, whether that is an adopter's
`.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, or `.grok/skills/`
pinned through `.flowtron/core/`, or flowtron's own full mirror. An agent home
(`~/.claude/skills`, `~/.agents/skills`, `~/.grok/skills`, or the platform
equivalent) therefore carries **only the global-only utilities**. The
adopter-installed subset and `ft-release` are never installed globally, because
every repo that can use them already wires them repo-scoped.

Two agent behaviours make this a correctness rule rather than tidiness:

- **Project scope and user scope enumerate separately.** A slug present in both
  is listed twice in the session's skill roster. Globbing the shipped inventory
  into an agent home *and* wiring it repo-scoped therefore doubles flowtron's
  footprint in every session before any work starts — measured at 36 roster
  entries for 18 skills in a flowtron-self session ([[CORE-439]]).
- **User-scope collisions resolve by slug, not by body.** Where an agent reads
  more than one home directory, a same-named skill in one shadows the other with
  no regard for which platform authored it. `~/.agents/skills/` is read by Codex,
  Claude Code, Cursor, and Grok alike, so a globally installed `codex/skills/`
  wrapper can be served to an agent it was not written for — and those wrappers
  carry Codex-specific instructions (degrade a structured ask to prose) that are
  wrong on a platform with a native one. Install Codex wrappers in an agent home
  only on a machine where Codex is the driver, and only the utility set.

The rule binds new platform wiring too: a platform's `AGENTS-snippet.md` adds a
repo-scoped install path, not another global one.

## The symmetric plug-in pattern

When a contributor ships wiring for a new platform (`codex`, `grok`,
`cursor`, …), it lands as a **sibling top-level directory** at the
repo root, named after the platform:

```text
flowtron/
├── claude/         # Claude Code wiring
├── codex/          # Codex skill wrappers + ft-task procedure pointer
├── grok/           # procedure pointer; Cursor-shaped skill compat (.claude/.agents)
└── cursor/         # Cursor thin wiring (snippet + ft-task procedure pointer)
```

The structural decision is locked at [[CORE-154.3]]: no parent
`wiring/` dir, no rename of `claude/`. Adopter symlinks already in
production (InvisiPaw, siteguy, marscharts, …) point at
`../../.flowtron/core/claude/...` — that path stability is a
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
- **Don't add a CLI / daemon / validator.** Per [`PHILOSOPHY.md`](PHILOSOPHY.md)'s
  "Zero scripts" principle — wiring is markdown + the platform's own primitives.

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
| `<platform>/commands/` + `<platform>/skills/` | Optional | A platform without its own command/skill *wrappers* can still ship a thin snippet that points adopters at another platform's canonical bodies (Cursor) or run flowtron conversationally (Amp / Aider / Gemini CLI today). Grok Build is Cursor-shaped: it loads those bodies from `.claude/skills/` / `.agents/skills/` without its own wrappers. Codex uses `skills/` only because its documented reusable workflow primitive is skills selected via `/skills` or `$name`, not arbitrary custom slash commands. |
| Operator force-skip flag (e.g., `--fast`) | Optional | Mirror SPEC §"Operator-gate cues" in the platform's flag syntax if convenient. Concept is platform-neutral; syntax is wiring detail. |
| Install/symlink mechanism | Optional | Depends on the platform's skill-consumption model. Claude Code uses relative symlinks; others may use copies or registry calls. |
| `/ft-release` skill equivalent | Flowtron-self only | Release-cutting is only relevant if the platform is being used to maintain flowtron upstream. Skip in adopter contexts. |

## Worked example: Claude Code

Concrete instantiation:

- **Sibling dir**: `claude/` at the repo root
- **Adopter-facing snippet**: `claude/AGENTS-snippet.md`
- **`commands/`**: 18 `.md` slash-command stubs (`ft-task.md`,
  `ft-starter-task.md`, `ft-micro-task.md`, `ft-file-followup.md`,
  `ft-epic-discovery.md`, `ft-close-epic.md`, `ft-goal-task.md`, `ft-spec.md`, `ft-worktree-start.md`, `ft-worktree-end.md`, the two `ft-audit`-family skills (`ft-audit.md`, `ft-audit-repo.md`),
  plus `ft-new-project.md`, `ft-release.md`, `ft-flowtron.md`,
  `ft-stats.md`, `ft-audit-context.md`, `ft-update.md`)
- **`skills/`**: 18 `SKILL.md` skill bodies (one per command), some with
  lazy-load fragments (`ft-task/step-*.md`, including `step-4-debug-mode.md`; `ft-file-followup/park-mode.md`) or sibling libraries (`ft-audit/passes/*.md`); includes `ft-worktree-start/` and `ft-worktree-end/`
- **Adopter install**: relative symlinks for the adopter-installed subset from
  `.claude/commands/*` and `.claude/skills/*` into the submodule, per
  `claude/AGENTS-snippet.md` §"One-time symlink wiring". The relative
  paths survive `git clone` and pin to whichever flowtron commit the
  submodule is checked out at.
- **Operator force-skip flag**: `--fast` / `-f` on `/ft-task`,
  `/ft-micro-task`, and `/ft-goal-task`, per SPEC
  §"Operator-gate cues" (`/ft-spec` carries a separate, unrelated
  `--fast` that never touches the gate surface)
- **Operator mode flag**: `--debug` / `-d` on `/ft-task`, loading the
  `step-4-debug-mode.md` lazy fragment (hypothesis-first Phase 1 prompts +
  Phase 3 repro re-verify); composes with `--fast` in either order.
  `--park` / `-p` on `/ft-file-followup`, loading the `park-mode.md` lazy
  fragment (priority flags, `.flowtron/sidequest/` stub + resume anchor,
  no review gate, ≤70w reply, resume inline).
  `--worktree` on `/ft-goal-task` runs Phase 1 in-session then hands off to
  `/ft-worktree-start` so the execute→verify loop runs in an isolated worktree
  (see `docs/WORKTREES.md`)

[`MIGRATION.md`](MIGRATION.md) is the full Claude Code adoption guide —
fresh adoption (§1), heavy migration with full archive lift (§2), and
lightweight migration with active-queue-only lift (§3). Sibling platform
guides mirror this shape only where their own install primitive differs
and reference `MIGRATION.md` for the parts that stay agent-neutral
(submodule pinning, AGENTS.md paste, PLAN.md shape).

## Worked example: Codex CLI

Concrete instantiation:

- **Sibling dir**: `codex/` at the repo root
- **Adopter-facing snippet**: `codex/AGENTS-snippet.md`
- **`skills/`**: 18 `SKILL.md` wrappers, one per Claude `ft-*` skill slug.
  The wrappers keep short Codex-native metadata, then route to the
  agent-neutral SOP (`ft-task`) or the canonical Claude skill body with
  Codex primitive translation.
- **`procedures/`**: `ft-task.md` retained as a contract-only pointer for
  agents/operators that ask to load the SOP directly.
- **Adopter install**: relative symlinks for the adopter-installed subset from
  `.agents/skills/*` into the submodule, per `codex/AGENTS-snippet.md`
  §"One-time skill wiring". The relative paths survive `git clone` and pin to
  whichever flowtron commit the submodule is checked out at.
- **Invocation**: Codex exposes skills through `/skills` selection and
  `$ft-task` / `$ft-update` style mentions. Flowtron preserves the same
  exported `ft-*` names, but does not claim Codex supports arbitrary custom
  `/ft-*` slash commands.

## Worked example: Cursor

Concrete instantiation of the thin-bundle shape:

- **Sibling dir**: `cursor/` at the repo root
- **Adopter-facing snippet**: `cursor/AGENTS-snippet.md`
- **No `commands/` or `skills/` wrappers** — Cursor loads `.claude/skills/`
  as a compatibility surface and discovers `.cursor/skills/` / `.agents/skills/`
  natively; adopters symlink the canonical `claude/skills/` bodies
- **Procedure pointer**: `cursor/procedures/ft-task.md` routes to
  `SPEC/procedures/ft-task.md`
- **Adopter install**: if Claude `.claude/` wiring already exists, stop —
  Cursor is already served. Cursor-only projects run the `.cursor/skills/`
  block in `cursor/AGENTS-snippet.md` §"One-time symlink wiring"
- **Operator flags**: same `--fast` / `--debug` spellings as the Claude skill
  bodies they invoke (no Cursor-specific translation layer)

## Grok Build adoption notes

xAI's [Grok Build](https://x.ai/cli) CLI (launched May 2026) adopts
flowtron via a **Cursor-shaped thin path**: it reads `AGENTS.md` and
discovers skills from `.claude/skills/` and `.agents/skills/` as
compatibility surfaces (plus native `.grok/skills/`), so a project
already wired for Claude Code or Codex is already wired for Grok. A
`grok/procedures/ft-task.md` procedure pointer ships in the repo
(CORE-271.4); no Grok-specific skill wrappers exist. Adopters paste the
`AGENTS.md` block per [`MIGRATION.md`](MIGRATION.md) §1.3. Amp / Aider /
Gemini CLI remain the contract-layer-only path (see §"Today's surface").

| Quirk | Behavior | Flowtron implication |
|---|---|---|
| **Context-load semantics** | Grok Build reads three context files: `AGENTS.md` (open standard), `CLAUDE.md` (Anthropic-popularized; Grok-compat fallback), and `GROK.md` (Grok-canonical, at `.grok/GROK.md` with cwd walk-up + `~/.grok/GROK.md` global fallback) | Use `AGENTS.md` — already the paste-block target and the cross-vendor canonical entry point. `GROK.md` is orthogonal to flowtron. |
| **AGENTS.md visibility** | Grok Build "picks up AGENTS.md before it does anything" per xAI launch coverage — same load-before-act semantic as Claude Code | Paste-block is visible without configuration; no truncation noted in launch narratives |
| **Skill / command primitives** | Native: `.grok/skills/<name>/` (cwd-walk to repo root) + `~/.grok/skills/` + plugin paths + `[skills] paths` in `~/.grok/config.toml`. Compat (default on): `.claude/skills/` / `.claude/commands/`, `.cursor/skills/`, and `.agents/skills/` at each tier. Skill bodies are markdown; user-invocable skills auto-wire as `/<skill-name>` slash commands | If Claude or Codex is already wired, Grok is already served — no second install. Grok-only projects symlink the canonical `claude/skills/` bodies into `.grok/skills/`. The `ft-` namespace per SPEC §"Skill namespace" reserves skill names cross-platform. `--fast` / `--debug` are those bodies' trailing flags, available as soon as they load. |

First-use verification 2026-06-01 (CORE-257 cue dogfood under Grok 4.3 interactive CLI). /ft-task + full 4-phase flow + AskUserQuestion structured prompt all rendered and executed successfully. Structured ask primitive observed to work (divergence from launch-coverage assumption in the triggers table below); other details matched. See docs/AGENT-COMPAT.md for the canonical matrix row currency.

## Non-Claude capability triggers

_Mirrors the per-trigger shape in [`../claude/CAPABILITIES.md`](../claude/CAPABILITIES.md) —
**what it is · syntax · what it controls in flowtron · when to reach for it** — for the
non-Claude agents in the matrix. Flowtron has not run a session under several
of these agents. Grok Build, Codex CLI, and Cursor now carry
first-use observations; remaining stub rows reflect vendor documentation and
launch coverage. Update a row on first-use observation if anything diverges.
This mirrors the pre-adoption framing in §"Grok Build adoption notes" above._

### Grok Build

| Trigger | Syntax | What it controls in flowtron | When to reach for it |
|---|---|---|---|
| **Effort / thinking level** | A `reasoning_effort` (Chat Completions) / `reasoning.effort` (Responses API) parameter — `none` / `low` / `medium` / `high` — independent of which model is selected; default varies by model. | Maps to the `[heavy]` / `[medium]` / `[light]` PLAN-line tokens. Heavier reasoning suits Discovery-heavy or cross-cutting tasknotes; lighter suits mechanical edits. | Match the running effort level to the task's `[model]` token. Switch before invoking the skill if the task's `[model]` differs from the current session's effort setting. |
| **Skill invocation** | `/ft-task` (and peer `/ft-*`) after wiring — Grok auto-exposes skills as slash commands. Discovery paths: `.grok/skills/` (native); `.claude/skills/` and `.claude/commands/` (Claude compat, default on); `.cursor/skills/` (Cursor compat, default on); `.agents/skills/` at each tier. | Drives the full 4-phase tasknote runner and peer skills from the same canonical `claude/skills/` bodies Claude Code uses — no Grok-specific wrappers. | Normal flowtron operations under Grok. Prefer repo-scoped wiring; if Claude `.claude/` or Codex `.agents/skills/` is already present, stop — Grok is already served. |
| **Force-skip (`--fast`)** | Trailing `--fast` / `-f` on the skill invocation (same spelling as the Claude skill bodies). Available when Grok has loaded those bodies from `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, or `.grok/skills/`. | Suppresses the 👁️ visual-confirmation ask and 📦 signal trips; Re-scope/De-scope still fires 🛠️. | Routine autonomous runs where the operator owns visual confirmation and commit review. |
| **Debug mode (`--debug`)** | Trailing `--debug` / `-d` (composes with `--fast`). Same availability as `--fast`: the flag lives in the loaded skill body, not in a Grok-specific wrapper. | Adds hypothesis-first Phase 1 scaffolding + Phase 3 repro re-verify. | Bugs, regressions, flaky behavior when the root cause is not yet known. |
| **Model / session switch** | Restart a new Grok Build session with the target model. No in-session `/model` command equivalent is documented. | Ensures the task runs at its assigned `[heavy]` / `[medium]` / `[light]` depth. The post-closure candidate list from `/ft-task` signals the target model via the `[heavy]`🧠 / `[medium]`🧩 / `[light]`🔧 emoji label (never a literal `/model` command); for Grok, the equivalent is the session-start model choice. | Before starting a task whose `[model]` differs from the previous session's model. |
| **Context freshness** | Start a new Grok Build session. No in-session `/clear` equivalent is documented. | Resets the context window so the next task starts cold — "one task per context window" in practice. | Between tasks, before starting the next flowtron skill invocation, so each tasknote runs in a clean context. |
| **Structured ask** | Observed to work: the 2026-06-01 CORE-257 dogfood rendered a clean multi-option UI under the Grok 4.3 interactive TUI. Undocumented by xAI — launch coverage described no `AskUserQuestion` equivalent, so a **prose ask** (free-text question, conversational reply) remains the guaranteed fallback. | Realizes Phase 1 clarification asks and other decision points. Where the structured primitive is present the operator selects a labeled option; where it isn't, the same ask degrades to prose without contract impact. | Reach for the structured ask by default and let it degrade to prose. Treat prose as the floor, not the ceiling — the earlier "always prose per launch docs" reading is superseded by the CORE-257 observation, though the multi-option render may be a TUI enhancement rather than base-CLI behavior. Multi-option forks phrased to read cleanly either way survive both surfaces. |
| **Sub-agent / isolated exploration** | No documented sub-agent spawn primitive. The approximation is a **second Grok Build session** opened against the same checkout, briefed with `templates/subagent-probe-template.md`, whose returned summary the operator pastes into the parent tasknote's Discovery Notes. | Would realize the **probe** half of the probe/delegate split (README.md §"Sessions, loops, and sub-agents") — bounded read-only exploration whose noise stays outside the parent's context window. The **delegate** half needs no special primitive: a fresh session handed one `tasknote/<ID>.md` already is one. | Phase 1 Discovery with a broad or unknown-shaped read set. Weigh it more carefully than under a native primitive — a manual second session costs operator attention, so the "skipping is always correct" note in the probe template applies with extra force. |
| **Procedure pointer** | `grok/procedures/ft-task.md` ships in the flowtron repo, routing grok agents to `SPEC/procedures/ft-task.md` when asked to start a flowtron task (CORE-271.4). | Contract-only / SOP entry path when the operator asks to load the agent-neutral procedure rather than a skill body. | Use when testing the SOP or when skill discovery is unavailable; normal runs prefer `/ft-task` via loaded skill bodies. |

First-use verification 2026-06-01 (CORE-257). /ft-task skill invocation, model gate (with retag), AskUserQuestion render, and cue emissions (✅ marker + post-closure expectations) exercised under Grok. Structured ask support observed (see trigger table note). Matrix currency lives in docs/AGENT-COMPAT.md.

**Last verified:** `v5.18.0 · 2026-08-18 (dogfooded)`

### Codex CLI

Codex wiring bundle ships under `codex/skills/`, with repo-scoped install
instructions in `codex/AGENTS-snippet.md`. Procedure pointer wrapper
retained (CORE-271.4): `codex/procedures/ft-task.md` routes Codex agents to
`SPEC/procedures/ft-task.md` when asked to start a flowtron task by SOP rather
than by skill.

| Trigger | Syntax | What it controls in flowtron | When to reach for it |
|---|---|---|---|
| **Effort / thinking level** | A `reasoning_effort`-style parameter — `none` / `low` / `medium` / `high` / `xhigh` / `max` depending on model generation; the Codex CLI additionally exposes a `minimal` rung below `low` (the Codex app/IDE surface labels this rung "Light" where the CLI says "Low"). OpenAI's own Codex prompting guidance recommends `medium` as the default for interactive coding. | Maps to the `[heavy]` / `[medium]` / `[light]` PLAN-line tokens. Heavier reasoning suits Discovery-heavy or cross-cutting tasknotes; lighter suits mechanical edits. | Match the running effort level to the task's `[model]` token. Switch before invoking the skill if the task's `[model]` differs from the current session's effort setting. |
| **Skill invocation** | Use `/skills` in Codex or mention `$ft-task`, `$ft-update`, etc. after wiring the Codex adopter subset under `.agents/skills/` | Exposes the adopter-facing Flowtron workflows as Codex-native skills while preserving the same exported names as Claude | Use for normal Flowtron operations in Codex. Do not expect arbitrary custom `/ft-*` CLI commands; Codex's documented custom workflow primitive is skills. |
| **Sub-agent / isolated exploration** | No documented sub-agent spawn primitive exposed to the operator. The approximation is a **second Codex session** against the same checkout, briefed with `templates/subagent-probe-template.md`, whose returned summary is pasted into the parent tasknote's Discovery Notes. | Would realize the **probe** half of the probe/delegate split (README.md §"Sessions, loops, and sub-agents") — bounded read-only exploration kept out of the parent's context window. The **delegate** half is already native: a fresh session handed one `tasknote/<ID>.md` is a delegate by definition, which is the shape the CORE-258 dogfood exercised. | Phase 1 Discovery with a broad or unknown-shaped read set. As with Grok, a manually opened session costs operator attention the native case does not — prefer reading a narrow set directly. |
| **Procedure pointer** | `codex/procedures/ft-task.md` ships in the flowtron repo, routing Codex agents to `SPEC/procedures/ft-task.md` | Provides a contract-only fallback for `ft-task` when the operator asks to load the SOP directly or the skill bundle is not wired | Use when the Codex skill bundle is unavailable or when testing the agent-neutral SOP. |

First-use verification 2026-06-01 (CORE-258): a Codex/GPT-5 session consumed
the root `AGENTS.md` + `SPEC.md`, resumed a blocked flowtron task
conversationally, updated the Codex matrix row, and completed the closure
bookkeeping without a native `/ft-task` bundle. Operator cues rendered
legibly in conversation; labels remained the durable fallback.

**Last verified:** `v5.18.0 · 2026-08-18 (dogfooded)`

### Cursor

Thin wiring ships under `cursor/` (`AGENTS-snippet.md` +
`procedures/ft-task.md`). Adopters reuse Claude `.claude/skills/` bodies when
that wiring already exists, or symlink them into `.cursor/skills/` for
Cursor-only projects (see §"Worked example: Cursor" and
`cursor/AGENTS-snippet.md`).

| Trigger | Syntax | What it controls in flowtron | When to reach for it |
|---|---|---|---|
| **Skill invocation** | `/ft-task` (and peer `/ft-*`) after wiring — Cursor auto-exposes skills as slash commands. Discovery paths: `.claude/skills/` (compat), `.cursor/skills/`, `.agents/skills/` (project); `~/.cursor/skills/` + `~/.agents/skills/` (user). | Drives the full 4-phase tasknote runner and peer skills from the same canonical `claude/skills/` bodies Claude Code uses — no Cursor-specific wrappers. | Normal flowtron operations under Cursor. Prefer repo-scoped wiring; if Claude `.claude/` is already present, stop — Cursor is already served. |
| **Force-skip (`--fast`)** | Trailing `--fast` / `-f` on the skill invocation (same spelling as the Claude skill bodies). | Suppresses the 👁️ visual-confirmation ask and 📦 signal trips; Re-scope/De-scope still fires 🛠️. | Routine autonomous runs where the operator owns visual confirmation and commit review. |
| **Debug mode (`--debug`)** | Trailing `--debug` / `-d` (composes with `--fast`). | Adds hypothesis-first Phase 1 scaffolding + Phase 3 repro re-verify. | Bugs, regressions, flaky behavior when the root cause is not yet known. |
| **Model / session switch** | CLI: `/model`. IDE: model picker. Post-closure next-move cues use the `[heavy]`🧠 / `[medium]`🧩 / `[light]`🔧 emoji label (never a literal `/model` instruction in the suggestion text). | Ensures the task runs at its assigned `[model]` depth (Step 1.5 gate). | Before starting a task whose `[model]` differs from the current session. |
| **Context freshness** | CLI: `/clear`. IDE: new chat. | Resets the context window so the next task starts cold — "one task per context window" in practice. | Between tasks, before the next flowtron skill invocation. |
| **Modes** | Agent / Plan / Ask / Debug — switchable mid-session (Cursor mode picker / `SwitchMode` where exposed). | Agent is the default execution surface for `/ft-task`. Plan suits high-ambiguity Discovery before scaffolding; Ask is read-only exploration; Debug is for hypothesis-led investigation (orthogonal to skill `--debug`, which is soft scaffolding inside a tasknote). | Reach for Plan when Discovery would otherwise thrash; stay in Agent for routine Phase 2–4. |
| **Structured ask** | Native Cursor multi-option ask ("Ask questions" tool). Observed to render a clean multi-option UI under Cursor ([[CORE-438.1]]); availability can be model/agent-surface dependent — a session without the tool degrades to a **prose ask** with no contract impact. | Realizes Phase 1 clarification asks and other discrete decision points. | Reach for the structured ask by default; treat prose as the floor. Phrase multi-option forks to read cleanly either way. |
| **Sub-agent / isolated exploration** | Native `Task` tool; custom agent definitions under `.cursor/agents/` (+ `.claude/agents/` compat). Supports `readonly` / background frontmatter. | Realizes the **probe** / **delegate** split (README.md §"Sessions, loops, and sub-agents") natively — no second-session approximation required. | Phase 1 Discovery with a broad or unknown-shaped read set; brief probes with `templates/subagent-probe-template.md`. |
| **Procedure pointer** | `cursor/procedures/ft-task.md` routes to `SPEC/procedures/ft-task.md`. | Contract-only / SOP entry path when the operator asks to load the agent-neutral procedure rather than a skill body. | Use when testing the SOP or when skill discovery is unavailable; normal runs prefer `/ft-task` via wired skill bodies. |

First-use verification 2026-08-12 ([[CORE-438.5]]): `/ft-task` under Cursor (Grok 4.5) ran DOGFOOD.md's three steps (contract comprehension at `v5.16.0`, full cue-render vocabulary, Phase-1 drive on CORE-438.N with clean Step-3 write boundary). Skill dispatch via `.claude/skills/` compat, Task subagent tool, modes, and `/model`+`/clear` cues confirmed; structured ask confirmed earlier under Cursor in [[CORE-438.1]]. Matrix currency lives in docs/AGENT-COMPAT.md.

**Last verified:** `v5.18.0 · 2026-08-18 (dogfooded)`

### Gemini CLI (stub)

Contract-only agent; no capability-trigger research has been conducted for flowtron
sessions under Gemini CLI. See [`AGENT-COMPAT.md`](AGENT-COMPAT.md) for the current
matrix row. Update this stub on first-use observation.

**Last verified:** `unverified`

### Aider (stub)

Contract-only agent; no capability-trigger research has been conducted for flowtron
sessions under Aider. See [`AGENT-COMPAT.md`](AGENT-COMPAT.md) for the current
matrix row. Update this stub on first-use observation.

**Last verified:** `unverified`

### Sourcegraph Amp (stub)

Contract-only agent; no capability-trigger research has been conducted for flowtron
sessions under Sourcegraph Amp. See [`AGENT-COMPAT.md`](AGENT-COMPAT.md) for the
current matrix row. Update this stub on first-use observation.

**Last verified:** `unverified`

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
- [`AGENT-COMPAT.md`](AGENT-COMPAT.md) — the capability/currency
  companion: the living per-agent matrix (consume-mode, entry-point,
  primitive, last-verified)
- [`MIGRATION.md`](MIGRATION.md) — Claude Code adoption guide today;
  template shape for future per-platform adoption guides
- `claude/AGENTS-snippet.md` — concrete worked example of the
  `<platform>/AGENTS-snippet.md` shape
- [[CORE-154.1]] Discovery — Constitution + Specification §CORE-154.4
- [[CORE-154.2]] — agent-neutral surface audit + AGENT-NEUTRALITY.md
- [[CORE-154.3]] — wiring-layer structure: option (a) status-quo + sibling-top-level convention
- [[CORE-091]] — single-source-of-truth posture for AGENTS-snippet.md
