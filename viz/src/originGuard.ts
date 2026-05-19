import type { IncomingMessage, ServerResponse } from 'node:http';

export const DEV_PORT = 5120;

export const ALLOWED_ORIGINS: ReadonlySet<string> = new Set([
  `http://localhost:${DEV_PORT}`,
  `http://127.0.0.1:${DEV_PORT}`,
]);

export const ALLOWED_HOSTNAMES: ReadonlySet<string> = new Set(['localhost', '127.0.0.1']);

// Reject cross-origin browser requests to the viz dev API. Tasknote and
// PLAN.md content is readable here; without this guard any website visited
// during `npm run dev` could fetch /api/* and exfiltrate it (compounded
// historically by esbuild GHSA-67mh-4wv8-2f99 / Vite GHSA-4w7w-66w2-5vf9).
// Returns true if the request should proceed; otherwise writes a 403 and
// returns false. Origin-less requests (terminal `curl`, EventSource
// fallbacks) are allowed — `server.allowedHosts` handles DNS-rebinding.
export function originGuard(req: IncomingMessage, res: ServerResponse): boolean {
  const origin = req.headers.origin;
  if (typeof origin === 'string' && origin.length > 0) {
    if (!ALLOWED_ORIGINS.has(origin)) {
      res.statusCode = 403;
      res.end('Forbidden: cross-origin request');
      return false;
    }
    return true;
  }
  const referer = req.headers.referer;
  if (typeof referer === 'string' && referer.length > 0) {
    try {
      const refHost = new URL(referer).hostname;
      if (!ALLOWED_HOSTNAMES.has(refHost)) {
        res.statusCode = 403;
        res.end('Forbidden: cross-origin referer');
        return false;
      }
    } catch {
      res.statusCode = 403;
      res.end('Forbidden: malformed referer');
      return false;
    }
  }
  return true;
}
