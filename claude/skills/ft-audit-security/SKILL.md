---
name: ft-audit-security
description: Security-focused audit — 5 passes (Secrets · Input handling · Auth & authz · Network & boundaries · Dependencies), capped findings, writes tickets to `_project/PLAN.md`. Stack-neutral scaffold; adopters fork into `.claude/skills/audit-security/` and customize sacred invariants + dep-scan + secret-scan tooling. See `docs/MIGRATION.md` §1.2.1.
---

# audit-security — flowtron security audit skill

Principal-engineer security audit: find what matters, report concisely, **make no changes without explicit confirmation**.

Stack-neutral scaffold — **fork**, don't symlink (sacred-invariant + threat-model + scanner divergence). Install per `docs/MIGRATION.md` §1.2.1.

## 0. Forker checklist (fill in before first run)

Walk this list once per fork. The placeholders in §1, §2, and §3 below are the things to replace.

- [ ] `name:` and `description:` frontmatter — set to your fork's slash-command name and a stack-specific blurb.
- [ ] §1 step 1 "Resolve scope" — set the default-`all` glob for your stack (e.g. `backend/**/*.py`, `src/**/*.ts`, `**/*` excluding generated dirs).
- [ ] §1 step 2 "Load the project rubric" — replace placeholder rubric paths with your project's auth notes, threat model, security ADRs, secret-management docs.
- [ ] §1 step 3 "Run verification gates" — wire your project's actual secret-scanner (e.g. `gitleaks detect`, `trufflehog`), dep-scanner (e.g. `npm audit`, `pip-audit`, `cargo audit`, `safety check`), and SAST if any.
- [ ] §2 each pass — replace generic-placeholder bullets with your stack's concrete examples (specific frameworks, known-bad patterns in your tech, regulated-data invariants).
- [ ] §3 "Severity guide" — name your project's sacred invariants under **Critical** (e.g. "paper-mode bypass for trading", "PII leak for healthcare", "kill-switch bypass for ops automation").
- [ ] §6 "Hard rules" — append any project-specific hard rules (e.g. "secrets never logged, even at DEBUG", "auth checks never conditional on environment").

Once the checklist is satisfied, delete this §0 block from your fork.

## 1. Scope & ground rules (do this first, always)

