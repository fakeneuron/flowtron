import { beforeEach, describe, expect, it } from 'vitest';
import {
  DEFAULT_PREFS,
  readVisibilityPrefs,
  writeVisibilityPrefs,
  type VisibilityPrefs,
} from './visibilityPrefs';

describe('visibilityPrefs', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('returns DEFAULT_PREFS when no value is stored', () => {
    expect(readVisibilityPrefs('flowtron')).toEqual(DEFAULT_PREFS);
  });

  it('round-trips a written value', () => {
    const next: VisibilityPrefs = {
      version: 1,
      rowChips: { tags: true, model: false, related: true, due: false },
      detailSections: { goal: false, acceptance: true, subtasks: true },
      density: 'compact',
    };
    writeVisibilityPrefs('flowtron', next);
    expect(readVisibilityPrefs('flowtron')).toEqual(next);
  });

  it('isolates prefs across projects', () => {
    const a: VisibilityPrefs = {
      ...DEFAULT_PREFS,
      rowChips: { tags: true, model: false, related: false, due: false },
    };
    const b: VisibilityPrefs = {
      ...DEFAULT_PREFS,
      rowChips: { tags: false, model: true, related: true, due: false },
    };
    writeVisibilityPrefs('flowtron', a);
    writeVisibilityPrefs('fintown', b);
    expect(readVisibilityPrefs('flowtron').rowChips.tags).toBe(true);
    expect(readVisibilityPrefs('flowtron').rowChips.model).toBe(false);
    expect(readVisibilityPrefs('fintown').rowChips.tags).toBe(false);
    expect(readVisibilityPrefs('fintown').rowChips.related).toBe(true);
  });

  it('falls back to DEFAULT_PREFS on malformed JSON', () => {
    window.localStorage.setItem('flowtron-viz-prefs:flowtron', '{not json');
    expect(readVisibilityPrefs('flowtron')).toEqual(DEFAULT_PREFS);
  });

  it('falls back to DEFAULT_PREFS on unknown schema version', () => {
    window.localStorage.setItem(
      'flowtron-viz-prefs:flowtron',
      JSON.stringify({ version: 99, rowChips: {}, detailSections: {} }),
    );
    expect(readVisibilityPrefs('flowtron')).toEqual(DEFAULT_PREFS);
  });

  it('coerces missing booleans to defaults but preserves provided ones', () => {
    window.localStorage.setItem(
      'flowtron-viz-prefs:flowtron',
      JSON.stringify({
        version: 1,
        rowChips: { tags: true, model: false },
        detailSections: { goal: false },
      }),
    );
    const result = readVisibilityPrefs('flowtron');
    expect(result.rowChips.tags).toBe(true);
    expect(result.rowChips.model).toBe(false);
    expect(result.rowChips.related).toBe(DEFAULT_PREFS.rowChips.related);
    expect(result.detailSections.goal).toBe(false);
    expect(result.detailSections.acceptance).toBe(true);
  });

  it('falls back density to "default" when the field is missing (v1 pre-density payload)', () => {
    window.localStorage.setItem(
      'flowtron-viz-prefs:flowtron',
      JSON.stringify({
        version: 1,
        rowChips: { tags: true, model: false, related: false, due: false },
        detailSections: { goal: true, acceptance: true, subtasks: true },
      }),
    );
    const result = readVisibilityPrefs('flowtron');
    expect(result.density).toBe('default');
    expect(result.rowChips.tags).toBe(true);
  });

  it('falls back density to "default" when the field is an unknown string', () => {
    window.localStorage.setItem(
      'flowtron-viz-prefs:flowtron',
      JSON.stringify({
        version: 1,
        rowChips: { tags: false, model: true, related: false, due: false },
        detailSections: { goal: true, acceptance: true, subtasks: true },
        density: 'super-dense',
      }),
    );
    expect(readVisibilityPrefs('flowtron').density).toBe('default');
  });

  it('isolates density across projects', () => {
    const a: VisibilityPrefs = { ...DEFAULT_PREFS, density: 'compact' };
    const b: VisibilityPrefs = { ...DEFAULT_PREFS, density: 'comfortable' };
    writeVisibilityPrefs('flowtron', a);
    writeVisibilityPrefs('fintown', b);
    expect(readVisibilityPrefs('flowtron').density).toBe('compact');
    expect(readVisibilityPrefs('fintown').density).toBe('comfortable');
  });
});
