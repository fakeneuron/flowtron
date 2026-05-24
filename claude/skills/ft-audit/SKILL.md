---
name: ft-audit
description: Ruthless principal-engineer code audit — 5 passes (Security · Idioms · Hygiene · Orphans · Doc drift), capped at 5 findings each, writes prioritized tickets to `_project/PLAN.md`. Stack-neutral scaffold; adopters fork into `.claude/skills/audit/` and fill in rubric / verification gates / per-pass examples for their stack. See `docs/MIGRATION.md` §1.2.1.
---

# audit — flowtron stack-neutral code-audit skill

Principal-engineer audit of a project surface: find what matters, report concisely, **make no changes without explicit confirmation**.

Stack-neutral scaffold — **fork**, don't symlink (per-stack rubrics/commands diverge). Install per `docs/MIGRATION.md` §1.2.1. Adopters may split further by copying SKILL.md into sibling directories.

## 0. Forker checklist (fill in before first run)

Walk this list once per fork. The placeholders in §1, §2, §3, and §6 below are the things to replace.

- [ ] `name:` and `description:` frontmatter — set to your fork's slash-command name and a stack-specific blurb.
- [ ] §1 step 1 "Resolve scope" — set the default-`all` glob for your stack (e.g. `backend/**/*.py`, `frontend/src/**`, `src/**/*.go`).
- [ ] §1 step 2 "Load the project rubric" — replace placeholder rubric paths with your project's actual ones (root `CLAUDE.md`, project skills under `.claude/skills/<stack>/SKILL.md`, `README.md`, ADRs, config files where invariants live).
- [ ] §1 step 3 "Run verification gates" — replace placeholder commands with your project's actual lint/type-check/test commands.
- [ ] §2 "The 5 passes" — under each pass, replace generic-placeholder bullets with your stack's concrete examples (library invariants, idioms, specific anti-patterns).
- [ ] §3 "Finding format" — adjust the **Critical** severity bullet to call out your project's sacred invariants (e.g. paper-mode bypass for trading, schema-corruption risk for migrations, auth-bypass for public services).
- [ ] §5 step 2 — confirm the area-prefix list valid for your `_project/tasknote/README.md` §"Area prefixes".
- [ ] §6 "Hard rules" — append any project-specific hard rules (e.g. "paper-mode is sacred", "data integrity > convenience").

Once the checklist is satisfied, delete this §0 block from your fork — leaving it in confuses the auditor's first read on every run.

## 1. Scope & ground rules (do this first, always)

1. **Resolve scope** from `$ARGUMENTS`: `all`/empty → `<default glob>` _(forker: set this)_; a path → that path; `last-commit` → files in `HEAD`; `staged` → files in `git diff --cached`. If ambiguous, **stop and ask** via `AskUserQuestion`.
2. **Load the project rubric** (audit-against contracts, not generic best practices):
   - `<rubric file 1>` — _(forker: what it defines)_
   - `<rubric file 2>` — _(forker: ...)_
3. **Run verification gates** so passes don't report toolchain noise:
   ```sh
   <lint command for your stack>
   <type-check or build command>
   <test command>
   ```
   Failures become Critical findings in pass 2, not separate noise.
4. If anything's unclear, stop and ask. Don't guess intent.

## 2. The 5 passes (in order)

Run in this exact order. **Cap each pass at 5 findings max.** If a pass has more, keep the top 5 by severity and note the tail count (`+3 more Low omitted`).

1. **Security** — input validation, injection risk, secrets handling, auth assumptions, unchecked external data, `eval` / `exec` / unsafe deserialization, path traversal, CORS / origin trust, rate limiting on write endpoints, secrets leaking into logs or responses, `.env` / private keys in git. _(forker: add stack-specific examples — e.g. paper-mode enforcement for trading, CSP / XSS / `dangerouslySetInnerHTML` for browser code, SQL parameterization for ORM-light code, RPC-call error handling for blockchain code)_
2. **Idioms** — canonical patterns for your language and framework. _(forker: examples — typed signatures, async correctness (no blocking I/O in async handlers), dependency injection vs. module-level globals, modern library patterns (Pydantic v2, React Query, hooks rules), response contracts (`response_model` / typed return), exception handling specificity (no bare `except:`), test coverage of new branches, deterministic-seed invariants for backtest/simulation code)_
3. **Hygiene** — module / function / variable naming, import ordering, module boundaries (does this logic belong here or in a dedicated module?), magic numbers that belong in config, log-label consistency, hardcoded URLs / addresses that should come from env vars, dead imports, overly long functions (>60 lines is suspect), inconsistent class / token ordering.
4. **Orphans** — unused endpoints / exports / hooks (defined but no caller), dead types / models / Pydantic schemas, commented-out code, TODO stubs that predate the current phase, registry entries (strategies, routes, providers) nothing reads, legacy naming from pre-refactor eras, test fixtures nothing uses.
5. **Doc drift** — `README.md` claims vs. actual decorators / exports, in-tree `SKILL.md` file trees vs. reality, docstrings that describe behavior the code no longer has, config-file comments vs. how the code actually uses each field, roadmap / `_project/PLAN.md` claims about completed work that doesn't match code.

