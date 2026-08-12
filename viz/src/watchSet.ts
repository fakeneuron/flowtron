import { dirname, join } from 'node:path';
import type { ProjectDescriptor } from './workspace';

export interface WatchSets {
  hot: string[];
  archive: string[];
}

// Hot paths are polled (PLAN.md + active tasknotes). Archive globs are
// watched natively — the fleet-scale cost is the 200ms poll, not the watch.
export function watchSets(projects: Iterable<ProjectDescriptor>): WatchSets {
  const hot: string[] = [];
  const archive: string[] = [];
  for (const p of projects) {
    hot.push(p.planPath, join(p.tasknoteDir, '*.md'));
    archive.push(join(p.archiveDir, '*/*.md'));
  }
  return { hot, archive };
}

// Active tasknotes live directly in tasknoteDir. Archive files live one
// extra level down (archive/<area>/), so dirname distinguishes them.
export function projectForActiveTasknote(
  filepath: string,
  projects: Iterable<ProjectDescriptor>,
): ProjectDescriptor | undefined {
  for (const p of projects) {
    if (dirname(filepath) === p.tasknoteDir) return p;
  }
  return undefined;
}

// Owner of any watched path (PLAN.md, active tasknote, or archive file).
// Used to attribute SSE change events; not a substitute for
// projectForActiveTasknote, which must stay unlink-only.
export function projectForPath(
  filepath: string,
  projects: Iterable<ProjectDescriptor>,
): ProjectDescriptor | undefined {
  for (const p of projects) {
    if (filepath === p.planPath) return p;
    if (dirname(filepath) === p.tasknoteDir) return p;
    if (filepath.startsWith(p.archiveDir)) return p;
  }
  return undefined;
}
