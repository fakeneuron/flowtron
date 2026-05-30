# Security

Flowtron is a solo-maintained workflow system, not a hardened product. This
page documents the realistic threat model and the conventions adopters should
follow. It is short on purpose — anything not covered here is out of scope.

## Reporting a vulnerability

Open a GitHub issue on this repository. There is no private disclosure
channel; flowtron has no networked attack surface, no users beyond its
adopters, and no realistic class of finding that benefits from embargoed
disclosure. If you believe you have an exception, say so in the issue and
omit exploit details until we agree on a path.

## Threat model

### Prompt injection via user-authored markdown

Flowtron's bundled skills — currently Claude Code-only (`/ft-task`,
`/ft-audit`, `/ft-release`, `/ft-audit-docs`, and others) — read
content the user authored: tasknotes, `PLAN.md`, `SPEC.md`. In an
adopter project, "the user" may include contributors who open pull
requests. The threat model below applies to any AI assistant reading
the same files; the Claude-Code-specific mitigations name `.claude/`
surfaces because that's the runtime flowtron ships skills for today.

A contributor PR that adds a tasknote (or edits `PLAN.md`) can attempt
to steer the assistant into running unintended shell commands the next
time a skill is invoked against that file. The realistic attack: an
attacker-supplied tasknote contains text crafted to look like skill
instructions and tells the assistant to run a `curl` exfiltrating
local files, modify config, etc. The risk scales with how permissive
the runtime's tool allowlist is.

**Adopter mitigations (any AI assistant).**

- Review contributor PRs that touch `_project/` content with the same care
  you would give to a code change. The body of a tasknote is executable
  context, even though it is plain markdown.
- Treat the first run of a skill against contributor-authored content as a
  judgment call, not a routine action.

**Adopter mitigations (Claude Code).**

- **Recommended three-layer hygiene:** global `~/.claude/settings.json` (base
  allowlists) + personal base layer (e.g. dedicated repo like natabula for
  reusable personal standards) + per-project `.claude/settings.local.json`
  kept tiny and high-signal only (or empty). Use `defaultMode: "acceptEdits"`
  (or `plan`) plus periodic `/less-permission-prompts` rather than growing
  long one-off allowlists. Broad globs (`Bash(curl *)`, whole-home `Read(**)`,
  etc.) remain high-risk for prompt injection.

The flowtron skills themselves do not implement a sandbox; the Claude Code
harness is the only enforcement layer.

### Submodule supply-chain trust

Adopters pin flowtron as a git submodule at a specific commit. The
contract surface (SPEC.md, skills, templates) is plain text — there is no
build step, no postinstall script, no executable from flowtron that runs
without the user invoking it.

The realistic compromise path is upstream takeover: if the flowtron
repository's `main` branch is poisoned, every adopter who bumps the
submodule pulls in malicious `SKILL.md` content that future skill
invocations will execute.

**Adopter mitigations.**

- Pin to annotated release tags (e.g. `v4.3.0`), not to `main` or to an
  unreviewed commit on `main`. Release tags are reviewed deliberately;
  `main` is a moving target.
- Review the diff between your pinned commit and the new tag before
  bumping, especially in `claude/skills/` and `claude/commands/`. The
  release tag's annotated message documents migration steps for major
  bumps.
- If you fork flowtron's skills into your project (the documented
  customization pattern in `docs/MIGRATION.md` §1.2.1), you take over
  review responsibility for that forked copy.

### Visualizer (`viz/`) dev-server scope

`viz/` is a single-user local development tool. It is not designed to run
on a network, behind a reverse proxy, or as a multi-tenant service. Its
dev server:

- Binds to `localhost:5120` only.
- Enforces `server.allowedHosts: ['localhost', '127.0.0.1']`, so requests
  with a spoofed `Host` header (DNS rebinding) are rejected by Vite
  before reaching application code.
- Rejects `/api/*` requests with a cross-origin `Origin` or `Referer`
  header. Same-origin requests from the visualizer's own UI, and
  origin-less requests from the local terminal (e.g. `curl`), are
  allowed.
- Reads files only from projects discovered under
  `${FLOWTRON_VIZ_WORKSPACE:-~/code}/*/_project/`. There is no
  user-controlled path input on any endpoint.

Do not expose port 5120 over a network or through a tunnel. If you need a
shared read-only view of project state, build a separate artifact (e.g.,
a static export); the dev server is not the right shape for that.

## Adopter scanner false-positive allowlists

Adopters running prompt-injection scanners (e.g., Semgrep rules) or secret-detection scanners (Gitleaks, TruffleHog, Snyk, etc.) will encounter false positives when scanning a repo that vendors flowtron as a submodule. The source is prose in `SPEC.md`, skill files, and this document that quotes the privileged-ops keyword triggers from SPEC §"Conditional skip rule".

**The `filepath:regex` allowlist convention**

GSD-Pi (source of the pattern adopted here) uses simple one-line entries in scanner ignore files (`.prompt-injection-scanignore`, `.secretscanignore`). Format:

```
filepath:regex
```

Examples (one per line):

```
_project/flowtron/SPEC.md:(API_KEY|SECRET|TOKEN|PASSWORD)
_project/flowtron/claude/skills/**/*.md:(API_KEY|SECRET|TOKEN|PASSWORD)
_project/flowtron/SECURITY.md:(API_KEY|SECRET|TOKEN|PASSWORD)
```

These suppress only the documented prose examples. Real credential material in your code or env files remains flagged.

**Flowtron-specific guidance**

Add the lines above (adjusted for your submodule path) to your scanner configuration. The examples cover the four uppercase keywords (`API_KEY`, `SECRET`, `TOKEN`, `PASSWORD`) that appear in the Conditional skip rule definition and in explanatory text throughout the tree.

See SPEC §"Conditional skip rule" for the authoritative privileged-ops path categories and keyword-trigger clause.

Flowtron does not ship `.prompt-injection-scanignore` or `.secretscanignore` files — zero runtime scanner configuration by design.
