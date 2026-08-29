---
name: ft-release
description: Cut a flowtron release — version bump, doc-currency shifts, doc-drift sweep, single `feat:` commit, annotated tag, VERSION-HISTORY prepend, push. Use when the user asks to cut or ship a flowtron release. Flowtron-self only (global symlink); never installed in adopter projects. Encodes the CORE-048 / CORE-046 / CORE-043 release recipe.
---

# release — flowtron self-host release skill

You are cutting a flowtron release. The recipe is canonical (CORE-048 / CORE-046 / CORE-043 precedents): SPEC.md version bump · docs/MIGRATION.md pin bump · doc-drift sweep · single `feat:` commit · annotated tag · curated `docs/VERSION-HISTORY.md` prepend · push. This skill scaffolds and drives a release tasknote through the full 4-phase flow.

This skill is **flowtron-self only**. It is symlinked under `~/.claude/skills/ft-release` and `~/.claude/commands/ft-release.md` for global invocation, but it never runs in adopter projects. Step 0 enforces this.

The release task is normally filed in `.flowtron/PLAN.md` as a one-line entry before `/ft-release` runs — for example:

```text
- [ ] **<TASK-ID>** [model] | release vX.Y.Z — Cut vX.Y.Z minor release tagging <FEAT-A> + <FEAT-B> since v<prev>.
```

`/ft-release` scans PLAN for the entry and drives it. If no such entry exists, Step 1 offers to draft and file one itself (task ID, version, and description all self-computed from repo state) rather than just bouncing the user to file it by hand. The skill takes **no arguments**.

## Step 0 — Verify cwd is the flowtron repo

The skill bails if invoked outside flowtron's own checkout:

- `SPEC.md` exists at the repo root with the heading `# Flowtron — Workflow Specification` on line 1.
- `.flowtron/PLAN.md` exists (flowtron's own PLAN.md, not an adopter's `.flowtron/core/PLAN.md`).
- `.flowtron/core/SPEC.md` does NOT exist (its presence means we're inside an adopting project — `/ft-release` must not run there).

If any check fails, stop. Tell the user `/ft-release` only runs from inside the flowtron repo (typical: `~/code/flowtron`). Do not modify any files.

## Step 1 — Find the pending release task in PLAN.md

Read `.flowtron/PLAN.md`. Scan un-checked task lines under `## High | Medium | Low` (and `## Critical` if a legacy heading is still present — see SPEC §"Task-line format"; skip `## Completed` and `## Future Opportunities`) whose `| <shortname>` segment matches `release v*` (case-insensitive — e.g., `release vX.Y.Z`).

- **Zero matches.** Don't just bounce the user to file it by hand — offer to draft and file the line now (Step 1.1 below), same as if it had already existed. Only fall back to stopping if the user declines.
- **Multiple matches.** Stop. List the matches and tell the user `/ft-release` requires exactly one pending release task. Ask them to close/de-scope the duplicates or restructure to a single line. Do not scaffold.
- **Exactly one match.** Capture the `<TASK-ID>`, the `[model]` segment, the `| <shortname>` segment, the long description, and the section heading (priority). Continue.

Parse the **target version** from the shortname: `release v<X.Y.Z>` → `vX.Y.Z`. If the shortname doesn't conform, stop and ask the user to fix the line.

### Step 1.1 — Zero-matches fallback: draft and file the line

Runs only when Step 1 found no pending `release v*` line. Computes the same version/bump-kind facts Step 2 would, just earlier, so the two never disagree — this step does not replace Step 2's own confirmation, it just gets the PLAN line in place first.

1. **Compute the proposed version.** Read `SPEC.md:3` for the current version. Run `git describe --tags --abbrev=0` and confirm it matches — if it doesn't, stop and surface the drift exactly as Step 2 would (don't file a new release line over an already-broken state). Run `git log <last-tag>..HEAD --oneline`, classify each commit by Conventional-Commits prefix (same rule as Step 2: `feat!:`/`BREAKING CHANGE:` → major, `feat:` → minor, everything else → patch), and take the highest-rank classification as the proposed bump kind. Apply it to the current version for the proposed new version. If there are zero commits since the last tag, stop and tell the user there is nothing to release yet.
2. **Suggest a task ID.** Flowtron-self release tasknotes always use the `CORE` area (every prior `release v*` entry does). Scan `.flowtron/PLAN.md`, `.flowtron/tasknote/`, and `.flowtron/tasknote/archive/core/` for the highest existing `CORE-<N>` and suggest `CORE-<N+1>`.
3. **Draft the shortname, model, and description.** Shortname: `release v<A.B.C>`. Model: `[medium]🧩` (matches every prior release entry). Long description: `Cut v<A.B.C> <bump-kind> release tagging <FEAT-A> + <FEAT-B> since v<prev>.` — name the feature-level task IDs found in the classified commit log (e.g. from `feat: <TASK-ID> — ...` subjects), not every individual commit.
4. **Surface the draft and ask.** AskUserQuestion with the fully drafted line shown verbatim (e.g. `- [ ] **CORE-<N>** [medium]🧩 | release vA.B.C — ...`) and options: **File it and continue** (default) / **Let me edit the task ID, version, or description first** / **I'll file it myself — stop here**. Honor edits before filing.
5. **On accept, append the line** under `## Medium` in `.flowtron/PLAN.md` (bottom of the section, or replacing a `(none)` placeholder) using the canonical task-line grammar. Do **not** commit this edit separately — flowtron's own release history shows the pending line and its Step 7.3 flip-to-Completed have always landed in the single release commit together, never as a standalone filing commit, so this follows the same pattern. Then proceed exactly as if Step 1 had found this line as its one match — capture the same fields, and skip re-deriving the bump proposal in Step 2 since it was already computed here.
6. **On decline ("I'll file it myself"),** stop with the original message: "No pending `release v*` task in PLAN.md. File a one-liner first (e.g., `**<TASK-ID>** [model] | release vX.Y.Z — ...`), then run `/ft-release` again." Do not scaffold.

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

```text
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

## Step 2.5 — Context-budget self-assessment (escape hatch)

Before scaffolding the tasknote (Step 3), self-assess whether the **remaining context budget** is comfortable for a full release cut driven inline in this session. A full cut is a long, multi-file motion: the 3 version edits (Step 5), the dogfood-gate walk (per-agent `AskUserQuestion` + stamp edits), the `/ft-audit docs` subroutine (5 passes over the doc set, Step 7.1), tag-message drafting (Step 7.2), and the commit/tag/push sequence (Step 7.5). Driving all of that with little headroom risks a degraded cut.

- **Comfortable** → proceed to Step 3 and drive the cut inline. This is the default — the skill drives the whole release in one session; the escape hatch never fires.
- **Tight** → do **not** scaffold. Surface an **offer** and let the operator decide (self-assess + offer; the assistant flags, the human chooses):
  - **Drive inline now** — proceed to Step 3 anyway (operator accepts the tight budget).
  - **Defer to a fresh chat** — nothing is scaffolded. The pending `release v*` PLAN line found in Step 1 is the *only* prerequisite and already exists, so there is nothing new to file — the deferral hands the whole skill to a clean context. Tell the user to `/clear` and re-run `/ft-release` in a fresh session: it re-scans PLAN, picks up the same pending line, and self-assesses again with a full budget. Emit the re-entry as the canonical copy-paste cue (🧠 label line, then the invocation alone on its own line as inline-code with no trailing punctuation; `/ft-release` takes no args):

    ```markdown
    🧠 Clear your session, then run:
    `/ft-release`
    ```

**Re-entry is `/ft-release`, not `/ft-task <TASK-ID>`.** The release recipe (3 version edits · dogfood gate · annotated tag · push) lives in *this* skill; running `/ft-task` against the pre-filed release line would drive the generic 4-phase flow without any of it. The escape hatch defers the release skill itself to a clean context — it does not hand off to the tasknote runner.

## Step 3 — Scaffold the release tasknote

Copy `templates/tasknote-template.md` to `.flowtron/tasknote/<TASK-ID>.md` and populate the frontmatter:

- `title:` — the PLAN-line shortname (e.g., `release vX.Y.Z`).
- `status:` — `in-progress`.
- `created:` — today's date (`YYYY-MM-DD`).
- `related-tasks:` — populate from the PLAN-line long description's referenced task IDs (e.g., `[<FEAT-A>, <FEAT-B>]` when those features triggered the bump). Include the most recent prior release tasknote as a precedent reference (e.g., `[<FEAT-A>, <FEAT-B>, <PREV-RELEASE>]`).

🎯 Goal — one sentence drafted from the PLAN-line long description.

Pre-populate `## ✅ Acceptance` and `## 🧩 Subtasks` with the canonical 7-step recipe parameterized to `vX.Y.Z` (current) and `vA.B.C` (new). Mirror CORE-048's archived tasknote shape — the Acceptance and Subtasks sections there are the canonical template.

Acceptance (parameterized):

