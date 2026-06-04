---
name: ft-worktree-end
description: Clean up an isolated git worktree for an independent epic child tasknote. From the main checkout: verifies the `wt-<TASK-ID>` branch was merged (or operator explicitly discards), removes the worktree, archives the copied tasknote from the worktree into the main checkout's canonical archive, and optionally prunes the local branch. Thin procedural skill; no tasknote driving. Pair with /ft-worktree-start. See docs/WORKTREES.md for the full convention.
---

# worktree-end — clean up isolated worktree for epic-child tasknotes

You are cleaning up / ending an **isolated git worktree** for the task ID provided in `args` (e.g., `args="CORE-215.3"`). The full convention lives in `docs/WORKTREES.md` — this skill is the executable interpretation of the "End" half, not a replacement. Treat `docs/WORKTREES.md` and `SPEC/tasknote-selection.md` §"When to use a tasknote (and when not to)" (epic children) as authoritative when this file is silent or in tension.

**This is a utility cleanup skill, not a tasknote runner.** It does *not* scaffold or drive a 4-phase tasknote. The operator must already have completed (or decided to discard) the work inside the `wt-<TASK-ID>` worktree. This skill removes the isolated execution environment and ensures the *copied* tasknote's final state is captured in the main checkout's canonical `.flowtron/tasknote/archive/` (the main archive is always the source of truth).

The skill supports only a bare `<TASK-ID>` (no `--fast` flag; the flag is for the `/ft-task` the operator ran *inside* the worktree).

If `args` is missing or its first token doesn't match `<AREA>-<NUMBER>` (or `<AREA>-<NUMBER>.<SUB>`), stop and ask the user for a valid task ID. Do not guess.

## Step 0 — Resolve context & preconditions

The skill operates on the *current working directory* (the checkout from which the operator invoked the command). This must be the **main** (non-worktree) project checkout.

Run these verification commands via the available terminal tool:

```sh
git rev-parse --is-inside-work-tree
git rev-parse --git-dir          # must NOT contain "/worktrees/" in the path
```

- If not a git repo → stop. Tell the user to `cd` to the project root.
- If the git-dir path contains `/worktrees/` → you are inside a worktree checkout. Stop and tell the user to run this from the *main* project tree (the one that contains the full `.flowtron/tasknote/` archive and is the target for merges).

Resolve the task ID:

```sh
TASK_ID="<the first token from args>"
```

Compute the project slug and target paths (portable across flowtron-self and adopters) — identical computation to the start skill:

```sh
PROJECT_ROOT=$(git rev-parse --show-toplevel)
PROJECT_SLUG=$(basename "$PROJECT_ROOT")
BRANCH="wt-${TASK_ID}"
WT_ROOT="$HOME/code/${PROJECT_SLUG}-worktrees"
WT_DIR="${WT_ROOT}/${BRANCH}"
```

Echo the computed values. Confirm they look sane.

Verify that the worktree or branch for this ID is known to git (the thing we are about to clean):

```sh
git worktree list | grep -E "${BRANCH}|${WT_DIR}" || echo "worktree not listed (may already be removed)"
git branch --list "${BRANCH}" || echo "branch not found locally"
```

If neither the branch nor any reference to the worktree dir appears, surface a clear message and ask whether to abort or proceed with a no-op cleanup (the latter is safe).

### Orphaned `wt-*` branches (non-blocking heads-up)

After confirming the task-specific worktree/branch, run a project-wide orphan scan — `wt-*` branches that have no active worktree (start-without-end leftovers):

```sh
ACTIVE_WT=$(git worktree list --porcelain | grep "^branch refs/heads/wt-" | sed 's|branch refs/heads/||')
ALL_WT=$(git branch --list 'wt-*' | sed 's/^[* ]*//')
if [ -n "$ALL_WT" ]; then
  comm -23 <(echo "$ALL_WT" | sort) <(echo "$ACTIVE_WT" | sort)
fi
```

If the `comm` output is non-empty, surface a non-blocking note before continuing:

> ⚠️ Orphaned `wt-*` branches (branch exists, no active worktree):
> `wt-TASK-ID`, ...
> These may be left-over from prior sessions. Run `/ft-worktree-end <ID>` for each, or `git branch -D <branch>` after manual inspection.