## 3. Finding format (use exactly this)

```text
**Finding #[N] – [Critical|High|Medium|Low] – [Pass # / Category]**
- Location: `path/to/file:LINE` (or endpoint / component / function name)
- Issue: one sentence
- Why it matters: brief — tie to safety / correctness / maintenance cost
- Recommended fix: concrete suggestion or ≤5-line snippet
```

Severity guide:
- **Critical** — security hole, broken build / test suite, sacred-invariant bypass, data corruption, deterministic-test violation. _(forker: name your project's sacred invariants here — e.g. paper-mode bypass risk, secret leak, schema-corruption risk, auth-bypass.)_
- **High** — missing validation, lifecycle bug (connection leak, async / blocking violation, teardown miss), unhandled external failure, missing-contract violation (endpoint without `response_model`, exported function without a type).
- **Medium** — idiom violation that will compound, doc drift that misleads, magic number that should be config.
- **Low** — nit, minor hygiene, style.

## 4. Required closing sections (always, in order)

1. **Summary** — health score 1–10 with one-sentence justification + top 3 issues (by severity, not pass order).
2. **Exploratory Insights** — what the findings reveal about how the codebase evolved. Patterns, not individual issues (e.g. "three endpoints still return raw dicts — suggests the typed-response migration stalled mid-phase").
3. **Proposed tasks for `_project/PLAN.md`** — prioritized, actionable tickets using flowtron's task-line grammar. One ticket per thematic cluster, not per finding. Present them inline in the report so the user can review before anything is written to disk.
4. **Questions for the user** — anything ambiguous that blocks implementation. Use `AskUserQuestion` for these, not prose — the user wants real prompts.

## 5. Write the proposed tasks into `_project/PLAN.md` (required, not optional)

The deliverable is tickets in PLAN.md — a report that gets forgotten isn't useful.

1. **After** §§1–3 are presented and any `AskUserQuestion` blockers are answered, write tickets using flowtron's task-line grammar: `- [ ] **<AREA>-<N>** [opus|sonnet] | shortname — long description.` See SPEC §"Task-line format".
2. Pick the next free `<N>` per area prefix (valid prefixes in `_project/tasknote/README.md` §"Area prefixes").
3. Insert in correct priority section (`## High`/`## Medium`/`## Low` for blocking; `## Future Opportunities` otherwise; add `[!critical]` for urgent rows). Append `Surfaced by audit YYYY-MM-DD (Finding #N, <severity>)` to each ticket so the origin's traceable.
4. **No code changes**, no source edits, no opening files for fixes. Tickets only — actual fixes happen in separate `/ft-task` cycles.
5. User pushes back on a ticket → drop it. Ask to combine/split → do that before writing.

Zero findings across all passes → say so explicitly and skip the write.

## 6. Hard rules

- **Targeted, not exhaustive.** Five findings per pass is a *ceiling*, not a target. A clean pass gets zero findings and moves on.
- **Write tickets, not fixes.** `_project/PLAN.md` gets updated (§5 above). Source files do NOT — any code change needs a separate explicit user request. Do not open files in edit mode for fixes, do not run formatters, do not "fix while I'm in here."
- **Don't repeat the linter / compiler.** If the verification gate (§1 step 3) already flagged it, note it once in pass 2/3 and move on — don't enumerate lint / type errors as findings.
- **Don't audit adjacent code.** Stay inside the resolved scope.
- **No final summary of what you just did.** The report + the `_project/PLAN.md` diff *are* the deliverable.
- _(forker: append project-specific hard rules — e.g. "Paper-mode is sacred. Any finding touching paper-mode enforcement is Critical regardless of how 'small' it looks.")_
