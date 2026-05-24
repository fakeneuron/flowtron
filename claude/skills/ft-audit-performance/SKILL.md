---
name: ft-audit-performance
description: Performance-focused audit — 5 passes (Hot paths · Payload & bundle · Data access · Memory & resource · Caching), capped findings, writes tickets to `_project/PLAN.md`. Stack-neutral scaffold; adopters fork into `.claude/skills/audit-performance/` and customize budgets + profiling tools + benchmarks. See `docs/MIGRATION.md` §1.2.1.
---

# audit-performance — flowtron performance audit skill

Principal-engineer performance audit: find what matters, report concisely, **make no changes without explicit confirmation**.

Stack-neutral scaffold — **fork**, don't symlink (profiling tools + perf budgets + benchmark harnesses diverge). Install per `docs/MIGRATION.md` §1.2.1.

**Cross-cuts** with `audit-frontend` (bundle/render perf) and `audit-backend` (persistence/async). This skill takes the cross-cutting view: end-to-end latency, resource budgets, hot-path identification. Findings cleanly inside one layer → defer to that audit and cross-list.

## 0. Forker checklist (fill in before first run)

Walk this list once per fork. The placeholders in §1, §2, and §3 below are the things to replace.

- [ ] `name:` and `description:` frontmatter — set to your fork's slash-command name and a stack-specific blurb.
- [ ] §1 step 1 "Resolve scope" — set the default-`all` glob for your stack or pin a route / endpoint scope.
- [ ] §1 step 2 "Load the project rubric" — replace placeholder rubric paths with your perf budget doc, SLO doc, benchmark baselines.
- [ ] §1 step 3 "Run verification gates" — wire your project's actual profilers / benchmarks / bundle analyzers (e.g. `py-spy`, `pprof`, `vite-bundle-visualizer`, `lighthouse`, `k6`, `wrk`).
- [ ] §2 each pass — replace generic-placeholder bullets with your stack's concrete examples and your declared budgets.
- [ ] §3 "Severity guide" — name your project's measurable perf invariants under **Critical** (e.g. "p95 < 300ms on the read API", "TTI < 2.5s on landing", "memory steady-state < 512MB per worker").

Once the checklist is satisfied, delete this §0 block from your fork — leaving it in confuses the auditor's first read on every run.

## 1. Scope & ground rules (do this first, always)

1. **Resolve scope** from `$ARGUMENTS`: `all`/empty → `<default glob>` _(forker: narrow scope preferred; `all` is rarely useful)_; a path → that path; a route/endpoint → that path end-to-end (request → handler → DB → response); `last-commit` → files in `HEAD`; `staged` → files in `git diff --cached`. If ambiguous, **stop and ask** — unscoped perf audits are an anti-pattern.
2. **Load the project rubric** (measurable budgets, not vibes):
   - `<rubric file 1>` — _(forker: e.g. `docs/PERF-BUDGET.md` — bundle/latency/memory ceilings)_
   - `<rubric file 2>` — _(forker: e.g. `docs/SLO.md` — error budgets, p95/p99 targets)_
   - `<rubric file 3>` — _(forker: e.g. `bench/baseline.json` — last-recorded benchmark for regression detection)_
3. **Run verification gates** to ground findings in measurements, not guesses:
   ```sh
   <profiler / benchmark, e.g. python -m cProfile, k6 run, lighthouse>
   <bundle analyzer if frontend, e.g. npx vite-bundle-visualizer>
   <load test if available, e.g. wrk -t4 -c100 -d30s>
   ```
   Capture deltas vs. rubric baseline — they're the leads for passes 1, 2, 4.
4. If anything's unclear, stop and ask. **No measurements exist → surface that first** — an unmeasured perf audit is a code-style audit in disguise.

## 2. The 5 passes (in order)

Run in this exact order. **Cap each pass at 5 findings max.** If a pass has more, keep the top 5 by severity and note the tail count (`+3 more Low omitted`).

