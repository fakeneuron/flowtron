# Flowtron Glossary

**Lazy-loaded vocabulary reference.** One-line definitions for the load-bearing terms, primitives, phases, markers, and grammar elements of the flowtron workflow contract. Pointers only — the authoritative text lives in `SPEC.md` (and lazy `SPEC/` modules + skills).

Adopted from the GSD-Pi `CONTEXT.md` glossary pattern (the "mega-doc" slice that survived the one-task-per-window filter during CORE-EPIC-194 Discovery). See [CORE-194.1](../.flowtron/tasknote/archive/core/CORE-194.1.md) for the extraction rationale and term-cohort decisions.

Alphabetized. ~57 entries. Maintained via epic children and audits.

---

**AGENTS.md** — The agent-neutral block adopters paste into their project `AGENTS.md`; defines the adopter-facing assistant surface (skills, commands, one-time wiring). Source: `claude/AGENTS-snippet.md`. See docs/MIGRATION.md §1.3.

**AI-referenced docs** — The flat list in `.flowtron/tasknote/README.md` §"AI-referenced docs" that every Phase 4 closure and epic-audit subtask walks for the doc-drift sweep. `SPEC/` lazy modules and `claude/skills/*` are deliberately excluded from the default cold-start set.

**area prefix** — The leading token of a TASK-ID (e.g. `CORE-`, `FE-`, `BE-`); declares the scope bucket per SPEC §"Task ID convention". Adopters declare extra domain prefixes in their `.flowtron/tasknote/README.md`.

**audit-family** — The seven audit skills and command stubs `/ft-audit{,-repo,-docs,-backend,-frontend,-performance,-security}`: six forkable stack scaffolds plus `/ft-audit-repo`, the no-fork first-contact holistic audit run by reference from the submodule. `/ft-audit-context` is a standalone context-surface skill, not part of the family (it follows its own recipe — see SPEC §"Skill namespace"). Forking rules and naming (no `ft-` prefix on forks) in docs/MIGRATION.md §1.2.1.

**audit-family fork** — An adopter-owned audit skill created by forking an upstream one; must drop the `ft-` prefix so ownership is visible in resolution (e.g. `audit-payments`).

**Blocked by [[ID]]** — Wikilink grammar inside a PLAN.md long-description declaring a hard prerequisite task. Parsed into `Task.blockedBy`. Multiple comma-separated IDs supported. See SPEC §"Task-line format".

**blocked tasknote** — A tasknote whose frontmatter `status: blocked`; parked awaiting a prerequisite. Resumed through the special Step 3c path in `/ft-task`. See SPEC/blocked.md.

**child (epic)** — A normal implementation subtask under a parent epic (e.g. `CORE-194.3`). Distinct from the `.1` Discovery and `.N` Audit bookends. See SPEC/epic.md.

**Closure (Phase 4)** — The final auto-run phase: mandatory doc-drift sweep, PLAN.md line flip to stub form + archive move, recap draft. Flows directly into the post-closure protocol. See SPEC §"🚀 Phase 4: Closure".

**Conditional skip rule** — The deterministic three-signal test (zero frontend files changed, zero privileged-ops paths changed, no perf-narrative concern) plus bundled-prompt override that decides whether the 📦 ready-to-commit gate fires or the closure auto-commits. See SPEC/gates.md §"Conditional skip rule".

**copy-paste line** — The post-closure "suggest next" helper: emoji primary label (`[heavy]🧠` / `[medium]🧩` / `[light]🔧`) + "design / moderate / mechanical" prose + shortname, followed by a tight "Clear your session, then run: /ft-task <next-ID>" cue whose label-line glyph matches the chosen candidate's 🔧/🧩/🧠 (never a default 🔧). Never emits literal `/model` or `/clear` commands.

**CORE-** — The canonical area prefix for cross-cutting, orchestration, and meta tasks (used by flowtron self and every adopter).

