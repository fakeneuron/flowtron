#!/usr/bin/env node
// update-adopters — batch-bump flowtron adopter pins to the latest release.
//
// The singular script exception to SPEC.md §"What flowtron does NOT provide"
// (see the carve-out there): operator-side fleet maintenance across ~/code,
// not workflow machinery inside a project. It batches the /ft-update recipe:
// for every adopter pinned behind the latest released tag, move the
// .flowtron/core submodule pin and commit — locally only, never pushing.
//
// Usage:
//   node tools/update-adopters.mjs            # dry-run: report what would happen
//   node tools/update-adopters.mjs --apply    # perform the bumps + commits
//   node tools/update-adopters.mjs --root <dir>   # workspace override
//                                             # (default $FLOWTRON_VIZ_WORKSPACE or ~/code)
//
// Per-adopter safety gates (any hit → skip that repo, report why):
//   - adopter pinned NEWER than the latest known release → bumping would
//     downgrade it (usually a stale tag list in this checkout)
//   - release range carries a real Migration block (BREAKING or required
//     project-side edits) → manual /ft-update required
//   - staged changes in the adopter's index → a commit here would surprise
//   - dirty .flowtron/core submodule worktree
//
// Gitlink-drift detection: even when the checked-out .flowtron/core/SPEC.md reads
// the latest release, the superproject's committed submodule pin can still record
// an older commit (the tag was checked out inside .flowtron/core but the pin was
// never committed). The submodule worktree is clean, so the dirty-worktree gate
// misses it — a fresh clone would revert to the stale pin. Such a repo is reported
// as `drift` (not `current`); the fix is `git add .flowtron/core` + commit, or
// /ft-update. Report-only — never auto-committed.
//
// Mid-bump rollback: applyBump mutates the adopter (submodule checkout, then a
// staged gitlink) before it commits, and every step after the checkout can fail.
// Without recovery a failed bump leaves the repo half-updated — submodule at the
// new tag, gitlink possibly staged, nothing committed — and the residue is
// self-concealing: the worktree now reads the new version, so a re-run classifies
// the repo as current/drift rather than bump and the failure never resurfaces. So
// the prior submodule SHA is captured before the checkout and restored (plus the
// gitlink unstaged, when it got that far) on any later failure. The original error
// still propagates to the ✗ report line; a rollback that itself fails is appended
// to it rather than swallowed.
//
// Not covered (by design — run /ft-update in the repo for these): per-project
// symlink wiring for newly shipped skills, and audit-fork drift scans. When a
// bumped range ships a new *per-project-wired* skill (one named in a platform
// AGENTS-snippet ln -s block), the report flags the repo and names the affected
// wiring surface.

import { execFile } from 'node:child_process';
import { readdir, readFile, stat } from 'node:fs/promises';
import { homedir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

if (Number(process.versions.node.split('.')[0]) < 20) {
  console.error(`update-adopters requires Node ≥20 (found ${process.version})`);
  process.exit(1);
}

const execFileAsync = promisify(execFile);

const FLOWTRON_REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SUBMODULE_PATH = join('.flowtron', 'core');
const WIRING_SURFACES = [
  {
    label: 'Claude .claude/',
    snippetPath: 'claude/AGENTS-snippet.md',
    diffPaths: ['claude/skills/', 'claude/commands/'],
    snippetKeyPattern: /\.flowtron\/core\/(claude\/(?:skills|commands)\/\S+)/,
    addedKeyForFile(path) {
      const skill = path.match(/^(claude\/skills\/[^/]+)/);
      if (skill) return skill[1];
      const command = path.match(/^(claude\/commands\/[^/]+\.md)$/);
      if (command) return command[1];
      return null;
    },
  },
  {
    label: 'Codex .agents/skills',
    snippetPath: 'codex/AGENTS-snippet.md',
    diffPaths: ['codex/skills/'],
    snippetKeyPattern: /\.flowtron\/core\/(codex\/skills\/\S+)/,
    addedKeyForFile(path) {
      const skill = path.match(/^(codex\/skills\/[^/]+)/);
      return skill ? skill[1] : null;
    },
  },
];

export async function git(cwd, ...args) {
  const { stdout } = await execFileAsync('git', args, { cwd });
  return stdout;
}

export function parseArgs(argv, { exitOnError = true } = {}) {
  const args = { apply: false, root: null };
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--apply') args.apply = true;
    else if (argv[i] === '--root') {
      args.root = argv[i + 1];
      i += 1;
    } else {
      const msg = `Unknown arg: ${argv[i]}\nUsage: node tools/update-adopters.mjs [--apply] [--root <dir>]`;
      if (exitOnError) {
        console.error(`Unknown arg: ${argv[i]}`);
        console.error('Usage: node tools/update-adopters.mjs [--apply] [--root <dir>]');
        process.exit(2);
      }
      const err = new Error(msg);
      err.code = 'USAGE';
      throw err;
    }
  }
  return args;
}

