import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook, cleanup } from '@testing-library/react';
import { useKeyboardNav } from './useKeyboardNav';
import type { TasknoteStatus } from '../tasknote';

// Escape runs a four-rung precedence chain guarded by a dialog-open
// short-circuit, and each rung consumes the keypress. Driving it through
// <App> means arranging real filter round-trips to reach the lower rungs,
// which is why the stale-expandedId rung went untested until CORE-425.2.
// These tests exercise the hook directly so every rung is one param away.

type Params = Parameters<typeof useKeyboardNav>[0];

const VISIBLE = ['CORE-001', 'CORE-002'];

const makeParams = (overrides: Partial<Params> = {}): Params => ({
  visibleIds: VISIBLE,
  epicIds: new Set<string>(),
  searchInputRef: { current: null },
  selectedId: null,
  setSelectedId: vi.fn(),
  expandedId: null,
  setExpandedId: vi.fn(),
  expandedEpicIds: new Set<string>(),
  toggleEpic: vi.fn(),
  query: '',
  setQuery: vi.fn(),
  statusFilter: new Set<TasknoteStatus>(),
  setStatusFilter: vi.fn(),
  load: vi.fn(),
  onOpenShortcuts: vi.fn(),
  ...overrides,
});

const mountSearchInput = (): HTMLInputElement => {
  const input = document.createElement('input');
  document.body.appendChild(input);
  return input;
};

const openDialog = (): HTMLDialogElement => {
  const dialog = document.createElement('dialog');
  dialog.setAttribute('open', '');
  document.body.appendChild(dialog);
  return dialog;
};

/** Dispatch Escape at `target` and report whether the handler consumed it. */
const pressEscape = (target: EventTarget = document.body): boolean => {
  const ev = new KeyboardEvent('keydown', {
    key: 'Escape',
    bubbles: true,
    cancelable: true,
  });
  target.dispatchEvent(ev);
  return ev.defaultPrevented;
};

afterEach(() => {
  cleanup();
  document.body.innerHTML = '';
});

describe('useKeyboardNav — Escape precedence chain', () => {
  it('rung 0: a dialog[open] short-circuits before any rung runs', () => {
    openDialog();
    const params = makeParams({ expandedId: 'CORE-001', query: 'core' });
    renderHook(() => useKeyboardNav(params));

    expect(pressEscape()).toBe(false);
    expect(params.setExpandedId).not.toHaveBeenCalled();
    expect(params.setQuery).not.toHaveBeenCalled();
  });

  it('rung 1: a visible expanded row collapses and consumes the keypress', () => {
    const params = makeParams({ expandedId: 'CORE-001', query: 'core' });
    renderHook(() => useKeyboardNav(params));

    expect(pressEscape()).toBe(true);
    expect(params.setExpandedId).toHaveBeenCalledWith(null);
    // Rung 1 wins outright — the filter rung must not also fire.
    expect(params.setQuery).not.toHaveBeenCalled();
    expect(params.setStatusFilter).not.toHaveBeenCalled();
  });

  it('rung 1 is skipped when expandedId is filtered out of visibleIds', () => {
    // The CORE-425.2 regression: expandedId survives a search that hides its
    // row, so Escape used to "collapse" an off-screen row — no visible change,
    // keypress eaten, search left in place.
    const params = makeParams({ expandedId: 'CORE-404', query: 'core' });
    renderHook(() => useKeyboardNav(params));

    expect(pressEscape()).toBe(true);
    expect(params.setExpandedId).not.toHaveBeenCalled();
    expect(params.setQuery).toHaveBeenCalledWith('');
    expect(params.setStatusFilter).toHaveBeenCalledWith(new Set());
  });

  it('rung 1 is skipped for a subtask whose parent epic is collapsed', () => {
    // visibleIds only carries subtask ids while the parent epic is expanded
    // (App.tsx), so collapsing the epic strands an expanded subtask the same way.
    const params = makeParams({
      visibleIds: ['CORE-EPIC-001'],
      expandedId: 'CORE-001.2',
      statusFilter: new Set<TasknoteStatus>(['in-progress']),
    });
    renderHook(() => useKeyboardNav(params));

    expect(pressEscape()).toBe(true);
    expect(params.setExpandedId).not.toHaveBeenCalled();
    expect(params.setStatusFilter).toHaveBeenCalledWith(new Set());
  });

  it('a stale expandedId alone falls all the way through without consuming', () => {
    // Nothing below it to do either — the keypress must reach the page rather
    // than be silently swallowed by invisible state.
    const params = makeParams({ expandedId: 'CORE-404' });
    renderHook(() => useKeyboardNav(params));

    expect(pressEscape()).toBe(false);
    expect(params.setExpandedId).not.toHaveBeenCalled();
    expect(params.setQuery).not.toHaveBeenCalled();
  });

  it('rung 2: with nothing expanded, Escape clears search and status filters', () => {
    const params = makeParams({
      query: 'core',
      statusFilter: new Set<TasknoteStatus>(['blocked']),
    });
    renderHook(() => useKeyboardNav(params));

    expect(pressEscape()).toBe(true);
    expect(params.setQuery).toHaveBeenCalledWith('');
    expect(params.setStatusFilter).toHaveBeenCalledWith(new Set());
  });

  it('rung 3: with nothing to clear, Escape in the search box blurs it', () => {
    const input = mountSearchInput();
    input.focus();
    const params = makeParams({ searchInputRef: { current: input } });
    renderHook(() => useKeyboardNav(params));

    expect(pressEscape(input)).toBe(true);
    expect(document.activeElement).not.toBe(input);
    expect(params.setQuery).not.toHaveBeenCalled();
  });

  it('rung 4: with no state to unwind, Escape is left alone', () => {
    const params = makeParams();
    renderHook(() => useKeyboardNav(params));

    expect(pressEscape()).toBe(false);
    expect(params.setExpandedId).not.toHaveBeenCalled();
    expect(params.setQuery).not.toHaveBeenCalled();
    expect(params.setStatusFilter).not.toHaveBeenCalled();
  });
});
