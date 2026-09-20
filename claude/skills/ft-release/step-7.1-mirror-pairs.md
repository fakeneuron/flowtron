# `/ft-release` §7.1 — Mirror pairs

> Lazy fragment. Loaded by `ft-release` SKILL.md §7.1 (`claude/skills/ft-release/SKILL.md`)
> alongside its sibling `step-7.1-standing-checks.md`. Walk these pairs after the
> standing checks; every pair below blocks the cut.

**Standing mirror-pair check.** Some surfaces restate a fact that is *derived* from another surface — a roster that must list what a directory holds, a Codex description that must name the flags its Claude twin documents, a template's back-link that must resolve from the directory a skill writes it to. Nothing binds the two halves, so an edit to the source silently strands the mirror, and the gap only surfaces when a reader trips over it (CORE-EPIC-420 found four such pairs drifted at once). Each pair below is repo state — a commit in this cut can carry every fix — so all of them **block**: fix inline as Critical/High before cutting the release.

**Pair A — templates roster ↔ `templates/` directory.** Two surfaces restate what `templates/` holds: `README.md`'s repo-layout bullet and `SPEC/layout.md` §"Working in the flowtron repo itself". Adding or removing a file in `templates/` without editing both strands the one left behind:

```sh
ls templates/
grep -n 'tasknote templates (full' README.md SPEC/layout.md
```

Two hits, one per file. Both carry a byte-identical roster clause: every file `ls` prints must be named in it (the seed files appear as `PLAN.md` / `tasknote-README.md`, the tasknote templates by their qualifier — `full`, `micro`, `starter`, `sidequest`). A file in the directory named by no clause, or a name in a clause with no file, is the drift.

The pattern is `tasknote templates (full`, not the narrower `canonical tasknote templates` this pair originally used: the since-retired `ft-flowtron` info screen carried a compressed variant that dropped the word "canonical" and was outside the file list besides, so the pair missed that site from the day it shipped (CORE-422) until CORE-603.2 retired the screen and its third surface with it.

**Pair B — Claude skill flags ↔ Codex wrapper descriptions.** The shipped-skill parity check in `step-7.1-standing-checks.md` compares slugs only and explicitly does not compare bodies, so a capability flag added to a Claude `description:` never reaches its Codex mirror. Codex dispatches by natural-language description match, so an unnamed flag is wired but undiscoverable — the CORE-420.3 drift class, minted every time a standalone skill folds into a flag on a survivor:

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
| `tasknote-template.md` | `/ft-task` (`--loop` included), `/ft-epic-discovery`, `/ft-close-epic`, `/ft-release` | `.flowtron/tasknote/<ID>.md` |
| `tasknote-micro-template.md` | `/ft-micro-task` | `.flowtron/tasknote/<ID>.md` |
| `tasknote-starter-template.md` | `/ft-file-followup --starter` | `.flowtron/tasknote/<ID>.md` |
| `sidequest-template.md` | `/ft-file-followup --park` | `.flowtron/sidequest/<ID>.md` |
| `spec-template.md` | by hand (no skill since CORE-573) | `.flowtron/specs/<slug>.md` (no back-link today) |

**Pair D — README counter ↔ archive count.** Already owned by the Standing README task-counter check in `step-7.1-standing-checks.md`; not restated here. Two derivations of one number in the same step is the drift class this block exists to catch.

**Pair F — park-priority flag roster ↔ mirror surfaces.** `/ft-file-followup`'s park mode documents four priority flags (`--low`, `--med`, `--fut`, `--high`) in its usage line, and four contract-layer surfaces restate that roster in their own shapes — `SPEC/tasknote-selection.md`'s park signature, `AGENTS.md`'s peer-skill roster, `docs/GLOSSARY.md`'s **sidequest** entry, and `docs/MIGRATION.md`'s retired-`ft-sidequest` replacement cell. Nothing binds them, and every frontmatter-derived check is correctly blind to these prose rosters (CORE-433.2 fixed four sites by hand after CORE-399 left them stale; this pair closes the class).

Each mirror must name all four flags. Formats differ by surface (pipe-joined, slash-separated, comma-listed, or table-escaped) — the check counts presence, not byte identity:

```sh
for f in SPEC/tasknote-selection.md AGENTS.md docs/GLOSSARY.md docs/MIGRATION.md; do
  for flag in --low --med --fut --high; do
    grep -q -e "$flag" "$f" || echo "MISSING PARK FLAG $f $flag"
  done
done
```

Must print nothing. `grep -e` is load-bearing on BSD/macOS `grep`: bare `--low` is parsed as a flag, not a pattern. Fix a miss by updating the named mirror to match `claude/skills/ft-file-followup/SKILL.md`'s usage line (`--park [--low|--med|--fut|--high]`) in that surface's established shape — do not normalize every mirror to one string.

Command stubs — the same roster, one layer down, and globbed rather than named. `claude/commands/*.md` see-also sentences restate the park signature for operators, and the fixed mirror list above never covered them: CORE-399 added `--high` to the surfaces it named, and CORE-433.2 / CORE-440 / CORE-443 each re-verified only *those* surfaces, so `ft-starter-task.md` and `ft-epic-discovery.md` sat three flags deep across three separate correction passes until CORE-460.2. A glob, not a list, is the point — a stub added later is covered the day it lands:

```sh
for f in $(grep -l -e '--park' claude/commands/*.md); do
  grep -q -E -e '--(low|med|fut|high)' "$f" || continue
  for flag in --low --med --fut --high; do
    grep -q -e "$flag" "$f" || echo "MISSING PARK FLAG $f $flag"
  done
done
```

Must print nothing. The `continue` guard is the load-bearing half: a stub may legitimately name `--park` with **no** priority roster at all (the since-retired `ft-spec.md` pointed at park mode in one clause without restating the flags), and demanding four flags there would mint a false positive. Only a stub that already commits to a partial roster is held to the full one. Fix a miss the same way as above — extend that stub's own sentence, don't normalize the wording.

