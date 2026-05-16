import React from 'react';
import type { Task } from '../parser';
import type { DensityMode } from '../visibilityPrefs';
import { DENSITY_TOKENS, ROW_HIGHLIGHT_SUBTASK, ROW_SELECTION_SUBTASK } from './constants';

interface SubtaskRowProps {
  task: Task;
  density: DensityMode;
  highlightId: string | null;
  isSelected: boolean;
  navigateToTask: (id: string) => void;
}

export const SubtaskRow: React.FC<SubtaskRowProps> = ({
  task,
  density,
  highlightId,
  isSelected,
  navigateToTask,
}) => (
  <div
    id={`row-${task.id}`}
    className={`flex items-center gap-2 rounded ${DENSITY_TOKENS[density].subtaskRowPad} ${
      highlightId === task.id
        ? ROW_HIGHLIGHT_SUBTASK
        : isSelected
          ? ROW_SELECTION_SUBTASK
          : ''
    } transition-colors`}
  >
    <span
      aria-hidden
      className={`inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-sm border ${
        task.completed
          ? 'border-emerald-500 bg-emerald-500 text-white'
          : 'border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-800'
      } text-[10px]`}
    >
      {task.completed ? '✓' : ''}
    </span>
    <button
      type="button"
      onClick={() => navigateToTask(task.id)}
      className="font-mono text-xs font-medium text-slate-700 hover:underline dark:text-slate-300"
    >
      {task.id}
    </button>
    <span className="flex-1 truncate text-xs text-slate-600 dark:text-slate-400">
      {task.description}
    </span>
    {task.completed && task.completedDate && (
      <span className="text-[10px] text-slate-500 dark:text-slate-400">{task.completedDate}</span>
    )}
  </div>
);
