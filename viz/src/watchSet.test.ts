import { describe, expect, it } from 'vitest';
import { join } from 'node:path';
import {
  escapeGlobLiteral,
  projectForActiveTasknote,
  projectForPath,
  watchGlob,
  watchSets,
} from './watchSet';
import type { ProjectDescriptor } from './workspace';

function project(name: string, root: string): ProjectDescriptor {
  const flowtron = join(root, name, '.flowtron');
  const tasknoteDir = join(flowtron, 'tasknote');
  return {
    name,
    root: join(root, name),
    planPath: join(flowtron, 'PLAN.md'),
    tasknoteDir,
    archiveDir: join(tasknoteDir, 'archive'),
    flowtronVersion: null,
  };
}

describe('watchSets', () => {
  it('partitions PLAN + active globs onto hot and archive globs onto archive', () => {
    const alpha = project('alpha', '/ws');
    const beta = project('beta', '/ws');

    expect(watchSets([alpha, beta])).toEqual({
      hot: [
        alpha.planPath,
        join(alpha.tasknoteDir, '*.md'),
        beta.planPath,
        join(beta.tasknoteDir, '*.md'),
      ],
      archive: [
        join(alpha.archiveDir, '*/*.md'),
        join(beta.archiveDir, '*/*.md'),
      ],
    });
  });

  it('returns empty sets for no projects', () => {
    expect(watchSets([])).toEqual({ hot: [], archive: [] });
  });

  it('escapes glob metacharacters in project paths for chokidar', () => {
    const bracketed = project('foo[wip]', '/ws');
    const sets = watchSets([bracketed]);

    expect(sets.hot[0]).toBe(escapeGlobLiteral(bracketed.planPath));
    expect(sets.hot[1]).toBe(watchGlob(bracketed.tasknoteDir, '*.md'));
    expect(sets.archive[0]).toBe(watchGlob(bracketed.archiveDir, '*/*.md'));
    expect(sets.hot[1]).toContain('\\[wip\\]');
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
