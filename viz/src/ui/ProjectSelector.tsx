import React from 'react';

interface Props {
  projects: string[];
  active: string | null;
  onSelect: (name: string) => void;
}

export const ProjectSelector: React.FC<Props> = ({ projects, active, onSelect }) => {
  if (projects.length === 0) return null;
  const last = projects.length - 1;
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-slate-500 dark:text-slate-400">Project:</span>
      <div
        role="group"
        aria-label="Project"
        className="inline-flex rounded border border-slate-300 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900"
      >
        {projects.map((name, i) => {
          const on = name === active;
          const corner = i === 0 ? 'rounded-l' : i === last ? 'rounded-r' : '';
          const divider = i > 0 ? 'border-l border-slate-300 dark:border-slate-700' : '';
          return (
            <button
              key={name}
              type="button"
              onClick={() => onSelect(name)}
              aria-pressed={on}
              aria-label={`Project: ${name}`}
              className={`${corner} ${divider} px-3 py-1.5 text-base focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500 ${
                on
                  ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900'
                  : 'hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              {name}
            </button>
          );
        })}
      </div>
    </div>
  );
};
