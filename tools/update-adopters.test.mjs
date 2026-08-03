// Automated tests for tools/update-adopters.mjs (CORE-360).
// Zero-dep: node:test + temp git fixtures under --root. Never touches ~/code.

import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { after, before, describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

import {
  FLOWTRON_REPO,
  SUBMODULE_PATH,
  applyBump,
  checkAdopter,
  compareSemver,
  describePin,
  discoverAdopters,
  formatSkillsNote,
  git,
  gitlinkDrift,
  latestReleaseTag,
  migrationBearingTags,
  parseArgs,
  parseSemverTag,
  pinnedVersion,
  tagsInRange,
  verifyPinnedSha,
} from './update-adopters.mjs';

const execFileAsync = promisify(execFile);
const SCRIPT = fileURLToPath(new URL('./update-adopters.mjs', import.meta.url));
const WORKSPACE_TS = fileURLToPath(new URL('../viz/src/workspace.ts', import.meta.url));

async function runCli(args, { expectFail = false, env = {} } = {}) {
  try {
    const { stdout, stderr } = await execFileAsync(process.execPath, [SCRIPT, ...args], {
      cwd: FLOWTRON_REPO,
      env: { ...process.env, ...env },
    });
    return { code: 0, stdout, stderr };
  } catch (e) {
    if (!expectFail) throw e;
    return { code: e.code ?? 1, stdout: e.stdout ?? '', stderr: e.stderr ?? '' };
  }
}

async function gitQuiet(cwd, ...args) {
  await execFileAsync('git', args, { cwd });
}

/** Shared local clone mirror — object-copy source for portable fixture cores. */
let mirrorDir;
/**
 * Fixture release pair (TEST-003). Deliberately NOT the newest tag: fixtures
 * that need a bumpable range must sit on a range the migration gate lets
 * through, and `checkAdopter` runs that gate before the staged-changes,
 * dirty-worktree, and bump paths. Tracking the moving head of the tag list
 * meant the first release shipping a real Migration block (v5.15.0) silently
 * converted four reachability fixtures into migration-gate skips.
 *
 * So: scan tags newest-first for the newest ADJACENT pair whose range carries
 * no required project-side edits. Adjacent means `tagsInRange(previous,
 * latest)` is exactly `[latest]`, so classifying that one tag settles the
 * range. Computed rather than hardcoded so the pair self-heals as releases
 * accumulate.
 */
let latest;
let previous;

before(async () => {
  const tags = (await git(FLOWTRON_REPO, 'tag', '--sort=-v:refname'))
    .split('\n')
    .map((l) => l.trim())
    .filter((t) => parseSemverTag(t));
  assert.ok(tags.length >= 2, 'need two release tags for behind/drift fixtures');

  for (let i = 0; i + 1 < tags.length; i += 1) {
    if ((await migrationBearingTags([tags[i]])).length === 0) {
      latest = tags[i];
      previous = tags[i + 1];
      break;
    }
  }
  assert.ok(latest, 'need an adjacent non-migration-bearing tag pair for bump fixtures');

  mirrorDir = await mkdtemp(join(tmpdir(), 'ft-upd-mirror-'));
  await execFileAsync('git', [
    'clone',
    '-q',
    '--local',
    '--no-hardlinks',
    FLOWTRON_REPO,
    join(mirrorDir, 'core'),
  ]);
});

after(async () => {
  if (mirrorDir) await rm(mirrorDir, { recursive: true, force: true });
});

/**
 * Build a minimal adopter superproject under `root/name` with `.flowtron/core`
 * cloned from the shared mirror and checked out at `pinTag`.
 */
async function makeAdopter(root, name, pinTag) {
  const repo = join(root, name);
  await mkdir(repo, { recursive: true });
  await gitQuiet(repo, 'init', '-q');
  await gitQuiet(repo, 'config', 'user.email', 'core-360@test.local');
  await gitQuiet(repo, 'config', 'user.name', 'CORE-360');
  await gitQuiet(repo, 'config', 'advice.addEmbeddedRepo', 'false');

  const sub = join(repo, SUBMODULE_PATH);
  await execFileAsync('git', [
    'clone',
    '-q',
    '--local',
    '--no-hardlinks',
    join(mirrorDir, 'core'),
    sub,
  ]);
  await gitQuiet(sub, 'checkout', '-q', pinTag);
  await gitQuiet(repo, 'add', SUBMODULE_PATH);
  await gitQuiet(repo, 'commit', '-q', '-m', `pin ${pinTag}`);
  return { name, repo, sub };
}

describe('parseArgs / pure helpers', () => {
  it('parses --apply and --root', () => {
    assert.deepEqual(parseArgs([]), { apply: false, root: null });
    assert.deepEqual(parseArgs(['--apply']), { apply: true, root: null });
    assert.deepEqual(parseArgs(['--root', '/tmp/ws']), { apply: false, root: '/tmp/ws' });
    assert.deepEqual(parseArgs(['--apply', '--root', '/tmp/ws']), {
      apply: true,
      root: '/tmp/ws',
    });
  });

  it('throws on unknown arg when exitOnError is false', () => {
    assert.throws(() => parseArgs(['--nope'], { exitOnError: false }), /Unknown arg/);
  });

  it('parseSemverTag / compareSemver', () => {
    assert.deepEqual(parseSemverTag('v5.12.0'), [5, 12, 0]);
    assert.equal(parseSemverTag('nope'), null);
    assert.ok(compareSemver([5, 12, 0], [5, 11, 0]) > 0);
    assert.equal(compareSemver([1, 0, 0], [1, 0, 0]), 0);
  });

  it('formatSkillsNote', () => {
    assert.equal(formatSkillsNote([]), '');
    assert.match(formatSkillsNote(['Claude .claude/']), /Claude \.claude\//);
    assert.match(
      formatSkillsNote(['Claude .claude/', 'Codex .agents/skills']),
      /Claude \.claude\/ and Codex \.agents\/skills/,
    );
  });

  it('pinnedVersion reads Version line', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'ft-upd-spec-'));
    const path = join(dir, 'SPEC.md');
    await writeFile(path, '# X\n\n**Version:** 5.12.0\n');
    assert.equal(await pinnedVersion(path), 'v5.12.0');
    await writeFile(path, '**Version:** v1.2.3\n');
    assert.equal(await pinnedVersion(path), 'v1.2.3');
    assert.equal(await pinnedVersion(join(dir, 'missing.md')), null);
    await rm(dir, { recursive: true, force: true });
  });

  it('verifyPinnedSha passes through on match, throws on mismatch (CORE-366)', () => {
    assert.doesNotThrow(() => verifyPinnedSha('abc123', 'abc123', 'v5.12.0'));
    assert.throws(
      () => verifyPinnedSha('abc123def456', 'deadbeef0000', 'v5.12.0'),
      /checked-out submodule SHA abc123def456 does not match canonical v5\.12\.0 SHA deadbeef0000/,
    );
  });
});

