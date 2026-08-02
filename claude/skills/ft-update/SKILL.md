---
name: ft-update
description: Bump an adopter project's pinned flowtron submodule to the latest released tag — show current→target version + tag changelog, fetch + checkout the tag, record the new pin, re-wire per-project Claude/Codex symlinks for newly shipped skills, and run a lightweight smoke check. Use when the user asks to update or bump their project's flowtron submodule to the latest release. Adopter-only (bails in flowtron-self); thin procedural skill, no tasknote.
---

# update — flowtron submodule bump (adopter-side)

You are bumping a project's pinned flowtron submodule to the latest released
tag. This is the consumer-side counterpart to `/ft-release` (which cuts the tag
on the producer side). It is a **thin procedural skill** — it performs the bump
and stages the result; it does **not** scaffold a 4-phase tasknote. The skill
takes **no arguments**.

The skill is markdown-only — the assistant runs git inline via its Bash tool, no
shell scripts (per `SPEC.md` §"What flowtron does NOT provide").

## Step 0 — Resolve the submodule path + verify cwd is an adopter project

The flowtron submodule path is not fixed across adopters: newer projects pin it
at `.flowtron/core/`, older ones at `.flowtron/flowtron/`. Resolve `<FT>` (the
actual path) before anything else:

- Parse `.gitmodules` for the submodule whose `url` contains `flowtron` → its `path`. That is `<FT>`.
- Fallback if `.gitmodules` is unclear: whichever of `.flowtron/core/SPEC.md` or `.flowtron/flowtron/SPEC.md` exists.

Then guard — the skill bails unless this is a flowtron-adopting project:

