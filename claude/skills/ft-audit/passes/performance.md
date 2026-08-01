# performance — /ft-audit pass library

> Loaded by `SKILL.md` §1 step 1. Supplies the `performance` domain's deltas;
> the dispatcher owns the shared procedure (arg grammar, caps, finding format,
> closing sections, PLAN write step, core hard rules).

**Attribution slug:** `audit-performance`

**Cross-cuts** with the `frontend` domain (bundle/render perf) and the
`backend` domain (persistence/async). This domain takes the cross-cutting
view: end-to-end latency, resource budgets, hot-path identification. Findings
cleanly inside one layer → defer to that domain and cross-list.

## Scope & rubric hints (→ dispatcher §1)

- **Default scope (`all`/empty):** `<default glob>` _(forker: narrow scope preferred; `all` is rarely useful)_
- **Extra scope tokens:** a route/endpoint → that path end-to-end (request → handler → DB → response). If ambiguous, **stop and ask** — unscoped perf audits are an anti-pattern.
- **Rubric slots** (measurable budgets, not vibes):
  - `<rubric file 1>` — _(forker: e.g. `docs/PERF-BUDGET.md` — bundle/latency/memory ceilings)_
  - `<rubric file 2>` — _(forker: e.g. `docs/SLO.md` — error budgets, p95/p99 targets)_
  - `<rubric file 3>` — _(forker: e.g. `bench/baseline.json` — last-recorded benchmark for regression detection)_
- **Verification gates** (ground findings in measurements, not guesses):
  ```sh
  <profiler / benchmark, e.g. python -m cProfile, k6 run, lighthouse>
  <bundle analyzer if frontend, e.g. npx vite-bundle-visualizer>
  <load test if available, e.g. wrk -t4 -c100 -d30s>
  ```
  Capture deltas vs. rubric baseline — they're the leads for passes 1, 2, 4. **No measurements exist → surface that first** — an unmeasured perf audit is a code-style audit in disguise.

## The 5 passes (→ dispatcher §2)

1. **Hot paths** — functions called per request / per render / per frame that allocate, recompute, or do unnecessary I/O. Profiler output names the suspects; trace each top-N to source. Examples: regex compiled on every call instead of module-level; JSON parsed-then-serialized in a passthrough; deepcopy in a render loop; database connection acquired per call instead of pooled. _(forker: cite your top profiling tool — "py-spy top --pid X says the top 3 are…")_
2. **Payload & bundle** — over-the-wire size that doesn't need to be that big. Examples: API returns full nested entities when only 3 fields are used downstream; missing pagination on list endpoints; main bundle ships dev-only deps; images served uncompressed or unoptimized; GraphQL fields fetched but unused; redundant data shipped in initial HTML payload. _(forker: cite your bundle budget and current size)_
3. **Data access** — DB / external-store patterns that are quadratic, redundant, or under-indexed. Examples: N+1 (cross-list with the `backend` domain, pass 3); missing index on a hot WHERE / ORDER BY column; over-broad SELECT (`SELECT *` when 2 columns are read); missing connection pool tuning; cache stampede risk (no lock / no jitter on cache-miss recomputation); reading from primary when a replica would do. _(forker: name your DB and ORM)_
4. **Memory & resource** — leaks and unbounded growth. Examples: event listeners / subscriptions / timers not cleaned up on teardown; unbounded in-memory caches (no LRU / TTL); large objects retained by closures; file handles / sockets not closed; goroutine / async-task leak (spawned but never awaited / joined); worker queue backlog growing faster than drain rate. _(forker: name your declared steady-state memory budget if any)_
5. **Caching** — missing or wrong caching strategy, plus invalidation pitfalls. Examples: missing cache on a deterministic + frequently-called pure function; over-cached stale data (TTL too long for the freshness contract); missing ETag / `If-Modified-Since` / 304 on static or cacheable endpoints; missing CDN headers on assets; cache key includes a volatile field causing 0% hit rate; cache invalidation racing with write-through (returns stale immediately after write).

## Severity guide (→ dispatcher §3)

- **Critical** — declared budget / SLO breached on a customer-visible path (e.g. p95 over the SLO on the read API, TTI over budget on the landing route, memory leak that OOMs under normal load). _(forker: cite your measurable invariants.)_
- **High** — non-budget regression vs. baseline > 25%, or a finding with clear measurable impact even if no formal budget exists.
- **Medium** — likely-impactful optimization with measurable but bounded payoff (single-digit % wins, or wins on a low-traffic path).
- **Low** — micro-optimization, theoretical win with no measurable impact.

## Specialist additions

- **Finding-format extra** (dispatcher §3): add a `Measured impact:` line — profiler delta / wire bytes / query count / heap growth, concrete number where possible — and tie "Why it matters" to the declared budget / SLO / user-visible latency.
- **Write-step extra** (dispatcher §5 step 3): append the measured-impact number to each ticket's attribution so future-you can validate the fix moved the metric.
- **Hard rules:**
  - **Measure, don't guess.** Every finding above Low severity must cite a measurement (profiler output, bundle bytes, query count, heap snapshot). "I think this might be slow" is a code-smell finding, not a performance finding — route to the `backend` or `frontend` domain instead.
  - **Defer to specialists when appropriate.** If a finding is cleanly inside one layer (a single React component re-rendering, a single Pydantic model over-validating), cross-list with the `frontend` / `backend` domain and leave the detailed write-up to that audit.
  - _(forker: append project-specific hard rules — e.g. "p95 read-API SLO is sacred. Any finding implicating it is Critical regardless of fix-cost.")_
