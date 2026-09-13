---
paths: []
---

# `[unattended]` candidacy

> Lazy-loaded SPEC module. Read by a filing surface at its write step — the moment it is about to write a `- [ ]` row into `PLAN.md` — and by a runner whose closure discharged a deferred step through `/ft-file-followup --unattended`. Not needed to run a task. See `SPEC.md` for the always-loaded core spec.

The `[unattended]` marker ([`SPEC.md`](../SPEC.md) §"Task-line format") is
scarce for an accidental reason: nothing in the filing flow ever asks whether
a row qualifies. Every filer writes rows at the point of fullest context — it
has just read the surrounding code, drafted the description, and chosen the
`[model]` tag — and then discards the one judgment an operator-less caller
will later need. This module makes each filer **propose** candidates as part
of its ordinary pass, without changing who writes the token.

## Recommend, never write

**Flowtron itself never writes `[unattended]` — seeding is an operator act.**
That sentence is [`SPEC.md`](../SPEC.md) §"Task-line format"'s and CORE-494's,
and this module preserves it verbatim. Candidacy is a *recommendation*: the
filer names the rows the predicate below admits, and the token lands on a row
only when the operator confirms that row **inside the confirm gate the surface
already has** — the structured-ask write-step review, the prose "show the
line, edit per feedback" gate, the reconcile review prompt. The confirmation
is the act. No surface gains a new gate to host the proposal; a surface with
no gate (`/ft-file-followup --park`) has no candidacy at all.

Three consequences follow, and each is a boundary rather than a feature:

- **A posture with no operator act writes nothing.** `--fast` skips the
  review that would have been the act; `--unattended` declares there is nobody
  to perform it. Both *emit* the candidates and write no token (§"Three
  postures"). A caller that files rows cannot mark its own
  ([`docs/EXTERNAL-AGENTS.md`](../docs/EXTERNAL-AGENTS.md) step 2) — this
  module is how the caller learns which rows the operator might mark, not a
  way around that rule.
- **No autonomy chain.** A row proposed under `--unattended` stays unmarked
  until an operator confirms it in an attended session. Readers keep denying
  by default; an unmarked row is still undecided, not approved.
- **Not a cue, not a gate.** The proposal rides an existing ask and the
  emission line is a report. Neither adds a row to
  [`SPEC/cue-vocabulary.md`](cue-vocabulary.md), a checklist box, a banner,
  or a phase. The CORE-065 two-banner cap is untouched.

## Candidacy predicate

Evaluated over the **drafted row text** — the exact `- [ ]` line the filer is
about to write — plus, for epic children, the closure state of the sibling
row it follows. Every clause must hold; the first miss disqualifies the row.
The predicate is deliberately conservative: a false negative leaves a row
undecided, which is the status quo, while a false positive is exactly what
the operator's confirm exists to catch — so when a clause is uncertain, the
row is **not** a candidate.

1. **`[model]` is `[light]` or `[medium]`.** `[heavy]` and a missing tag both
   fail. Heavy work is design or ambiguity work, and a row with no model
   declared has not been scoped enough to be dispatched blind.
2. **Not `[!critical]`.** The urgency flag exists to pull an operator's eye to
   the row, which is the opposite of "safe with nobody present."
3. **No operator hand-off signal in the description.** Any of the cue glyphs
   `👁️` `🗄️` `▶️` `📡` `💻` `✋`, or any of the words *operator*, *hand-off* /
   *handoff*, *manual*, *credential*, *secret*, *password*, *physical*,
   *cross-repo*, *production*, *deploy*, *migration*. The list is a keyword
   screen, not a semantic judgment — a row that reads as needing a person but
   trips no keyword is still declined under the conservative default.
4. **No `Blocked by` clause of any form** — `Blocked by [[ID]]`, bare `Blocked
   by`, or a `blocked-by:` echo. A blocked row is by construction waiting on
   something outside itself.
5. **Not a parent `<AREA>-EPIC-<N>` row.** The parent is a checkbox with no
   tasknote and no runner; only children are driven.
6. **Epic-child rule.** A `.1` Discovery row is never a candidate — it is a
   scoping conversation, and `[heavy]` by convention. A `.N` audit row
   qualifies only when clauses 1–4 admit it (`/ft-close-epic` accepts
   `--unattended`, so an audit tagged `[light]` or `[medium]` is coherent). Any
   other `.k` row qualifies only when the sibling it follows — its stem
   predecessor per the `.1`'s `## 🌳 Fan-out`, or `.k-1` when undeclared — is
   either already `- [x]` or is being proposed in the **same pass with the
   same candidacy**. A candidate cannot be the first open row in a sequential
   chain whose head is not one.

Three filers carry their own carve-outs on top: `/ft-audit`'s trivial-fix rows
(written and closed in one motion — nothing to dispatch), `/ft-epic-discovery`
Step 4's parent + `.1` lines (clauses 5–6 by construction), and the epic
parents and `.N` placeholders `/ft-audit-repo` files at first contact.

## Three postures

A filer runs the predicate once, over every row it is about to write, and
then takes exactly one of these three branches. Which branch is fixed by the
invocation, never by the number of candidates.

**Attended (default).** The candidates are shown **inside the surface's
existing confirm gate**, alongside the rows themselves — each candidate row
displayed with the proposed token in place (`[light]🔧 [unattended]`) and the
clause-6 predecessor named where it applies. The operator's confirmation of
the write is the act: the token is written only on rows the operator
confirmed, and lands after `[model]` and any model-suggestion glyph, per
[`SPEC.md`](../SPEC.md) §"Task-line format" and the position footgun in
[`SPEC/plan-parser.md`](plan-parser.md). A surface whose gate is a prose
review (not a structured ask) does the same in prose: it shows the line
with the token and writes it only if the operator's edit or assent keeps it.

**`--fast`.** The review pause that would have carried the proposal is
skipped, so there is no act. The filer writes every row **without** the
token and emits, on its own line in the same turn as the write report:

```text
unattended-candidates: CORE-581, CORE-582.3
```

Bare IDs, comma-separated, in PLAN order; `unattended-candidates: none` when
the predicate admitted nothing. The line always emits under this posture, so
a later reader can tell "ran, found none" from "never ran." It is a report —
no reply, no gate.

**`--unattended`.** Identical to `--fast`: the same line, zero tokens written.
On top of it, the line persists (§"Persistence") because an operator-less run
has no operator watching the transcript.

The two flagged postures degrade *identically* by design — the proposal never
becomes a write on either, and the difference between them is only where the
line is recorded. A surface that accepts neither flag has only the attended
branch.

## Persistence

A terminal line is not durable ([`SPEC.md`](../SPEC.md) §"🚀 Phase 4:
Closure" → "Handoff persistence"), so under `--unattended` the
`unattended-candidates:` line is written down at the one place the run
already persists:

- **A runner closure that discharged deferred steps through
  `/ft-file-followup --unattended`** (`SPEC.md` §"Deferred hand-off filing";
  `SPEC/plan-filing.md` §"Unattended filing authority") copies the line
  from the filing report into its own tasknote's **Final Summary** before the
  archive move — a pre-archive closure write, not a retroactive edit. The
  resuming operator finds it where they find the deferred rows.
- **A standalone `/ft-file-followup --unattended`** has no tasknote; its
  Step 5 report is the only record, as it already is for the rows themselves.
- **Attended** filings persist nothing extra: the token is on the row or it is
  not, and the operator was there.

No new file, no `## 🔄 Handoff` insert, no queue. The line names rows an
operator may later mark; it is not a work item and is not filed as one.

## Surfaces and mirrors

The rule lives here once. Each filing surface applies it at its own write
step and carries a **labeled mirror** there
([`docs/CONVENTIONS.md`](../docs/CONVENTIONS.md) §"Canonical source with
labeled mirrors"): one line naming the branch it takes, plus the
`unattended-candidates:` literal so the emission shape is the same string on
every surface. The label shape is fixed so citation rot is mechanical to
catch:

```text
mirror of `SPEC/unattended-candidacy.md` §"Three postures"
```

The quoted section must be a real `## ` heading in this file.
`/ft-release` §7.1 **Pair N** — lifted into the CI `drift` job — checks that
every file under `claude/skills/` naming this module carries both the literal
and a resolving label. A filer that Reads the module without mirroring it
fails that check.

| Surface | Write step | Existing gate the proposal rides | Owner |
|---|---|---|---|
| `/ft-epic-discovery` | Step 7 (`.2..M+1`, `.N`) | reconcile review prompt | [[CORE-577.3]] |
| `/ft-file-followup` default, `--starter` | Step 4 / S4 | Step 3 / S3 prose review | [[CORE-577.4]] |
| `/ft-file-followup --unattended` | Step 4 | none — emits, persists via the discharging runner | [[CORE-577.4]] |
| `/ft-file-followup --park` | — | **no candidacy** (one-motion by design; decided when the stub is promoted) | — |
| `/ft-audit` §5 | ticket write | structured-ask write-step confirm | [[CORE-577.5]] |
| `/ft-refactor` | Step 5 | Step 4 structured-ask review; own `--fast` → emit only | [[CORE-577.5]] |
| `/ft-audit-repo` §6 · `/ft-audit-context` §5 | milestone / ticket write | write-confirm structured ask | [[CORE-577.6]] |
| `/ft-task` · `/ft-micro-task` · `/ft-close-epic` | — | not filers; carry the §"Persistence" hook only | [[CORE-577.4]] |

Adopter forks of `ft-audit` (`.claude/skills/audit/`) pick the mirror up only
through `/ft-update`'s fork refresh; until then a fork files as before —
proposing nothing — which is the safe direction.
