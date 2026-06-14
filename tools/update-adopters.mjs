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
//   - release range carries a real Migration block (BREAKING or required
//     project-side edits) → manual /ft-update required
//   - staged changes in the adopter's index → a commit here would surprise
//   - dirty .flowtron/core submodule worktree
//
// Not covered (by design — run /ft-update in the repo for these): per-project
// symlink wiring for newly shipped skills, and audit-fork drift scans. When a
// bumped range ships a new *per-project-wired* skill (one named in the
// AGENTS-snippet ln -s block — not a global/by-reference skill like
// ft-audit-repo), the report flags the repo.

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

async function git(cwd, ...args) {
  const { stdout } = await execFileAsync('git', args, { cwd });
  return stdout;
}

function parseArgs(argv) {
  const args = { apply: false, root: null };
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--apply') args.apply = true;
    else if (argv[i] === '--root') {
      args.root = argv[i + 1];
      i += 1;
    } else {
      console.error(`Unknown arg: ${argv[i]}`);
      console.error('Usage: node tools/update-adopters.mjs [--apply] [--root <dir>]');
      process.exit(2);
    }
  }
  return args;
}

function expandHome(path) {
  if (path === '~') return homedir();
  if (path.startsWith('~/')) return join(homedir(), path.slice(2));
  return path;
}

function workspaceRoot(rootArg) {
  const raw = rootArg ?? process.env.FLOWTRON_VIZ_WORKSPACE;
  return expandHome(raw && raw.length > 0 ? raw : '~/code');
}

function parseSemverTag(tag) {
  const m = /^v(\d+)\.(\d+)\.(\d+)$/.exec(tag);
  if (!m) return null;
  return [Number(m[1]), Number(m[2]), Number(m[3])];
}

function compareSemver(a, b) {
  for (let i = 0; i < 3; i += 1) {
    if (a[i] !== b[i]) return a[i] - b[i];
  }
  return 0;
}

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
async function pinnedVersion(specPath) {
  try {
    const text = await readFile(specPath, 'utf8');
    const m = /^\*\*Version:\*\*\s*(v?\d+\.\d+\.\d+)/m.exec(text);
    if (!m) return null;
    return m[1].startsWith('v') ? m[1] : `v${m[1]}`;
  } catch {
    return null;
  }
}

async function latestReleaseTag() {
  const stdout = await git(FLOWTRON_REPO, 'tag', '--sort=-v:refname');
  return stdout.split('\n').map((l) => l.trim()).find((l) => parseSemverTag(l)) ?? null;
}

// Tags strictly after `fromTag` up to and including `toTag`, ascending.
async function tagsInRange(fromTag, toTag) {
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
// release convention's all-clear line ("No required project-side edits").
// "Migration (BREAKING — ...)" headings are always migration-bearing.
async function migrationBearingTags(tags) {
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
    if (!firstBody || !firstBody.startsWith('No required project-side edits')) {
      bearing.push(tag);
    }
  }
  return bearing;
}

// The per-project symlink-wiring set: basenames named in the freshly-bumped
// AGENTS-snippet §"One-time symlink wiring" ln -s block — the authority
// /ft-update Step 4 consults. Globally-installed / by-reference skills
// (ft-audit-repo, ft-flowtron, …) are deliberately absent here, so they never
// need a per-project link. Read at toTag to match what the adopter bumps to.
async function wiredSkillKeys(toTag) {
  let snippet;
  try {
    snippet = await git(FLOWTRON_REPO, 'show', `${toTag}:claude/AGENTS-snippet.md`);
  } catch {
    return null; // snippet unreadable at toTag — caller falls back to coarse check
  }
  const keys = new Set();
  for (const line of snippet.split('\n')) {
    if (!line.includes('ln -s')) continue;
    const m = line.match(/\.flowtron\/core\/(claude\/(?:skills|commands)\/\S+)/);
    if (m) keys.add(m[1]); // e.g. claude/skills/ft-task or claude/commands/ft-task.md
  }
  return keys;
}

