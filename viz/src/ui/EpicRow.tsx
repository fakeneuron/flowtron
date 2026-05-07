import React from 'react';
import type { TaskNode } from '../parser';
import type { Tasknote } from '../tasknote';
import { Chevron } from './Chevron';
import { TaskRowInner } from './TaskRowInner';
import { SubtaskRow } from './SubtaskRow';
import { TaskDetail } from './TaskDetail';

interface EpicRowProps {
  node: TaskNode;
  tasknotesById: Map<string, Tasknote>;
  expandedId: string | null;
  setExpandedId: (id: string | null) => void;
  expanded: boolean;
  toggleExpanded: () => void;
  highlightId: string | null;
  navigateToTask: (id: string) => void;
}

export const EpicRow: React.FC<EpicRowProps> = ({
  node,
  tasknotesById,
  expandedId,
  setExpandedId,
  expanded,
  toggleExpanded,
  highlightId,
  navigateToTask,
}) => {
  const { task, children } = node;
  const done = children.filter((c) => c.completed).length;
  const total = children.length;
  return (
    <div
      id={`row-${task.id}`}
      className={`rounded border bg-white dark:bg-slate-900 ${
        highlightId === task.id
          ? 'border-amber-400 ring-2 ring-amber-300 dark:border-amber-500 dark:ring-amber-600'
          : 'border-slate-200 dark:border-slate-800'
      } transition-colors`}
    >
      <div className="flex items-center gap-2 px-2.5 py-1.5">
        <button
          type="button"
          onClick={toggleExpanded}
          aria-expanded={expanded}
          aria-label={expanded ? 'Collapse subtasks' : 'Expand subtasks'}
          className="flex h-5 w-5 shrink-0 items-center justify-center rounded hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <Chevron expanded={expanded} />
        </button>
        <TaskRowInner
          task={task}
          tasknotesById={tasknotesById}
          isExpandedDetail={expandedId === task.id}
          onToggleDetail={() => setExpandedId(expandedId === task.id ? null : task.id)}
          navigateToTask={navigateToTask}
          extraRightSlot={
            total > 0 ? (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                {done}/{total} done
              </span>
            ) : null
          }
        />
      </div>
      {expanded && total > 0 && (
        <div className="flex flex-col gap-1 border-t border-slate-100 bg-slate-50/50 px-2 py-1.5 dark:border-slate-800 dark:bg-slate-950/50">
          {children.map((c) => (
            <SubtaskRow
              key={c.id}
              task={c}
              highlightId={highlightId}
              navigateToTask={navigateToTask}
            />
          ))}
        </div>
      )}
      {expandedId === task.id && (
        <TaskDetail
          task={task}
          tasknote={tasknotesById.get(task.id)}
          navigateToTask={navigateToTask}
        />
      )}
    </div>
  );
};