// expandHome/workspaceRoot/isFile mirror viz/src/workspace.ts verbatim (bar
// workspaceRoot's arg shape — root string here, env object there). Left
// duplicated rather than shared: this script has no package.json and runs
// via plain `node`, so a shared module would either be plain JS imported
// across the tools/↔viz/src boundary (new coupling between two currently
// independent surfaces) or TS requiring a loader this script doesn't have —
// either breaks the zero-dep standalone property it's built on.
function expandHome(path) {
  if (path === '~') return homedir();
  if (path.startsWith('~/')) return join(homedir(), path.slice(2));
  return path;
}

function workspaceRoot(rootArg) {
  const raw = rootArg ?? process.env.FLOWTRON_VIZ_WORKSPACE;
  return expandHome(raw && raw.length > 0 ? raw : '~/code');
}

export function parseSemverTag(tag) {
  const m = /^v(\d+)\.(\d+)\.(\d+)$/.exec(tag);
  if (!m) return null;
  return [Number(m[1]), Number(m[2]), Number(m[3])];
}

export function compareSemver(a, b) {
  for (let i = 0; i < 3; i += 1) {
    if (a[i] !== b[i]) return a[i] - b[i];
  }
  return 0;
}

// See the expandHome comment above — same zero-dep tradeoff applies here.
async function isFile(path) {
  try {
    return (await stat(path)).isFile();
  } catch {
    return false;
  }
}

async function isDir(path) {
  try {
    return (await stat(path)).isDirectory();
  } catch {
    return false;
  }
}

// Same Version-line contract viz/src/workspace.ts reads.
export async function pinnedVersion(specPath) {
  try {
    const text = await readFile(specPath, 'utf8');
    const m = /^\*\*Version:\*\*\s*(v?\d+\.\d+\.\d+)/m.exec(text);
    if (!m) return null;
    return m[1].startsWith('v') ? m[1] : `v${m[1]}`;
  } catch {
    return null;
  }
}

// Resolve a committed gitlink SHA to a human-legible label: a release tag when
// the commit is tagged, else a short SHA.
export async function describePin(sha) {
  try {
    const tags = (await git(FLOWTRON_REPO, 'tag', '--points-at', sha))
      .split('\n')
      .map((l) => l.trim())
      .filter((t) => parseSemverTag(t));
    if (tags.length > 0) return tags[0];
  } catch {
    // fall through to the short SHA
  }
  return sha.slice(0, 12);
}

// Compare the superproject's committed submodule gitlink against the latest
// release commit. Returns a reason string when they diverge (drift), else null.
// Commit SHAs are content-identical across clones, so FLOWTRON_REPO is the
// canonical source for the latest-tag SHA — no adopter-side fetch needed.
export async function gitlinkDrift(repo, latest) {
  let recorded;
  try {
    recorded = (await git(repo, 'rev-parse', `HEAD:${SUBMODULE_PATH}`)).trim();
  } catch {
    return null; // no committed gitlink to compare — nothing to report
  }
  let latestSha;
  try {
    latestSha = (await git(FLOWTRON_REPO, 'rev-parse', `${latest}^{commit}`)).trim();
  } catch {
    return null; // can't resolve the latest tag locally — skip the cross-check
  }
  if (recorded === latestSha) return null;
  return `committed gitlink at ${await describePin(recorded)}, worktree SPEC.md at ${latest} — commit the pin (git add ${SUBMODULE_PATH}) or run /ft-update`;
}

export async function latestReleaseTag() {
  const stdout = await git(FLOWTRON_REPO, 'tag', '--sort=-v:refname');
  return stdout.split('\n').map((l) => l.trim()).find((l) => parseSemverTag(l)) ?? null;
}

// Tags strictly after `fromTag` up to and including `toTag`, ascending.
export async function tagsInRange(fromTag, toTag) {
  const from = parseSemverTag(fromTag);
  const to = parseSemverTag(toTag);
  const stdout = await git(FLOWTRON_REPO, 'tag', '--sort=v:refname');
  return stdout
    .split('\n')
    .map((l) => l.trim())
    .filter((tag) => {
      const v = parseSemverTag(tag);
      if (!v) return false;
      return (from === null || compareSemver(v, from) > 0) && compareSemver(v, to) <= 0;
    });
}

