import React, { Suspense, lazy } from 'react';
import type { Task } from '../parser';
import type { Tasknote } from '../tasknote';
import type { VisibilityPrefs } from '../visibilityPrefs';
import { DENSITY_TOKENS } from './constants';
import { usePalette } from './VisibilityContext';

const TaskDetail = lazy(() => import('./TaskDetail'));

interface SubtaskRowProps {
  task: Task;
  tasknotesById: Map<string, Tasknote>;
  visibility: VisibilityPrefs;
  expandedId: string | null;
  setExpandedId: (id: string | null) => void;
  highlightId: string | null;
  isSelected: boolean;
  navigateToTask: (id: string) => void;
}

export const SubtaskRow: React.FC<SubtaskRowProps> = ({
  task,
  tasknotesById,
  visibility,
  expandedId,
  setExpandedId,
  highlightId,
  isSelected,
  navigateToTask,
}) => {
  const density = visibility.density;
  const palette = usePalette();
  const isExpandedDetail = expandedId === task.id;
  return (
    <div>
      <div
        id={`row-${task.id}`}
        className={`flex items-center gap-2 rounded ${DENSITY_TOKENS[density].subtaskRowPad} ${
          highlightId === task.id
            ? palette.ROW_HIGHLIGHT_SUBTASK
            : isSelected
              ? palette.ROW_SELECTION_SUBTASK
              : 'hover:bg-slate-100/70 dark:hover:bg-slate-700/30'
        } transition-colors`}
      >
        <span
          aria-hidden
          className={`inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-sm border ${
            task.completed
              ? 'border-emerald-500 bg-emerald-500 text-white'
              : 'border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-800'
          } text-xs`}
        >
          {task.completed ? '✓' : ''}
        </span>
        <button
          type="button"
          onClick={() => setExpandedId(isExpandedDetail ? null : task.id)}
          aria-expanded={isExpandedDetail}
          className="flex min-w-0 flex-1 items-center gap-2 rounded text-left focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500"
        >
          <span className="font-mono text-sm font-medium text-slate-700 dark:text-slate-300">
            {task.id}
          </span>
          <span className="min-w-0 flex-1 truncate text-sm text-slate-600 dark:text-slate-400">
            {task.description}
          </span>
        </button>
        {task.completed && task.completedDate && (
          <span className="text-xs text-slate-500 dark:text-slate-400">{task.completedDate}</span>
        )}
      </div>
      {isExpandedDetail && (
        <Suspense fallback={null}>
          <TaskDetail
            task={task}
            tasknote={tasknotesById.get(task.id)}
            detailSections={visibility.detailSections}
            starterSections={visibility.starterSections}
            navigateToTask={navigateToTask}
            compact
          />
        </Suspense>
      )}
    </div>
  );
};
