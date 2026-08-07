---
name: ft-release
description: Cut a flowtron release — version bump, doc-currency shifts, doc-drift sweep, single feat: commit, annotated tag, push. Use when the user asks to cut or ship a flowtron release. Flowtron-self only (global symlink); never installed in adopter projects. Encodes the CORE-048 / CORE-046 / CORE-043 release recipe.
---

# release — flowtron self-host release skill

You are cutting a flowtron release. The recipe is canonical (CORE-048 / CORE-046 / CORE-043 precedents): SPEC.md version bump · docs/MIGRATION.md pin bump · doc-drift sweep · single `feat:` commit · annotated tag · push. This skill scaffolds and drives a release tasknote through the full 4-phase flow.

This skill is **flowtron-self only**. It is symlinked under `~/.claude/skills/ft-release` and `~/.claude/commands/ft-release.md` for global invocation, but it never runs in adopter projects. Step 0 enforces this.

The release task ID must already be filed in `.flowtron/PLAN.md` as a one-line entry — for example:

```text
- [ ] **<TASK-ID>** [model] | release vX.Y.Z — Cut vX.Y.Z minor release tagging <FEAT-A> + <FEAT-B> since v<prev>.
```

`/ft-release` then scans PLAN for the entry and drives it. The skill takes **no arguments**.

## Step 0 — Verify cwd is the flowtron repo

The skill bails if invoked outside flowtron's own checkout:

- `SPEC.md` exists at the repo root with the heading `# Flowtron — Workflow Specification` on line 1.
- `.flowtron/PLAN.md` exists (flowtron's own PLAN.md, not an adopter's `.flowtron/core/PLAN.md`).
- `.flowtron/core/SPEC.md` does NOT exist (its presence means we're inside an adopting project — `/ft-release` must not run there).

If any check fails, stop. Tell the user `/ft-release` only runs from inside the flowtron repo (typical: `~/code/flowtron`). Do not modify any files.

## Step 1 — Find the pending release task in PLAN.md

Read `.flowtron/PLAN.md`. Scan un-checked task lines under `## High | Medium | Low` (and `## Critical` if a legacy heading is still present — see SPEC §"Task-line format"; skip `## Completed` and `## Future Opportunities`) whose `| <shortname>` segment matches `release v*` (case-insensitive — e.g., `release vX.Y.Z`).

- **Zero matches.** Stop. Tell the user "No pending `release v*` task in PLAN.md. File a one-liner first (e.g., `**<TASK-ID>** [model] | release vX.Y.Z — ...`), then run `/ft-release` again." Do not scaffold.
- **Multiple matches.** Stop. List the matches and tell the user `/ft-release` requires exactly one pending release task. Ask them to close/de-scope the duplicates or restructure to a single line. Do not scaffold.
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

Before scaffolding the tasknote (Step 3), self-assess whether the **remaining context budget** is comfortable for a full release cut driven inline in this session. A full cut is a long, multi-file motion: the 5 version edits (Step 5), the dogfood-gate walk (per-agent `AskUserQuestion` + stamp edits), the `/ft-audit docs` subroutine (5 passes over the doc set, Step 7.1), tag-message drafting (Step 7.2), and the commit/tag/push sequence (Step 7.5). Driving all of that with little headroom risks a degraded cut.

- **Comfortable** → proceed to Step 3 and drive the cut inline. This is the default — the skill drives the whole release in one session; the escape hatch never fires.
- **Tight** → do **not** scaffold. Surface an **offer** and let the operator decide (self-assess + offer; the assistant flags, the human chooses):
  - **Drive inline now** — proceed to Step 3 anyway (operator accepts the tight budget).
  - **Defer to a fresh chat** — nothing is scaffolded. The pending `release v*` PLAN line found in Step 1 is the *only* prerequisite and already exists, so there is nothing new to file — the deferral hands the whole skill to a clean context. Tell the user to `/clear` and re-run `/ft-release` in a fresh session: it re-scans PLAN, picks up the same pending line, and self-assesses again with a full budget. Emit the re-entry as the canonical copy-paste cue (🧠 label line, then the invocation alone on its own line as inline-code with no trailing punctuation; `/ft-release` takes no args):

    ```markdown
    🧠 Clear your session, then run:
    `/ft-release`
    ```

**Re-entry is `/ft-release`, not `/ft-task <TASK-ID>`.** The release recipe (5 version edits · dogfood gate · annotated tag · push) lives in *this* skill; running `/ft-task` against the pre-filed release line would drive the generic 4-phase flow without any of it. The escape hatch defers the release skill itself to a clean context — it does not hand off to the tasknote runner.

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
- [ ] `viz/src/ui/constants.ts` `VIZ_VERSION` bumped `vX.Y.Z` → `vA.B.C`
- [ ] `viz/package.json` `"version"` bumped `"X.Y.Z"` → `"A.B.C"` (bare semver, no `v` prefix), `viz/package-lock.json` resynced to match
- [ ] Dogfood gate resolved — every dogfooded row (Claude / Grok / Codex) refreshed from a real verification run at `vA.B.C`, or recorded `skipped @ vA.B.C` (per `docs/AGENT-COMPAT.md` §"Reading the cells")
- [ ] SOP-currency check run — `SPEC/procedures/*.md` reported clean, or drift candidates adjudicated and a follow-up filed (stamps left un-bumped either way)
- [ ] Phase 4 doc-drift sweep run across all `.flowtron/tasknote/README.md` §"AI-referenced docs" entries
- [ ] Single `feat: <TASK-ID> — flowtron vA.B.C (...)` commit lands
- [ ] Annotated `vA.B.C` tag created with adopter-facing release notes
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

Apply the 5 version edits in order:

1. **`SPEC.md:3`** — `**Version:** vX.Y.Z` → `**Version:** vA.B.C`.
2. **`docs/MIGRATION.md`** — locate the example pin (grep for `describe --tags`) and bump `(e.g., \`vX.Y.Z\`)` → `(e.g., \`vA.B.C\`)`. Historical references like `v1.0 additions` stay (write-once historical context, per CORE-046 precedent).
3. **`SECURITY.md`** — locate the release-tag example pin (grep for `release tags (e.g.`) and bump `(e.g. \`vX.Y.Z\`)` → `(e.g. \`vA.B.C\`)`.
4. **`viz/src/ui/constants.ts`** — `VIZ_VERSION = 'vX.Y.Z'` → `VIZ_VERSION = 'vA.B.C'`.
5. **`viz/package.json`** — `"version": "X.Y.Z"` → `"version": "A.B.C"`. Bare semver (no `v` prefix); mirrors VIZ_VERSION so tooling stays consistent. Also resync **`viz/package-lock.json`** — run `npm install --package-lock-only` (from `viz/`) so its `version` fields (root + `packages[""]`) follow `package.json` without touching `node_modules` or dependency ranges.

Verify the `v`-prefixed pins post-edit:

```sh
grep -rn 'vX\.Y\.Z' SPEC.md SPEC/ docs/ README.md SECURITY.md templates/ claude/ viz/src/ui/constants.ts 2>/dev/null
```

The four `v`-prefixed pins above should be clean. The `viz/package.json` and `viz/package-lock.json` versions use bare semver (`"X.Y.Z"`) and won't appear in this grep — verify them separately:

```sh
grep '"version"' viz/package.json
grep -n '"version"' viz/package-lock.json | head -2
```

**Dogfood gate — walk the dogfooded rows (dogfood-or-explicit-skip).** Since CORE-224 the doc set carries `last-verified` version stamps (`docs/AGENT-COMPAT.md` matrix, `claude/CAPABILITIES.md`, and per-agent `docs/PLATFORMS.md` stubs) formatted `vX.Y.Z · YYYY-MM[-DD] (context-tag)`. These are **not** release pins. Per the release-gate obligation (`docs/AGENT-COMPAT.md` §"Reading the cells"), **every row carrying a `dogfooded` history must be resolved at each release** — refreshed from a real verification run at the new version, or recorded as a deliberate skip. Leaving a stale stamp silently untouched is not a valid release state. Walk it now:

1. **Enumerate the dogfooded rows.** Grep the `docs/AGENT-COMPAT.md` matrix for stamps carrying a `(dogfooded…)` tag — today: **Claude**, **Grok**, **Codex**. (`unverified` / `docs-only` rows are *noted-not-gated*: skip them entirely; they rest on launch coverage until first dogfooded and are exempt from the gate.)
2. **For each dogfooded agent, force a resolution** — AskUserQuestion whether a real flowtron session was run under that agent at `vA.B.C`:
   - **Refreshed** — bump the stamp prefix to `vA.B.C` + today's date, keep `(dogfooded)`, and **drop any prior `; skipped @ …` suffix** (the row is current again).
   - **Skipped** — keep the prefix pinned to the last *real* verification (do **not** bump it), and set/bump the suffix to `; skipped @ vA.B.C`. Result shape: `v4.4.0 · 2026-06-01 (dogfooded; skipped @ vA.B.C)`.
3. **Apply each agent's resolution across all its stamp locations together** (so the matrix and the footers never drift): Claude → `docs/AGENT-COMPAT.md` matrix row + `claude/CAPABILITIES.md` §"Last verified"; Grok + Codex → `docs/AGENT-COMPAT.md` matrix rows + their `docs/PLATFORMS.md` per-agent footers.

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

Tick boxes; populate Implementation Notes with the diff shape (the 5 version edits, plus any dogfood-gate stamp refreshes/skips landed by the walk above, plus the SOP-currency verdict).

## Step 6 — Drive Phase 3: Testing & Linting

Three of the 5 edits are markdown prose — run a markdown lint mental-pass on SPEC.md, docs/MIGRATION.md, and SECURITY.md:

- Edits are single-token version-string substitutions; surrounding prose unchanged.
- No frontmatter touched; no fenced blocks broken.

The fourth and fifth edits (`viz/src/ui/constants.ts` and `viz/package.json`) are one-line string substitutions — run lint/type-check on the viz package via its own package scripts:

```sh
npm --prefix viz run lint; npm --prefix viz run typecheck; npm --prefix viz run test
node --test tools/update-adopters.test.mjs
```

If a viz/code feature ships in this release, surface that the feature's own tasknote already ran its test pass — `/ft-release` does not re-run feature tests beyond these version-string and updater-suite gates.

## Step 7 — Drive Phase 4: Closure

Walk the closure steps in order. Tag-message review (§7.2) and the bundled 📦 commit-go (§7.4) are explicit gates — wait for the user.

### 7.1 — Doc-drift sweep (via `/ft-audit docs` subroutine)

Invoke the flowtron-self `ft-audit` skill in **subroutine mode** with the `docs` domain and the default scope (the AI-referenced docs set declared in `.flowtron/tasknote/README.md` §"AI-referenced docs"):

```text
Skill(ft-audit) with args "docs"
```

The `docs` domain walks its 5 passes (Claims vs. code · Cross-doc consistency · Cross-references · Currency · Stale content) over the declared doc set and returns the report inline. Per the dispatcher's Subroutine-safe hard rule it does **not** write tickets to `.flowtron/PLAN.md`; the release skill is the orchestrator and decides per finding whether to absorb the fix into the current cut.

For each returned finding:
- **Critical / High** — fix inline as part of the release cut (the 5 version edits in Phase 2 normally clear the routine SPEC + MIGRATION + SECURITY + constants.ts + package.json version-pin drift; anything else surfaced here gets the same treatment).
- **Medium / Low** — surface to the user with a one-line summary; ask whether to absorb into the release cut or file a followup via `/ft-file-followup`. Default to file-followup if uncertain (release cuts should not balloon).

If the sweep reports zero findings, state that explicitly and move on to §7.2.

**Standing Claude symlink-wiring count check.** Independently of the subroutine findings, compare the canonical Claude adopter-wiring block against its three consumers:

```sh
grep -c "^ln -s" claude/AGENTS-snippet.md
```

That count must equal the number of `.claude/` paths in `docs/MIGRATION.md` §1.6's staging block, the number of `.claude/` paths in `claude/skills/ft-new-project/SKILL.md` Step 7's staging block, and the number of `readlink` lines in its Step 8 (whose prose count word must also match). A mismatch means a Claude adopter symlink was added to the snippet without fanning out to the consumers (the CORE-329.2 drift class) — fix inline as Critical/High before cutting the release.

**Standing shipped-skill parity check.** Independently of the subroutine findings, compare the exported skill inventories:

```sh
find claude/skills -mindepth 1 -maxdepth 1 -type d -exec test -f "{}/SKILL.md" \; -print | sed 's#^claude/skills/##' | sort
find codex/skills -mindepth 1 -maxdepth 1 -type d -exec test -f "{}/SKILL.md" \; -print | sed 's#^codex/skills/##' | sort
```

The two shipped inventories must match exactly by slug. This is parity of exported Flowtron skill names and routing coverage, not byte-identical skill bodies; Codex wrappers may route to `SPEC/procedures/` or to the canonical Claude skill body to avoid duplicated maintenance. A mismatch means a Flowtron skill shipped on one platform surface without the other — fix inline as Critical/High before cutting the release.

**Standing installed-surface policy check.** Independently of the subroutine findings, verify the repo-scoped adopter snippets install exactly the policy subset from `docs/PLATFORMS.md` §"Installed-surface policy", not the full shipped inventories.

Expected adopter-installed skill slugs:

```text
ft-close-epic
ft-epic-discovery
ft-file-followup
ft-goal-task
ft-micro-task
ft-spec
ft-starter-task
ft-task
ft-update
ft-worktree-end
ft-worktree-start
```

Forbidden repo-scoped upstream `ft-*` installs:

```text
ft-audit
ft-audit-context
ft-audit-repo
ft-flowtron
ft-new-project
ft-release
ft-stats
```

Run the exact-set checks:

```sh
diff -u <(printf '%s\n' ft-close-epic ft-epic-discovery ft-file-followup ft-goal-task ft-micro-task ft-spec ft-starter-task ft-task ft-update ft-worktree-end ft-worktree-start | sort) <(grep "^ln -s ../../.flowtron/core/claude/skills/" claude/AGENTS-snippet.md | sed -E 's#.*claude/skills/(ft-[^ ]+).*#\1#' | sort)
diff -u <(printf '%s\n' ft-close-epic ft-epic-discovery ft-file-followup ft-goal-task ft-micro-task ft-spec ft-starter-task ft-task ft-update ft-worktree-end ft-worktree-start | sort) <(grep "^ln -s ../../.flowtron/core/claude/commands/" claude/AGENTS-snippet.md | sed -E 's#.*claude/commands/(ft-[^ ]+)\.md.*#\1#' | sort)
diff -u <(printf '%s\n' ft-close-epic ft-epic-discovery ft-file-followup ft-goal-task ft-micro-task ft-spec ft-starter-task ft-task ft-update ft-worktree-end ft-worktree-start | sort) <(grep "^ln -s ../../.flowtron/core/codex/skills/" codex/AGENTS-snippet.md | sed -E 's#.*codex/skills/(ft-[^ ]+).*#\1#' | sort)
```

Then run the explicit forbidden-install checks:

```sh
grep "^ln -s ../../.flowtron/core/claude/skills/" claude/AGENTS-snippet.md | sed -E 's#.*claude/skills/(ft-[^ ]+).*#\1#' | grep -E '^(ft-audit|ft-audit-context|ft-audit-repo|ft-flowtron|ft-new-project|ft-release|ft-stats)$'
grep "^ln -s ../../.flowtron/core/claude/commands/" claude/AGENTS-snippet.md | sed -E 's#.*claude/commands/(ft-[^ ]+)\.md.*#\1#' | grep -E '^(ft-audit|ft-audit-context|ft-audit-repo|ft-flowtron|ft-new-project|ft-release|ft-stats)$'
grep "^ln -s ../../.flowtron/core/codex/skills/" codex/AGENTS-snippet.md | sed -E 's#.*codex/skills/(ft-[^ ]+).*#\1#' | grep -E '^(ft-audit|ft-audit-context|ft-audit-repo|ft-flowtron|ft-new-project|ft-release|ft-stats)$'
```

The `diff` commands must produce no output and exit 0. The forbidden-install `grep` commands must produce no output and exit 1. Any missing adopter-subset skill or any installed forbidden slug means the snippets contradict the installed-surface policy — fix inline as Critical/High before cutting the release.

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

### 7.3 — Final Summary + flip PLAN line + move tasknote

Write the tasknote's `**Final Summary:**` block (one paragraph: what shipped + adopter-impact summary) and set `**Archived:** YYYY-MM-DD`.

Edit `.flowtron/PLAN.md`:

- Replace the un-checked release task line with stub form: `- [x] **<TASK-ID>** [<model>] | <shortname> — Completed YYYY-MM-DD.` (drop the long description per SPEC/tasknote-selection.md §"`## Completed` archive convention").
- Move the line from its current section to the top of `## Completed`.

Move the tasknote file with a plain `mv` — it was copied fresh in Step 3 and never committed, so it is **untracked** and `git mv` fails (`fatal: not under version control`): `mv .flowtron/tasknote/<TASK-ID>.md .flowtron/tasknote/archive/core/<TASK-ID>.md`. The §7.4 `git add` stages the archived file.

### 7.4 — Stage and surface the 📦 ready-to-commit gate

Stage explicitly (do NOT use `git add .` or `-A` — there may be unrelated unstaged work):

```sh
git add SPEC.md docs/MIGRATION.md SECURITY.md viz/src/ui/constants.ts viz/package.json viz/package-lock.json .flowtron/PLAN.md
git add .flowtron/tasknote/archive/core/<TASK-ID>.md
# If the §5 dogfood-gate walk landed any refresh/skip edits, also stage the touched stamp files
# (a git add of an unchanged file is a no-op, so listing all three is safe):
git add docs/AGENT-COMPAT.md docs/PLATFORMS.md claude/CAPABILITIES.md
```

(The Step 7.3 `mv` left the archived tasknote untracked; the explicit `git add` here stages it.)

Surface the bundled 📦 ready-to-commit gate per SPEC/gates.md §"Operator-gate cues" (banner block + mandatory 1-2 sentence preview line summarising what executes on commit-go — typically "cut flowtron vA.B.C: commit the 5 version edits + any dogfood-gate stamp refreshes/skips + PLAN.md flip + tasknote archive, create annotated `vA.B.C` tag, push branch + tag to origin (or hold local if push-go declined)"). Alongside the SPEC-defined bundle (closure review · recap · proposed commit message), this skill carries:

- **Dogfood-gate resolution (enforcement)** — confirm the §5 walk resolved **every** dogfooded row, and surface the per-agent summary inside the closure review:

  ```text
  Dogfood gate:
    Claude  refreshed → vA.B.C
    Grok    skipped @ vA.B.C
    Codex   skipped @ vA.B.C
  ```

  This is a hard gate: **do not surface commit-go while any dogfooded row is unresolved** (stale prefix carrying no `; skipped @ vA.B.C` suffix for this release). An unresolved row sends you back to §5 to refresh-or-skip it before the cut continues — the gate blocks tagging until the summary shows every dogfooded row resolved.

- **SOP-currency verdict (advisory)** — carry the §5 flag-don't-bump result into the closure review as one line, e.g. `SOP currency: clean` or `SOP currency: ft-task behind source (2 candidates) → filed CORE-NNN`. Unlike the dogfood gate this **does not block commit-go**, and the `last-verified:` stamps are not among the files this cut edits.

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
3. **If push-go was Yes** — ▶️ RUN: `git push origin <current-branch>` then `git push origin vA.B.C`.
   **If push-go was No** — stop after the tag; §8's 🏁 marker names the manual push commands as a follow-up step.

Verify each operation before the next (`git log -1 --stat`, `git tag --list vA.B.C`, and on push-go Yes also `git ls-remote --tags origin vA.B.C`). The separate prose "ask explicitly before pushing" pause from earlier revisions is collapsed — push approval is captured upstream as the bundled push-go prompt at §7.4, per SPEC §"Operator-gate cues" ("skill-level extensions (epic parent-flip, release push-go) bundle into 📦").

## Step 8 — Post-closure protocol (🏁 marker + suggest-next-move + copy-paste)

The post-closure protocol is canonical in SPEC §"Post-closure protocol" (steps 1-3: commit / mark landed with 🏁 / offer copy-paste line). For releases:

- **Recap** — already bundled into the §7.4 📦 gate per SPEC §"🚀 Phase 4: Closure" (not re-surfaced here). One paragraph of what shipped (version, headline features, adopter migration if any); drop the "verification request" — the verification IS the push.
- **🏁 post-commit state-marker** — once §7.5's operations land (commit + tag + push on push-go Yes; commit + tag only on push-go No), emit the marker per SPEC §"Post-closure protocol" step 2:

  ```markdown
  🏁 **<TASK-ID> — committed `<sha>`, tagged `vA.B.C`** · archived to `.flowtron/tasknote/archive/core/<TASK-ID>.md`
  <1-2 sentence plain-English summary of what shipped + adopter-impact>
  ```

  On push-go No, append a one-line manual-push reminder under the marker (e.g., `Manual push pending: ▶️ RUN: \`git push origin <branch>\` then \`git push origin vA.B.C\`.`).

- **Suggest-next-move + copy-paste line** — follow in the same response as the 🏁 marker. Candidates carry `[model]` inline per option (`**<TASK-ID>** [model] | shortname — one-sentence "why now"`). The next move is typically the next pending child in the cohort that filed this release, or `/ft-file-followup` for any drift surfaced during the cut.

## Notes

- **Flowtron-self only.** This skill is never symlinked into adopter projects. Adopters consume flowtron via submodule pin and the manual bump procedure in `docs/MIGRATION.md` §"Pinning and bumping".
- **Context-budget escape hatch (Step 2.5).** A full cut is a long session. If the remaining context budget looks tight at invocation, the skill offers to defer the whole cut to a fresh `/ft-release` chat (re-entry is `/ft-release`, not `/ft-task <TASK-ID>` — the recipe lives here) rather than driving inline on thin headroom. Comfortable budgets skip the hatch and drive inline as before.
- **Why no args.** A flowtron release is a coordinated cut — there is at most one pending `release v*` task in PLAN at a time. The PLAN-line filing happens before `/ft-release` runs; the skill scans for the line. Multiple un-cut releases queued is a process smell; the skill bails to surface it.
- **Tag-message review is mandatory.** The auto-draft seeds the structure; the user is expected to review and edit. CORE-048's deviation from CORE-046's `No required project-side edits` boilerplate (calling out CORE-047's adopter action item) is the canonical example of context-sensitive editing — a rote auto-draft would have missed it.
