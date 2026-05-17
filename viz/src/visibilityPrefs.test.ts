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
      rowChips: { id: false, tags: true, model: false, related: true, due: false },
      detailSections: { goal: false, acceptance: true, subtasks: true },
      starterSections: {
        whyExists: true,
        solutionShape: false,
        filesToTouch: true,
        outOfScope: false,
      },
      density: 'compact',
    };
    writeVisibilityPrefs('flowtron', next);
    expect(readVisibilityPrefs('flowtron')).toEqual(next);
  });

  it('isolates prefs across projects', () => {
    const a: VisibilityPrefs = {
      ...DEFAULT_PREFS,
      rowChips: { id: true, tags: true, model: false, related: false, due: false },
    };
    const b: VisibilityPrefs = {
      ...DEFAULT_PREFS,
      rowChips: { id: true, tags: false, model: true, related: true, due: false },
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
    expect(result.rowChips.id).toBe(DEFAULT_PREFS.rowChips.id);
    expect(result.detailSections.goal).toBe(false);
    expect(result.detailSections.acceptance).toBe(true);
  });

  it('falls back rowChips.id to true (default) on pre-id-toggle payloads', () => {
    window.localStorage.setItem(
      'flowtron-viz-prefs:flowtron',
      JSON.stringify({
        version: 1,
        rowChips: { tags: false, model: true, related: false, due: false },
        detailSections: { goal: true, acceptance: true, subtasks: true },
        density: 'default',
      }),
    );
    expect(readVisibilityPrefs('flowtron').rowChips.id).toBe(true);
  });

  it('preserves rowChips.id when explicitly stored as false', () => {
    window.localStorage.setItem(
      'flowtron-viz-prefs:flowtron',
      JSON.stringify({
        version: 1,
        rowChips: { id: false, tags: false, model: true, related: false, due: false },
        detailSections: { goal: true, acceptance: true, subtasks: true },
        density: 'default',
      }),
    );
    expect(readVisibilityPrefs('flowtron').rowChips.id).toBe(false);
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

  it('falls back starterSections to defaults when the field is missing (pre-starterSections payload)', () => {
    window.localStorage.setItem(
      'flowtron-viz-prefs:flowtron',
      JSON.stringify({
        version: 1,
        rowChips: { tags: true, model: false, related: false, due: false },
        detailSections: { goal: true, acceptance: true, subtasks: true },
        density: 'compact',
      }),
    );
    const result = readVisibilityPrefs('flowtron');
    expect(result.starterSections).toEqual(DEFAULT_PREFS.starterSections);
    expect(result.density).toBe('compact');
    expect(result.rowChips.tags).toBe(true);
  });

  it('coerces missing starterSections booleans to defaults but preserves provided ones', () => {
    window.localStorage.setItem(
      'flowtron-viz-prefs:flowtron',
      JSON.stringify({
        version: 1,
        rowChips: { tags: false, model: true, related: false, due: false },
        detailSections: { goal: true, acceptance: true, subtasks: true },
        starterSections: { whyExists: false, filesToTouch: false },
        density: 'default',
      }),
    );
    const result = readVisibilityPrefs('flowtron');
    expect(result.starterSections.whyExists).toBe(false);
    expect(result.starterSections.filesToTouch).toBe(false);
    expect(result.starterSections.solutionShape).toBe(DEFAULT_PREFS.starterSections.solutionShape);
    expect(result.starterSections.outOfScope).toBe(DEFAULT_PREFS.starterSections.outOfScope);
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
