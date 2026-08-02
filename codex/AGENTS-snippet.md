# Codex wiring snippet for flowtron

This file is the Codex-specific sibling of `claude/AGENTS-snippet.md`.
The workflow block itself is agent-neutral and remains canonical there for
historical continuity; this file owns only the Codex wiring commands.

## Block to paste into `AGENTS.md`

Use the block in `../claude/AGENTS-snippet.md` §"Block to paste into AGENTS.md".
Do not maintain a second copy here.

## One-time skill wiring

Codex discovers repo-scoped skills from `.agents/skills` in the current
directory walk. From an adopting project's repository root, after adding the
flowtron submodule at `.flowtron/core`, wire the adopter-facing Flowtron skill
subset (tasknote execution family, worktree pair, and `ft-update`):

```sh
mkdir -p .agents/skills
ln -s ../../.flowtron/core/codex/skills/ft-close-epic .agents/skills/ft-close-epic
ln -s ../../.flowtron/core/codex/skills/ft-epic-discovery .agents/skills/ft-epic-discovery
ln -s ../../.flowtron/core/codex/skills/ft-file-followup .agents/skills/ft-file-followup
ln -s ../../.flowtron/core/codex/skills/ft-goal-task .agents/skills/ft-goal-task
ln -s ../../.flowtron/core/codex/skills/ft-micro-task .agents/skills/ft-micro-task
ln -s ../../.flowtron/core/codex/skills/ft-sidequest .agents/skills/ft-sidequest
ln -s ../../.flowtron/core/codex/skills/ft-spec .agents/skills/ft-spec
ln -s ../../.flowtron/core/codex/skills/ft-starter-task .agents/skills/ft-starter-task
ln -s ../../.flowtron/core/codex/skills/ft-task .agents/skills/ft-task
ln -s ../../.flowtron/core/codex/skills/ft-update .agents/skills/ft-update
ln -s ../../.flowtron/core/codex/skills/ft-worktree-end .agents/skills/ft-worktree-end
ln -s ../../.flowtron/core/codex/skills/ft-worktree-start .agents/skills/ft-worktree-start
```

Use `/skills` in Codex or type `$ft-task` / `$ft-update` / another wired
skill name to invoke a Flowtron skill. Global utility skills such as
`ft-new-project`, `ft-flowtron`, `ft-stats`, `ft-audit-context`,
and `ft-audit-repo` may be installed in the user skill directory when desired;
`ft-release` remains flowtron-self-only and is not part of the adopter snippet.
The canonical category table lives in
`.flowtron/core/docs/PLATFORMS.md` §"Installed-surface policy".
Codex's built-in CLI slash commands do not define arbitrary custom `/ft-*`
commands; the stable exported surface is the `ft-*` skill name.

## Pinning notes

These relative symlinks point through the project's pinned
`.flowtron/core` submodule, so the wired skill bodies move only when the
project deliberately bumps flowtron. Existing symlinks do not need rewiring on
a normal version bump; newly shipped adopter-subset skills may need new symlinks.

For flowtron maintainers who want hot-reload behavior while editing this
checkout, symlink the upstream skill inventory into the user skill directory
instead:

```sh
mkdir -p ~/.agents/skills
ln -s ~/code/flowtron/codex/skills/* ~/.agents/skills/
```
