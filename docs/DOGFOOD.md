# Flowtron dogfood procedure

A versioned, pasteable verification procedure any AI agent runs to
confirm flowtron compatibility and refresh its `docs/AGENT-COMPAT.md`
`last-verified` row. Covers the three verification surfaces: contract
comprehension, cue-render check, and Phase-1 drive.

Audience: operators running a dogfood session under a new agent or
re-verifying an existing row before a release cut. Paste this file's
content (or reference its path) as the opening prompt in the target
agent's session on the flowtron repo.

## Prerequisites

1. **The flowtron repo** — run the session in a checkout of flowtron
   itself (not an adopter project). The `last-verified` stamps live
   here.
2. **The target agent** — the session must run under the agent whose
   `docs/AGENT-COMPAT.md` row you intend to refresh.
3. **Current version** — note `**Version:** vX.Y.Z` from `SPEC.md`
   line 1 before starting. The resulting stamp records this version.

## The procedure

Run the three steps in order. Do **not** write files or run shell
commands beyond those explicitly listed. After all three steps pass,
record the result per §"Recording the result".

### Step 1 — Contract comprehension

Read each file below in full before continuing:

1. `SPEC.md` — the canonical workflow contract; note the version
   string on line 1.
2. `AGENTS.md` — the context entry-point defining your surface.
3. `docs/AGENT-COMPAT.md` — the agent-compatibility matrix; find
   your row and note the current `Last verified` stamp.
4. `SPEC/gates.md` — the gate machinery and the full operator-cue
   vocabulary.
5. `templates/tasknote-template.md` — the canonical 4-phase tasknote
   shape.
6. `.flowtron/tasknote/README.md` — the AI-referenced docs list and
   the archive layout.

Log: `Contract comprehension complete. flowtron version: vX.Y.Z.
My row: [paste current stamp from AGENT-COMPAT.md].`

### Step 2 — Cue-render check

Emit each cue in the full operator-cue vocabulary below, one per line,
using the canonical `<glyph> <UPPERCASE-LABEL>` form (per
`SPEC/gates.md` §"Operator-cue vocabulary"). Confirm each renders —
no tofu □, no stripped glyph, no mojibake. The UPPERCASE label is the
authoritative cross-agent fallback; note any glyph that fails to render.

**Event cues**
- 🗄️ DB
- ▶️ RUN
- ✋ ACTION

**Inline asks**
- 🟢 GO
- 👁️ **CONFIRM** — emitted in the emphasized shape (own line, bold label); note whether the bold renders, shows literal asterisks, or is stripped
- 🔍 AUDIT

**Landmark cues**
- 🛠️ AWAITING APPROVAL — Phase 2: Execution ready
- 📦 AWAITING APPROVAL — Ready to commit
- 🏁 TASK-ID — committed abc1234
- ✅ Phase 1 Discovery complete; entering Phase 2 Execution.

**Next-task cues**
- 🔧 LIGHT (mechanical)
- 🧩 MEDIUM (moderate)
- 🧠 HEAVY (design)
- 👇 HERE (run here — do not clear)

Log: `Cue-render check complete. [Note any non-rendering glyphs and
confirm the UPPERCASE label fallback is legible.]`

### Step 3 — Phase-1 drive

Pick one open task from `.flowtron/PLAN.md` (any unchecked line not
under `## Completed`). Run **Phase 1: Discovery** on it as you would
in a real session, following `SPEC.md` §"📝 Phase 1: Discovery":

**Exhausted-PLAN fallback.** If `.flowtron/PLAN.md` has no open task
(every line is under `## Completed` — the PLAN-exhausted terminal
state), do **not** fabricate a task. Instead exercise Discovery on the
terminal state itself: review the board, return a **De-scope** verdict
with the rationale that no open task exists (the expected terminal
state per `SPEC.md` §"Post-closure protocol"), run the archive `ls`/
`grep` and drift check against the most recent `## Completed` entry,
and emit the `default-skip` exit gate. This is a valid Phase-1 drive —
correctly detecting and reporting the exhausted board is the contract
behavior, and the dogfood passes on it.

1. Review the task entry in PLAN.md.
2. **Relevance Assessment** — state Verdict (Proceed / Re-scope /
   De-scope) and Rationale.
3. Read relevant source files in scope for the task.
4. **Archive skim** — run `ls .flowtron/tasknote/archive/<area>/`;
   grep for source paths in scope; log any load-bearing findings.
5. **Drift check** — confirm file paths, function names, and
   hypotheses in the task description still match current code, and
   that the plan you are forming neither contradicts a SPEC contract
   nor diverges from its PLAN.md line.
6. **Clarifying questions** — ask if anything is genuinely ambiguous;
   otherwise write `No clarifications needed` with explicit
   assumptions.
7. **Populate Subtasks** — draft concrete, ordered steps for the task.
8. **Phase 1→2 exit gate** — apply the `default-skip` flavor by name:
   state whether Discovery surfaced a significant scope deviation, and
   whether you are emitting ✅ skip or firing 🛠️.

**Stop here.** Do not proceed to Phase 2 — write no files, run no
shell commands except the archive `ls` and `grep` in step 4.

Verify with:

```sh
git status --porcelain
```

Expected output: empty (no files written or modified).

Log: `Phase-1 drive complete. Task: [TASK-ID]. Exit-gate decision:
[skip ✅ / fire 🛠️]. git status: clean.`

## Recording the result

After all three steps pass, update the agent's `last-verified` stamp:

1. **Stamp format:** `vX.Y.Z · YYYY-MM-DD (dogfooded)` where `vX.Y.Z`
   is the version noted in Step 1 and `YYYY-MM-DD` is today's date.
2. **All stamp locations must be updated together** (per
   `docs/AGENT-COMPAT.md` §"Reading the cells"):
   - **Claude Code** → `docs/AGENT-COMPAT.md` matrix row +
     `claude/CAPABILITIES.md` §"Last verified"
   - **Grok Build / Codex CLI** → `docs/AGENT-COMPAT.md` matrix row
     + their `docs/PLATFORMS.md` per-agent footers
   - **Other agents** → `docs/AGENT-COMPAT.md` matrix row only (no
     separate trigger-reference file yet)
3. **Drop any prior `; skipped @ …` suffix** — a real re-verification
   makes the row current again.

Report the updated stamp to the operator so they can apply the edits.
The `ft-release` dogfood gate (`ft-release` §5) drives the per-release
resolution; this procedure is the content a dogfood session runs.

## Related

- [`docs/AGENT-COMPAT.md`](AGENT-COMPAT.md) — the compatibility
  matrix; carries the stamps this procedure refreshes and the full
  update-obligation contract (§"Reading the cells")
- [`SPEC/gates.md`](../SPEC/gates.md) §"Operator-cue vocabulary" —
  the authoritative source for the Step 2 cue vocabulary
- [`docs/PLATFORMS.md`](PLATFORMS.md) — per-agent structural notes;
  per-agent footers receive stamp updates from Step 3 for Grok/Codex
- [[CORE-269]] — the task that produced this document