**Pair G — retired.** Guarded the `/ft-goal-task` `--worktree` roster against its two mirror surfaces; [[CORE-571]] folded the skill into `/ft-task --loop` without the flag, so there is nothing left to mirror. The letter is kept so later pair citations stay stable.

**Pair H — validation command roster ↔ 5 restatement sites.** `AGENTS.md` §"Validation" is the source of truth for the seven commands that define "passing" (4 viz + `node --test` + 2 × `node --check`). Four other surfaces restate that roster — `.github/workflows/ci.yml`, `docs/CONVENTIONS.md` §"GitHub Actions CI", `.flowtron/tasknote/README.md` §"Project quick commands", and `/ft-release` SKILL.md's Step 6 fence — and nothing bound them, so a release-gate edit that skipped the two `node --check`s left `/ft-release` narrower than CI with no detector (CORE-430.N F2; CORE-433.4). Pair F's presence idiom covers the class; a second half pins the CI workflow to AGENTS byte-for-byte and in order, which is the "verbatim" claim CONVENTIONS makes.

Presence — each of the five sites must name all seven AGENTS command strings. Formats differ (YAML `run:`, prose, bullets, fenced lines), so this is presence, not byte identity. The `/ft-release` site is scoped to Step 6 by `awk`. That scoping was originally self-defence — this pair's command list used to live inside `SKILL.md` itself, so a whole-file grep could never fail — and since CORE-507 moved the pair into this fragment it is no longer needed for that reason. Keep it anyway: scoped to the Step 6 fence the check asserts the commands sit in the validation gate, where the "verbatim" claim applies, rather than passing on an incidental mention elsewhere in `SKILL.md`.

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
npm --prefix viz run build
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

- **Lifted into the CI `drift` job, like N, O, P and Q.** A roster command lands in `validate` one commit at a time — [[CORE-622.4]] added `run build` and five mirrors sat stale until an audit read them — and both halves are pure functions of the commit, so the miss belongs on the commit that lands it. One step carries both halves; Pair L binds the CI copy to the two blocks above. The copy puts the presence heredoc inside `ci.yml` itself, so the presence half's `ci.yml` hit is satisfied by that heredoc in either run; the CI-verbatim half is the binding check for that surface and is stricter, so nothing is lost.

