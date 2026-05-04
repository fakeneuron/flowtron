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
      <div className="h-1.5 w-12 overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full bg-sky-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[10px] tabular-nums text-slate-500">
        {counts.done}/{counts.total}
      </span>
    </div>
  );
};
