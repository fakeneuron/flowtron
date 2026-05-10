import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createArchiveCache } from './archiveCache';
import type { ProjectDescriptor } from './workspace';

let root: string;

beforeEach(async () => {
  root = await mkdtemp(join(tmpdir(), 'flowtron-viz-archive-cache-'));
});

afterEach(async () => {
  await rm(root, { recursive: true, force: true });
});

async function makeProject(
  name: string,
  files: Record<string, string> = {},
): Promise<ProjectDescriptor> {
  const projectRoot = join(root, name);
  const projectDir = join(projectRoot, '_project');
  const tasknoteDir = join(projectDir, 'tasknote');
  const archiveDir = join(tasknoteDir, 'archive');
  await mkdir(archiveDir, { recursive: true });
  for (const [relPath, content] of Object.entries(files)) {
    const fullPath = join(archiveDir, relPath);
    await mkdir(join(fullPath, '..'), { recursive: true });
    await writeFile(fullPath, content);
  }
  return {
    name,
    root: projectRoot,
    planPath: join(projectDir, 'PLAN.md'),
    tasknoteDir,
    archiveDir,
  };
}

function tasknote(id: string, title: string): string {
  return `---
title: ${title}
status: completed
created: 2026-05-10
---

# ${id} | ${title}
`;
}

describe('createArchiveCache', () => {
  it('cold-populates and returns parsed tasknotes', async () => {
    const project = await makeProject('alpha', {
      'frontend/FE-001.md': tasknote('FE-001', 'one'),
      'core/CORE-001.md': tasknote('CORE-001', 'two'),
    });
    const cache = createArchiveCache();

    const result = await cache.get(project);

    expect(result).toHaveLength(2);
    expect(result.map((t) => t.id).sort()).toEqual(['CORE-001', 'FE-001']);
  });

  it('returns empty array for project with no archive dir', async () => {
    const project: ProjectDescriptor = {
      name: 'empty',
      root: join(root, 'empty'),
      planPath: join(root, 'empty', '_project', 'PLAN.md'),
      tasknoteDir: join(root, 'empty', '_project', 'tasknote'),
      archiveDir: join(root, 'empty', '_project', 'tasknote', 'archive'),
    };
    const cache = createArchiveCache();

    await expect(cache.get(project)).resolves.toEqual([]);
  });

  it('serves second call from cache without re-reading files', async () => {
    const project = await makeProject('alpha', {
      'frontend/FE-001.md': tasknote('FE-001', 'original'),
    });
    const cache = createArchiveCache();

    const first = await cache.get(project);
    await writeFile(
      join(project.archiveDir, 'frontend', 'FE-001.md'),
      tasknote('FE-001', 'mutated'),
    );
    const second = await cache.get(project);

    expect(second).toBe(first);
    expect(second[0].frontmatter?.title).toBe('original');
  });

  it('returns the same in-flight promise to concurrent first-time callers', async () => {
    const project = await makeProject('alpha', {
      'frontend/FE-001.md': tasknote('FE-001', 'one'),
    });
    const cache = createArchiveCache();

    const p1 = cache.get(project);
    const p2 = cache.get(project);

    expect(p1).toBe(p2);
    const [r1, r2] = await Promise.all([p1, p2]);
    expect(r1).toBe(r2);
  });

  it('invalidate() drops the matching project cache and the next get() re-reads', async () => {
    const project = await makeProject('alpha', {
      'frontend/FE-001.md': tasknote('FE-001', 'original'),
    });
    const cache = createArchiveCache();

    await cache.get(project);
    await writeFile(
      join(project.archiveDir, 'frontend', 'FE-001.md'),
      tasknote('FE-001', 'mutated'),
    );
    const hit = cache.invalidate(join(project.archiveDir, 'frontend', 'FE-001.md'), [project]);
    const after = await cache.get(project);

    expect(hit).toBe(true);
    expect(after[0].frontmatter?.title).toBe('mutated');
  });

  it('invalidate() returns false for filepaths outside any archive dir', async () => {
    const project = await makeProject('alpha', {
      'frontend/FE-001.md': tasknote('FE-001', 'one'),
    });
    const cache = createArchiveCache();

    const first = await cache.get(project);
    const hit = cache.invalidate(join(project.tasknoteDir, 'FE-002.md'), [project]);
    const second = await cache.get(project);

    expect(hit).toBe(false);
    expect(second).toBe(first);
  });

  it('invalidate() is per-project: dropping A does not flush B', async () => {
    const a = await makeProject('alpha', { 'frontend/FE-001.md': tasknote('FE-001', 'a') });
    const b = await makeProject('beta', { 'frontend/FE-001.md': tasknote('FE-001', 'b') });
    const cache = createArchiveCache();

    const aFirst = await cache.get(a);
    const bFirst = await cache.get(b);
    cache.invalidate(join(a.archiveDir, 'frontend', 'FE-001.md'), [a, b]);
    const aAfter = await cache.get(a);
    const bAfter = await cache.get(b);

    expect(aAfter).not.toBe(aFirst);
    expect(bAfter).toBe(bFirst);
  });

  it('does not poison the cache when a populate fails (next call retries)', async () => {
    const project = await makeProject('alpha', {
      'frontend/FE-001.md': '---\n: : malformed yaml :\n---\nbody\n',
    });
    const cache = createArchiveCache();

    await expect(cache.get(project)).rejects.toThrow();

    await writeFile(
      join(project.archiveDir, 'frontend', 'FE-001.md'),
      tasknote('FE-001', 'recovered'),
    );
    const result = await cache.get(project);

    expect(result).toHaveLength(1);
    expect(result[0].frontmatter?.title).toBe('recovered');
  });

  it('clear() drops every cached project', async () => {
    const a = await makeProject('alpha', { 'frontend/FE-001.md': tasknote('FE-001', 'a') });
    const b = await makeProject('beta', { 'frontend/FE-001.md': tasknote('FE-001', 'b') });
    const cache = createArchiveCache();

    const aFirst = await cache.get(a);
    const bFirst = await cache.get(b);
    cache.clear();
    const aAfter = await cache.get(a);
    const bAfter = await cache.get(b);

    expect(aAfter).not.toBe(aFirst);
    expect(bAfter).not.toBe(bFirst);
  });
});
