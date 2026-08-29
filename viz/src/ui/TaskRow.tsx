import React from 'react';
import type { Task } from '../parser';
import { DENSITY_TOKENS } from './constants';
import { usePalette, useVisibilityPrefs } from './VisibilityContext';
import { useRowInteraction } from './RowInteractionContext';
import { TaskRowInner } from './TaskRowInner';
import { TaskDetailPanel } from './TaskDetailPanel';
import { rowOutlineClass } from './utils';

interface TaskRowProps {
  task: Task;
}

export const TaskRow = React.memo(function TaskRow({ task }: TaskRowProps) {
  const { expandedId, setExpandedId, highlightId, selectedId } = useRowInteraction();
  const isSelected = selectedId === task.id;
  const visibility = useVisibilityPrefs();
  const palette = usePalette();
  return (
  <div
    id={`row-${task.id}`}
    className={`rounded border bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800/60 ${rowOutlineClass(
      palette,
      highlightId === task.id,
      isSelected,
      'task',
    )} transition-colors`}
  >
    <div className={`flex items-center gap-2 ${DENSITY_TOKENS[visibility.density].rowPad} pl-9`}>
      <TaskRowInner
        task={task}
        isExpandedDetail={expandedId === task.id}
        onToggleDetail={() => setExpandedId(expandedId === task.id ? null : task.id)}
      />
    </div>
    <TaskDetailPanel task={task} />
  </div>
  );
});
