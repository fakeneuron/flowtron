export type ThemePreference = 'light' | 'dark';

const STORAGE_KEY = 'theme';

export function readPreference(): ThemePreference {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {}
  // No stored pref: resolve the system preference, matching theme-init.js so
  // the mount-time applyResolved() doesn't strip the init script's dark class.
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function writePreference(pref: ThemePreference): void {
  try {
    localStorage.setItem(STORAGE_KEY, pref);
  } catch {}
}

export function applyResolved(pref: ThemePreference): 'light' | 'dark' {
  document.documentElement.classList.toggle('dark', pref === 'dark');
  return pref;
}
