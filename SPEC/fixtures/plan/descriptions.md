# Fixture — long-description conventions

The reserved `[[TASK-ID]]` and `Blocked by [[ID]]` forms from
`SPEC/plan-parser.md` §"Long-description conventions", the non-parsing
near-misses, code-span masking, and the presentation cleaning the reference
parser applies to `description`.

## High

- [ ] **FX-300** [light] | one wikilink — Builds on [[FX-001]].
- [ ] **FX-301** [light] | several wikilinks — Touches [[FX-001]], [[FX-002]], and [[FX-001]] again; deduped in source order.
- [ ] **FX-302** [light] | epic and child links — See [[FX-EPIC-011]] and [[FX-011.N]].
- [ ] **FX-303** [light] | near-miss links — See [[FX-150.3a]] and [[FX-150.2.1]].
- [ ] **FX-310** [light] | one blocker — Blocked by [[FX-001]].
- [ ] **FX-311** [light] | several blockers — Blocked by [[FX-001]], [[FX-002]] — needs both.
- [ ] **FX-312** [light] | blocker and related — Pairs with [[FX-003]]. Blocked by [[FX-001]].
- [ ] **FX-313** [light] | blocker wins — Touches [[FX-001]]. Blocked by [[FX-001]].
- [ ] **FX-314** [light] | two blocked-by clauses — Blocked by [[FX-001]]. Also Blocked by [[FX-002]].
- [ ] **FX-320** [light] | bare id — Blocked by: FX-001 does not parse as a blocker.
- [ ] **FX-321** [light] | blocked on — Blocked on [[FX-001]] is a related link, not a blocker.
- [ ] **FX-322** [light] | depends on — Depends on [[FX-001]] is a related link, not a blocker.
- [ ] **FX-323** [light] | lowercase — blocked by [[FX-001]] is case-sensitive; related only.
- [ ] **FX-330** [light] | code span — Use `[[FX-001]]` literally; `Blocked by [[FX-002]]` is quoted too.
- [ ] **FX-331** [light] | mixed spans — Real [[FX-001]] beside quoted `[[FX-002]]`.
- [ ] **FX-340** [light] | bold in prose — This **must** ship before the **next** cut.
- [ ] **FX-341** [light] | double spaces — Two  spaces   collapse to one.
- [ ] **FX-342** [light] | no wikilinks — Plain prose leaves both arrays empty.

## Completed

- [x] **FX-350** [light] | stamp only — Completed 2026-09-08.
- [x] **FX-351** [light] | stamp first — Completed 2026-09-09. Follow-up filed as [[FX-300]].
- [x] **FX-352** [light] | stamp mid-sentence — Completed 2026-09-10 ahead of the cut.
- [x] **FX-353** [light] | no stamp — Closed without a completion stamp.
