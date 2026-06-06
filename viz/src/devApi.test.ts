import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  createActiveHandler,
  createArchiveHandler,
  createEventsHandler,
  createPlanHandler,
  createProjectsHandler,
  projectFromQuery,
} from './devApi';
import { DEV_PORT } from './originGuard';
import { createArchiveCache } from './archiveCache';
import type { ProjectDescriptor } from './workspace';

interface FakeRes {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
  chunks: string[];
  ended: boolean;
  flushed: boolean;
}

function makeReq(opts: {
  url?: string;
  headers?: Record<string, string | undefined>;
}): IncomingMessage & { _close: () => void } {
  const closeListeners: Array<() => void> = [];
  const req = {
    url: opts.url ?? '/',
    headers: opts.headers ?? {},
    on(event: string, cb: () => void) {
      if (event === 'close') closeListeners.push(cb);
    },
    _close() {
      for (const cb of closeListeners) cb();
    },
  } as unknown as IncomingMessage & { _close: () => void };
  return req;
}

function makeRes(): { res: ServerResponse; state: FakeRes } {
  const state: FakeRes = {
    statusCode: 200,
    headers: {},
    body: '',
    chunks: [],
    ended: false,
    flushed: false,
  };
  const res = {
    get statusCode() {
      return state.statusCode;
    },
    set statusCode(code: number) {
      state.statusCode = code;
    },
    setHeader(name: string, value: string) {
      state.headers[name.toLowerCase()] = value;
    },
    write(chunk: string) {
      state.chunks.push(chunk);
    },
    flushHeaders() {
      state.flushed = true;
    },
    end(body?: string) {
      if (typeof body === 'string') state.body = body;
      state.ended = true;
    },
  } as unknown as ServerResponse;
  return { res, state };
}

const ALLOWED_ORIGIN = `http://localhost:${DEV_PORT}`;
const BLOCKED_ORIGIN = 'https://evil.example.com';

let root: string;

beforeEach(async () => {
  root = await mkdtemp(join(tmpdir(), 'flowtron-viz-dev-api-'));
});

afterEach(async () => {
  await rm(root, { recursive: true, force: true });
});

async function makeProject(
  name: string,
  opts: { planText?: string; tasknotes?: Record<string, string> } = {},
): Promise<ProjectDescriptor> {
  const projectRoot = join(root, name);
  const projectDir = join(projectRoot, '.flowtron');
  const tasknoteDir = join(projectDir, 'tasknote');
  const archiveDir = join(tasknoteDir, 'archive');
  await mkdir(archiveDir, { recursive: true });
  const planPath = join(projectDir, 'PLAN.md');
  await writeFile(planPath, opts.planText ?? `## High\n\n- [ ] **${name.toUpperCase()}-001** — seed\n`);
  for (const [filename, content] of Object.entries(opts.tasknotes ?? {})) {
    await writeFile(join(tasknoteDir, filename), content);
  }
  return { name, root: projectRoot, planPath, tasknoteDir, archiveDir, flowtronVersion: null };
}

describe('projectFromQuery', () => {
  it('returns the matching project for a known name', () => {
    const proj: ProjectDescriptor = {
      name: 'alpha',
      root: '/tmp/alpha',
      planPath: '/tmp/alpha/.flowtron/PLAN.md',
      tasknoteDir: '/tmp/alpha/.flowtron/tasknote',
      archiveDir: '/tmp/alpha/.flowtron/tasknote/archive',
      flowtronVersion: null,
    };
    const projects = new Map([['alpha', proj]]);
    const req = makeReq({ url: '/api/plan?project=alpha' });

    const result = projectFromQuery(req, projects);

    expect(result).toBe(proj);
  });

  it('returns an error for a missing query parameter', () => {
    const req = makeReq({ url: '/api/plan' });

    const result = projectFromQuery(req, new Map());

    expect(result).toEqual({ error: 'missing ?project=<name>' });
  });

  it('returns an error for an unknown project name', () => {
    const req = makeReq({ url: '/api/plan?project=ghost' });

    const result = projectFromQuery(req, new Map());

    expect(result).toEqual({ error: 'unknown project: ghost' });
  });
});

describe('createProjectsHandler', () => {
  it('rejects a cross-origin request with 403', () => {
    const handler = createProjectsHandler(new Map());
    const req = makeReq({ headers: { origin: BLOCKED_ORIGIN } });
    const { res, state } = makeRes();

    handler(req, res);

    expect(state.statusCode).toBe(403);
    expect(state.body).toBe('Forbidden: cross-origin request');
  });

  it('returns the project-name list as JSON on the allowed origin', async () => {
    const alpha = await makeProject('alpha');
    const beta = await makeProject('beta');
    const projects = new Map([
      ['alpha', alpha],
      ['beta', beta],
    ]);
    const handler = createProjectsHandler(projects);
    const req = makeReq({ headers: { origin: ALLOWED_ORIGIN } });
    const { res, state } = makeRes();

    handler(req, res);

    expect(state.headers['content-type']).toBe('application/json');
    expect(JSON.parse(state.body)).toEqual([
      { name: 'alpha', flowtronVersion: null },
      { name: 'beta', flowtronVersion: null },
    ]);
  });
});

