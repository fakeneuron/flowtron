---
name: ft-sidequest
description: Park an idea or quick-fix mid-session with minimal disruption — tiny sidequest stub + one PLAN line, then resume current work. Priority via flags (--low, --med, --fut) or one short question when omitted. Lighter than `/ft-file-followup`. Promote via `/ft-micro-task` or `/ft-task`. See SPEC/tasknote-selection.md.
---

# sidequest — flowtron ultra-light idea parker

Park an **idea or quick fix** without breaking the current session. The lightest persistent filing motion: one tiny stub at `.flowtron/sidequest/<TASK-ID>.md`, one PLAN line under the right priority section, then straight back to work.

**Lighter than `/ft-file-followup`:** no review gate, no downstream-impact reconciliation scan, no conversational paragraph. **Heavier than chat-only:** the idea, priority intent, and a resume anchor persist to disk.

If `args` carries a valid `<AREA>-<NUMBER>` (or `<AREA>-<NUMBER>.<SUB>`) token, use it. Otherwise **auto-allocate** the next free ID: area = active tasknote prefix, else active PLAN entry prefix, else `CORE-`; scan all PLAN.md lines (open + `## Completed`) for `**<AREA>-<N>**` and `**<AREA>-<N>.<SUB>**`, take max `N`, use `N+1`. Do not ask unless the area is genuinely ambiguous.

## Priority flags (optional — skips the question)

Parse `args` for a priority flag (any position; strip before drafting). Accepted forms:

| Flag | PLAN section | `pickup:` |
|---|---|---|
| `--low` | Low | `next-chat` |
| `--med`, `--medium` | Medium | `soon` |
| `--fut`, `--future` | Future Opportunities | `later` |
| `--high` | High | `soon` |

Examples: `/ft-sidequest --low fix null guard in parser`, `/ft-sidequest --med CORE-342`, `/ft-sidequest explore redis --fut`.

**No flag → one short question, then stop.** Before writing anything, ask exactly one line (no AskUserQuestion widget, no multi-field form):

```text
Park as **Low** (next-chat fix) · **Medium** (soon) · or **Future** (later)?
```

Optionally parenthesize your best read from context, e.g. `(sounds like Low)`. **Do not write files until the user answers.** On the next turn, map their reply (`low` / `med` / `fut` / full words / flag repeat) and continue at Step 3.

## Step 0 — Resolve paths

- **Adopter:** `.flowtron/core/SPEC.md` exists → template=`.flowtron/core/templates/sidequest-template.md`.
- **Flowtron self-host:** repo-root `SPEC.md` with `# Flowtron — Workflow Specification` → template=`templates/sidequest-template.md`.

If neither matches, bail. PLAN=`.flowtron/PLAN.md`, sidequest dir=`.flowtron/sidequest/`.

## Step 1 — Pre-flight (hard stops only)

- Resolve **Area** from the task ID prefix. Unknown prefix → read `.flowtron/tasknote/README.md`; still unknown → stop and ask once for area/ID.
- Task ID must NOT already exist in PLAN.md, `.flowtron/tasknote/<ID>.md`, `.flowtron/tasknote/archive/<area>/<ID>.md`, or `.flowtron/sidequest/<ID>.md`. On conflict, stop and ask for a different ID — do not guess.

## Step 2 — Draft (after priority is known)

From conversation context + remaining `args` text after flag/ID stripped:

1. **Idea** — compress to ≤80 words in `## Idea`.
2. **Shortname** — ≤30 chars for the PLAN `| shortname` segment.
3. **Long description** — ≤30 words for the PLAN `— ` segment (hard cap; trim ruthlessly).
4. **Resume anchor** — one sentence in `## Resume anchor`: where the main session was (active task + step, or the in-flight user goal).
5. **Parent** — YAML `parent:` = active task ID when one exists; else leave empty.
6. **Priority** — from flag or user's answer; set YAML `priority:` and `pickup:` per the flag table. Default model `[light]`; `[medium]` only when the idea clearly needs design judgment. Add `[!critical]` on the PLAN line only for `--high` with explicit urgency.

**Context hints** (for the question's parenthetical suggestion only — never auto-file without flag or answer): quick fix / typo → suggest Low; same feature/epic → suggest Medium; tangential exploration → suggest Future. Ready to execute **now** → `/ft-micro-task`, not this skill.

## Step 3 — Write (one motion)

1. `mkdir -p .flowtron/sidequest/`
2. Copy the sidequest template → `.flowtron/sidequest/<TASK-ID>.md`; fill frontmatter, H1, nav date, `## Idea`, `## Resume anchor`, `parent:`.
3. Append under `## <Priority>`:

   ```text
   - [ ] **<TASK-ID>** [light] | <shortname> — <long description>. Sidequest at `.flowtron/sidequest/<TASK-ID>.md`.
   ```

   Replace `(none)` placeholder if present; else append to section bottom.

Do **not** commit unprompted.

## Step 4 — Resume (mandatory handoff)

Reply in **≤70 words total** using this exact shape — no extra sections, no reconcile notes, no promotion lecture:

```text
📌 **<TASK-ID>** parked **<Priority>** → `.flowtron/sidequest/<TASK-ID>.md`

**Resuming:** <resume anchor, one sentence>
```

If the user immediately corrects priority in chat, move the PLAN line to the right section in the same turn (no re-file).

Then **continue the interrupted work inline** in the same response (pick up code/edits/questions exactly where the session left off before `/ft-sidequest`). The sidequest bracket is a parenthetical, not a session end.

## Notes

- **Routing:** see SPEC/tasknote-selection.md. `/ft-sidequest` = park idea or quick fix, ≤80w, resume inline. Needs review gate or reconcile scan → `/ft-file-followup`. Rich context → `/ft-starter-task`. Execute now → `/ft-micro-task` or `/ft-task`.
- **Promotion:** fresh session → read stub; `/ft-micro-task <ID>` (quick fix), `/ft-task <ID>` (normal), or `/ft-starter-task <ID>` (expand context). Delete `.flowtron/sidequest/<ID>.md` after promotion.
- **Context-dependent:** draws from the current conversation — run in-session, not after `/clear`.