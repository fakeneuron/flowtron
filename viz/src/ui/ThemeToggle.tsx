import React, { useEffect, useState } from 'react';
import {
  applyResolved,
  readPreference,
  subscribeSystem,
  writePreference,
  type ThemePreference,
} from './theme';

const NEXT: Record<ThemePreference, ThemePreference> = {
  light: 'dark',
  dark: 'system',
  system: 'light',
};

const LABEL: Record<ThemePreference, string> = {
  light: '☀️ Light',
  dark: '🌙 Dark',
  system: '💻 System',
};

export const ThemeToggle: React.FC = () => {
  const [pref, setPref] = useState<ThemePreference>(() => readPreference());

  useEffect(() => {
    applyResolved(pref);
    if (pref !== 'system') return;
    return subscribeSystem(() => applyResolved('system'));
  }, [pref]);

  const cycle = () => {
    const next = NEXT[pref];
    writePreference(next);
    setPref(next);
  };

  return (
    <button
      type="button"
      onClick={cycle}
      className="rounded border border-slate-300 bg-white px-3 py-1.5 text-sm shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
      aria-label={`Theme: ${pref}. Click to cycle.`}
      title={`Theme: ${pref} — click to cycle`}
    >
      {LABEL[pref]}
    </button>
  );
};
