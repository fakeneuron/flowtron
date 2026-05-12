---
name: release
description: Cut a flowtron release — version bump, doc-currency shifts, doc-drift sweep, single feat: commit, annotated tag, push. Flowtron-self only (global symlink); never installed in adopter projects. Encodes the CORE-048 / CORE-046 / CORE-043 release recipe.
---

# release — flowtron self-host release skill

You are cutting a flowtron release. The recipe is canonical (CORE-048 / CORE-046 / CORE-043 precedents): SPEC.md version bump · SPEC/versioning.md example shifts · docs/MIGRATION.md pin bump · doc-drift sweep · single `feat:` commit · annotated tag · push. This skill scaffolds and drives a release tasknote through the full 4-phase flow.

This skill is **flowtron-self only**. It is symlinked under `~/.claude/skills/release` and `~/.claude/commands/release.md` for global invocation, but it never runs in adopter projects. Step 0 enforces this.

The release task ID must already be filed in `_project/PLAN.md` as a one-line entry — for example:

```
- [ ] **<TASK-ID>** [opus] | release vX.Y.Z — Cut vX.Y.Z minor release tagging <FEAT-A> + <FEAT-B> since v<prev>.
```

`/release` then scans PLAN for the entry and drives it. The skill takes **no arguments**.

## Step 0 — Verify cwd is the flowtron repo

The skill bails if invoked outside flowtron's own checkout:

