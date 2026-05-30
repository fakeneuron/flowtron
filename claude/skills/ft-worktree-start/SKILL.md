---
name: ft-worktree-start
description: Create an isolated git worktree for an independent epic child tasknote. Branches `wt-<TASK-ID>`, adds a worktree under ~/code/<project>-worktrees/wt-<TASK-ID>/, copies the active tasknote, and hands off for execution in a fresh session. Thin procedural skill; no tasknote driving. Pair with /ft-worktree-end. See docs/WORKTREES.md for the full convention.
---

# worktree-start — isolated worktree for epic-child tasknotes

You are starting an **isolated git worktree** for the task ID provided in `args` (e.g., `args="CORE-215.3"`). The full convention lives in `docs/WORKTREES.md` — this skill is the executable interpretation of the "Start" half, not a replacement. Treat `docs/WORKTREES.md` and `SPEC/tasknote-selection.md` §"When to use a tasknote (and when not to)" (epic children) as authoritative when this file is silent or in tension.

**This is a utility setup skill, not a tasknote runner.** It does *not* scaffold or drive a 4-phase tasknote. The operator must already have a live tasknote for `<TASK-ID>` in the current (main) checkout — typically created by a prior `/ft-task <ID>` or `/ft-epic-discovery`. This skill prepares an isolated execution environment for that child so parallel independent work can proceed without stash/branch churn.

The skill supports only a bare `<TASK-ID>` (no `--fast` flag; the flag is for the subsequent `/ft-task` the operator will run *inside* the worktree).

If `args` is missing or its first token doesn't match `<AREA>-<NUMBER>` (or `<AREA>-<NUMBER>.<SUB>`), stop and ask the user for a valid task ID. Do not guess.

## Step 0 — Resolve context & preconditions

The skill operates on the *current working directory* (the checkout from which the operator invoked the command). This must be the **main** (non-worktree) project checkout.

Run these verification commands via the available terminal tool:

```sh
git rev-parse --is-inside-work-tree
git rev-parse --git-dir          # must NOT contain "/worktrees/" in the path
git status --porcelain
```

- If not a git repo → stop. Tell the user to `cd` to the project root.
- If the git-dir path contains `/worktrees/` → you are already inside a worktree checkout. Stop and tell the user to run this from the *main* project tree (the one that contains the full `_project/tasknote/` archive).
- If `git status --porcelain` is non-empty → warn loudly. The convention prefers a clean main checkout before creating the parallel branch + worktree. Offer to proceed anyway or abort.

Resolve the task ID:

```sh
TASK_ID="<the first token from args>"
```

Verify the source tasknote exists in the *current* tree:

```sh
ls -l _project/tasknote/${TASK_ID}.md
```

If missing → stop. The child must be filed (and ideally have had at least its Phase 1 Discovery run) before you move it to a worktree. Point the user at `/ft-task ${TASK_ID}` first.

Compute the project slug and target paths (portable across flowtron-self and adopters):

```sh
PROJECT_ROOT=$(git rev-parse --show-toplevel)
PROJECT_SLUG=$(basename "$PROJECT_ROOT")
BRANCH="wt-${TASK_ID}"
WT_ROOT="$HOME/code/${PROJECT_SLUG}-worktrees"
WT_DIR="${WT_ROOT}/${BRANCH}"
```

Echo the computed values for the operator to see. Confirm they look sane (especially the `~/code/...` expansion).

## Step 1 — Safety checks for collisions

```sh
git show-ref --verify --quiet refs/heads/${BRANCH} && echo "branch exists" || echo "branch free"
test -d "${WT_DIR}" && echo "worktree dir exists" || echo "dir free"
```

- If the local branch `wt-${TASK_ID}` already exists → surface the conflict. Ask whether to (a) delete it (`git branch -D`), (b) use a different ID, or (c) abort. Do not overwrite silently.
- If the target `WT_DIR` already exists on disk → this is almost certainly a left-over from a prior run that wasn't cleaned with `/ft-worktree-end`. Offer to `rm -rf` it (after manual inspection) or abort. Never auto-clobber.

Also verify that `~/code/` is writable and the parent `*-worktrees/` dir can be created.

## Step 2 — Create the branch and worktree (the core 4 conceptual steps)

Follow the exact sequence from `docs/WORKTREES.md` §"Start / End Flow (Conceptual)":