If empty, emit "No orphaned `wt-*` branches." This scan is **informational only** — it never blocks the current cleanup.

## Step 1 — Verify branch state (merged or explicit discard)

This is the critical safety gate. The operator must have either merged the worktree branch or decided the work is disposable.

Surface the evidence:

```sh
git branch --merged | grep -E "^[* ] ${BRANCH}$" && echo "branch appears merged" || echo "branch not in merged list"
git log --oneline -5 --decorate | cat
```

Surface the ahead-of-target commit count and shortlog before asking:

```sh
git rev-list --count HEAD..${BRANCH}
git log --oneline HEAD..${BRANCH} | head -10
```

Emit the count inline (e.g., `wt-CORE-279 is 4 commit(s) ahead of HEAD`). A count of 0 means all branch commits are already reachable from HEAD — consistent with a completed merge, though `git branch --merged` is the definitive check. A non-zero count with unfamiliar commit messages may indicate the branch drifted past the original tasknote scope; surface this as context for the operator's decision, not as a block.

Ask the operator (or infer from prior conversation context if unambiguous):

- "The `wt-<TASK-ID>` branch is <N> commit(s) ahead of HEAD (see shortlog above). Has it been merged into main (or your integration branch)?"
- If no: "Do you explicitly want to *discard* all work in that branch and its worktree? (This is irreversible — the branch and any uncommitted state in the worktree will be lost after `git worktree remove`.)"

Only proceed on a clear "yes, merged" or "yes, discard".

- If the branch is *not* merged and the operator does not give explicit discard confirmation → stop. Offer to show `git log main..${BRANCH}` or `git diff main...${BRANCH}` so they can inspect before deciding.
- Never auto-delete an unmerged worktree branch's content.

Record the operator's answer ("merged" or "discard") for the rest of the flow.

## Step 2 — Archive the copied tasknote (main-checkout canonical capture)

Before touching the worktree, ensure the final closed tasknote that was produced inside the isolated execution is captured in the *main* checkout's archive.

The "copied tasknote" lives inside `${WT_DIR}/.flowtron/tasknote/` (either at the live location or, after inner closure, in its `archive/<area>/` sibling).

```sh
# Prefer the archive/ sibling inside the worktree (post-closure location)
COPIED_ARCHIVE="${WT_DIR}/.flowtron/tasknote/archive/core/${TASK_ID}.md"
COPIED_LIVE="${WT_DIR}/.flowtron/tasknote/${TASK_ID}.md"
MAIN_ARCHIVE_DIR=".flowtron/tasknote/archive/core"
MAIN_ARCHIVE="${MAIN_ARCHIVE_DIR}/${TASK_ID}.md"

if [ -f "${COPIED_ARCHIVE}" ]; then
  mkdir -p "${MAIN_ARCHIVE_DIR}"
  cp "${COPIED_ARCHIVE}" "${MAIN_ARCHIVE}"
  echo "Archived copied tasknote from worktree's archive/ location"
elif [ -f "${COPIED_LIVE}" ]; then
  mkdir -p "${MAIN_ARCHIVE_DIR}"
  cp "${COPIED_LIVE}" "${MAIN_ARCHIVE}"
  echo "Archived copied tasknote from worktree's live tasknote/ location (pre- or post-closure)"
else
  echo "No tasknote copy found inside worktree for ${TASK_ID} (may have been a pure code change or already cleaned)"
fi
```

This step is the explicit owner of the "archive copied tasknote" responsibility. It is a belt-and-suspenders capture; a preceding `git merge` of the wt-branch is the normal vehicle that brings the PLAN flip and the archived tasknote into main via git. This copy ensures the exact bytes from the isolated run exist in the canonical main tree even across rename/merge edge cases.

On "discard" path: skip this step entirely (no copy performed; the worktree contents will be deleted with the worktree).

## Step 3 — Remove the worktree (and optionally prune the branch)

```sh
git worktree remove "${WT_DIR}"
```

