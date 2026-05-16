import React, { Suspense, lazy } from 'react';
import type { TaskNode } from '../parser';
import type { Tasknote } from '../tasknote';
import type { VisibilityPrefs } from '../visibilityPrefs';
import { Chevron } from './Chevron';
import { DENSITY_TOKENS } from './constants';
import { TaskRowInner } from './TaskRowInner';
import { SubtaskRow } from './SubtaskRow';
import { epicRowOutlineClass } from './utils';

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
  const density = visibility.density;
  const tokens = DENSITY_TOKENS[density];
  return (
    <div
      id={`row-${task.id}`}
      className={`relative rounded border-2 bg-slate-50 dark:bg-slate-800/50 ${epicRowOutlineClass(
        highlightId === task.id,
        isSelected,
      )} transition-colors`}
    >
      <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-0.5 rounded-l bg-slate-400 dark:bg-slate-500" />
      <div className={`flex items-center gap-2 ${tokens.rowPad} rounded transition-colors hover:bg-black/[0.03] dark:hover:bg-white/[0.03]`}>
        <button
          type="button"
          onClick={toggleExpanded}
          aria-expanded={expanded}
          aria-label={expanded ? 'Collapse subtasks' : 'Expand subtasks'}
          className="flex h-5 w-5 shrink-0 items-center justify-center rounded hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:hover:bg-slate-800 dark:focus:ring-slate-500"
        >
          <Chevron expanded={expanded} />
        </button>
        <TaskRowInner
          task={task}
          tasknotesById={tasknotesById}
          rowChips={visibility.rowChips}
          density={density}
          isExpandedDetail={expandedId === task.id}
          onToggleDetail={() => setExpandedId(expandedId === task.id ? null : task.id)}
          extraRightSlot={
            total > 0 ? (
              <span
                className={`rounded-full bg-slate-100 ${tokens.chipPad} text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300`}
              >
                {done}/{total} done
              </span>
            ) : null
          }
        />
      </div>
      {total > 0 && (
        <div
          className={`grid transition-[grid-template-rows] duration-200 motion-reduce:transition-none ${
            expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
          }`}
        >
          <div className="overflow-hidden">
            <div
              className={`flex flex-col ${tokens.subtaskInterRowGap} ${tokens.subtaskContainerPad} border-t border-slate-100 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-950/50`}
            >
              {children.map((c) => (
                <SubtaskRow
                  key={c.id}
                  task={c}
                  tasknotesById={tasknotesById}
                  visibility={visibility}
                  expandedId={expandedId}
                  setExpandedId={setExpandedId}
                  highlightId={highlightId}
                  isSelected={selectedId === c.id}
                  navigateToTask={navigateToTask}
                />
              ))}
            </div>
          </div>
        </div>
      )}
      {expandedId === task.id && (
        <Suspense fallback={null}>
          <TaskDetail
            task={task}
            tasknote={tasknotesById.get(task.id)}
            detailSections={visibility.detailSections}
            starterSections={visibility.starterSections}
            navigateToTask={navigateToTask}
          />
        </Suspense>
      )}
    </div>
  );
};
