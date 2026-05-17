export type ViewMode = 'list' | 'board';

export const VIEW_MODE_KEY = 'flowtron-viz-view';

const DEFAULT_VIEW_MODE: ViewMode = 'list';

const isViewMode = (v: unknown): v is ViewMode => v === 'list' || v === 'board';

export const readStoredViewMode = (): ViewMode => {
  try {
    const raw = window.localStorage.getItem(VIEW_MODE_KEY);
    return isViewMode(raw) ? raw : DEFAULT_VIEW_MODE;
  } catch {
    return DEFAULT_VIEW_MODE;
  }
};

export const writeStoredViewMode = (mode: ViewMode): void => {
  try {
    window.localStorage.setItem(VIEW_MODE_KEY, mode);
  } catch {
    /* ignore quota / disabled storage */
  }
};
