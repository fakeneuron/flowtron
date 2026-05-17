import React from 'react';
import type { Task } from '../parser';
import type { Tasknote } from '../tasknote';
import type { DensityMode, VisibilityPrefs } from '../visibilityPrefs';
import { effectiveStatus } from './utils';
import { DENSITY_TOKENS } from './constants';
import { PhaseDots } from './PhaseDots';
import { SubtaskProgress } from './SubtaskProgress';
import { StatusChip } from './StatusChip';
import { ModelChip } from './ModelChip';
import { RelatedChip } from './RelatedChip';

export interface TaskRowInnerProps {
  task: Task;
  tasknotesById: Map<string, Tasknote>;
  rowChips: VisibilityPrefs['rowChips'];
  density: DensityMode;
  isExpandedDetail: boolean;
  onToggleDetail: () => void;
  extraRightSlot?: React.ReactNode;
}

export const TaskRowInner: React.FC<TaskRowInnerProps> = ({
  task,
  tasknotesById,
  rowChips,
  density,
  isExpandedDetail,
  onToggleDetail,
  extraRightSlot,
}) => {
  const tn = tasknotesById.get(task.id);
  const status = effectiveStatus(task, tn);
  const tags = tn?.frontmatter?.tags ?? [];
  const due = tn?.frontmatter?.due;
  const showTags = rowChips.tags && tags.length > 0;
  const showModel = rowChips.model && !!task.model;
  const showRelated = rowChips.related && task.relatedTasks.length > 0;
  const showDue = rowChips.due && !!due;
  const showOptionalChips = showTags || showModel || showRelated || showDue;
  const chipPad = DENSITY_TOKENS[density].chipPad;
  return (
    <div className="flex min-w-0 flex-1 items-center gap-2">
      <button
        type="button"
        onClick={onToggleDetail}
        aria-expanded={isExpandedDetail}
        aria-label={rowChips.id ? undefined : `${task.id}: ${task.shortname ?? tn?.frontmatter?.title ?? task.description}`}
        className="flex min-w-0 flex-1 items-center gap-2 rounded text-left focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500"
      >
        {rowChips.id && (
          <span className="shrink-0 font-mono text-sm font-medium tabular-nums">
            {task.id}
          </span>
        )}
        <span className="min-w-0 flex-1 truncate text-sm text-slate-700 dark:text-slate-300">
          {task.shortname ?? tn?.frontmatter?.title ?? task.description}
        </span>
      </button>
      <div className="grid shrink-0 grid-cols-[auto_auto_auto] items-center gap-x-4">
        <div className="flex items-center justify-end gap-1.5">
          {tn && status !== 'starter' && <PhaseDots phases={tn.phases} />}
          {tn && tn.subtasksProgress.total > 0 && (
            <SubtaskProgress counts={tn.subtasksProgress} />
          )}
        </div>
        {showOptionalChips ? (
          <div className="flex items-center justify-end gap-1.5">
            {showTags &&
              tags.map((t) => (
                <span
                  key={t}
                  className={`rounded bg-slate-100 ${chipPad} text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-300`}
                >
                  {t}
                </span>
              ))}
            {showModel && task.model && <ModelChip model={task.model} density={density} />}
            {showRelated && <RelatedChip ids={task.relatedTasks} density={density} />}
            {showDue && due && (
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Due {due}
              </span>
            )}
          </div>
        ) : (
          <div />
        )}
        <div className="flex items-center justify-end gap-1.5 text-xs">
          {status && <StatusChip status={status} density={density} />}
          {extraRightSlot}
        </div>
      </div>
    </div>
  );
};
