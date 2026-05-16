import React from 'react';
import { isEpic, type Priority, type TaskNode } from '../parser';
import type { Tasknote } from '../tasknote';
import type { VisibilityPrefs } from '../visibilityPrefs';
import { Chevron } from './Chevron';
import { DENSITY_TOKENS, SECTION_TINT } from './constants';
import { EpicRow } from './EpicRow';
import { TaskRow } from './TaskRow';

interface PrioritySectionProps {
  priority: Priority;
  nodes: TaskNode[];
  collapsed: boolean;
  onToggle: () => void;
  tasknotesById: Map<string, Tasknote>;
  visibility: VisibilityPrefs;
  expandedId: string | null;
  setExpandedId: (id: string | null) => void;
  expandedEpicIds: Set<string>;
  toggleEpic: (id: string) => void;
  highlightId: string | null;
  selectedId: string | null;
  navigateToTask: (id: string) => void;
}

export const PrioritySection: React.FC<PrioritySectionProps> = ({
  priority,
  nodes,
  collapsed,
  onToggle,
  tasknotesById,
  visibility,
  expandedId,
  setExpandedId,
  expandedEpicIds,
  toggleEpic,
  highlightId,
  selectedId,
  navigateToTask,
}) => {
  const totalCount = nodes.reduce((s, n) => s + 1 + n.children.length, 0);
  const tokens = DENSITY_TOKENS[visibility.density];
  return (
    <section className={`rounded-lg border ${SECTION_TINT[priority]}`}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={!collapsed}
        className="flex w-full items-center gap-2 px-3 py-2 text-left focus:outline-none focus:ring-2 focus:ring-inset focus:ring-slate-400 dark:focus:ring-slate-500"
      >
        <Chevron expanded={!collapsed} />
        <span className="text-base font-medium">{priority}</span>
        <span className="text-sm text-slate-600 dark:text-slate-400">{totalCount}</span>
      </button>
      <div
        className={`grid transition-[grid-template-rows] duration-200 motion-reduce:transition-none ${
          collapsed ? 'grid-rows-[0fr]' : 'grid-rows-[1fr]'
        }`}
      >
        <div className="overflow-hidden">
          <div
            className={`flex flex-col ${tokens.interRowGap} border-t border-slate-200/70 bg-white/60 ${tokens.sectionInteriorPad} dark:border-slate-800/70 dark:bg-slate-900/60`}
          >
            {nodes.length === 0 && (
              <div className="px-2 py-1 text-sm text-slate-500 dark:text-slate-400">No tasks</div>
            )}
            {nodes.map((node) => {
              if (isEpic(node)) {
                return (
                  <EpicRow
                    key={node.task.id}
                    node={node}
                    tasknotesById={tasknotesById}
                    visibility={visibility}
                    expandedId={expandedId}
                    setExpandedId={setExpandedId}
                    expanded={expandedEpicIds.has(node.task.id)}
                    toggleExpanded={() => toggleEpic(node.task.id)}
                    highlightId={highlightId}
                    isSelected={selectedId === node.task.id}
                    selectedId={selectedId}
                    navigateToTask={navigateToTask}
                  />
                );
              }
              return (
                <TaskRow
                  key={node.task.id}
                  task={node.task}
                  tasknotesById={tasknotesById}
                  visibility={visibility}
                  expandedId={expandedId}
                  setExpandedId={setExpandedId}
                  highlightId={highlightId}
                  isSelected={selectedId === node.task.id}
                  navigateToTask={navigateToTask}
                />
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
