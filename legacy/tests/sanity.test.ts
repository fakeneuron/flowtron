import { describe, expect, it } from 'vitest';
import { groupBy } from '../src/ui/utils';

describe('sanity', () => {
  it('true is true', () => {
    expect(true).toBe(true);
  });

  it('groupBy groups items by key', () => {
    const items = [
      { id: 1, cat: 'A' },
      { id: 2, cat: 'B' },
      { id: 3, cat: 'A' }
    ];
    const grouped = groupBy(items, (i) => i.cat);
    expect(Object.keys(grouped).sort()).toEqual(['A', 'B']);
    expect(grouped['A'].map((x) => x.id)).toEqual([1, 3]);
    expect(grouped['B'].map((x) => x.id)).toEqual([2]);
  });
});


