---
name: ft-audit
description: Ruthless principal-engineer audit of flowtron's markdown contract surface — 5 passes (Safety & integrity · House style · Markdown hygiene · Orphans · Doc drift) across SPEC.md, SPEC/, claude/skills/, claude/commands/, docs/, templates/, README.md. Capped at 5 findings/pass; writes prioritized tickets to `_project/PLAN.md`. Forked from `claude/skills/ft-audit/SKILL.md` per `docs/MIGRATION.md` §1.2.1.
---

# audit — flowtron-self markdown-surface audit

You are a principal engineer doing a **targeted, high-impact** audit of flowtron's markdown contract surface (SPEC + SKILL files + adopter docs + templates). Default behavior: find what matters, report concisely, **make no changes without explicit confirmation**.

This SKILL.md is a fork of the stack-neutral scaffold at `claude/skills/ft-audit/SKILL.md`, customized for flowtron-self's markdown-doc + skill-scaffold surface per the §1.2.1 fork-not-symlink contract. The fork is yours — flowtron version bumps do not touch it.

## 1. Scope & ground rules (do this first, always)

1. **Resolve scope** from `$ARGUMENTS`:
   - `all` or empty → the full markdown contract surface:
     ```text
     SPEC.md
     SPEC/**/*.md
     claude/skills/**/*.md
     claude/commands/**/*.md
     claude/AGENTS-snippet.md
     docs/**/*.md
     templates/**/*.md
     README.md
     ```
     Excluded by design: `_project/tasknote/archive/` (write-once historical records per SPEC §"Tasknote frontmatter"), `legacy/`, `viz/` (out-of-scope for markdown-surface audit; viz has its own audit story).
   - a path → just that path
   - `last-commit` → files touched in `HEAD`
   - `staged` → files in `git diff --cached`
   - If ambiguous, **stop and ask** via `AskUserQuestion` before reading anything.
2. **Load the project rubric** — these are the contracts to audit against, not generic "best practices":
   - `SPEC.md` + `SPEC/*.md` — canonical workflow contract; what every SKILL and adopter doc must align to.
   - `claude/skills/ft-task/SKILL.md` — the executable interpretation of SPEC; precedent for cite-don't-restate (per [[CORE-038]] / [[CORE-050]] / [[CORE-051]]).
   - `docs/MIGRATION.md` — adopter-side contract; flowtron's promise to adopters.
   - `README.md` — repo entry point; first impression of what flowtron is.
   - `claude/AGENTS-snippet.md` — adopter-facing paste target; what adopters' `AGENTS.md` gets stamped with.
   - `_project/tasknote/README.md` §"AI-referenced docs" — the canonical list of docs that get doc-drift-swept at every Phase 4 closure.
3. **Run verification gates** so passes 1–2 don't report noise the grep catches:
   ```sh
   # Cross-link integrity — broken wikilinks (any [[ID]] whose ID isn't a real PLAN.md entry)
   grep -rnoE '\[\[([A-Z]+-(EPIC-)?[0-9]+(\.[0-9]+)?)\]\]' SPEC.md SPEC/ claude/ docs/ README.md templates/

   # Frontmatter shape parity — SKILL.md files should use `name:` + `description:` only
   grep -nE '^(when_to_use|argument-hint|disable-model-invocation):' claude/skills/*/SKILL.md
   ```
   Note failures — broken wikilinks become **Critical** findings in pass 1 (sacred-invariant: canonical-doc cross-link integrity). Frontmatter-shape violations become **Medium** findings in pass 2.
4. **If something is unclear, stop and ask now.** Do not guess intent.

## 2. The 5 passes (in order)

Run in this exact order. **Cap each pass at 5 findings max.** If a pass has more, keep the top 5 by severity and note the tail count (`+3 more Low omitted`).

