import { execFile } from 'node:child_process';
import { readdir, readFile, stat } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';
import { realpathWithin, safeRealpath } from './fsSafe';

const execFileAsync = promisify(execFile);

export interface ProjectDescriptor {
  name: string;
  root: string;
  planPath: string;
  tasknoteDir: string;
  archiveDir: string;
  flowtronVersion: string | null;
}

// expandHome/workspaceRoot/isFile mirror tools/update-adopters.mjs verbatim
// (bar workspaceRoot's arg shape — env object here, root string there). Kept
// duplicated rather than shared — see the comment there for why.
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

async function readFlowtronVersion(specPath: string): Promise<string | null> {
  try {
    const text = await readFile(specPath, 'utf8');
    // Matches "**Version:** v4.5.0" or "**Version:** 4.5.0" (with or without v prefix)
    const m = /^\*\*Version:\*\*\s*(v?\d+\.\d+\.\d+)/m.exec(text);
    if (!m) return null;
    const v = m[1];
    return v.startsWith('v') ? v : `v${v}`;
  } catch {
    return null;
  }
}

// Latest released flowtron tag, resolved from the repo enclosing `repoDir`
// (git walks up from cwd, so the viz dir resolves the flowtron checkout).
// Read once at dev-server startup — a release cut mid-session shows up on
// the next restart, which matches how /ft-release restarts the gate anyway.
export async function latestReleaseTag(repoDir: string): Promise<string | null> {
  try {
    const { stdout } = await execFileAsync('git', ['tag', '--sort=-v:refname'], {
      cwd: repoDir,
    });
    const first = stdout
      .split('\n')
      .map((line) => line.trim())
      .find((line) => /^v\d+\.\d+\.\d+$/.test(line));
    return first ?? null;
  } catch {
    return null;
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
    // A symlinked project root is legitimate and stays discoverable (CORE-222);
    // what must not escape is the PLAN.md below it. `isFile`'s stat follows
    // symlinks, so without this a `.flowtron/PLAN.md` (or `.flowtron/`) link
    // pointing anywhere on disk would make that file readable at /api/plan.
    const realRoot = await safeRealpath(projectRoot);
    if (realRoot === null) continue;
    const planPath = join(projectRoot, '.flowtron', 'PLAN.md');
    const realPlan = await realpathWithin(realRoot, planPath);
    if (realPlan === null || !(await isFile(realPlan))) continue;
    // Deliberately not containment-checked: this read yields only a
    // `v\d+.\d+.\d+` regex match (no file content reaches the wire), and
    // `.flowtron/core -> ~/code/flowtron` is a plausible local-dev symlink
    // that containment would break for no security gain.
    const flowtronSpec = join(projectRoot, '.flowtron', 'core', 'SPEC.md');
    const flowtronVersion = await readFlowtronVersion(flowtronSpec);
    projects.push({
      name: entry.name,
      root: projectRoot,
      planPath,
      tasknoteDir: join(projectRoot, '.flowtron', 'tasknote'),
      archiveDir: join(projectRoot, '.flowtron', 'tasknote', 'archive'),
      flowtronVersion,
    });
  }
  projects.sort((a, b) => a.name.localeCompare(b.name));
  return projects;
}
