---
name: ft-audit-context
description: Adopter-context audit — 4 conversational passes (Bloat · Redundancy · Namespace · Drift) over `CLAUDE.md`, `AGENTS.md`, `.claude/{commands,skills}`. Soft prose recommendations with an explicit offer to file PLAN tickets at the end (no auto-write). Global install per `docs/MIGRATION.md` §1.0.
---

# audit-context — flowtron adopter-context audit

Audit the AI-coding context surfaces of the current project — `CLAUDE.md`, `AGENTS.md`, `.claude/commands/`, `.claude/skills/` — and surface soft conversational recommendations about bloat, redundancy with flowtron's `AGENTS.md` paste-block, `ft-*` namespace conflicts, and workflow drift from flowtron's lean-context principle. At the end, explicitly offer to file any recommendations as PLAN.md tickets — **no auto-write**.

This skill is the deliberate counterpart to `/ft-audit*` (forked, 5-pass, writes tickets). Same family of concerns, softer register: prose grouped under four pass headings, severity tags inline, opt-in filing.

## 0. Scope & ground rules (do this first)

1. **Preflight** the current working directory:
   - At least one of `CLAUDE.md`, `AGENTS.md`, or `.claude/` must exist. If none do, bail with a one-line "no AI-coding context surfaces here — nothing to audit" notice.
   - Determine flowtron-mode for passes (b) and (c):
     - **Adopter mode** — `.flowtron/core/` submodule exists. Reference paste-block: `.flowtron/core/claude/AGENTS-snippet.md`. Reference bundled skill names: `.flowtron/core/claude/skills/`.
     - **Flowtron-self mode** — repo-root `SPEC.md` exists with heading `# Flowtron — Workflow Specification`. Reference paste-block: `claude/AGENTS-snippet.md`. Reference bundled skill names: `claude/skills/`.
     - **No flowtron** — passes (b) and (c) downgrade (skip the reference comparison; note this in the summary). Passes (a) and (d) still run.
2. **Read** the in-scope surfaces:
   - Full contents of `CLAUDE.md` and `AGENTS.md` if present.
   - One-level-deep listing of `.claude/commands/` and `.claude/skills/` (filenames and dir names; don't recursively read every `SKILL.md` unless a pass specifically needs the body).
3. **No file edits across any pass.** Output is conversational prose; the only allowed write is the optional ticket-filing in §5, gated behind explicit `AskUserQuestion` confirmation.

## 1. Pass (a) — Context bloat

Goal: surface size pressure against Claude Code's ~40,000-character context-load threshold (content past that cap silently doesn't reach the assistant).

Measurements:

- `wc -c CLAUDE.md AGENTS.md` — per-file char counts.
- Count entries under `.claude/commands/` and `.claude/skills/` (one level deep).

Heuristics:

- **>40,000 chars** → **High**: assistant context truncated; load-critical content beyond the cap is silently lost.
- **30,000–40,000 chars** → **Medium**: trending high; identify lift candidates (large reference tables, registries, stack inventories that belong in per-project docs or external references).
- **<30,000 chars** → no finding (skip).
- **>30 commands or >25 skills** under `.claude/` → **Low**: slash-command surface bloat; consider trimming unused or rarely-invoked entries.

Output: prose paragraph per affected file. Quote the size; name 2-3 specific lift candidates from the file structure when possible. Cap at 5 lift candidates per file.

## 2. Pass (b) — AGENTS.md redundancy with flowtron's paste-block

Goal: surface content in the project's `AGENTS.md` that directly restates (or contradicts) flowtron's canonical paste-block.

Compare project `AGENTS.md` against flowtron's `<flowtron-root>/claude/AGENTS-snippet.md` §"Block to paste into AGENTS.md" (the fenced markdown block).

Severity:

- **High** — contradictions. The assistant sees conflicting directives (e.g., `AGENTS.md` says tasknotes live at `tasks/` but the paste-block says `.flowtron/tasknote/`).
- **Medium** — direct restatements. The paste-block is the single source of truth per [[CORE-091]]; restating bloats and risks drift on the next flowtron bump.
- **Low** — partial overlaps that may be intentional (e.g., project-specific extension of a workflow concept).

Output: prose recommendations to trim or align. Quote ~3-5 lines of offending content with line numbers when surfacing a specific finding. Cap at 5 findings.

