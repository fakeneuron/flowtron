import React, { Suspense, lazy } from 'react';
import type { Task } from '../parser';
import { DENSITY_TOKENS } from './constants';
import { usePalette, useVisibilityPrefs } from './VisibilityContext';
import { useRowInteraction } from './RowInteractionContext';
import { highlightMatch } from './highlight';
import { useSearchQuery } from './SearchContext';
import { ErrorBoundary } from './ErrorBoundary';
import { ClosureDriftChip } from './ClosureDriftChip';

const TaskDetail = lazy(() => import('./TaskDetail'));

interface SubtaskRowProps {
  task: Task;
}

export const SubtaskRow: React.FC<SubtaskRowProps> = ({ task }) => {
  const { tasknotesById, expandedId, setExpandedId, highlightId, selectedId, navigateToTask } =
    useRowInteraction();
  const isSelected = selectedId === task.id;
  const query = useSearchQuery();
  const visibility = useVisibilityPrefs();
  const density = visibility.density;
  const palette = usePalette();
  const isExpandedDetail = expandedId === task.id;
  const tn = tasknotesById.get(task.id);
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
          className={`inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-xs border ${
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
          aria-label={`${task.completed ? 'Completed' : 'Incomplete'}: ${task.id} ${task.description}`}
          className="flex min-w-0 flex-1 items-center gap-2 rounded text-left focus:outline-hidden focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500"
        >
          <span className="font-mono text-sm font-medium text-slate-700 dark:text-slate-300">
            {highlightMatch(task.id, query)}
          </span>
          <span className="min-w-0 flex-1 truncate text-sm text-slate-600 dark:text-slate-400">
            {highlightMatch(task.description, query)}
          </span>
        </button>
        {tn?.closureDrift && <ClosureDriftChip drift={tn.closureDrift} />}
        {task.completed && task.completedDate && (
          <span className="text-xs text-slate-500 dark:text-slate-400">{task.completedDate}</span>
        )}
      </div>
      {isExpandedDetail && (
        <ErrorBoundary>
          <Suspense fallback={null}>
            <TaskDetail
              task={task}
              tasknote={tn}
              detailSections={visibility.detailSections}
              starterSections={visibility.starterSections}
              navigateToTask={navigateToTask}
              compact
            />
          </Suspense>
        </ErrorBoundary>
      )}
    </div>
  );
};
