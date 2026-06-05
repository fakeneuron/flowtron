import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { mkdtemp, writeFile, mkdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { safeReaddir } from './fsSafe';

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
