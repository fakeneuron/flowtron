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
and `[light]` (mechanical, well-scoped, clear-diff implementation). A fourth,
**manual-only** rung — `[xheavy]`, glyph 🔭 — sits above `heavy` for
operator-driven exploratory work; it is deliberately **not** a primary filing
label, and automated choosers cap at `[heavy]` (see §"Category-vs-concrete
matching"). Adopters MAY use any short token they prefer
(e.g. `fable`, `opus`, `sonnet`, `haiku`, `grok`, `codex`, `gpt-5`, `gemini-pro`, project-specific names).
The visualizer parser accepts any short lowercase token (`[a-z][\w.-]*`), and
`/ft-stats` buckets unknown tokens as `other`.

`/ft-task` reads the model BEFORE scaffolding (see `claude/skills/ft-task/SKILL.md`
Step 1.5). The gate matches a **concrete** tag (`opus`/`sonnet`/`grok`/…) by exact
identity and a **category** tag (`[xheavy]`/`[heavy]`/`[medium]`/`[light]`) by *tier* — see
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

**Category tag** (`[xheavy]` / `[heavy]` / `[medium]` / `[light]`) — matched by
**tier**, not string. Tiers form an ordered ladder:

```text
light  <  medium  <  heavy  <  xheavy
```

Four tiers. The rule reads the ladder **by position, not by count**, so the
matching logic is identical whether the ladder holds two rungs or four — a
deliberate tier-count-agnostic design. The middle `medium` rung was added in
CORE-259, and the top `xheavy` rung in CORE-482.3, each with zero change to
the comparison logic.

**The `xheavy` rung is manual-only.** `[xheavy]` marks open-ended exploratory
work — multi-session research, greenfield architecture, high-uncertainty
design — that an operator drives by hand. Two properties follow:

- **Automated choosers cap at `[heavy]`.** An orchestrator or any other
  automated chooser must never assign `[xheavy]` to a task nor pick up an
  `[xheavy]`-tagged one; the tag is the operator's deliberate opt-in. This is
  prose contract, not gate machinery — no lock, no park, per
  [`docs/VISION.md`](../docs/VISION.md) §"What we won't accept".
- **No roster model self-assesses at the `xheavy` band by default.** The rung
  labels the *task's* cognitive load, above what any default-effort
  configuration in the §"Platform×model×effort calibration table" bands at. An
  `[xheavy]` tag therefore always lands the gate's ⚠️ under-tier advisory —
  note-then-proceed, never a block — which is expected, not an error: the note
  marks the deliberate entry into exploratory territory, and the operator (who
  is present by definition) decides how to run it.

Each concrete model has an inherent tier. This remains **guidance for the agent
to self-assess at gate time** — the gate never requires a lookup. A maintained
cross-provider reference now backs that self-assessment: see
§"Platform×model×effort calibration table" below, refreshed at releases.
Calibration baseline:

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
| tag is `[xheavy]` (any active model) | **always** the ⚠️ inline advisory — no roster model bands at `xheavy` by default, so the tag is above every active tier; note-then-proceed, expected rather than exceptional (see "The `xheavy` rung is manual-only" above) |

## Effort axis (orthogonal to model choice)

Vendor APIs now commonly expose a second axis alongside the choice of named
model: a reasoning-*effort* setting (Claude's `low` / `medium` / `high` /
`xhigh` / `max` — the full ladder across the current Claude 5 family, with
`xhigh` the recommended setting for coding and agentic work; Grok's `low` /
`medium` / `high` / `xhigh` — the `xhigh` rung arrived with Grok 4.6, and
earlier 4.x silently treat it as `high`; Codex's `none` / `low` / `medium` /
`high` / `xhigh` / `max`, with `minimal` as an even lighter CLI-only rung).
This is orthogonal to the tier
ladder above: the *same* named model can be pushed toward `heavy`-band output
by raising its effort setting, or throttled toward `light`-band output by
lowering it.

Flowtron's tier stays a **cognitive-load label for the task** — a `[heavy]`
task is satisfied equally by a big model at low effort or a small model at
high effort, whichever the operator's session is actually running. The
§"Platform×model×effort calibration table" below is the maintained reference
for where those combinations land. The Step 1.5 gate reads the *active model's*
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

## Platform×model×effort calibration table

The tier bands above are calibrated against real vendor rosters. This table is
the **maintained cross-provider reference** — refreshed at releases (the
release cut's `/ft-audit docs` subroutine surfaces a stale table via the
dated as-of stamp below) and stamped with its as-of date. It exists so any chooser — the operator, or an automated orchestrator
picking a model for a tagged task — can map "what is this session actually
running, at what effort" to a tier band without guessing. It *calibrates* the
Step 1.5 self-assessment; it never replaces it, and the gate still requires no
lookup. Rows stay family-level tokens per §"Effort axis" — the `@effort`
notation below is prose shorthand for "this family at that effort setting",
never a PLAN.md token shape.

Maintaining this table supersedes CORE-353.2's no-maintained-table decision
(recorded on the superseding tasknote): the un-tabled version of the same
knowledge kept going stale as scattered prose; one dated table is cheaper to
keep honest.

**As of 2026-08-27:**

| Platform | Token | Current roster (top of family) | Effort ladder | Band at default effort | Effort-shifted equivalences |
|---|---|---|---|---|---|
| Anthropic | `fable` | Fable 5 (`mythos` limited-access sibling) | `low`/`medium`/`high`/`xhigh`/`max` (default `high`; `xhigh` recommended for coding/agentic) | heavy | heavy-band at every effort — `fable@low` often still exceeds prior-generation `xhigh` |
| Anthropic | `opus` | Opus 5 (4.8 / 4.7 supported prior) | `low`/`medium`/`high`/`xhigh`/`max` | heavy | `opus@low` ≈ medium-band throughput work |
| Anthropic | `sonnet` | Sonnet 5 | `low`/`medium`/`high`/`xhigh`/`max` | medium | `sonnet@xhigh` ≈ heavy-band |
| Anthropic | `haiku` | Haiku 4.5 | no effort parameter | light | — |
| OpenAI | `gpt-5` | GPT-5.5 flagship · GPT-5.4 workhorse (+ mini / nano) | per-model thinking tiers (Pro / Extended variants think longest) | heavy (5.5 / Pro) · medium (5.4) · light (mini / nano) | `gpt-5.4@extended` ≈ heavy-band |
| OpenAI | `codex` | GPT-5.3 Codex (coding/agentic line) | `none`/`low`/`medium`/`high`/`xhigh`/`max` (+ CLI-only `minimal`) | medium at its recommended default | `codex@xhigh`–`@max` ≈ heavy-band |
| xAI | `grok` | Grok 4.6 (`grok-build` coding sibling) | `low`/`medium`/`high` (default) /`xhigh` (4.6+; earlier 4.x treat `xhigh` as `high`) | medium | `grok@xhigh` ≈ heavy-band |
| Google | `gemini-pro` | Gemini 3.1 Pro (Deep Think variant above it) | `thinking_level` `low`/`high` | heavy | `gemini-pro@low` ≈ medium-band |
| Google | `gemini-flash` | Gemini 3.7 Flash (Flash-Lite below it) | `thinking_level` `low`/`high` | medium (Flash) · light (Flash-Lite) | `gemini-flash@high` ≈ upper medium-band |

A row's "band at default effort" is what the Step 1.5 gate should read for
that family absent other signal; the equivalences column is the effort axis in
action — the same token earning a different band when the session runs it at a
non-default effort setting.

## Practical guidance and agent-aware defaults

The labels exist to let the operator (and the agent) match the *cognitive shape*
of the work to the model's "thinking budget" for that turn. They are
observations from real usage, not rigid policy — with one standing bias:

**The round-up default.** `[medium]` is the default tag for a new filing.
Escalate freely to `[heavy]` on any ambiguity or design smell; reserve
`[light]` for work that is **provably mechanical** — a clear diff already in
mind, no judgment calls left. **When in doubt, round up.** This rule binds
automated choosers especially: an under-powered pick wastes a whole session
before anyone notices, while an over-powered one merely costs a little
headroom — the asymmetry is the argument. (This flips the pre-CORE-482
"start `[light]` by default" bias, which calibrated against an older,
weaker-model era of the roster.)

**Typical `[light]` work** (only when provably mechanical — clear diff in mind):

- Single-file edits, small refactors with a clear local pattern, adding tests
  or assertions, doc patches, config tweaks, simple bug fixes with obvious
  root cause.

**Typical `[medium]` work** (the default — the common middle of flowtron development):

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

**When to choose `[xheavy]`** (manual-only — never a default):

- Open-ended exploratory sessions the operator drives by hand: multi-session
  research, greenfield architecture with no precedent, design work whose
  scope is genuinely unknown at filing time. Filed deliberately by the
  operator, never by an automated chooser (which caps at `[heavy]`), and
  never reached by rounding up — round-up stops at `[heavy]`.

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
- When in doubt, round up (the standing bias above). Match the label to the
  *actual cognitive shape* surfaced in Discovery, and resolve any residual
  uncertainty toward the heavier tag rather than the lighter one.

The primary labels `[heavy]` / `[medium]` / `[light]` are the recommended
starting vocabulary for new filers and for keeping PLAN.md scannable. Specific
names are the precision escape hatch when you have a strong observed preference
for a particular agent on a particular class of task.

## Tier ladder vs. the next-move suggestion glyph

The four-rung tier ladder governs the **Step 1.5 gate**. The **next-move
suggestion glyph** (🔧 `LIGHT` / 🧩 `MEDIUM` / 🧠 `HEAVY` / 🔭 `XHEAVY`) in the
post-closure protocol (SPEC.md cue glossary + `SPEC/gates.md`) **mirrors that
ladder 1:1**: `[light]`→🔧, `[medium]`→🧩, `[heavy]`→🧠, `[xheavy]`→🔭. Concrete
`[model]` tokens bucket to their inherent tier's glyph (e.g. `sonnet`/`grok`→🧩,
`opus`/`fable`→🧠, `haiku`→🔧) — no concrete token buckets to 🔭, since no
roster model is inherently `xheavy`-band (§"Category-vs-concrete matching").
The glyph stays a coarse design↔mechanical fast-scan hint — four values, not
two.

**History.** The glyph set was deliberately **binary** (🔧/🧠) through CORE-254,
which locked the cue vocabulary at two next-task values; a `[medium]` candidate
took the *nearer* glyph. CORE-353.3 reverses that lock and adds the third
`[medium]` glyph — a one-glyph widening in the same spirit as CORE-308's 👇
`HERE` addition — so the suggestion cue and the gate ladder share the same
rungs. CORE-482.3 adds the fourth, 🔭 for the manual-only `[xheavy]` rung, by
the same one-glyph-widening precedent. Aligning the two just removes the
medium-collapses-to-nearest special case; it does not turn the coarse hint
into a second copy of the gate.