// A tag is migration-bearing unless its Migration block opens with the
// release convention's all-clear sentinel ("No required project-side edits",
// checked case-insensitively). "Migration (BREAKING — ...)" headings are
// always migration-bearing.
export async function migrationBearingTags(tags) {
  const bearing = [];
  for (const tag of tags) {
    const contents = await git(FLOWTRON_REPO, 'tag', '-l', '--format=%(contents)', tag);
    const lines = contents.split('\n');
    const headingIdx = lines.findIndex((l) => /^Migration\b/.test(l.trim()));
    if (headingIdx === -1) continue; // no Migration block at all → non-breaking
    if (/BREAKING/.test(lines[headingIdx])) {
      bearing.push(tag);
      continue;
    }
    const firstBody = lines
      .slice(headingIdx + 1)
      .map((l) => l.trim())
      .find((l) => l.length > 0);
    if (!firstBody || !firstBody.toLowerCase().startsWith('no required project-side edits')) {
      bearing.push(tag);
    }
  }
  return bearing;
}

// The per-platform symlink-wiring set: paths named in the freshly-bumped
// AGENTS-snippet ln -s block — the authority /ft-update Step 4 consults.
// Read at toTag to match what the adopter bumps to.
async function wiredSkillKeys(toTag, surface) {
  let snippet;
  try {
    snippet = await git(FLOWTRON_REPO, 'show', `${toTag}:${surface.snippetPath}`);
  } catch {
    return null; // snippet unreadable at toTag — caller falls back to coarse check
  }
  const keys = new Set();
  for (const line of snippet.split('\n')) {
    if (!line.includes('ln -s')) continue;
    const m = line.match(surface.snippetKeyPattern);
    if (m) keys.add(m[1]); // e.g. claude/skills/ft-task or codex/skills/ft-task
  }
  return keys;
}

async function addedFilesForSurface(fromTag, toTag, surface) {
  const stdout = await git(
    FLOWTRON_REPO,
    'diff',
    '--name-only',
    '--diff-filter=A',
    `${fromTag}..${toTag}`,
    '--',
    ...surface.diffPaths,
  );
  return stdout.split('\n').filter((l) => l.trim().length > 0);
}

async function newSkillWiringSurfaces(fromTag, toTag) {
  const affected = [];
  for (const surface of WIRING_SURFACES) {
    const added = await addedFilesForSurface(fromTag, toTag, surface);
    if (added.length === 0) continue;

    const wired = await wiredSkillKeys(toTag, surface);
    // Snippet unreadable → fall back to the coarse platform signal (better to
    // over-flag a no-op /ft-update than to silently miss a genuine new link).
    if (wired === null) {
      affected.push(surface.label);
      continue;
    }

    const needsWiring = added.some((path) => {
      const key = surface.addedKeyForFile(path);
      return key !== null && wired.has(key);
    });
    if (needsWiring) affected.push(surface.label);
  }
  return affected;
}

export function formatSkillsNote(surfaces) {
  if (surfaces.length === 0) return '';
  const surfaceText =
    surfaces.length === 1
      ? surfaces[0]
      : `${surfaces.slice(0, -1).join(', ')} and ${surfaces.at(-1)}`;
  return ` (new skills shipped in range — run /ft-update to wire ${surfaceText} symlinks)`;
}

export async function discoverAdopters(root) {
  let entries;
  try {
    entries = await readdir(root, { withFileTypes: true });
  } catch {
    return { adopters: [], legacy: [] };
  }
  const adopters = [];
  const legacy = [];
  for (const entry of entries) {
    if (!(entry.isDirectory() || entry.isSymbolicLink())) continue;
    if (entry.name.startsWith('.')) continue;
    const repo = join(root, entry.name);
    if (resolve(repo) === FLOWTRON_REPO) continue; // flowtron itself: /ft-release territory
    if (await isFile(join(repo, SUBMODULE_PATH, 'SPEC.md'))) {
      adopters.push({ name: entry.name, repo });
    } else if (await isDir(join(repo, '.flowtron', 'flowtron'))) {
      legacy.push(entry.name);
    }
  }
  adopters.sort((a, b) => a.name.localeCompare(b.name));
  return { adopters, legacy };
}

