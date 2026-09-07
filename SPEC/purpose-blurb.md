---
paths: []
---

# 🎯 Purpose blurb

> Lazy-loaded SPEC module. Read when questioning, changing, or extending the blurb — its bounds, which invocations emit it, and why it is not a cue. The *emission recipe* lives in the three ID-invoked runner skills (`/ft-task`, `/ft-micro-task`, `/ft-goal-task`), which cite this module rather than restating it. See `SPEC.md` for the always-loaded core spec.

## 🎯 Purpose blurb

A task-runner skill invoked with a bare task ID — `/ft-task CORE-504` — is
normally the operator's *first* message after a `/clear`. The runner then works
through a model gate, pre-flight checks, and a tasknote write before any phase
work begins, and everything the operator sees across that stretch is tool
calls. The `🎯 Goal` written into the tasknote is a **file** write, not an
operator-facing one; a file the operator has not opened states nothing to them.
And any of those pre-phase checks can *end* the run — a model mismatch, foreign
dirt in the tree, an archive collision, a tasknote already in flight — leaving
an operator who never learned what the task was.

So the runner emits a short plain-English statement of what the task is at the
**earliest point it can**: immediately after the `PLAN.md` task line is
captured, before the model gate, before the pre-flight checks, and before any
scaffold write.

```text
🎯 CORE-504 — scaffold-purpose-blurb
Adds a short plain-English statement of what a task is, emitted as soon as the
PLAN.md line is read, so an operator invoking cold after a /clear gets an
immediate read — even on a run that stops before Phase 1.
```

Two lines: the ID and shortname, then 1-2 sentences of purpose drawn from the
`PLAN.md` long description. Prose, not a checklist — this is the read the
operator would otherwise have to reconstruct by opening the tasknote. The
`PLAN.md` line is the *only* source, because it is the only thing read yet;
the `🎯 Goal` is derived from that same line at scaffold, so nothing is lost by
speaking first and filing second.

**Which invocations.** The three **ID-invoked runners** — `/ft-task`,
`/ft-micro-task`, `/ft-goal-task` — once each, at that one point. It precedes
the fresh-scaffold / starter-promotion / blocked-resume branch entirely, so
there is no per-path variant to keep in sync: whichever path the run later
takes, the operator has already been oriented. Where an opening path holds
state the blurb could not know — the `park-reason:` a resume is clearing, a
goal loop's `loop-max` budget — that path states it as ordinary prose when it
reads it. Those are not a second blurb.

`/ft-epic-discovery` and `/ft-close-epic` are **out of scope, deliberately**.
Both are invoked in-session with the scoping conversation still live, so a
blurb there restates what the operator said a moment ago. The test is whether
the invocation could arrive cold with nothing but an ID — which is what
separates these two from the three above.

**Bounds — this is not a cue and not a gate.** It bears no obligation, accepts
no reply, and blocks nothing; the runner emits it and continues in the same
turn. It adds no row to the operator-cue tables
([`SPEC/cue-vocabulary.md`](cue-vocabulary.md) §"Operator-cue vocabulary"), no checklist box,
and no phase. The CORE-065 two-banner cap is **untouched** — 🛠️ and 📦 remain
the only standing banners. `🎯` is not a new glyph: it is the `## 🎯 Goal`
heading glyph reused on the conversational layer, where it names the same
thing, recorded in [`SPEC/cue-vocabulary.md`](cue-vocabulary.md) §"Glyph layers and reuse".
Reading this section as license for a third gate inverts its purpose — the
blurb exists to spend *less* of the operator's attention, not more.

**`--fast` and `--unattended` do not suppress it.** Neither flag touches the
blurb: `--fast` suppresses *asks*, and there is nothing here to answer. Under
`--unattended` it costs an operator-less run two lines of transcript, which is
the cheapest orientation a later reader of that transcript can get.
