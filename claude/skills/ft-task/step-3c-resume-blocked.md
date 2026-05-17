# Step 3c — Resume a blocked tasknote (executable steps)

> Lazy-loaded SKILL fragment. Loaded by `task` SKILL.md Step 3c when an existing tasknote has `status: blocked`. See `claude/skills/ft-task/SKILL.md` for the always-loaded core dispatch.

The blocked file already carries frontmatter, the spec sections (🎯 Goal / ✅ Acceptance / 🧩 Subtasks / 🔗 Related), and partial Phase 2 progress captured before the parking event. Resume re-activates it in place.

1. **Drift-check the parked work.** Read each path, line number, function name, and pattern citation in the existing Discovery / Execution notes against current code. Phase 2 progress may rest on symbols that moved while the task was parked. Surface any drift to the user before re-entering execution.
2. **Update YAML frontmatter** in place: `status: blocked` → `status: in-progress`.
3. **Update the nav header.** Change `⏸ Blocked` → `🟢 In progress`.
4. **Optional cleanup of the PLAN.md line** — if `Blocked by [[ID]]` was added to the PLAN.md long description at parking, ask the user (AskUserQuestion) whether to remove it now. Default: leave it (it's accurate historical context and the line remains unchecked until completion).
5. **Continue at Phase 2.** The Phase 1 checklist is already complete — do not re-run it. Pick up Execution where the parking note left off.
