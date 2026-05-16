import React from 'react';
import { DENSITY_TOKENS } from './constants';
import type { DensityMode } from '../visibilityPrefs';

interface SkeletonSectionProps {
  density: DensityMode;
  rows: number;
}

const SkeletonSection: React.FC<SkeletonSectionProps> = ({ density, rows }) => {
  const tokens = DENSITY_TOKENS[density];
  return (
    <div className="animate-pulse rounded-lg border border-slate-200 dark:border-slate-800">
      <div className="flex items-center gap-2 px-3 py-2">
        <div className="h-4 w-4 rounded bg-slate-200 dark:bg-slate-700" />
        <div className="h-4 w-24 rounded bg-slate-200 dark:bg-slate-700" />
        <div className="h-4 w-5 rounded bg-slate-200 dark:bg-slate-700" />
      </div>
      <div
        className={`flex flex-col ${tokens.interRowGap} border-t border-slate-200/70 bg-white/60 ${tokens.sectionInteriorPad} dark:border-slate-800/70 dark:bg-slate-900/60`}
      >
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className={`flex items-center gap-2 rounded ${tokens.rowPad}`}>
            <div className="h-3.5 w-16 rounded bg-slate-200 dark:bg-slate-700" />
            <div className="h-3.5 flex-1 rounded bg-slate-200 dark:bg-slate-700" />
            <div className="h-3.5 w-20 rounded bg-slate-200 dark:bg-slate-700" />
          </div>
        ))}
      </div>
    </div>
  );
};

interface LoadingSkeletonProps {
  density: DensityMode;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ density }) => {
  const tokens = DENSITY_TOKENS[density];
  return (
    <div className={`flex flex-col ${tokens.betweenSectionsGap}`}>
      <SkeletonSection density={density} rows={3} />
      <SkeletonSection density={density} rows={2} />
      <SkeletonSection density={density} rows={4} />
      <SkeletonSection density={density} rows={1} />
    </div>
  );
};