1. **Resolve scope** from `$ARGUMENTS`: `all`/empty → `<default glob>` _(forker: set this)_; a path → that path; `last-commit` → files in `HEAD`; `staged` → files in `git diff --cached`. If ambiguous, **stop and ask** via `AskUserQuestion`.
2. **Load the project rubric** (security contracts, not generic OWASP top-10):
   - `<rubric file 1>` — _(forker: e.g. `docs/THREAT-MODEL.md` — what's in/out of scope)_
   - `<rubric file 2>` — _(forker: e.g. `docs/AUTH.md` — auth/session contract)_
   - `<rubric file 3>` — _(forker: e.g. `.env.example` — declared secret surface)_
3. **Run verification gates** so passes don't report scanner noise:
   ```sh
   <secret-scanner, e.g. gitleaks detect --no-banner>
   <dep-scanner, e.g. npm audit --production>
   <SAST if any>
   ```
   Failures become Critical findings in pass 1 or 5.
4. If anything's unclear, stop and ask. Don't guess intent.

## 2. The 5 passes (in order)

Run in this exact order. **Cap each pass at 5 findings max.** If a pass has more, keep the top 5 by severity and note the tail count (`+3 more Low omitted`).

1. **Secrets & credentials** — `.env` or `secrets.json` in git history; hardcoded API keys, tokens, DB passwords, JWT signing keys; secrets in test fixtures; tokens echoed into logs or error responses; private keys checked in; `.gitignore` gaps that allow accidental commits; credentials passed as positional CLI args (visible in `ps`). _(forker: add your project's secret-source-of-truth — e.g. AWS Secrets Manager, Vault, `.env` only)_
2. **Input handling** — unvalidated user input reaching SQL / shell / template / deserializer; injection vectors (SQL via string concat, command via `os.system`, template via SSTI, XSS via unescaped HTML); unsafe deserialization (`pickle.loads`, `yaml.load` without `SafeLoader`, untrusted JSON-RPC); path traversal in upload / download endpoints; XML external entity (XXE) in any XML parsing. _(forker: add stack-specific examples — `dangerouslySetInnerHTML` in React, `eval` in JS, raw SQL in your ORM-light code)_
3. **Auth & authz** — endpoints without auth checks; role / scope checks bypassable or missing on write paths; session handling (fixation, missing rotation on privilege change, indefinite lifetime); JWT validation gaps (alg-none, no exp check, signature not verified); CSRF on state-changing routes; missing rate-limit on auth-sensitive endpoints (login, password reset, OTP). _(forker: add your auth model — e.g. "all writes require non-readonly role", "service-to-service uses mTLS only")_
4. **Network & boundaries** — CORS misconfig (`*` on credentialed routes; reflective Origin without allowlist); overly permissive security headers (missing CSP, weak `Strict-Transport-Security`, no `X-Content-Type-Options`); public endpoints that should be internal-only; egress to unverified third parties; mixed-content / HTTP fallbacks; webhook signature verification missing; SSRF risk in URL-fetch endpoints.
5. **Dependencies & supply chain** — known CVEs in direct deps (from scanner output in §1 step 3); transitive deps with active advisories; deps from typosquatted / unverified registries; lockfile missing or out of sync; postinstall scripts from untrusted packages; outdated security-critical libs (TLS, crypto, auth frameworks). _(forker: surface the actual scanner output count — "3 high-sev advisories from `npm audit`, top is X")_

## 3. Finding format (use exactly this)

```text
**Finding #[N] – [Critical|High|Medium|Low] – [Pass # / Category]**
- Location: `path/to/file:LINE` (or endpoint / route name)
- Issue: one sentence
- Why it matters: brief — tie to attack scenario or data-exposure surface
- Recommended fix: concrete suggestion or ≤5-line snippet
```

Severity guide:
- **Critical** — exploitable now (RCE, auth bypass, secret leaked in public repo or response body, SQLi with no parameterization, CVE with public exploit in dep). _(forker: name your project's sacred invariants here — e.g. paper-mode bypass for trading, PII exposure for healthcare, kill-switch bypass for automation.)_
- **High** — missing validation on attacker-controlled input, weak crypto (MD5 / SHA-1 for security purposes), missing rate-limit on auth endpoint, missing CSRF on state-changing route.
- **Medium** — header hardening gap, defensive-in-depth miss, dep with advisory but no current exploit path, secret in dev-only fixture.
- **Low** — nit, style, hygiene with no realistic abuse path.

## 4. Required closing sections (always, in order)

1. **Summary** — health score 1–10 with one-sentence justification + top 3 issues (by severity, not pass order).
2. **Exploratory Insights** — what the findings reveal about the project's security posture. Patterns, not individual issues (e.g. "three of five auth findings cluster on the admin routes — suggests the admin module skipped the standard auth middleware").
3. **Proposed tasks for `_project/PLAN.md`** — prioritized, actionable tickets using flowtron's task-line grammar. One ticket per thematic cluster, not per finding. Present them inline so the user can review before anything is written to disk.
4. **Questions for the user** — anything ambiguous that blocks implementation (e.g. "is the admin route intentionally public for the read paths?"). Use `AskUserQuestion`, not prose.

## 5. Write the proposed tasks into `_project/PLAN.md` (required, not optional)

The deliverable is tickets in PLAN.md.

1. **After** §§1–3 are presented and any `AskUserQuestion` blockers are answered, write tickets using flowtron's task-line grammar: `- [ ] **<AREA>-<N>** [opus|sonnet] | shortname — long description.` See SPEC §"Task-line format".
2. Pick the next free `<N>` per area prefix (valid prefixes in `_project/tasknote/README.md` §"Area prefixes").
3. Insert in correct priority section. Append `Surfaced by audit-security YYYY-MM-DD (Finding #N, <severity>)`.
4. **No code changes.** Tickets only — fixes happen in `/ft-task` cycles. **Exception:** secret currently leaked in a tracked file → surface immediately and ask whether to rotate/scrub now.
5. User pushes back on a ticket → drop it.

Zero findings across all passes → say so explicitly and skip the write.

## 6. Hard rules

- **Targeted, not exhaustive.** Five findings per pass is a *ceiling*, not a target. A clean pass gets zero findings and moves on.
- **Write tickets, not fixes.** `_project/PLAN.md` gets updated; source files do NOT (with the secret-leaked exception in §5 step 4).
- **Don't repeat the scanner.** If `gitleaks` / `npm audit` / etc. already flagged it, surface the count once in pass 1 or 5 and link to the scanner output — don't enumerate each scanner row as a separate finding.
- **Don't audit adjacent code.** Stay inside the resolved scope.
- **Don't theorize about exploits.** If you can't trace an attacker-controlled input to the vulnerable sink, downgrade severity. Speculative "could be exploitable" is Low at most.
- **No final summary of what you just did.** The report + the `_project/PLAN.md` diff *are* the deliverable.
- _(forker: append project-specific hard rules — e.g. "Secrets never appear in log lines, even at DEBUG. Any finding touching this is Critical regardless of how 'small' it looks.")_
