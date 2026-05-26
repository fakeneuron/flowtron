---
name: ft-audit-frontend
description: Frontend-focused audit — 5 passes (Bundle & payload · Accessibility · Render perf · Browser hygiene · Component health), capped findings, writes tickets to `_project/PLAN.md`. Stack-neutral scaffold; adopters fork into `.claude/skills/audit-frontend/` and customize framework + bundler + a11y tooling. See `docs/MIGRATION.md` §1.2.1.
---

# audit-frontend — flowtron frontend audit skill

Principal-engineer audit of a frontend codebase: find what matters, report concisely, **make no changes without explicit confirmation**.

Stack-neutral scaffold — **fork**, don't symlink (framework + bundler + component-library divergence). Install per `docs/MIGRATION.md` §1.2.1.

## 0. Forker checklist (fill in before first run)

Walk this list once per fork. The placeholders in §1 and §2 below are the things to replace.

- [ ] `name:` and `description:` frontmatter — set to your fork's slash-command name and a framework-specific blurb (e.g. "React + Vite frontend audit").
- [ ] §1 step 1 "Resolve scope" — set the default-`all` glob for your frontend (e.g. `frontend/src/**`, `src/**/*.{ts,tsx,vue}`, `app/**/*.tsx`).
- [ ] §1 step 2 "Load the project rubric" — replace placeholder rubric paths with your design-system doc, component-library docs, a11y baseline ADR, perf budget.
- [ ] §1 step 3 "Run verification gates" — wire your project's actual build / bundle-analyzer / a11y / lint commands.
- [ ] §2 each pass — replace generic-placeholder bullets with your framework's concrete examples (specific anti-patterns in React/Vue/Svelte/etc., your component library's misuse modes, your perf-budget numbers).
- [ ] §3 "Severity guide" — name your project's user-facing invariants under **Critical** (e.g. "WCAG 2.1 AA contrast baseline", "TTI under 3s on the landing route", "bundle under 200KB gz").

Once the checklist is satisfied, delete this §0 block from your fork — leaving it in confuses the auditor's first read on every run.

## 1. Scope & ground rules (do this first, always)

1. **Resolve scope** from `$ARGUMENTS`: `all`/empty → `<default frontend glob>` _(forker: set this)_; a path → that path; `last-commit` → files in `HEAD`; `staged` → files in `git diff --cached`; a route → component tree under that route. If ambiguous, **stop and ask** via `AskUserQuestion`.
2. **Load the project rubric** (user-facing contracts, not generic best practices):
   - `<rubric file 1>` — _(forker: e.g. `docs/DESIGN-SYSTEM.md` — tokens, spacing, typography)_
   - `<rubric file 2>` — _(forker: e.g. `docs/A11Y-BASELINE.md` — declared a11y commitments)_
   - `<rubric file 3>` — _(forker: e.g. `docs/PERF-BUDGET.md` — bundle ceilings, TTI/LCP targets)_
3. **Run verification gates** so passes don't report toolchain noise:
   ```sh
   <build / type-check, e.g. npm run build>
   <bundle-analyzer, e.g. npx vite-bundle-visualizer --json>
   <a11y check, e.g. npx pa11y http://localhost:5173 or jest-axe in tests>
   <lint, e.g. npm run lint>
   ```
   Failures become Critical/High findings in passes 1–2.
4. If anything's unclear, stop and ask. Don't guess intent.

## 2. The 5 passes (in order)

Run in this exact order. **Cap each pass at 5 findings max.** If a pass has more, keep the top 5 by severity and note the tail count (`+3 more Low omitted`).

