import { render, type RenderResult } from '@testing-library/react';
import React from 'react';
import { vi } from 'vitest';
import { App } from '../ui/App';
import type { Tasknote } from '../tasknote';

export interface FetchSeed {
  plan: string;
  active?: Tasknote[];
  archive?: Tasknote[];
  projects?: string[];
}

export function makeTasknote(partial: Partial<Tasknote> & Pick<Tasknote, 'id'>): Tasknote {
  return {
    id: partial.id,
    path: partial.path ?? `/_project/tasknote/${partial.id}.md`,
    frontmatter: partial.frontmatter ?? {
      title: partial.id,
      status: 'in-progress',
      tags: [],
      created: '2026-05-07',
      relatedTasks: [],
    },
    body: partial.body ?? '',
    goal: partial.goal ?? '',
    acceptance: partial.acceptance ?? '',
    subtasks: partial.subtasks ?? '',
    starterContext: partial.starterContext ?? '',
    subtasksProgress: partial.subtasksProgress ?? { total: 0, done: 0 },
    phases: partial.phases ?? [
      { total: 0, done: 0 },
      { total: 0, done: 0 },
      { total: 0, done: 0 },
      { total: 0, done: 0 },
    ],
  };
}

export function seedFetch(seed: FetchSeed): void {
  const active = seed.active ?? [];
  const archive = seed.archive ?? [];
  const projects = (seed.projects ?? ['flowtron']).map((name) => ({ name }));
  const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
    const raw = typeof input === 'string' ? input : input.toString();
    const path = raw.split('?')[0];
    if (path.endsWith('/api/projects')) {
      return new Response(JSON.stringify(projects), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    if (path.endsWith('/api/plan')) {
      return new Response(seed.plan, {
        status: 200,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      });
    }
    if (path.endsWith('/api/active')) {
      return new Response(JSON.stringify(active), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    if (path.endsWith('/api/archive')) {
      return new Response(JSON.stringify(archive), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return new Response('not found', { status: 404 });
  });
  globalThis.fetch = fetchMock as unknown as typeof globalThis.fetch;
}

export function renderApp(seed: FetchSeed): RenderResult {
  seedFetch(seed);
  return render(React.createElement(App));
}
