import { describe, expect, it } from 'vitest';
import { splitHighlight } from './utils';

describe('splitHighlight', () => {
  it('returns single unmatched segment when query is empty', () => {
    expect(splitHighlight('hello', '')).toEqual([{ text: 'hello', matched: false }]);
  });

  it('returns single unmatched segment when query is only whitespace', () => {
    expect(splitHighlight('hello', '   ')).toEqual([{ text: 'hello', matched: false }]);
  });

  it('returns single matched segment when entire text matches', () => {
    expect(splitHighlight('core', 'core')).toEqual([{ text: 'core', matched: true }]);
  });

  it('is case-insensitive and preserves original text casing in output', () => {
    expect(splitHighlight('CORE-001', 'core')).toEqual([
      { text: 'CORE', matched: true },
      { text: '-001', matched: false },
    ]);
  });

  it('returns single unmatched segment when query not found', () => {
    expect(splitHighlight('hello', 'xyz')).toEqual([{ text: 'hello', matched: false }]);
  });

  it('highlights all occurrences', () => {
    expect(splitHighlight('abc-abc', 'abc')).toEqual([
      { text: 'abc', matched: true },
      { text: '-', matched: false },
      { text: 'abc', matched: true },
    ]);
  });

  it('handles match at the very end', () => {
    expect(splitHighlight('hello world', 'world')).toEqual([
      { text: 'hello ', matched: false },
      { text: 'world', matched: true },
    ]);
  });

  it('handles match at the very start', () => {
    expect(splitHighlight('FE-042 task', 'fe')).toEqual([
      { text: 'FE', matched: true },
      { text: '-042 task', matched: false },
    ]);
  });
});
