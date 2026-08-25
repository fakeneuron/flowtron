import React, { Suspense, lazy } from 'react';
import type { Task } from '../parser';
import { useVisibilityPrefs } from './VisibilityContext';
import { useRowInteraction } from './RowInteractionContext';
import { ErrorBoundary } from './ErrorBoundary';

const TaskDetail = lazy(() => import('./TaskDetail'));

interface TaskDetailPanelProps {
  task: Task;
  /** Tighter chrome for detail mounted under a subtask row. */
  compact?: boolean;
}

// The expandable-detail half of every row kind (TaskRow / SubtaskRow /
// EpicRow): the expanded-id check, the code-split `TaskDetail` import, and the
// boundary that contains a malformed tasknote's render error. Each row renders
// its own instance, so the boundary still isolates one row's detail rather
// than the board (FE-064).
export const TaskDetailPanel: React.FC<TaskDetailPanelProps> = ({ task, compact = false }) => {
  const { tasknotesById, expandedId, navigateToTask } = useRowInteraction();
  const visibility = useVisibilityPrefs();
  if (expandedId !== task.id) return null;
  return (
    <ErrorBoundary>
      <Suspense fallback={null}>
        <TaskDetail
          task={task}
          tasknote={tasknotesById.get(task.id)}
          detailSections={visibility.detailSections}
          starterSections={visibility.starterSections}
          navigateToTask={navigateToTask}
          compact={compact}
        />
      </Suspense>
    </ErrorBoundary>
  );
};
