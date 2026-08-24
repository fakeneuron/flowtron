import { describe, expect, it } from 'vitest';
import { join } from 'node:path';
import { projectForActiveTasknote, projectForPath, watchSets } from './watchSet';
import type { ProjectDescriptor } from './workspace';

function project(name: string, root: string): ProjectDescriptor {
  const flowtron = join(root, name, '.flowtron');
  const tasknoteDir = join(flowtron, 'tasknote');
  return {
    name,
    root: join(root, name),
    planPath: join(flowtron, 'PLAN.md'),
    planArchivePath: join(flowtron, 'PLAN-ARCHIVE.md'),
    tasknoteDir,
    archiveDir: join(tasknoteDir, 'archive'),
    flowtronVersion: null,
  };
}

describe('watchSets', () => {
  it('partitions PLAN + tasknote dir onto hot and archive roots onto archive', () => {
    const alpha = project('alpha', '/ws');
    const beta = project('beta', '/ws');

    expect(watchSets([alpha, beta])).toEqual({
      hot: [alpha.planPath, alpha.tasknoteDir, beta.planPath, beta.tasknoteDir],
      archive: [alpha.archiveDir, beta.archiveDir],
    });
  });

  it('returns empty sets for no projects', () => {
    expect(watchSets([])).toEqual({ hot: [], archive: [] });
  });

  // chokidar 4 removed glob support, so v5 reads every watch path literally.
  // The FE-088.4 escaping this replaced would now corrupt such a path.
  it('leaves glob metacharacters in project paths untouched (chokidar 5)', () => {
    const bracketed = project('foo[wip]', '/ws');
    const sets = watchSets([bracketed]);

    expect(sets.hot).toEqual([bracketed.planPath, bracketed.tasknoteDir]);
    expect(sets.archive).toEqual([bracketed.archiveDir]);
    expect(sets.hot[1]).toContain('foo[wip]');
    expect(sets.hot[1]).not.toContain('\\[');
  });
});

describe('projectForActiveTasknote', () => {
  const alpha = project('alpha', '/ws');
  const beta = project('beta', '/ws');
  const projects = [alpha, beta];

  it('matches a file directly in tasknoteDir', () => {
    expect(projectForActiveTasknote(join(alpha.tasknoteDir, 'CORE-001.md'), projects)).toBe(alpha);
  });

  it('does not match archive files (one extra dirname level)', () => {
    const archived = join(alpha.archiveDir, 'core', 'CORE-001.md');
    expect(projectForActiveTasknote(archived, projects)).toBeUndefined();
  });

  it('does not match PLAN.md', () => {
    expect(projectForActiveTasknote(alpha.planPath, projects)).toBeUndefined();
  });

  it('is per-project', () => {
    expect(projectForActiveTasknote(join(beta.tasknoteDir, 'FE-001.md'), projects)).toBe(beta);
  });
});

describe('projectForPath', () => {
  const alpha = project('alpha', '/ws');
  const beta = project('beta', '/ws');
  const projects = [alpha, beta];

  it('matches PLAN.md, active tasknotes, and archive files', () => {
    expect(projectForPath(alpha.planPath, projects)).toBe(alpha);
    expect(projectForPath(join(alpha.tasknoteDir, 'CORE-001.md'), projects)).toBe(alpha);
    expect(projectForPath(join(alpha.archiveDir, 'core', 'CORE-001.md'), projects)).toBe(alpha);
  });

  it('is per-project', () => {
    expect(projectForPath(beta.planPath, projects)).toBe(beta);
    expect(projectForPath(join(beta.archiveDir, 'fe', 'FE-001.md'), projects)).toBe(beta);
  });

  it('returns undefined for an unknown path', () => {
    expect(projectForPath('/ws/other/.flowtron/PLAN.md', projects)).toBeUndefined();
  });
});
