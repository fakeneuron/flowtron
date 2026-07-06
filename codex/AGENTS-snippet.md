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
flowtron submodule at `.flowtron/core`, wire the full Flowtron skill surface:

```sh
mkdir -p .agents/skills
ln -s ../../.flowtron/core/codex/skills/ft-audit .agents/skills/ft-audit
ln -s ../../.flowtron/core/codex/skills/ft-audit-backend .agents/skills/ft-audit-backend
ln -s ../../.flowtron/core/codex/skills/ft-audit-context .agents/skills/ft-audit-context
ln -s ../../.flowtron/core/codex/skills/ft-audit-docs .agents/skills/ft-audit-docs
ln -s ../../.flowtron/core/codex/skills/ft-audit-frontend .agents/skills/ft-audit-frontend
ln -s ../../.flowtron/core/codex/skills/ft-audit-performance .agents/skills/ft-audit-performance
ln -s ../../.flowtron/core/codex/skills/ft-audit-repo .agents/skills/ft-audit-repo
ln -s ../../.flowtron/core/codex/skills/ft-audit-security .agents/skills/ft-audit-security
ln -s ../../.flowtron/core/codex/skills/ft-close-epic .agents/skills/ft-close-epic
ln -s ../../.flowtron/core/codex/skills/ft-debug .agents/skills/ft-debug
ln -s ../../.flowtron/core/codex/skills/ft-epic-discovery .agents/skills/ft-epic-discovery
ln -s ../../.flowtron/core/codex/skills/ft-file-followup .agents/skills/ft-file-followup
ln -s ../../.flowtron/core/codex/skills/ft-flowtron .agents/skills/ft-flowtron
ln -s ../../.flowtron/core/codex/skills/ft-goal-task .agents/skills/ft-goal-task
ln -s ../../.flowtron/core/codex/skills/ft-micro-task .agents/skills/ft-micro-task
ln -s ../../.flowtron/core/codex/skills/ft-new-project .agents/skills/ft-new-project
ln -s ../../.flowtron/core/codex/skills/ft-quality .agents/skills/ft-quality
ln -s ../../.flowtron/core/codex/skills/ft-release .agents/skills/ft-release
ln -s ../../.flowtron/core/codex/skills/ft-sidequest .agents/skills/ft-sidequest
ln -s ../../.flowtron/core/codex/skills/ft-starter-task .agents/skills/ft-starter-task
ln -s ../../.flowtron/core/codex/skills/ft-stats .agents/skills/ft-stats
ln -s ../../.flowtron/core/codex/skills/ft-task .agents/skills/ft-task
ln -s ../../.flowtron/core/codex/skills/ft-update .agents/skills/ft-update
ln -s ../../.flowtron/core/codex/skills/ft-worktree-end .agents/skills/ft-worktree-end
ln -s ../../.flowtron/core/codex/skills/ft-worktree-start .agents/skills/ft-worktree-start
```

Use `/skills` in Codex or type `$ft-task` / `$ft-update` / another wired
skill name to invoke a Flowtron skill. Codex's built-in CLI slash commands do
not define arbitrary custom `/ft-*` commands; the stable exported surface is
the `ft-*` skill name.

## Pinning notes

These relative symlinks point through the project's pinned
`.flowtron/core` submodule, so the wired skill bodies move only when the
project deliberately bumps flowtron. Existing symlinks do not need rewiring on
a normal version bump; newly shipped skills may need new symlinks.

For flowtron maintainers who want hot-reload behavior while editing this
checkout, symlink the bundle into the user skill directory instead:

```sh
mkdir -p ~/.agents/skills
ln -s ~/code/flowtron/codex/skills/* ~/.agents/skills/
```