- `<FT>/SPEC.md` exists (the pinned submodule resolved above).
- `.flowtron/PLAN.md` exists (this project's own PLAN).
- The repo-root `SPEC.md` heading is **not** `# Flowtron — Workflow Specification` — that heading means cwd is the flowtron checkout itself, where there is no submodule to bump.

If no flowtron submodule resolves, or any guard fails, stop. Tell the user `/ft-update` only runs inside a flowtron-adopting project (one with a flowtron submodule under `.flowtron/`). For flowtron's own checkout, releases are cut with `/ft-release`, not bumped. Do not modify any files.

Use `<FT>` in place of the submodule path for every command below.

## Step 1 — Resolve current pin and latest available tag

- **Current version:** read `<FT>/SPEC.md:3` (`**Version:** vX.Y.Z`).
- **Current pinned commit:** `git -C <FT> rev-parse --short HEAD`.
- **Fetch tags:** `git -C <FT> fetch --tags --quiet origin`.
- **Latest tag:** `git -C <FT> tag --sort=-v:refname | head -1`.

If the latest tag's version equals the current `SPEC.md` version, report "already on the latest release (`vX.Y.Z`)" and stop — nothing to bump. Otherwise capture `<current>` and `<target>` for the rest of the run.

## Step 2 — Surface the bump + tag changelog, confirm

Flowtron has no `CHANGELOG.md` — the annotated tag message is the changelog. Show it:

```sh
git -C <FT> show <target> --no-patch
```

Surface to the user:

```text
flowtron bump (<FT>):
  current: <current>  (pin <short-sha>)
  target:  <target>   (latest tag)

Tag notes (<target>):
  <tag message — adopter-facing release notes + any Migration block>

Proceed with the bump?
```

Use AskUserQuestion (default Yes). If the tag message carries a **Migration** block with required project-side edits, call those out explicitly — the adopter may need to act on them after the pin moves. Do not proceed silently past a non-empty Migration block.

## Step 3 — Move the pin

Bumping is **not** `git submodule update` — that command *restores* the commit already recorded in the superproject index (it would undo a bump). Move the pin explicitly:

```sh
git -C <FT> checkout <target>
git add <FT>
```

`git add <FT>` records the new gitlink in the superproject. Verify: `git -C <FT> describe --tags` reads `<target>`, and `git diff --cached <FT>` shows the gitlink moving `<current>` → `<target>`.

## Step 4 — Re-wire per-project symlinks for newly shipped skills

Existing relative symlinks need no change — they track whatever the submodule points at. Only a **newly shipped** per-project skill needs a fresh symlink (it has none yet).

Handle each platform wiring surface independently:

- **Claude Code:** authoritative list is the `ln -s … .claude/skills/<name>` / `.claude/commands/<name>.md` block in the freshly-bumped `<FT>/claude/AGENTS-snippet.md` §"One-time symlink wiring". If `.claude/` exists, create any missing symlinks with the same relative form the snippet uses (substituting the resolved `<FT>`, e.g. `ln -s ../../<FT>/claude/skills/<name> .claude/skills/<name>`). If `.claude/` is absent, do not create a new Claude wiring surface during an update; report "Claude wiring not present; skipped `.claude/` symlink check."
- **Codex:** authoritative list is the `ln -s … .agents/skills/<name>` block in the freshly-bumped `<FT>/codex/AGENTS-snippet.md` §"One-time skill wiring". If `.agents/skills/` exists, create any missing symlinks with the same relative form the snippet uses (substituting the resolved `<FT>`, e.g. `ln -s ../../<FT>/codex/skills/<name> .agents/skills/<name>`). If `.agents/skills/` is absent, do not create a new Codex wiring surface during an update; report "Codex wiring not present; skipped `.agents/skills/` symlink check."

Report the added symlinks per platform (or "no new skills to wire"). Note: global/by-reference skills (`/ft-flowtron`, `/ft-stats`, `/ft-new-project`, `/ft-audit-context`, `/ft-audit-repo`) are picked up by the user's agent-home wiring when desired, not per-project — do not add extra repo-scoped symlinks beyond each platform's snippet list. `/ft-update` is intentionally in the adopter subset; `/ft-release` is flowtron-self-only.

## Step 4.5 — Audit-fork drift scan

Scan the adopter's `.claude/skills/` for local audit forks that carry fork-provenance markers — these signal which bundled scaffold a fork was last reconciled against so that silent upstream drift becomes visible.

For each file matching `.claude/skills/*/SKILL.md` that is a **regular file** (not a symlink — `test ! -L <path>`) and contains a `flowtron-reconciled:` frontmatter field:

1. Parse the file's YAML frontmatter to read:
   - `flowtron-reconciled:` — the version tag the fork was last reconciled against (e.g. `v5.2.0`).
   - `flowtron-tracks:` — the bundled scaffold name (e.g. `ft-audit`).

2. If either field is missing or empty, skip this file and note it was skipped.

3. Check whether the tracked scaffold changed between the reconciled version and `<target>`:

   ```sh
   git -C <FT> log <reconciled>..<target> --oneline -- claude/skills/<flowtron-tracks>/
   ```

   Scope the path to the scaffold **directory**, not just its `SKILL.md` — a
   scaffold like `ft-audit` carries a sibling `passes/` library whose per-domain
   pass bodies are exactly what a fork reconciles against.

4. If the log is non-empty, emit a **non-blocking warning** for that fork:

   ```text
   ⚠️  Audit fork drift: .claude/skills/<dir>/SKILL.md
       Reconciled at: <reconciled>  →  bumping to: <target>
       Scaffold `claude/skills/<flowtron-tracks>/` changed in N commit(s) since <reconciled>.
       Review the upstream diff, re-reconcile your fork, then update `flowtron-reconciled:` to <target>:

         git -C <FT> diff <reconciled>..<target> -- claude/skills/<flowtron-tracks>/
   ```

5. If no `.claude/skills/*/SKILL.md` file carries `flowtron-reconciled:`, emit:
   `No provenance-marked audit forks found; skipping drift scan.`

Drift warnings are **informational only** — the bump proceeds regardless. After the adopter reviews and re-reconciles, they manually update `flowtron-reconciled:` to `<target>`. Report all warnings (if any) before continuing to Step 5.

## Step 5 — Smoke check, stage, hand off

- **Symlink resolve check:** for each wiring surface present, verify one canonical link resolves into `<FT>`:
  - Claude: `readlink .claude/commands/ft-task.md` resolves into `<FT>/claude/commands/ft-task.md`; spot-check one skill dir symlink too.
  - Codex: `readlink .agents/skills/ft-task` resolves into `<FT>/codex/skills/ft-task`.
  A broken link means the submodule isn't checked out or the symlink target is stale — surface it.
- **Version confirm:** re-read `<FT>/SPEC.md:3` — now `<target>`.
- Optionally **offer** (do not auto-run) a full `/ft-task <ID>` against a real PLAN.md entry as a deeper smoke test.

Stage the bump explicitly, plus whichever wiring dirs exist and were checked (do **not** `git add .` / `-A` — there may be unrelated work):

```sh
git add <FT>
git add .claude/         # if present
git add .agents/skills/  # if present
```

Surface a recap (current→target, tag headline, any new symlinks wired, any Migration action items) and a proposed commit message:

```text
chore: bump flowtron <current> → <target>
```

Do **not** commit unprompted. Commit on the user's go, then stop — `/ft-update` drives no further workflow.

## Notes

- **Adopter-only — inverse of `/ft-release`.** `/ft-release` runs only in flowtron's own checkout; `/ft-update` runs only in adopter projects. Both are global-symlink + layout-guarded.
- **Submodule path is resolved, not assumed.** Older adopters pin at `.flowtron/flowtron/`, newer ones at `.flowtron/core/`. Step 0 reads the real path from `.gitmodules` so the skill works on either layout.
- **Thin procedural skill.** No tasknote, no 4-phase flow. If you want the bump tracked in PLAN.md, file a line first (e.g. `**<AREA>-NNN** [light] | bump flowtron <target>`) or wrap it in `/ft-micro-task`; `/ft-update` itself just performs the mechanical bump.
- **Why not `git submodule update`.** Plain `git submodule update` checks out the commit recorded in the superproject index — it restores the *current* pin, not a new one. Bumping requires checking out the new tag inside the submodule and re-recording the gitlink with `git add <FT>` (Step 3).
- **Supersedes the manual prose.** Replaces `claude/AGENTS-snippet.md` §"Bumping the pinned flowtron version" as the executable path; the prose now points here.
