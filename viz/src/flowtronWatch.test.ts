import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import type { Stats } from 'node:fs';
import type { ServerResponse } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createArchiveCache } from './archiveCache';
import {
  archiveWatchOptions,
  createChangeBroadcaster,
  createOnWatchEvent,
  ignoreNonMarkdown,
  ignoreOutsideArchiveArea,
  SSE_DEBOUNCE_MS,
  SSE_MAX_WAIT_MS,
  WATCH_HOT_OPTIONS,
  WATCH_POLL_MS,
} from './flowtronWatch';
import type { ProjectDescriptor } from './workspace';

interface FakeRes {
  chunks: string[];
}

function makeRes(): { res: ServerResponse; state: FakeRes } {
  const state: FakeRes = { chunks: [] };
  const res = {
    write(chunk: string) {
      state.chunks.push(chunk);
    },
  } as unknown as ServerResponse;
  return { res, state };
}

let root: string;

beforeEach(async () => {
  root = await mkdtemp(join(tmpdir(), 'flowtron-viz-watch-'));
  vi.useFakeTimers();
});

afterEach(async () => {
  vi.useRealTimers();
  await rm(root, { recursive: true, force: true });
});

async function makeProject(name: string): Promise<ProjectDescriptor> {
  const projectRoot = join(root, name);
  const projectDir = join(projectRoot, '.flowtron');
  const tasknoteDir = join(projectDir, 'tasknote');
  const archiveDir = join(tasknoteDir, 'archive');
  await mkdir(join(archiveDir, 'core'), { recursive: true });
  await writeFile(join(projectDir, 'PLAN.md'), `## High\n\n- [ ] **${name.toUpperCase()}-001** — seed\n`);
  return {
    name,
    root: projectRoot,
    planPath: join(projectDir, 'PLAN.md'),
    tasknoteDir,
    archiveDir,
    flowtronVersion: null,
  };
}

const FILE = { isFile: () => true, isDirectory: () => false } as unknown as Stats;
const DIR = { isFile: () => false, isDirectory: () => true } as unknown as Stats;

describe('watcher option pins (CORE-431.2, chokidar 5 depths per FE-090.2)', () => {
  it('polls the hot set at WATCH_POLL_MS with depth 0', () => {
    expect(WATCH_HOT_OPTIONS).toEqual({
      ignoreInitial: true,
      depth: 0,
      usePolling: true,
      interval: WATCH_POLL_MS,
      ignored: ignoreNonMarkdown,
    });
  });

  it('watches archives natively with depth 1', () => {
    const roots = ['/ws/alpha/.flowtron/tasknote/archive'];
    expect(archiveWatchOptions(roots)).toMatchObject({
      ignoreInitial: true,
      depth: 1,
      usePolling: false,
    });
    expect(typeof archiveWatchOptions(roots).ignored).toBe('function');
  });
});

// chokidar 4 dropped glob support, so the retired `*.md` / `*/*.md` reach is
// now carried by these predicates plus `depth`. They must not prune
// directories: `ignored` gates traversal as well as events.
describe('ignoreNonMarkdown', () => {
  it('ignores non-markdown files', () => {
    expect(ignoreNonMarkdown('/ws/a/.flowtron/tasknote/notes.txt', FILE)).toBe(true);
  });

  it('keeps markdown files', () => {
    expect(ignoreNonMarkdown('/ws/a/.flowtron/tasknote/CORE-001.md', FILE)).toBe(false);
  });

  it('keeps directories and stats-less pre-checks so traversal can reach files', () => {
    expect(ignoreNonMarkdown('/ws/a/.flowtron/tasknote/archive', DIR)).toBe(false);
    expect(ignoreNonMarkdown('/ws/a/.flowtron/tasknote/archive')).toBe(false);
  });
});