```markdown
- [ ] SPEC.md `**Version:** vX.Y.Z` → `vA.B.C`
- [ ] docs/MIGRATION.md example pin bumped `vX.Y.Z` → `vA.B.C`
- [ ] SECURITY.md release-tag example pin bumped `vX.Y.Z` → `vA.B.C`
- [ ] Dogfood gate resolved — every dogfooded row (Claude / Grok / Codex / Cursor) refreshed from a real verification run at `vA.B.C`, or recorded `skipped @ vA.B.C` (per `docs/AGENT-COMPAT.md` §"Reading the cells")
- [ ] SOP-currency check run — `SPEC/procedures/*.md` reported clean, or drift candidates adjudicated and a follow-up filed (stamps left un-bumped either way)
- [ ] Phase 4 doc-drift sweep run across all `.flowtron/tasknote/README.md` §"AI-referenced docs" entries
- [ ] Single `feat: <TASK-ID> — flowtron vA.B.C (...)` commit lands
- [ ] Annotated `vA.B.C` tag created with adopter-facing release notes
- [ ] `docs/VERSION-HISTORY.md` prepended with a curated entry for `vA.B.C` (minor/major: headline + 2–4 main bullets + optional secondary; patch: one-line subject)
- [ ] Tag pushed to origin
- [ ] PLAN.md line flipped to stub form under `## Completed`
- [ ] Tasknote archived to `.flowtron/tasknote/archive/core/<TASK-ID>.md`
```

Subtasks (parameterized): mirror CORE-048's 6-line subtask list with the same shape — line-numbered references will need re-resolution via grep at execution time (they drift between releases).

## Step 4 — Drive Phase 1: Discovery

Walk the Phase 1 checklist per SPEC §"📝 Phase 1: Discovery". Most boxes tick fast — the recipe is canonical:

- **Reviewed PLAN.md** — already done in Step 1 of this skill.
- **Relevance Assessment** — Verdict: Proceed. Rationale: bump pattern is well-established; commit log + version drift verified in Step 2.
- **Read relevant source files** — `SPEC.md:3`, `docs/MIGRATION.md` example pin (grep for `describe --tags`).
- **Archive skim** — `.flowtron/tasknote/archive/core/` for prior release tasknotes (CORE-048, CORE-046, CORE-043). Note any structural drift in their precedents that this release should account for.
- **Drift check** — verify the cited locations: `SPEC.md:3` reads `**Version:** vX.Y.Z`; docs/MIGRATION.md grep returns one example pin at `(e.g., \`vX.Y.Z\`)`. Surface any drift before continuing.
- **Adopter migration impact** — for each commit since the last tag, classify whether it requires adopter action (new template section, new doc-set entry, BREAKING change with migration steps). Capture findings in Discovery Notes — feeds the Migration block of the tag message in Phase 4. CORE-047 (in CORE-048's release) is the canonical example of a context-sensitive migration block.
- **Clarifying questions** — typically none. If the bump is major, or if any commit's adopter impact is ambiguous, AskUserQuestion to confirm the migration block contents.
- **Subtasks populated** — already populated in Step 3 from the recipe.

Tick boxes as each step completes. Do not enter Phase 2 until every Phase 1 box is ticked.

## Step 5 — Drive Phase 2: Execution

Apply the 3 version edits in order:

1. **`SPEC.md:3`** — `**Version:** vX.Y.Z` → `**Version:** vA.B.C`.
2. **`docs/MIGRATION.md`** — locate the example pin (grep for `describe --tags`) and bump `(e.g., \`vX.Y.Z\`)` → `(e.g., \`vA.B.C\`)`. Historical references like `v1.0 additions` stay (write-once historical context, per CORE-046 precedent).
3. **`SECURITY.md`** — locate the release-tag example pin (grep for `release tags (e.g.`) and bump `(e.g. \`vX.Y.Z\`)` → `(e.g. \`vA.B.C\`)`.

Verify the `v`-prefixed pins post-edit:

```sh
grep -rn 'vX\.Y\.Z' SPEC.md SPEC/ docs/ README.md SECURITY.md templates/ claude/ 2>/dev/null
```

The three `v`-prefixed pins above should be clean.

**Dogfood gate — walk the dogfooded rows (dogfood-or-explicit-skip).** Since CORE-224 the doc set carries `last-verified` version stamps (`docs/AGENT-COMPAT.md` matrix, `claude/CAPABILITIES.md`, and per-agent `docs/PLATFORMS.md` stubs) formatted `vX.Y.Z · YYYY-MM[-DD] (context-tag)`. These are **not** release pins. Per the release-gate obligation (`docs/AGENT-COMPAT.md` §"Reading the cells"), **every row carrying a `dogfooded` history must be resolved at each release** — refreshed from a real verification run at the new version, or recorded as a deliberate skip. Leaving a stale stamp silently untouched is not a valid release state. Walk it now:

1. **Enumerate the dogfooded rows.** Grep the `docs/AGENT-COMPAT.md` matrix for stamps carrying a `(dogfooded…)` tag — today: **Claude**, **Grok**, **Codex**, **Cursor**. (`unverified` / `docs-only` rows are *noted-not-gated*: skip them entirely; they rest on launch coverage until first dogfooded and are exempt from the gate.)
2. **For each dogfooded agent, force a resolution** — AskUserQuestion whether a real flowtron session was run under that agent at `vA.B.C`:
   - **Refreshed** — bump the stamp prefix to `vA.B.C` + today's date, keep `(dogfooded)`, and **drop any prior `; skipped @ …` suffix** (the row is current again).
   - **Skipped** — keep the prefix pinned to the last *real* verification (do **not** bump it), and set/bump the suffix to `; skipped @ vA.B.C`. Result shape: `v4.4.0 · 2026-06-01 (dogfooded; skipped @ vA.B.C)`.
3. **Apply each agent's resolution across all its stamp locations together** (so the matrix and the footers never drift): Claude → `docs/AGENT-COMPAT.md` matrix row + `claude/CAPABILITIES.md` §"Last verified"; Grok + Codex + Cursor → `docs/AGENT-COMPAT.md` matrix rows + their `docs/PLATFORMS.md` per-agent footers.

**Stamp-write ownership under parallel dogfooding.** This walk resolves *every* dogfooded row, not just the row for the agent driving this session — so if another agent session is dogfooding in parallel (e.g. exercising `/ft-release` or `docs/DOGFOOD.md` independently toward the same release), only apply step 3's file writes here if **this** session is the one carrying the cut through to §7's tag/push. If this session is the parallel one instead, do not write the stamp files — report the refreshed/skipped verdict and evidence conversationally back to the operator so the release-driving session's own walk can apply it. Writing from both sides races: a row resolved before its real result exists (correct when written) can be overtaken and need hand reconciliation before tagging (CORE-406).

**Grep residue is expected for skipped rows.** A skipped stamp keeps its old prefix on purpose, so the grep above will still surface the pre-release `vX.Y.Z` inside it — that is a *recorded skip*, not drift. Confirm every remaining `vX.Y.Z` hit is either (a) a stamp on a row you just resolved as skipped, (b) a write-once archived tasknote under `.flowtron/tasknote/archive/` (these keep their historical version refs), or (c) a `last-verified:` stamp in `SPEC/procedures/*.md` (a SOP↔source sync stamp, **never** a release pin — see the SOP-currency check below). Any other hit is real drift — fix it before continuing.

**Standing SOP-currency check (flag-don't-bump).** `SPEC/procedures/*.md` carries a third kind of currency stamp: `last-verified: <version> · <YYYY-MM-DD>`, tracking when the agent-neutral SOP was last re-checked against the upstream surfaces its `source:` and `restates:` fields declare (schema: `SPEC/procedures/README.md` §"Frontmatter schema"). Unlike the dogfood rows above, **a release cut never bumps this stamp** — it records a SOP↔upstream sync event, not a release pin (CORE-361 / CORE-356 precedent). But nothing else surfaces its drift either, which is how CORE-390's fold sat un-mirrored in the SOP for two weeks until CORE-395 caught it by hand. Walk it now — **flag only**:

For each `SPEC/procedures/<procedure>.md`, read its `source:`, its `restates:`, and the **date** half of `last-verified:`, then walk both tiers since that date, ignoring commits that also touched the SOP:

```sh
for sop in SPEC/procedures/*.md; do
  [ "$(basename "$sop")" = "README.md" ] && continue
  src=$(sed -n 's/^source: *//p' "$sop")
  restates=$(sed -n 's/^restates: *//p' "$sop")
  stamp=$(sed -n 's/^last-verified: *//p' "$sop" | sed 's/.*· *//')
  echo "== $sop  (source: $src, verified: $stamp)"

  # Tier 1 — mirrored surfaces: one adjudicable candidate per drifting commit.
  # $(echo …) splits the path list in zsh too — a bare $src does NOT split there
  # and would silently match no paths, reporting clean. Do not "simplify" it.
  for c in $(git log --format=%H --since="$stamp" -- $(echo "$src")); do
    git show --name-only --pretty=format: "$c" | grep -qx "$sop" \
      || git log -1 --format='   DRIFT CANDIDATE  %h %s' "$c"
  done

  # Tier 2 — restated contract surfaces: one advisory count per path.
  for r in $(echo "$restates"); do
    n=$(for c in $(git log --format=%H --since="$stamp" -- "$r"); do
          git show --name-only --pretty=format: "$c" | grep -qx "$sop" || echo x
        done | wc -l | tr -d ' ')
    [ "$n" -gt 0 ] && echo "   note: $n $r commits since stamp — skim if the SOP restates a changed section"
  done
