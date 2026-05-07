import React from 'react';
import type { Task } from '../parser';
import type { Tasknote } from '../tasknote';
import { TaskRowInner } from './TaskRowInner';
import { TaskDetail } from './TaskDetail';

interface TaskRowProps {
  task: Task;
  tasknotesById: Map<string, Tasknote>;
  inboundRefs: Map<string, Set<string>>;
  expandedId: string | null;
  setExpandedId: (id: string | null) => void;
  highlightId: string | null;
  isSelected: boolean;
  navigateToTask: (id: string) => void;
}

export const TaskRow: React.FC<TaskRowProps> = ({
  task,
  tasknotesById,
  inboundRefs,
  expandedId,
  setExpandedId,
  highlightId,
  isSelected,
  navigateToTask,
}) => (
  <div
    id={`row-${task.id}`}
    className={`rounded border bg-white dark:bg-slate-900 ${
      highlightId === task.id
        ? 'border-amber-400 ring-2 ring-amber-300 dark:border-amber-500 dark:ring-amber-600'
        : isSelected
          ? 'border-slate-200 ring-2 ring-sky-400 dark:border-slate-800 dark:ring-sky-600'
          : 'border-slate-200 dark:border-slate-800'
    } transition-colors`}
  >
    <div className="flex items-center gap-2 px-2.5 py-1.5 pl-9">
      <TaskRowInner
        task={task}
        tasknotesById={tasknotesById}
        inboundRefs={inboundRefs}
        isExpandedDetail={expandedId === task.id}
        onToggleDetail={() => setExpandedId(expandedId === task.id ? null : task.id)}
        navigateToTask={navigateToTask}
      />
    </div>
    {expandedId === task.id && (
      <TaskDetail
        task={task}
        tasknote={tasknotesById.get(task.id)}
        navigateToTask={navigateToTask}
      />
    )}
  </div>
);