This deletes the working tree at `WT_DIR` and cleans `.git/worktrees/` metadata. The command will fail if the worktree has uncommitted changes — surface the error and let the operator decide (commit/stash inside the worktree first, or force if they truly want to discard).

After removal, optionally offer to prune the local branch (only after the operator has confirmed the merge or discard decision):

```sh
git branch -D "${BRANCH}"
```

Prune is **not** automatic. Ask: "Delete the local `wt-<TASK-ID>` branch as well? (Safe after merge or explicit discard; keeps the reflog for a few weeks if you want to recover later.)"

## Step 4 — Verify cleanup and surface UX summary

Run from the *main* checkout:

```sh
git worktree list
git branch --list "${BRANCH}" || echo "(branch pruned)"
ls -la ".flowtron/tasknote/archive/core/${TASK_ID}.md" 2>/dev/null || echo "(no archived tasknote for this ID in main — expected on discard path or if merge brought it via git)"
```

Surface a clear, scannable block:

```
✅ Worktree cleaned for ${TASK_ID}

  Main checkout:  ${PROJECT_ROOT}
  Removed:        ${WT_DIR}
  Branch:         ${BRANCH} (merged | discarded; pruned? yes/no)
  Archived tasknote: copied into main's .flowtron/tasknote/archive/core/ (or already present via merge)

The main checkout now holds the canonical PLAN update (from your merge) and the archived tasknote. The worktree environment is gone.

(If you discarded: the work in that branch is lost. Re-run /ft-task ${TASK_ID} from main if you want to redo it.)
```

Do **not** attempt to `cd` or change the current agent's working directory. The operator returns to their normal main-checkout session.

## Step 5 — Optional post-cleanup notes (do not block)

- The `wt-` branch (if not pruned) remains a normal local branch until manually deleted. It will eventually be garbage-collected by `git gc` if unreferenced.
- On the discard path the copied tasknote inside the worktree is deleted with the worktree — this is intentional and matches the "explicit discard" contract.
- No changes were made to SPEC.md, templates, AI-referenced docs, or adopter wiring surfaces. Those land in CORE-215.5.
- After this cleanup the main checkout is once again the single source of truth for that child's PLAN line and archived tasknote.

## Notes

- **When to reach for `/ft-worktree-end`:** Only after finishing (or discarding) an independent child of a multi-child epic that you executed via `/ft-worktree-start`. See `docs/WORKTREES.md` §"When to Reach for a Worktree" for the exact criteria. Never for normal single-task work.
- **Thin by design.** This skill + its start sibling are deliberately small (no 4-phase scaffolding inside them, no tasknote mutation on end, minimal preconditions). The real work still happened inside the normal `/ft-task <ID>` that the operator ran inside the worktree.
- **Relationship to the epic:** CORE-215.3 (start) + CORE-215.4 (this end) + CORE-215.5 (wiring) complete the implementation bracket around the doc delivered by .2. The final .6 audit will verify the whole set.
- **Symmetry with start skill:** The end skill never creates anything. All creation (branch, worktree, initial copy *into* the worktree) lives in `/ft-worktree-start`. End owns removal, the "archive copied" capture, and branch-prune decisions.
- **Cross-references (after sibling children land):** See `docs/WORKTREES.md` (the canonical convention), `claude/AGENTS-snippet.md` (will list the pair in the Workflow block), `docs/MIGRATION.md` §1.2 (adopter install), and `claude/skills/ft-flowtron/SKILL.md` (roster entry after .5).
- **No SPEC contract impact.** The 4-phase workflow, relevance gate, 🛠️/📦 cues, and post-closure protocol are completely unchanged inside any tasknote that happened to run inside a worktree. Worktrees are an execution accelerator only.
- **Standalone safety.** This SKILL is designed to be invoked directly once the flowtron bundle (including the two new command symlinks) is wired. It does not require any other ft- skill beyond the shared docs and the prior existence of the worktree created by `/ft-worktree-start <ID>`.

If any step fails or the operator hits an edge case not covered here (exotic git layouts, worktrees with submodules, permission problems on `~/code/`), surface the exact command that failed + the output and ask for guidance before retrying. Record the resolution in the current conversation so it can inform a future refinement of this skill or the WORKTREES.md doc.