**[!critical]** — Optional urgency flag in the task-line grammar; renders a red marker and floats the row to the top of its priority bucket (High). Orthogonal to `[model]` and the priority heading. See SPEC §"Task-line format".

**deep pre-pass** — Optional three-stage upfront staging (Constitution → specify → clarify) for high-uncertainty epics before normal Phase 1 Discovery; invoked with `/ft-epic-discovery --deep`. See SPEC/epic.md.

**Discovery (Phase 1)** — The mandatory opening phase of every tasknote: Reviewed PLAN, Relevance Assessment (Proceed/Re-scope/De-scope), read sources, archive skim, drift check, clarifying questions (or logged assumptions), populate subtasks. Exit gate may emit 🛠️. See SPEC §"📝 Phase 1: Discovery".

**Doc-drift sweep** — The mandatory Phase 4 (and epic-audit) step that walks every entry in the AI-referenced docs list and records "no change" or the precise update performed.

**Downstream-impact reconciliation** — The scan that keeps PLAN.md cohesive as it grows: when a new task is filed or a mid-flow decision changes direction, active PLAN entries are checked for stale / contradictory / redundant overlap and one reconcile action (merge / nest / edit / delete / leave) is proposed per impacted entry behind a user-confirm gate (the plan is never auto-rewritten). Wired into the filing skills and the `/ft-task` Phase 2 decision path. See SPEC/tasknote-selection.md §"Downstream-impact reconciliation".

**Drift check** — Phase 1 step that verifies file paths, line numbers, function names, and root-cause hypotheses cited in the original PLAN description still match current HEAD before any re-interpretation.

**epic** — A parent planning artifact (`CORE-EPIC-N`) whose children are numbered subtasks (`.1` Discovery, implementation children, `.N` Audit). Parent stays open until the audit child closes. Full lifecycle in SPEC/epic.md.

**epic Audit (.N)** — The closing subtask of an epic; verifies the completed work sits well in the codebase, runs the cumulative doc-drift sweep across AI-referenced docs, records findings even when clean. Executed via `/ft-close-epic`.

**epic Discovery (.1)** — The opening subtask of an epic; surveys the shared surface, resolves scope questions, and files the concrete child task list in PLAN.md. Deliverable is the filed children (not code). Executed via `/ft-epic-discovery`.

**Execution (Phase 2)** — The implementation phase: mandatory pattern survey of neighboring code first, then minimal targeted change + tests on changed files only. See SPEC §"🛠️ Phase 2: Execution".

**Extension-first** — Outward-facing principle (VISION-only, not in SPEC Core principles): prefer extending an existing pattern (sibling skill, doc convention, tasknote shape) over inventing a parallel one. Promoted from the Phase 2 "Pattern survey" contract step. See docs/VISION.md and SPEC §"🛠️ Phase 2: Execution".

**follow-up** — A lightweight mid-flow task filed via `/ft-file-followup`; produces a one-line PLAN.md entry plus a short context paragraph delivered conversationally. Below the normal tasknote threshold.

**sidequest** — The lightest persistent mid-flow park, filed via `/ft-sidequest`; writes a tiny stub at `.flowtron/sidequest/<ID>.md` plus one PLAN line. Priority via flags (`--low`, `--med`, `--fut`) or one short question when omitted. Replies with priority + resume anchor, then continues the main session inline. Promote via `/ft-micro-task`, `/ft-task`, or `/ft-starter-task`.

**`/ft-update`** — The adopter-side command that bumps a project's pinned flowtron submodule to the latest released tag: shows current→target + changelog, moves the pin, re-wires newly shipped symlinks, runs a smoke check. Consumer-side counterpart to `/ft-release`. Adopter-only (bails in flowtron-self); takes no arguments. See docs/MIGRATION.md.