- `SPEC.md` exists at the repo root with the heading `# Flowtron — Workflow Specification` on line 1.
- `_project/PLAN.md` exists (flowtron's own PLAN.md, not an adopter's `_project/flowtron/PLAN.md`).
- `_project/flowtron/SPEC.md` does NOT exist (its presence means we're inside an adopting project — `/release` must not run there).

If any check fails, stop. Tell the user `/release` only runs from inside the flowtron repo (typical: `~/code/flowtron`). Do not modify any files.

## Step 1 — Find the pending release task in PLAN.md

Read `_project/PLAN.md`. Scan un-checked task lines under `## Critical | High | Medium | Low` (skip `## Completed` and `## Future Opportunities`) whose `| <shortname>` segment matches `release v*` (case-insensitive — e.g., `release vX.Y.Z`).

- **Zero matches.** Stop. Tell the user "No pending `release v*` task in PLAN.md. File a one-liner first (e.g., `**<TASK-ID>** [opus] | release vX.Y.Z — ...`), then run `/release` again." Do not scaffold.
- **Multiple matches.** Stop. List the matches and tell the user `/release` requires exactly one pending release task. Ask them to close/de-scope the duplicates or restructure to a single line. Do not scaffold.
- **Exactly one match.** Capture the `<TASK-ID>`, the `[model]` segment, the `| <shortname>` segment, the long description, and the section heading (priority). Continue.

Parse the **target version** from the shortname: `release v<X.Y.Z>` → `vX.Y.Z`. If the shortname doesn't conform, stop and ask the user to fix the line.

## Step 2 — Verify state and propose bump kind

Read `SPEC.md:3` to get the **current version** (the line `**Version:** vX.Y.Z`).

Run:

```sh
git describe --tags --abbrev=0
```

This is the last tag. If it doesn't match the SPEC.md version, stop and surface the drift (typically an aborted prior release; user reconciles before continuing).

Run:

```sh
git log <last-tag>..HEAD --oneline
```

Classify each commit by Conventional-Commits prefix:

- `feat!:` or commit body containing `BREAKING CHANGE:` → major
- `feat:` (no `!`) → minor
- `fix:` / `chore:` / `docs:` / `refactor:` / etc. → patch

Compute the **proposed bump kind** = the highest-rank classification across all commits. Compute the **proposed new version** by applying the bump to the current version.

Surface to the user:

```
Current version: vX.Y.Z (matches SPEC.md:3 and `git describe`)
PLAN target:     vA.B.C
Commits since vX.Y.Z:
  - feat: ... (additive)
  - fix:  ... (clarification)
  - ...
→ Proposed bump kind: <patch|minor|major>  (vX.Y.Z → v<auto-computed>)

Confirm or override?
```

If the proposed bump and the PLAN-line target match, the user confirms in one shot. If they disagree, surface the disagreement explicitly and ask which to use; the PLAN-line target wins by default unless the user revises the line. Once locked, the **new version** = the user-confirmed `vA.B.C`. Use this throughout the rest of the skill.

## Step 3 — Scaffold the release tasknote

Copy `templates/tasknote-template.md` to `_project/tasknote/<TASK-ID>.md` and populate the frontmatter:

- `title:` — the PLAN-line shortname (e.g., `release vX.Y.Z`).
- `status:` — `in-progress`.
- `created:` — today's date (`YYYY-MM-DD`).
- `related-tasks:` — populate from the PLAN-line long description's referenced task IDs (e.g., `[<FEAT-A>, <FEAT-B>]` when those features triggered the bump). Include the most recent prior release tasknote as a precedent reference (e.g., `[<FEAT-A>, <FEAT-B>, <PREV-RELEASE>]`).

🎯 Goal — one sentence drafted from the PLAN-line long description.

Pre-populate `## ✅ Acceptance` and `## 🧩 Subtasks` with the canonical 7-step recipe parameterized to `vX.Y.Z` (current) and `vA.B.C` (new). Mirror CORE-048's archived tasknote shape — the Acceptance and Subtasks sections there are the canonical template.

Acceptance (parameterized):

```
- [ ] SPEC.md `**Version:** vX.Y.Z` → `vA.B.C`
- [ ] SPEC/versioning.md patch/minor examples shifted off the just-cut release (per CORE-043 / CORE-046 / CORE-048 precedent)
- [ ] docs/MIGRATION.md example pin bumped `vX.Y.Z` → `vA.B.C`
- [ ] Phase 4 doc-drift sweep run across all `_project/tasknote/README.md` §"AI-referenced docs" entries
- [ ] Single `feat: <TASK-ID> — flowtron vA.B.C (...)` commit lands
- [ ] Annotated `vA.B.C` tag created with adopter-facing release notes
- [ ] Tag pushed to origin
- [ ] PLAN.md line flipped to stub form under `## Completed`
- [ ] Tasknote archived to `_project/tasknote/archive/core/<TASK-ID>.md`
```

Subtasks (parameterized): mirror CORE-048's 6-line subtask list with the same shape — line-numbered references will need re-resolution via grep at execution time (they drift between releases).

## Step 4 — Drive Phase 1: Discovery

Walk the Phase 1 checklist per SPEC §"📝 Phase 1: Discovery". Most boxes tick fast — the recipe is canonical:

- **Reviewed PLAN.md** — already done in Step 1 of this skill.
- **Relevance Assessment** — Verdict: Proceed. Rationale: bump pattern is well-established; commit log + version drift verified in Step 2.
- **Read relevant source files** — `SPEC.md:3`, `SPEC/versioning.md` patch + minor lines (locate by content), `docs/MIGRATION.md` example pin (grep for `(e.g., v`).
- **Archive skim** — `_project/tasknote/archive/core/` for prior release tasknotes (CORE-048, CORE-046, CORE-043). Note any structural drift in their precedents that this release should account for.
- **Drift check** — verify the cited locations: `SPEC.md:3` reads `**Version:** vX.Y.Z`; SPEC/versioning.md patch line reads `vX.Y.Z → vX.Y.(Z+1)`; minor line reads `vX.Y.x → vX.(Y+1).0`; docs/MIGRATION.md grep returns one example pin at `(e.g., vX.Y.Z)`. Surface any drift before continuing.
- **Adopter migration impact** — for each commit since the last tag, classify whether it requires adopter action (new template section, new doc-set entry, BREAKING change with migration steps). Capture findings in Discovery Notes — feeds the Migration block of the tag message in Phase 4. CORE-047 (in CORE-048's release) is the canonical example of a context-sensitive migration block.
- **Clarifying questions** — typically none. If the bump is major, or if any commit's adopter impact is ambiguous, AskUserQuestion to confirm the migration block contents.
- **Subtasks populated** — already populated in Step 3 from the recipe.

Tick boxes as each step completes. Do not enter Phase 2 until every Phase 1 box is ticked.

## Step 5 — Drive Phase 2: Execution

Apply the 3 doc edits in order:

1. **`SPEC.md:3`** — `**Version:** vX.Y.Z` → `**Version:** vA.B.C`.
2. **`SPEC/versioning.md`** — patch example shift `vX.Y.Z → vX.Y.(Z+1)` → `vA.B.C → vA.B.(C+1)`; minor example shift `vX.Y.x → vX.(Y+1).0` → `vA.B.x → vA.(B+1).0`. Major (`vN.x.y → v(N+1).0.0` style) stays as-is — already future-looking. Locate by content, not by line number — the lines drift between releases.
3. **`docs/MIGRATION.md`** — locate the example pin (grep for `(e.g., v`) and bump `(e.g., vX.Y.Z)` → `(e.g., vA.B.C)`. Historical references like `v1.0 additions` stay (write-once historical context, per CORE-046 precedent).

Verify post-edit with a single grep across the live doc set:

```sh
grep -rn 'vX\.Y\.Z' SPEC.md SPEC/ docs/ README.md templates/ claude/ 2>/dev/null
```

Returns empty if the doc set is clean. Archived tasknotes under `_project/tasknote/archive/` are write-once and keep their historical version refs.

Tick boxes; populate Implementation Notes with the diff shape (typical: 3 files, +4/−4).

## Step 6 — Drive Phase 3: Testing & Linting

Markdown-prose edits only — no test surface. Run a markdown lint mental-pass on the 3 edited files:

- Edits are single-token version-string substitutions; surrounding prose unchanged.
- No frontmatter touched; no fenced blocks broken.

If a viz/code feature ships in this release, surface that the feature's own tasknote already ran its test pass — `/release` does not re-run feature tests. The viz suite stays untouched unless the release itself touches viz code (it shouldn't).

## Step 7 — Drive Phase 4: Closure

Walk the closure steps in order. Tag-message review and commit-go are explicit gates — wait for the user.

### 7.1 — Doc-drift sweep

Walk every entry in `_project/tasknote/README.md` §"AI-referenced docs". State per-entry verdict ("no change" or the specific update). Today's set: `README.md`, `SPEC.md`, `docs/MIGRATION.md`, `claude/CLAUDE-snippet.md`. The 3 doc edits in Phase 2 are the expected updates for SPEC + MIGRATION; README and CLAUDE-snippet usually need no change. If any AI-referenced doc has drifted in a way the release should fix, fix it now.

### 7.2 — Auto-draft annotated tag message

Use CORE-048's structure as the template:

```
flowtron vA.B.C — <one-clause headline>

<one-paragraph summary derived from commit log + adopter-impact findings>

Changes since vX.Y.Z:

<area heading 1>:
- <feat: line, paraphrased — one feature per bullet, with adopter-facing impact>

<area heading 2>:
- <feat: line, paraphrased>

Migration:
<auto-detected from adopter-impact findings; "no required project-side edits" if none>
```

Group commits by area where natural (e.g., `viz/`, `SPEC contract`, `Doc currency`). Skip chore/internal commits in the Changes block — the block is adopter-facing, not exhaustive history. Surface the draft to the user for review/edit. Common adjustments: regrouping the Changes block, rewording the Migration block, adding/removing entries.

Lock the tag message when the user approves. Save it for use in step 7.5.

### 7.3 — Final Summary + flip PLAN line + move tasknote

Write the tasknote's `**Final Summary:**` block (one paragraph: what shipped + adopter-impact summary) and set `**Archived:** YYYY-MM-DD`.

Edit `_project/PLAN.md`:

- Replace the un-checked release task line with stub form: `- [x] **<TASK-ID>** [<model>] | <shortname> — Completed YYYY-MM-DD.` (drop the long description per SPEC §"`## Completed` archive convention").
- Move the line from its current section to the top of `## Completed`.

Move the tasknote file: `git mv _project/tasknote/<TASK-ID>.md _project/tasknote/archive/core/<TASK-ID>.md`.

### 7.4 — Stage and surface commit message

Stage explicitly (do NOT use `git add .` or `-A` — there may be unrelated unstaged work):

```sh
git add SPEC.md SPEC/versioning.md docs/MIGRATION.md _project/PLAN.md
git add _project/tasknote/archive/core/<TASK-ID>.md
```

(`git mv` from 7.3 already staged the rename; the explicit `add` is defensive.)

Surface the commit message and wait for **commit-go** (e.g. "yes", "go", "commit"):

```
feat: <TASK-ID> — flowtron vA.B.C (<one-clause summary>)
```

Do not commit unprompted.

### 7.5 — Commit, tag, push

On commit-go, in this order:

1. `git commit` with the surfaced message.
2. `git tag -a vA.B.C -F -` with the approved message from 7.2 (HEREDOC).
3. Surface the tag and ask explicitly before pushing — the tag is harder to revise after push.
4. On push-go: `git push origin <current-branch>` then `git push origin vA.B.C`.

Verify each step before moving to the next (`git log -1 --stat`, `git tag --list vA.B.C`, `git ls-remote --tags origin vA.B.C`).

## Step 8 — Recap and post-closure protocol

The post-closure protocol is canonical in SPEC §"Post-closure protocol" (commit / suggest next move / offer copy-paste line). For releases:

- **Recap** — one paragraph of what shipped (version, headline features, adopter migration if any). Drop the "verification request" — the verification IS the push.
- The commit-go is satisfied by step 7.5; the suggest-next-move and copy-paste-line follow in the same response as the push confirmation.
- The next move is typically the next pending child in the cohort that filed this release, or `/file-followup` for any drift surfaced during the cut.

## Notes

- **Flowtron-self only.** This skill is never symlinked into adopter projects. Adopters consume flowtron via submodule pin and the manual bump procedure in `docs/MIGRATION.md` §"Pinning and bumping".
- **Why no args.** A flowtron release is a coordinated cut — there is at most one pending `release v*` task in PLAN at a time. The PLAN-line filing happens before `/release` runs; the skill scans for the line. Multiple un-cut releases queued is a process smell; the skill bails to surface it.
- **Tag-message review is mandatory.** The auto-draft seeds the structure; the user is expected to review and edit. CORE-048's deviation from CORE-046's "no required project-side edits" boilerplate (calling out CORE-047's adopter action item) is the canonical example of context-sensitive editing — a rote auto-draft would have missed it.
