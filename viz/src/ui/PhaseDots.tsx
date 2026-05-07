import React from 'react';
import { activePhaseIndex, type ChecklistCounts } from '../tasknote';

export const PhaseDots: React.FC<{ phases: ChecklistCounts[] }> = ({ phases }) => {
  const activeIdx = activePhaseIndex(phases);
  return (
    <div
      className="flex items-center gap-0.5"
      title={`Active phase: ${activeIdx + 1} of 4`}
      aria-label={`Phase ${activeIdx + 1} of 4 active`}
    >
      {phases.map((_, i) => {
        const filled = i < activeIdx;
        const active = i === activeIdx;
        const cls = filled
          ? 'bg-emerald-500'
          : active
            ? 'bg-amber-400 ring-1 ring-amber-200 dark:ring-amber-700'
            : 'bg-slate-200 dark:bg-slate-700';
        return <span key={i} className={`h-2 w-2 rounded-full ${cls}`} />;
      })}
    </div>
  );
};