**goal loop** — The loop-task shape that repeats Phase 2→3 (execute→verify) against a fixed, machine-checkable `## ✅ Acceptance` target until every check passes, `loop-max` is exhausted, or the per-cycle relevance gate says stop. Driven by `/ft-goal-task`; contrast heartbeat. See SPEC/loop.md.

**grammar elements** — The syntactic pieces of the PLAN.md task-line and tasknote body: `[!critical]`, `[model]`, `| shortname`, `[[TASK-ID]]` wikilink, `Blocked by [[ID]]`, `Completed YYYY-MM-DD.` stub form, etc. See SPEC §"Task-line format".

**heartbeat** — The recurring-maintenance loop-task shape: each cycle runs a cheap pre-check then does at most one bounded duty, filing findings as PLAN lines rather than converging on a single target. Ships as `templates/loop-heartbeat-template.md` (copied to `.claude/loop.md`); a stale `loop-last-run:` is its death signal. See SPEC/loop.md.

**iteration log (🔁 Iterations)** — The append-only `## 🔁 Iterations` section a loop task adds between Phase 3 and Phase 4; one line per cycle (number · relevance verdict · verify result · commit sha or no-commit reason). The loop's memory — replaces re-reading the transcript each cycle. See SPEC/loop.md.

**lazy-loaded** — Contract for `SPEC/*.md` modules and `claude/skills/*/SKILL.md` implementations: loaded on demand by the calling stub rather than read at every cold start. The glossary itself follows this pattern to protect one-task-per-window.

**[model]** — Optional short token in a task-line declaring the recommended cognitive-load tier for the work (primary labels `[heavy]` / `[medium]` / `[light]`; specific names `fable`, `opus`, `grok`, etc. remain valid). Read by `/ft-task` Step 1.5 before scaffolding. See SPEC §"Model field".

**micro-tasknote** — A single-section tasknote (do-the-work + recap only) used for work that exceeds the skip-the-tasknote threshold but is too small for the full 4-phase ceremony. Uses `templates/tasknote-micro-template.md`.

**one-task-per-window** — Core Principle #3: every tasknote is deliberately sized so the assistant can hold the entire scope (PLAN entry, checklists, files touched, tradeoffs, decisions) in one context window. The reason the full GSD-Pi `CONTEXT.md` was declined and only its glossary slice survived as a lazy doc.

**Operator-gate cues** — The up-to-two conditional approval banners the 4-phase workflow can surface: 🛠️ (Phase 1→2) and 📦 (ready-to-commit). Both are conditional; many tasks run end-to-end with only inline state markers. See SPEC §"Operator-gate cues".

**parent epic** — The `CORE-EPIC-N` row in PLAN.md that owns a group of subtasks; remains unchecked until its `.N` audit child completes. See SPEC/epic.md.

**Pattern survey** — The mandatory first sub-step of Phase 2 Execution: examine sibling modules / parallel components / adjacent docs for an existing shape to extend before inventing a new one. See SPEC §"🛠️ Phase 2: Execution".

**Phase 1→2 (🛠️)** — The operator-gate cue emitted after Phase 1 Discovery when a significant scope deviation (Re-scope/De-scope always; certain clarifications) was surfaced. `/ft-task` uses the `default-skip` flavor. See SPEC §"Operator-gate cues".

**Phase 3: Testing & Linting** — Targeted tests + lint/type-check on changed files; frontend changes add an 👁️ visual-confirmation prose ask (inline emoji prefix only). See SPEC §"🧪 Phase 3: Testing & Linting".

**post-closure protocol** — The three steps that run after a tasknote is archived: commit decision (per Conditional skip rule), suggest-next-move (model-aware), copy-paste line. See SPEC §"Post-closure protocol".

**PR / suggestion archetypes** — The six shapes flowtron deliberately rejects in contributions: schema validators, abstractions without two-project precedent, cross-project query layers beyond the read-only visualizer, multi-user/team features, runtime security scanners / audit daemons, and LLM knowledge-base / "wiki layer" subsystems. Terse AI-facing list lives in SPEC; prose mirror in VISION.md. See SPEC §"What flowtron does NOT provide" and docs/VISION.md.

