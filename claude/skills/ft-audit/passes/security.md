# security — /ft-audit pass library

> Loaded by `SKILL.md` §1 step 1. Supplies the `security` domain's deltas; the
> dispatcher owns the shared procedure (arg grammar, caps, finding format,
> closing sections, PLAN write step, core hard rules).

**Attribution slug:** `audit-security`

## Scope & rubric hints (→ dispatcher §1)

- **Default scope (`all`/empty):** `<default glob>` _(forker: set this)_
- **Extra scope tokens:** none.
- **Rubric slots** (security contracts, not generic OWASP top-10):
  - `<rubric file 1>` — _(forker: e.g. `docs/THREAT-MODEL.md` — what's in/out of scope)_
  - `<rubric file 2>` — _(forker: e.g. `docs/AUTH.md` — auth/session contract)_
  - `<rubric file 3>` — _(forker: e.g. `.env.example` — declared secret surface)_
- **Verification gates:**
  ```sh
  <secret-scanner, e.g. gitleaks detect --no-banner>
  <dep-scanner, e.g. npm audit --production>
  <SAST if any>
  ```
  Failures become Critical findings in pass 1 or 5.

## The 5 passes (→ dispatcher §2)

1. **Secrets** — `.env` or `secrets.json` in git history; hardcoded API keys, tokens, DB passwords, JWT signing keys; secrets in test fixtures; tokens echoed into logs or error responses; private keys checked in; `.gitignore` gaps that allow accidental commits; credentials passed as positional CLI args (visible in `ps`). _(forker: add your project's secret-source-of-truth — e.g. AWS Secrets Manager, Vault, `.env` only)_
2. **Input handling** — unvalidated user input reaching SQL / shell / template / deserializer; injection vectors (SQL via string concat, command via `os.system`, template via SSTI, XSS via unescaped HTML); unsafe deserialization (`pickle.loads`, `yaml.load` without `SafeLoader`, untrusted JSON-RPC); path traversal in upload / download endpoints; XML external entity (XXE) in any XML parsing. _(forker: add stack-specific examples — `dangerouslySetInnerHTML` in React, `eval` in JS, raw SQL in your ORM-light code)_
3. **Auth & authz** — endpoints without auth checks; role / scope checks bypassable or missing on write paths; session handling (fixation, missing rotation on privilege change, indefinite lifetime); JWT validation gaps (alg-none, no exp check, signature not verified); CSRF on state-changing routes; missing rate-limit on auth-sensitive endpoints (login, password reset, OTP). _(forker: add your auth model — e.g. "all writes require non-readonly role", "service-to-service uses mTLS only")_
4. **Network & boundaries** — CORS misconfig (`*` on credentialed routes; reflective Origin without allowlist); overly permissive security headers (missing CSP, weak `Strict-Transport-Security`, no `X-Content-Type-Options`); public endpoints that should be internal-only; egress to unverified third parties; mixed-content / HTTP fallbacks; webhook signature verification missing; SSRF risk in URL-fetch endpoints.
5. **Dependencies** — supply-chain risks: known CVEs in direct deps (from scanner output in §1); transitive deps with active advisories; deps from typosquatted / unverified registries; lockfile missing or out of sync; postinstall scripts from untrusted packages; outdated security-critical libs (TLS, crypto, auth frameworks). _(forker: surface the actual scanner output count — "3 high-sev advisories from `npm audit`, top is X")_

## Severity guide (→ dispatcher §3)

- **Critical** — exploitable now (RCE, auth bypass, secret leaked in public repo or response body, SQLi with no parameterization, CVE with public exploit in dep). _(forker: name your project's sacred invariants here — e.g. paper-mode bypass for trading, PII exposure for healthcare, kill-switch bypass for automation.)_
- **High** — missing validation on attacker-controlled input, weak crypto (MD5 / SHA-1 for security purposes), missing rate-limit on auth endpoint, missing CSRF on state-changing route.
- **Medium** — header hardening gap, defensive-in-depth miss, dep with advisory but no current exploit path, secret in dev-only fixture.
- **Low** — nit, style, hygiene with no realistic abuse path.

## Specialist additions

- **Finding format:** tie "Why it matters" to the attack scenario or data-exposure surface.
- **Write-step exception** (dispatcher §5 step 4): a secret currently leaked in a tracked file → surface immediately and ask whether to rotate/scrub now, before the normal report flow continues.
- **Carve-out adjustment** (dispatcher §5): the trivial-fix carve-out is for trivial *hygiene* only — never apply an actual security fix (auth, validation, crypto, secret rotation) inline; those are above the skip threshold and follow the leaked-secret path above or a normal `/ft-task` ticket.
- **Hard rules:**
  - **Don't theorize about exploits.** If you can't trace an attacker-controlled input to the vulnerable sink, downgrade severity. Speculative "could be exploitable" is Low at most.
  - _(forker: append project-specific hard rules — e.g. "Secrets never appear in log lines, even at DEBUG. Any finding touching this is Critical regardless of how 'small' it looks.")_