describe('Version regex parity (CORE-366)', () => {
  it('pins the same **Version:** regex source in update-adopters.mjs and viz/src/workspace.ts', async () => {
    const REGEX_SOURCE = String.raw`/^\*\*Version:\*\*\s*(v?\d+\.\d+\.\d+)/m`;
    const toolSource = await readFile(SCRIPT, 'utf8');
    const vizSource = await readFile(WORKSPACE_TS, 'utf8');
    assert.ok(
      toolSource.includes(REGEX_SOURCE),
      'tools/update-adopters.mjs no longer contains the pinned Version regex',
    );
    assert.ok(
      vizSource.includes(REGEX_SOURCE),
      'viz/src/workspace.ts no longer contains the pinned Version regex',
    );
  });
});

describe('migrationBearingTags (real tags)', () => {
  it('classifies v5.0.0 as migration-bearing (BREAKING)', async () => {
    const bearing = await migrationBearingTags(['v5.0.0']);
    assert.deepEqual(bearing, ['v5.0.0']);
  });

  it('classifies all-clear Migration blocks as non-bearing', async () => {
    const bearing = await migrationBearingTags(['v5.10.1', 'v5.11.0']);
    assert.deepEqual(bearing, []);
  });
});

describe('latestReleaseTag (real tags)', () => {
  // The fixture pair above deliberately skips migration-bearing releases, so
  // it no longer exercises this export incidentally (TEST-003).
  it('returns the newest semver tag in the checkout', async () => {
    const newest = await latestReleaseTag();
    const tags = (await git(FLOWTRON_REPO, 'tag', '--sort=-v:refname'))
      .split('\n')
      .map((l) => l.trim())
      .filter((t) => parseSemverTag(t));
    assert.equal(newest, tags[0]);
  });
});

