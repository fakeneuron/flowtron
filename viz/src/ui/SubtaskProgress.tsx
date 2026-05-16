import React from 'react';
import type { ChecklistCounts } from '../tasknote';

export const SubtaskProgress: React.FC<{ counts: ChecklistCounts }> = ({ counts }) => {
  const pct = counts.total === 0 ? 0 : Math.round((counts.done / counts.total) * 100);
  return (
    <div
      className="flex items-center gap-1"
      title={`Subtasks: ${counts.done}/${counts.total}`}
      aria-label={`Subtasks ${counts.done} of ${counts.total} done`}
    >
      <div className="h-2 w-16 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
        <div
          className="h-full bg-sky-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-medium tabular-nums text-slate-600 dark:text-slate-400">
        {counts.done}/{counts.total}
      </span>
    </div>
  );
};
