export const ACTIVE_PROJECT_KEY = 'flowtron-viz-active-project';

export const readStoredProject = (): string | null => {
  try {
    return window.localStorage.getItem(ACTIVE_PROJECT_KEY);
  } catch {
    return null;
  }
};

export const writeStoredProject = (name: string): void => {
  try {
    window.localStorage.setItem(ACTIVE_PROJECT_KEY, name);
  } catch {
    /* ignore quota / disabled storage */
  }
};