done
```

**Run the block as written** — the `$(echo "$src")` wrappers are a portability guard, not noise. Both fields hold space-separated path lists, and zsh (the common interactive shell) does not word-split a bare `$src`; it would match no paths and print a clean verdict for a drifting SOP. A silent false negative is the one failure a drift detector must not have, so keep the wrappers even though bash and `sh` split without them.

Anchor on the **date**, not the stamp's version and not the SOP's last-touched commit. The version decouples from the date whenever a SOP is re-checked mid-cycle (CORE-395 stamped `v5.14.1` on 2026-08-02; the tag itself is dated 2026-07-27), so a version anchor reports every post-tag commit as false drift. A last-touched-commit anchor is worse: a *touch* is not a *verification* — CORE-387 touched the SOP after CORE-390 touched `source:`, so anchoring there hides the older drift entirely. Commits that changed both files in one commit are in-sync mirrors, which is why both tiers filter them.

**Why the second tier is a count, not more candidates.** A SOP tracks two kinds of upstream. `source:` names surfaces it mirrors, where a commit that skipped the SOP is probably drift and worth naming. `restates:` names broad contract (`SPEC.md`) that the whole repo edits, where most commits touch nothing the SOP restates — listing each one measured at 12-16 candidates per cut against the 0-2 this check is designed around, which is how an advisory check gets rubber-stamped into uselessness (CORE-409). The count keeps that drift *visible* without demanding a verdict on each commit. Note that `source:` accepts **multiple** space-separated paths and directories: a bare `SKILL.md` anchor misses drift that lands only in a skill's lazy fragments or in `templates/`.

Resolution — this check **flags, it does not fix and it does not bump**:

- **No candidates** — state "SOP currency: clean" and continue. A tier-2 note alone is still clean; mention the count in the verdict.
- **Candidates found** — surface them, then adjudicate each with the user: a commit with no neutral-layer surface (e.g. a change to a Claude-only skill-dispatch field) is dismissed with a one-line reason; anything else means the SOP has genuinely fallen behind. For a real finding, **file a follow-up** via `/ft-file-followup` (a SOP re-check is a full tasknote — CORE-395 was +73/−3 across five insertion points — and does not belong inside a release cut). Then continue the cut.
- **Tier-2 note** — skim the SOP's restated sections against the named path only if the count looks material or a candidate already suggests the SOP is behind. It never demands a per-commit verdict, and on its own it never blocks or files anything.

**This is advisory, not a gate.** Unlike the dogfood gate above it never blocks commit-go: a stale SOP is a filed follow-up, not a reason to hold a release. Record the verdict (clean, or candidates + their adjudication + the follow-up ID) in Implementation Notes, and carry the one-line summary into the §7.4 closure review.

Tick boxes; populate Implementation Notes with the diff shape (the 3 version edits, plus any dogfood-gate stamp refreshes/skips landed by the walk above, plus the SOP-currency verdict).

## Step 6 — Drive Phase 3: Testing & Linting

The 3 version edits are markdown prose — run a markdown lint mental-pass on SPEC.md, docs/MIGRATION.md, and SECURITY.md:

- Edits are single-token version-string substitutions; surrounding prose unchanged.
- No frontmatter touched; no fenced blocks broken.

Independently of the version edits, run the standing viz + fleet-updater validation gate (`AGENTS.md` §"Validation") — every cut runs this regardless of which files it touches:

```sh
npm --prefix viz test
npm --prefix viz run typecheck
npm --prefix viz run lint
node --test tools/update-adopters.test.mjs
node --check tools/update-adopters.test.mjs
node --check tools/update-adopters.mjs
```

If a viz/code feature ships in this release, surface that the feature's own tasknote already ran its test pass — `/ft-release` does not re-run feature tests beyond these standing validation gates.

## Step 7 — Drive Phase 4: Closure

Walk the closure steps in order. Tag-message review (§7.2) and the bundled 📦 commit-go (§7.4) are explicit gates — wait for the user.

### 7.1 — Doc-drift sweep (via `/ft-audit docs` subroutine)

Invoke the flowtron-self `ft-audit` skill in **subroutine mode** with the `docs` domain and the default scope (the AI-referenced docs set declared in `.flowtron/tasknote/README.md` §"AI-referenced docs"):

```text
Skill(ft-audit) with args "docs"
```

The `docs` domain walks its 5 passes (Claims vs. code · Cross-doc consistency · Cross-references · Currency · Stale content) over the declared doc set and returns the report inline. Per the dispatcher's Subroutine-safe hard rule it does **not** write tickets to `.flowtron/PLAN.md`; the release skill is the orchestrator and decides per finding whether to absorb the fix into the current cut.

For each returned finding:
- **Critical / High** — fix inline as part of the release cut (the 3 version edits in Phase 2 normally clear the routine SPEC + MIGRATION + SECURITY version-pin drift; anything else surfaced here gets the same treatment).
- **Medium / Low** — surface to the user with a one-line summary; ask whether to absorb into the release cut or file a followup via `/ft-file-followup`. Default to file-followup if uncertain (release cuts should not balloon).

If the sweep reports zero findings, state that explicitly and move on to §7.2.

**Standing wiring-consumer derivation check.** `claude/AGENTS-snippet.md` §"One-time symlink wiring" is the declared SSOT for the adopter-wiring roster (CORE-465). Its two doc consumers — `docs/MIGRATION.md` §1.6 and `claude/skills/ft-new-project/SKILL.md` Steps 7–8 — *derive* their staging and verify commands from that block instead of restating its paths, so there is no count to keep aligned. This check guards that property rather than the old count:

```sh
awk '/^### 1\.6 Commit$/,/^### 1\.7 /' docs/MIGRATION.md | grep -n '\.claude/\(commands\|skills\)/ft-'
awk '/^## Step 7 /,/^## Step 9 /' claude/skills/ft-new-project/SKILL.md | grep -n '\.claude/\(commands\|skills\)/ft-'
```

Both must produce no output and exit 1. A hit means someone re-introduced a hand-maintained roster copy into a surface that is supposed to derive one — the CORE-329.2 drift class, which stayed alive for a year because the fix was "keep four counts equal" rather than "stop counting". Fix by restoring the derivation (`grep '^ln -s' … | awk '{print $NF}'`), not by re-syncing the list — fix inline as Critical/High before cutting the release.

This check **replaces** the standing symlink-wiring *count* check that shipped at CORE-329.2 and was retired at CORE-465 as vacuous: with the consumers deriving, the counts cannot disagree.

**Standing shipped-skill parity check.** Independently of the subroutine findings, compare the exported skill inventories:

```sh
find claude/skills -mindepth 1 -maxdepth 1 -type d -exec test -f "{}/SKILL.md" \; -print | sed 's#^claude/skills/##' | sort
find codex/skills -mindepth 1 -maxdepth 1 -type d -exec test -f "{}/SKILL.md" \; -print | sed 's#^codex/skills/##' | sort
```

The two shipped inventories must match exactly by slug. This is parity of exported Flowtron skill names and routing coverage, not byte-identical skill bodies; Codex wrappers may route to `SPEC/procedures/` or to the canonical Claude skill body to avoid duplicated maintenance. A mismatch means a Flowtron skill shipped on one platform surface without the other — fix inline as Critical/High before cutting the release.

**Standing installed-surface policy check.** Independently of the subroutine findings, verify the repo-scoped adopter snippets install exactly the policy subset from `docs/PLATFORMS.md` §"Installed-surface policy", not the full shipped inventories.

Nothing here is a hand-maintained roster. The expected set is **derived** — the shipped Claude skill inventory minus the declared non-adopter categories — and the three platform snippets are **derived surfaces** of `claude/AGENTS-snippet.md` §"One-time symlink wiring", each stating its own substitution in its own file. So a newly shipped adopter skill needs no edit here at all; only a change to *policy* (a new global-only utility or flowtron-self-only skill) touches the exclusion list below. That list is the machine form of `docs/PLATFORMS.md`'s "Global-only utilities" and "Flowtron-self-only" columns:

```text
ft-audit           (forked/overlaid locally under an unprefixed name, never symlinked)
ft-audit-context   (global-only)
ft-audit-repo      (global-only)
ft-flowtron        (global-only)
ft-new-project     (global-only)
ft-release         (flowtron-self-only)
ft-stats           (global-only)
```

Run the derivation, then the four set-equality diffs:

```sh
ssot=$(grep '^ln -s ../../.flowtron/core/claude/skills/' claude/AGENTS-snippet.md \
       | awk '{print $3}' | sed -E 's#.*/##' | sort -u)

# Expected = shipped inventory minus the non-adopter categories above.
diff -u <(ls claude/skills | grep '^ft-' \
          | grep -Ev '^(ft-audit|ft-audit-context|ft-audit-repo|ft-flowtron|ft-new-project|ft-release|ft-stats)$' \
          | sort) \
        <(printf '%s\n' "$ssot")

# The SSOT's own command half must cover the same set as its skill half.
diff -u <(printf '%s\n' "$ssot") \
        <(grep '^ln -s ../../.flowtron/core/claude/commands/' claude/AGENTS-snippet.md \
          | awk '{print $3}' | sed -E 's#.*/##; s#\.md$##' | sort -u)