describe('checkAdopter classification (fixtures)', () => {
  let root;

  before(async () => {
    root = await mkdtemp(join(tmpdir(), 'ft-upd-ws-'));
  });

  after(async () => {
    await rm(root, { recursive: true, force: true });
  });

  it('current: committed gitlink == latest', async () => {
    const adopter = await makeAdopter(root, 'current-repo', latest);
    const result = await checkAdopter(adopter, latest);
    assert.equal(result.status, 'current');
    assert.equal(result.current, latest);
  });

  it('drift: worktree SPEC at latest, committed pin older', async () => {
    const adopter = await makeAdopter(root, 'drift-repo', previous);
    // Advance worktree without committing the superproject pin.
    await gitQuiet(adopter.sub, 'checkout', '-q', latest);
    const result = await checkAdopter(adopter, latest);
    assert.equal(result.status, 'drift');
    assert.equal(result.current, latest);
    assert.match(result.reason, /gitlink|commit the pin|\/ft-update/i);
    // describePin should name the previous tag when possible
    assert.match(result.reason, new RegExp(previous.replace(/\./g, '\\.')));
  });

  it('skip: staged changes in adopter index', async () => {
    const adopter = await makeAdopter(root, 'staged-repo', previous);
    await writeFile(join(adopter.repo, 'extra.txt'), 'staged\n');
    await gitQuiet(adopter.repo, 'add', 'extra.txt');
    const result = await checkAdopter(adopter, latest);
    assert.equal(result.status, 'skip');
    assert.match(result.reason, /staged changes/i);
  });

  it('skip: dirty .flowtron/core worktree', async () => {
    const adopter = await makeAdopter(root, 'dirty-repo', previous);
    await writeFile(join(adopter.sub, 'DIRTY.md'), 'dirt\n');
    const result = await checkAdopter(adopter, latest);
    assert.equal(result.status, 'skip');
    assert.match(result.reason, /dirty .*worktree/i);
  });

  it('skip: migration-bearing range (pre-v5 pin)', async () => {
    // v4.0.0..latest includes v5.0.0 BREAKING → must not auto-bump.
    const adopter = await makeAdopter(root, 'migrate-repo', 'v4.0.0');
    const result = await checkAdopter(adopter, latest);
    assert.equal(result.status, 'skip');
    assert.match(result.reason, /migration-bearing/i);
    assert.match(result.reason, /v5\.0\.0/);
  });

  it('bump: non-migration range from previous → latest', async () => {
    const adopter = await makeAdopter(root, 'bump-repo', previous);
    const result = await checkAdopter(adopter, latest);
    assert.equal(result.status, 'bump');
    assert.equal(result.current, previous);
    assert.equal(typeof result.skillsNote, 'string');
  });

  it('skip: unreadable SPEC version', async () => {
    const adopter = await makeAdopter(root, 'bad-spec-repo', latest);
    await writeFile(join(adopter.sub, 'SPEC.md'), '# no version line\n');
    const result = await checkAdopter(adopter, latest);
    assert.equal(result.status, 'skip');
    assert.match(result.reason, /unreadable/i);
  });

  it('rethrows (does not mask as staged changes) when the staged-diff check fails for a non-1 reason (CORE-366)', async () => {
    const adopter = await makeAdopter(root, 'corrupt-repo', previous);
    // Corrupt the adopter's own .git (not the submodule's) so `git diff
    // --cached --quiet` fails outside the exit-1 "there are staged changes"
    // case (git falls back to --no-index usage-error mode, exit 129).
    await rm(join(adopter.repo, '.git'), { recursive: true, force: true });
    await assert.rejects(() => checkAdopter(adopter, latest), (e) => {
      assert.notEqual(e.code, 1);
      return true;
    });
  });
});

describe('discoverAdopters', () => {
  it('finds .flowtron/core adopters and legacy layout', async () => {
    const root = await mkdtemp(join(tmpdir(), 'ft-upd-disc-'));
    const adopter = await makeAdopter(root, 'alpha', latest);
    const legacy = join(root, 'legacy-proj');
    await mkdir(join(legacy, '.flowtron', 'flowtron'), { recursive: true });
    const { adopters, legacy: legacyNames } = await discoverAdopters(root);
    assert.ok(adopters.some((a) => a.name === 'alpha' && a.repo === adopter.repo));
    assert.deepEqual(legacyNames, ['legacy-proj']);
    await rm(root, { recursive: true, force: true });
  });
});