describe('ignoreOutsideArchiveArea (FE-076 reader-matching reach)', () => {
  const archiveRoot = '/ws/alpha/.flowtron/tasknote/archive';
  const ignored = ignoreOutsideArchiveArea([archiveRoot]);

  it('keeps <archiveRoot>/<area>/<file>.md — the shape readArchive reads', () => {
    expect(ignored(join(archiveRoot, 'core', 'CORE-001.md'), FILE)).toBe(false);
  });

  it('ignores a stray .md sitting directly in the archive root', () => {
    expect(ignored(join(archiveRoot, 'README.md'), FILE)).toBe(true);
  });

  it('ignores .md nested deeper than one area level', () => {
    expect(ignored(join(archiveRoot, 'core', 'old', 'CORE-001.md'), FILE)).toBe(true);
  });

  it('ignores non-markdown files', () => {
    expect(ignored(join(archiveRoot, 'core', 'notes.txt'), FILE)).toBe(true);
  });

  it('keeps directories so traversal can reach the area dirs', () => {
    expect(ignored(join(archiveRoot, 'core'), DIR)).toBe(false);
    expect(ignored(join(archiveRoot, 'core'))).toBe(false);
  });

  it('is per-root', () => {
    const other = '/ws/beta/.flowtron/tasknote/archive';
    expect(ignoreOutsideArchiveArea([archiveRoot, other])(join(other, 'fe', 'FE-001.md'), FILE)).toBe(
      false,
    );
  });
});

describe('createOnWatchEvent (CORE-431.2 + CORE-431.3 wiring)', () => {
  it('invalidates archive cache and schedules an attributed broadcast for archive changes', async () => {
    const alpha = await makeProject('alpha');
    const archivePath = join(alpha.archiveDir, 'core', 'CORE-001.md');
    await writeFile(
      archivePath,
      `---
title: prior
status: completed
created: 2026-05-01
---

# CORE-001 | prior
`,
    );
    const cache = createArchiveCache();
    const firstPromise = cache.get(alpha);
    await firstPromise;

    const scheduled: Array<string | undefined> = [];
    const onWatchEvent = createOnWatchEvent({
      projects: [alpha],
      archiveCache: cache,
      broadcast: { schedule: (name) => scheduled.push(name) },
    });

    onWatchEvent('change', archivePath);

    expect(scheduled).toEqual(['alpha']);
    expect(cache.get(alpha)).not.toBe(firstPromise);
    const after = await cache.get(alpha);
    expect(after.map((t) => t.id)).toEqual(['CORE-001']);
  });

  it('does not invalidate archive cache on PLAN.md change but still attributes the project', async () => {
    const alpha = await makeProject('alpha');
    const cache = createArchiveCache();
    const firstPromise = cache.get(alpha);
    await firstPromise;

    const scheduled: Array<string | undefined> = [];
    const onWatchEvent = createOnWatchEvent({
      projects: [alpha],
      archiveCache: cache,
      broadcast: { schedule: (name) => scheduled.push(name) },
    });

    onWatchEvent('change', alpha.planPath);

    expect(scheduled).toEqual(['alpha']);
    expect(cache.invalidate(alpha.planPath, [alpha])).toBe(false);
    expect(cache.get(alpha)).toBe(firstPromise);
  });

  it('unlink of an active tasknote invalidates the project archive cache and attributes broadcast', async () => {
    const alpha = await makeProject('alpha');
    const activePath = join(alpha.tasknoteDir, 'CORE-999.md');
    await writeFile(
      activePath,
      `---
title: active
status: in-progress
created: 2026-05-18
---

# CORE-999 | active
`,
    );
    await writeFile(join(alpha.archiveDir, 'core', 'CORE-001.md'), tasknote('CORE-001', 'prior'));
    const cache = createArchiveCache();
    const firstPromise = cache.get(alpha);
    await firstPromise;

    const scheduled: Array<string | undefined> = [];
    const onWatchEvent = createOnWatchEvent({
      projects: [alpha],
      archiveCache: cache,
      broadcast: { schedule: (name) => scheduled.push(name) },
    });

    onWatchEvent('unlink', activePath);

    expect(scheduled).toEqual(['alpha']);
    expect(cache.get(alpha)).not.toBe(firstPromise);
    const repopulated = await cache.get(alpha);
    expect(repopulated.map((t) => t.id)).toEqual(['CORE-001']);
  });

  it('ignores non-string filepath', async () => {
    const alpha = await makeProject('alpha');
    const scheduled: Array<string | undefined> = [];
    const onWatchEvent = createOnWatchEvent({
      projects: [alpha],
      archiveCache: createArchiveCache(),
      broadcast: { schedule: (name) => scheduled.push(name) },
    });

    onWatchEvent('change', null);

    expect(scheduled).toEqual([]);
  });
});

