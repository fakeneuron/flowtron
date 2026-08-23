---
name: ft-audit-repo
description: First-contact holistic repo audit for freshly adopting projects — Repo Map discovery (read-before-judging), thin cross-cutting sweep, thematic synthesis (3–5 themes with won't-fix tradeoffs + done-signals), milestone-sequenced plan filed as flowtron epics in `.flowtron/PLAN.md`, and delegation recommendations for focused `/ft-audit <domain>` runs. Use when the user asks for a first-contact audit of a freshly adopted repo, with no specific domain named. Stack-neutral, strictly read-only, no fork — run by reference from the submodule. See `docs/MIGRATION.md` §1.2.1.
---

# audit-repo — flowtron first-contact holistic audit skill

Principal-engineer first look at an unfamiliar repo: map before judging, synthesize what the map reveals into themes, sequence the work into milestones filed as native flowtron epics, and delegate depth to the parameterized audit skill's domains. **Strictly read-only — the only file this skill ever writes is `.flowtron/PLAN.md` (§6), and only after explicit confirmation.**

**No fork.** Unlike the parameterized `ft-audit` scaffold, this skill is not forked: it runs at first contact, before any per-stack customization exists, and is stack-neutral by design — there is no §0 forker checklist. Invoke it by reference from the read-only submodule path (`.flowtron/core/claude/skills/ft-audit-repo/SKILL.md`), per `docs/MIGRATION.md` §1.2.1.

## 1. Scope & ground rules (do this first, always)

1. **Resolve scope** from `$ARGUMENTS`: `all`/empty → the whole repo; a path → that subtree (still map the whole repo briefly in §2 — the milestone plan needs whole-repo context — but sweep and synthesize only the subtree). If ambiguous, **stop and ask** via `AskUserQuestion`.
2. **Run verification gates** — discover the project's own commands (`package.json` scripts, `Makefile`, `pyproject.toml`, CI config) and run lint / type-check / test. Missing or failing gates are not noise to route around: they are prime Milestone-0 material (§6).
3. **Read-only, no exceptions.** No source edits, no formatters, no fixes of any size. First contact carries **no trivial-fix carve-out** — a finding small enough to fix inline still lands in the plan, not the working tree.
4. If anything's unclear, stop and ask. Don't guess intent.

## 2. Phase 1 — Repo Map (read before judging)

Build the map before forming any opinion. No findings in this phase — observations only. Cap the map at roughly one page:

- **Purpose** — what the project does and for whom; README/docs claims vs. what the code actually says.
- **Stack** — languages, frameworks, key dependencies, toolchain, deploy target.
- **Architecture sketch** — major modules, entry points, and data flow, as a short text sketch.
- **Conventions** — naming, layout, test culture, error-handling idioms, and the project's own stated rules (`CLAUDE.md` / `AGENTS.md` / contributing docs).
- **Vital signs** — repo size, test count, CI presence, recency of activity, and the gate results from §1 step 2.

Present the map to the user. If purpose or architecture remains genuinely unclear after reading, resolve it via `AskUserQuestion` before judging anything.

## 3. Thin cross-cutting sweep (capped)

One fast breadth pass across the §1 scope — security, correctness, hygiene, doc drift, whatever jumps out. **Cap: 10 findings total** (overall, not per category); keep the top 10 by severity and note the tail count. Depth belongs to the focused family (§5) — if tracing a single issue takes more than a few minutes, record what you have and move on.

Use the family finding format:

```text
**Finding #[N] – [Critical|High|Medium|Low] – [Category]**
- Location: `path/to/file:LINE` (or endpoint / component / function name)
- Issue: one sentence
- Why it matters: brief — tie to safety / correctness / maintenance cost
- Recommended fix: concrete suggestion or ≤5-line snippet
```

Sweep findings feed §4 synthesis and §5 delegation — they do not become standalone tickets outside the milestone plan.

## 4. Thematic synthesis (3–5 themes)

Cluster the map facts and sweep findings into **3–5 themes** — patterns, not item lists. Each theme carries:

- **Name + pattern statement** — 1-2 sentences on what keeps showing up and why.
- **Evidence** — the findings and map facts that support it.
- **Won't-fix tradeoff** (where applicable) — what this theme deliberately accepts and why it's the right call for this project (e.g. "no auth layer — single-user local tool; adding one is pure ceremony").
- **Measurable done-signal** — how you'll know the theme is resolved: a command that passes, a count that reaches zero, a check that flips. Not vibes.

## 5. Delegation — recommend focused audits

Based on what the map revealed, recommend which `/ft-audit <domain>` runs deserve a full pass — do **not** run them here. Domains are `general` · `backend` · `frontend` · `security` · `performance` · `docs` · `structure`. For each recommendation: domain, scope glob, and the map/sweep observation that triggers it. Skip domains the map gives no reason to run. (In adopter context the audit scaffold is forked under an unprefixed local name per `docs/MIGRATION.md` §1.2.1 — recommend whichever name resolves locally, e.g. `/audit backend src/api/**`.)

## 6. Required closing sections + PLAN.md write

Present, in order:

1. **Summary** — health score 1–10 with one-sentence justification + top 3 issues (by severity).
2. **Themes** — the §4 synthesis.
3. **Milestone-sequenced plan** — **Milestone 0 is the safety net**: whatever §1–§3 showed is needed to make change safe (verification gates, CI, test baseline, branch hygiene) before feature work. Subsequent milestones in dependency order. Each milestone maps to one `<AREA>-EPIC-<N>` with concrete implementation children. Present the proposed epic + child lines inline for review before anything is written.
4. **Recommended focused audits** — the §5 table.
5. **Questions for the user** — anything ambiguous that blocks the plan. Use `AskUserQuestion`, not prose.

**After** the user confirms, write the plan into `.flowtron/PLAN.md` using flowtron's task-line grammar:

- One `- [ ] **<AREA>-EPIC-<N>**` parent per milestone, plus its implementation children and a closing `.N` audit placeholder. **Skip the `.1` Discovery child** — this run supplied the epic-level discovery; note it on the parent line (`Discovery supplied by audit-repo YYYY-MM-DD.`).
- Tag effort per line: `[heavy]🧠` (design, ambiguity, cross-module) / `[light]🔧` (mechanical, clear-diff); `[medium]🧩` where it genuinely fits.
- Append `Surfaced by audit-repo YYYY-MM-DD (Theme: <name>)` to each parent so the origin's traceable.
- Milestone-0 goes under `## High`; later milestones under `## Medium` / `## Future Opportunities` by urgency. Pick the next free `<N>` per area prefix (valid prefixes in `.flowtron/tasknote/README.md` §"Area prefixes").
- User pushes back on a milestone or child → drop or reshape it before writing.

A genuinely healthy repo can yield zero milestones — say so explicitly, keep the delegation recommendations, and skip the write.

## 7. Hard rules

- **Read-only, period.** No source edits, no formatters, no "fix while I'm in here" — regardless of how trivial. The trivial-fix carve-out the focused family carries does **not** apply at first contact.
- **Map before judging.** No findings, severities, or recommendations until §2 is complete and presented.
- **Ten findings is a ceiling, not a target.** A clean sweep gets fewer and moves on.
- **Breadth here, depth there.** This skill never replaces a focused audit — it decides which ones are worth running.
- **Don't repeat the gates.** If lint/tests already flagged it, count it once as gate output (and Milestone-0 evidence), not as enumerated findings.
- **One epic per milestone**, children per work item — not one epic per finding.
- **No final summary of what you just did.** The report + the `.flowtron/PLAN.md` diff *are* the deliverable.