1. **Bundle & payload** — bundle size over budget; large deps (lodash full vs. per-method, moment vs. dayjs, full icon packs); missing code-splitting at route boundaries; missing tree-shaking (default imports of barrel files); oversized / unoptimized images shipped from `public/`; fonts not subset; vendor chunks bloating from a single heavy lib. _(forker: cite your perf-budget numbers — e.g. "main bundle > 200KB gz fails the budget")_
2. **Accessibility** — interactive elements without accessible names (icon-only buttons without `aria-label`); missing or incorrect ARIA roles; focus traps / focus management bugs in modals; keyboard nav gaps (custom controls not reachable via Tab / Enter / Space); contrast violations against your declared baseline; missing `<label>` association on form controls; nested interactive elements; semantic HTML replaced by `<div onClick>`. _(forker: pin your contrast / WCAG level)_
3. **Render perf** — unnecessary re-renders on parent state change (missing `memo` / `useMemo` where it matters; not a blanket "memo everything"); long synchronous tasks in render path (> 50ms blocks INP); list rendering without `key` or with index-as-key on reorderable lists; layout thrash (reads after writes in the same frame); large `useEffect` running on every render due to unstable deps; expensive computations in render that belong in `useMemo` or upstream state.
4. **Browser hygiene** — console errors / warnings in normal flows (not "expected dev warnings" but actual error-level output); deprecated browser API usage; CSP gaps (inline scripts / styles where CSP is meant to forbid them); `dangerouslySetInnerHTML` on untrusted content; mixed-content warnings (HTTP asset from HTTPS page); third-party scripts loaded without `defer` / `async` blocking parse; missing `rel="noopener noreferrer"` on `target="_blank"` external links.
5. **Component health** — dead components / hooks / utilities (defined but no caller); unused props passed down a tree; prop drilling > 3 levels that should be context or a state library; style / token drift (hardcoded `#hex` colors instead of design-system tokens; px values where the system uses rem / spacing scale); inconsistent component naming (mix of PascalCase / kebab files); test fixtures nothing renders.

## 3. Finding format (use exactly this)

```text
**Finding #[N] – [Critical|High|Medium|Low] – [Pass # / Category]**
- Location: `path/to/file.tsx:LINE` (or component name / route)
- Issue: one sentence
- Why it matters: brief — tie to user-visible impact (load time, a11y blocker, broken interaction, maintenance cost)
- Recommended fix: concrete suggestion or ≤5-line snippet
```

Severity guide:
- **Critical** — feature broken for assistive-tech users (keyboard-only blocked, screen-reader-broken), bundle > budget on a customer-visible route, console error breaking a normal-path interaction. _(forker: name your project's sacred user-facing invariants here — e.g. WCAG 2.1 AA contrast, INP < 200ms on the cart route.)_
- **High** — a11y violation that excludes a class of users without fully breaking them, render bug that visibly degrades UX, oversized asset on a frequently-loaded route.
- **Medium** — token drift, missing memoization with measurable wasted re-renders, dead component cluster.
- **Low** — nit, naming inconsistency, hygiene with no user-visible impact.

## 4. Required closing sections (always, in order)

1. **Summary** — health score 1–10 with one-sentence justification + top 3 issues (by severity, not pass order).
2. **Exploratory Insights** — what the findings reveal about how the frontend evolved. Patterns, not individual issues (e.g. "four a11y findings cluster in the modal stack — suggests the modal primitive predates the a11y baseline").
3. **Proposed tasks for `_project/PLAN.md`** — prioritized, actionable tickets using flowtron's task-line grammar. One ticket per thematic cluster, not per finding. Present them inline so the user can review before anything is written to disk.
4. **Questions for the user** — anything ambiguous that blocks implementation. Use `AskUserQuestion`, not prose.

## 5. Write the proposed tasks into `_project/PLAN.md` (required, not optional)

The deliverable is tickets in PLAN.md.

1. **After** §§1–3 are presented and any `AskUserQuestion` blockers are answered, write tickets using flowtron's task-line grammar: `- [ ] **<AREA>-<N>** [model] | shortname — long description.` (primary labels `[heavy]🧠` / `[light]🔧` recommended; specifics e.g. `opus` / `sonnet` / `grok` remain valid per SPEC §"Model field"). See §"Task-line format".
2. Pick the next free `<N>` per area prefix (valid prefixes in `_project/tasknote/README.md` §"Area prefixes" — typically `FE-`).
3. Insert in correct priority section. Append `Surfaced by audit-frontend YYYY-MM-DD (Finding #N, <severity>)`.
4. **No code changes**, no formatters, no opening files for fixes. Tickets only.
5. User pushes back on a ticket → drop it.

Zero findings across all passes → say so explicitly and skip the write.

## 6. Hard rules

- **Targeted, not exhaustive.** Five findings per pass is a *ceiling*, not a target.
- **Write tickets, not fixes.** `_project/PLAN.md` gets updated; source files do NOT.
- **Don't repeat the build tool.** If type-check / lint / a11y CI already flagged it, surface the aggregate count once — don't enumerate.
- **Measure before recommending memoization.** Suggesting `useMemo` / `memo` without a measurable re-render cost is hygiene churn. If you can't point to a render that observably re-runs unnecessarily, downgrade to Low or drop.
- **Don't audit adjacent code.** Stay inside the resolved scope.
- **No final summary of what you just did.** The report + the `_project/PLAN.md` diff *are* the deliverable.
- _(forker: append project-specific hard rules — e.g. "Design tokens are sacred. Any hardcoded color outside the token scale is Medium minimum.")_
