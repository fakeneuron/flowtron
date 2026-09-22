# Harness survey

Periodic comparison of flowtron against contemporary AI-coding harnesses,
frameworks, and trackers. Each pass is a dated section; a later pass appends
rather than rewrites, so the record shows what the field looked like when a
decision was made. Read when planning a survey pass, when a "should flowtron
do X?" question comes up, or when [`docs/VISION.md`](VISION.md) §"What we
won't accept" needs a current counter-example.

Method for every pass: read `SPEC.md` + `docs/VISION.md` first, then the
field, then rank gaps by *would it change task outcomes* and overkill by
*is the clause still load-bearing for current models* (Anthropic's harness
lesson: every component encodes an assumption about what the model can't do;
strip what no longer is).

## 2026-09-21 — first pass (narrow net)

Scope: five framework families, ~12 products, web sources only, one session.
Filed as CORE-655 … CORE-662 + FE-124 (`chore: file … harness-survey
follow-ups`, `b39eb024`) and caobunga CBN-235.

### Landscape

| Family | Leaders examined | Core bet | Flowtron overlap |
|---|---|---|---|
| Spec-first | GitHub Spec Kit (constitution → `/specify` → `/plan` → `/tasks`), OpenSpec (delta specs + archive), BMAD (12+ agile personas) | Get the spec right upstream | `/ft-epic-discovery --deep`, `spec-template.md`, PLAN.md as derived task list |
| Discipline / skill libraries | Superpowers (brainstorming, TDD-as-law, systematic-debugging, verification-before-completion, two-stage review), Compound Engineering (plan → work → review → *compound*) | Enforce behaviors the model skips under pressure | 4 phases, verify-command rule, receipts, `--debug`, paper-complete guard |
| Context-engineering orchestrators | GSD (fresh subagent per phase, `.planning/` durable state), GSTACK (23 role-scoped contexts), Gas Town / Gas City | Never let one window do everything | One task per window, probe/delegate, CONTEXT-BUDGET |
| Agent-native trackers | beads / `bd` (Dolt-backed dependency graph, `bd ready`, "land the plane"), Backlog.md, agent-standup (server-enforced rules), tkr | Tasks need a graph and a queue | PLAN.md grammar, `Blocked by [[ID]]`, planning keys, viz |
| Anthropic harness research | Planner / Generator / **Evaluator** separation; self-evaluation unreliable even on verifiable tasks; re-examine the harness as models improve | External evaluation; subtractive maintenance | Acceptance tick-through — **no external evaluator** |

Claude Code native overlap noted: plan mode ≈ Phase 1, auto-memory ≈
compound step, `/code-review` ≈ evaluator, worktree isolation ≈
WORKTREES.md, scheduled agents / cloud sessions ≈ the `[unattended]`
consumer. "Contract in flowtron, runtime in the runner" ages well against
this.

### Differentiators (things the leaders don't do)

1. Relevance Assessment as a hard gate — nobody else asks "is this still the right work?"
2. Paper-complete guard + 🏁 only with a deliverable-covering SHA.
3. Archive as decision memory + `Superseded by` pointers (compound-by-product).
4. `[model]` tier routing with a mismatch gate.
5. `[unattended]` / `[handoff]` deny-by-default headless markers, with a real consumer (caobunga).
6. Byte budgets enforced in CI.
7. `touches:` scope reconciliation as a recorded fact, not a gate.
8. 1,000+ tasks of dogfooding.

### Gaps (ranked)

1. **Evaluator outside the generator** — the one critical gap. → CORE-656.
2. Push-memory (learnings land where the next session reads unprompted) vs. archive pull-memory. → CORE-658.
3. Ready view (`bd ready`). → FE-124.
4. Optional enforcement-hook examples for adopters (agent-standup's "enforced, not requested"). Deferred — no row.

Deliberately not gaps: TDD-as-iron-law, multi-persona simulation, heavy
upstream spec ceremony, session handoff (already covered).

### Overkill

1. ~72KB of gate prose for two banners; `gate-discipline.md` is a catalog of spring-2026 model failure modes. → CORE-659 / CORE-660.
2. Contract text carrying incident history (nav-chip anecdotes, "why we rejected X"). → CORE-657.
3. `/ft-release` mirror pairs (118KB dir) — root cause is mirror count, not check quality. No row yet.
4. CONTEXT-BUDGET table cells are ~1KB of history each. → CORE-662.
5. Multi-runner sync tax — **not overkill**: Grok is used frequently (operator answer 2026-09-21).
6. `[unattended]` surface — **not overkill**: caobunga reads it and it is critical (same answer).

Verdict: lifecycle core well-balanced and arguably best-in-class for the
solo-markdown niche; meta layer shows accretion because self-hosting has no
subtractive force. → CORE-661 (decay pass).

### Caobunga exposure (checked against `backend/caobunga/flowtron/*`, `close.py`, `brief.py`)

Caobunga parses: task-line grammar, `status:` / `park-reason:`, `## <emoji>
Phase N:` headings + per-phase checkboxes (`phase_progress()`), `## 🎯 Goal`,
`**Final Summary:**` … `**Archived:**`, `**Verdict:** De-scope`, `### Follow-ups?`,
the two skill capability probes, `just test/lint/typecheck`. It reads no SPEC
prose and writes nothing into producers. The phase/Goal headings were not in
`EXTERNAL-AGENTS.md`'s stable table — CORE-655 adds them.

### Not examined this pass (seed list for a wider net)

Products: Kiro (AWS; requirements/design/tasks + steering + hooks), Amp
(threads, handoff), Devin (wiki / Knowledge), Cursor plan mode + rules,
Codex cloud tasks, Google Jules, Copilot agent mode, Cline memory bank,
Aider conventions, Taskmaster AI, claude-flow, OpenAI Symphony (verify it
exists), Tessl, Conductor (Gemini CLI). Trackers: Backlog.md and tkr in
depth. Practices: Karpathy LLM-wiki pattern (already rejected in VISION),
Ralph loop, "boil the lake". Sources to add: GitHub star/commit velocity,
Anthropic plugin-marketplace install counts, primary docs rather than
comparison blogs, and at least one hands-on trial per family.

### Sources

Pulumi (Superpowers/GSD/GSTACK) · The AI Engineer substack (Superpowers vs
GSD vs Compound Engineering) · Reenbit (BMAD vs Spec Kit vs OpenSpec) ·
obra/superpowers README · Anthropic "Harness design for long-running apps"
and "Effective harnesses for long-running agents" · Tekai + Yegge on beads ·
agent-standup README · BSWEN 2026 spec-frameworks comparison · Claude Code
changelog. Comparison blogs, not primary docs — the wider pass should fix
that.
