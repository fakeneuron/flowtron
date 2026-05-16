export interface VisibilityPrefs {
  version: 1;
  rowChips: {
    tags: boolean;
    model: boolean;
    related: boolean;
    due: boolean;
  };
  detailSections: {
    goal: boolean;
    acceptance: boolean;
    subtasks: boolean;
  };
}

export const DEFAULT_PREFS: VisibilityPrefs = {
  version: 1,
  rowChips: { tags: false, model: true, related: false, due: false },
  detailSections: { goal: true, acceptance: true, subtasks: true },
};

const KEY_PREFIX = 'flowtron-viz-prefs:';

const storageKey = (project: string): string => `${KEY_PREFIX}${project}`;

const isBool = (v: unknown): v is boolean => typeof v === 'boolean';

const parsePrefs = (raw: string | null): VisibilityPrefs => {
  if (!raw) return DEFAULT_PREFS;
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return DEFAULT_PREFS;
  }
  if (!data || typeof data !== 'object') return DEFAULT_PREFS;
  const d = data as Record<string, unknown>;
  if (d.version !== 1) return DEFAULT_PREFS;
  const rc = d.rowChips as Record<string, unknown> | undefined;
  const ds = d.detailSections as Record<string, unknown> | undefined;
  if (!rc || !ds) return DEFAULT_PREFS;
  return {
    version: 1,
    rowChips: {
      tags: isBool(rc.tags) ? rc.tags : DEFAULT_PREFS.rowChips.tags,
      model: isBool(rc.model) ? rc.model : DEFAULT_PREFS.rowChips.model,
      related: isBool(rc.related) ? rc.related : DEFAULT_PREFS.rowChips.related,
      due: isBool(rc.due) ? rc.due : DEFAULT_PREFS.rowChips.due,
    },
    detailSections: {
      goal: isBool(ds.goal) ? ds.goal : DEFAULT_PREFS.detailSections.goal,
      acceptance: isBool(ds.acceptance) ? ds.acceptance : DEFAULT_PREFS.detailSections.acceptance,
      subtasks: isBool(ds.subtasks) ? ds.subtasks : DEFAULT_PREFS.detailSections.subtasks,
    },
  };
};

export const readVisibilityPrefs = (project: string): VisibilityPrefs => {
  try {
    return parsePrefs(window.localStorage.getItem(storageKey(project)));
  } catch {
    return DEFAULT_PREFS;
  }
};

export const writeVisibilityPrefs = (project: string, prefs: VisibilityPrefs): void => {
  try {
    window.localStorage.setItem(storageKey(project), JSON.stringify(prefs));
  } catch {
    /* ignore quota / disabled storage */
  }
};
