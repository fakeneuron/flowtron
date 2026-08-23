# structure — /ft-audit pass library

> Loaded by `SKILL.md` §1 step 1. Supplies the `structure` domain's deltas;
> the dispatcher owns the shared procedure (arg grammar, caps, finding format,
> closing sections, PLAN write step, core hard rules).

**Attribution slug:** `audit-structure`

**Cross-cuts** with the `general` domain, whose Hygiene and Orphans passes
graze *file-local* smells (dead imports, >60-line functions, naming). This
domain takes the **cross-file** view: clusters, boundaries, responsibility
placement. A finding contained in one file with no structural consequence →
defer to `general` and cross-list. Breadth sweep only — for a finding that
needs a *sequenced multi-step restructuring* of one target, recommend an
`/ft-refactor <target>` run in the report instead of an oversized ticket
(that skill files the staged epic with characterization-test acceptance).

## Scope & rubric hints (→ dispatcher §1)

- **Default scope (`all`/empty):** `<default glob>` _(forker: whole-repo or top-level-tree preferred — structural findings live *between* files, so narrow globs starve passes 1–2)_
- **Extra scope tokens:** none.
- **Rubric slots** (audit against this repo's declared structure, not a textbook layering ideal):
  - `<rubric file 1>` — _(forker: e.g. `docs/ARCHITECTURE.md` / ADR directory — declared module boundaries and dependency direction)_
  - `<rubric file 2>` — _(forker: e.g. root `CLAUDE.md` / `AGENTS.md` — layout conventions, where each concern is supposed to live)_
- **Verification gates:**
  ```sh
  <duplication detector, e.g. npx jscpd src/ / pylint --disable=all --enable=duplicate-code>
  <complexity/size analyzer, e.g. radon cc -n C . / lizard / eslint complexity rule>
  <dead-code detector, e.g. npx knip / vulture . / ts-prune>
  ```
  Detector output supplies *leads* for passes 1 and 4 — the aggregate is surfaced once, never enumerated row-by-row. Skip entirely if no such tooling is configured; the passes still run on read-the-code evidence.

## The 5 passes (→ dispatcher §2)

1. **Duplication clusters** — the same *intent* implemented in several places. Examples: copy-paste blocks that have started to diverge (one copy fixed, siblings stale); parallel-evolved siblings (two handlers/components doing the same job under different names); the same validation, mapping, or constant re-declared per module; near-identical utilities in separate "helpers" files. Cite ≥2 concrete sites per finding — similar text with independent intent is not a cluster. _(forker: add stack examples — e.g. duplicated Pydantic validators, copy-pasted React data-fetch hooks, repeated SQL fragments)_
2. **Coupling & boundaries** — dependencies that cross or blur the repo's declared module lines. Examples: circular imports; layering violations (domain logic importing UI/adapters, low-level modules reaching up); deep-reach imports (`a.b.internal._x`) bypassing a module's public surface; feature envy (a function operating mostly on another module's data); shared mutable state across module lines; one module every other module imports for unrelated reasons. _(forker: name your layer order and the import direction that is sacred)_
3. **Abstraction drift** — abstractions whose current callers no longer fit them. Examples: one-implementation interfaces/base classes kept "for flexibility"; helpers most call sites now bypass; a wrapper thinner than the thing it wraps; an options/config object accreting flags each used by a single caller; speculative generality (hooks, registries, plugin points nothing registers into); leaky abstractions forcing callers to know internals anyway. _(forker: add your known drift hotspots)_
4. **God-files** — files, modules, or classes accumulating unrelated responsibilities. Examples: files far above the repo's typical size that mix I/O, domain rules, and presentation; `utils`/`helpers`/`misc` dumping grounds; a class whose methods form disjoint clusters sharing no state; change-hotspots (files most commits must touch); a module whose docstring needs "and" three times to describe it. _(forker: cite your repo's typical file-size band so "far above" is grounded)_
5. **Stray scripts** — loose executable odds and ends that should be promoted to a real home: a justfile/Makefile target, a CLI subcommand, a test, or CI. Examples: root or `scripts/` one-offs with no task-runner entry and no owner; setup/build/data steps documented only as README prose; a script duplicating logic the app already owns (should import it, or become a subcommand); ad-hoc verification scripts that are really tests; checks run by hand that belong in CI; cron-style snippets living outside any runner. _(forker: name your task runner and CI workflow so each finding proposes a concrete destination)_

## Severity guide (→ dispatcher §3)

- **Critical** — structural defect with an *active correctness consequence now*: diverged duplicates of an invariant already disagreeing (one copy patched, one stale on a live path); a boundary violation letting data skip its validation/authorization gate; a circular dependency causing import-time or init-order failure. _(forker: name invariants whose duplication alone is Critical — e.g. paper-mode checks, auth predicates, money rounding.)_
- **High** — diverged-duplicate risk on a load-bearing path; a layering violation compounding under active development; a god-file current work must keep editing; a stray script that mutates state (deploy, migrate, seed) outside any gate or review.
- **Medium** — stable duplication cluster; drifted abstraction taxing every reader; script cleanly promotable to a justfile target, subcommand, test, or CI step.
- **Low** — nit-scale: small mirrored snippet, marginally oversized file, cosmetic boundary blur.

## Specialist additions

- **Finding-format note** (dispatcher §3): `Location:` may name a file *pair or cluster* (`a.py ↔ b.py ↔ c.py`) or a module boundary (`domain/ → adapters/`), not just one line; list every site a fix must touch.
- **Carve-out adjustment** (dispatcher §5): the trivial-fix carve-out narrows to **non-code nits only** (comment/doc tweaks). No code move is trivial here — even a one-line dedup changes call sites, which is exactly what needs characterization coverage first. Structural fixes always go through tickets or an `/ft-refactor` plan.
- **Hard rules:**
  - **Judge against the repo's own declared structure.** A pattern an ADR or rubric doc sanctions is a decision, not drift — findings must cite the declared boundary they violate, or explicitly note the repo declares none (that gap may itself be the finding).
  - **Never restructure inline.** No "extract the helper while I'm in here" — this domain's fixes are the ones most likely to break behavior without tests pinning it.
  - _(forker: append project-specific hard rules — e.g. "the `domain/` layer imports nothing above it, ever.")_
