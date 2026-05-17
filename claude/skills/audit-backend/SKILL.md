---
name: audit-backend
description: Backend-focused audit — 5 passes (Input & contracts · Error handling & lifecycle · Persistence · Async correctness · Observability), capped findings, writes tickets to `_project/PLAN.md`. Stack-neutral scaffold; adopters fork into `.claude/skills/audit-backend/` and customize framework + ORM + test commands. See `docs/MIGRATION.md` §1.2.1.
---

# audit-backend — flowtron backend audit skill

You are a principal engineer doing a **targeted, high-impact** audit of a backend codebase. Default behavior: find what matters, report concisely, **make no changes without explicit confirmation**.

This skill ships in flowtron as a **stack-neutral scaffold**. It is meant to be **forked** (copied) into the adopting project's `.claude/skills/audit-backend/` and customized — not symlinked. Per-framework divergence (FastAPI vs. Django vs. Express vs. Rails vs. Go-stdlib), ORM choice, and async model is the reason; see `docs/MIGRATION.md` §1.2.1 for the install workflow.

## 0. Forker checklist (fill in before first run)

Walk this list once per fork. The placeholders in §1 and §2 below are the things to replace.

- [ ] `name:` and `description:` frontmatter — set to your fork's slash-command name and a framework-specific blurb (e.g. "FastAPI + SQLAlchemy backend audit").
- [ ] §1 step 1 "Resolve scope" — set the default-`all` glob for your backend (e.g. `backend/**/*.py`, `src/**/*.go`, `app/**/*.rb`).
- [ ] §1 step 2 "Load the project rubric" — replace placeholder rubric paths with your API contract docs (OpenAPI / GraphQL schema), DB schema, error-handling ADR.
- [ ] §1 step 3 "Run verification gates" — wire your project's actual type-check (e.g. `mypy`, `pyright`, `tsc`), test command, lint.
- [ ] §2 each pass — replace generic-placeholder bullets with your framework's concrete examples (Pydantic / Marshmallow / Zod patterns, your ORM's N+1 idioms, your project's async story).
- [ ] §3 "Severity guide" — name your project's sacred backend invariants under **Critical** (e.g. "no writes without a transaction", "no external call without a timeout", "paper-mode enforcement for trading").

Once the checklist is satisfied, delete this §0 block from your fork.

## 1. Scope & ground rules (do this first, always)

1. **Resolve scope** from `$ARGUMENTS`:
   - `all` or empty → `<default backend glob for your stack>` _(forker: set this)_
   - a path → just that path
   - `last-commit` → files touched in `HEAD`
   - `staged` → files in `git diff --cached`
   - an endpoint / route name → that route's handler + its direct collaborators
   - If ambiguous, **stop and ask** via `AskUserQuestion` before reading anything.
2. **Load the project rubric** — these are the contracts to audit against, not generic "good API design":
   - `<rubric file 1>` — _(forker: e.g. `docs/API-CONTRACT.md` or `openapi.yaml` — endpoint contracts)_
   - `<rubric file 2>` — _(forker: e.g. `docs/DB-SCHEMA.md` or `alembic/versions/` — persistence shape)_
   - `<rubric file 3>` — _(forker: e.g. `docs/ERROR-MODEL.md` — error envelope + status-code conventions)_
3. **Run verification gates** so passes 1–2 don't report noise the toolchain catches:
   ```sh
   <lint command, e.g. ruff check / golangci-lint run>
   <type-check command, e.g. mypy . / tsc --noEmit>
   <test command, e.g. pytest -x / go test ./...>
   ```
   Note failures — they become Critical findings in pass 2.
4. **If something is unclear, stop and ask now.** Do not guess intent.

## 2. The 5 passes (in order)

Run in this exact order. **Cap each pass at 5 findings max.** If a pass has more, keep the top 5 by severity and note the tail count (`+3 more Low omitted`).

