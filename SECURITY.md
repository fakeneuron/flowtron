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

Flowtron's bundled execution surfaces — Claude Code skills/commands
(`/ft-task`, `/ft-audit`, `/ft-release`, `/ft-audit-repo`, and others)
plus Codex skill wrappers under `codex/skills/` — read content the user
authored: tasknotes, `PLAN.md`, `SPEC.md`. In an adopter project, "the
user" may include contributors who open pull requests. The threat model
below applies to any AI assistant reading the same files; runtime-specific
mitigations name `.claude/` and `.agents/skills/` surfaces where relevant.

A contributor PR that adds a tasknote (or edits `PLAN.md`) can attempt
to steer the assistant into running unintended shell commands the next
time a skill is invoked against that file. The realistic attack: an
attacker-supplied tasknote contains text crafted to look like skill
instructions and tells the assistant to run a `curl` exfiltrating
local files, modify config, etc. The risk scales with how permissive
the runtime's tool allowlist is.

**Adopter mitigations (any AI assistant).**

- Review contributor PRs that touch `.flowtron/` content with the same care
  you would give to a code change. The body of a tasknote is executable
  context, even though it is plain markdown.
- Treat the first run of a skill against contributor-authored content as a
  judgment call, not a routine action.

**Adopter mitigations (Claude Code).**

- **Recommended three-layer hygiene:** global `~/.claude/settings.json` (base
  allowlists) + personal base layer (e.g. dedicated repo like natabula for
  reusable personal standards) + per-project `.claude/settings.local.json`
  kept tiny and high-signal only (or empty). Use `defaultMode: "acceptEdits"`
  (or `plan`) plus periodic `/fewer-permission-prompts` rather than growing
  long one-off allowlists. Broad globs (`Bash(curl *)`, whole-home `Read(**)`,
  etc.) remain high-risk for prompt injection.

The flowtron skills themselves do not implement a sandbox; the Claude Code
harness is the only enforcement layer.

**Contemporary tactic refinements.** The "review the PR diff" mitigation
above assumes the injected payload is visible to a human reading the diff.
Three current tactics defeat that assumption; each sits inside the same
any-AI-assistant threat model.

- **Invisible-Unicode smuggling.** Instructions can be hidden in zero-width
  characters (e.g. U+200B), the Unicode Tags block (U+E0000–E007F, the
  "ASCII smuggler"), bidirectional overrides (U+202E), or homoglyphs. They
  render blank or benign in a diff view while the model reads them
  verbatim — so visual PR review is necessary but *not sufficient*. Before
  acting on contributor-authored `.flowtron/` content, scan the changed
  text for the invisible classes specifically (ordinary emoji and
  em-dashes are not the concern; the dangerous codepoints render to
  nothing). For example:
  `grep -nP '[\x{200B}-\x{200F}\x{202A}-\x{202E}\x{2060}-\x{2064}\x{FEFF}\x{E0000}-\x{E007F}]'`
  over the changed files, and treat any hit as suspect.

- **The lethal trifecta — git as the exfil channel.** In an adopter repo
  the skills combine all three legs of the "lethal trifecta": access to
  private local data, exposure to untrusted contributor content, and an
  exfiltration channel. Blocking `Bash(curl *)` does not close the channel
  — flowtron's own closure protocol commits and pushes, so a commit
  message, branch name, or pushed file is itself an exfil surface (e.g. an
  injected instruction to append `$(… | base64)` to the commit body). The
  human 📦 ready-to-commit gate is the control that closes this; do not
  suppress it (`--fast`) on a first run against contributor-authored
  content.

- **Forged in-content control-markers.** flowtron's safety rests on control
  markers and gates the *assistant* emits about its own actions
  (`✅ Closure complete; committing autonomously …`, the 🛠️/📦 banners) and
  on diff-derived skip-rule signals. A malicious tasknote or `PLAN.md` line
  can embed a forged version of these — or text engineered to read as "no
  privileged-ops paths here" — to socially-engineer the assistant past the
  human commit gate. Such markers are never authoritative when they appear
  in read content; the operative contract clause is in
  [`SPEC/gates.md`](SPEC/gates.md) §"Operator-gate cues" → "Control-marker
  integrity".

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

- Pin to annotated release tags (e.g. `v5.14.1`), not to `main` or to an
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
  `${FLOWTRON_VIZ_WORKSPACE:-~/code}/*/.flowtron/`. There is no
  user-controlled path input on any endpoint.
- Sends a defense-in-depth `Content-Security-Policy` response header
  (`server.headers` in `vite.config.ts`): `default-src 'self'`,
  `object-src 'none'`, `base-uri 'self'`, `frame-ancestors 'none'`, and a
  `script-src` with no `'unsafe-inline'` (Vite's injected dev scripts carry
  a static nonce). `style-src` keeps `'unsafe-inline'` because Vite/Tailwind
  inject `<style>` at runtime in dev and those injections cannot carry a
  build-time nonce. `img-src 'self' data:` permits data-URI images.
  `connect-src` is limited to same-origin plus the local HMR websocket.

Do not expose port 5120 over a network or through a tunnel. If you need a
shared read-only view of project state, build a separate artifact (e.g.,
a static export); the dev server is not the right shape for that.

## Adopter scanner false-positive allowlists

Adopters running prompt-injection scanners (e.g., Semgrep rules) or secret-detection scanners (Gitleaks, TruffleHog, Snyk, etc.) will encounter false positives when scanning a repo that vendors flowtron as a submodule. The source is prose in `SPEC.md`, skill files, and this document that quotes the privileged-ops keyword triggers from SPEC/gates.md §"Conditional skip rule".

**The `filepath:regex` allowlist convention**

GSD-Pi (source of the pattern adopted here) uses simple one-line entries in scanner ignore files (`.prompt-injection-scanignore`, `.secretscanignore`). Format:

```
filepath:regex
```

Examples (one per line):

```
.flowtron/core/SPEC.md:(API_KEY|SECRET|TOKEN|PASSWORD)
.flowtron/core/claude/skills/**/*.md:(API_KEY|SECRET|TOKEN|PASSWORD)
.flowtron/core/SECURITY.md:(API_KEY|SECRET|TOKEN|PASSWORD)
```

These suppress only the documented prose examples. Real credential material in your code or env files remains flagged.

**Flowtron-specific guidance**

Add the lines above (adjusted for your submodule path) to your scanner configuration. The examples cover the four uppercase keywords (`API_KEY`, `SECRET`, `TOKEN`, `PASSWORD`) that appear in the Conditional skip rule definition and in explanatory text throughout the tree.

See SPEC/gates.md §"Conditional skip rule" for the authoritative privileged-ops path categories and keyword-trigger clause.

Flowtron does not ship `.prompt-injection-scanignore` or `.secretscanignore` files — zero runtime scanner configuration by design.