Skip this pass entirely if flowtron-mode is "No flowtron"; note the skip in §5's summary.

## 3. Pass (c) — `ft-*` namespace conflicts

Goal: surface project-side `.claude/skills/` or `.claude/commands/` entries that shadow or collide with the bundled `ft-*` namespace.

Read flowtron's bundled skill names from `<flowtron-root>/claude/skills/` and command names from `<flowtron-root>/claude/commands/`. Walk project-side `.claude/skills/*` and `.claude/commands/*`:

- **High** — any entry starting with `ft-` that is NOT a symlink into the flowtron submodule (adopter mode) or into a flowtron checkout (global-install mode). The `ft-` prefix is reserved for flowtron per SPEC §"Skill namespace"; adopter `ft-*` skills violate the namespace contract.
- **Medium** — any entry with the same base name as a bundled `ft-*` skill, with or without the `ft-` prefix (e.g., a project `task` skill shadowing `/ft-task`'s mental model; or `audit` shadowing a forked audit-family member's expected slot). The user may invoke the wrong skill or get confused about which is which.
- **Low** — adopter-defined names that loosely echo bundled skill semantics without colliding (judgment call; surface conservatively).

Output: prose recommendations — rename, delete, or repoint as a symlink into the flowtron bundle. Cap at 5 findings.

Skip this pass entirely if flowtron-mode is "No flowtron"; note the skip in §5's summary.

## 4. Pass (d) — Workflow drift from flowtron's lean-context principle

Goal: free-form pass surfacing context surfaces that drift from flowtron's core principles — small, scannable, project-task-focused, no scripts, no validators.

Look for:

- Long inline workflow tutorials in `CLAUDE.md` / `AGENTS.md` that duplicate `SPEC.md` content (should reference, not restate).
- Stale "WIP" / "in flight" / "TODO" notes that linger past their relevance (no recent commit churn; reference completed work).
- Personal scaffolding bleeding into project-shared files (single-developer preferences embedded in shared `CLAUDE.md`).
- `.claude/` entries with no clear purpose (orphan scratch files, half-finished skill drafts, stale command stubs).
- Project-side schema validators, JSON converters, or other tooling that fights flowtron's "markdown is the schema" principle.

Output: 3-5 conversational recommendations, severity tags inline. Bias toward suggesting; don't be exhaustive — this pass is for surfacing patterns, not enumerating individual paragraphs. Cap at 5 findings.

## 5. Summary + offer to file tickets

After passes (a)–(d) complete:

1. **Short summary** — one paragraph naming the top 2-3 issues across all four passes (by severity, not pass order). Don't repeat per-pass severity counts.

2. **Offer** — call `AskUserQuestion` with these options:

   - **File all as PLAN tickets** — write each finding as a `- [ ]` line under the appropriate priority heading in `.flowtron/PLAN.md` using flowtron's task-line grammar.
   - **Pick a subset** — let the user name which findings to file (free-text response).
   - **File none** — close out the audit with no writes.
   - **Show me the report again** — re-print §§1-4 verbatim.

3. If filing, ticket format: `- [ ] **<AREA>-<N>** [model] | shortname — recommendation. Surfaced by audit-context YYYY-MM-DD (Pass <a|b|c|d>, <severity>).` Pick the next free `<N>` per area prefix; default to `[sonnet]` for follow-up fixes (user can override). Insert under `## High` for High-severity findings, `## Medium` for Medium, `## Low` for Low. Bail with a warning if `.flowtron/PLAN.md` doesn't exist.

## 6. Hard rules

- **Never edit a source file across any pass.** The only allowed write is the optional PLAN.md ticket-filing in §5, gated behind explicit user confirmation via `AskUserQuestion`.
- **No `Finding #N` scaffold.** This is the deliberate distinction from `/ft-audit*` family — use natural prose with severity tags inline (`**High**`, `**Medium**`, `**Low**`), grouped under the four `## (a) ... ## (d) ...` pass headings.
- **Cap each pass at 5 findings.** A clean pass gets zero findings and moves on.
- **No final summary of what you just did.** The report + the optional `.flowtron/PLAN.md` write are the deliverable.
- **Subroutine-safe.** Designed for standalone invocation; no scope argument supported today. Adopter-side invocations target the project's cwd; flowtron-self invocations target flowtron's own context surfaces.
