import { beforeEach, describe, expect, it } from 'vitest';
import {
  VIEW_MODE_KEY,
  readStoredViewMode,
  writeStoredViewMode,
} from './viewMode';

describe('viewMode', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('returns "list" when no value is stored', () => {
    expect(readStoredViewMode()).toBe('list');
  });

  it('round-trips "board"', () => {
    writeStoredViewMode('board');
    expect(readStoredViewMode()).toBe('board');
  });

  it('round-trips "list"', () => {
    writeStoredViewMode('board');
    writeStoredViewMode('list');
    expect(readStoredViewMode()).toBe('list');
  });

  it('falls back to "list" on unknown stored string', () => {
    window.localStorage.setItem(VIEW_MODE_KEY, 'kanban');
    expect(readStoredViewMode()).toBe('list');
  });

  it('falls back to "list" after the key is cleared', () => {
    writeStoredViewMode('board');
    window.localStorage.removeItem(VIEW_MODE_KEY);
    expect(readStoredViewMode()).toBe('list');
  });
});
