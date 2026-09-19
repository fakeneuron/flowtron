# Step 0 — Flag parse, markers, and mode dispatch (executable steps)

> Lazy-loaded SKILL fragment. Loaded by `task` SKILL.md Step 0 when `rest` — the tokens after `TASK-ID` — is non-empty. Carries the flag walk, the per-flag inline markers, the four mode definitions with their fragment dispatches, and the composition rule. A flagless run never reads it. See `claude/skills/ft-task/SKILL.md` for the always-loaded core flow.

`fast-mode`, `debug-mode`, `loop-mode`, and `unattended-mode` were all initialized to `false` by the body before this Read. `rest` is an **unordered flag set** — recognize each token independently; order never matters, and any combination may appear together. Walk the tokens:

- **`--fast` or `-f`** → set `fast-mode = true`.
- **`--debug` or `-d`** → set `debug-mode = true`.
- **`--loop`** (no short alias) → set `loop-mode = true`.
- **`--unattended`** (no short alias) → set `unattended-mode = true` **and** `fast-mode = true` — the posture supersets `--fast`'s autonomy — not its 👁️ delegation — so the operator never passes both.
- **Any unrecognized token** → surface a one-line usage notice (``Unknown arg `<arg>`. Usage: `/ft-task <TASK-ID> [--debug] [--loop] [--fast] [--unattended]`.``) and ask via AskUserQuestion whether the user meant `--fast`, `--debug`, `--loop`, `--unattended`, the default flow, or to abort. Do not proceed silently.

After path resolution, emit one inline marker per active flag (all of them, when several are set) — except that `--unattended`'s marker replaces `--fast`'s, since it names the superset:

- `fast-mode` → `⚡ --fast active — 👁️ frontend ask and 📦 signal trips suppressed; Re-scope downgrades to an inline ⚠️ notice, De-scope still fires 🛠️ (🛠️ banner is no-op for routine trips under default-skip flavor).`
- `debug-mode` → `🔬 --debug active — hypothesis-first Phase 1 scaffolding + Phase 3 repro re-verify. Guidance, not a gate; no new banners.`
- `loop-mode` → `🔁 --loop active — Phase 2↔3 runs as an execute→verify loop under SPEC/loop.md: every Acceptance criterion needs a verify command, 📦 collapses to commit-per-verified-iteration, 👁️ defers to one post-loop ask, destructive steps park.`
- `unattended-mode` → `⚡ --unattended active — no operator present: --fast's 📦 and 🛠️ suppressions apply, and the six gates an operator-less run cannot answer — 👁️ included — park the tasknote instead of firing a banner.`

Then continue to Step 1.

`fast-mode` — the operator is present but does not want to be asked. Branches at Step 4 (Phase 1 exit gate), Step 5 (Phase 3 👁️ ask), and Step 6 (Conditional skip rule); also **implied by an `[unattended]` marker on the task's PLAN.md row** (read at Step 1, when no flag was passed). **When `fast-mode = true`, Read `<SPEC_DIR>/gate-postures.md` now** — it carries the flag's four surfaces and the precedence ladder that bounds them. Default flow (`fast-mode = false`, unmarked row) is byte-identical to the pre-flag skill. Contract: SPEC/gate-postures.md §"`--fast` operator override".

`debug-mode` — hypothesis-first scaffolding for bug / regression work where the root cause is not yet known. **When `debug-mode = true`, Read `<SKILL_DIR>/step-4-debug-mode.md` now** — it carries the whole mode and is referenced at Step 4 and Step 5. Content only: no new gate, no new banner. **Explicit-opt-in only** — never infer it from a bug-shaped task description (SPEC/tasknote-selection.md §"When to use a tasknote (and when not to)").

`loop-mode` — the work is *converge-until-a-check-passes* and "done" is one or more machine-checkable commands. **When `loop-mode = true`, Read `<SKILL_DIR>/step-5-loop-mode.md` and `<SPEC_DIR>/loop.md` now** — the fragment carries the whole mode (scaffold addendum, Phase 1 verify-command rule, the Phase 2↔3 loop body, the one-time post-loop 👁️ ask) and is referenced at Steps 3b, 4, and 5; the module is the contract it drives. The loop runs with `--fast` semantics once it starts, so `--fast` reaches only the pre-loop Phase 1 surface here. **Explicit-opt-in only** — never infer it from a task that merely has a test command.

`unattended-mode` — nobody is present to answer a gate. **When `unattended-mode = true`, Read `<SKILL_DIR>/unattended-mode.md` now** (and `<SPEC_DIR>/gate-postures.md` + `<SPEC_DIR>/blocked.md` alongside it — the posture's contract, and the `park-reason:` codes every conversion writes); it carries the park recipe, the per-runner conversion map, and the pre-scaffold stop split. Branches at Steps 1.5, 2, 4, 5, and 6. Contract: SPEC/gate-postures.md §"`--unattended` operator posture".

The flags are orthogonal and compose in any order; `--debug`'s Phase 3 repro re-verify is not a signal trip `--fast` may suppress, and `--loop`'s per-cycle verify is the loop's own gate rather than one `--fast` collapses.