1. **Safety & integrity** (reframed from "Security & hardening" — flowtron ships no code, only markdown contracts) — write-once policy violations (any change touching `_project/tasknote/archive/` is sacred-invariant Critical); broken-cite hazards in canonical contracts (`SPEC.md` / `SKILL.md` / `MIGRATION.md`) that would mis-route every downstream reader; version-pin drift between `SPEC.md` version line + git tags + `claude/AGENTS-snippet.md` (the "Pinned to:" residue retired in [[CORE-026]] should not reappear; the "no CHANGELOG.md" invariant in `README.md:101` + `claude/AGENTS-snippet.md:51` must continue to hold); submodule pinning hazards in MIGRATION.md `cp` / `ln -s` recipes; adopter-side path resolution failures (any path that doesn't resolve from BOTH flowtron-self AND the `_project/flowtron/` submodule perspective).
2. **Flowtron house style** — task-line grammar conformance (per SPEC §"Task-line format" — `- [ ] **TASK-ID** [model] | shortname — long description`); area-prefix list canonicity (`CORE-` / `BE-` / `FE-` / `DB-` / `DEPLOY-` / `TEST-`); priority-section names (`Critical` / `High` / `Medium` / `Low` / `Future Opportunities`); model tagging on new PLAN.md entries (`[opus]` / `[sonnet]`); skill frontmatter shape (`name:` + `description:` only — no `when_to_use:` / `argument-hint:` / `disable-model-invocation:` per CORE-072's house-style verdict); banner-cue parity for operator-gates (🛠️ Phase 2 / 📦 ready-to-commit / 🏁 committed); SKILL files citing SPEC rather than restating it (per [[CORE-038]] / [[CORE-050]] / [[CORE-051]]); `_(forker: …)_` annotation discipline inside forkable scaffolds; wikilink form (`[[TASK-ID]]` always, never bare ID for cross-refs in PLAN.md long descriptions).
3. **Markdown hygiene** — section heading emoji discipline (🎯 Goal / ✅ Acceptance / 🧩 Subtasks / 🔗 Related / 📝 Phase 1 / 🛠️ Phase 2 / 🧪 Phase 3 / 🚀 Phase 4); code-fence language tags (`sh` / `yaml` / `markdown` — not bare ```); nested-list indentation consistency; line-wrap consistency (SPEC wraps at ~75 chars; SKILLs follow the same rhythm); terminal command shape (absolute paths in examples; quote paths with spaces); bullet vs. checkbox usage (`- [ ]` for tasknote / PLAN.md / phase checklists; `-` for prose bullets); wikilinks inside code spans treated as literal text per SPEC §"Long-description conventions".
4. **Orphans** — dead cross-refs (sections that no longer exist after a SPEC rename or modularization); retired-field mentions (`priority:` / `area:` / `model:` in **new** tasknote frontmatter per SPEC §"Tasknote frontmatter" write-once policy — only legacy archives may still carry them); "Last updated:" residue per [[CORE-035]] retirement; "Pinned to:" residue per [[CORE-026]] retirement; vestigial references to removed surfaces (`legacy/`, `TasknoteSystem/`); commented-out config blocks in docs; TODO stubs that predate the current phase; dead section labels in PLAN.md (priority headers with no entries that aren't tagged `(none)`).
5. **Documentation drift** — SPEC vs. SKILL drift (SKILL describes behavior SPEC doesn't authorize, or contradicts a SPEC clause); MIGRATION.md vs. AGENTS-snippet.md drift (adopter wiring instructions vs. paste-block contents); MIGRATION.md vs. README.md vs. SPEC §"Working in the flowtron repo itself" drift (each describes the same install surface and must agree); version-bump drift (`SPEC.md` version line vs. git tags vs. `viz/package.json` version — note: flowtron has no `CHANGELOG.md` per `README.md:101`; release notes live in annotated tag messages + per-release tasknotes); `_project/tasknote/README.md` §"AI-referenced docs" list completeness (anything that gets doc-drift-swept at Phase 4 must be listed); template files (`templates/tasknote-template.md` + `templates/PLAN.md` + `templates/tasknote-README.md` + `templates/tasknote-starter-template.md` + `templates/tasknote-micro-template.md`) describing schemas the SPEC doesn't carry; "ships X" / "uses Y" claims that no current file backs.

## 3. Finding format (use exactly this)

```text
**Finding #[N] – [Critical|High|Medium|Low] – [Pass # / Category]**
- Location: `path/to/file:LINE` (or section heading / wikilink ID)
- Issue: one sentence
- Why it matters: brief — tie to contract integrity / adopter experience / maintenance cost
- Recommended fix: concrete suggestion or ≤5-line snippet
```

Severity guide (flowtron's sacred invariants live in Critical):

- **Critical** — sacred-invariant breach: (a) write-once policy on archived tasknotes touched / proposed; (b) broken `[[wikilink]]` or `§"Section name"` cite in `SPEC.md` / `SKILL.md` / `docs/MIGRATION.md` / `README.md` (mis-routes every downstream reader); (c) SPEC↔SKILL contract divergence (SKILL authorizes behavior SPEC doesn't sanction, or vice versa); (d) adopter-side path doesn't resolve from BOTH flowtron-self AND the `_project/flowtron/` submodule view; (e) verification-gate failure (broken-wikilink grep returns a hit in canonical contract docs).
- **High** — missing-contract violation (SKILL claims behavior SPEC doesn't carry); MIGRATION wiring step that no longer works; AGENTS-snippet vs. SPEC drift on something adopters paste in; template file describes a schema the SPEC contradicts.
- **Medium** — idiom violation that will compound (frontmatter shape violation, banner-cue parity miss, cite-don't-restate violation); doc drift that misleads but isn't load-bearing; retired-field residue in new files; magic constant that should reference the SPEC.
- **Low** — nit, minor hygiene, style (heading emoji slip, code-fence missing language tag, line-wrap inconsistency).

## 4. Required closing sections (always, in order)

1. **Summary** — health score 1–10 with one-sentence justification + top 3 issues (by severity, not pass order).
2. **Exploratory Insights** — what the findings reveal about how flowtron evolved. Patterns, not individual issues (e.g. "three SKILLs still restate SPEC §'Operator-gate cues' verbatim — the cite-don't-restate migration stalled after [[CORE-051]]").
3. **Proposed tasks for `_project/PLAN.md`** — prioritized, actionable tickets using flowtron's task-line grammar. One ticket per thematic cluster, not per finding. Present them inline in the report so the user can review before anything is written to disk.
4. **Questions for the user** — anything ambiguous that blocks implementation. Use `AskUserQuestion` for these, not prose — the user wants real prompts.

## 5. Write the proposed tasks into `_project/PLAN.md` (required step, not optional)

The audit is not done until the proposed tickets land in `_project/PLAN.md`. This is the deliverable — a report the user reads and then forgets isn't useful; tickets in PLAN.md are what drive follow-up work.

1. **After** sections 1–3 above are presented, and **after** the user responds to any `AskUserQuestion` blockers, write tickets into `_project/PLAN.md` using flowtron's task-line grammar: `- [ ] **<AREA>-<N>** [opus|sonnet] | shortname — long description.` See `SPEC.md` §"Task-line format".
2. Pick the next free `<N>` per area prefix. Valid prefixes for flowtron-self are listed in `_project/tasknote/README.md` §"Area prefixes" (`CORE-` / `BE-` / `FE-` / `DB-` / `DEPLOY-` / `TEST-`).
3. Insert tickets in the correct priority section — `## Critical` / `## High` / `## Medium` / `## Low` for blocking improvements; `## Future Opportunities` for non-blocking ideas. Add a `Surfaced by audit YYYY-MM-DD (Finding #N, <severity>)` parenthetical to each ticket's description so future-you can trace a ticket back to its origin without re-running the audit.
4. Do **not** write code or doc changes, do **not** modify source files, do **not** open editors on flagged files. The audit writes tickets only — actual fixes happen in separate task cycles via `/ft-task`.
5. If the user pushes back on a proposed ticket during review (e.g. "drop #5, it's not worth it"), drop it from the `_project/PLAN.md` write. If they ask to combine or split tickets, do that before writing.

This step is mandatory — a "report-only" audit is a process failure. The one exception: if every pass returned zero findings, say so explicitly and skip the write.

## 6. Hard rules

- **Targeted, not exhaustive.** Five findings per pass is a *ceiling*, not a target. A clean pass gets zero findings and moves on.
- **Write tickets, not fixes.** `_project/PLAN.md` gets updated (§5 above). Source files do NOT — any change needs a separate explicit user request. Do not open files in edit mode for fixes, do not run formatters, do not "fix while I'm in here."
- **Don't repeat the grep.** If the verification gate (§1 step 3) already flagged a broken wikilink or a retired frontmatter key, note it once in pass 1/2 and move on — don't enumerate every grep hit as a separate finding unless their cluster size is itself the story.
- **Don't audit adjacent surfaces.** Stay inside the resolved scope. Specifically: never read or propose changes to `_project/tasknote/archive/` (write-once historical records), `legacy/`, or `viz/` (its own audit story).
- **SKILLs cite SPEC, don't restate SPEC** (per [[CORE-038]] / [[CORE-050]] / [[CORE-051]]). Any SKILL that duplicates a SPEC paragraph is at least a Medium-severity finding.
- **No final summary of what you just did.** The report + the `_project/PLAN.md` diff *are* the deliverable.
- **Future forks of this fork must remember to delete §0.** This SKILL.md is itself a fork; §0 was deleted during install. If you later split this into `audit-spec`, `audit-skills`, etc., delete §0 from each copy. Leaving §0 in confuses the auditor's first read on every run.
