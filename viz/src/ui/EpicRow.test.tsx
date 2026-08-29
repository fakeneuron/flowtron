import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import { DEFAULT_PREFS } from '../visibilityPrefs';
import type { Task, TaskNode } from '../parser';
import { RowInteractionProvider } from './RowInteractionContext';
import { SearchProvider } from './SearchContext';
import { VisibilityProvider } from './VisibilityContext';
import { EpicRow } from './EpicRow';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const rowInteraction = {
  tasknotesById: new Map(),
  expandedId: null,
  setExpandedId: () => {},
  expandedEpicIds: new Set<string>(),
  toggleEpic: () => {},
  highlightId: null,
  selectedId: null,
  navigateToTask: () => {},
};

const epicTask: Task = {
  id: 'CORE-EPIC-1',
  description: 'epic',
  priority: 'Medium',
  critical: false,
  unattended: false,
  completed: false,
  relatedTasks: [],
  blockedBy: [],
};

const node: TaskNode = { task: epicTask, children: [] };

function Providers({ children }: { children: React.ReactNode }) {
  return (
    <VisibilityProvider value={DEFAULT_PREFS}>
      <SearchProvider value="">
        <RowInteractionProvider value={rowInteraction}>{children}</RowInteractionProvider>
      </SearchProvider>
    </VisibilityProvider>
  );
}

// React.memo's `.type` (the wrapped render function) isn't part of the
// `NamedExoticComponent` type TS infers for a plain function argument, and
// even where it is (`MemoExoticComponent`) it's `readonly` — vi.spyOn's
// generic constraint rejects both, though it's a plain mutable property at
// runtime. Cast directly to the shape spyOn needs.
function spyOnRender<P>(component: React.NamedExoticComponent<P>) {
  return vi.spyOn(component as unknown as { type: (props: P) => React.ReactNode }, 'type');
}

// FE-101.4: mirrors the TaskRow memo-bail tests. EpicRow's `node` prop must
// come from a stabilized pruneMatchingNodes (taskView.test.ts covers that
// separately) — here we only assert the memo wrapper itself bails when its
// own props (node, expanded, onToggleExpanded) are unchanged. Spying on
// `EpicRow.type` (the memo wrapper's inner render function) counts actual
// invocations directly — Profiler's onRender still fires on a commit even
// when every child bails via memo, so it can't tell a bail from a re-render.
describe('EpicRow', () => {
  it('does not re-render when props are unchanged', () => {
    const spy = spyOnRender(EpicRow);
    const toggle = () => {};
    function Harness({ n }: { n: number }) {
      return (
        <Providers>
          <EpicRow node={node} expanded={false} onToggleExpanded={toggle} />
          <span>{n}</span>
        </Providers>
      );
    }
    const { rerender } = render(<Harness n={0} />);
    expect(spy).toHaveBeenCalledTimes(1);

    rerender(<Harness n={1} />);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('re-renders when the node prop reference changes', () => {
    const spy = spyOnRender(EpicRow);
    const toggle = () => {};
    function Harness({ n }: { n: TaskNode }) {
      return (
        <Providers>
          <EpicRow node={n} expanded={false} onToggleExpanded={toggle} />
        </Providers>
      );
    }
    const { rerender } = render(<Harness n={node} />);
    expect(spy).toHaveBeenCalledTimes(1);

    rerender(<Harness n={{ ...node }} />);
    expect(spy).toHaveBeenCalledTimes(2);
  });
});
