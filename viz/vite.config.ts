import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { readFile, readdir } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_DIR = resolve(__dirname, '..', '_project');
const PLAN_PATH = join(PROJECT_DIR, 'PLAN.md');
const TASKNOTE_DIR = join(PROJECT_DIR, 'tasknote');

function flowtronApi(): Plugin {
  return {
    name: 'flowtron-api',
    configureServer(server) {
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
          const ids = entries
            .filter((e) => e.isFile() && e.name.endsWith('.md'))
            .map((e) => e.name.replace(/\.md$/, ''));
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(ids));
        } catch (e) {
          res.statusCode = 500;
          res.end(`Failed to list tasknotes: ${(e as Error).message}`);
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), flowtronApi()],
});
