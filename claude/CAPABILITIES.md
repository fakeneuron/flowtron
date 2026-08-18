# Claude Code capability triggers

The operator-facing capability triggers Claude Code exposes that change *how*
a flowtron skill runs — reasoning depth, gate-skipping, model selection,
context freshness, and structured questions. This is the per-agent
**capability-trigger reference** for Claude Code, the wiring layer flowtron
ships today. It is the *capability* companion to
[`../docs/AGENT-COMPAT.md`](../docs/AGENT-COMPAT.md) (the living matrix — the
*structural* per-agent index) and lives in `claude/` because these triggers
are Claude-Code-runtime specifics, not contract.

Audience: occasional. Read this to see which Claude Code controls affect a
flowtron run and how to reach for them. The agent-neutral workflow contract
(`SPEC.md`, `SPEC/`, `templates/`) documents the *concepts* (operator
force-skip, fresh-context hand-off, structured ask); this doc records the
Claude Code *syntax* that realizes them.

> **Pattern note.** Each trigger below is documented in one fixed shape —
> **what it is · syntax · what it controls in flowtron · when to reach for it**.
> Non-Claude agents reuse this exact shape for their own trigger references,
> filed in [`../docs/PLATFORMS.md` §"Non-Claude capability triggers"](../docs/PLATFORMS.md#non-claude-capability-triggers)
> rather than here. The shape is portable by design — nothing about it is
> Claude-coupled except the cell contents.

## The triggers

| Trigger | Syntax | What it controls in flowtron | When to reach for it |
|---|---|---|---|
| **Effort / thinking level** | Reasoning-depth selection (heavier vs faster), surfaced through the model the operator runs, the `low` / `medium` / `high` / `xhigh` / `max` effort ladder (`xhigh` recommended for coding and agentic work), and `/fast` toggling on supported models — see [`../SPEC/model.md`](../SPEC/model.md) §"Effort axis (orthogonal to model choice)". Effort levels and context-window variants never earn their own `[model]` token. | The `[heavy]` / `[medium]` / `[light]` PLAN-line tokens are the workflow's neutral expression of this. Heavier reasoning suits design / multi-file / ambiguous tasks; medium suits moderate, multi-step but well-scoped work; lighter suits mechanical edits with a known diff. | Match the running depth to the task's `[model]` token. Reach for heavier on Discovery-heavy or cross-cutting tasknotes; lighter on a clear mechanical edit. |
| **`--fast` / `-f`** | Trailing arg on `/ft-task`, `/ft-micro-task`, and `/ft-goal-task` (e.g. `/ft-task CORE-004 --fast`) | Operator force-skip: suppresses the 👁️ frontend visual-confirmation ask and the 📦 ready-to-commit signal trips, routing closure to autonomous commit. Does **not** weaken the drift carve-out — a `Re-scope`/`De-scope` verdict still fires the 🛠️ Phase 1→2 gate — and does **not** suppress a destructive-action banner (🗄️/▶️/📡/💻 escalation), which is a safety control on irreversible actions, not a routine signal. `/ft-spec` has its own unrelated `--fast` that only skips the review pause before writing a spec. | Routine runs where the conditional gates would fire but you want autonomous execution and accept owning visual confirmation yourself. |
| **`--debug` / `-d`** | Trailing arg on `/ft-task` (e.g. `/ft-task CORE-004 --debug`); composes with `--fast` in either order | Debug mode: loads the `step-4-debug-mode.md` lazy fragment, adding four hypothesis-first prompts inside Phase 1 Discovery (expected vs observed → generate & rank hypotheses → design & run a minimal repro) and a Phase 3 obligation to re-run that exact repro after the fix. Adds **content only** — no new phase, template, banner, or gate; guidance the operator may shorthand or skip. The repro re-verify runs even under `--fast`. Explicit opt-in only — never inferred from a bug-shaped task description (CORE-042.5). | Bugs, regressions, flaky behavior, "it used to work", "why does X happen only under Y" — any investigation where the root cause is not yet known. Skip it when the cause is already known and the work is just landing the fix. |
| **`--worktree`** | Trailing arg on `/ft-goal-task` (e.g. `/ft-goal-task CORE-042 --worktree`); composes with `--fast`/`-f` in either order | Worktree handoff: runs Phase 1 Discovery in the current session, then hands off to `/ft-worktree-start <TASK-ID>` instead of entering the execute→verify loop. The operator re-invokes `/ft-goal-task <TASK-ID>` inside the fresh worktree session (dropping `--worktree`) to drive the loop in isolation — see [`../docs/WORKTREES.md`](../docs/WORKTREES.md). | A goal-loop tasknote that will churn many files and should run quarantined on a `wt-<ID>` branch. Skip it for small, low-blast-radius loops — the isolation overhead isn't worth it. |
| **`--park` / `-p`** | Arg on `/ft-file-followup` (e.g. `/ft-file-followup --park --low fix null guard`); composes with the priority flags `--low` / `--med` / `--fut` / `--high` in any order | Park mode: loads the `park-mode.md` lazy fragment, replacing the default filing flow. Auto-allocates a task ID, takes priority from a flag or one short prose question, writes a tiny stub at `.flowtron/sidequest/<ID>.md` alongside the PLAN.md line, and **skips** the AskUserQuestion collection, the review gate, the downstream-impact reconciliation scan, and the conversational paragraph. Replies in ≤70 words, then continues the interrupted work inline rather than handing off. | Parking an idea or quick fix that surfaces mid-session when you are not switching context now — ≤80w of idea, ≤30w PLAN line, back to work in the same turn. Drop the flag when you want the review gate or reconciliation scan; use `/ft-starter-task` when a file survey or open questions need to persist. |
| **`/model <name>`** | Claude Code UI command, between sessions (e.g. `/model opus`) | Switches the active model so a task runs on its PLAN-line `[model]`. The post-closure candidate list signals the target model via emoji (`[heavy]🧠` / `[medium]🧩` / `[light]🔧`); `/model` is the operator's tool to act on that signal and pre-empt the Step 1.5 mismatch gate on the next hand-off. | On a hand-off whose next task's `[model]` isn't satisfied by the current model — a concrete mismatch, or a `[heavy]` task on a lighter-tier model — paste it before the next `/ft-*` invocation. |
| **`/clear`** | Claude Code UI command (operator-only; the assistant cannot run it) | Resets the context window so the next task starts cold with a small, task-scoped context — the "one task per context window" principle in practice. The post-closure session-reset cue ("Clear your session, then run:…") is the prose expression of this trigger. | Between tasks, before starting the next `/ft-*` skill, so each tasknote runs in a clean context. |
| **Structured ask** | Claude Code's multi-option question primitive (`AskUserQuestion`) | Realizes the contract's **structured ask** (vs **prose ask**) — the multi-option operator question used at Phase 1 clarifications and other decision points. The contract names the *operation*; this is Claude Code's delivery of it. | When a genuine decision needs the operator to pick among discrete options (Phase 1 scoping, branch choices) rather than a free-prose reply. |
| **Sub-agent / isolated exploration** | Claude Code's sub-agent primitive — the Task tool with a `subagent_type` (read-only types such as `Explore` suit probes), agent definitions under `.claude/agents/*.md`, and the `/agents` command to manage them | Realizes the contract's **probe** / **delegate** split ([`../README.md`](../README.md) §"Sessions, loops, and sub-agents"). A **probe** is a read-only sub-agent that owns no tasknote, never runs Phase 1, never trips a gate, and returns a distilled summary into the parent's Discovery Notes — brief + fixed return shape at [`../templates/subagent-probe-template.md`](../templates/subagent-probe-template.md). A **delegate** owns exactly one tasknote and runs the 4-phase workflow to closure. The contract-side trigger is the conditional probe clause on `SPEC.md` §"📝 Phase 1: Discovery"'s "Read relevant source files" bullet. | Phase 1 Discovery when the read set is broad or its shape is unknown — locating five relevant files can cost fifty tool calls in the same window that must hold the task's whole scope through Phase 4. Skip it for a narrow, known read set: reading the files directly is cheaper than briefing a probe and parsing its return. |

## Agent-neutrality cross-check

Every trigger above is **wiring-layer** content under `claude/` —
Claude-Code-specific by design per
[`../docs/AGENT-NEUTRALITY.md`](../docs/AGENT-NEUTRALITY.md). The ledger
there tracks intentional Claude-specific references that live in the
**contract layer**. Contract-layer coverage for the triggers above stands
as follows — stated per-trigger rather than as a blanket claim, because
it is not uniform:

- `--fast` / `-f` — ledger row (`SPEC.md` + `SPEC/gates.md`).
- `--debug` / `-d` — ledger row (`SPEC/procedures/ft-task.md` §"Agent-neutral primitives", which names the flag as the Claude Code spelling of a neutral primitive).
- `/clear` + `/model <X>` — ledger row (`SPEC.md` §"Post-closure protocol" + `SPEC/model.md`).
- Structured ask — ledger §"Tool-call-specific terminology" (`structured ask` / `prose ask`).
- Effort / thinking ↔ `[heavy]` / `[medium]` / `[light]` — ledger rows on `SPEC/model.md` (neutral vocabulary; specific models as examples).
- Sub-agent / isolated exploration — **no contract-layer primitive to cover.** The probe/delegate contract deliberately names no spawn mechanism (`templates/subagent-probe-template.md`: "Which sub-agent primitive spawns the probe is the operator's and the platform's business"). The `README.md` section hosting that split does carry a ledger row, for its *other* Claude references (`--fast` on `/ft-task`, Claude Code's `/loop`, "Claude Code sessions") — added by [[CORE-408.4]].
- `--worktree` + `--park` — flag syntax reaches the contract layer only inside skill-invocation examples. `--park`'s site (`SPEC/tasknote-selection.md`) falls under that file's skill-name ledger row; `--worktree`'s (`docs/WORKTREES.md`) is **not** ledgered today. Recorded here rather than silently counted as covered.

This reference introduces **no new contract-layer surface** — it consolidates
the *wiring-side syntax* in the wiring layer where it belongs — so it takes
**no new ledger row**. It is recorded as a near-neighbor wiring surface in the
ledger's §"Out of scope for this ledger", alongside `claude/AGENTS-snippet.md`.

## Last verified

`v5.16.0 · 2026-08-09 (dogfooded; skipped @ v5.18.0)`. See [`../docs/AGENT-COMPAT.md`](../docs/AGENT-COMPAT.md) §"Reading the cells" for the full `last-verified` format and update obligation.

## Related

- [`../docs/AGENT-COMPAT.md`](../docs/AGENT-COMPAT.md) — the living per-agent matrix; this doc is the Claude row's capability-trigger detail
- [`../docs/PLATFORMS.md`](../docs/PLATFORMS.md) — the structural two-layer model; non-Claude trigger references reuse this doc's shape and land there (`CORE-224.4`)
- [`../docs/AGENT-NEUTRALITY.md`](../docs/AGENT-NEUTRALITY.md) — the content ledger of intentional Claude-specific surfaces in the contract layer
- [[CORE-EPIC-224]] — the epic that establishes this surface
- [[CORE-224.2]] — the matrix scaffold whose scope note defers capability triggers here
- [[CORE-224.4]] — non-Claude trigger references that reuse this doc's pattern
