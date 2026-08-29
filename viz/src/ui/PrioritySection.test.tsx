import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import { DEFAULT_PREFS } from '../visibilityPrefs';
import type { Task, TaskNode } from '../parser';
import { RowInteractionProvider } from './RowInteractionContext';
import { SearchProvider } from './SearchContext';
import { VisibilityProvider } from './VisibilityContext';
import { PrioritySection } from './PrioritySection';

afterEach(cleanup);

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

const nodes: TaskNode[] = [{ task, children: [] }];

function renderSection(collapsed: boolean) {
  return render(
    <VisibilityProvider value={DEFAULT_PREFS}>
      <SearchProvider value="">
        <RowInteractionProvider value={rowInteraction}>
          <PrioritySection priority="Medium" nodes={nodes} collapsed={collapsed} onToggle={() => {}} />
        </RowInteractionProvider>
      </SearchProvider>
    </VisibilityProvider>,
  );
}

// FE-101.4: the whole point of the early-return is that a collapsed section
// mounts no row DOM at all, replacing the old CSS-only grid-rows collapse
// that kept every row (and its re-render cost) mounted regardless of state.
describe('PrioritySection', () => {
  it('mounts no row DOM when collapsed', () => {
    renderSection(true);
    expect(document.getElementById(`row-${task.id}`)).toBeNull();
  });

  it('mounts row DOM when expanded', () => {
    renderSection(false);
    expect(document.getElementById(`row-${task.id}`)).not.toBeNull();
  });

  it('still shows the section header and count while collapsed', () => {
    renderSection(true);
    expect(document.querySelector('button[aria-expanded="false"]')).not.toBeNull();
  });
});