export async function checkAdopter(adopter, latest) {
  const { repo } = adopter;
  const sub = join(repo, SUBMODULE_PATH);
  const current = await pinnedVersion(join(sub, 'SPEC.md'));
  if (current === null) return { status: 'skip', reason: 'unreadable pinned SPEC.md version' };
  if (current === latest) {
    const drift = await gitlinkDrift(repo, latest);
    if (drift) return { status: 'drift', current, reason: drift };
    return { status: 'current', current };
  }

  // Pinned-ahead guard: `tagsInRange` is empty when the pin is newer than
  // `latest`, so the migration gate below would pass vacuously and `--apply`
  // would check out the OLDER tag — a silent downgrade. Almost always a stale
  // tag list in this checkout rather than a genuinely ahead adopter.
  const currentVersion = parseSemverTag(current);
  const latestVersion = parseSemverTag(latest);
  if (currentVersion && latestVersion && compareSemver(currentVersion, latestVersion) > 0) {
    return {
      status: 'skip',
      current,
      reason: `pinned ahead of latest release ${latest} — bumping would downgrade; run git fetch --tags in ${FLOWTRON_REPO} and re-run`,
    };
  }

  const range = await tagsInRange(current, latest);
  const bearing = await migrationBearingTags(range);
  if (bearing.length > 0) {
    return {
      status: 'skip',
      current,
      reason: `migration-bearing release(s) in range: ${bearing.join(', ')} — run /ft-update manually`,
    };
  }

  try {
    await git(repo, 'diff', '--cached', '--quiet');
  } catch (e) {
    // Exit 1 means real staged changes; any other code is a genuine git
    // failure (bad repo, corrupted index) that shouldn't be mislabeled.
    if (e.code !== 1) throw e;
    return { status: 'skip', current, reason: 'staged changes in index — commit or unstage first' };
  }

  const subStatus = await git(sub, 'status', '--porcelain');
  if (subStatus.trim().length > 0) {
    return { status: 'skip', current, reason: 'dirty .flowtron/core worktree' };
  }

  const skillsNote = formatSkillsNote(await newSkillWiringSurfaces(current, latest));
  return { status: 'bump', current, skillsNote };
}

// Belt-and-suspenders for applyBump: SPEC.md's Version line can't distinguish
// a tag from a wrong commit that happens to carry a matching version string.
// Cross-check the checked-out SHA against the canonical tag SHA in
// FLOWTRON_REPO — same source gitlinkDrift already trusts.
export function verifyPinnedSha(checkedOutSha, canonicalSha, latest) {
  if (checkedOutSha !== canonicalSha) {
    throw new Error(
      `checked-out submodule SHA ${checkedOutSha.slice(0, 12)} does not match canonical ${latest} SHA ${canonicalSha.slice(0, 12)}`,
    );
  }
}

// Undo applyBump's mutations: put the submodule worktree back on `priorSha` and,
// when the gitlink was already staged, drop it from the index (checkAdopter
// verified the index was otherwise clean, so a pathspec reset restores it exactly).
// Best-effort by construction — the caller is already unwinding a failure, so this
// reports what it could not undo rather than throwing over the original error.
// Returns null when the repo is fully restored, else a note naming the residue.
export async function rollbackBump(repo, sub, priorSha, staged) {
  const residue = [];
  try {
    await git(sub, 'checkout', '--quiet', priorSha);
  } catch (e) {
    residue.push(`submodule left at the new tag (${e.message})`);
  }
  if (staged) {
    try {
      await git(repo, 'reset', '--quiet', '--', SUBMODULE_PATH);
    } catch (e) {
      residue.push(`gitlink left staged (${e.message})`);
    }
  }
  return residue.length > 0 ? residue.join('; ') : null;
}

export async function applyBump(adopter, latest) {
  const { repo } = adopter;
  const sub = join(repo, SUBMODULE_PATH);
  // Fetch adds refs only — no worktree or index mutation, so it sits outside the
  // rollback window and the prior SHA is captured immediately before the checkout.
  await git(sub, 'fetch', '--tags', '--quiet', 'origin');
  const priorSha = (await git(sub, 'rev-parse', 'HEAD')).trim();
  let staged = false;
  try {
    await git(sub, 'checkout', '--quiet', latest);
    const confirmed = await pinnedVersion(join(sub, 'SPEC.md'));
    if (confirmed !== latest) {
      throw new Error(`post-checkout SPEC.md reads ${confirmed}, expected ${latest}`);
    }
    const checkedOutSha = (await git(sub, 'rev-parse', 'HEAD')).trim();
    const canonicalSha = (await git(FLOWTRON_REPO, 'rev-parse', `${latest}^{commit}`)).trim();
    verifyPinnedSha(checkedOutSha, canonicalSha, latest);
    await git(repo, 'add', SUBMODULE_PATH);
    staged = true;
    // Pathspec commit: only the submodule gitlink lands, never unrelated work.
    const current = adopter.current;
    await git(repo, 'commit', '--quiet', '-m', `chore: bump flowtron ${current} → ${latest}`, '--', SUBMODULE_PATH);
  } catch (e) {
    const residue = await rollbackBump(repo, sub, priorSha, staged);
    // Rethrow the original failure — reportResult renders it as the ✗ line — with
    // the un-undone residue appended when the repo could not be fully restored.
    if (residue) e.message = `${e.message} (rollback incomplete: ${residue})`;
    throw e;
  }
}

