import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import { DEFAULT_PREFS } from '../visibilityPrefs';
import type { Task } from '../parser';
import { RowInteractionProvider } from './RowInteractionContext';
import { SearchProvider } from './SearchContext';
import { VisibilityProvider } from './VisibilityContext';
import { TaskRow } from './TaskRow';

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

const task: Task = {
  id: 'CORE-1',
  description: 'x',
  priority: 'Medium',
  critical: false,
  completed: false,
  relatedTasks: [],
  blockedBy: [],
};

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

// FE-101.4: React.memo(TaskRow) only pays off if a parent re-render (e.g. an
// unrelated search-query keystroke) doesn't force every mounted row through
// its own render function body. `TaskRow.type` is the memo wrapper's inner
// render function — spying on it counts actual invocations directly, unlike
// Profiler's onRender (which still fires on a commit even when every child
// bails via memo, so it can't distinguish a bail from a real re-render).
describe('TaskRow', () => {
  it('does not re-render when its task prop reference is unchanged', () => {
    const spy = spyOnRender(TaskRow);
    function Harness({ n }: { n: number }) {
      return (
        <Providers>
          <TaskRow task={task} />
          <span>{n}</span>
        </Providers>
      );
    }
    const { rerender } = render(<Harness n={0} />);
    expect(spy).toHaveBeenCalledTimes(1);

    rerender(<Harness n={1} />);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('re-renders when the task prop reference changes', () => {
    const spy = spyOnRender(TaskRow);
    function Harness({ t }: { t: Task }) {
      return (
        <Providers>
          <TaskRow task={t} />
        </Providers>
      );
    }
    const { rerender } = render(<Harness t={task} />);
    expect(spy).toHaveBeenCalledTimes(1);

    rerender(<Harness t={{ ...task }} />);
    expect(spy).toHaveBeenCalledTimes(2);
  });
});
