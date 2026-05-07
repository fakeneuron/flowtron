export type ThemePreference = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'theme';
const MEDIA_QUERY = '(prefers-color-scheme: dark)';

export function readPreference(): ThemePreference {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {}
  return 'system';
}

export function writePreference(pref: ThemePreference): void {
  try {
    if (pref === 'system') localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, pref);
  } catch {}
}

export function resolvePreference(pref: ThemePreference): 'light' | 'dark' {
  if (pref === 'system') {
    return window.matchMedia(MEDIA_QUERY).matches ? 'dark' : 'light';
  }
  return pref;
}

export function applyResolved(pref: ThemePreference): 'light' | 'dark' {
  const resolved = resolvePreference(pref);
  document.documentElement.classList.toggle('dark', resolved === 'dark');
  return resolved;
}

export function subscribeSystem(cb: () => void): () => void {
  const mql = window.matchMedia(MEDIA_QUERY);
  mql.addEventListener('change', cb);
  return () => mql.removeEventListener('change', cb);
}
