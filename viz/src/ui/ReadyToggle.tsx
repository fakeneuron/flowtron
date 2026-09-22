import React from 'react';

interface ReadyToggleProps {
  active: boolean;
  onChange: (next: boolean) => void;
}

export const ReadyToggle: React.FC<ReadyToggleProps> = ({ active, onChange }) => (
  <button
    type="button"
    onClick={() => onChange(!active)}
    aria-pressed={active}
    title="Show only open rows whose blockers are all closed"
    className={`rounded border px-3 py-1.5 text-base shadow-xs focus:outline-hidden focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500 ${
      active
        ? 'border-slate-800 bg-slate-800 text-white dark:border-slate-200 dark:bg-slate-200 dark:text-slate-900'
        : 'border-slate-300 bg-white hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800'
    }`}
  >
    Ready
  </button>
);
