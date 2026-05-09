import { readdir, stat } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join } from 'node:path';

export interface ProjectDescriptor {
  name: string;
  root: string;
  planPath: string;
  tasknoteDir: string;
  archiveDir: string;
}

function expandHome(path: string): string {
  if (path === '~') return homedir();
  if (path.startsWith('~/')) return join(homedir(), path.slice(2));
  return path;
}

export function workspaceRoot(env: NodeJS.ProcessEnv = process.env): string {
  const raw = env.FLOWTRON_VIZ_WORKSPACE;
  return expandHome(raw && raw.length > 0 ? raw : '~/code');
}

async function isFile(path: string): Promise<boolean> {
  try {
    return (await stat(path)).isFile();
  } catch {
    return false;
  }
}

export async function discoverProjects(root: string): Promise<ProjectDescriptor[]> {
  let entries;
  try {
    entries = await readdir(root, { withFileTypes: true });
  } catch {
    return [];
  }
  const projects: ProjectDescriptor[] = [];
  for (const entry of entries) {
    if (!(entry.isDirectory() || entry.isSymbolicLink())) continue;
    if (entry.name.startsWith('.')) continue;
    const projectRoot = join(root, entry.name);
    const planPath = join(projectRoot, '_project', 'PLAN.md');
    if (!(await isFile(planPath))) continue;
    projects.push({
      name: entry.name,
      root: projectRoot,
      planPath,
      tasknoteDir: join(projectRoot, '_project', 'tasknote'),
      archiveDir: join(projectRoot, '_project', 'tasknote', 'archive'),
    });
  }
  projects.sort((a, b) => a.name.localeCompare(b.name));
  return projects;
}
