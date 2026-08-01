---
name: ft-audit
description: Parameterized principal-engineer audit — `/ft-audit <domain> [scope]` runs 5 domain-specific passes, capped at 5 findings each, and writes prioritized tickets to `.flowtron/PLAN.md`. Domains: general (default — code audit/review with no domain named) · backend (audit/review/harden backend/API/server code) · frontend (bundle size, accessibility, render performance) · security (vulnerabilities, secrets, auth) · performance (latency, profiling, resource usage) · docs (documentation accuracy, staleness, cross-doc drift). Use whenever the user asks to audit, review, or harden any of these surfaces. Stack-neutral scaffold; adopters fork the whole directory (SKILL.md + passes/) into `.claude/skills/audit/` and fill in rubrics / verification gates / per-pass examples for their stack. See `docs/MIGRATION.md` §1.2.1.
---

# audit — flowtron parameterized audit skill

Principal-engineer audit of a project surface: find what matters, report concisely, **make no changes without explicit confirmation**.

One dispatcher, six domains. The shared procedure lives in this file; each domain's pass definitions, severity guide, scope/rubric/gate hints, and specialist rules live in a sibling `passes/<domain>.md` file, loaded at §1 step 1.

Stack-neutral scaffold — **fork**, don't symlink (per-stack rubrics/commands diverge). Fork the whole directory — `SKILL.md` + `passes/` — into `.claude/skills/audit/`. Install per `docs/MIGRATION.md` §1.2.1.

## 0. Forker checklist (fill in before first run)

Walk this list once per fork. The placeholders live in this file's §5 and in each `passes/<domain>.md` you keep.

- [ ] `name:` and `description:` frontmatter — set to your fork's slash-command name and a project-specific blurb.
- [ ] Each kept `passes/<domain>.md` §"Scope & rubric hints" — set the default scope glob, your project's actual rubric paths (root `CLAUDE.md`, ADRs, contract docs, config files where invariants live), and your actual gate commands (lint / type-check / test, or scanner / profiler / doc tooling per domain).
- [ ] Each kept `passes/<domain>.md` §"The 5 passes" — replace generic-placeholder bullets with your stack's concrete examples (library invariants, idioms, specific anti-patterns).
- [ ] Each kept `passes/<domain>.md` §"Severity guide" — name your project's sacred invariants under **Critical** (e.g. paper-mode bypass for trading, schema-corruption risk for migrations, auth-bypass for public services).
- [ ] Each kept `passes/<domain>.md` §"Specialist additions" — append project-specific hard rules (e.g. "paper-mode is sacred", "data integrity > convenience").
- [ ] §5 step 2 — confirm the area-prefix list valid for your `.flowtron/tasknote/README.md` §"Area prefixes".
- [ ] Optional: delete pass files for surfaces your project doesn't have (no frontend → remove `passes/frontend.md`). A domain token whose pass file is missing → stop and ask rather than improvise.

Once the checklist is satisfied, delete this §0 block from your fork — leaving it in confuses the auditor's first read on every run.

## 1. Domain, scope & ground rules (do this first, always)

1. **Resolve the domain** from `$ARGUMENTS`: if the first whitespace-separated token is one of `general` · `backend` · `frontend` · `security` · `performance` · `docs`, that token is the domain and the **remaining** tokens are the scope args for step 2. Any other first token (a path, `last-commit`, `staged`, …) → domain `general`, and the **whole** `$ARGUMENTS` string is the scope args. Bare invocation → domain `general`, default scope. Then **Read `passes/<domain>.md`** (sibling `passes/` directory) — it supplies the pass definitions (§2), severity guide (§3), scope/rubric/gate hints (this section), attribution slug (§5), and specialist additions. If the user's prose names a focused concern the invocation didn't (asked to "audit auth" but invoked bare), prefer the matching domain over stretching `general`.
2. **Resolve scope** from the scope args: `all`/empty → the pass file's default scope glob; a path → that path; `last-commit` → files in `HEAD`; `staged` → files in `git diff --cached`; plus any extra scope tokens the pass file declares (e.g. an endpoint/route for `backend`, `ai-referenced` for `docs`). If ambiguous, **stop and ask** via `AskUserQuestion`.
3. **Load the project rubric** (audit-against contracts, not generic best practices) — the pass file's rubric slots name what to load.
4. **Run verification gates** so passes don't report toolchain noise — commands per the pass file's gate hints; the pass file says which pass absorbs failures as findings.
5. If anything's unclear, stop and ask. Don't guess intent.

## 2. The 5 passes (in order)

Run the pass file's five passes **in its exact order**. **Cap each pass at 5 findings max.** If a pass has more, keep the top 5 by severity and note the tail count (`+3 more Low omitted`).

## 3. Finding format (use exactly this)

```text
**Finding #[N] – [Critical|High|Medium|Low] – [Pass # / Category]**
- Location: `path/to/file:LINE` (or endpoint / component / function / section name)
- Issue: one sentence
- Why it matters: brief — tie to safety / correctness / maintenance cost
- Recommended fix: concrete suggestion or ≤5-line snippet
```