# Each derived platform block must be the same set under its substitution.
diff -u <(printf '%s\n' "$ssot") <(grep '^ln -s ../../.flowtron/core/codex/skills/'  codex/AGENTS-snippet.md  | awk '{print $3}' | sed -E 's#.*/##' | sort -u)
diff -u <(printf '%s\n' "$ssot") <(grep '^ln -s ../../.flowtron/core/claude/skills/' cursor/AGENTS-snippet.md | awk '{print $3}' | sed -E 's#.*/##' | sort -u)
diff -u <(printf '%s\n' "$ssot") <(grep '^ln -s ../../.flowtron/core/claude/skills/' grok/AGENTS-snippet.md   | awk '{print $3}' | sed -E 's#.*/##' | sort -u)
```

All four `diff` commands must produce no output and exit 0. A `-` line is a policy-subset skill missing from that surface; a `+` line is a slug installed that policy excludes — the forbidden-install case, now caught by the same diff rather than a separate grep pass.

The anchored `grep` prefixes are load-bearing: `codex/AGENTS-snippet.md` carries a second `ln -s` block (the maintainer hot-reload glob `codex/skills/*`), and an unanchored match would drag `*` into the set.

**Why this shape.** The predecessor hardcoded an eleven-slug expected list and repeated it across five `diff`s plus five forbidden-install `grep`s. It went stale the day `/ft-refactor` shipped (CORE-463.5 wired the skill across sixteen surfaces and all four snippets; the gate's own list was not one of them), so every one of its diffs was failing against `main` when CORE-465 found it — a roster gate that had itself drifted out of the roster. Deriving both halves removes the class: the only way to fail now is a genuine policy or wiring divergence. Fix any finding inline as Critical/High before cutting the release.

**Standing self-wiring parity check.** The checks above all compare one *declaration* to another — `claude/AGENTS-snippet.md` and its three derived platform snippets, plus the shipped `claude/skills/` listing. None resolves a symlink, so a slug correctly declared everywhere can still be unwired and unrunnable in flowtron's own checkout: `/ft-spec` shipped at CORE-352.2, passed all three, and sat missing from `.claude/` for a month. This check reads the filesystem instead.

**Local repo-scoped wiring — blocking.** Flowtron is not an adopter; its `.claude/` mirrors the full shipped inventory (`docs/PLATFORMS.md` §"Installed-surface policy" → "Flowtron's own checkout is not an adopter"). Diff both directions:

```sh
diff -u <(ls claude/skills   | grep '^ft-' | sort) <(ls .claude/skills   | grep '^ft-' | sort)
diff -u <(ls claude/commands | grep '^ft-' | sort) <(ls .claude/commands | grep '^ft-' | sort)
find .claude/skills .claude/commands -maxdepth 1 -name 'ft-*' -type l ! -exec test -e {} \; \
     -exec sh -c 'echo "DANGLING  $1 -> $(readlink "$1")"' _ {} \; | sort
find .claude/skills .claude/commands -maxdepth 1 -name 'ft-*' ! -type l -print | sort
```

All four must produce no output. A `-` line is a shipped skill with no local symlink; a `+` line or a `DANGLING` line is wiring pointing at a slug that no longer ships. The fourth command catches what the `diff` compares miss: they match on name only, so a skill directory *copied* into `.claude/` instead of symlinked passes both `diff`s and the `-type l`-filtered dangling scan, then silently diverges from source — any output here is a non-symlink entry, the same failure mode one layer in. `.claude/` is committed repo state, so the fix lands in this cut — treat any finding as Critical/High and fix inline before cutting the release.

**Machine-global wiring — advisory.** Global installs are discretionary (`docs/MIGRATION.md` §1.0 — "install each you want"), so **missing is deliberately not checked**: an uninstalled global utility is an operator choice, not drift. Only broken links and path-casing drift are reported:

```sh
find ~/.claude/skills ~/.claude/commands -maxdepth 1 -name 'ft-*' -type l ! -exec test -e {} \; \
     -exec sh -c 'echo "DANGLING  $1 -> $(readlink "$1")"' _ {} \; 2>/dev/null | sort
find ~/.claude/skills ~/.claude/commands -maxdepth 1 -name 'ft-*' -type l \
     -exec readlink {} \; 2>/dev/null | sed -E 's#(.*[Ff]lowtron)/.*#\1#' | sort | uniq -c
```

The first command should print nothing — each hit is a link left behind by a retired skill. The v5.15.0 retirements stranded nine between them: five from the `/ft-audit <domain>` fold, one each from `/ft-task --debug` and `/ft-file-followup --park`, and a skill + command pair from `/ft-quality`'s outright retirement. `docs/MIGRATION.md` §"Skills retired so far" is the authoritative table. The second should print exactly **one** line; two or more means the global links point at the same checkout through different path casings, which resolves on a case-insensitive volume and silently stops resolving on a case-sensitive one.

This check is scoped to `~/.claude/` symlink targets, not doc prose — leave `README.md:32-33`, `docs/MIGRATION.md:202-203`, and `codex/AGENTS-snippet.md:57`'s lowercase `~/code/flowtron` alone: those are generic clone-destination examples for any reader, not this machine's path, and normalizing them would publish one maintainer's local casing as adopter instruction (rationale: archived [[CORE-410.4]]).

`~/.claude/` is machine state — no commit in this cut can carry the fix — so this half **never blocks commit-go**. Fix it out of band (`rm` the dangling links, re-`ln -s` the mis-cased ones) and carry the verdict into the §7.4 closure review as one line, the same flag-don't-block posture as the SOP-currency check above.

**Glob-free by design.** The scans use `find … -name 'ft-*'` rather than a `for l in ~/.claude/skills/ft-*` loop because zsh — the common interactive shell — *errors* on an unmatched glob (`no matches found`) and aborts the loop before its body runs. A machine with no global installs would abort the check rather than report clean. Do not "simplify" these to globs; the same silent-false-negative class is why the SOP-currency block above keeps its `$(echo …)` wrappers.

**Standing README task-counter check.** `README.md:22-23` cites a closed-task count and date range that §5's version-string grep (line 159) never covers — it greps for `vX\.Y\.Z`, not a task count, so this line drifts silently between cuts (CORE-411). Recompute both from the same archive the sentence already points readers to:

```sh
find .flowtron/tasknote/archive -name "*.md" | wc -l
grep -rhoE '\*\*Archived:\*\* [0-9]{4}-[0-9]{2}-[0-9]{2}' .flowtron/tasknote/archive/*/*.md | awk '{print $2}' | sort | sed -n '1p;$p'
```

The first command is the closed-task count — one archived tasknote per closed task, standalone or epic child. The second prints the earliest and latest `**Archived:**` date; the earliest is stable (2026-04-28) and only the latest moves. Update `README.md:22-23`'s count and "as of" date to match. A handful of archived tasknotes carry an unfilled `**Archived:** YYYY-MM-DD` placeholder or omit the field (archive-hygiene misses, e.g. CORE-255), so the second command undercounts by that many; if the gap looks material, file a follow-up via `/ft-file-followup` rather than fixing archive hygiene mid-cut. This is a mechanical text substitution, same footing as the 3 version edits in Step 5 — fix inline as Critical/High before cutting the release.

**Standing mirror-pair check.** Some surfaces restate a fact that is *derived* from another surface — a roster that must list what a directory holds, a Codex description that must name the flags its Claude twin documents, a template's back-link that must resolve from the directory a skill writes it to. Nothing binds the two halves, so an edit to the source silently strands the mirror, and the gap only surfaces when a reader trips over it (CORE-EPIC-420 found four such pairs drifted at once). Each pair below is repo state — a commit in this cut can carry every fix — so all of them **block**: fix inline as Critical/High before cutting the release.

**Pair A — templates roster ↔ `templates/` directory.** Three surfaces restate what `templates/` holds: `README.md`'s repo-layout bullet, `SPEC.md:55`, and `claude/skills/ft-flowtron/SKILL.md`'s "Key docs" list. Adding or removing a file in `templates/` without editing all three strands the ones left behind:

```sh
ls templates/
grep -n 'tasknote templates (full' README.md SPEC.md claude/skills/ft-flowtron/SKILL.md
```

Three hits, one per file. **README + SPEC** carry a byte-identical roster clause: every file `ls` prints must be named in it (the seed files appear as `PLAN.md` / `tasknote-README.md`, the tasknote templates by their qualifier — `full`, `micro`, `starter`, `sidequest`). The **`ft-flowtron` hit is a deliberately compressed variant** — it is a one-line screen entry about templates, so the two seed files are exempt there; every *template* file must still be named. A file in the directory named by no clause, or a name in a clause with no file, is the drift.

The pattern is `tasknote templates (full`, not the narrower `canonical tasknote templates` this pair originally used: the `ft-flowtron` variant drops the word "canonical" and was outside the file list besides, so the pair missed that site from the day it shipped (CORE-422).

**Pair B — Claude skill flags ↔ Codex wrapper descriptions.** The shipped-skill parity check above compares slugs only and explicitly does not compare bodies, so a capability flag added to a Claude `description:` never reaches its Codex mirror. Codex dispatches by natural-language description match, so an unnamed flag is wired but undiscoverable — the CORE-420.3 drift class, minted every time a standalone skill folds into a flag on a survivor:

```sh
for d in claude/skills/ft-*/SKILL.md; do
  s=$(basename "$(dirname "$d")"); c="codex/skills/$s/SKILL.md"; [ -f "$c" ] || continue
  cf=$(grep -m1 '^description:' "$d" | sed -E 's/"[^"]*"//g' | grep -oE '\-\-[a-z][a-z-]+' | sort -u | tr '\n' ' ')
  xf=$(grep -m1 '^description:' "$c" | sed -E 's/"[^"]*"//g' | grep -oE '\-\-[a-z][a-z-]+' | sort -u | tr '\n' ' ')
  [ "$cf" = "$xf" ] || echo "MISMATCH $s | claude:[$cf] codex:[$xf]"
done
```

Must print nothing. The `sed` that strips double-quoted segments is load-bearing, not incidental: descriptions carry `args="CORE-004 --debug --fast"`-style illustrations, and counting those inflates the Claude set with flags the description never *documents* — dropping the strip takes this check from three real findings to six, half of them noise (CORE-420.5 measured both). Fix a mismatch by appending the capability to the Codex `description:` in that skill's own voice (`` With `--park`, … ``), not by copying the Claude sentence.

**Pair C — template back-link ↔ skill write target.** Every template whose nav header carries a `← PLAN.md` back-link is written by some skill into a directory one level under `.flowtron/`, so the link is always `../PLAN.md`. A template authored at the wrong depth mints a dead link on every invocation until someone follows it (CORE-420.4):

```sh
grep -rn '](\.\./PLAN\.md)' templates/
grep -rn '](\.\./\.\./PLAN\.md)' templates/
```

The first lists the templates carrying a back-link; the second must print nothing. Current write targets — a new template must land in a directory at this same depth, or the check needs a new row rather than a pass:

| Template | Written by | Write target |
|---|---|---|
| `tasknote-template.md` | `/ft-task`, `/ft-goal-task`, `/ft-epic-discovery`, `/ft-close-epic`, `/ft-release` | `.flowtron/tasknote/<ID>.md` |
| `tasknote-micro-template.md` | `/ft-micro-task` | `.flowtron/tasknote/<ID>.md` |
| `tasknote-starter-template.md` | `/ft-starter-task` | `.flowtron/tasknote/<ID>.md` |
| `sidequest-template.md` | `/ft-file-followup --park` | `.flowtron/sidequest/<ID>.md` |
| `spec-template.md` | `/ft-spec` | `.flowtron/specs/<slug>.md` (no back-link today) |

**Pair D — README counter ↔ archive count.** Already owned by the Standing README task-counter check above; not restated here. Two derivations of one number in the same section is the drift class this block exists to catch.

**Pair E — `ft-flowtron` roster ↔ shipped skills and their flags.** `claude/skills/ft-flowtron/SKILL.md`'s "Bundled skills" table restates every skill's slug and capability one-liner, and the skill's own `description:` promises "the **full** bundled skill roster." Nothing binds the table to the skills it describes, and it falls through every other net: `claude/skills/*/SKILL.md` is excluded from `.flowtron/tasknote/README.md`'s cold-start doc sweep as lazily-loaded, and Pair B compares `description:` frontmatter to `description:` frontmatter — correctly blind to body text. So a skill added, retired, or given a new flag strands the info screen silently, and the screen is where an operator goes to find out what flowtron can do (CORE-420.N found three flags missing at once and fixed them by hand; this is that class encoded).

Row coverage — bidirectional, because the roster claims to be full:

```sh
diff -u <(ls claude/skills | grep '^ft-' | sort) \
        <(grep -oE '^\| `/ft-[a-z-]+`' claude/skills/ft-flowtron/SKILL.md | sed -E 's#^\| `/##; s#`$##' | sort)
```

Flag coverage — one-directional, each skill's `description:` → its roster row:

```sh
r=claude/skills/ft-flowtron/SKILL.md
for d in claude/skills/ft-*/SKILL.md; do
  s=$(basename "$(dirname "$d")")
  row=$(grep -m1 "^| \`/$s\` |" "$r") || { echo "MISSING ROW  $s"; continue; }
  for f in $(grep -m1 '^description:' "$d" | sed -E 's/"[^"]*"//g' | grep -oE '\-\-[a-z][a-z-]+' | sort -u); do
    case "$row" in *"$f"*) ;; *) echo "MISSING FLAG $s $f" ;; esac
  done
