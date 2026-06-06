import type { IncomingMessage, ServerResponse } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { originGuard } from './originGuard';
import { parseTasknote } from './tasknote-parse';
import { safeReaddir } from './fsSafe';
import type { ProjectDescriptor } from './workspace';
import type { ArchiveCache } from './archiveCache';
import type { Tasknote } from './tasknote';

type Handler = (req: IncomingMessage, res: ServerResponse) => void;
type AsyncHandler = (req: IncomingMessage, res: ServerResponse) => Promise<void>;

export function projectFromQuery(
  req: IncomingMessage,
  projects: Map<string, ProjectDescriptor>,
): ProjectDescriptor | { error: string } {
  const url = new URL(req.url ?? '', 'http://localhost');
  const name = url.searchParams.get('project');
  if (!name) return { error: 'missing ?project=<name>' };
  const project = projects.get(name);
  if (!project) return { error: `unknown project: ${name}` };
  return project;
}

export function createProjectsHandler(
  projects: Map<string, ProjectDescriptor>,
): Handler {
  return (req, res) => {
    if (!originGuard(req, res)) return;
    const list = Array.from(projects.values()).map((p) => ({
      name: p.name,
      flowtronVersion: p.flowtronVersion,
    }));
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(list));
  };
}

export function createPlanHandler(
  projects: Map<string, ProjectDescriptor>,
): AsyncHandler {
  return async (req, res) => {
    if (!originGuard(req, res)) return;
    const project = projectFromQuery(req, projects);
    if ('error' in project) {
      res.statusCode = 400;
      res.end(project.error);
      return;
    }
    try {
      const text = await readFile(project.planPath, 'utf8');
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.end(text);
    } catch (e) {
      console.error(`[devApi] Failed to read PLAN.md: ${(e as Error).message}`);
      res.statusCode = 500;
      res.end('Failed to read PLAN.md');
    }
  };
}

export function createActiveHandler(
  projects: Map<string, ProjectDescriptor>,
): AsyncHandler {
  return async (req, res) => {
    if (!originGuard(req, res)) return;
    const project = projectFromQuery(req, projects);
    if ('error' in project) {
      res.statusCode = 400;
      res.end(project.error);
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
      res.statusCode = 500;
      res.end('Failed to list tasknotes');
    }
  };
}

export function createArchiveHandler(
  projects: Map<string, ProjectDescriptor>,
  archiveCache: ArchiveCache,
): AsyncHandler {
  return async (req, res) => {
    if (!originGuard(req, res)) return;
    const project = projectFromQuery(req, projects);
    if ('error' in project) {
      res.statusCode = 400;
      res.end(project.error);
      return;
    }
    try {
      const tasknotes = await archiveCache.get(project);
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(tasknotes));
    } catch (e) {
      console.error(`[devApi] Failed to list archived tasknotes: ${(e as Error).message}`);
      res.statusCode = 500;
      res.end('Failed to list archived tasknotes');
    }
  };
}

export function createEventsHandler(sseClients: Set<ServerResponse>): Handler {
  return (req, res) => {
    if (!originGuard(req, res)) return;
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();
    res.write('event: open\ndata: {}\n\n');
    sseClients.add(res);
    req.on('close', () => {
      sseClients.delete(res);
    });
  };
}
