import React from 'react';
import type { Task } from '../parser';

interface SubtaskRowProps {
  task: Task;
  highlightId: string | null;
  isSelected: boolean;
  navigateToTask: (id: string) => void;
}

export const SubtaskRow: React.FC<SubtaskRowProps> = ({
  task,
  highlightId,
  isSelected,
  navigateToTask,
}) => (
  <div
    id={`row-${task.id}`}
    className={`flex items-center gap-2 rounded px-2 py-1 ${
      highlightId === task.id
        ? 'bg-amber-100 ring-1 ring-amber-300 dark:bg-amber-900/30 dark:ring-amber-700'
        : isSelected
          ? 'ring-1 ring-sky-400 dark:ring-sky-600'
          : ''
    } transition-colors`}
  >
    <span
      aria-hidden
      className={`inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-sm border ${
        task.completed
          ? 'border-emerald-500 bg-emerald-500 text-white'
          : 'border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-800'
      } text-[9px]`}
    >
      {task.completed ? '✓' : ''}
    </span>
    <button
      type="button"
      onClick={() => navigateToTask(task.id)}
      className="font-mono text-[11px] font-medium text-slate-700 hover:underline dark:text-slate-300"
    >
      {task.id}
    </button>
    <span className="flex-1 truncate text-[11px] text-slate-600 dark:text-slate-400">
      {task.description}
    </span>
    {task.completed && task.completedDate && (
      <span className="text-[10px] text-slate-400 dark:text-slate-500">{task.completedDate}</span>
    )}
  </div>
);
