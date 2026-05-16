import React, { Suspense, lazy } from 'react';
import type { Task } from '../parser';
import type { Tasknote } from '../tasknote';
import type { VisibilityPrefs } from '../visibilityPrefs';
import { DENSITY_TOKENS } from './constants';
import { TaskRowInner } from './TaskRowInner';
import { rowOutlineClass } from './utils';

const TaskDetail = lazy(() => import('./TaskDetail'));

interface TaskRowProps {
  task: Task;
  tasknotesById: Map<string, Tasknote>;
  visibility: VisibilityPrefs;
  expandedId: string | null;
  setExpandedId: (id: string | null) => void;
  highlightId: string | null;
  isSelected: boolean;
  navigateToTask: (id: string) => void;
}

export const TaskRow: React.FC<TaskRowProps> = ({
  task,
  tasknotesById,
  visibility,
  expandedId,
  setExpandedId,
  highlightId,
  isSelected,
  navigateToTask,
}) => (
  <div
    id={`row-${task.id}`}
    className={`rounded border bg-white dark:bg-slate-900 ${rowOutlineClass(
      highlightId === task.id,
      isSelected,
    )} transition-colors`}
  >
    <div className={`flex items-center gap-2 ${DENSITY_TOKENS[visibility.density].rowPad} pl-9`}>
      <TaskRowInner
        task={task}
        tasknotesById={tasknotesById}
        rowChips={visibility.rowChips}
        density={visibility.density}
        isExpandedDetail={expandedId === task.id}
        onToggleDetail={() => setExpandedId(expandedId === task.id ? null : task.id)}
      />
    </div>
    {expandedId === task.id && (
      <Suspense fallback={null}>
        <TaskDetail
          task={task}
          tasknote={tasknotesById.get(task.id)}
          detailSections={visibility.detailSections}
          navigateToTask={navigateToTask}
        />
      </Suspense>
    )}
  </div>
);