1. **Hot paths** — functions called per request / per render / per frame that allocate, recompute, or do unnecessary I/O. Profiler output names the suspects; trace each top-N to source. Examples: regex compiled on every call instead of module-level; JSON parsed-then-serialized in a passthrough; deepcopy in a render loop; database connection acquired per call instead of pooled. _(forker: cite your top profiling tool — "py-spy top --pid X says the top 3 are…")_
2. **Payload & bundle** — over-the-wire size that doesn't need to be that big. Examples: API returns full nested entities when only 3 fields are used downstream; missing pagination on list endpoints; main bundle ships dev-only deps; images served uncompressed or unoptimized; GraphQL fields fetched but unused; redundant data shipped in initial HTML payload. _(forker: cite your bundle budget and current size)_
3. **Data access** — DB / external-store patterns that are quadratic, redundant, or under-indexed. Examples: N+1 (cross-list with `audit-backend` pass 3); missing index on a hot WHERE / ORDER BY column; over-broad SELECT (`SELECT *` when 2 columns are read); missing connection pool tuning; cache stampede risk (no lock / no jitter on cache-miss recomputation); reading from primary when a replica would do. _(forker: name your DB and ORM)_
4. **Memory & resource** — leaks and unbounded growth. Examples: event listeners / subscriptions / timers not cleaned up on teardown; unbounded in-memory caches (no LRU / TTL); large objects retained by closures; file handles / sockets not closed; goroutine / async-task leak (spawned but never awaited / joined); worker queue backlog growing faster than drain rate. _(forker: name your declared steady-state memory budget if any)_
5. **Caching & invalidation** — missing or wrong caching strategy. Examples: missing cache on a deterministic + frequently-called pure function; over-cached stale data (TTL too long for the freshness contract); missing ETag / `If-Modified-Since` / 304 on static or cacheable endpoints; missing CDN headers on assets; cache key includes a volatile field causing 0% hit rate; cache invalidation racing with write-through (returns stale immediately after write).

## 3. Finding format (use exactly this)

```text
**Finding #[N] – [Critical|High|Medium|Low] – [Pass # / Category]**
- Location: `path/to/file:LINE` (or endpoint / component / function name)
- Issue: one sentence
- Measured impact: profiler delta / wire bytes / query count / heap growth — concrete number where possible
- Why it matters: brief — tie to declared budget / SLO / user-visible latency
- Recommended fix: concrete suggestion or ≤5-line snippet
```

Severity guide:
- **Critical** — declared budget / SLO breached on a customer-visible path (e.g. p95 over the SLO on the read API, TTI over budget on the landing route, memory leak that OOMs under normal load). _(forker: cite your measurable invariants.)_
- **High** — non-budget regression vs. baseline > 25%, or a finding with clear measurable impact even if no formal budget exists.
- **Medium** — likely-impactful optimization with measurable but bounded payoff (single-digit % wins, or wins on a low-traffic path).
- **Low** — micro-optimization, theoretical win with no measurable impact.

## 4. Required closing sections (always, in order)

1. **Summary** — health score 1–10 with one-sentence justification + top 3 issues (by severity, not pass order).
2. **Exploratory Insights** — what the findings reveal about the project's perf posture. Patterns, not individual issues (e.g. "four of five hot-path findings cluster in JSON serialization — suggests the serializer choice is the bottleneck, not the routes").
3. **Proposed tasks for `_project/PLAN.md`** — prioritized, actionable tickets using flowtron's task-line grammar. One ticket per thematic cluster, not per finding. Present them inline so the user can review before anything is written to disk.
4. **Questions for the user** — anything ambiguous that blocks implementation. Use `AskUserQuestion`, not prose.

## 5. Write the proposed tasks into `_project/PLAN.md` (required, not optional)

The deliverable is tickets in PLAN.md.

1. **After** §§1–3 are presented and any `AskUserQuestion` blockers are answered, write tickets using flowtron's task-line grammar: `- [ ] **<AREA>-<N>** [opus|sonnet] | shortname — long description.` See SPEC §"Task-line format".
2. Pick the next free `<N>` per area prefix (valid prefixes in `_project/tasknote/README.md` §"Area prefixes").
3. Insert in correct priority section. Append `Surfaced by audit-performance YYYY-MM-DD (Finding #N, <severity>)` **plus the measured-impact number** so future-you can validate the fix moved the metric.
4. **No code changes**, no formatters, no opening files for fixes. Tickets only.
5. User pushes back on a ticket → drop it.

Zero findings across all passes → say so explicitly and skip the write.

## 6. Hard rules

- **Measure, don't guess.** Every finding above Low severity must cite a measurement (profiler output, bundle bytes, query count, heap snapshot). "I think this might be slow" is a code-smell finding, not a performance finding — route to `/ft-audit-backend` or `/ft-audit-frontend` instead.
- **Targeted, not exhaustive.** Five findings per pass is a *ceiling*, not a target.
- **Write tickets, not fixes.** `_project/PLAN.md` gets updated; source files do NOT.
- **Defer to specialists when appropriate.** If a finding is cleanly inside one layer (a single React component re-rendering, a single Pydantic model over-validating), cross-list with `audit-frontend` / `audit-backend` and leave the detailed write-up to the specialist audit.
- **Don't audit adjacent code.** Stay inside the resolved scope.
- **No final summary of what you just did.** The report + the `_project/PLAN.md` diff *are* the deliverable.
- _(forker: append project-specific hard rules — e.g. "p95 read-API SLO is sacred. Any finding implicating it is Critical regardless of fix-cost.")_