describe('createChangeBroadcaster (CORE-431.3 debounce + attribution)', () => {
  it('debounces and writes one attributed change event per project', () => {
    const sseClients = new Set<ServerResponse>();
    const { res, state } = makeRes();
    sseClients.add(res);
    const broadcaster = createChangeBroadcaster({ sseClients, debounceMs: SSE_DEBOUNCE_MS });

    broadcaster.schedule('alpha');
    broadcaster.schedule('beta');
    broadcaster.schedule('alpha');
    vi.advanceTimersByTime(SSE_DEBOUNCE_MS);

    expect(state.chunks).toEqual([
      'event: change\ndata: {"project":"alpha"}\n\n',
      'event: change\ndata: {"project":"beta"}\n\n',
    ]);
  });

  it('flushes at maxWaitMs when schedule keeps resetting the debounce timer', () => {
    const sseClients = new Set<ServerResponse>();
    const { res, state } = makeRes();
    sseClients.add(res);
    const broadcaster = createChangeBroadcaster({
      sseClients,
      debounceMs: SSE_DEBOUNCE_MS,
      maxWaitMs: SSE_MAX_WAIT_MS,
    });

    for (let i = 0; i < 5; i++) {
      broadcaster.schedule('alpha');
      vi.advanceTimersByTime(SSE_DEBOUNCE_MS - 1);
    }
    expect(state.chunks).toEqual([]);

    vi.advanceTimersByTime(SSE_MAX_WAIT_MS - 5 * (SSE_DEBOUNCE_MS - 1));
    expect(state.chunks).toEqual(['event: change\ndata: {"project":"alpha"}\n\n']);
  });

  it('fail-opens to unattributed {} when any event in the window is unattributed', () => {
    const sseClients = new Set<ServerResponse>();
    const { res, state } = makeRes();
    sseClients.add(res);
    const broadcaster = createChangeBroadcaster({ sseClients, debounceMs: SSE_DEBOUNCE_MS });

    broadcaster.schedule('alpha');
    broadcaster.schedule(undefined);
    vi.advanceTimersByTime(SSE_DEBOUNCE_MS);

    expect(state.chunks).toEqual(['event: change\ndata: {}\n\n']);
  });

  it('flush() writes immediately without waiting for the debounce timer', () => {
    const sseClients = new Set<ServerResponse>();
    const { res, state } = makeRes();
    sseClients.add(res);
    const broadcaster = createChangeBroadcaster({ sseClients, debounceMs: SSE_DEBOUNCE_MS });

    broadcaster.schedule('alpha');
    broadcaster.flush();

    expect(state.chunks).toEqual(['event: change\ndata: {"project":"alpha"}\n\n']);
  });

  it('broadcasts to every registered SSE client', () => {
    const sseClients = new Set<ServerResponse>();
    const first = makeRes();
    const second = makeRes();
    sseClients.add(first.res);
    sseClients.add(second.res);
    const broadcaster = createChangeBroadcaster({ sseClients, debounceMs: SSE_DEBOUNCE_MS });

    broadcaster.schedule('alpha');
    broadcaster.flush();

    const expected = 'event: change\ndata: {"project":"alpha"}\n\n';
    expect(first.state.chunks).toEqual([expected]);
    expect(second.state.chunks).toEqual([expected]);
  });
});

function tasknote(id: string, title: string): string {
  return `---
title: ${title}
status: completed
created: 2026-05-10
---

# ${id} | ${title}
`;
}