// Print one adopter's check result and fold it into the running counts. The
// apply branch performs the bump inline (awaiting applyBump); all other
// branches are pure presentation over the already-computed result.
async function reportResult(adopter, result, latest, apply, counts) {
  if (result.status === 'current') {
    counts.current += 1;
    console.log(`  ✓ ${adopter.name}: current (${result.current})`);
  } else if (result.status === 'drift') {
    counts.drifted += 1;
    console.log(`  ⚠ ${adopter.name} (${result.current}): gitlink drift — ${result.reason}`);
  } else if (result.status === 'skip') {
    counts.skipped += 1;
    const at = result.current ? ` (${result.current})` : '';
    console.log(`  ⏭ ${adopter.name}${at}: skipped — ${result.reason}`);
  } else if (apply) {
    try {
      await applyBump({ ...adopter, current: result.current }, latest);
      counts.bumped += 1;
      console.log(
        `  ⬆ ${adopter.name}: bumped ${result.current} → ${latest}, committed${result.skillsNote}`,
      );
    } catch (e) {
      counts.failed += 1;
      console.log(`  ✗ ${adopter.name}: bump failed — ${e.message}`);
    }
  } else {
    counts.planned += 1;
    console.log(`  ⬆ ${adopter.name}: would bump ${result.current} → ${latest}${result.skillsNote}`);
  }
}

// Print the closing summary line, plus the re-run hint on a dry-run with pending bumps.
function reportSummary(counts, apply) {
  const planned = apply ? `bumped ${counts.bumped}` : `would bump ${counts.planned}`;
  console.log(
    `\nSummary: ${counts.current} current · ${counts.drifted} drift · ${planned} · ${counts.skipped} skipped · ${counts.failed} failed`,
  );
  if (!apply && counts.planned > 0) {
    console.log('Re-run with --apply to perform the bumps. Commits are local only — review and push per repo.');
  }
}

async function main(argv = process.argv.slice(2)) {
  const args = parseArgs(argv);
  const root = workspaceRoot(args.root);
  // Test seam (TEST-003): the suite's CLI fixtures pin a fixed non-migration
  // tag pair so they don't track the moving head of the tag list. Every other
  // entry point takes `latest` as a parameter; this is the only place the
  // choice is made internally.
  const latest = process.env.FLOWTRON_UPDATE_LATEST ?? (await latestReleaseTag());
  if (!latest) {
    console.error(`No release tag found in ${FLOWTRON_REPO} — nothing to compare against.`);
    process.exit(1);
  }

  const mode = args.apply ? 'APPLY' : 'DRY-RUN';
  console.log(`flowtron update-adopters — ${mode}`);
  console.log(`  workspace: ${root}`);
  console.log(`  latest release: ${latest}\n`);

  const { adopters, legacy } = await discoverAdopters(root);
  if (adopters.length === 0) {
    console.log('No .flowtron/core adopters found.');
    return;
  }

  const counts = { current: 0, drifted: 0, bumped: 0, planned: 0, skipped: 0, failed: 0 };
  for (const adopter of adopters) {
    let result;
    try {
      result = await checkAdopter(adopter, latest);
    } catch (e) {
      counts.failed += 1;
      console.log(`  ✗ ${adopter.name}: check failed — ${e.message}`);
      continue;
    }
    await reportResult(adopter, result, latest, args.apply, counts);
  }

  if (legacy.length > 0) {
    console.log(
      `\n  legacy-layout repos skipped (migrate .flowtron/flowtron → .flowtron/core first): ${legacy.join(', ')}`,
    );
  }

  reportSummary(counts, args.apply);
}

// CLI entrypoint only when executed directly (importable for tests).
const isMain =
  process.argv[1] != null && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  main().catch((e) => {
    console.error(e.message);
    process.exit(1);
  });
}

export { FLOWTRON_REPO, SUBMODULE_PATH };