describe('gitlinkDrift / describePin', () => {
  it('returns null when pin matches latest', async () => {
    const root = await mkdtemp(join(tmpdir(), 'ft-upd-gl-'));
    const adopter = await makeAdopter(root, 'ok', latest);
    assert.equal(await gitlinkDrift(adopter.repo, latest), null);
    await rm(root, { recursive: true, force: true });
  });

  it('describePin resolves a tagged SHA', async () => {
    const sha = (await git(FLOWTRON_REPO, 'rev-parse', `${latest}^{commit}`)).trim();
    assert.equal(await describePin(sha), latest);
  });
});

describe('dry-run CLI (--root fixture)', () => {
  it('reports current / drift / would-bump / skipped in one workspace', async () => {
    const root = await mkdtemp(join(tmpdir(), 'ft-upd-cli-'));
    await makeAdopter(root, 'cli-current', latest);

    const drifted = await makeAdopter(root, 'cli-drift', previous);
    await gitQuiet(drifted.sub, 'checkout', '-q', latest);

    await makeAdopter(root, 'cli-behind', previous);

    const staged = await makeAdopter(root, 'cli-staged', previous);
    await writeFile(join(staged.repo, 'x.txt'), 'x\n');
    await gitQuiet(staged.repo, 'add', 'x.txt');

    const { stdout } = await runCli(['--root', root], {
      env: { FLOWTRON_UPDATE_LATEST: latest },
    });
    assert.match(stdout, /DRY-RUN/);
    assert.match(stdout, /✓ cli-current: current/);
    assert.match(stdout, /⚠ cli-drift .*gitlink drift/);
    assert.match(stdout, /⬆ cli-behind: would bump/);
    assert.match(stdout, /⏭ cli-staged .*skipped — staged changes/);
    assert.match(stdout, /Summary:.*1 current · 1 drift · would bump 1 · 1 skipped/);
    await rm(root, { recursive: true, force: true });
  });

  it('empty workspace prints no-adopters message', async () => {
    const root = await mkdtemp(join(tmpdir(), 'ft-upd-empty-'));
    const { stdout } = await runCli(['--root', root]);
    assert.match(stdout, /No \.flowtron\/core adopters found/);
    await rm(root, { recursive: true, force: true });
  });
});

describe('sandboxed --apply', () => {
  it('bumps pin + pathspec commit only', async () => {
    const root = await mkdtemp(join(tmpdir(), 'ft-upd-apply-'));
    const adopter = await makeAdopter(root, 'apply-me', previous);

    // Unrelated unstaged file must not land in the bump commit.
    await writeFile(join(adopter.repo, 'unrelated.txt'), 'keep out\n');

    const result = await checkAdopter(adopter, latest);
    assert.equal(result.status, 'bump');
    await applyBump({ ...adopter, current: result.current }, latest);

    const pin = (await git(adopter.repo, 'rev-parse', `HEAD:${SUBMODULE_PATH}`)).trim();
    const latestSha = (await git(FLOWTRON_REPO, 'rev-parse', `${latest}^{commit}`)).trim();
    assert.equal(pin, latestSha);
    assert.equal(await pinnedVersion(join(adopter.sub, 'SPEC.md')), latest);

    const msg = (await git(adopter.repo, 'log', '-1', '--format=%s')).trim();
    assert.match(msg, new RegExp(`bump flowtron ${previous.replace(/\./g, '\\.')} → ${latest.replace(/\./g, '\\.')}`));

    // Pathspec: commit touches only the gitlink.
    const files = (await git(adopter.repo, 'show', '--name-only', '--pretty=format:', 'HEAD'))
      .trim()
      .split('\n')
      .filter(Boolean);
    assert.deepEqual(files, [SUBMODULE_PATH]);

    // CLI apply path also works end-to-end on a second behind adopter.
    await makeAdopter(root, 'apply-cli', previous);
    const { stdout } = await runCli(['--apply', '--root', root], {
      env: { FLOWTRON_UPDATE_LATEST: latest },
    });
    assert.match(stdout, /APPLY/);
    // apply-me is already current after applyBump; apply-cli should bump.
    assert.match(stdout, /⬆ apply-cli: bumped/);
    assert.match(stdout, /✓ apply-me: current/);

    await rm(root, { recursive: true, force: true });
  });
});

describe('tagsInRange', () => {
  it('returns tags strictly after from up to to', async () => {
    const range = await tagsInRange(previous, latest);
    assert.ok(range.includes(latest));
    assert.ok(!range.includes(previous));
  });
});
