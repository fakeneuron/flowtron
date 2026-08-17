export type DensityMode = 'comfortable' | 'default' | 'compact';
export type PaletteName = 'default' | 'linear' | 'github';

export interface VisibilityPrefs {
  version: 2;
  rowChips: {
    id: boolean;
    tags: boolean;
    model: boolean;
    related: boolean;
    blocked: boolean;
    due: boolean;
  };
  detailSections: {
    goal: boolean;
    acceptance: boolean;
    subtasks: boolean;
  };
  starterSections: {
    whyExists: boolean;
    solutionShape: boolean;
    filesToTouch: boolean;
    outOfScope: boolean;
  };
  density: DensityMode;
  palette: PaletteName;
}

export const DEFAULT_PREFS: VisibilityPrefs = {
  version: 2,
  rowChips: { id: true, tags: false, model: true, related: false, blocked: false, due: false },
  detailSections: { goal: true, acceptance: true, subtasks: true },
  starterSections: {
    whyExists: true,
    solutionShape: true,
    filesToTouch: true,
    outOfScope: true,
  },
  density: 'default',
  palette: 'default',
};

const KEY_PREFIX = 'flowtron-viz-prefs:';

const storageKey = (project: string): string => `${KEY_PREFIX}${project}`;

const isBool = (v: unknown): v is boolean => typeof v === 'boolean';

const isDensity = (v: unknown): v is DensityMode =>
  v === 'comfortable' || v === 'default' || v === 'compact';

const isPalette = (v: unknown): v is PaletteName =>
  v === 'default' || v === 'linear' || v === 'github';

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
  if (d.version !== 1 && d.version !== 2) return DEFAULT_PREFS;
  const rc = d.rowChips as Record<string, unknown> | undefined;
  const ds = d.detailSections as Record<string, unknown> | undefined;
  if (!rc || !ds) return DEFAULT_PREFS;
  const ss = (d.starterSections as Record<string, unknown> | undefined) ?? {};
  return {
    version: 2,
    rowChips: {
      id: isBool(rc.id) ? rc.id : DEFAULT_PREFS.rowChips.id,
      tags: isBool(rc.tags) ? rc.tags : DEFAULT_PREFS.rowChips.tags,
      model: isBool(rc.model) ? rc.model : DEFAULT_PREFS.rowChips.model,
      related: isBool(rc.related) ? rc.related : DEFAULT_PREFS.rowChips.related,
      blocked: isBool(rc.blocked) ? rc.blocked : DEFAULT_PREFS.rowChips.blocked,
      due: isBool(rc.due) ? rc.due : DEFAULT_PREFS.rowChips.due,
    },
    detailSections: {
      goal: isBool(ds.goal) ? ds.goal : DEFAULT_PREFS.detailSections.goal,
      acceptance: isBool(ds.acceptance) ? ds.acceptance : DEFAULT_PREFS.detailSections.acceptance,
      subtasks: isBool(ds.subtasks) ? ds.subtasks : DEFAULT_PREFS.detailSections.subtasks,
    },
    starterSections: {
      whyExists: isBool(ss.whyExists) ? ss.whyExists : DEFAULT_PREFS.starterSections.whyExists,
      solutionShape: isBool(ss.solutionShape)
        ? ss.solutionShape
        : DEFAULT_PREFS.starterSections.solutionShape,
      filesToTouch: isBool(ss.filesToTouch)
        ? ss.filesToTouch
        : DEFAULT_PREFS.starterSections.filesToTouch,
      outOfScope: isBool(ss.outOfScope) ? ss.outOfScope : DEFAULT_PREFS.starterSections.outOfScope,
    },
    density: isDensity(d.density) ? d.density : DEFAULT_PREFS.density,
    palette: isPalette(d.palette) ? d.palette : DEFAULT_PREFS.palette,
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