1. **Input validation & contracts** — request bodies / query params / headers reaching handlers without a typed schema (Pydantic / Marshmallow / Zod / etc.); endpoints without a declared response model (FastAPI `response_model`, Django serializer, etc.); silent type coercion at boundaries (string → int via duck-typing); missing field-level validation where domain rules exist (e.g. "amount > 0", "email must verify"); contract drift between OpenAPI / GraphQL schema and the actual handler signature. _(forker: name your validation framework — e.g. "Pydantic v2 required on all request bodies; v1 idioms are findings")_
2. **Error handling & lifecycle** — bare `except:` / `catch (e)` swallowing exceptions; broad `except Exception` masking real failures; errors logged then re-raised differently (loses stack); missing connection / file-handle / cursor cleanup (`with` / `defer` / `using` not used); external calls without timeouts; retries without backoff or jitter; missing rollback on commit failure; teardown order bugs in test fixtures. _(forker: pin your error-envelope shape so wrong-shape returns are findings)_
3. **Persistence patterns** — N+1 query loops (iterating a result set then querying per row); missing `select_related` / `prefetch_related` / equivalent eager-load; transactions not wrapping multi-statement writes; missing or wrong index on a hot WHERE column; raw SQL with string concat (cross-list with `audit-security` pass 2); ORM session leaks across request boundary; migrations not reversible without data loss. _(forker: name your ORM and its known footguns)_
4. **Async correctness** — blocking I/O inside an async handler (sync DB driver, `time.sleep`, `requests.get` instead of `httpx.AsyncClient`); missing `await` on a coroutine (silently returns a coroutine object); event-loop blocking CPU work (should be in an executor / worker queue); race on shared in-memory state with no lock; mixed sync / async in the same code path causing thread-pool exhaustion; `asyncio.gather` swallowing exceptions when one task fails. _(forker: name your async model — single-threaded async, multi-process with worker pool, sync-only, etc.)_
5. **Observability** — log levels misused (errors at INFO, debug noise at WARNING); no structured logging where needed for filtering (free-text strings instead of key=value or JSON); missing request / trace ID propagation across service hops; `print()` left in production code; missing metrics on critical paths (request count, latency, error rate); log-and-throw anti-pattern (log + raise the same error, double-counting in dashboards); secrets / PII in log lines (cross-list with `audit-security` pass 1).

## 3. Finding format (use exactly this)

```text
**Finding #[N] – [Critical|High|Medium|Low] – [Pass # / Category]**
- Location: `path/to/file:LINE` (or endpoint / handler name)
- Issue: one sentence
- Why it matters: brief — tie to correctness, lifecycle safety, performance, or operability
- Recommended fix: concrete suggestion or ≤5-line snippet
```

Severity guide:
- **Critical** — data corruption risk (missing transaction on multi-statement write, schema-corrupting migration), sacred-invariant bypass, swallowed exception that hides a real production failure mode, async deadlock or unbounded-wait. _(forker: name your project's sacred invariants here — e.g. paper-mode enforcement, idempotency-key required on payments.)_
- **High** — missing validation on attacker-controlled input, missing teardown / lifecycle bug, unhandled external failure (no timeout / no retry strategy), endpoint with no `response_model` / typed contract.
- **Medium** — N+1 with non-trivial loop, missing index on a moderately-hot column, log-level misuse that will mislead oncall.
- **Low** — nit, hygiene, minor idiom violation.

## 4. Required closing sections (always, in order)

1. **Summary** — health score 1–10 with one-sentence justification + top 3 issues (by severity, not pass order).
2. **Exploratory Insights** — what the findings reveal about how the backend evolved. Patterns, not individual issues (e.g. "three N+1 findings cluster in the dashboard endpoints — suggests the dashboard module skipped the eager-load convention adopted elsewhere").
3. **Proposed tasks for `_project/PLAN.md`** — prioritized, actionable tickets using flowtron's task-line grammar. One ticket per thematic cluster, not per finding. Present them inline so the user can review before anything is written to disk.
4. **Questions for the user** — anything ambiguous that blocks implementation. Use `AskUserQuestion`, not prose.

## 5. Write the proposed tasks into `_project/PLAN.md` (required step, not optional)

The audit is not done until the proposed tickets land in `_project/PLAN.md`. This is the deliverable.

1. **After** sections 1–3 are presented, and **after** the user responds to any `AskUserQuestion` blockers, write tickets into `_project/PLAN.md` using flowtron's task-line grammar: `- [ ] **<AREA>-<N>** [opus|sonnet] | shortname — long description.` See `_project/flowtron/SPEC.md` §"Task-line format" (or `SPEC.md` §"Task-line format" if forked into flowtron-self).
2. Pick the next free `<N>` per area prefix. Valid prefixes are listed in `_project/tasknote/README.md` §"Area prefixes" (typically `BE-` for backend; `DB-` for migration / persistence; `TEST-` for testing).
3. Insert tickets in the correct priority section. Add a `Surfaced by audit-backend YYYY-MM-DD (Finding #N, <severity>)` parenthetical.
4. Do **not** write code changes, do **not** run formatters, do **not** open files for fixes. The audit writes tickets only.
5. If the user pushes back on a proposed ticket during review, drop it from the write.

If every pass returned zero findings, say so explicitly and skip the write.

## 6. Hard rules

- **Targeted, not exhaustive.** Five findings per pass is a *ceiling*, not a target.
- **Write tickets, not fixes.** `_project/PLAN.md` gets updated; source files do NOT.
- **Don't repeat the type-checker.** If `mypy` / `pyright` / `tsc` already flagged it, surface the aggregate count once — don't enumerate each row as a finding.
- **Verify N+1 before reporting.** Don't flag a `for x in xs: x.related` pattern as N+1 if `xs` was loaded with eager-load already. Read the loader.
- **Don't audit adjacent code.** Stay inside the resolved scope.
- **No final summary of what you just did.** The report + the `_project/PLAN.md` diff *are* the deliverable.
- _(forker: append project-specific hard rules — e.g. "Every external API call has a timeout. No exceptions. Findings here are High minimum.")_
