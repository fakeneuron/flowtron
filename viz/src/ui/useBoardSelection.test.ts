import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { useBoardSelection } from './useBoardSelection';
import type { Priority, Task } from '../parser';

const task = (id: string, priority: Priority, completed = false): Task => ({
  id,
  description: `desc ${id}`,
  priority,
  critical: false,
  unattended: false,
  completed,
  relatedTasks: [],
  blockedBy: [],
});

// CORE-1.1 resolves to parent epic CORE-EPIC-1 (parser.getSubtaskParentEpicId).
const TASKS: Task[] = [
  task('CORE-EPIC-1', 'Medium'),
  task('CORE-1.1', 'Medium'),
  task('CORE-900', 'Low'),
  task('CORE-901', 'Medium', true), // renders under Completed, collapsed by default
];

// navigateToTask sequences scroll + highlight inside requestAnimationFrame,
// then a setTimeout(HIGHLIGHT_MS = 1500). Real timers throughout, matching
// App.test.tsx's navigateToTask block — fake timers there coupled the assertion
// to wall-clock and flaked under parallel jsdom contention (FE-045 / FE-053).
const mountRow = (id: string): HTMLElement => {
  const el = document.createElement('div');
  el.id = `row-${id}`;
  document.body.appendChild(el);
  return el;
};

afterEach(() => {
  cleanup();
  document.body.innerHTML = '';
  vi.restoreAllMocks();
});

describe('useBoardSelection — initial state', () => {
  it('starts with Completed collapsed and nothing expanded, selected, or highlighted', () => {
    const { result } = renderHook(() => useBoardSelection(TASKS));
    expect([...result.current.collapsedSections]).toEqual(['Completed']);
    expect(result.current.expandedEpicIds.size).toBe(0);
    expect(result.current.expandedId).toBeNull();
    expect(result.current.selectedId).toBeNull();
    expect(result.current.highlightId).toBeNull();
  });
});

describe('useBoardSelection — navigateToTask', () => {
  it('expands the parent epic of a subtask target', async () => {
    mountRow('CORE-1.1');
    const { result } = renderHook(() => useBoardSelection(TASKS));
    act(() => result.current.navigateToTask('CORE-1.1'));
    expect(result.current.expandedEpicIds.has('CORE-EPIC-1')).toBe(true);
  });

  it('uncollapses the target’s section when the target is a collapsed completed task', () => {
    mountRow('CORE-901');
    const { result } = renderHook(() => useBoardSelection(TASKS));
    expect(result.current.collapsedSections.has('Completed')).toBe(true);
    act(() => result.current.navigateToTask('CORE-901'));
    expect(result.current.collapsedSections.has('Completed')).toBe(false);
  });

  it('scrolls the row into view, sets the highlight, then clears it after HIGHLIGHT_MS', async () => {
    const scrollSpy = vi.spyOn(Element.prototype, 'scrollIntoView').mockImplementation(() => {});
    mountRow('CORE-900');
    const { result } = renderHook(() => useBoardSelection(TASKS));
    act(() => result.current.navigateToTask('CORE-900'));

    await waitFor(() => expect(result.current.highlightId).toBe('CORE-900'));
    expect(scrollSpy).toHaveBeenCalled();
    await waitFor(() => expect(result.current.highlightId).toBeNull(), { timeout: 4000 });
  });

  it('sets no highlight when the target row is not in the DOM', async () => {
    const { result } = renderHook(() => useBoardSelection(TASKS));
    act(() => result.current.navigateToTask('CORE-900'));
    await new Promise((r) => requestAnimationFrame(() => r(null)));
    expect(result.current.highlightId).toBeNull();
  });

  it('leaves collapse and epic state untouched for an id that is not in tasks', () => {
    const { result } = renderHook(() => useBoardSelection(TASKS));
    act(() => result.current.navigateToTask('CORE-404'));
    expect(result.current.collapsedSections.has('Completed')).toBe(true);
    expect(result.current.expandedEpicIds.size).toBe(0);
  });

  it('does not leave a highlight timer running past unmount', async () => {
    const clearSpy = vi.spyOn(globalThis, 'clearTimeout');
    mountRow('CORE-900');
    const { result, unmount } = renderHook(() => useBoardSelection(TASKS));
    act(() => result.current.navigateToTask('CORE-900'));
    await waitFor(() => expect(result.current.highlightId).toBe('CORE-900'));
    const before = clearSpy.mock.calls.length;
    unmount();
    // The unmount cleanup clears the pending HIGHLIGHT_MS timer; without it the
    // setHighlightId(null) would fire against an unmounted hook.
    expect(clearSpy.mock.calls.length).toBeGreaterThan(before);
  });
});

describe('useBoardSelection — resetForProjectSwitch', () => {
  it('clears expansion, selection, and highlight and restores Completed collapsed', async () => {
    mountRow('CORE-901');
    const { result } = renderHook(() => useBoardSelection(TASKS));

    act(() => {
      result.current.setExpandedId('CORE-900');
      result.current.setSelectedId('CORE-900');
      result.current.toggleEpic('CORE-EPIC-1');
      result.current.toggleSection('Completed'); // uncollapse
    });
    act(() => result.current.navigateToTask('CORE-901'));
    await waitFor(() => expect(result.current.highlightId).toBe('CORE-901'));

    act(() => result.current.resetForProjectSwitch());

    expect(result.current.expandedId).toBeNull();
    expect(result.current.selectedId).toBeNull();
    expect(result.current.expandedEpicIds.size).toBe(0);
    expect([...result.current.collapsedSections]).toEqual(['Completed']);
    expect(result.current.highlightId).toBeNull();
  });

  it('keeps a stable identity across renders so consumers do not re-fire', () => {
    const { result, rerender } = renderHook(() => useBoardSelection(TASKS));
    const first = result.current.resetForProjectSwitch;
    rerender();
    expect(result.current.resetForProjectSwitch).toBe(first);
  });
});
