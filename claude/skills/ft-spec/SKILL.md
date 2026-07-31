---
name: ft-spec
description: Draft a lightweight, review-first design spec (fixed section order — Goal · Requirements · Design · Tasks · Risks/Open Q · Validation Approach) from a brief or conversation context, surface it for operator review, and optionally write it to .flowtron/specs/<slug>.md. Use when the user asks to draft a design spec before filing tasks. Planning peer — never files PLAN entries or tasknotes. Invoke with an optional brief/topic as args (e.g., args="offline sync") plus optional --fast. Interactive by default; --fast skips the review pause but never auto-writes PLAN/tasknotes.
---

# ft-spec — flowtron spec drafter

You are drafting a **design spec** from a brief and/or the current
conversation, surfacing it for operator review, and — only on the operator's
go — optionally writing it to `.flowtron/specs/<slug>.md`.

`/ft-spec` is a **planning peer**, not a task driver. It sits alongside
`/ft-starter-task` and `/ft-epic-discovery`: it produces a reviewable
artifact and stops. It **never** files a PLAN.md line, scaffolds a tasknote,
or commits — those conversions stay operator-driven. A spec is **optional**:
it is never required before `/ft-task` or `/ft-epic-discovery`.

Treat `<root>SPEC.md` and the lazy modules under `<root>SPEC/` as
authoritative when this skill is silent or in tension. Keep every artifact
aligned with `docs/PHILOSOPHY.md` / `docs/VISION.md`: zero scripts, no new
lifecycle phase, no schema/validator, no hooks or daemons, optional over
mandatory, operator review over autonomy.

## Step 0 — Resolve paths

Two layouts. Pick by which file exists:

- **Adopter project:** `.flowtron/core/SPEC.md` exists → `<root>` = `.flowtron/core/`.
- **Flowtron self-host:** repo-root `SPEC.md` with heading `# Flowtron — Workflow Specification` → `<root>` = repo-root.

If neither matches, bail.

Paths: SPEC=`<root>SPEC.md`, SPEC_DIR=`<root>SPEC/`, spec template=`<root>templates/spec-template.md`, specs dir=`.flowtron/specs/` (project-owned, created lazily on first write).

## Step 1 — Parse args

Split `args` on whitespace. Tokens:

- **`--fast` or `-f`** → set `fast-mode = true` (skips the Step 4 review pause; see there). Emit one inline marker: `⚡ --fast active — review pause suppressed; spec still writes only to .flowtron/specs/ (never PLAN/tasknotes).`
- **Any other token(s)** → join as the free-text **brief/topic** hint carried into Step 2.

`--fast` is operator-side opt-in for autonomous drafting; it never widens what
`/ft-spec` writes. PLAN entries and tasknotes are out of scope in every mode.

## Step 2 — Gather the design brief

Assemble the design intent from, in order of preference:

1. The `args` brief/topic hint (Step 1), if present.
2. The current conversation — a design discussion, an epic brief, a problem
   statement the user has been working through.

If neither yields enough to draft a genuine spec (goal + at least a rough
sense of requirements), ask **one** short question for the brief before
drafting. Do not invent a design the user hasn't gestured at.

`/ft-spec` assumes the thinking has mostly happened in-conversation — it
**captures and structures** a design, it does not perform the design from
scratch. If there's nothing to structure yet, say so and stop.

## Step 3 — Draft the spec

Read the spec template (path from Step 0) and fill its six fixed sections in
order:

**🎯 Goal · 📋 Requirements · 🧭 Design · 🧩 Tasks · ⚠️ Risks / Open Questions · ✅ Validation Approach**

- Keep the section order and headings exactly as the template ships — the
  fixed order is the point (specs read the same across a project).
- Drop a section's body to a single line when there's little to say, but keep
  the heading.
- **🧩 Tasks** — propose a decomposition into Flowtron work types (epic / task
  / starter / micro / sidequest), each with a one-line scope and the handoff
  skill to run. These are *suggestions*: the spec names them; the operator
  converts them by running the named skill. Never file any of them here.
- **✅ Validation Approach** — prose engineering guidance (targeted tests,
  property-based tests where the input space is wide, manual/visual
  confirmation for UI). Frame it as folding into each resulting task's Phase 3
  — never as a new lifecycle phase or a schema/validator.
- Fill frontmatter: `title:` (concise), `slug:` (kebab-case, derived from the
  title), `status: draft`, `created:` = today's date (`YYYY-MM-DD`),
  `related-tasks:` = wikilinks to any epic/task the conversation cited (else `[]`).

## Step 4 — Review gate

**Default (`fast-mode = false`):** surface the full drafted spec inline and
ask the operator two things before writing anything:

- Does the draft look right (edits welcome)?
- Write it to `.flowtron/specs/<slug>.md`, or leave it in the conversation
  only? Offer the proposed slug; the operator may override it. A slug override
  updates **both** the write filename and the frontmatter `slug:` field so the
  two never diverge.

Wait for the operator's go. Apply any requested edits, then continue to Step 5
only if they chose to write.

**`fast-mode = true`:** skip the review pause — proceed directly to Step 5 and
write to `.flowtron/specs/<slug>.md`. Still surface the final draft in the
handoff so the operator sees what landed. `--fast` never authorizes a PLAN or
tasknote write.

## Step 5 — Optional write

Only when the operator chose to write (or `fast-mode = true`):

- Create the specs dir if it does not exist: `mkdir -p .flowtron/specs`.
- Write the filled draft to `.flowtron/specs/<slug>.md`.

`.flowtron/specs/` is an **optional operator scratchpad** for design specs —
not a parallel PLAN, not a required subsystem, not something other skills read
or depend on. If the operator declined the write, skip this step entirely;
the spec lives in the conversation only.

## Step 6 — Hand off

In one short message:

- Where the spec landed (`.flowtron/specs/<slug>.md`) — or that it stayed in
  the conversation only.
- Point at the **🧩 Tasks** section as the actionable next step, and name the
  conversion skills the operator runs to file that work: `/ft-epic-discovery`
  (epics), `/ft-starter-task` (rich-context filings), `/ft-task` /
  `/ft-micro-task` (single tasks), `/ft-sidequest` (park an idea). `/ft-spec`
  files none of these — the operator drives the conversion.
- Note the spec is living markdown: edit `.flowtron/specs/<slug>.md` in place
  as the design evolves; there's no version machine to maintain.

Do **not** commit unprompted. If the operator asks for a commit, the message
format is `docs: add <slug> spec` (or `docs: update <slug> spec`).

## Notes

- **Planning peer, not a driver.** `/ft-spec` produces an artifact and stops.
  It never files PLAN lines or tasknotes and never becomes a required step —
  that would violate the optional-over-mandatory and operator-review
  constraints in `docs/PHILOSOPHY.md` / `docs/VISION.md`.
- **No new lifecycle phase, no validator.** The spec's Validation Approach is
  engineering *guidance* that folds into each task's Phase 3, not a "Validation
  Gate" and not a schema checker (VISION §"What we won't accept").
- **Routing:** reach for `/ft-spec` when a design has been worked out in
  conversation and is worth capturing before it's decomposed into tasks. For
  filing a single not-yet-ready task with rich context, use `/ft-starter-task`.
  For opening an epic directly, use `/ft-epic-discovery`. For starting an
  existing task, use `/ft-task`. A one-liner idea needs neither a spec nor a
  starter — write the PLAN.md line directly.
