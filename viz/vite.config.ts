import { defineConfig } from 'vitest/config';
import type { Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import type { ServerResponse } from 'node:http';
import { fileURLToPath } from 'node:url';
import chokidar from 'chokidar';
import {
  discoverProjects,
  latestReleaseTag,
  workspaceRoot,
  type ProjectDescriptor,
} from './src/workspace';
import { createArchiveCache } from './src/archiveCache';
import { DEV_PORT } from './src/originGuard';
import {
  createActiveHandler,
  createArchiveHandler,
  createEventsHandler,
  createPlanHandler,
  createProjectsHandler,
} from './src/devApi';
import {
  createChangeBroadcaster,
  createOnWatchEvent,
  SSE_DEBOUNCE_MS,
  WATCH_ARCHIVE_OPTIONS,
  WATCH_HOT_OPTIONS,
} from './src/flowtronWatch';
import { watchSets } from './src/watchSet';

const SSE_HEARTBEAT_MS = 30_000;

// Static nonce stamped onto every Vite-injected <script> (the React-refresh
// preamble and @vite/client) via `html.cspNonce`, and echoed in the dev CSP's
// script-src below. Lets script-src stay free of 'unsafe-inline' even though
// Vite's dev server injects an inline preamble script. A fixed value (rather
// than per-response random) is an accepted trade-off for a loopback-only dev
// tool — the win is keeping the directive honestly inline-free.
const DEV_CSP_NONCE = 'flowtron-dev';

// Defense-in-depth CSP for the dev server (the only deployment surface).
// script-src: 'self' + nonce, no 'unsafe-inline' — our theme-init.js is now an
// external /public script ('self'), and Vite's injected scripts carry the nonce.
// style-src keeps 'unsafe-inline': Vite/Tailwind inject <style> at runtime in
// dev, which can't carry a build-time nonce. connect-src allows same-origin SSE
// (/api/events) plus the HMR websocket.
const DEV_CSP = [
  "default-src 'self'",
  `script-src 'self' 'nonce-${DEV_CSP_NONCE}'`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  `connect-src 'self' ws://localhost:${DEV_PORT} ws://127.0.0.1:${DEV_PORT}`,
  "object-src 'none'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
].join('; ');

function flowtronApi(): Plugin {
  const sseClients = new Set<ServerResponse>();
  let hotWatcher: ReturnType<typeof chokidar.watch> | null = null;
  let archiveWatcher: ReturnType<typeof chokidar.watch> | null = null;
  let heartbeat: ReturnType<typeof setInterval> | null = null;
  const projects = new Map<string, ProjectDescriptor>();
  const archiveCache = createArchiveCache();
  const changeBroadcaster = createChangeBroadcaster({ sseClients, debounceMs: SSE_DEBOUNCE_MS });

  return {
    name: 'flowtron-api',
    async configureServer(server) {
      const root = workspaceRoot();
      const discovered = await discoverProjects(root);
      for (const p of discovered) projects.set(p.name, p);
      // Resolved from the viz dir — git walks up to the flowtron checkout.
      const latestRelease = await latestReleaseTag(fileURLToPath(new URL('.', import.meta.url)));

      if (server.httpServer) {
        const { hot, archive } = watchSets(discovered);
        const onWatchEvent = createOnWatchEvent({
          projects: projects.values(),
          archiveCache,
          broadcast: changeBroadcaster,
        });

        // Hot set (PLAN.md + active tasknotes) must poll: FSEvents does not
        // reliably fire inside symlinked project roots (CORE-222).
        if (hot.length > 0) {
          hotWatcher = chokidar.watch(hot, WATCH_HOT_OPTIONS);
          hotWatcher.on('all', onWatchEvent);
        }

        // Archives are write-once and fleet-scale (~thousands of files). Native
        // watch is cheap; polling them at 200ms was the cost CORE-431.2 removes.
        if (archive.length > 0) {
          archiveWatcher = chokidar.watch(archive, WATCH_ARCHIVE_OPTIONS);
          archiveWatcher.on('all', onWatchEvent);
        }

        heartbeat = setInterval(() => {
          for (const res of sseClients) res.write(': ping\n\n');
        }, SSE_HEARTBEAT_MS);

        server.httpServer.on('close', () => {
          changeBroadcaster.dispose();
          if (heartbeat) clearInterval(heartbeat);
          void hotWatcher?.close();
          void archiveWatcher?.close();
          archiveCache.clear();
          for (const res of sseClients) res.end();
          sseClients.clear();
        });

        server.middlewares.use('/api/events', createEventsHandler(sseClients));
      }

      server.middlewares.use('/api/projects', createProjectsHandler(projects, latestRelease));
      server.middlewares.use('/api/plan', createPlanHandler(projects));
      server.middlewares.use('/api/active', createActiveHandler(projects));
      server.middlewares.use('/api/archive', createArchiveHandler(projects, archiveCache));
    },
  };
}

export default defineConfig({
  plugins: [react(), flowtronApi()],
  // Stamp DEV_CSP_NONCE onto Vite-injected <script>/<style> tags so the dev
  // CSP's script-src can omit 'unsafe-inline' (see DEV_CSP above).
  html: { cspNonce: DEV_CSP_NONCE },
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
    headers: {
      'Content-Security-Policy': DEV_CSP,
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: false,
    // Default 5000ms is too tight for userEvent-heavy App.test.tsx tests under
    // Node 26: the file runs ~26s in full-suite runs (vs ~340ms per test in
    // isolation), so parallel contention can push a single test past 5s and
    // flake the /ft-release viz gate. 15s leaves headroom while still catching
    // genuine hangs. See FE-053.
    testTimeout: 15_000,
  },
});