**Pair I — `claude/CAPABILITIES.md` flag rows ↔ non-Claude trigger tables.** `claude/CAPABILITIES.md` is the Claude-side roster of operator flags that change how a skill runs, one table row per flag; `docs/PLATFORMS.md` §"Non-Claude capability triggers" is its non-Claude mirror, one `###` section per agent reusing the same four-column shape (`claude/CAPABILITIES.md`'s own pattern note says so). Nothing bound them. Pair B is frontmatter-derived and blind here; Pair G names `docs/PLATFORMS.md` but greps the *whole file*, so an unrelated `--worktree` in the Claude worked example satisfied it while both non-Claude tables sat two flags short — a gate that existed and still lagged the surface it guarded (CORE-460.3; `--park` / `--worktree` had been missing since they shipped, because CORE-456.2 and CORE-438.5 were each about the flags they *were* adding).

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

**Pair J — command-stub `argument-hint:` ↔ the flags that stub documents.** `claude/commands/ft-*.md`'s `argument-hint:` is the only flag roster Claude Code surfaces to the operator *at the moment they type the slash command*, and nothing binds it to the prose in the file it lives in. Every check above is blind here: Pair B reads `claude/skills/*/SKILL.md` `description:` frontmatter, Pair I reads `CAPABILITIES.md` ↔ `PLATFORMS.md`, and Pair F does glob `claude/commands/*.md` but only for the four park-priority flags. So a stub can document a flag in its own `description:` and its own Usage bullet while the hint never names it — or carry no `argument-hint:` at all, which is what `/ft-epic-discovery` had done with `--deep` since the flag shipped, alongside the since-retired `/ft-stats --write` (CORE-475 found both on one pass). CORE-460.2 had already traced this exact class one field over: CORE-399's pattern survey named `ft-file-followup`'s `argument-hint` but not the two command stubs restating the same roster.

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

- **The flag source is stub-local and structural, which is what makes cross-references invisible.** A flag counts only from the stub's own `description:` line, or from a backticked span that invokes the stub's *own* slug. See-also sentences never reach `description:`, and every cross-reference in a body carries either a foreign slug inside the span (`` `/ft-task --fast` `` in `ft-micro-task.md`; `` `/ft-file-followup --park [--low|--med|--fut|--high]` `` in `ft-epic-discovery.md`) or no slug at all (`` `--fast` `` in `ft-close-epic.md`'s "there is no `--fast` here"). The span rule excludes both shapes, so no phrase blocklist — `not applicable`, `there is no` — is needed or wanted; that version breaks the first time someone rewords a sentence.
- **`${s}` braces and the trailing `[^a-z-]` are both load-bearing.** zsh parses a bare `$s[` as an array subscript and dies with `bad math expression`; `grep` then receives an empty pattern, matches every span, and the check quietly starts reporting cross-references as drift instead of failing loudly. The character class stops `/ft-audit` from swallowing `/ft-audit-repo` — every span ends in a backtick, so a slug at the end of one still has a character to match.
- **The quote-strip is Pair B's pipeline verbatim** — same `sed`, same load-bearing reason CORE-420.5 measured. A change to what counts as a *documented* flag belongs in B, E, and J together, or the three start disagreeing.
- **It is one-directional (prose → hint), on purpose.** A hint may legitimately name more than the prose documents: short aliases (`-f` / `-d` / `-p`), which the `--[a-z]` extraction never sees, and `ft-file-followup`'s `--low`/`--med`/`--fut`/`--high` roster, which is Pair F's job. Checking the reverse would report every one of those as drift. The same asymmetry costs a little coverage — `ft-close-epic` names `--unattended` only inside that negation clause, so it derives an empty set and passes vacuously — which is Pair F's `continue` idiom one more time: a stub documenting no flag is skipped, not failed.

Positional arguments are out of scope. `/ft-audit` (`<domain> [scope]`) and `/ft-audit-repo` (`all` / path) take arguments but no flags, so this pair is silent on their absent hints. Recorded here so a later reader does not read that silence as an oversight.

**Pair K — no-runtime mirror labels ↔ the canonical section they cite.** `docs/VISION.md` §"What we won't accept" is the canonical justification for flowtron's rejections; several surfaces restate one of them where it bears locally, and each restatement is a *labeled* mirror that names its source (`docs/CONVENTIONS.md` §"Canonical source with labeled mirrors" ratifies the pattern). Nothing binds the label to the thing it labels. Rename or delete a canonical bullet and every citation to it silently becomes a pointer to nothing; drop a pointer in an unrelated edit and the restatement reads as unsourced duplication to the next auditor — which is exactly what happened, from outside the repo, in the cross-repo sweep that routed CORE-487. Every pair above is blind here: B, E, and J are frontmatter- and flag-derived, I reads `CAPABILITIES.md` ↔ `PLATFORMS.md`, and the Phase 4 doc-drift sweep walks `docs/VISION.md` for staleness but is blind to whether the *citations pointing at it* still resolve — reading a doc for drift says nothing about labels held in five other files (CORE-491; VISION.md joined the sweep set at CORE-489.3).

**K1 — every citation resolves to a real canonical bullet.** `SPEC/scope-boundaries.md`'s PR-archetype bullets each carry `PR-rejection mirror of "<title>" in `docs/VISION.md`` or `… "<title>" above`. The cited title must still lead a bullet in the section named:

```sh
grep -oE 'PR-rejection mirror of "[^"]+" (in `docs/VISION\.md`|above)' SPEC/scope-boundaries.md |
while IFS= read -r cite; do
  title=$(printf '%s\n' "$cite" | sed -E 's/^PR-rejection mirror of "([^"]+)".*/\1/')
  case "$cite" in
    *'docs/VISION.md'*) src="docs/VISION.md"; sec="^## What we won.t accept$" ;;
    *)                  src="SPEC/scope-boundaries.md"; sec="^## What flowtron does NOT provide$" ;;
  esac
  awk -v s="$sec" '$0~s{f=1;next} f&&/^#/{exit} f&&/^- /' "$src" |
    grep -qF -- "$title" || echo "K1 MISS: \"$title\" not a bullet lead in $src"
done
```

**K2 — every point-of-use restatement still names its source.** Three sections restate one rejection as it applies to their own surface; each must still name `VISION.md`:

```sh
printf '%s\n' \
  'docs/EXTERNAL-AGENTS.md|^## Not an Orchestration Runtime|12' \
  'SPEC/gate-postures.md|^\*\*Runtime stays out\.\*\*|6' \
  'SPEC/loop.md|^## Runtime vs\. contract|12' |
while IFS='|' read -r file pat n; do
  grep -A"$n" -e "$pat" "$file" | grep -q 'VISION\.md' \
    || echo "K2 MISS: $file — section '$pat' no longer names VISION.md"
done
```

Both must print nothing. Fix a K1 miss by updating the citation in `SPEC/scope-boundaries.md` to the canonical bullet's current lead — never by renaming the canonical bullet back to satisfy the check. Fix a K2 miss by restoring the pointer in that section's own established shape.

- **It guards labels, not prose — on purpose.** Every pair above compares *derivable* rosters: a flag set, a directory listing, a command list. Paraphrase is not derivable, and the restatements legitimately differ in shape because each applies the rule to a different surface. A byte-match across them would be brittle and would push authors toward one flattened wording, which is the value the pattern exists to keep. Wording drift stays with "markdown is the schema; the assistant catches drift" (`docs/VISION.md` §"Schema validators") — the same reason flowtron declines a validator. What is mechanical is the *label*, and that is all this pair claims.
- **The two halves are asymmetric because the surfaces are.** `SPEC/scope-boundaries.md`'s mirror is a per-bullet list with a quoted title, so K1 can resolve each citation exactly. The other three are prose sections with no quoted title, so K2 falls back to presence-of-pointer — weaker, and the weaker half is the one that catches the drift CORE-487 was filed for. Pair F's "counts presence, not byte identity" idiom, one surface over.
- **`grep -qF --` and the `^- ` filter are both load-bearing.** `-F` stops `/` and `.` in a title like `Graph / multi-agent execution runtimes` from being read as a pattern; `--` stops a future title beginning with `-` from being parsed as a flag. Restricting to `^- ` means a title mentioned in surrounding prose cannot satisfy the check — only an actual bullet lead does. Titles are cited as *prefixes* of the canonical lead (`"Loop runners"` ⊂ `**Loop runners, schedulers, and session tooling.**`), so the assertion is substring-within-a-bullet-line, not equality.
- **`docs/PHILOSOPHY.md`, `docs/WORKTREES.md`, and `README.md` are deliberately not in K2.** PHILOSOPHY and README state the rule as narrative identity rather than as a sourced restatement, and WORKTREES carries a one-clause caveat rather than a section. Adding them would police three surfaces whose job is not to be a mirror. Recorded here so a later reader does not read their absence as an oversight.
- **`SPEC.md`'s always-loaded summaries are deliberately not in K2 either — they mirror the contract, not the justification.** §"What flowtron does NOT provide" and §"Loop tasks" each restate a rejection, so both read as K2 candidates; each cites the `SPEC/` module that owns the **contract** (`SPEC/scope-boundaries.md`, `SPEC/loop.md`), where K2 asserts presence of the **justification** (`grep -q 'VISION\.md'`). They are labeled mirrors of a different canonical, one layer down — [[CORE-558.2]] restored them as compactions of their module *"with no new claim, so the mirror relationship is unchanged"* — and adding a `VISION.md` pointer to always-loaded SPEC core to satisfy this check would spend the budget the shrink exists to protect ([[CORE-558.5]]). Naming the class rather than the one section is deliberate: the same restore minted three summaries in this shape (§"Cross-repo edit remit" is the third), so a bullet naming only one would invite the same re-filing against its sibling. Nothing binds a `SPEC.md` summary to the module it cites — [[CORE-558.2]]'s link-and-citation validator was a one-off Phase 3 run, not a standing check — and this pair does not claim to; the gap is recorded here as scope, not coverage.
- **Release-gate only, like D and F–I.** The `drift` CI job runs the release-context-free subset (A, B, C, J, M, N, O, P, Q) per `docs/CONVENTIONS.md` §"GitHub Actions CI"; promoting K there is a separate call, not implied by minting it.


**Pair L — `drift` CI job ↔ the §7.1 sources it lifts.** `docs/CONVENTIONS.md` §"GitHub Actions CI" states the relationship plainly: the `drift` job's steps are *"lifted from §7.1, adapted only to fail the step on a finding."* That makes every step a hand-maintained second copy of a check whose original lives here (Pairs A, B, C), in `step-7.1-standing-checks.md` (shipped-skill parity), or in `SPEC/layout.md` §"Skill namespace" (wrapper-name invariant) — and **nothing bound the copies**. [[CORE-535.3]] repaired Pair A's roster grep from `SPEC.md` to `SPEC/layout.md` here and missed the CI twin, so the `drift` job failed on every push from that commit through the entire v5.25.0 cut, reddening the README badge with no gate reading it ([[CORE-546]]). Pair H binds the *`validate`* job's `run:` steps to `AGENTS.md` §"Validation"; the `drift` job had no equivalent. This is it.

What is compared is the **set of repo paths each check reads** — derivable from both surfaces, and exactly what drifted. Byte identity is not available: the CI copy legitimately adds `bad=` accumulators, `|| exit 1`, and its own findings prose.

```sh
paths() { sed 's/echo "[^"]*"//g' \
          | grep -oE '(\.?[A-Za-z0-9_-]+/)+[A-Za-z0-9_*.-]*|\b[A-Z][A-Za-z0-9_-]*\.(md|yml)\b' \
          | sort -u; }

printf '%s\n' \
  'Wrapper-name invariant|SPEC/layout.md|^[*][*]Wrapper-name invariant' \
  'Shipped-skill parity|claude/skills/ft-release/step-7.1-standing-checks.md|^[*][*]Standing shipped-skill parity check' \
  'Context budget|claude/skills/ft-release/step-7.1-standing-checks.md|^[*][*]Standing context-budget check' \
  'Pair A|claude/skills/ft-release/step-7.1-mirror-pairs.md|^[*][*]Pair A ' \
  'Pair B|claude/skills/ft-release/step-7.1-mirror-pairs.md|^[*][*]Pair B ' \
  'Pair C|claude/skills/ft-release/step-7.1-mirror-pairs.md|^[*][*]Pair C ' \
  'Pair H|claude/skills/ft-release/step-7.1-mirror-pairs.md|^[*][*]Pair H ' \
  'Pair J|claude/skills/ft-release/step-7.1-mirror-pairs.md|^[*][*]Pair J ' \
  'Pair M|claude/skills/ft-release/step-7.1-mirror-pairs.md|^[*][*]Pair M ' \
  'Pair N|claude/skills/ft-release/step-7.1-mirror-pairs.md|^[*][*]Pair N ' \
  'Pair O|claude/skills/ft-release/step-7.1-mirror-pairs.md|^[*][*]Pair O ' \
  'Pair P|claude/skills/ft-release/step-7.1-mirror-pairs.md|^[*][*]Pair P ' \
  'Pair Q|claude/skills/ft-release/step-7.1-mirror-pairs.md|^[*][*]Pair Q ' |
while IFS='|' read -r step src pat; do
  ci=$(awk -v s="$step" '
        index($0,"- name: "s)    {inb=1; next}
        inb && /^      - name: / {inb=0}
        inb' .github/workflows/ci.yml | paths)
  s7=$(awk -v p="$pat" '
        $0~p                     {ins=1; next}
        ins && inf && /^```$/    {inf=0; next}
        ins && !inf && /^```sh$/ {inf=1; next}
        ins && !inf && /^[*][*]/ {ins=0}
        ins && inf' "$src" | paths)
  [ "$ci" = "$s7" ] || {
    echo "PAIR L MISS: $step — CI drift job and its §7.1 source disagree on paths"
    diff <(printf '%s\n' "$ci") <(printf '%s\n' "$s7") | sed 's/^/         /'
  }
done
```

Must print nothing. A `<` line is a path the CI copy reads and its §7.1 source does not; a `>` line is the reverse. **Fix direction is asymmetric: repair the CI copy to match §7.1, never the reverse.** §7.1 is the superset and the source — `docs/CONVENTIONS.md` says so — and the v5.25.0 failure was precisely a CI copy left behind by a correct §7.1 repair.

- **The step-name prefix is the join key.** The mapping's first field matches `- name: ` by `index()` prefix, so a step keeps its binding when its parenthetical changes — at v5.25.0 the wrapper-name step read `(SPEC.md §"Skill namespace")` and still resolved. A pair lifted as two CI steps (as Pair E was, until CORE-603.2 retired it with the `ft-flowtron` screen it guarded) shares one prefix and unions against its source's fenced blocks, which is why the key is a prefix and not the full name.
- **Bracket classes, not `\*`, in the passed patterns.** The anchors travel through `-v p=` and are applied as *dynamic* regexes, where awk processes string escapes first: `^\*\*Pair B ` arrives as `^**Pair B ` — a malformed quantifier that silently matches far more than intended, which during development swallowed every later fence in the file. `[*][*]` has no escape to lose. Same family as §"Glob-free by design" in the standing checks: a matcher that fails open reports clean instead of reporting the truth.
- **`echo`-argument text is stripped from both sides.** The adaptation delta lives in the findings messages, and Pair C's CI copy names `.flowtron/` inside one (`"skills write templates one level under .flowtron/"`). Stripping quoted `echo` arguments compares what each check *reads* rather than what it *says*. Every mapped step still yields at least one path after the strip, so no step is silently vacuous — check that property when adding a step.
- **Coverage is the thirteen lifted checks, and only those.** `docs/CONVENTIONS.md` §"GitHub Actions CI" deliberately keeps SOP currency, the README task counter, installed-surface policy, self-wiring, Pairs D, F, I, and K, and Pair A's content half in §7.1 alone. Pair L claims nothing about them; a new step added to the `drift` job needs a new mapping row here, or it ships unbound.
- **Release-gate only, like D, F, I and K.** Promoting L into the `drift` job would make the job the sole judge of its own fidelity to a source it would then also be lifting — recorded here so a later reader does not read its absence as an oversight.

**Pair M — skill `description:` ↔ its command stub's `argument-hint:`.** A skill's `description:` is the surface an agent *dispatches* from: what Claude Code, Codex, Cursor or Grok matches natural language against when it picks which skill to run. A flag absent from it is wired, documented for humans in the body, named in the stub, and still invisible to that agent. Every check above is blind to this, and the blindness is structural rather than accidental: Pair B compares `description:` to `description:`, so it *derives* its work from the very field that is short. When a skill documents no flags at all, B's two halves derive `[]`, compare equal, and pass. It is not wrong about what it compares — the missing information is on a third surface — but the joint effect is that a skill implementing flags its `description:` never names sails through the whole block. [[CORE-554]] found three at once: `/ft-micro-task` named none of its two, `/ft-goal-task` none of its three, and `/ft-task` omitted `--fast`, the last two because their flags appeared only inside `args="…"` illustrations that Pair B's quote-strip correctly discards.

`claude/commands/ft-*.md`'s `argument-hint:` is the ground truth, and Pair J is what makes it trustworthy — J holds each hint to the flags its own stub documents, so the hint cannot quietly fall behind. Both halves are one file each with no cross-file join, so a skill added or a flag landed later is covered the day it lands:

```sh
for d in claude/skills/ft-*/SKILL.md; do
  s=$(basename "$(dirname "$d")"); c="claude/commands/$s.md"
  [ -f "$c" ] || { echo "MISSING STUB  $s"; continue; }
  df=" $(grep -m1 '^description:' "$d" | sed -E 's/"[^"]*"//g' \
         | grep -oE '\-\-[a-z][a-z-]+' | sort -u | tr '\n' ' ')"
  for fl in $(grep -m1 '^argument-hint:' "$c" | grep -oE '\-\-[a-z][a-z-]+' | sort -u); do
    case "$fl" in --low|--med|--fut|--high) continue ;; esac
    case "$df" in *" $fl "*) ;; *) echo "UNDOCUMENTED FLAG $s $fl" ;; esac
  done
done
```

Must print nothing. `UNDOCUMENTED FLAG` is a flag the stub's hint offers the operator that the skill's own `description:` never documents; `MISSING STUB` is a shipped skill with no command stub at all. Fix an `UNDOCUMENTED FLAG` by adding a clause to that skill's `description:` in the house shape — `` With `--flag`, <active verb> `` or `` `--flag` <verb>s … `` — written from the skill's own Step 0 parse so the clause states what the flag actually does, and **never** by deleting the flag from the `argument-hint:` to quiet the check. Expect a fix here to cascade: Pair B will then demand the Codex twin.

Five properties of this pair are deliberate, and a future edit should preserve them:

- **The flag extraction is Pair B's pipeline verbatim** — same quote-strip, same load-bearing reason CORE-420.5 measured. That obligation is now four-way: a change to what counts as a *documented* flag belongs in B, E, J, and M together, or the four start disagreeing. Pair J states the same rule from its side.
- **It runs opposite to Pair J, and the two compose into a chain.** J is prose → hint; M is hint → `description:`. Together they carry a flag from the stub's Usage bullet all the way to the dispatch surface, and Pair B then carries it across to Codex — which is why M covers only the Claude half and needs no Codex twin of its own.
- **The park-priority exemption names Pair F's owned set, and is not a blocklist.** `/ft-file-followup`'s hint carries `--low`/`--med`/`--fut`/`--high`; its `description:` documents the `--park` mode they modify and would bloat past readability listing all four. Those four flags already have a pair — F, across five contract surfaces and every `--park` stub — so M defers rather than duplicating. The `case` names exactly that set; do not grow it into a general skip list for whatever fires next.
- **Short aliases are invisible by construction.** The `--[a-z]` extraction never sees `-f` / `-d` / `-p`, so a hint's `[--fast | -f]` contributes only `--fast`, exactly as in B, E and J. No description is ever asked to spell an alias.
- **It is silent on a flag named in a `description:` but in no hint.** That is J's `MISSING HINT FLAG` one layer down when the stub's prose documents it, and otherwise a mismatch between a skill and a stub that no pair claims. Recorded here so a later reader does not read the silence as an oversight — and so that anyone tempted to close it does so with a new pair rather than by making M bidirectional, which would report every deliberate asymmetry above as drift.

**Pair N — `[unattended]` candidacy mirrors ↔ `SPEC/unattended-candidacy.md`.** [[CORE-EPIC-577]] made every filing surface *propose* `[unattended]` candidates at its write step, under one rule that lives once in `SPEC/unattended-candidacy.md`: attended, the candidates ride the surface's existing confirm gate; under `--fast` / `--unattended` the filer emits an `unattended-candidates:` line and writes no token. Each filer carries a labeled mirror at its write step (`docs/CONVENTIONS.md` §"Canonical source with labeled mirrors") plus that literal, so the emission shape is the same string on every surface and an operator-less caller can grep for one thing. Nothing bound the mirrors to the module: a filer that Reads the module and paraphrases the line, or names a section the module has since renamed, degrades differently from its siblings with no detector — and the `.N` audit's promise is precisely that every surface degrades *identically*. Pair K guards the same class for the no-runtime rule and is scoped to `docs/VISION.md` by construction; every other pair is roster- or flag-derived and blind here.

Trigger is naming the module, not an allowlist of filers — a skill that starts Reading `SPEC/unattended-candidacy.md` is bound the day it does. `claude/skills/ft-release/` is excluded because this pair is the check's home, not a filer:

```sh
bad=
for f in $(grep -rl 'SPEC/unattended-candidacy\.md' claude/skills --include='*.md' | grep -v '^claude/skills/ft-release/'); do
  grep -q 'unattended-candidates:' "$f" || { echo "NO CANDIDATES LITERAL  $f"; bad=1; }
  grep -qE 'mirror of `SPEC/unattended-candidacy\.md` §"[^"]+"' "$f" || { echo "NO LABELED MIRROR  $f"; bad=1; }
done
[ -z "$bad" ] || exit 1
```

Must print nothing. `NO CANDIDATES LITERAL` is a filer that cites the module but never emits the line it defines; `NO LABELED MIRROR` is a citation with no label in the fixed shape `` mirror of `SPEC/unattended-candidacy.md` §"<section>" ``. Fix both on the filer, in the module's §"Surfaces and mirrors" shape.

- **Lifted into the CI `drift` job, unlike K.** K's mirrors are prose sections in `docs/`; N's are lines in skill bodies that the `.3`–`.6` children of [[CORE-EPIC-577]] land one commit at a time, and a child that ships a mirror without the literal is exactly the between-cuts drift the job exists for. Pair L binds the CI copy to the block above.
- **Vacuous at birth, on purpose.** At the module's own landing ([[CORE-577.2]]) no filer named it yet, so the loop iterated nothing and the step passed empty. Pair L's "every step still yields at least one path" property holds regardless — `claude/skills` and `SPEC/unattended-candidacy.md` survive the `echo` strip.
- **Whether the label still resolves is Pair Q's half.** N checked its own labels against a `## ` heading in the module until [[CORE-622.3]] generalised that resolution to every path-bearing citation in live markdown; the label is a backticked `` `SPEC/unattended-candidacy.md` §"<section>" `` citation, so Q reads it with no shape of its own here. N keeps the two presence halves Q cannot know about — that a filer emits the literal, and that its citation is *labeled* as a mirror.

**Pair O — filing runners ↔ `SPEC/plan-filing.md` §"Filing commits".** Five skill bodies commit their own filing at hand-off — `/ft-file-followup` (default, `--park`, `--starter`), `/ft-audit`, and `/ft-refactor` — and `/ft-seed` commits its row edits the same way ([[CORE-619]]), all under one contract that lives once in §"Filing commits": a pre-check that sets `auto-commit = `, a post-stage read of the **whole** index (`git diff --cached`, no pathspec, not `--quiet`) so a foreign hunk is seen before the commit publishes it, and a citation naming the section that owns the rule. Each runner restates the motion in its own step shape, and nothing bound them: [[CORE-563]] minted the contract and four runners, [[CORE-591]] patched `/ft-refactor`'s pre-check only, and the runner sat without a post-stage read until [[CORE-593]] — three commits over one rule, each leaving a different runner short, with no detector between them. Pair N guards the same class for `[unattended]` candidacy and is scoped to `SPEC/unattended-candidacy.md` by construction; every other pair is roster- or flag-derived and blind to a skill body's *procedure*.

Trigger is the `auto-commit = ` literal, not an allowlist of runners — a skill that starts setting the flag is bound the day it does. `claude/skills/ft-release/` is excluded because this pair is the check's home, not a filer. The citation half asks only that a runner *name* a module path next to the section, so a module split that moves the section (the one [[CORE-595]] made, out of `SPEC/tasknote-selection.md`) needs no edit here — whether the named module still carries the heading is Pair Q's question:

```sh
bad=
for f in $(grep -rl 'auto-commit = ' claude/skills --include='*.md' | grep -v '^claude/skills/ft-release/'); do
  grep -e 'git diff --cached' "$f" | grep -qv -e '--quiet' || { echo "NO POST-STAGE DIFF  $f"; bad=1; }
  grep -qE 'SPEC/[A-Za-z0-9_.-]+\.md[`)]? §"Filing commits"' "$f" || { echo "NO RESOLVING CITATION  $f"; bad=1; }
