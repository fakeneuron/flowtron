import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { mkdtemp, writeFile, mkdir, rm, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { realpathWithin, safeReaddir, safeRealpath } from './fsSafe';

describe('safeReaddir', () => {
  let dir: string;

  beforeAll(async () => {
    dir = await mkdtemp(join(tmpdir(), 'fssafe-'));
    await writeFile(join(dir, 'a.md'), '');
    await mkdir(join(dir, 'sub'));
  });

  afterAll(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it('returns Dirent entries for a readable directory', async () => {
    const entries = await safeReaddir(dir);
    const names = entries.map((e) => e.name).sort();
    expect(names).toEqual(['a.md', 'sub']);
    const file = entries.find((e) => e.name === 'a.md');
    expect(file?.isFile()).toBe(true);
    const subdir = entries.find((e) => e.name === 'sub');
    expect(subdir?.isDirectory()).toBe(true);
  });

  it('returns an empty array for a nonexistent directory instead of throwing', async () => {
    const entries = await safeReaddir(join(dir, 'does-not-exist'));
    expect(entries).toEqual([]);
  });
});

describe('safeRealpath', () => {
  let dir: string;
  let outside: string;

  beforeAll(async () => {
    dir = await mkdtemp(join(tmpdir(), 'fssafe-realpath-'));
    outside = await mkdtemp(join(tmpdir(), 'fssafe-outside-'));
    await writeFile(join(outside, 'target.md'), 'outside');
    await mkdir(join(dir, 'inside'));
    await writeFile(join(dir, 'inside', 'note.md'), 'inside');
    await symlink(join(outside, 'target.md'), join(dir, 'inside', 'escape.md'));
    await symlink(join(dir, 'does-not-exist'), join(dir, 'broken.md'));
  });

  afterAll(async () => {
    await rm(dir, { recursive: true, force: true });
    await rm(outside, { recursive: true, force: true });
  });

  it('resolves a real path through symlinks', async () => {
    const realDir = (await safeRealpath(dir)) as string;
    const realOutside = (await safeRealpath(outside)) as string;
    expect(await safeRealpath(join(dir, 'inside', 'note.md'))).toBe(
      join(realDir, 'inside', 'note.md'),
    );
    expect(await safeRealpath(join(dir, 'inside', 'escape.md'))).toBe(
      join(realOutside, 'target.md'),
    );
  });

  it('returns null for a missing path or a broken symlink', async () => {
    expect(await safeRealpath(join(dir, 'nope.md'))).toBeNull();
    expect(await safeRealpath(join(dir, 'broken.md'))).toBeNull();
  });

  describe('realpathWithin', () => {
    it('returns the resolved path when it stays inside the base', async () => {
      const base = (await safeRealpath(dir)) as string;
      const resolved = await realpathWithin(base, join(dir, 'inside', 'note.md'));
      expect(resolved).toBe(join(base, 'inside', 'note.md'));
    });

    it('returns null when a symlink escapes the base', async () => {
      const base = (await safeRealpath(dir)) as string;
      expect(await realpathWithin(base, join(dir, 'inside', 'escape.md'))).toBeNull();
    });

    it('accepts the base itself but not a sibling with a shared prefix', async () => {
      const base = (await safeRealpath(dir)) as string;
      expect(await realpathWithin(base, dir)).toBe(base);
      // `${base}-sibling` starts with `base` as a string but is not inside it.
      const sibling = `${base}-sibling`;
      await mkdir(sibling, { recursive: true });
      try {
        expect(await realpathWithin(base, sibling)).toBeNull();
      } finally {
        await rm(sibling, { recursive: true, force: true });
      }
    });

    it('returns null for a path that does not resolve', async () => {
      const base = (await safeRealpath(dir)) as string;
      expect(await realpathWithin(base, join(dir, 'nope.md'))).toBeNull();
    });
  });
});
