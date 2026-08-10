import { describe, it, expect } from 'vitest';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { ALLOWED_ORIGINS, DEV_PORT, originGuard } from './originGuard';

interface FakeRes {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
  ended: boolean;
}

function makeReq(headers: Record<string, string | undefined>): IncomingMessage {
  return { headers } as unknown as IncomingMessage;
}

function makeRes(): { res: ServerResponse; state: FakeRes } {
  const state: FakeRes = { statusCode: 200, headers: {}, body: '', ended: false };
  const res = {
    get statusCode() {
      return state.statusCode;
    },
    set statusCode(code: number) {
      state.statusCode = code;
    },
    setHeader(name: string, value: string) {
      state.headers[name.toLowerCase()] = value;
    },
    end(body?: string) {
      if (typeof body === 'string') state.body = body;
      state.ended = true;
    },
  } as unknown as ServerResponse;
  return { res, state };
}

describe('originGuard', () => {
  it('allows requests with an allowed Origin header (localhost)', () => {
    const { res, state } = makeRes();
    const req = makeReq({ origin: `http://localhost:${DEV_PORT}` });

    expect(originGuard(req, res)).toBe(true);
    expect(state.ended).toBe(false);
    expect(state.statusCode).toBe(200);
  });

  it('allows requests with an allowed Origin header (127.0.0.1)', () => {
    const { res, state } = makeRes();
    const req = makeReq({ origin: `http://127.0.0.1:${DEV_PORT}` });

    expect(originGuard(req, res)).toBe(true);
    expect(state.ended).toBe(false);
  });

  it('blocks a cross-origin Origin with 403', () => {
    const { res, state } = makeRes();
    const req = makeReq({ origin: 'https://evil.example.com' });

    expect(originGuard(req, res)).toBe(false);
    expect(state.statusCode).toBe(403);
    expect(state.body).toBe('Forbidden: cross-origin request');
    expect(state.headers['content-type']).toBe('text/plain; charset=utf-8');
    expect(state.ended).toBe(true);
  });

  it('allows a same-origin Referer when Origin is absent', () => {
    const { res, state } = makeRes();
    const req = makeReq({ referer: `http://localhost:${DEV_PORT}/some/path` });

    expect(originGuard(req, res)).toBe(true);
    expect(state.ended).toBe(false);
    expect(state.statusCode).toBe(200);
  });

  it('blocks a same-hostname but wrong-port Referer with 403', () => {
    const { res, state } = makeRes();
    const req = makeReq({ referer: 'http://localhost:3000/some/path' });

    expect(originGuard(req, res)).toBe(false);
    expect(state.statusCode).toBe(403);
    expect(state.body).toBe('Forbidden: cross-origin referer');
    expect(state.headers['content-type']).toBe('text/plain; charset=utf-8');
    expect(state.ended).toBe(true);
  });

  it('blocks a cross-origin Referer with 403 when Origin is absent', () => {
    const { res, state } = makeRes();
    const req = makeReq({ referer: 'https://evil.example.com/some/path' });

    expect(originGuard(req, res)).toBe(false);
    expect(state.statusCode).toBe(403);
    expect(state.body).toBe('Forbidden: cross-origin referer');
    expect(state.headers['content-type']).toBe('text/plain; charset=utf-8');
    expect(state.ended).toBe(true);
  });

  it('passes through requests with neither Origin nor Referer (terminal curl, EventSource fallback)', () => {
    const { res, state } = makeRes();
    const req = makeReq({});

    expect(originGuard(req, res)).toBe(true);
    expect(state.ended).toBe(false);
    expect(state.statusCode).toBe(200);
  });

  it('blocks a malformed Referer with 403', () => {
    const { res, state } = makeRes();
    const req = makeReq({ referer: 'not a url' });

    expect(originGuard(req, res)).toBe(false);
    expect(state.statusCode).toBe(403);
    expect(state.body).toBe('Forbidden: malformed referer');
    expect(state.headers['content-type']).toBe('text/plain; charset=utf-8');
    expect(state.ended).toBe(true);
  });

  it('exposes the loopback allowlist with exactly two entries', () => {
    expect(ALLOWED_ORIGINS.has(`http://localhost:${DEV_PORT}`)).toBe(true);
    expect(ALLOWED_ORIGINS.has(`http://127.0.0.1:${DEV_PORT}`)).toBe(true);
    expect(ALLOWED_ORIGINS.size).toBe(2);
  });
});
