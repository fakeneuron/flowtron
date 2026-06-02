---
name: ft-update
description: Bump an adopter project's pinned flowtron submodule to the latest released tag — show current→target version + tag changelog, fetch + checkout the tag, record the new pin, re-wire per-project symlinks for any newly shipped tasknote-family skills, and run a lightweight smoke check. Adopter-only (bails in flowtron-self); thin procedural skill, no tasknote.
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

Existing relative symlinks (`.claude/{skills,commands}/ft-*`) need no change — they track whatever the submodule points at. Only a **newly shipped** per-project skill needs a fresh symlink (it has none yet).

The authoritative per-project wiring list is the `ln -s … .claude/skills/<name>` / `.claude/commands/<name>.md` block in the freshly-bumped `<FT>/claude/AGENTS-snippet.md` §"One-time symlink wiring". For each skill named there:

- If `.claude/skills/<name>` (and `.claude/commands/<name>.md`) is missing, create it with the same relative form the snippet uses (substituting the resolved `<FT>`, e.g. `ln -s ../../<FT>/claude/skills/<name> .claude/skills/<name>`).
- If it already exists, skip.

Report the added symlinks (or "no new skills to wire"). Note: globally-installed skills (`/ft-flowtron`, `/ft-stats`, `/ft-quality`, `/ft-new-project`, `/ft-audit-context`, `/ft-update`) are picked up by the machine-level `claude/skills/*` glob, not per-project — do not symlink them here.

## Step 5 — Smoke check, stage, hand off

- **Symlink resolve check:** `readlink .claude/commands/ft-task.md` resolves into `<FT>/claude/commands/ft-task.md`; spot-check one skill dir symlink too. A broken link means the submodule isn't checked out — surface it.
- **Version confirm:** re-read `<FT>/SPEC.md:3` — now `<target>`.
- Optionally **offer** (do not auto-run) a full `/ft-task <ID>` against a real PLAN.md entry as a deeper smoke test.

Stage the bump explicitly (do **not** `git add .` / `-A` — there may be unrelated work):

```sh
git add <FT> .claude/
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
