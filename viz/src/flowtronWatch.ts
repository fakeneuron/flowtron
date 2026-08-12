import type { ServerResponse } from 'node:http';
import type { ArchiveCache } from './archiveCache';
import { formatChangePayload } from './sseChange';
import { projectForActiveTasknote, projectForPath } from './watchSet';
import type { ProjectDescriptor } from './workspace';

export const WATCH_POLL_MS = 200;
export const SSE_DEBOUNCE_MS = 200;

/** Hot set (PLAN.md + active tasknotes) — must poll inside symlink roots (CORE-222). */
export const WATCH_HOT_OPTIONS = {
  ignoreInitial: true,
  depth: 1,
  usePolling: true,
  interval: WATCH_POLL_MS,
} as const;

/** Archives — native watch; fleet-scale cost was the poll, not the watch (CORE-431.2). */
export const WATCH_ARCHIVE_OPTIONS = {
  ignoreInitial: true,
  depth: 2,
  usePolling: false,
} as const;

export interface ChangeBroadcaster {
  schedule(projectName: string | undefined): void;
  flush(): void;
  dispose(): void;
}

export function createChangeBroadcaster(opts: {
  sseClients: Set<ServerResponse>;
  debounceMs?: number;
}): ChangeBroadcaster {
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  const pendingProjects = new Set<string>();
  let pendingUnattributed = false;

  const flush = () => {
    const names = [...pendingProjects];
    const unattributed = pendingUnattributed;
    pendingProjects.clear();
    pendingUnattributed = false;
    const payloads = unattributed
      ? [formatChangePayload(undefined)]
      : names.map((name) => formatChangePayload(name));
    for (const res of opts.sseClients) {
      for (const data of payloads) {
        res.write(`event: change\ndata: ${data}\n\n`);
      }
    }
  };

  const schedule = (projectName: string | undefined) => {
    if (projectName) pendingProjects.add(projectName);
    else pendingUnattributed = true;
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(flush, opts.debounceMs ?? SSE_DEBOUNCE_MS);
  };

  return {
    schedule,
    flush,
    dispose() {
      if (debounceTimer) clearTimeout(debounceTimer);
    },
  };
}

export function createOnWatchEvent(opts: {
  projects: Iterable<ProjectDescriptor>;
  archiveCache: ArchiveCache;
  broadcast: Pick<ChangeBroadcaster, 'schedule'>;
}): (event: string, filepath: unknown) => void {
  return (event, filepath) => {
    if (typeof filepath !== 'string') return;
    opts.archiveCache.invalidate(filepath, opts.projects);
    if (event === 'unlink') {
      const owner = projectForActiveTasknote(filepath, opts.projects);
      if (owner) opts.archiveCache.invalidateProject(owner.name);
    }
    opts.broadcast.schedule(projectForPath(filepath, opts.projects)?.name);
  };
}
