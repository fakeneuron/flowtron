---
name: ft-quality
description: Run lint + typecheck + test in sequence against the project. Heuristic stack detection (Node / Python / Go / Rust); fail-fast on first failure. Independent of the tasknote flow.
---

# flowtron — quality check

Run a sequenced lint + typecheck + test sweep against the project at the
current working directory. Detect the project's stack(s) heuristically from
manifest files at repo root, run the per-stack default commands in order, and
stop at the first failure. Project-agnostic; runs outside the tasknote flow.

The skill is markdown-only — the assistant invokes commands inline via its
Bash tool, no shell scripts (per `SPEC.md` §"What flowtron does NOT provide").

## Step 0 — Resolve inputs and args

- **Working directory:** the cwd. The skill makes no assumption about flowtron
  adoption — it works in any repo with one of the recognized manifests at
  repo root.
- **Args:** none. If `$ARGUMENTS` is non-empty, stop and surface the usage:
  `Usage: /ft-quality` (no args). Do not start the sweep.

## Step 1 — Detect stacks at repo root

Probe these manifest files at the cwd (repo root). Record every stack whose
manifest is present — multi-stack repos run each detected stack in sequence.

| Manifest file(s) at root | Stack |
|---|---|
| `package.json` | Node |
| `pyproject.toml` OR `setup.cfg` OR `ruff.toml` | Python |
| `go.mod` | Go |
| `Cargo.toml` | Rust |

**Empty-state:** if zero manifests are present, print

```text
🔍 /ft-quality: no recognized stack manifests found at repo root.
   Recognized: package.json · pyproject.toml/setup.cfg/ruff.toml · go.mod · Cargo.toml
```

and stop (Step 5).

## Step 2 — Build the per-stack run plan

For each detected stack, gather the lint / typecheck / test commands from the
table below. Skip any command whose prerequisite is missing (e.g., Node `lint`
script not in `package.json` → skip lint for Node; record as "skipped: no
`lint` script in package.json").

| Stack | Lint | Typecheck | Test | Notes |
|---|---|---|---|---|
| Node | `npm run lint` *(if `lint` in `package.json` scripts)* | `npm run typecheck` or `npm run type-check` *(whichever is present in scripts)* | `npm test` *(if `test` in scripts)* | Adopters with subdirectory frontends (e.g., `viz/`) typically delegate via root `package.json` scripts: `"lint": "npm --prefix viz run lint"`. The skill reads root only. |
| Python | `ruff check .` *(if `ruff` is configured in `pyproject.toml` `[tool.ruff]` or `ruff.toml` present)* | `mypy .` *(if `mypy` is configured)* | `pytest` *(always attempted when Python stack detected)* | Adopters with different tooling (flake8, pylint, pyright) fork the skill. |
| Go | `go vet ./...` | `go build ./...` | `go test ./...` | All three always attempted when `go.mod` detected. Go's compile is its type check. |
| Rust | `cargo clippy --all-targets -- -D warnings` | `cargo check` | `cargo test` | All three always attempted when `Cargo.toml` detected. |

Compute `TOTAL_STEPS` as the count of commands that survived the skip pass
across all detected stacks (each command is one step). If `TOTAL_STEPS` is 0
(detected stack but no commands to run — e.g., Node with no lint/typecheck/test
scripts), print

```text
🔍 /ft-quality: detected <stacks> but no quality commands available; nothing to run.
```

and stop (Step 5).

## Step 3 — Run the sweep (fail-fast)

Print the header:

```text
🔍 Running quality checks...
```

Then iterate over the run plan **in stack-detection order** (Node → Python →
Go → Rust), and within each stack in fixed order (Lint → Typecheck → Test).
Maintain a step counter (`STEP`) starting at 1.

For each command in the plan:

1. Print the step header:

   ```text
   Step <STEP>/<TOTAL_STEPS>: <Stack> — <Step label>...
   ```

   `<Step label>` is `Lint` / `Type check` / `Tests`. `<Stack>` is omitted
   from the step header when only one stack is detected (single-stack repos
   read cleaner).
2. Invoke the command via the Bash tool. Stream the tool's output directly to
   the user.
3. On success (exit 0): print `✅ <Step label> passed` and increment `STEP`.
4. On failure (non-zero exit): print

   ```text
   ❌ Quality check failed at: <Stack> <Step label>
      Fix the errors above and try again.
   ```

   then **stop the sweep immediately** — do not run subsequent steps. Jump to
   Step 5 (do not print the "all passed" summary in Step 4).

**Skipped commands** (recorded in Step 2 as "skipped: …") print a one-line
note at the position they would have occupied and do NOT increment the
denominator; they do NOT count toward `TOTAL_STEPS`:

```text
Skipped: <Stack> <Step label> — <reason>
```

## Step 4 — Final summary (success branch only)

If every step in the plan succeeded, print:

```text
✅ All quality checks passed!
```

(Single line. The per-step `✅ … passed` lines from Step 3 already provide
the per-step verdict trail.)

## Step 5 — Stop

After printing the final summary line (success branch) or the failure marker
(failure branch from Step 3), stop. Do not open a tasknote, ask a follow-up
question, suggest a next move, or offer the `📦` commit gate. `/ft-quality`
is purely a verification surface, independent of the tasknote flow.

If `/ft-task` is mid-flight when the user invokes `/ft-quality`, the two
skills do not communicate — the user is responsible for ticking Phase 3
boxes in their tasknote based on the `/ft-quality` outcome.
