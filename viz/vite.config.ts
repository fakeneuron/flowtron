import { defineConfig } from 'vitest/config';
import type { Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { readFile, readdir } from 'node:fs/promises';
import type { Dirent } from 'node:fs';
import { join } from 'node:path';
import type { IncomingMessage, ServerResponse } from 'node:http';
import chokidar from 'chokidar';
import { parseTasknote } from './src/tasknote-parse';
import { discoverProjects, workspaceRoot, type ProjectDescriptor } from './src/workspace';
import { createArchiveCache } from './src/archiveCache';

async function safeReaddir(dir: string): Promise<Dirent[]> {
  try {
    return (await readdir(dir, { withFileTypes: true })) as Dirent[];
  } catch {
    return [];
  }
}

const SSE_DEBOUNCE_MS = 200;
const SSE_HEARTBEAT_MS = 30_000;

function projectFromQuery(
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

function flowtronApi(): Plugin {
  const sseClients = new Set<ServerResponse>();
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  let watcher: ReturnType<typeof chokidar.watch> | null = null;
  let heartbeat: ReturnType<typeof setInterval> | null = null;
  const projects = new Map<string, ProjectDescriptor>();
  const archiveCache = createArchiveCache();

  const broadcastChange = () => {
    for (const res of sseClients) {
      res.write('event: change\ndata: {}\n\n');
    }
  };

  const scheduleBroadcast = () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(broadcastChange, SSE_DEBOUNCE_MS);
  };

  return {
    name: 'flowtron-api',
    async configureServer(server) {
      const root = workspaceRoot();
      const discovered = await discoverProjects(root);
      for (const p of discovered) projects.set(p.name, p);

      if (server.httpServer) {
        const watchPaths = discovered.flatMap((p) => [
          p.planPath,
          join(p.tasknoteDir, '*.md'),
          join(p.archiveDir, '**/*.md'),
        ]);
        watcher = chokidar.watch(watchPaths, {
          ignoreInitial: true,
          depth: 2,
          usePolling: true,
          interval: 200,
        });
        watcher.on('all', (_event, filepath) => {
          if (typeof filepath === 'string') archiveCache.invalidate(filepath, projects.values());
          scheduleBroadcast();
        });

        heartbeat = setInterval(() => {
          for (const res of sseClients) res.write(': ping\n\n');
        }, SSE_HEARTBEAT_MS);

        server.httpServer.on('close', () => {
          if (debounceTimer) clearTimeout(debounceTimer);
          if (heartbeat) clearInterval(heartbeat);
          void watcher?.close();
          archiveCache.clear();
          for (const res of sseClients) res.end();
          sseClients.clear();
        });

        server.middlewares.use('/api/events', (req, res) => {
          res.setHeader('Content-Type', 'text/event-stream');
          res.setHeader('Cache-Control', 'no-cache, no-transform');
          res.setHeader('Connection', 'keep-alive');
          res.flushHeaders?.();
          res.write('event: open\ndata: {}\n\n');
          sseClients.add(res);
          req.on('close', () => {
            sseClients.delete(res);
          });
        });
      }

      server.middlewares.use('/api/projects', (_req, res) => {
        const list = Array.from(projects.values()).map((p) => ({ name: p.name }));
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(list));
      });

      server.middlewares.use('/api/plan', async (req, res) => {
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
          res.statusCode = 500;
          res.end(`Failed to read PLAN.md: ${(e as Error).message}`);
        }
      });

      server.middlewares.use('/api/active', async (req, res) => {
        const project = projectFromQuery(req, projects);
        if ('error' in project) {
          res.statusCode = 400;
          res.end(project.error);
          return;
        }
        try {
          const entries = await safeReaddir(project.tasknoteDir);
          const files = entries.filter((e) => e.isFile() && e.name.endsWith('.md'));
          const tasknotes = await Promise.all(
            files.map(async (e) => {
              const id = e.name.replace(/\.md$/, '');
              const path = join(project.tasknoteDir, e.name);
              const text = await readFile(path, 'utf8');
              return parseTasknote(id, path, text);
            }),
          );
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(tasknotes));
        } catch (e) {
          res.statusCode = 500;
          res.end(`Failed to list tasknotes: ${(e as Error).message}`);
        }
      });

      server.middlewares.use('/api/archive', async (req, res) => {
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
          res.statusCode = 500;
          res.end(`Failed to list archived tasknotes: ${(e as Error).message}`);
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), flowtronApi()],
  // Pin the dev port and refuse to auto-bump. 5120 is well outside the 5173+
  // Vite default cluster used by sibling projects (BananaPeel, Invisipaw).
  // Without strictPort, vite climbs 5120 → 5121 → ... and can collide
  // unexpectedly. Better to fail loudly so the user can free the port.
  // The single-port discipline also enforces the "one global viz" model:
  // if a second instance is launched, it errors out instead of silently
  // scanning the same workspace on a different port.
  server: {
    port: 5120,
    strictPort: true,
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: false,
  },
});
