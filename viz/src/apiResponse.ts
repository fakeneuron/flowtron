import type { ServerResponse } from 'node:http';

// Every /api/* error body is a short plain-text string. Declaring the type
// explicitly is what gives the X-Content-Type-Options: nosniff header set by
// applyApiHeaders something to pin — a typeless response leaves both the MIME
// type and the charset to client guesswork. Shared by devApi.ts and
// originGuard.ts (a leaf module, so the existing devApi → originGuard import
// direction stays acyclic).
export function endPlain(res: ServerResponse, status: number, body: string): void {
  res.statusCode = status;
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.end(body);
}