1. Create the branch from the current HEAD (must be the desired base — usually `main` or the epic's integration branch):

   ```sh
   git checkout -b "${BRANCH}"
   ```

2. Create the worktree (this also checks out the new branch at the target location):

   ```sh
   mkdir -p "${WT_ROOT}"
   git worktree add "${WT_DIR}" "${BRANCH}"
   ```

   The `git worktree add` command will print the new worktree path on success.

3. Copy the active tasknote into the worktree so the agent working there has the identical Phase 1 record (Goal, Acceptance, Discovery Notes, resolved questions, subtasks):

   ```sh
   mkdir -p "${WT_DIR}/_project/tasknote"
   cp "_project/tasknote/${TASK_ID}.md" "${WT_DIR}/_project/tasknote/${TASK_ID}.md"
   ```

   Verify the copy:

   ```sh
   ls -l "${WT_DIR}/_project/tasknote/${TASK_ID}.md"
   wc -l "${WT_DIR}/_project/tasknote/${TASK_ID}.md"
   ```

4. (Optional but recommended) Also copy the tasknote directory's README if the operator relies on it for area prefixes in the worktree session:

   ```sh
   cp "_project/tasknote/README.md" "${WT_DIR}/_project/tasknote/README.md" 2>/dev/null || true
   ```

Leave the original tasknote in the main checkout untouched. The main copy remains the coordination point until `/ft-worktree-end` is run after merge.

## Step 3 — Verify the worktree is ready and clean

Run from the *main* checkout:

```sh
git worktree list
git branch --list "${BRANCH}"
ls -la "${WT_DIR}/_project/tasknote/${TASK_ID}.md"
```

The worktree list should show both the main tree and the new `wt-...` entry pointing at the branch.

`git status` in the main tree should still be clean (the copy lives only in the worktree checkout).

## Step 4 — Handoff to the operator (the critical UX step)

Surface a clear, copy-paste-ready block:

```
✅ Worktree created for ${TASK_ID}

  Main checkout:  ${PROJECT_ROOT}
  Worktree dir:   ${WT_DIR}
  Branch:         ${BRANCH}

To continue the task in isolation:

1. Open a *fresh* session / context window with your agent (critical — do not carry the old window).
2. cd ${WT_DIR}
3. Clear your session, then use 🔧 /ft-task ${TASK_ID}

(If the original /ft-task run for this child used --fast, you can add it on the handoff invocation as well.)

The copied tasknote at _project/tasknote/${TASK_ID}.md inside the worktree contains the full Phase 1 record (including any resolved scoping questions). The agent there will see an ordinary tasknote and drive the normal 4-phase flow.

When the child is complete (or you decide to discard the work), return to the *main* checkout and run:

  /ft-worktree-end ${TASK_ID}
```

Do **not** attempt to `cd` or change the current agent's working directory yourself. The handoff is always conversational + explicit operator action.

Print the absolute path with `~` expanded for easy copy-paste (run `realpath "${WT_DIR}"` or `echo "${WT_DIR}"`).

## Step 5 — Optional post-handoff notes (do not block)

- The worktree branch (`wt-${TASK_ID}`) is a normal local branch. It will appear in `git branch` until pruned by the end skill or manually.
- The copy of the tasknote inside the worktree is untracked until the operator commits inside that checkout as part of the child's normal work. This is intentional and matches the "copy" decision in CORE-215.1.
- No changes were made to SPEC.md, templates, AI-referenced docs, or adopter wiring surfaces. Those land in CORE-215.5.

## Notes

- **When to reach for `/ft-worktree-start`:** Only for *independent* children of a multi-child epic that already has a `.1` Discovery (or equivalent explicit scoping). See `docs/WORKTREES.md` §"When to Reach for a Worktree" for the exact criteria. Never for single tasks, dependent children, or long-lived work.
- **Thin by design.** This skill + its end sibling are deliberately small (no 4-phase scaffolding inside them, no tasknote mutation on start, minimal preconditions). The real work still happens inside the normal `/ft-task <ID>` that the operator runs after the handoff.
- **Relationship to the epic:** CORE-215.3 (this skill) + CORE-215.4 (end) + CORE-215.5 (wiring) complete the implementation bracket around the doc delivered by .2. The final .6 audit will verify the whole set.
- **Symmetry with end skill:** The start skill never archives or deletes anything. All cleanup (worktree remove, branch pruning decisions, archiving the *copied* tasknote from the worktree perspective) lives in `/ft-worktree-end`.
- **Cross-references (after sibling children land):** See `docs/WORKTREES.md` (the canonical convention), `claude/AGENTS-snippet.md` (will list the pair in the Workflow block), `docs/MIGRATION.md` §1.2 (adopter install), and `claude/skills/ft-flowtron/SKILL.md` (roster entry after .5).
- **No SPEC contract impact.** The 4-phase workflow, relevance gate, 🛠️/📦 cues, and post-closure protocol are completely unchanged inside any tasknote that happens to run inside a worktree. Worktrees are an execution accelerator only.
- **Standalone safety.** This SKILL is designed to be invoked directly once the flowtron bundle (including the two new command symlinks) is wired. It does not require any other ft- skill beyond the shared docs and the existence of a tasknote for the target ID.

If any step fails or the operator hits an edge case not covered here (exotic git layouts, NFS home dirs, permission problems on `~/code/`), surface the exact command that failed + the output and ask for guidance before retrying. Record the resolution in the current conversation so it can inform a future refinement of this skill or the WORKTREES.md doc.