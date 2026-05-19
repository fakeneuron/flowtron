import { defineConfig } from 'vitest/config';
import type { Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import type { ServerResponse } from 'node:http';
import { join } from 'node:path';
import chokidar from 'chokidar';
import { discoverProjects, workspaceRoot, type ProjectDescriptor } from './src/workspace';
import { createArchiveCache } from './src/archiveCache';
import { DEV_PORT } from './src/originGuard';
import {
  createActiveHandler,
  createArchiveHandler,
  createEventsHandler,
  createPlanHandler,
  createProjectsHandler,
} from './src/devApi';

const SSE_DEBOUNCE_MS = 200;
const SSE_HEARTBEAT_MS = 30_000;

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

        server.middlewares.use('/api/events', createEventsHandler(sseClients));
      }

      server.middlewares.use('/api/projects', createProjectsHandler(projects));
      server.middlewares.use('/api/plan', createPlanHandler(projects));
      server.middlewares.use('/api/active', createActiveHandler(projects));
      server.middlewares.use('/api/archive', createArchiveHandler(projects, archiveCache));
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
    port: DEV_PORT,
    strictPort: true,
    // Restrict Host header to loopback names. Combined with `originGuard()`
    // on each /api/* middleware, this defeats DNS-rebinding against the dev
    // server (a remote site resolving its domain to 127.0.0.1 to bypass
    // SOP). Mirrors Vite's own post-CVE-2025 default posture.
    allowedHosts: ['localhost', '127.0.0.1'],
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: false,
  },
});
