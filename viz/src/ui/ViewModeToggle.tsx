import React from 'react';
import { type ViewMode } from '../viewMode';

interface ViewModeToggleProps {
  viewMode: ViewMode;
  onViewModeChange: (next: ViewMode) => void;
}

export const ViewModeToggle: React.FC<ViewModeToggleProps> = ({ viewMode, onViewModeChange }) => (
  <div
    role="group"
    aria-label="View mode"
    className="inline-flex rounded border border-slate-300 bg-white shadow-xs dark:border-slate-700 dark:bg-slate-900"
  >
    {(['list', 'board'] as const).map((m, i) => {
      const active = viewMode === m;
      return (
        <button
          key={m}
          type="button"
          onClick={() => onViewModeChange(m)}
          aria-pressed={active}
          className={`${i === 0 ? 'rounded-l' : 'rounded-r'} px-3 py-1.5 text-base focus:outline-hidden focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500 ${
            active
              ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900'
              : 'hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800'
          }`}
        >
          {m === 'list' ? 'List' : 'Board'}
        </button>
      );
    })}
  </div>
);