**priority level** — The PLAN.md heading under which a task row lives (`## High`, `## Medium`, etc.). The `[!critical]` flag can float a row inside High. See SPEC §"Priority levels".

**privileged-ops** — One of the three Conditional skip signals: any changed path under migrations/, auth/, security/secrets/, credentials/, or external integrations/, plus any diff containing uppercase credential keywords (`API_KEY`, `SECRET`, `TOKEN`, `PASSWORD`). See SPEC/gates.md §"Conditional skip rule".

**ready-to-commit (📦)** — The second (and final) operator-gate cue; bundles closure review, recap, and proposed commit message. Fires when any Conditional skip signal is hit or a bundled prompt is queued. See SPEC §"Operator-gate cues".

**Relevance Assessment** — The non-negotiable first substantive step of Phase 1 Discovery: explicit `Proceed` / `Re-scope` / `De-scope` verdict with one-line rationale. Re-scope or De-scope change the plan before any execution. See SPEC §"📝 Phase 1: Discovery".

**related-tasks** — Tasknote frontmatter array (and PLAN wikilinks) capturing predecessor, follow-up, and parent-epic relationships.

**shortname** — The optional `| shortname` segment in a task-line (≤~30 chars); becomes the visualizer row title. Falls back to tasknote `title:` or the long description. See SPEC §"Task-line format".

**starter tasknote** — A tasknote whose YAML `status: starter`; a lightweight holding pen for work that is real but not yet ready for a full `/ft-task` invocation. Promoted through a special path (see SPEC/starter.md).

**starter promotion** — The Step 3a path in `/ft-task` that converts a `status: starter` tasknote into a normal in-progress one and continues at Phase 1.

**state-marker (🏁)** — The inline accomplishment summary emitted after the commit lands in the post-closure protocol (1-2 plain-English sentences + optional verification ask).

**status (tasknote frontmatter)** — One of `not-started`, `in-progress`, `completed`, `starter`, or `blocked`. Drives the entire `/ft-task` dispatch logic (scaffold vs. promote vs. resume vs. error).

**submodule pin** — The deliberate, versioned consumption mechanism: adopters add flowtron as a git submodule pinned to a specific commit. Updates occur only via intentional bumps (see docs/MIGRATION.md).

**tasknote** — The self-contained markdown file (YAML frontmatter + 4-phase checklists + Discovery/Implementation/Testing/Closure notes) that holds the complete scope of one unit of work. Exactly one active tasknote per in-flight task.

**tasknote frontmatter** — The YAML block at the top of every tasknote (`title`, `status`, `created`, `related-tasks`, etc.). Most fields are write-once after scaffold. See SPEC §"Tasknote frontmatter".

**Testing & Linting (Phase 3)** — See Phase 3.

**VISION.md** — The outward-facing identity document (who it's for, principles recap including Extension-first, "what we won't accept", why this exists). Lazy-loaded; cross-linked with the SPEC PR-archetypes subsection. Companion to PHILOSOPHY.md (history). See docs/VISION.md.

**wikilink [[TASK-ID]]** — The only parsed cross-reference syntax in PLAN long-descriptions and tasknote Related sections; populates `relatedTasks` / `blockedBy` metadata. Bare IDs and angle-bracket placeholders are literal text only. See SPEC §"Task-line format".

---

**Maintenance.** This file is the survivor slice of the GSD-Pi `CONTEXT.md` pattern (see CORE-194.1). It is deliberately lazy-loaded and must never be added to the AI-referenced docs list. New terms are introduced only by epic children or audit follow-ups that also update the authoritative SPEC anchors. Last significant update: CORE-301.5 (2026-06-07).

See [SPEC.md](../SPEC.md) for the contract and [.flowtron/PLAN.md](../.flowtron/PLAN.md) for the current epic context.