done
```

Both must produce no output, and the `diff` must exit 0. A `-` line is a shipped skill with no roster row; a `+` line is a row for a slug that no longer ships. `MISSING FLAG` is a flag the skill documents in its own `description:` that the roster never names — fix by appending a clause to that row in the table's established shape (backticked flag, active verb, trailing clause on the existing one-liner), written from the source skill's `description:` and compressed to roster length rather than paraphrased from memory.

Three properties of this pair are deliberate, and a future edit should preserve them:

- **The flag extraction is Pair B's pipeline verbatim** — same quote-strip, so `args="CORE-004 --debug --fast"`-style illustrations are excluded here for the same load-bearing reason `CORE-420.5` measured. Keep the two in sync: a change to what counts as a *documented* flag belongs in both, or the checks start disagreeing.
- **The flag half is one-directional on purpose.** The roster may legitimately name flags a `description:` does not — `/ft-file-followup`'s row carries `--low`/`--med`/`--fut`/`--high`, which appear upstream only inside a quoted illustration (or, for `--high`, not in the `description:` at all) and are therefore stripped. Checking the reverse would report those four as drift.
- **A deleted row reports from both halves.** The loop's `MISSING ROW` guard exists so an absent row degrades to one clear line instead of every flag on that skill reporting missing and misattributing the cause.

**Pair F — park-priority flag roster ↔ mirror surfaces.** `/ft-file-followup`'s park mode documents four priority flags (`--low`, `--med`, `--fut`, `--high`) in its usage line, and five contract-layer surfaces restate that roster in their own shapes — `SPEC/tasknote-selection.md`'s park signature, `AGENTS.md`'s peer-skill roster, `docs/GLOSSARY.md`'s **sidequest** entry, `claude/skills/ft-flowtron/SKILL.md`'s `/ft-file-followup` row, and `docs/MIGRATION.md`'s retired-`ft-sidequest` replacement cell. Nothing binds them, and Pair E's flag half only covers the `ft-flowtron` table against skill `description:` frontmatter — correctly blind to these prose rosters (CORE-433.2 fixed four sites by hand after CORE-399 left them stale; this pair closes the class).

Each mirror must name all four flags. Formats differ by surface (pipe-joined, slash-separated, comma-listed, or table-escaped) — the check counts presence, not byte identity:

```sh
for f in SPEC/tasknote-selection.md AGENTS.md docs/GLOSSARY.md \
         claude/skills/ft-flowtron/SKILL.md docs/MIGRATION.md; do
  for flag in --low --med --fut --high; do
    grep -q -e "$flag" "$f" || echo "MISSING PARK FLAG $f $flag"
  done