done
[ -z "$bad" ] || exit 1
```

Must print nothing. `NO POST-STAGE DIFF` is a runner that sets `auto-commit = ` but never reads the staged index before committing — every `git diff --cached` it carries is the pre-check's `--quiet` probe; `NO RESOLVING CITATION` is a runner with no path-bearing `` `SPEC/<module>.md` §"Filing commits" `` citation (a bare `per §"Filing commits"` shorthand is fine *alongside* one, not instead of it). Fix both on the runner, in the shape `ft-file-followup/starter-mode.md` uses (a `git add` / `git diff --cached` / `git commit` fence plus a **Post-stage verification** paragraph — [[CORE-593]] is the worked example).

- **Lifted into the CI `drift` job, like N.** The runners are skill bodies edited one commit at a time, and a partial repair is exactly what shipped three times in a row; a between-cuts detector is the point. Pair L binds the CI copy to the block above.
- **The `--quiet` exclusion is what separates the two reads.** The pre-check runs `git diff --cached --quiet` to learn whether the index is empty; the post-stage verification runs `git diff --cached` to *read* it. Both are the same command prefix, so a presence grep would pass on the pre-check alone — which is precisely the state `/ft-refactor` was in between [[CORE-591]] and [[CORE-593]]. `grep -qv` on the second stage asks for at least one line that is not the probe.
- **Three citation shapes count, on purpose.** Runners write the citation as `` `SPEC/x.md` §"…" `` (backticked), `SPEC/x.md §"…"` (bare), or `](../../../SPEC/x.md) §"…"` (a markdown link — `ft-task/unattended-mode.md`'s shape, not a filer today). The `[`)]?` class absorbs the closing backtick or paren; the same three shapes are what Pair Q extracts, so a citation that passes here is one Q resolves. A fourth shape needs a class edit in both, not a new pair.
- **`STALE CITATION` retired into Pair Q.** Until [[CORE-622.3]] this block also opened each named module and anchored `^## Filing commits`; Q resolves the same citation against a heading-or-bold-lead prefix instead. The one thing lost is the anchor — a `## Filing commits` mention inside a fence would satisfy Q's prefix match — and the title is fixed by contract, so the trade is a general detector for a one-string one.

**Pair P — archived tasknotes ↔ SPEC.md §"Acceptance tick-through".** Closure's contract is one paragraph: tick every `## ✅ Acceptance` box the work satisfied, annotate the rest in place (`N/A — <reason>` / `not met — <reason>`), flip YAML `status:` to `completed`, then move the note. Nothing executed it. The 2026-09-19 `/ft-audit-repo` pass found 13 of 132 September archivals carrying only bare `- [ ]` under Acceptance — [[CORE-608]]'s closure line says "all three ticked" above three unticked boxes — and [[CORE-593]] archived with `status: in-progress`; `[unattended]` closures missed at 24% against 6% attended ([[CORE-EPIC-610]]). Every pair above reads skill bodies, stubs, or contract modules; none reads the archive, so a closure that *claims* the tick-through and skips it is invisible until the next audit. Archived tasknotes are historical records (SPEC.md §"Write-once policy"), so the check applies from a **date floor** forward and never asks for a backfill: a note whose `**Archived:**` stamp is before 2026-09-20 — or has no parseable `YYYY-MM-DD` stamp at all — is exempt.

```sh
bad=
floor=2026-09-20
for f in .flowtron/tasknote/archive/*/*.md; do
  d=$(grep -m1 -oE '^\*\*Archived:\*\* +[0-9]{4}-[0-9]{2}-[0-9]{2}' "$f" | sed -E 's/.* //' || true)
  [ -n "$d" ] || continue
  [[ "$d" < "$floor" ]] && continue
  grep -q '^status: completed$' "$f" || { echo "STATUS NOT COMPLETED  $f"; bad=1; }
  bare=$(awk '/^## ✅ Acceptance/{a=1;next} a&&/^## /{a=0} a' "$f" | grep -E '^ *- \[ \]' | grep -viE 'N/A|not[ -]met' || true)
  [ -z "$bare" ] || { printf '%s\n' "$bare" | sed "s|^|UNANNOTATED BOX  $f  |"; bad=1; }
done
[ -z "$bad" ] || exit 1
```

Must print nothing. `STATUS NOT COMPLETED` is a post-floor note whose frontmatter still reads `in-progress` (or a near-miss like `complete`); `UNANNOTATED BOX` is a post-floor note with an unticked Acceptance box that carries neither annotation token. Both are closure misses on a note that has already been moved, and the archive is write-once — so the fix is **not** to edit the archived note. Re-open it: flip `status:` and annotate or tick the box as the pre-archive closure write it should have been, in the same commit as whatever closure it belonged to, and say so in the commit message. The between-cuts detector is the point; [[CORE-610.3]] puts the same two greps in front of the archive move so a post-floor miss should not reach this pair at all.

- **The floor is a constant, not a Pair L surface.** `floor=2026-09-20` appears here and in the lifted CI step, and Pair L compares path sets, not literals, so the two copies are unbound. Acceptable because the floor never moves: it marks the day the check started existing, and moving it either way is a backfill or an amnesty. `docs/CONVENTIONS.md` §"Archived-tasknote integrity floor" is the documented source.
- **Token match, not em-dash match.** The archive writes the annotation nine ways (`N/A —`, `N/A,`, `not-met`, `not met**:`, `not met).`); the check accepts `N/A` or `not met` / `not-met`, case-insensitive, anywhere on the box's line. The canonical form is still `N/A — <reason>` / `not met — <reason>` (SPEC.md §"Acceptance tick-through"); a punctuation variant is a style miss, not a closure miss, and reddening CI over it would teach operators to edit archived notes.
- **Unparseable stamp → exempt, and that is a known gap.** Two legacy notes (CORE-410.3, CORE-577.6) still hold the template's `YYYY-MM-DD` placeholder, and a note with no date cannot be placed against the floor. A future closure that leaves the placeholder unfilled is therefore invisible here — a stamp miss, a different class from tick-through, and it sits with CORE-610.4's stamp-fill gate on the closure surfaces rather than this pair. Do not "fix" it by treating an unstamped note as post-floor: that retroactively binds the two legacy files.
- **`[[ "$d" < "$floor" ]]`, not `[ "$d" \> … ]`.** ISO dates compare lexically, and the `[[` form works in bash and zsh alike; the `[` form with an escaped operator fails in zsh with `condition expected`, which is the shell this walk runs in.
- **`|| true` on both substitutions is load-bearing.** The CI `run:` shell is `bash -e`, and an assignment whose command substitution ends in a `grep` that matched nothing exits the step — so without the guard the first *clean* post-floor note (no bare boxes → `grep -v` returns 1) would have failed the job, the exact inversion of what the step is for. Found on the mutated-copy proof in [[CORE-610.2]]; every earlier lifted step avoids the trap by ending its pipelines in `sort`/`tr`, which this one cannot.
- **Only `## ✅ Acceptance` is read.** `## 🧩 Subtasks` is exempt by contract (SPEC.md §"Acceptance tick-through" → "`## 🧩 Subtasks` is exempt"); the `awk` window closes at the next `## ` heading, so Subtasks boxes never enter the grep.
- **Lifted into the CI `drift` job, like N and O.** An archival lands one commit at a time, usually under `--fast` or `--unattended`, which is exactly where the miss rate is highest; a detector that fires only at the next cut would let a whole cut's worth accumulate. Pair L binds the CI copy to the block above.

**Pair Q — `§"Title"` citations ↔ the heading or bold-lead they name.** Live markdown carries some 600 path-bearing section citations — `` `SPEC/gates.md` §"Conditional skip rule" `` and its bare and `[link](path)` shapes — and every one is a pointer that goes stale the moment its target is renamed, moved by a lazy split, or demoted from heading to prose. Pairs K, N and O each resolved the citations of *one* file; the other ~130 surfaces had no detector, and [[CORE-535.3]]'s split is the recorded case of a correct move that left pointers behind. [[CORE-492]] and [[CORE-543]] each declined this guard on the same three findings — zero genuine dangles, false positives from `## Completed` rows quoting the drift they record, and the split's real defects lying outside any `§` citation — and Pair L took the third. The first two are what changed: [[CORE-620]] rotated the archaeology into `.flowtron/PLAN-ARCHIVE.md`, [[CORE-609]] ruled a `**Title.**` bold-lead a valid target, and the sweep that filed [[CORE-622.3]] found the false-positive set reduced to placeholders. `docs/CONVENTIONS.md` §"Section citations may target a heading or a bold-lead paragraph" is the documented rule.

Scope is every tracked `.md` except the two write-once archives, which quote their own drift history by design. A citation is skipped when its path or section carries a placeholder (`<…>`, `…`) or a regex escape (`\`); a `.flowtron/core/` prefix is the adopter view of this repo and is stripped; the four skill-local path variables (`<SPEC_DIR>`, `<SKILL_DIR>`, `<FT>`, `<tasknote dir>`) resolve to what every Step 0 sets them to, so a skill→module citation is read, not skipped. A path is tried repo-root-relative, then relative to the citing file:

```sh
bad=
while IFS= read -r f; do
  while IFS='|' read -r path sec; do
    case "$path$sec" in ''|*'<'*|*'…'*|*'\'*) continue ;; esac
    path=${path#.flowtron/core/}
    case "$path" in
      ./*|../*) t="$(dirname "$f")/$path" ;;
      *) t="$path"; [ -f "$t" ] || t="$(dirname "$f")/$path" ;;
    esac
    [ -f "$t" ] || { printf 'MISSING FILE  %s — %s §"%s"\n' "$f" "$path" "$sec"; bad=1; continue; }
    grep -qF -e "# $sec" -e "**$sec" "$t" || { printf 'STALE SECTION  %s — %s §"%s"\n' "$f" "$path" "$sec"; bad=1; }
  done < <({ grep -oE '`[^`]+\.md` §"[^"]+"' "$f" | sed -E 's/^`([^`]+)` §"(.*)"$/\1|\2/' || true
             grep -oE '\]\([^)]+\.md\) §"[^"]+"' "$f" | sed -E 's/^\]\(([^)]+)\) §"(.*)"$/\1|\2/' || true
             grep -oE '(^|[^`(/A-Za-z0-9_.<>-])[A-Za-z0-9_./-]+\.md §"[^"]+"' "$f" | sed -E 's/^[^A-Za-z0-9_.]*([^ ]+) §"(.*)"$/\1|\2/' || true
           } | sed -E 's#^<SPEC_DIR>/#SPEC/#; s#^<SKILL_DIR>/#./#; s#^<FT>/##; s#^<tasknote dir>/#.flowtron/tasknote/#')
done < <(git ls-files '*.md' | grep -v -e '^\.flowtron/tasknote/archive/' -e '^\.flowtron/PLAN-ARCHIVE\.md$')
[ -z "$bad" ] || exit 1
```

Must print nothing. `MISSING FILE` is a citation whose path resolves neither from the repo root nor from the citing file's directory; `STALE SECTION` is one whose target has no line carrying `# <Title>` or `**<Title>` as a prefix — a heading at any level, or a bold-lead. Fix either on the **citer**: repoint the path to where the section now lives, or update the title to the heading's current text — never rename a heading back, and never move a sentence-ending period inside the quotes (`§"Fan-out."` was the only class of break the landing sweep found, five sites). A citation that is deliberately illustrative belongs in the placeholder shape (`` `<file>.md` §"<Section>" ``) so the skip rule reads it as one.

- **Lifted into the CI `drift` job, like N, O and P.** A citation lands or goes stale one commit at a time, and the lazy split that motivated this check reddened CI for a whole cut before anyone read the pointer. Pair L binds the CI copy to the block above.
- **Pairs N and O are instances.** Their `STALE LABEL` / `STALE CITATION` halves resolved one file's citations by the same idiom and retired into this pair at [[CORE-622.3]]; each keeps the presence halves Q cannot derive. K stays separate: its mirrors are `docs/VISION.md` bullets, not `§` citations.
- **Prefix match, heading-level-blind, and substring-of-line.** `# <Title>` is a substring of `## <Title>` and `### <Title>` alike, and `**<Title>` matches a bold-lead wherever it opens; both are prefixes, so `§"Three postures"` still resolves after the heading grows a suffix, while `§"Phase 4: Closure"` does **not** resolve against `## 🚀 Phase 4: Closure` — cite the emoji. A `# <Title>` inside a fence satisfies the match; that fails open, not closed, and is accepted for the same reason Pair N accepted it.
- **Bare-section citations are out of scope.** Roughly 400 `§"…"` mentions carry no adjacent path (`SPEC §"Task-line format"`, `per §"Filing commits"`, a second section after `and`); their target is whatever the sentence last named, which a line-local grep cannot know. The path-bearing shape is the contract for a checkable citation.
- **`|| true` on each extraction pipeline is load-bearing.** Under `bash -eo pipefail` a `grep -oE` with no match ends the brace group, and the shapes after it are silently dropped for that file — a fail-open the CI shell (`bash -e`, no `pipefail`) would not show. Same family as Pair P's `|| true` note.
- **`|` is the field separator because no title carries one.** The live set has none; a title that ever does needs a different separator here, not a quoting fix.
