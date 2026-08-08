---
paths: []
---

# Model field

> Lazy-loaded SPEC module. Loaded by the Step 1.5 model gate of `/ft-task` and `/ft-micro-task`, only on the gate's edge cases (a category tag the active model is under-tier for, a concrete tag that mismatches the active model, or a PLAN line lacking a `[model]` segment). See `SPEC.md` for the always-loaded core spec.

The model assignment lives on the PLAN.md task line — the `[model]` segment
of §"Task-line format". PLAN.md is the source of truth. The token is a short
identifier representing the cognitive load of the task.

Flowtron's recommended primary labels are `[heavy]` (design, multi-file,
high ambiguity, or exploratory work), `[medium]` (multi-step, well-scoped),
and `[light]` (mechanical, well-scoped, clear-diff implementation). Adopters MAY use any short token they prefer
(e.g. `fable`, `opus`, `sonnet`, `haiku`, `gpt-5`, `gemini-pro`, project-specific names).
The visualizer parser accepts any short lowercase token (`[a-z][\w.-]*`), and
`/ft-stats` buckets unknown tokens as `other`.

`/ft-task` reads the model BEFORE scaffolding (see `claude/skills/ft-task/SKILL.md`
Step 1.5). The gate matches a **concrete** tag (`opus`/`sonnet`/`grok`/…) by exact
identity and a **category** tag (`[heavy]`/`[light]`) by *tier* — see
§"Category-vs-concrete matching" below:

- Tag satisfied — concrete tag equals the active model, OR category tag whose
  tier the active model meets or exceeds → proceed silently.
- Concrete tag differs from the active model → block and offer two paths: switch
  the active model via `/model <X>` then re-invoke `/ft-task`, or retag the
  PLAN.md line to the active model and proceed. No silent overrides.
- Category tag tagged heavier than the active model's tier (e.g. `[heavy]` on a
  lower-tier model such as `grok` (medium) or `haiku` (light)) → emit a ⚠️ inline
  advisory note and proceed; the operator decides whether to escalate or keep the
  lighter model. Never a silent block.
- PLAN.md line has no `[model]` (legacy entry) → ask the user via a
  structured ask at `/ft-task` entry, before any scaffolding work.

A task runs end-to-end on a single model — no swapping mid-task between
Discovery, Execution, Testing, or Closure. If scope grows and the tagged
model no longer fits, retag the PLAN.md line and re-invoke; do not silently
swap.

When suggesting a next task, name the recommended model alongside the task
ID — the model is part of the PLAN.md grammar, so it's already known without
asking. Specific model names (`opus`, `sonnet`, `haiku`, `grok`, etc.) remain
fully valid tokens.

## Category-vs-concrete matching

The `[model]` tag is matched against the active model by one of two rules,
depending on whether the tag is a **category** label or a **concrete** name.

**Concrete tag** (`fable`, `opus`, `sonnet`, `grok`, `gpt-5`, `haiku`, …) — matched by
exact identity. The operator filed a specific assignment, so a different concrete
active model is a hard mismatch (block + offer switch-or-retag). Unchanged from
the original gate.

**Category tag** (`[heavy]` / `[light]`) — matched by **tier**, not string. Tiers
form an ordered ladder:

```text
light  <  medium  <  heavy
```

Three tiers. The rule reads the ladder **by position, not by count**, so the
matching logic is identical whether the ladder holds two rungs or three — a
deliberate tier-count-agnostic design. The middle `medium` rung was added in
CORE-259 with zero change to the comparison logic.

Each concrete model has an inherent tier. This is **guidance for the agent to
self-assess at gate time, not a frozen lookup table** — flowtron does not pin a
cross-provider model→tier table that needs maintenance every release. Calibration
baseline:

- **`heavy`** — deep-reasoning, large/long-context models at their default
  (unadjusted) effort setting: Anthropic's current top tier (`fable`, with
  `mythos` as its limited-access sibling), `opus`, and peers; a `medium`-tier
  model dialed up to its highest effort setting can also earn a `heavy`
  verdict — see §"Effort axis" below.
- **`medium`** — capable mid-tier models that handle multi-step, well-scoped work
  reliably without the deep-reasoning / large-context profile that defines
  `heavy`: `sonnet`, `grok`, `codex` (OpenAI's coding-focused reasoning line) at
  its own recommended default effort, and peers. A medium-tier model comfortably
  covers both `[light]` and `[medium]` task work; it gets the ⚠️ under-tier note
  only on a `[heavy]` task. `sonnet` sits at the top of this rung — the Sonnet 5
  generation narrowed the gap to `heavy` substantially on coding and agentic
  work — but stays `medium` deliberately: the ladder labels the *task's*
  cognitive load, not the model's benchmark position, so a `[heavy]` task on
  `sonnet` still earns the advisory and the operator still makes the call.
- **`light`** — fast, small implementation models for mechanical, clear-diff
  work: `haiku`-class and peers.

The match compares the active model's tier against the tag's tier:

| Active vs. tag tier | Gate action |
|---|---|
| equal (`[light]` on light-tier, `[heavy]` on heavy-tier) | proceed silently |
| active **heavier** than tag (`[light]` on a heavy- or medium-tier model) | proceed — overkill is harmless, no flag |
| active **lighter** than tag (`[heavy]` on a lower-tier model, e.g. `grok`) | ⚠️ inline advisory note, then proceed — operator decides whether to escalate; **not** a block |

## Effort axis (orthogonal to model choice)

Vendor APIs now commonly expose a second axis alongside the choice of named
model: a reasoning-*effort* setting (Claude's `low` / `medium` / `high` /
`xhigh` / `max` — the full ladder across the current Claude 5 family, with
`xhigh` the recommended setting for coding and agentic work; Grok's `none` /
`low` / `medium` / `high`; Codex's `none` / `low` / `medium` / `high` /
`xhigh` / `max`, with `minimal` as an even lighter CLI-only rung). This is
orthogonal to the tier
ladder above: the *same* named model can be pushed toward `heavy`-band output
by raising its effort setting, or throttled toward `light`-band output by
lowering it.

Flowtron's tier stays a **cognitive-load label for the task**, not a frozen
model→tier lookup table — a `[heavy]` task is satisfied equally by a big
model at low effort or a small model at high effort, whichever the operator's
session is actually running. The Step 1.5 gate reads the *active model's*
self-assessed tier at gate time (this section); it does not separately read
or require an effort parameter.

Effort level and context-window size are both **session/agent configuration,
not PLAN.md fields**. The `[model]` token stays the bare family name whatever
variant the session runs: a 1M-context Opus session filed against a `[heavy]`
task is still `opus` — there is no `[opus-1m]` or `[opus-xhigh]` token, and a
variant suffix would fragment the `/ft-stats` buckets for no signal gain.
Variants shift where a model lands on the tier ladder (that is the point of
this section); they do not multiply the vocabulary.

The ⚠️ note is an inline advisory only — not an operator-gate banner and not an
approval pause; the standing phase-gate count is unaffected. ⚠️ is not an
operator cue at all: it sits in the **non-cue residual** class
([`SPEC/gates.md` §"Glyph layers and reuse"](gates.md)), so nothing in the cue
vocabulary's emission contract governs it. In particular it is *not* the
emphasized shape 👁️ `CONFIRM` carries — 👁️ is an obligation-bearing ask that
gates task completion, while ⚠️ requires no operator response and stays a plain
inline note.

**No auto-retag.** A satisfied category tag is **never** rewritten to the concrete
running model. `[heavy]` stays `[heavy]` even when it runs on opus — the category
carries the task's cognitive-load signal (feeding `/ft-stats` buckets and
scannable, agent-neutral filing), which a silent rewrite to the run's model would
destroy.