done
```

Must print nothing. `grep -e` is load-bearing on BSD/macOS `grep`: bare `--low` is parsed as a flag, not a pattern. Fix a miss by updating the named mirror to match `claude/skills/ft-file-followup/SKILL.md`'s usage line (`--park [--low|--med|--fut|--high]`) in that surface's established shape — do not normalize every mirror to one string.

Command stubs — the same roster, one layer down, and globbed rather than named. `claude/commands/*.md` see-also sentences restate the park signature for operators, and the fixed five-mirror list above never covered them: CORE-399 added `--high` to the surfaces it named, and CORE-433.2 / CORE-440 / CORE-443 each re-verified only *those* surfaces, so `ft-starter-task.md` and `ft-epic-discovery.md` sat three flags deep across three separate correction passes until CORE-460.2. A glob, not a list, is the point — a stub added later is covered the day it lands:

```sh
for f in $(grep -l -e '--park' claude/commands/*.md); do
  grep -q -E -e '--(low|med|fut|high)' "$f" || continue
  for flag in --low --med --fut --high; do
    grep -q -e "$flag" "$f" || echo "MISSING PARK FLAG $f $flag"
  done
done
```

Must print nothing. The `continue` guard is the load-bearing half: a stub may legitimately name `--park` with **no** priority roster at all (`ft-spec.md` points at park mode in one clause without restating the flags), and demanding four flags there would mint a false positive on this check's first run. Only a stub that already commits to a partial roster is held to the full one. Fix a miss the same way as above — extend that stub's own sentence, don't normalize the wording.

**Pair G — goal-task `--worktree` roster ↔ mirror surfaces.** `/ft-goal-task` ships `--worktree` as a documented trailing flag; two surfaces restate it for operators — `claude/skills/ft-flowtron/SKILL.md`'s `/ft-goal-task` row and `docs/PLATFORMS.md`'s operator-mode-flag list. Pair B and Pair E are both blind here: `--worktree` appears only inside `args="…"` illustrations on the skill, so the quote-strip correctly excludes it from frontmatter-derived flag sets (CORE-420.N verified). A fold or doc edit that adds the flag to the skill but not these mirrors strands it silently (CORE-433.2's second drift class).

```sh
for f in claude/skills/ft-flowtron/SKILL.md docs/PLATFORMS.md; do
  grep -q -e '--worktree' "$f" || echo "MISSING WORKTREE $f"
done
```

Must print nothing. Fix by appending a clause in each surface's established shape, written from `claude/skills/ft-goal-task/SKILL.md`'s `--worktree` section rather than paraphrased from memory.

**Pair H — validation command roster ↔ 5 restatement sites.** `AGENTS.md` §"Validation" is the source of truth for the six commands that define "passing" (3 viz + `node --test` + 2 × `node --check`). Four other surfaces restate that roster — `.github/workflows/ci.yml`, `docs/CONVENTIONS.md` §"GitHub Actions CI", `.flowtron/tasknote/README.md` §"Project quick commands", and this skill's Step 6 fence — and nothing bound them, so a release-gate edit that skipped the two `node --check`s left `/ft-release` narrower than CI with no detector (CORE-430.N F2; CORE-433.4). Pair F's presence idiom covers the class; a second half pins the CI workflow to AGENTS byte-for-byte and in order, which is the "verbatim" claim CONVENTIONS makes.

Presence — each of the five sites must name all six AGENTS command strings. Formats differ (YAML `run:`, prose, bullets, fenced lines), so this is presence, not byte identity. The `/ft-release` site is scoped to Step 6: this pair's own command list lives in the same file, and a whole-file grep would never fail.

```sh
while IFS= read -r cmd; do
  [ -z "$cmd" ] && continue
  for f in AGENTS.md .github/workflows/ci.yml docs/CONVENTIONS.md \
           .flowtron/tasknote/README.md; do
    grep -q -F "$cmd" "$f" || echo "MISSING VALIDATION CMD $f :: $cmd"
  done
  awk '/^## Step 6 /, /^## Step 7 /' claude/skills/ft-release/SKILL.md \
    | grep -q -F "$cmd" || echo "MISSING VALIDATION CMD ft-release Step 6 :: $cmd"
done <<'EOF'
npm --prefix viz test
npm --prefix viz run typecheck
npm --prefix viz run lint
node --test tools/update-adopters.test.mjs
node --check tools/update-adopters.test.mjs
node --check tools/update-adopters.mjs
EOF
```

Must print nothing. `grep -F` is load-bearing: the strings contain spaces and must not be regex. `npm --prefix viz test` is *not* a substring of `npm --prefix viz run test` — the AGENTS form is the required one. `node --check tools/update-adopters.mjs` is not a substring of the `.test.mjs` form, so the two `--check`s do not collide. Carve-outs, not roster members: `npm --prefix viz ci` (CI install) and `npm --prefix viz run dev` (README quick command).

CI verbatim — AGENTS §Validation fences vs the workflow's `run:` steps, minus the install step. Must produce no output and exit 0:

```sh
ssot=$(awk '/^## Validation$/,/^## Dev Server$/' AGENTS.md | grep -E '^(npm --prefix viz |node --)')
ci=$(grep -E '^      - run: ' .github/workflows/ci.yml | sed 's/^      - run: //' | grep -vx 'npm --prefix viz ci')
diff -u <(printf '%s\n' "$ssot") <(printf '%s\n' "$ci")
```

A `-` line is an AGENTS command CI dropped or reordered; a `+` line is a CI command AGENTS does not name (other than the excluded install). Fix a miss by updating the named mirror to match `AGENTS.md` §"Validation" in that surface's established shape — do not normalize every restatement to one fence.

**Pair I — `claude/CAPABILITIES.md` flag rows ↔ non-Claude trigger tables.** `claude/CAPABILITIES.md` is the Claude-side roster of operator flags that change how a skill runs, one table row per flag; `docs/PLATFORMS.md` §"Non-Claude capability triggers" is its non-Claude mirror, one `###` section per agent reusing the same four-column shape (`claude/CAPABILITIES.md`'s own pattern note says so). Nothing bound them. Pair B and Pair E are frontmatter-derived and blind here; Pair G names `docs/PLATFORMS.md` but greps the *whole file*, so an unrelated `--worktree` in the Claude worked example satisfied it while both non-Claude tables sat two flags short — a gate that existed and still lagged the surface it guarded (CORE-460.3; `--park` / `--worktree` had been missing since they shipped, because CORE-456.2 and CORE-438.5 were each about the flags they *were* adding).

Both the roster and the section list are **derived, not listed** — a flag added to `CAPABILITIES.md`, or an agent section that later grows a flag row, is covered the day it lands:

```sh
flags=$(grep -oE '^\| \*\*`--[a-z-]+`' claude/CAPABILITIES.md \
        | grep -oE -e '--[a-z-]+' | tr '\n' ' ')
awk '/^## Non-Claude capability triggers$/,/^## When this doc is useful$/' docs/PLATFORMS.md \
| awk -v flags="$flags" '
    BEGIN { RS = "\n### "; n = split(flags, F, " ") }
    NR == 1 { next }
    { split($0, L, "\n"); sec = L[1]; hit = 0
      for (i = 1; i <= n; i++) if (F[i] != "" && index($0, F[i])) hit = 1
      if (!hit) next
      for (i = 1; i <= n; i++) if (F[i] != "" && !index($0, F[i]))
        print "MISSING TRIGGER FLAG " sec " :: " F[i] }'
```

Must print nothing. Fix a miss by adding a row to that agent's table in its established four-column shape (`Trigger | Syntax | What it controls in flowtron | When to reach for it`), written from the matching `claude/CAPABILITIES.md` row and re-stated for that platform's availability story — not paraphrased from memory, and not normalized to Claude's wording.

Four properties are deliberate, and a future edit should preserve them:

- **`tr '\n' ' '` is load-bearing on macOS.** BWK `awk` rejects a newline inside a `-v` assignment (`awk: newline in string`), so the derived roster must reach `awk` space-separated. The `F[i] != ""` guards absorb the trailing separator.
- **The section guard is Pair F's `continue` idiom one level up.** A section naming *no* flag is skipped, not failed; only one that already commits to a partial roster is held to the full one. At mint time this exempted Codex's then-flagless table alongside the three stub sections, which have no table at all — demanding four flags there would have minted false positives on the check's first run, which is how a gate gets "temporarily" commented out. The exemption is self-clearing, and Codex has already spent it: CORE-460.4 backfilled that table to 11 rows and Codex entered the gate with no edit to this check. The stub sections remain exempt until they grow a first flag row.
- **The row-shape anchor `^| **\`--`** selects flag rows only.** `CAPABILITIES.md`'s non-flag triggers (`Effort / thinking level`, `/model <name>`, `/clear`, `Structured ask`, `Sub-agent`) are correctly excluded: they are platform-native controls, not portable skill-body flags, and each agent documents its own spelling.
- **`docs/AGENT-COMPAT.md` is deliberately *not* a mirror here.** Its own §"Scope of this matrix" declares the matrix structural and defers per-agent triggers to this table; CORE-460.3 de-enumerated its Grok/Cursor rows to a pointer rather than adding a third roster to police. Same for the thin `grok/` + `cursor/AGENTS-snippet.md`, which own wiring commands only. Recorded here so a later reader does not read their absence as an oversight.

**Pair J — command-stub `argument-hint:` ↔ the flags that stub documents.** `claude/commands/ft-*.md`'s `argument-hint:` is the only flag roster Claude Code surfaces to the operator *at the moment they type the slash command*, and nothing binds it to the prose in the file it lives in. Every check above is blind here: Pairs B and E read `claude/skills/*/SKILL.md` `description:` frontmatter, Pair I reads `CAPABILITIES.md` ↔ `PLATFORMS.md`, and Pair F does glob `claude/commands/*.md` but only for the four park-priority flags. So a stub can document a flag in its own `description:` and its own Usage bullet while the hint never names it — or carry no `argument-hint:` at all, which is what `/ft-epic-discovery` had done with `--deep` since the flag shipped, alongside `/ft-stats --write` (CORE-475 found both on one pass). CORE-460.2 had already traced this exact class one field over: CORE-399's pattern survey named `ft-file-followup`'s `argument-hint` but not the two command stubs restating the same roster.

Both halves derive from the stub itself — one file per skill, no cross-file join and no listed roster, so a stub added or a flag landed later is covered the day it lands:

```sh
for f in claude/commands/ft-*.md; do
  s=$(basename "$f" .md)
  own=$( { grep -m1 '^description:' "$f" | sed -E 's/"[^"]*"//g'
           grep -o '`[^`]*`' "$f" | grep -E -- "/${s}[^a-z-]" ; } \
         | grep -oE -e '--[a-z][a-z-]+' | sort -u | tr '\n' ' ')
  [ -z "$own" ] && continue
  hint=$(grep -m1 '^argument-hint:' "$f") \
    || { echo "MISSING HINT $s :: $own"; continue; }
  for fl in $(printf '%s' "$own"); do
    case "$hint" in *"$fl"*) ;; *) echo "MISSING HINT FLAG $s $fl" ;; esac
  done
done
```

Must print nothing. `MISSING HINT` is a stub that documents at least one flag and carries no `argument-hint:` line at all; `MISSING HINT FLAG` is a documented flag the hint never names. Fix by adding or extending that stub's `argument-hint:` in the house shape — required positional first, optional segments bracketed, short alias joined with `|` (`<TASK-ID> [--fast | -f] [--unattended]`) — never by deleting the flag from the prose to quiet the check.

Four properties are deliberate, and a future edit should preserve them:

- **The flag source is stub-local and structural, which is what makes cross-references invisible.** A flag counts only from the stub's own `description:` line, or from a backticked span that invokes the stub's *own* slug. See-also sentences never reach `description:`, and every cross-reference in a body carries either a foreign slug inside the span (`` `/ft-task <TASK-ID> --debug` `` in `ft-goal-task.md`; `` `/ft-file-followup --park [--low|--med|--fut|--high]` `` in `ft-starter-task.md` and `ft-epic-discovery.md`) or no slug at all (`` `--fast` `` in both worktree stubs' "not applicable here" sentence, and in `ft-close-epic.md`'s "there is no `--fast` here"). The span rule excludes both shapes, so no phrase blocklist — `not applicable`, `there is no` — is needed or wanted; that version breaks the first time someone rewords a sentence.
- **`${s}` braces and the trailing `[^a-z-]` are both load-bearing.** zsh parses a bare `$s[` as an array subscript and dies with `bad math expression`; `grep` then receives an empty pattern, matches every span, and the check quietly starts reporting cross-references as drift instead of failing loudly. The character class stops `/ft-audit` from swallowing `/ft-audit-repo` and `/ft-audit-context` — every span ends in a backtick, so a slug at the end of one still has a character to match.
- **The quote-strip is Pair B's pipeline verbatim** — same `sed`, same load-bearing reason CORE-420.5 measured. A change to what counts as a *documented* flag belongs in B, E, and J together, or the three start disagreeing.
- **It is one-directional (prose → hint), on purpose.** A hint may legitimately name more than the prose documents: short aliases (`-f` / `-d` / `-p`), which the `--[a-z]` extraction never sees, and `ft-file-followup`'s `--low`/`--med`/`--fut`/`--high` roster, which is Pair F's job. Checking the reverse would report every one of those as drift. The same asymmetry costs a little coverage — `ft-close-epic` names `--unattended` only inside that negation clause, so it derives an empty set and passes vacuously — which is Pair F's `continue` idiom one more time: a stub documenting no flag is skipped, not failed.

Positional arguments are out of scope. `/ft-audit` (`<domain> [scope]`) and `/ft-audit-repo` (`all` / path) take arguments but no flags, so this pair is silent on their absent hints. Recorded here so a later reader does not read that silence as an oversight.

**Pair K — no-runtime mirror labels ↔ the canonical section they cite.** `docs/VISION.md` §"What we won't accept" is the canonical justification for flowtron's rejections; several surfaces restate one of them where it bears locally, and each restatement is a *labeled* mirror that names its source (`docs/CONVENTIONS.md` §"Canonical source with labeled mirrors" ratifies the pattern). Nothing binds the label to the thing it labels. Rename or delete a canonical bullet and every citation to it silently becomes a pointer to nothing; drop a pointer in an unrelated edit and the restatement reads as unsourced duplication to the next auditor — which is exactly what happened, from outside the repo, in the cross-repo sweep that routed CORE-487. Every pair above is blind here: B, E, and J are frontmatter- and flag-derived, I reads `CAPABILITIES.md` ↔ `PLATFORMS.md`, and the Phase 4 doc-drift sweep walks `docs/VISION.md` for staleness but is blind to whether the *citations pointing at it* still resolve — reading a doc for drift says nothing about labels held in five other files (CORE-491; VISION.md joined the sweep set at CORE-489.3).

**K1 — every citation resolves to a real canonical bullet.** `SPEC.md`'s PR-archetype bullets each carry `PR-rejection mirror of "<title>" in `docs/VISION.md`` or `… "<title>" above`. The cited title must still lead a bullet in the section named:

```sh
grep -oE 'PR-rejection mirror of "[^"]+" (in `docs/VISION\.md`|above)' SPEC.md |
while IFS= read -r cite; do
  title=$(printf '%s\n' "$cite" | sed -E 's/^PR-rejection mirror of "([^"]+)".*/\1/')
  case "$cite" in
    *'docs/VISION.md'*) src="docs/VISION.md"; sec="^## What we won.t accept$" ;;
    *)                  src="SPEC.md";        sec="^## What flowtron does NOT provide$" ;;
  esac
  awk -v s="$sec" '$0~s{f=1;next} f&&/^#/{exit} f&&/^- /' "$src" |
    grep -qF -- "$title" || echo "K1 MISS: \"$title\" not a bullet lead in $src"