Severity is judged against the pass file's severity guide — authoritative for the domain. Insert any extra finding-format lines the pass file declares (e.g. `performance` adds a `Measured impact:` line).

## 4. Required closing sections (always, in order)

1. **Summary** — health score 1–10 with one-sentence justification + top 3 issues (by severity, not pass order).
2. **Exploratory Insights** — what the findings reveal about how the audited surface evolved. Patterns, not individual issues (e.g. "three endpoints still return raw dicts — suggests the typed-response migration stalled mid-phase").
3. **Proposed tasks for `.flowtron/PLAN.md`** — prioritized, actionable tickets using flowtron's task-line grammar. One ticket per thematic cluster, not per finding. Present them inline in the report so the user can review before anything is written to disk.
4. **Questions for the user** — anything ambiguous that blocks implementation. Use `AskUserQuestion` for these, not prose — the user wants real prompts.

## 5. Write the proposed tasks into `.flowtron/PLAN.md` (required, not optional)

The deliverable is tickets in PLAN.md — a report that gets forgotten isn't useful.

1. **After** §§1–3 are presented and any `AskUserQuestion` blockers are answered, write tickets using flowtron's task-line grammar: `- [ ] **<AREA>-<N>** [model] | shortname — long description.` (primary labels `[heavy]🧠` / `[medium]🧩` / `[light]🔧` recommended; specifics e.g. `opus` / `sonnet` / `grok` remain valid per SPEC §"Model field"). See §"Task-line format".
2. Pick the next free `<N>` per area prefix (valid prefixes in `.flowtron/tasknote/README.md` §"Area prefixes"; the pass file may name the typical prefixes for its domain).
3. Insert in correct priority section (`## High`/`## Medium`/`## Low` for blocking; `## Future Opportunities` otherwise; add `[!critical]` for urgent rows). Append `Surfaced by <slug> YYYY-MM-DD (Finding #N, <severity>)` to each ticket — `<slug>` is the pass file's attribution slug — so the origin's traceable. Include any extra attribution the pass file requires (e.g. `performance` appends the measured-impact number).
4. **No code changes**, no source edits, no opening files for fixes. Tickets only — actual fixes happen in separate `/ft-task` cycles. One exception: the skip-the-tasknote carve-out below, plus any domain exception the pass file declares (e.g. `security`'s leaked-secret immediate-ask path).
5. User pushes back on a ticket → drop it. Ask to combine/split → do that before writing.

**Trivial-fix carve-out (skip-the-tasknote inline path).** When a finding's fix is small enough to hit the skip-the-tasknote threshold — single-line patch, pure formatting tweak, a doc edit under ~10 lines, or a trivial config edit with no logic impact (per SPEC §"When to use a tasknote (and when not to)") — don't file an intermediate `## Low` ticket that needs its own `/ft-task` cycle. Instead, present it in the report under a distinct **Proposed inline fixes** heading (kept separate from the proposed-ticket list) and, on the **same** write-step confirmation that lands the tickets, apply the edit and record it directly under PLAN.md's `## Completed` as a **self-contained** line:

```text
- [x] **<AREA>-<N>** [light] | shortname — <what changed>. Surfaced by <slug> YYYY-MM-DD (Finding #N, <severity>), fixed inline.
```

Keep the description (there is no tasknote/archive file to be the canonical record — see SPEC/tasknote-selection.md §"`## Completed` archive convention") and take the next free `<N>` like any ticket. Anything above the skip threshold — multi-file, logic impact, or a design tradeoff worth recording — files a normal ticket; never apply a non-trivial fix under this carve-out. The single write-step confirmation covers both tickets and inline fixes; no separate gate. Apply any carve-out adjustments the pass file declares (e.g. `security` narrows it to trivial hygiene only; `docs` notes doc audits hit it often).

Zero findings across all passes → say so explicitly and skip the write.

## 6. Hard rules

- **Targeted, not exhaustive.** Five findings per pass is a *ceiling*, not a target. A clean pass gets zero findings and moves on.
- **Write tickets, not fixes.** `.flowtron/PLAN.md` gets updated (§5 above). Source files do NOT — any code change needs a separate explicit user request. Do not open files in edit mode for fixes, do not run formatters, do not "fix while I'm in here." **Exceptions:** the §5 trivial-fix carve-out, plus any domain exception the pass file declares.
- **Don't repeat the gates.** If a §1 verification gate (linter, type-checker, build tool, scanner) already flagged it, surface the aggregate once and move on — don't enumerate each gate row as a separate finding.
- **Don't audit adjacent code.** Stay inside the resolved scope.
- **Subroutine-safe.** Any domain may be invoked from another skill (notably `/ft-release` §7.1 → `/ft-audit docs`). When invoked as a subroutine with an explicit scope: skip §0 forker prompts, surface the report inline rather than blocking on `AskUserQuestion` for non-blocker items, and do **not** write PLAN.md tickets — the invoking skill is the orchestrator and owns per-finding decisions.
- **No final summary of what you just did.** The report + the `.flowtron/PLAN.md` diff *are* the deliverable.
- The pass file's **specialist hard rules** are part of this contract — apply them as written.
