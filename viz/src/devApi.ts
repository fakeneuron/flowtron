import type { IncomingMessage, ServerResponse } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { endPlain } from './apiResponse';
import { originGuard } from './originGuard';
import { parseTasknote } from './tasknote-parse';
import { safeReaddir } from './fsSafe';
import type { ProjectDescriptor } from './workspace';
import type { ArchiveCache } from './archiveCache';
import type { Tasknote } from './tasknote';

type Handler = (req: IncomingMessage, res: ServerResponse) => void;
type AsyncHandler = (req: IncomingMessage, res: ServerResponse) => Promise<void>;

// /api/* responses are JSON/text/SSE, never HTML — lock CSP all the way down
// rather than reuse vite.config.ts's HTML-page CSP (script-src/style-src
// tolerances that make no sense for these payloads). Applied ahead of any
// guard clause so even 403/400/500 error bodies carry it.
const API_SECURITY_HEADERS: Readonly<Record<string, string>> = {
  'X-Content-Type-Options': 'nosniff',
  'Content-Security-Policy': "default-src 'none'",
};

function applyApiHeaders(res: ServerResponse): void {
  for (const [name, value] of Object.entries(API_SECURITY_HEADERS)) {
    res.setHeader(name, value);
  }
}

// Origin-less requests pass originGuard by design (see originGuard.ts), which
// leaves plan/tasknote content readable by anything that can reach the port
// without a browser Origin header. Rejecting non-GET/HEAD closes off
// state-changing or side-channel verbs before origin/business logic runs.
function methodGuard(req: IncomingMessage, res: ServerResponse): boolean {
  const method = req.method ?? 'GET';
  if (method === 'GET' || method === 'HEAD') return true;
  res.setHeader('Allow', 'GET, HEAD');
  endPlain(res, 405, 'Method Not Allowed');
  return false;
}

export function projectFromQuery(
  req: IncomingMessage,
  projects: Map<string, ProjectDescriptor>,
): ProjectDescriptor | { error: string } {
  const url = new URL(req.url ?? '', 'http://localhost');
  const name = url.searchParams.get('project');
  if (!name) return { error: 'missing ?project=<name>' };
  const project = projects.get(name);
  if (!project) {
    // Keep the caller's ?project= value off the wire — an error body is not the
    // place to reflect request input back. The name still reaches the operator
    // on server stderr, matching the log-detail/return-generic split FE-047
    // established for these handlers' 500 paths.
    console.error(`[devApi] unknown project: ${name}`);
    return { error: 'unknown project' };
  }
  return project;
}

export function createProjectsHandler(
  projects: Map<string, ProjectDescriptor>,
  latestRelease: string | null,
): Handler {
  return (req, res) => {
    applyApiHeaders(res);
    if (!methodGuard(req, res)) return;
    if (!originGuard(req, res)) return;
    const list = Array.from(projects.values()).map((p) => ({
      name: p.name,
      flowtronVersion: p.flowtronVersion,
    }));
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ latestRelease, projects: list }));
  };
}

export function createPlanHandler(
  projects: Map<string, ProjectDescriptor>,
): AsyncHandler {
  return async (req, res) => {
    applyApiHeaders(res);
    if (!methodGuard(req, res)) return;
    if (!originGuard(req, res)) return;
    const project = projectFromQuery(req, projects);
    if ('error' in project) {
      endPlain(res, 400, project.error);
      return;
    }
    try {
      const text = await readFile(project.planPath, 'utf8');
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.end(text);
    } catch (e) {
      console.error(`[devApi] Failed to read PLAN.md: ${(e as Error).message}`);
      endPlain(res, 500, 'Failed to read PLAN.md');
    }
  };
}

export function createActiveHandler(
  projects: Map<string, ProjectDescriptor>,
): AsyncHandler {
  return async (req, res) => {
    applyApiHeaders(res);
    if (!methodGuard(req, res)) return;
    if (!originGuard(req, res)) return;
    const project = projectFromQuery(req, projects);
    if ('error' in project) {
      endPlain(res, 400, project.error);
      return;
    }
    try {
      const entries = await safeReaddir(project.tasknoteDir);
      const files = entries.filter((e) => e.isFile() && e.name.endsWith('.md'));
      const tasknotes = (
        await Promise.all(
          files.map(async (e) => {
            const id = e.name.replace(/\.md$/, '');
            const path = join(project.tasknoteDir, e.name);
            try {
              const text = await readFile(path, 'utf8');
              return parseTasknote(id, path, text);
            } catch {
              // One unreadable/malformed tasknote (or a TOCTOU delete between readdir
              // and readFile during live editing) must not 500 the whole active list.
              // Mirror archiveCache.readArchive: skip the bad file, keep the rest.
              return null;
            }
          }),
        )
      ).filter((t): t is Tasknote => t !== null);
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(tasknotes));
    } catch (e) {
      console.error(`[devApi] Failed to list tasknotes: ${(e as Error).message}`);
      endPlain(res, 500, 'Failed to list tasknotes');
    }
  };
}

export function createArchiveHandler(
  projects: Map<string, ProjectDescriptor>,
  archiveCache: ArchiveCache,
): AsyncHandler {
  return async (req, res) => {
    applyApiHeaders(res);
    if (!methodGuard(req, res)) return;
    if (!originGuard(req, res)) return;
    const project = projectFromQuery(req, projects);
    if ('error' in project) {
      endPlain(res, 400, project.error);
      return;
    }
    try {
      const tasknotes = await archiveCache.get(project);
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(tasknotes));
    } catch (e) {
      console.error(`[devApi] Failed to list archived tasknotes: ${(e as Error).message}`);
      endPlain(res, 500, 'Failed to list archived tasknotes');
    }
  };
}

const MAX_SSE_CLIENTS = 10;

export function createEventsHandler(sseClients: Set<ServerResponse>): Handler {
  return (req, res) => {
    applyApiHeaders(res);
    if (!methodGuard(req, res)) return;
    if (!originGuard(req, res)) return;
    if (sseClients.size >= MAX_SSE_CLIENTS) {
      endPlain(res, 503, 'SSE capacity full');
      return;
    }
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();
    res.write('event: open\ndata: {}\n\n');
    sseClients.add(res);
    req.on('close', () => {
      sseClients.delete(res);
    });
    // A write to a socket dropped by RST (before `close` fires) emits an
    // 'error' on the response; without this listener that error is unhandled
    // and crashes the long-running dev server. Prune the client instead.
    res.on('error', () => {
      sseClients.delete(res);
    });
  };
}