done
```

**K2 — every point-of-use restatement still names its source.** Three sections restate one rejection as it applies to their own surface; each must still name `VISION.md`:

```sh
printf '%s\n' \
  'docs/EXTERNAL-AGENTS.md|^## Not an Orchestration Runtime|12' \
  'SPEC/gates.md|^\*\*Runtime stays out\.\*\*|6' \
  'SPEC/loop.md|^## Runtime vs\. contract|12' |
while IFS='|' read -r file pat n; do
  grep -A"$n" -e "$pat" "$file" | grep -q 'VISION\.md' \
    || echo "K2 MISS: $file — section '$pat' no longer names VISION.md"
done
```

Both must print nothing. Fix a K1 miss by updating the citation in `SPEC.md` to the canonical bullet's current lead — never by renaming the canonical bullet back to satisfy the check. Fix a K2 miss by restoring the pointer in that section's own established shape.

- **It guards labels, not prose — on purpose.** Every pair above compares *derivable* rosters: a flag set, a directory listing, a command list. Paraphrase is not derivable, and the restatements legitimately differ in shape because each applies the rule to a different surface. A byte-match across them would be brittle and would push authors toward one flattened wording, which is the value the pattern exists to keep. Wording drift stays with "markdown is the schema; the assistant catches drift" (`docs/VISION.md` §"Schema validators") — the same reason flowtron declines a validator. What is mechanical is the *label*, and that is all this pair claims.
- **The two halves are asymmetric because the surfaces are.** `SPEC.md`'s mirror is a per-bullet list with a quoted title, so K1 can resolve each citation exactly. The other three are prose sections with no quoted title, so K2 falls back to presence-of-pointer — weaker, and the weaker half is the one that catches the drift CORE-487 was filed for. Pair F's "counts presence, not byte identity" idiom, one surface over.
- **`grep -qF --` and the `^- ` filter are both load-bearing.** `-F` stops `/` and `.` in a title like `Graph / multi-agent execution runtimes` from being read as a pattern; `--` stops a future title beginning with `-` from being parsed as a flag. Restricting to `^- ` means a title mentioned in surrounding prose cannot satisfy the check — only an actual bullet lead does. Titles are cited as *prefixes* of the canonical lead (`"Loop runners"` ⊂ `**Loop runners, schedulers, and session tooling.**`), so the assertion is substring-within-a-bullet-line, not equality.
- **`docs/PHILOSOPHY.md`, `docs/WORKTREES.md`, and `README.md` are deliberately not in K2.** PHILOSOPHY and README state the rule as narrative identity rather than as a sourced restatement, and WORKTREES carries a one-clause caveat rather than a section. Adding them would police three surfaces whose job is not to be a mirror. Recorded here so a later reader does not read their absence as an oversight.
- **Release-gate only, like D and F–J.** The `drift` CI job runs the release-context-free subset (A, B, C, E) per `docs/CONVENTIONS.md` §"GitHub Actions CI"; promoting K there is a separate call, not implied by minting it.

### 7.2 — Auto-draft annotated tag message

Use CORE-048's structure as the template:

```text
flowtron vA.B.C — <one-clause headline>

<one-paragraph summary derived from commit log + adopter-impact findings>

Changes since vX.Y.Z:

<area heading 1>:
- <feat: line, paraphrased — one feature per bullet, with adopter-facing impact>

<area heading 2>:
- <feat: line, paraphrased>

Migration:
<auto-detected from adopter-impact findings; if none, start with the exact sentinel: `No required project-side edits`>
```

Group commits by area where natural (e.g., `viz/`, `SPEC contract`, `Doc currency`). Skip chore/internal commits in the Changes block — the block is adopter-facing, not exhaustive history. Surface the draft to the user for review/edit. Common adjustments: regrouping the Changes block, rewording the Migration block, adding/removing entries.

**Sentinel check (before surfacing for user review):** if the adopter-impact classification concluded no required edits, confirm the first non-empty body line under `Migration:` in the drafted message starts with `No required project-side edits` (exact casing; `update-adopters.mjs:migrationBearingTags` uses `startsWith` on this sentinel). If it doesn't, fix it before presenting the draft — a mismatch silently flags the entire adopter fleet as migration-bearing.

Lock the tag message when the user approves. Save it for use in step 7.5.

**VERSION-HISTORY entry (same lock).** Immediately after the tag message is locked, draft a curated entry for `docs/VERSION-HISTORY.md` distilled from that message — do **not** dump the full Changes block. Shape:

- **Minor / major** (`Z = 0`):

  ```markdown
  ## vA.B.C — <one-clause headline from tag subject>

  - <2–4 main theme bullets>
  - …

  Also: <optional short secondary wins, one clause or short list>.
  ```

  Drop the “Also:” line when there is nothing secondary worth naming.

- **Patch** (`Z ≠ 0`):

  ```markdown
  ### vA.B.C — <tag subject after the em-dash, or the full short subject>
  ```

  One line only — no main/secondary bullets.

Prepend the entry **immediately below** the horizontal rule that follows the intro in `docs/VERSION-HISTORY.md` (newest first). Do not rewrite historical entries. Surface the drafted entry with the locked tag message so the user can tweak density before commit-go; lock both together.

### 7.3 — Final Summary + flip PLAN line + move tasknote

Write the tasknote's `**Final Summary:**` block (one paragraph: what shipped + adopter-impact summary) and set `**Archived:** YYYY-MM-DD`.

Edit `.flowtron/PLAN.md`:

- Replace the un-checked release task line with stub form: `- [x] **<TASK-ID>** [<model>] | <shortname> — Completed YYYY-MM-DD.` (drop the long description per SPEC/tasknote-selection.md §"`## Completed` archive convention").
- Move the line from its current section to the top of `## Completed`.

