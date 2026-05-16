import React, { useEffect, useState } from 'react';
import { applyResolved, readPreference, writePreference, type ThemePreference } from './theme';

const NEXT: Record<ThemePreference, ThemePreference> = {
  light: 'dark',
  dark: 'light',
};

const LABEL: Record<ThemePreference, string> = {
  light: '☀️',
  dark: '🌙',
};

export const ThemeToggle: React.FC = () => {
  const [pref, setPref] = useState<ThemePreference>(() => readPreference());

  useEffect(() => {
    applyResolved(pref);
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
      className="rounded border border-slate-300 bg-white px-2 py-1.5 text-base shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:focus:ring-slate-500"
      aria-label={`Theme: ${pref}. Click to cycle.`}
      title={`Theme: ${pref} — click to cycle`}
    >
      {LABEL[pref]}
    </button>
  );
};
