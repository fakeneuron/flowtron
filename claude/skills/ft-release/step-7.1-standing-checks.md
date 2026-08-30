# `/ft-release` §7.1 — Standing checks

> Lazy fragment. Loaded by `ft-release` SKILL.md §7.1 (`claude/skills/ft-release/SKILL.md`)
> alongside its sibling `step-7.1-mirror-pairs.md`. Walk these checks after the
> `/ft-audit docs` subroutine returns; they run independently of its findings.

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

`~/.claude/` is machine state — no commit in this cut can carry the fix — so this half **never blocks commit-go**. Fix it out of band (`rm` the dangling links, re-`ln -s` the mis-cased ones) and carry the verdict into the §7.4 closure review as one line, the same flag-don't-block posture as the SOP-currency check in Step 5.

**Glob-free by design.** The scans use `find … -name 'ft-*'` rather than a `for l in ~/.claude/skills/ft-*` loop because zsh — the common interactive shell — *errors* on an unmatched glob (`no matches found`) and aborts the loop before its body runs. A machine with no global installs would abort the check rather than report clean. Do not "simplify" these to globs; the same silent-false-negative class is why the SOP-currency block in Step 5 keeps its `$(echo …)` wrappers.

**Standing README task-counter check.** `README.md:22-23` cites a closed-task count and date range that §5's post-edit version-pin verification never covers — it greps for `vX\.Y\.Z`, not a task count, so this line drifts silently between cuts (CORE-411). Recompute both from the same archive the sentence already points readers to:

```sh
find .flowtron/tasknote/archive -name "*.md" | wc -l
grep -rhoE '\*\*Archived:\*\* [0-9]{4}-[0-9]{2}-[0-9]{2}' .flowtron/tasknote/archive/*/*.md | awk '{print $2}' | sort | sed -n '1p;$p'
```

The first command is the closed-task count — one archived tasknote per closed task, standalone or epic child. The second prints the earliest and latest `**Archived:**` date; the earliest is stable (2026-04-28) and only the latest moves. Update `README.md:22-23`'s count and "as of" date to match. A handful of archived tasknotes carry an unfilled `**Archived:** YYYY-MM-DD` placeholder or omit the field (archive-hygiene misses, e.g. CORE-255), so the second command undercounts by that many; if the gap looks material, file a follow-up via `/ft-file-followup` rather than fixing archive hygiene mid-cut. This is a mechanical text substitution, same footing as the 3 version edits in Step 5 — fix inline as Critical/High before cutting the release.