Move the tasknote file with a plain `mv` — it was copied fresh in Step 3 and never committed, so it is **untracked** and `git mv` fails (`fatal: not under version control`): `mv .flowtron/tasknote/<TASK-ID>.md .flowtron/tasknote/archive/core/<TASK-ID>.md`. The §7.4 `git add` stages the archived file.

### 7.4 — Stage and surface the 📦 ready-to-commit gate

Stage explicitly (do NOT use `git add .` or `-A` — there may be unrelated unstaged work):

```sh
git add SPEC.md docs/MIGRATION.md SECURITY.md docs/VERSION-HISTORY.md .flowtron/PLAN.md
git add .flowtron/tasknote/archive/core/<TASK-ID>.md
# If the §5 dogfood-gate walk landed any refresh/skip edits, also stage the touched stamp files
# (a git add of an unchanged file is a no-op, so listing all three is safe):
git add docs/AGENT-COMPAT.md docs/PLATFORMS.md claude/CAPABILITIES.md
```

(The Step 7.3 `mv` left the archived tasknote untracked; the explicit `git add` here stages it.)

Surface the bundled 📦 ready-to-commit gate per SPEC/gates.md §"Operator-gate cues" (banner block + mandatory 1-2 sentence preview line summarising what executes on commit-go — typically "cut flowtron vA.B.C: commit the 3 version edits + any dogfood-gate stamp refreshes/skips + PLAN.md flip + tasknote archive, create annotated `vA.B.C` tag, push branch + tag to origin, and publish a GitHub Release for `vA.B.C` (or hold local, unpublished, if push-go declined)"). Alongside the SPEC-defined bundle (closure review · recap · proposed commit message), this skill carries:

- **Dogfood-gate resolution (enforcement)** — confirm the §5 walk resolved **every** dogfooded row, and surface the per-agent summary inside the closure review:

  ```text
  Dogfood gate:
    Claude  refreshed → vA.B.C
    Grok    skipped @ vA.B.C
    Codex   skipped @ vA.B.C
    Cursor  skipped @ vA.B.C
  ```

  This is a hard gate: **do not surface commit-go while any dogfooded row is unresolved** (stale prefix carrying no `; skipped @ vA.B.C` suffix for this release). An unresolved row sends you back to §5 to refresh-or-skip it before the cut continues — the gate blocks tagging until the summary shows every dogfooded row resolved.

- **SOP-currency verdict (advisory)** — carry the §5 flag-don't-bump result into the closure review as one line, e.g. `SOP currency: clean` or `SOP currency: ft-task behind source (2 candidates) → filed CORE-NNN`. Unlike the dogfood gate this **does not block commit-go**, and the `last-verified:` stamps are not among the files this cut edits.

- **Global self-wiring verdict (advisory)** — carry the §7.1 machine-global half into the closure review as one line, e.g. `Global wiring: clean` or `Global wiring: 9 dangling links, 2 path casings — fix out of band`. Like the SOP-currency verdict this **does not block commit-go**: `~/.claude/` is machine state and no file in this cut can carry the fix. The §7.1 *local* half is not reported here — it blocks upstream and is already resolved by the time this gate is reached.

- **Push-go prompt** — AskUserQuestion with default Yes, a bundled in-📦 prompt parallel to /ft-close-epic's parent-flip (per SPEC/gates.md §"Conditional skip rule" bundled-prompt override):

  ```
  Push branch + tag vA.B.C to origin on commit-go?
  (default Yes; No leaves the commit + tag local for manual push)
  ```

- **Commit message** — `feat: <TASK-ID> — flowtron vA.B.C (<one-clause summary>)`.

- **Tag message** — locked at §7.2; included by reference (the user has already approved it). Surfaced here so the user sees the full atomic motion — commit + tag + optional push — when granting commit-go.

The commit-go prompt carries the canonical `🟢 GO` prefix (e.g., `🟢 GO: Reply commit / go to land.`). Do not commit unprompted. The single 🟢 GO commit-go authorizes the atomic sequence: commit → tag → push (if push-go Yes).

### 7.5 — Commit, tag, push (atomic on 🟢 commit-go)

On 🟢 GO commit-go (push-go answer already captured in the §7.4 bundle), run in this order:

1. ▶️ RUN: `git commit` with the surfaced message.
2. ▶️ RUN: `git tag -a vA.B.C -F -` with the approved message from §7.2 (HEREDOC).
3. **If push-go was Yes** — ▶️ RUN: `git push origin <current-branch>` then `git push origin vA.B.C`, then ▶️ RUN: `gh release create vA.B.C --latest --title "<title>" --notes "<notes>"` — title is the §7.2 locked tag message's first line (`flowtron vA.B.C — <headline>`), notes is everything after it, `--latest` marks it the repo's latest release (flowtron cuts releases linearly off `main`, so this is always correct — no need to ask). A release can't be created for a tag that isn't on origin yet, so this always runs after the tag push, never before or in place of it.
   **If push-go was No** — stop after the tag; §8's 🏁 marker names the manual push + `gh release create` commands as a follow-up step.

Verify each operation before the next (`git log -1 --stat`, `git tag --list vA.B.C`, and on push-go Yes also `git ls-remote --tags origin vA.B.C` and `gh release view vA.B.C`). The separate prose "ask explicitly before pushing" pause from earlier revisions is collapsed — push approval is captured upstream as the bundled push-go prompt at §7.4, per SPEC §"Operator-gate cues" ("skill-level extensions (epic parent-flip, release push-go) bundle into 📦").

## Step 8 — Post-closure protocol (🏁 marker + suggest-next-move + copy-paste)

The post-closure protocol is canonical in SPEC §"Post-closure protocol" (steps 1-3: commit / mark landed with 🏁 / offer copy-paste line). For releases:

- **Recap** — already bundled into the §7.4 📦 gate per SPEC §"🚀 Phase 4: Closure" (not re-surfaced here). One paragraph of what shipped (version, headline features, adopter migration if any); drop the "verification request" — the verification IS the push.
- **🏁 post-commit state-marker** — once §7.5's operations land (commit + tag + push + release create on push-go Yes; commit + tag only on push-go No), emit the marker per SPEC §"Post-closure protocol" step 2:

  ```markdown
  🏁 **<TASK-ID> — committed `<sha>`, tagged `vA.B.C`, published release** · archived to `.flowtron/tasknote/archive/core/<TASK-ID>.md`
  <1-2 sentence plain-English summary of what shipped + adopter-impact>
  ```

  On push-go No, drop "published release" from the marker and append a one-line manual follow-up reminder under it (e.g., `Manual push pending: ▶️ RUN: \`git push origin <branch>\` then \`git push origin vA.B.C\`, then \`gh release create vA.B.C --latest --title "<title>" --notes "<notes>"\`.`).

- **Suggest-next-move + copy-paste line** — follow in the same response as the 🏁 marker. Candidates carry `[model]` inline per option (`**<TASK-ID>** [model] | shortname — one-sentence "why now"`). The next move is typically the next pending child in the cohort that filed this release, or `/ft-file-followup` for any drift surfaced during the cut.

## Notes

- **Flowtron-self only.** This skill is never symlinked into adopter projects. Adopters consume flowtron via submodule pin and the manual bump procedure in `docs/MIGRATION.md` §"Pinning and bumping".
- **Context-budget escape hatch (Step 2.5).** A full cut is a long session. If the remaining context budget looks tight at invocation, the skill offers to defer the whole cut to a fresh `/ft-release` chat (re-entry is `/ft-release`, not `/ft-task <TASK-ID>` — the recipe lives here) rather than driving inline on thin headroom. Comfortable budgets skip the hatch and drive inline as before.
- **Why no args.** A flowtron release is a coordinated cut — there is at most one pending `release v*` task in PLAN at a time. The PLAN-line filing normally happens before `/ft-release` runs, or Step 1.1 drafts and files it on the spot when none exists yet (still gated by an AskUserQuestion review — never a silent write). Multiple un-cut releases queued is a process smell; the skill bails to surface it.
- **Tag-message review is mandatory.** The auto-draft seeds the structure; the user is expected to review and edit. CORE-048's deviation from CORE-046's `No required project-side edits` boilerplate (calling out CORE-047's adopter action item) is the canonical example of context-sensitive editing — a rote auto-draft would have missed it.
