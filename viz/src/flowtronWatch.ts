import type { Stats } from 'node:fs';
import type { ServerResponse } from 'node:http';
import { dirname } from 'node:path';
import type { ArchiveCache } from './archiveCache.ts';
import { formatChangePayload } from './sseChange.ts';
import { projectForActiveTasknote, projectForPath } from './watchSet.ts';
import type { ProjectDescriptor } from './workspace.ts';

export const WATCH_POLL_MS = 200;
export const SSE_DEBOUNCE_MS = 200;
/** Upper bound on debounce coalescing — flush at least once per burst (FE-088.4). */
export const SSE_MAX_WAIT_MS = 1000;

/**
 * Markdown files only. Directories must pass — chokidar applies `ignored` to
 * traversal as well as events, so pruning a directory would stop the watcher
 * ever reaching the files inside it. The stats-less pre-check chokidar makes
 * before stat'ing also passes, for the same reason.
 */
export function ignoreNonMarkdown(path: string, stats?: Stats): boolean {
  return stats?.isFile() === true && !path.endsWith('.md');
}

/**
 * Archive reach must stay exactly `<archiveRoot>/<area>/<file>.md` — the shape
 * `archiveCache`'s `readArchive` reads (FE-076 narrowed the old recursive glob
 * to a single area level for precisely this reason). `depth: 1` alone is looser
 * than the retired glob: it would also admit a stray `.md` sitting directly in
 * an archive root, so the root list narrows it back.
 */
export function ignoreOutsideArchiveArea(archiveRoots: readonly string[]) {
  return (path: string, stats?: Stats): boolean => {
    if (stats?.isFile() !== true) return false;
    if (!path.endsWith('.md')) return true;
    return !archiveRoots.some((root) => dirname(dirname(path)) === root);
  };
}

/**
 * Hot set (PLAN.md + active tasknotes) — must poll inside symlink roots
 * (CORE-222). `depth: 0` keeps the reach at the tasknote dir's immediate
 * children, which is what the retired one-level tasknote glob matched; it also
 * stops the hot watcher descending into the archive tree below it.
 */
export const WATCH_HOT_OPTIONS = {
  ignoreInitial: true,
  depth: 0,
  usePolling: true,
  interval: WATCH_POLL_MS,
  ignored: ignoreNonMarkdown,
} as const;

/**
 * Archives — native watch; fleet-scale cost was the poll, not the watch
 * (CORE-431.2). `depth: 1` reaches `<area>/<file>.md`. Takes the watched
 * archive roots because the reach predicate needs them (see above).
 */
export function archiveWatchOptions(archiveRoots: readonly string[]) {
  return {
    ignoreInitial: true,
    depth: 1,
    usePolling: false,
    ignored: ignoreOutsideArchiveArea(archiveRoots),
  } as const;
}

interface ChangeBroadcaster {
  schedule(projectName: string | undefined): void;
  flush(): void;
  dispose(): void;
}

export function createChangeBroadcaster(opts: {
  sseClients: Set<ServerResponse>;
  debounceMs?: number;
  maxWaitMs?: number;
}): ChangeBroadcaster {
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  let maxWaitTimer: ReturnType<typeof setTimeout> | null = null;
  const pendingProjects = new Set<string>();
  let pendingUnattributed = false;

  const clearTimers = () => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
      debounceTimer = null;
    }
    if (maxWaitTimer) {
      clearTimeout(maxWaitTimer);
      maxWaitTimer = null;
    }
  };

  const flush = () => {
    clearTimers();
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
    if (!maxWaitTimer) {
      maxWaitTimer = setTimeout(flush, opts.maxWaitMs ?? SSE_MAX_WAIT_MS);
    }
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(flush, opts.debounceMs ?? SSE_DEBOUNCE_MS);
  };

  return {
    schedule,
    flush,
    dispose() {
      clearTimers();
    },
  };
}

export function createOnWatchEvent(opts: {
  projects: Iterable<ProjectDescriptor>;
  archiveCache: ArchiveCache;
  broadcast: Pick<ChangeBroadcaster, 'schedule'>;
}): (event: string, filepath: unknown) => void {
  // Materialize once. `Iterable` promises nothing about re-iterability, and the
  // handler below walks this list up to three times *per event*, for every
  // event on both watchers — so a one-shot iterator (the production call site
  // passes `Map.values()`) dies on the first pass and every later read sees an
  // empty sequence: SSE attribution never fires and archive-cache invalidation
  // stops matching (FE-091). Safe to snapshot: discovery completes before this
  // handler is constructed and the project set is not mutated afterwards.
  const projects = [...opts.projects];
  return (event, filepath) => {
    if (typeof filepath !== 'string') return;
    // chokidar reports directory events (`addDir` / `unlinkDir`) too. The
    // retired globs matched files only, and `ignored` cannot prune directories
    // without also pruning traversal — so the file-only reach is restored here.
    if (!filepath.endsWith('.md')) return;
    opts.archiveCache.invalidate(filepath, projects);
    if (event === 'unlink') {
      const owner = projectForActiveTasknote(filepath, projects);
      if (owner) opts.archiveCache.invalidateProject(owner.name);
    }
    opts.broadcast.schedule(projectForPath(filepath, projects)?.name);
  };
}
