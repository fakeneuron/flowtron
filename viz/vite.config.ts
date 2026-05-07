import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { readFile, readdir } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { ServerResponse } from 'node:http';
import chokidar from 'chokidar';
import { parseTasknote } from './src/tasknote';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_DIR = resolve(__dirname, '..', '_project');
const PLAN_PATH = join(PROJECT_DIR, 'PLAN.md');
const TASKNOTE_DIR = join(PROJECT_DIR, 'tasknote');
const ARCHIVE_DIR = join(TASKNOTE_DIR, 'archive');

const SSE_DEBOUNCE_MS = 200;
const SSE_HEARTBEAT_MS = 30_000;

function flowtronApi(): Plugin {
  const sseClients = new Set<ServerResponse>();
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  let watcher: ReturnType<typeof chokidar.watch> | null = null;
  let heartbeat: ReturnType<typeof setInterval> | null = null;

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
    configureServer(server) {
      if (server.httpServer) {
        watcher = chokidar.watch(
          [
            PLAN_PATH,
            join(TASKNOTE_DIR, '*.md'),
            join(ARCHIVE_DIR, '*', '*.md'),
          ],
          {
            ignoreInitial: true,
            depth: 2,
            usePolling: true,
            interval: 200,
          },
        );
        watcher.on('all', scheduleBroadcast);

        heartbeat = setInterval(() => {
          for (const res of sseClients) res.write(': ping\n\n');
        }, SSE_HEARTBEAT_MS);

        server.httpServer.on('close', () => {
          if (debounceTimer) clearTimeout(debounceTimer);
          if (heartbeat) clearInterval(heartbeat);
          void watcher?.close();
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

      server.middlewares.use('/api/plan', async (_req, res) => {
        try {
          const text = await readFile(PLAN_PATH, 'utf8');
          res.setHeader('Content-Type', 'text/plain; charset=utf-8');
          res.end(text);
        } catch (e) {
          res.statusCode = 500;
          res.end(`Failed to read PLAN.md: ${(e as Error).message}`);
        }
      });
      server.middlewares.use('/api/active', async (_req, res) => {
        try {
          const entries = await readdir(TASKNOTE_DIR, { withFileTypes: true });
          const files = entries.filter((e) => e.isFile() && e.name.endsWith('.md'));
          const tasknotes = await Promise.all(
            files.map(async (e) => {
              const id = e.name.replace(/\.md$/, '');
              const path = join(TASKNOTE_DIR, e.name);
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
      server.middlewares.use('/api/archive', async (_req, res) => {
        try {
          let areas: Array<{ name: string }> = [];
          try {
            areas = (await readdir(ARCHIVE_DIR, { withFileTypes: true })).filter((e) =>
              e.isDirectory(),
            );
          } catch {
            areas = [];
          }
          const tasknotes = (
            await Promise.all(
              areas.map(async (area) => {
                const areaDir = join(ARCHIVE_DIR, area.name);
                const entries = await readdir(areaDir, { withFileTypes: true });
                const files = entries.filter((e) => e.isFile() && e.name.endsWith('.md'));
                return Promise.all(
                  files.map(async (e) => {
                    const id = e.name.replace(/\.md$/, '');
                    const path = join(areaDir, e.name);
                    const text = await readFile(path, 'utf8');
                    return parseTasknote(id, path, text);
                  }),
                );
              }),
            )
          ).flat();
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
});
