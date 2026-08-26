import type { IncomingMessage, ServerResponse } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { endPlain } from './apiResponse.ts';
import { originGuard } from './originGuard.ts';
import { parseTasknote } from './tasknote-parse.ts';
import { realpathWithin, safeReaddir, safeRealpath } from './fsSafe.ts';
import type { ProjectDescriptor } from './workspace.ts';
import type { ArchiveCache } from './archiveCache.ts';
import type { Tasknote } from './tasknote.ts';

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
      // Same project-root containment createPlanArchiveHandler / createActiveHandler
      // apply: discoverProjects only validates planPath once, at scan time — without
      // a per-request check, a `.flowtron/PLAN.md` (or an ancestor) swapped to a
      // symlink afterward would let any readable file on disk reach /api/plan (FE-088.2).
      const realRoot = await safeRealpath(project.root);
      const realPlan = realRoot === null ? null : await realpathWithin(realRoot, project.planPath);
      if (realPlan === null) {
        throw new Error('planPath resolves outside the project root');
      }
      const text = await readFile(realPlan, 'utf8');
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.end(text);
    } catch (e) {
      console.error(`[devApi] Failed to read PLAN.md: ${(e as Error).message}`);
      endPlain(res, 500, 'Failed to read PLAN.md');
    }
  };
}

// `.flowtron/PLAN-ARCHIVE.md` is optional history: it does not exist until a
// project's first `## Completed` rotation, and many adopters will never rotate.
// Absence is an empty archive, never an error (SPEC/tasknote-selection.md
// §"`## Completed` rotation" — "consumers treat absence as an empty archive").
// The same tolerance covers a present-but-unreadable file: a board renders fine
// from PLAN.md alone, so supplementary history must never be able to 500 it.
// Containment mirrors createActiveHandler / archiveCache.readArchive — without
// it a symlinked PLAN-ARCHIVE.md would make any readable file on disk fetchable
// here (FE-088.2).
export function createPlanArchiveHandler(
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
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    const realRoot = await safeRealpath(project.root);
    if (realRoot === null) {
      res.end('');
      return;
    }
    // Null covers both "not there" and "resolves outside the project root" —
    // the response is the same empty archive either way.
    const realArchive = await realpathWithin(realRoot, project.planArchivePath);
    if (realArchive === null) {
      res.end('');
      return;
    }
    try {
      res.end(await readFile(realArchive, 'utf8'));
    } catch (e) {
      console.error(`[devApi] Failed to read PLAN-ARCHIVE.md: ${(e as Error).message}`);
      res.end('');
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
      // Same project-root containment archiveCache.readArchive applies: a
      // symlinked `.flowtron/tasknote/` would otherwise let any readable file
      // on disk reach /api/active (FE-088.2).
      const realRoot = await safeRealpath(project.root);
      if (realRoot === null) {
        res.setHeader('Content-Type', 'application/json');
        res.end('[]');
        return;
      }
      const entries = await safeReaddir(project.tasknoteDir);
      const files = entries.filter((e) => e.isFile() && e.name.endsWith('.md'));
      const tasknotes = (
        await Promise.all(
          files.map(async (e) => {
            const id = e.name.replace(/\.md$/, '');
            const path = join(project.tasknoteDir, e.name);
            const realPath = await realpathWithin(realRoot, path);
            // Resolves outside the project root — drop it, same silent shape
            // as the malformed-tasknote skip below.
            if (realPath === null) return null;
            try {
              const text = await readFile(realPath, 'utf8');
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
