import React from 'react';

interface Props {
  projects: string[];
  active: string | null;
  onSelect: (name: string) => void;
}

export const ProjectSelector: React.FC<Props> = ({ projects, active, onSelect }) => {
  if (projects.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="text-slate-500 dark:text-slate-400">Project:</span>
      {projects.map((name) => {
        const on = name === active;
        return (
          <button
            key={name}
            type="button"
            onClick={() => onSelect(name)}
            aria-pressed={on}
            aria-label={`Project: ${name}`}
            className={`rounded-full px-2 py-0.5 ${
              on
                ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            {name}
          </button>
        );
      })}
    </div>
  );
};