// Reduce an added repo path to its wiring key: a skill dir collapses to
// claude/skills/<name>; a command file stays claude/commands/<name>.md.
function wiringKeyForAddedFile(path) {
  const skill = path.match(/^(claude\/skills\/[^/]+)/);
  if (skill) return skill[1];
  const command = path.match(/^(claude\/commands\/[^/]+\.md)$/);
  if (command) return command[1];
  return null;
}

async function newSkillsShipped(fromTag, toTag) {
  const stdout = await git(
    FLOWTRON_REPO,
    'diff',
    '--name-only',
    '--diff-filter=A',
    `${fromTag}..${toTag}`,
    '--',
    'claude/skills/',
    'claude/commands/',
  );
  const added = stdout.split('\n').filter((l) => l.trim().length > 0);
  if (added.length === 0) return false;

  const wired = await wiredSkillKeys(toTag);
  // Snippet unreadable → fall back to the coarse "any add" signal (better to
  // over-advise a no-op /ft-update than to silently miss a genuine new link).
  if (wired === null) return true;

  return added.some((path) => {
    const key = wiringKeyForAddedFile(path);
    return key !== null && wired.has(key);
  });
}

async function discoverAdopters(root) {
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

async function checkAdopter(adopter, latest) {
  const { repo } = adopter;
  const sub = join(repo, SUBMODULE_PATH);
  const current = await pinnedVersion(join(sub, 'SPEC.md'));
  if (current === null) return { status: 'skip', reason: 'unreadable pinned SPEC.md version' };
  if (current === latest) return { status: 'current', current };

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
  } catch {
    return { status: 'skip', current, reason: 'staged changes in index — commit or unstage first' };
  }

  const subStatus = await git(sub, 'status', '--porcelain');
  if (subStatus.trim().length > 0) {
    return { status: 'skip', current, reason: 'dirty .flowtron/core worktree' };
  }

  const skillsNote = (await newSkillsShipped(current, latest))
    ? ' (new skills shipped in range — wire symlinks via /ft-update)'
    : '';
  return { status: 'bump', current, skillsNote };
}

async function applyBump(adopter, latest) {
  const { repo } = adopter;
  const sub = join(repo, SUBMODULE_PATH);
  await git(sub, 'fetch', '--tags', '--quiet', 'origin');
  await git(sub, 'checkout', '--quiet', latest);
  const confirmed = await pinnedVersion(join(sub, 'SPEC.md'));
  if (confirmed !== latest) {
    throw new Error(`post-checkout SPEC.md reads ${confirmed}, expected ${latest}`);
  }
  await git(repo, 'add', SUBMODULE_PATH);
  // Pathspec commit: only the submodule gitlink lands, never unrelated work.
  const current = adopter.current;
  await git(repo, 'commit', '--quiet', '-m', `chore: bump flowtron ${current} → ${latest}`, '--', SUBMODULE_PATH);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const root = workspaceRoot(args.root);
  const latest = await latestReleaseTag();
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

  const counts = { current: 0, bumped: 0, planned: 0, skipped: 0, failed: 0 };
  for (const adopter of adopters) {
    let result;
    try {
      result = await checkAdopter(adopter, latest);
    } catch (e) {
      counts.failed += 1;
      console.log(`  ✗ ${adopter.name}: check failed — ${e.message}`);
      continue;
    }
    if (result.status === 'current') {
      counts.current += 1;
      console.log(`  ✓ ${adopter.name}: current (${result.current})`);
    } else if (result.status === 'skip') {
      counts.skipped += 1;
      const at = result.current ? ` (${result.current})` : '';
      console.log(`  ⏭ ${adopter.name}${at}: skipped — ${result.reason}`);
    } else if (args.apply) {
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

  if (legacy.length > 0) {
    console.log(
      `\n  legacy-layout repos skipped (migrate .flowtron/flowtron → .flowtron/core first): ${legacy.join(', ')}`,
    );
  }

  const planned = args.apply ? `bumped ${counts.bumped}` : `would bump ${counts.planned}`;
  console.log(
    `\nSummary: ${counts.current} current · ${planned} · ${counts.skipped} skipped · ${counts.failed} failed`,
  );
  if (!args.apply && counts.planned > 0) {
    console.log('Re-run with --apply to perform the bumps. Commits are local only — review and push per repo.');
  }
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
