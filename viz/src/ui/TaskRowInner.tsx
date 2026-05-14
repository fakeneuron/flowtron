import React from 'react';
import type { Task } from '../parser';
import type { Tasknote } from '../tasknote';
import { effectiveStatus } from './utils';
import { PhaseDots } from './PhaseDots';
import { SubtaskProgress } from './SubtaskProgress';
import { StatusChip } from './StatusChip';

export interface TaskRowInnerProps {
  task: Task;
  tasknotesById: Map<string, Tasknote>;
  isExpandedDetail: boolean;
  onToggleDetail: () => void;
  extraRightSlot?: React.ReactNode;
}

export const TaskRowInner: React.FC<TaskRowInnerProps> = ({
  task,
  tasknotesById,
  isExpandedDetail,
  onToggleDetail,
  extraRightSlot,
}) => {
  const tn = tasknotesById.get(task.id);
  const status = effectiveStatus(task, tn);
  return (
    <div className="flex min-w-0 flex-1 items-center gap-2">
      <button
        type="button"
        onClick={onToggleDetail}
        aria-expanded={isExpandedDetail}
        className="flex min-w-0 flex-1 items-center gap-2 text-left"
      >
        <span className="shrink-0 font-mono text-xs font-medium tabular-nums">
          {task.id}
        </span>
        <span className="min-w-0 flex-1 truncate text-xs text-slate-700 dark:text-slate-300">
          {task.shortname ?? tn?.frontmatter?.title ?? task.description}
        </span>
      </button>
      <div className="grid shrink-0 grid-cols-[auto_auto] items-center gap-x-4">
        <div className="flex items-center justify-end gap-1.5">
          {tn && status !== 'starter' && <PhaseDots phases={tn.phases} />}
          {tn && tn.subtasksProgress.total > 0 && (
            <SubtaskProgress counts={tn.subtasksProgress} />
          )}
        </div>
        <div className="flex items-center justify-end gap-1.5 text-[10px]">
          {status && <StatusChip status={status} />}
          {extraRightSlot}
        </div>
      </div>
    </div>
  );
};
