import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { discoverProjects, workspaceRoot } from './workspace';

let root: string;

beforeEach(async () => {
  root = await mkdtemp(join(tmpdir(), 'flowtron-viz-workspace-'));
});

afterEach(async () => {
  await rm(root, { recursive: true, force: true });
});

async function makeAdopter(
  name: string,
  opts: { withTasknoteDir?: boolean } = {},
): Promise<void> {
  const projectDir = join(root, name, '_project');
  await mkdir(projectDir, { recursive: true });
  await writeFile(join(projectDir, 'PLAN.md'), `## High\n\n- [ ] **${name.toUpperCase()}-001** — seed\n`);
  if (opts.withTasknoteDir ?? true) {
    await mkdir(join(projectDir, 'tasknote'), { recursive: true });
  }
}

async function makeNonAdopterDir(name: string): Promise<void> {
  await mkdir(join(root, name), { recursive: true });
}

describe('discoverProjects', () => {
  it('finds dirs with _project/PLAN.md and skips others', async () => {
    await makeAdopter('alpha');
    await makeAdopter('beta');
    await makeNonAdopterDir('gamma');
    await makeNonAdopterDir('node_modules');

    const projects = await discoverProjects(root);

    expect(projects.map((p) => p.name)).toEqual(['alpha', 'beta']);
  });

  it('returns sorted, fully-resolved descriptors', async () => {
    await makeAdopter('zulu');
    await makeAdopter('alpha');
    await makeAdopter('mike');

    const projects = await discoverProjects(root);

    expect(projects.map((p) => p.name)).toEqual(['alpha', 'mike', 'zulu']);
    expect(projects[0]).toEqual({
      name: 'alpha',
      root: join(root, 'alpha'),
      planPath: join(root, 'alpha', '_project', 'PLAN.md'),
      tasknoteDir: join(root, 'alpha', '_project', 'tasknote'),
      archiveDir: join(root, 'alpha', '_project', 'tasknote', 'archive'),
    });
  });

  it('still returns a project that has PLAN.md but no tasknote dir', async () => {
    await makeAdopter('lonely', { withTasknoteDir: false });

    const projects = await discoverProjects(root);

    expect(projects).toHaveLength(1);
    expect(projects[0].name).toBe('lonely');
    expect(projects[0].tasknoteDir).toBe(join(root, 'lonely', '_project', 'tasknote'));
  });

  it('skips dotfiles and dot-dirs', async () => {
    await makeAdopter('visible');
    await mkdir(join(root, '.hidden', '_project'), { recursive: true });
    await writeFile(join(root, '.hidden', '_project', 'PLAN.md'), '## High\n');

    const projects = await discoverProjects(root);

    expect(projects.map((p) => p.name)).toEqual(['visible']);
  });

  it('returns empty array if workspace root does not exist', async () => {
    const projects = await discoverProjects(join(root, 'does-not-exist'));
    expect(projects).toEqual([]);
  });
});

describe('workspaceRoot', () => {
  it('uses FLOWTRON_VIZ_WORKSPACE when set', () => {
    expect(workspaceRoot({ FLOWTRON_VIZ_WORKSPACE: '/custom/path' })).toBe('/custom/path');
  });

  it('expands a leading ~ in the env value', () => {
    const out = workspaceRoot({ FLOWTRON_VIZ_WORKSPACE: '~/projects' });
    expect(out.startsWith('/')).toBe(true);
    expect(out.endsWith('/projects')).toBe(true);
    expect(out).not.toContain('~');
  });

  it('defaults to ~/code (expanded) when env var is unset or empty', () => {
    const unset = workspaceRoot({});
    expect(unset.endsWith('/code')).toBe(true);
    expect(unset).not.toContain('~');

    const empty = workspaceRoot({ FLOWTRON_VIZ_WORKSPACE: '' });
    expect(empty).toBe(unset);
  });
});
