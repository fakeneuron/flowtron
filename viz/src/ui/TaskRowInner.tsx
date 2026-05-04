import React from 'react';
import type { Task, TaskModel } from '../parser';
import type { Tasknote } from '../tasknote';
import { STATUS_BADGE, STATUS_LABEL } from './constants';
import { PhaseDots } from './PhaseDots';
import { SubtaskProgress } from './SubtaskProgress';
import { ModelChip } from './ModelChip';
import { RelatedChip } from './RelatedChip';
import { BlockerChip } from './BlockerChip';
import type { Priority } from '../parser';

const PRIORITY_BADGE: Record<Priority, string> = {
  Critical: 'bg-red-100 text-red-800',
  High: 'bg-orange-100 text-orange-800',
  Medium: 'bg-amber-100 text-amber-800',
  Low: 'bg-sky-100 text-sky-800',
  'Future Opportunities': 'bg-violet-100 text-violet-800',
  Completed: 'bg-emerald-100 text-emerald-800',
};

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
      <div className="flex shrink-0 items-center justify-end gap-1.5 min-w-[30rem]">
        {!tn &&
          !extraRightSlot &&
          task.blockedBy.length === 0 &&
          task.relatedTasks.length === 0 && (
            <span className="rounded-full border border-dashed border-slate-300 px-2 py-0.5 text-[10px] text-slate-400">
              no tasknote
            </span>
          )}
        {tn && fm?.status !== 'starter' && <PhaseDots phases={tn.phases} />}
        {tn && tn.subtasksProgress.total > 0 && (
          <SubtaskProgress counts={tn.subtasksProgress} />
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
        {task.blockedBy.length > 0 && (
          <div className="flex items-center gap-1">
            {task.blockedBy.map((id) => (
              <BlockerChip key={id} id={id} onClick={() => navigateToTask(id)} />
            ))}
          </div>
        )}
        {(fm ? fm.relatedTasks : task.relatedTasks).length > 0 && (
          <div className="flex items-center gap-1">
            {(fm ? fm.relatedTasks : task.relatedTasks).map((id) => (
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
        {fm && (
          <span
            className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${PRIORITY_BADGE[fm.priority]}`}
          >
            {fm.priority}
          </span>
        )}
        {task.completed && task.completedDate && (
          <span className="text-[10px] text-slate-500">{task.completedDate}</span>
        )}
        {extraRightSlot}
        {tn && (
          <a
            href={`vscode://file${tn.path}`}
            className="text-[10px] text-slate-500 hover:text-slate-800 hover:underline"
            title="Open tasknote in VS Code"
          >
            VS Code →
          </a>
        )}
      </div>
    </div>
  );
};