describe('createPlanHandler', () => {
  it('rejects a cross-origin request with 403', async () => {
    const handler = createPlanHandler(new Map());
    const req = makeReq({
      url: '/api/plan?project=alpha',
      headers: { origin: BLOCKED_ORIGIN },
    });
    const { res, state } = makeRes();

    await handler(req, res);

    expect(state.statusCode).toBe(403);
  });

  it('returns the PLAN.md text on the allowed origin', async () => {
    const planText = '## High\n\n- [ ] **ALPHA-001** — hello\n';
    const alpha = await makeProject('alpha', { planText });
    const handler = createPlanHandler(new Map([['alpha', alpha]]));
    const req = makeReq({
      url: '/api/plan?project=alpha',
      headers: { origin: ALLOWED_ORIGIN },
    });
    const { res, state } = makeRes();

    await handler(req, res);

    expect(state.headers['content-type']).toBe('text/plain; charset=utf-8');
    expect(state.body).toBe(planText);
  });

  it('returns 400 for an unknown project', async () => {
    const handler = createPlanHandler(new Map());
    const req = makeReq({
      url: '/api/plan?project=ghost',
      headers: { origin: ALLOWED_ORIGIN },
    });
    const { res, state } = makeRes();

    await handler(req, res);

    expect(state.statusCode).toBe(400);
    expect(state.body).toBe('unknown project: ghost');
  });
});

describe('createActiveHandler', () => {
  it('rejects a cross-origin request with 403', async () => {
    const handler = createActiveHandler(new Map());
    const req = makeReq({
      url: '/api/active?project=alpha',
      headers: { origin: BLOCKED_ORIGIN },
    });
    const { res, state } = makeRes();

    await handler(req, res);

    expect(state.statusCode).toBe(403);
  });

  it('lists active tasknote files as JSON on the allowed origin', async () => {
    const tasknote = `---
title: hi
status: in-progress
created: 2026-05-18
---

# CORE-999 | hi
`;
    const alpha = await makeProject('alpha', { tasknotes: { 'CORE-999.md': tasknote } });
    const handler = createActiveHandler(new Map([['alpha', alpha]]));
    const req = makeReq({
      url: '/api/active?project=alpha',
      headers: { origin: ALLOWED_ORIGIN },
    });
    const { res, state } = makeRes();

    await handler(req, res);

    expect(state.headers['content-type']).toBe('application/json');
    const parsed = JSON.parse(state.body) as Array<{ id: string }>;
    expect(parsed.map((t) => t.id)).toEqual(['CORE-999']);
  });

  it('tolerates a malformed tasknote and returns the rest', async () => {
    const good = `---
title: hi
status: in-progress
created: 2026-05-18
---

# CORE-999 | hi
`;
    const malformed = '---\nkey:\n\tdrops-good-rest\n---\nbody\n';
    const alpha = await makeProject('alpha', {
      tasknotes: { 'CORE-999.md': good, 'CORE-998.md': malformed },
    });
    const handler = createActiveHandler(new Map([['alpha', alpha]]));
    const req = makeReq({
      url: '/api/active?project=alpha',
      headers: { origin: ALLOWED_ORIGIN },
    });
    const { res, state } = makeRes();

    await handler(req, res);

    expect(state.statusCode).toBe(200);
    const parsed = JSON.parse(state.body) as Array<{ id: string }>;
    expect(parsed.map((t) => t.id)).toEqual(['CORE-999']);
  });
});

describe('createArchiveHandler', () => {
  it('rejects a cross-origin request with 403', async () => {
    const handler = createArchiveHandler(new Map(), createArchiveCache());
    const req = makeReq({
      url: '/api/archive?project=alpha',
      headers: { origin: BLOCKED_ORIGIN },
    });
    const { res, state } = makeRes();

    await handler(req, res);

    expect(state.statusCode).toBe(403);
  });

  it('serves archived tasknotes from the cache on the allowed origin', async () => {
    const alpha = await makeProject('alpha');
    await mkdir(join(alpha.archiveDir, 'core'), { recursive: true });
    await writeFile(
      join(alpha.archiveDir, 'core', 'CORE-001.md'),
      `---
title: prior
status: completed
created: 2026-05-01
---

# CORE-001 | prior
`,
    );
    const handler = createArchiveHandler(new Map([['alpha', alpha]]), createArchiveCache());
    const req = makeReq({
      url: '/api/archive?project=alpha',
      headers: { origin: ALLOWED_ORIGIN },
    });
    const { res, state } = makeRes();

    await handler(req, res);

    expect(state.headers['content-type']).toBe('application/json');
    const parsed = JSON.parse(state.body) as Array<{ id: string }>;
    expect(parsed.map((t) => t.id)).toEqual(['CORE-001']);
  });
});

describe('createEventsHandler', () => {
  it('rejects a cross-origin request with 403 and does not register the client', () => {
    const sseClients = new Set<ServerResponse>();
    const handler = createEventsHandler(sseClients);
    const req = makeReq({ headers: { origin: BLOCKED_ORIGIN } });
    const { res, state } = makeRes();

    handler(req, res);

    expect(state.statusCode).toBe(403);
    expect(sseClients.size).toBe(0);
  });

  it('registers the response, writes the SSE preamble, and unregisters on close', () => {
    const sseClients = new Set<ServerResponse>();
    const handler = createEventsHandler(sseClients);
    const req = makeReq({ headers: { origin: ALLOWED_ORIGIN } });
    const { res, state } = makeRes();

    handler(req, res);

    expect(state.headers['content-type']).toBe('text/event-stream');
    expect(state.headers['cache-control']).toBe('no-cache, no-transform');
    expect(state.headers['connection']).toBe('keep-alive');
    expect(state.flushed).toBe(true);
    expect(state.chunks).toEqual(['event: open\ndata: {}\n\n']);
    expect(sseClients.has(res)).toBe(true);

    req._close();
    expect(sseClients.has(res)).toBe(false);
  });
});
