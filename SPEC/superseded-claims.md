---
paths: []
---

# Superseded claims — the write-once factual-corrections carve-out

> Lazy-loaded SPEC module. Read when a task proves a **factual** claim in an already-archived tasknote false — surfaced at the Phase 1 archive skim, written at Phase 4 closure. Most closures falsify nothing and never load this. The write-once policy it carves out of lives in `SPEC.md` §"Tasknote frontmatter". See `SPEC.md` for the always-loaded core spec.

**Write-once does not cover factual corrections.** The policy protects the
record of what was *believed*, not the accuracy of the claim. When a later task
proves a **factual** claim in an archived tasknote false — something untrue
about the repo at the time that note was written — the falsifying task appends
a single pointer directly under the corrected note's nav header:

```markdown
> **⚠️ Superseded by [[<TASK-ID>]]** — <one line naming what was falsified>
```

**Append-only.** Never rewrite, delete, or soften the original text. The
falsified claim stays readable, because a historical record that quietly agrees
with the present is not a record. One blockquote, written by the *falsifying*
task at its own Phase 4 closure ([`SPEC.md`](../SPEC.md) §"🚀 Phase 4: Closure")
and staged in the same
atomic commit — never by a third party tidying the archive later. The corrected
note's `related-tasks:` is deliberately left alone; the wikilink already carries
the edge.

**Scope is narrow, and deliberately so.** Three neighbouring cases are *not*
covered:

- **A superseded decision.** CORE-159 overturned CORE-157's exclusion of
  `docs/PLATFORMS.md`; CORE-157 remains an accurate record of what was decided
  then. Decisions changing is the system working, not a defect. Record the
  overturn on the *later* note with omit-when-absent YAML `supersedes:` (see [`SPEC.md`](../SPEC.md)
  §"Tasknote frontmatter" → Optional planning keys) — never by writing `superseded-by:` onto the
  old note, and never via this ⚠️ pointer.
- **Spec evolution.** The case the write-once policy opens with — conventions move, legacy
  archives stay as-is.
- **Bulk backfill.** Reaching across many archived notes to normalize them
  against a later rule remains an explicit operator decision, not something this
  carve-out permits. CORE-381's 359-file `status:` backfill is the precedent,
  and its own note records it as an operator override rather than a policy
  allowance.

**Never park a durable correction in a PLAN.md long description.** Phase 4
collapses that line to a `Completed YYYY-MM-DD.` stub and the description drops
([`SPEC/plan-filing.md`](plan-filing.md) §"`## Completed`
archive convention"), so a correction left there is deleted on a schedule. This
is why the carve-out exists: CORE-416.2 falsified CORE-416.1's headline,
honoured write-once, and recorded that "this note and the parent line carry the
correction" — the epic close deleted the parent line two commits later.
