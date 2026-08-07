# Agent-neutrality contract

## Principle

Flowtron's **contract layer** (`SPEC.md`, `SPEC/`, `templates/`, `docs/`,
`README.md`, `SECURITY.md`) is agent-neutral — any AI assistant reading
`AGENTS.md` should be able to follow the workflow contract
conversationally. Flowtron's **wiring layer** (`claude/`, `codex/`, and
procedure pointers such as `grok/`) is platform-specific by design:
slash commands, skills, structured-ask primitives, operator flags, and
adopter symlinks under paths such as `.claude/` or `.agents/skills/`
are execution-surface details of the target runtime.

Adding agent-specific execution surfaces is fine; leaking agent-specific
assumptions into the contract layer is not.

Future full platform wiring (Grok Build, Cursor, …) plugs in symmetrically —
see [`docs/PLATFORMS.md`](PLATFORMS.md) ([[CORE-154.4]]) for the plug-in
pattern.

## Intentional Claude-specific surfaces

The references below are **load-bearing** in the contract layer —
factual locators for the wiring that ships today, not assumptions that
Claude is the only runtime. Future audits should consult this table and
*not* re-flag the entries here. Lens-specific audit notes belong in the
parent epic's audit task ([[CORE-154.6]]), not as edits to the entries
below.

