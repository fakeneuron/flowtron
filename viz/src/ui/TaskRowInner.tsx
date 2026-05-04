import React from 'react';
import type { Task, TaskModel } from '../parser';
import type { Tasknote } from '../tasknote';
import { STATUS_BADGE, STATUS_LABEL } from './constants';
import { PhaseDots } from './PhaseDots';
import { SubtaskProgress } from './SubtaskProgress';
import { ModelChip } from './ModelChip';
import { RelatedChip } from './RelatedChip';
import { BlockerChip } from './BlockerChip';

export interface TaskRowInnerProps {
  task: Task;
  tasknotesById: Map<string, Tasknote>;
  isExpandedDetail: boolean;
  onToggleDetail: () => void;
  navigateToTask: (id: string) => void;
  extraRightSlot?: React.ReactNode;
}

export const TaskRowInner: React.FC<TaskRowInnerProps> = ({
  task,
  tasknotesById,
  isExpandedDetail,
  onToggleDetail,
  navigateToTask,
  extraRightSlot,
}) => {
  const tn = tasknotesById.get(task.id);
  const fm = tn?.frontmatter ?? null;
  const relatedTasks = fm ? fm.relatedTasks : task.relatedTasks;
  const showNoTasknote =
    !tn &&
    !extraRightSlot &&
    task.blockedBy.length === 0 &&
    task.relatedTasks.length === 0;
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
        <span className="min-w-0 flex-1 truncate text-xs text-slate-700">
          {task.shortname ?? fm?.title ?? task.description}
        </span>
      </button>
      <div className="grid shrink-0 grid-cols-[auto_auto] items-center gap-x-4">
        <div className="flex items-center justify-end gap-1.5">
          {tn && fm?.status !== 'starter' && <PhaseDots phases={tn.phases} />}
          {tn && tn.subtasksProgress.total > 0 && (
            <SubtaskProgress counts={tn.subtasksProgress} />
          )}
          {task.blockedBy.length > 0 && (
            <div className="flex items-center gap-1">
              {task.blockedBy.map((id) => (
                <BlockerChip key={id} id={id} onClick={() => navigateToTask(id)} />
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center justify-end gap-1.5">
          {showNoTasknote && (
            <span className="rounded-full border border-dashed border-slate-300 px-2 py-0.5 text-[10px] text-slate-400">
              no tasknote
            </span>
          )}
          {task.model && <ModelChip model={task.model as TaskModel} />}
          {fm && fm.tags.length > 0 && (
            <div className="flex items-center gap-1">
              {fm.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-700"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          {relatedTasks.length > 0 && (
            <div className="flex items-center gap-1">
              {relatedTasks.map((id) => (
                <RelatedChip key={id} id={id} onClick={() => navigateToTask(id)} />
              ))}
            </div>
          )}
          {fm?.due && (
            <span className="rounded-full bg-indigo-100 px-1.5 py-0.5 text-[10px] text-indigo-800">
              due {fm.due}
            </span>
          )}
          {fm ? (
            <span
              className={`rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide ${STATUS_BADGE[fm.status]}`}
            >
              {STATUS_LABEL[fm.status]}
            </span>
          ) : (
            tasknotesById.has(task.id) &&
            !task.completed && (
              <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-amber-800">
                In progress
              </span>
            )
          )}
          {extraRightSlot}
        </div>
      </div>
    </div>
  );
};
