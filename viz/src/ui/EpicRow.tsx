import React, { Suspense, lazy } from 'react';
import type { TaskNode } from '../parser';
import type { Tasknote } from '../tasknote';
import type { VisibilityPrefs } from '../visibilityPrefs';
import { Chevron } from './Chevron';
import { TaskRowInner } from './TaskRowInner';
import { SubtaskRow } from './SubtaskRow';
import { rowOutlineClass } from './utils';

const TaskDetail = lazy(() => import('./TaskDetail'));

interface EpicRowProps {
  node: TaskNode;
  tasknotesById: Map<string, Tasknote>;
  visibility: VisibilityPrefs;
  expandedId: string | null;
  setExpandedId: (id: string | null) => void;
  expanded: boolean;
  toggleExpanded: () => void;
  highlightId: string | null;
  isSelected: boolean;
  selectedId: string | null;
  navigateToTask: (id: string) => void;
}

export const EpicRow: React.FC<EpicRowProps> = ({
  node,
  tasknotesById,
  visibility,
  expandedId,
  setExpandedId,
  expanded,
  toggleExpanded,
  highlightId,
  isSelected,
  selectedId,
  navigateToTask,
}) => {
  const { task, children } = node;
  const done = children.filter((c) => c.completed).length;
  const total = children.length;
  return (
    <div
      id={`row-${task.id}`}
      className={`rounded border bg-white dark:bg-slate-900 ${rowOutlineClass(
        highlightId === task.id,
        isSelected,
      )} transition-colors`}
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
          rowChips={visibility.rowChips}
          isExpandedDetail={expandedId === task.id}
          onToggleDetail={() => setExpandedId(expandedId === task.id ? null : task.id)}
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
              isSelected={selectedId === c.id}
              navigateToTask={navigateToTask}
            />
          ))}
        </div>
      )}
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
};
