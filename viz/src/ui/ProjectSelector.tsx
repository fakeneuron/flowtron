import React from 'react';
import { versionCurrency } from './utils';

interface Props {
  projects: string[];
  active: string | null;
  onSelect: (name: string) => void;
  versions?: Record<string, string | null>;
  latestRelease?: string | null;
}

export const ProjectSelector: React.FC<Props> = ({
  projects,
  active,
  onSelect,
  versions,
  latestRelease,
}) => {
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
          const version = versions?.[name] ?? null;
          const currency = versionCurrency(version, latestRelease ?? null);
          const currencyLabel =
            currency === 'current'
              ? ` (flowtron up to date, ${version})`
              : currency === 'behind'
                ? ` (flowtron outdated: ${version}, latest ${latestRelease})`
                : '';
          return (
            <button
              key={name}
              type="button"
              onClick={() => onSelect(name)}
              aria-pressed={on}
              aria-label={`Project: ${name}${currencyLabel}`}
              title={currencyLabel ? currencyLabel.trim().replace(/^\(|\)$/g, '') : undefined}
              className={`${corner} ${divider} px-3 py-1.5 text-base focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500 ${
                on
                  ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900'
                  : 'hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              {currency !== 'unknown' && (
                <span
                  aria-hidden="true"
                  data-currency={currency}
                  className={`mr-1.5 inline-block h-2 w-2 rounded-full align-middle ${
                    currency === 'current' ? 'bg-emerald-500' : 'bg-red-500'
                  }`}
                />
              )}
              {name}
            </button>
          );
        })}
      </div>
    </div>
  );
};
