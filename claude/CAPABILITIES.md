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
| **Effort / thinking level** | Reasoning-depth selection (heavier vs faster), surfaced through the model the operator runs and `/fast` toggling on supported models | The `[heavy]` / `[light]` PLAN-line tokens are the workflow's neutral expression of this. Heavier reasoning suits design / multi-file / ambiguous tasks; lighter suits mechanical edits with a known diff. | Match the running depth to the task's `[model]` token. Reach for heavier on Discovery-heavy or cross-cutting tasknotes; lighter on a clear mechanical edit. |
| **`--fast` / `-f`** | Trailing arg on `/ft-task` and `/ft-micro-task` (e.g. `/ft-task CORE-004 --fast`) | Operator force-skip: suppresses the 👁️ frontend visual-confirmation ask and the 📦 ready-to-commit signal trips, routing closure to autonomous commit. Does **not** weaken the drift carve-out — a `Re-scope`/`De-scope` verdict still fires the 🛠️ Phase 1→2 gate — and does **not** suppress a destructive-action banner (🗄️/▶️ escalation), which is a safety control on irreversible actions, not a routine signal. | Routine runs where the conditional gates would fire but you want autonomous execution and accept owning visual confirmation yourself. |
| **`/model <name>`** | Claude Code UI command, between sessions (e.g. `/model opus`) | Switches the active model so a task runs on its PLAN-line `[model]`. The post-closure candidate list signals the target model via emoji (`[heavy]🧠` / `[light]🔧`); `/model` is the operator's tool to act on that signal and pre-empt the Step 1.5 mismatch gate on the next hand-off. | On a hand-off whose next task's `[model]` isn't satisfied by the current model — a concrete mismatch, or a `[heavy]` task on a lighter-tier model — paste it before the next `/ft-*` invocation. |
| **`/clear`** | Claude Code UI command (operator-only; the assistant cannot run it) | Resets the context window so the next task starts cold with a small, task-scoped context — the "one task per context window" principle in practice. The post-closure session-reset cue ("Clear your session, then use…") is the prose expression of this trigger. | Between tasks, before starting the next `/ft-*` skill, so each tasknote runs in a clean context. |
| **Structured ask** | Claude Code's multi-option question primitive (`AskUserQuestion`) | Realizes the contract's **structured ask** (vs **prose ask**) — the multi-option operator question used at Phase 1 clarifications and other decision points. The contract names the *operation*; this is Claude Code's delivery of it. | When a genuine decision needs the operator to pick among discrete options (Phase 1 scoping, branch choices) rather than a free-prose reply. |

## Agent-neutrality cross-check

Every trigger above is **wiring-layer** content under `claude/` —
Claude-Code-specific by design per
[`../docs/AGENT-NEUTRALITY.md`](../docs/AGENT-NEUTRALITY.md). The ledger
there tracks intentional Claude-specific references that live in the
**contract layer**; each of these five triggers already carries its
contract-layer ledger coverage:

- `--fast` / `-f` — ledger row (`SPEC.md` + `SPEC/gates.md`).
- `/clear` + `/model <X>` — ledger row (`SPEC.md` §"Post-closure protocol" + `SPEC/model.md`).
- Structured ask — ledger §"Tool-call-specific terminology" (`structured ask` / `prose ask`).
- Effort / thinking ↔ `[heavy]` / `[light]` — ledger rows on `SPEC/model.md` (neutral vocabulary; specific models as examples).

This reference introduces **no new contract-layer surface** — it consolidates
the *wiring-side syntax* in the wiring layer where it belongs — so it takes
**no new ledger row**. It is recorded as a near-neighbor wiring surface in the
ledger's §"Out of scope for this ledger", alongside `claude/AGENTS-snippet.md`.

## Last verified

`v4.4.0` · 2026-06-01 (dogfooded). See [`../docs/AGENT-COMPAT.md`](../docs/AGENT-COMPAT.md) §"Reading the cells" for the full `last-verified` format and update obligation.

## Related

- [`../docs/AGENT-COMPAT.md`](../docs/AGENT-COMPAT.md) — the living per-agent matrix; this doc is the Claude row's capability-trigger detail
- [`../docs/PLATFORMS.md`](../docs/PLATFORMS.md) — the structural two-layer model; non-Claude trigger references reuse this doc's shape and land there (`CORE-224.4`)
- [`../docs/AGENT-NEUTRALITY.md`](../docs/AGENT-NEUTRALITY.md) — the content ledger of intentional Claude-specific surfaces in the contract layer
- [[CORE-EPIC-224]] — the epic that establishes this surface
- [[CORE-224.2]] — the matrix scaffold whose scope note defers capability triggers here
- [[CORE-224.4]] — non-Claude trigger references that reuse this doc's pattern