## Practical guidance and agent-aware defaults

The labels exist to let the operator (and the agent) match the *cognitive shape*
of the work to the model's "thinking budget" for that turn. They are
observations from real usage, not rigid policy.

**Typical `[light]` work** (start here by default for most flowtron tasks):

- Single-file edits, small refactors with a clear local pattern, adding tests
  or assertions, doc patches, config tweaks, simple bug fixes with obvious
  root cause.

**Typical `[medium]` work** (the common middle of flowtron development):

- Multi-step but well-scoped changes with a clear shape: a feature spanning two
  or three known files, a refactor with a discoverable pattern, a bug fix whose
  root cause needs a little tracing. More than a clear-diff mechanical edit, but
  not deep cross-module synthesis or high-ambiguity design.
- Capable mid-tier models (`sonnet`, `grok`) sit here and cover both `[light]`
  and `[medium]` task work comfortably. Current Grok 4.x usage (2026-05): the
  large majority of routine development and well-scoped multi-step flows stay
  effective and low-drift across this band.

**When to choose `[heavy]`** (even on agents that otherwise favor light):

- Design decisions, high ambiguity, exploratory research that may re-scope
  mid-Discovery, new skills or epic children, anything requiring synthesis
  across distant modules or contract surfaces, multi-file coordination
  without an obvious precedent.
- Rule of thumb: if Phase 1 Discovery surfaces "this is more than a clear-diff
  implementation or has hidden cross-cutting concerns," escalate the tag on
  the PLAN line and re-invoke rather than pushing a light model past its
  useful horizon.

**Cross-provider calibration** (real capability differences exist):

- Different agents have different cost/quality curves on long context and
  sustained reasoning. Some Claude Opus sessions benefit from `[heavy]` on
  extended explorations where context retention across many turns matters;
  current Grok stays crisp and reliable across `[light]`/`[medium]` for the
  majority of well-scoped implementation even when the initial description
  sounds moderately complex.
- The model edge case exercised at the very start of *this* task (PLAN.md
  tagged `[sonnet]`, active assistant Grok 4.3 → user chose retag to `[grok]`)
  is a live demonstration of the Step 1.5 mismatch gate working as intended
  across providers.
- When in doubt, start with the label that matches the *actual cognitive
  shape* surfaced in Discovery. Escalate only when the work proves heavier
  than the filing description suggested.

The primary labels `[heavy]` / `[medium]` / `[light]` are the recommended
starting vocabulary for new filers and for keeping PLAN.md scannable. Specific
names are the precision escape hatch when you have a strong observed preference
for a particular agent on a particular class of task.

## Tier ladder vs. the next-move suggestion glyph

The three-rung tier ladder governs the **Step 1.5 gate**. The **next-move
suggestion glyph** (🔧 `LIGHT` / 🧩 `MEDIUM` / 🧠 `HEAVY`) in the post-closure
protocol (SPEC.md cue glossary + `SPEC/gates.md`) **mirrors that ladder 1:1**:
`[light]`→🔧, `[medium]`→🧩, `[heavy]`→🧠. Concrete `[model]` tokens bucket to
their inherent tier's glyph (e.g. `sonnet`/`grok`→🧩, `opus`/`fable`→🧠,
`haiku`→🔧). The glyph stays a coarse design↔mechanical fast-scan hint — three
values, not two.

**History.** The glyph set was deliberately **binary** (🔧/🧠) through CORE-254,
which locked the cue vocabulary at two next-task values; a `[medium]` candidate
took the *nearer* glyph. CORE-353.3 reverses that lock and adds the third
`[medium]` glyph — a one-glyph widening in the same spirit as CORE-308's 👇
`HERE` addition — so the suggestion cue and the gate ladder share the same three
rungs. Aligning the two just removes the medium-collapses-to-nearest special
case; it does not turn the coarse hint into a second copy of the gate.
