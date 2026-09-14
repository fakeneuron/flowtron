export const readLocal = (key: string): string | null => {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
};

export const writeLocal = (key: string, value: string): void => {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* ignore quota / disabled storage */
  }
};
