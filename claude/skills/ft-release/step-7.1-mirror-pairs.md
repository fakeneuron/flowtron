# `/ft-release` §7.1 — Mirror pairs

> Lazy fragment. Loaded by `ft-release` SKILL.md §7.1 (`claude/skills/ft-release/SKILL.md`)
> alongside its sibling `step-7.1-standing-checks.md`. Walk these pairs after the
> standing checks; every pair below blocks the cut.

**Standing mirror-pair check.** Some surfaces restate a fact that is *derived* from another surface — a roster that must list what a directory holds, a Codex description that must name the flags its Claude twin documents, a template's back-link that must resolve from the directory a skill writes it to. Nothing binds the two halves, so an edit to the source silently strands the mirror, and the gap only surfaces when a reader trips over it (CORE-EPIC-420 found four such pairs drifted at once). Each pair below is repo state — a commit in this cut can carry every fix — so all of them **block**: fix inline as Critical/High before cutting the release.

**Pair A — templates roster ↔ `templates/` directory.** Three surfaces restate what `templates/` holds: `README.md`'s repo-layout bullet, `SPEC.md:55`, and `claude/skills/ft-flowtron/SKILL.md`'s "Key docs" list. Adding or removing a file in `templates/` without editing all three strands the ones left behind:

```sh
ls templates/
grep -n 'tasknote templates (full' README.md SPEC.md claude/skills/ft-flowtron/SKILL.md
```

Three hits, one per file. **README + SPEC** carry a byte-identical roster clause: every file `ls` prints must be named in it (the seed files appear as `PLAN.md` / `tasknote-README.md`, the tasknote templates by their qualifier — `full`, `micro`, `starter`, `sidequest`). The **`ft-flowtron` hit is a deliberately compressed variant** — it is a one-line screen entry about templates, so the two seed files are exempt there; every *template* file must still be named. A file in the directory named by no clause, or a name in a clause with no file, is the drift.

The pattern is `tasknote templates (full`, not the narrower `canonical tasknote templates` this pair originally used: the `ft-flowtron` variant drops the word "canonical" and was outside the file list besides, so the pair missed that site from the day it shipped (CORE-422).

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
| `tasknote-template.md` | `/ft-task`, `/ft-goal-task`, `/ft-epic-discovery`, `/ft-close-epic`, `/ft-release` | `.flowtron/tasknote/<ID>.md` |
| `tasknote-micro-template.md` | `/ft-micro-task` | `.flowtron/tasknote/<ID>.md` |
| `tasknote-starter-template.md` | `/ft-starter-task` | `.flowtron/tasknote/<ID>.md` |
| `sidequest-template.md` | `/ft-file-followup --park` | `.flowtron/sidequest/<ID>.md` |
| `spec-template.md` | `/ft-spec` | `.flowtron/specs/<slug>.md` (no back-link today) |

**Pair D — README counter ↔ archive count.** Already owned by the Standing README task-counter check in `step-7.1-standing-checks.md`; not restated here. Two derivations of one number in the same step is the drift class this block exists to catch.

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

**Pair H — validation command roster ↔ 5 restatement sites.** `AGENTS.md` §"Validation" is the source of truth for the six commands that define "passing" (3 viz + `node --test` + 2 × `node --check`). Four other surfaces restate that roster — `.github/workflows/ci.yml`, `docs/CONVENTIONS.md` §"GitHub Actions CI", `.flowtron/tasknote/README.md` §"Project quick commands", and `/ft-release` SKILL.md's Step 6 fence — and nothing bound them, so a release-gate edit that skipped the two `node --check`s left `/ft-release` narrower than CI with no detector (CORE-430.N F2; CORE-433.4). Pair F's presence idiom covers the class; a second half pins the CI workflow to AGENTS byte-for-byte and in order, which is the "verbatim" claim CONVENTIONS makes.

Presence — each of the five sites must name all six AGENTS command strings. Formats differ (YAML `run:`, prose, bullets, fenced lines), so this is presence, not byte identity. The `/ft-release` site is scoped to Step 6 by `awk`. That scoping was originally self-defence — this pair's command list used to live inside `SKILL.md` itself, so a whole-file grep could never fail — and since CORE-507 moved the pair into this fragment it is no longer needed for that reason. Keep it anyway: scoped to the Step 6 fence the check asserts the commands sit in the validation gate, where the "verbatim" claim applies, rather than passing on an incidental mention elsewhere in `SKILL.md`.

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