| File | Section / context | Reference | Why it stays |
|---|---|---|---|
| `SPEC.md` | §"Working in the flowtron repo itself" | `` `claude/` — Claude Code commands + skills `` | Wiring-layer directory name; factual. |
| `SPEC.md` | §"Lazy SPEC module frontmatter" | `` `claude/skills/ft-task/SKILL.md` `` dispatch reference | Cross-ref to dispatch-logic location. |
| `SPEC.md` | §"Skill namespace" | `` `.claude/` `` adopter directory | Adopter Claude Code wiring location. |
| `SPEC/tasknote-selection.md` | §"When to use a tasknote (and when not to)" (`/ft-spec` at intro + body); §"`## Completed` archive convention" (`/ft-audit*` trivial-fix carve-out) | `/ft-task`, `/ft-spec`, `/ft-starter-task`, `/ft-micro-task`, `/ft-file-followup`, `/ft-epic-discovery`, `/ft-close-epic`, `/ft-release`, `/ft-worktree-{start,end}`, `/ft-audit*` | Canonical flowtron skill names. |
| `SPEC.md` + `SPEC/gates.md` | §"Operator-gate cues", §"📝 Phase 1: Discovery", §"🧪 Phase 3: Testing & Linting", §"Loop tasks", §"Post-closure protocol" (5 sites in `SPEC.md`); §"Conditional skip rule" (1 site in `SPEC/gates.md`) | `` `--fast` / `-f` `` operator force-skip flag | Operator force-skip mechanism implemented in the Claude Code skill bundle. Concept (operator force-skip) is platform-neutral; flag syntax is wiring-layer detail. SPEC documents the operator UX inline rather than punting to SKILL.md for density. |
| `SPEC/procedures/ft-task.md` | §"Agent-neutral primitives" table — the `autonomous mode` and `debug mode` rows (1 site each); §"Phase 1" debug block pointer to `claude/skills/ft-task/step-4-debug-mode.md` | `` `--fast` `` and `` `--debug` `` named as *the Claude Code spelling* of two neutral primitives | Per [[CORE-395]]. The SOP's whole job is to name a neutral operation and note the platform's spelling — the primitives table is the designated place for exactly this, and both rows lead with the concept ("run without stopping at the conditional gates" / "drive the task hypothesis-first") and demote the flag to a parenthetical. The `step-4-debug-mode.md` pointer is a derivation anchor, matching the `source:` frontmatter and the header blockquote already registered by the SOP's own design. |
| `SPEC/procedures/README.md` | §"Frontmatter schema" (`source:` example + the flag-don't-bump paragraph's `/ft-release` reference); §"Why this layer exists" + §"Loading convention" (the "Claude Code does not use this layer" contrast) | `claude/skills/<procedure>/` as the `source:` anchor; `/ft-release` as the skill running the SOP-currency check | Per [[CORE-397]] (the `/ft-release` reference; the rest pre-dates it and is registered here at the same time). This file's subject *is* the SOP↔Claude-skill relationship — `source:` names a Claude path by definition of the schema, and the currency check that reads it ships in the Claude release skill. The neutral contract (stamp semantics: flagged at release, never bumped by it) is stated independently of who runs the check, so a future platform's releaser inherits the rule without inheriting the skill. |
| `SPEC/model.md` | §"Model field" Step 1.5 mismatch path (1 site) | `` `/model <X>` `` Claude-Code-UI command | Claude-Code-runtime UI command implemented by Claude Code (not flowtron). Concept (model switch on next-task hand-off) is platform-neutral; slash-command syntax is wiring-layer detail. The post-closure copy-paste line signals model via emoji (`[heavy]🧠` / `[medium]🧩` / `[light]🔧`) — SPEC §"Post-closure protocol" no longer prescribes literal `/model` or `/clear` commands. |
| `SPEC/loop.md` + `SPEC.md` | §"Runtime vs. contract — the boundary" + §"Gate collapse" (`SPEC/loop.md`); §"Loop tasks" (`SPEC.md`) | `` `/loop` `` Claude-Code loop runner | Per [[CORE-330.2]] — the loop *runtime* is Claude Code's `/loop` (or any equivalent runner), implemented by the runner, not flowtron. Framed neutrally ("or any equivalent runner"); the iteration-loop concept is platform-neutral. Flowtron ships only the markdown *contract* the loop reports to ([`SPEC/loop.md`](../SPEC/loop.md)) — the runtime/contract boundary is the point of the reference. |
| `SPEC.md` | §"Procedure SOPs (`SPEC/procedures/`)" | `/ft-task` SKILL dispatch (contrast reference) | Explains that SOPs are loaded by per-agent pointer wrappers *rather than* the Claude Code SKILL dispatch; factual comparison that makes the distinction clear without implying Claude dependency. |
| `SPEC/epic.md` | §"Audit acceptance — fixed doc-drift line" (the "**Skills**" / "**Optional deep pre-pass**" bold labels, not separate headings) | `claude/skills/ft-epic-discovery/`, `claude/skills/ft-close-epic/`, `claude/skills/ft-new-project/SKILL.md` | Path facts. |
| `SPEC/model.md` | (intro + Step 1.5 dispatch reference) | `claude/skills/ft-task/SKILL.md` | Path fact. |
| `SPEC/model.md` | (recommended-set paragraph + "Practical guidance and agent-aware defaults" subsection) | Primary labels `[heavy]` / `[medium]` / `[light]` + `fable`/`mythos`/`opus`/`sonnet`/`grok`/`haiku` as examples | Per CORE-206 (vocabulary) + [[CORE-207]] (practical examples, cross-provider calibration) + [[CORE-259]] (added the `[medium]` rung; Grok/Sonnet calibrate medium-tier) + [[CORE-303]] (added `fable` as the heavy-tier baseline example) + [[CORE-373]] (Claude 5 roster refresh: `mythos` as fable's limited-access sibling, Sonnet 5 held at medium, effort/context variants excluded from the token vocabulary) — neutral primary vocabulary + agent-aware usage guidance. Specific model names remain valid examples only. |
| `templates/tasknote-README.md` | "AGENTS.md" entry | `AGENTS.md` read by Claude Code, Codex CLI, Cursor, Amp, Aider, Grok Build | Multi-agent paste-destination — explicitly agent-neutral framing. |
| `templates/tasknote-README.md` | "CLAUDE.md" entry | `CLAUDE.md` — optional Claude-specific directives | Explicit Claude-only carve-out; adopter agents skip the entry. |
| `templates/tasknote-micro-template.md` | (closing recap line) | `claude/skills/ft-micro-task/SKILL.md` | Path fact. |
| `templates/PLAN.md` | (examples + rule comment) | `[heavy]` / `[medium]` / `[light]` primary labels (opus/sonnet as examples) | Per CORE-206 + [[CORE-259]] — neutral primary vocabulary. |
| `docs/MIGRATION.md` | §1.2, §1.3, §3, troubleshooting | `.claude/commands/...`, `.claude/skills/...`, `claude/AGENTS-snippet.md`, slash-command verification, "fresh Claude Code session" references | MIGRATION remains the full Claude Code adoption guide and now points Codex users at `codex/AGENTS-snippet.md` for the platform-specific skill wiring. Future platforms get their own adoption section if/when wiring lands — see [[CORE-154.4]] / `docs/PLATFORMS.md` for the plug-in pattern. |
| `docs/PHILOSOPHY.md` | (historical-narrative paragraphs) | `Claude Code` + "Claude can read markdown" framing | Per [[CORE-132]] defense — file's role is personal narrative; voice IS the deliverable. |
| `README.md` | §"Repo layout" | `` `claude/` `` — Claude Code skills + slash commands | Factual repo-layout description. |
| `README.md` | §"Agent memory"; §"Sessions, loops, and sub-agents" | "Claude Code sessions" (agent-memory intro); `` `--fast` `` on `` `/ft-task` `` (within-task-autonomy bullet); Claude Code's `` `/loop` `` (closing runtime paragraph) | Per [[CORE-408.4]]. The section's subject is operator-side session discipline — context reset, delegation, loop runtime — whose only *shipped* realizations are Claude Code's, so naming them is what makes the guidance concrete. Each is framed with its neutral escape hatch already in place ("or any equivalent runner"; `--fast` and `/loop` additionally hold their own ledger rows for their SPEC sites). Note what is **not** claimed here: the **probe** / **delegate** split this section carries is fully agent-neutral — no spawn primitive is named anywhere in the contract layer, and `templates/subagent-probe-template.md` explicitly leaves it to "the operator's and the platform's business". Claude Code's sub-agent mechanics live in `claude/CAPABILITIES.md` (wiring layer, no row); non-Claude approximations in `docs/PLATFORMS.md`. |
| `README.md` | §"Quickstart" | `/ft-new-project`, `/ft-task`, `~/.claude/skills/`, `~/.claude/commands/` install paths | Per [[CORE-383]] — the above-fold quickstart shows the shortest real path to a working setup, which today means the Claude Code wiring that ships. Framed with an explicit escape hatch ("not using Claude Code?" → `docs/MIGRATION.md` manual path §1.1–1.6 + Codex / grok wiring), so the contract stays followable without Claude Code. Concept (bootstrap a project, run a task) is platform-neutral; the slash commands and `~/.claude/` paths are wiring-layer detail. |
| `SECURITY.md` | §"Prompt injection via user-authored markdown" (Claude Code subsection) | `.claude/settings.local.json` tool allowlist + Claude Code harness mention | Claude Code-specific mitigation; clearly scoped after the [[CORE-154.2]] reframe. |

## Tool-call-specific terminology

SPEC's workflow contract uses agent-neutral terms for assistant-user
question primitives. The terms describe the *operation*, not any
specific tool:

| Concept | Canonical name in SPEC | Notes |
|---|---|---|
| Multi-option structured user question | **structured ask** | Was previously named `AskUserQuestion` (the Claude Code tool name); generalized via [[CORE-154.2]]. Adopter agents implement via their own primitives (Codex CLI question shapes, Cursor multi-choice prompts, etc.). |
| Free-prose user question | **prose ask** | Unchanged — always was agent-neutral. |

The pair `structured ask` / `prose ask` describes the operator-facing
mode, not the tool that delivers it.

## Out of scope for this ledger

This contract documents *why intentional Claude-specific surfaces are
intentional*. It does NOT:

- Spell out the platform-plug-in mechanism for adding `codex/` / `grok/` /
  Cursor wiring directories — see [[CORE-154.4]] /
  [`PLATFORMS.md`](PLATFORMS.md).
- Document the wiring-layer structure: locked at [[CORE-154.3]]
  (2026-05-23) — `claude/` keeps its name and location; future
  non-Claude-Code platform wirings plug in symmetrically as sibling
  top-level dirs (e.g., `codex/`, `grok/`, `cursor/`); see
  [`PLATFORMS.md`](PLATFORMS.md) ([[CORE-154.4]]) for the
  full plug-in pattern. Rationale: adopter-symlink stability
  ([[CORE-154.1]] Constitution non-negotiable) rules out renaming
  `claude/`; sibling-top-level convention preserves symmetry.
- Re-survey the contract layer for new leaks — audits are point-in-time;
  the next epic touching the contract layer should consult this ledger
  and run its own check.

Near-neighbor surfaces explicitly out of [[CORE-154.2]]'s scope but
worth mentioning here:

- `CONTRIBUTING.md:8` — "Most edits land via Claude Code sessions" —
  historical narrative; defended by [[CORE-132]] (first-person
  CONTRIBUTING convention).
- `claude/AGENTS-snippet.md` — wiring-layer content (under `claude/`);
  examined by [[CORE-154.3]] and [[CORE-154.4]].
- `claude/CAPABILITIES.md` — wiring-layer content (under `claude/`): the
  Claude Code capability-trigger reference (effort/thinking, `--fast`,
  `--debug`, `--worktree`, `--park`, `/model`, `/clear`, structured ask,
  and sub-agent / isolated exploration). Consolidates wiring-side *syntax*;
  introduces no new contract-layer surface, so it takes no table row above.
  Added by [[CORE-224.3]]; trigger list extended by [[CORE-408.4]], which
  also records there that `--worktree`'s contract-layer site
  (`docs/WORKTREES.md`) is not ledgered above — surfaced, not fixed.
