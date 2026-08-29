import React from 'react';
import { isEpic, type Priority, type TaskNode } from '../parser';
import { Chevron } from './Chevron';
import { DENSITY_TOKENS } from './constants';
import { usePalette, useVisibilityPrefs } from './VisibilityContext';
import { useRowInteraction } from './RowInteractionContext';
import { EpicRow } from './EpicRow';
import { TaskRow } from './TaskRow';

interface PrioritySectionProps {
  priority: Priority;
  nodes: TaskNode[];
  collapsed: boolean;
  onToggle: () => void;
}

export const PrioritySection: React.FC<PrioritySectionProps> = ({
  priority,
  nodes,
  collapsed,
  onToggle,
}) => {
  const { expandedEpicIds, toggleEpic } = useRowInteraction();
  const totalCount = nodes.reduce((s, n) => s + 1 + n.children.length, 0);
  const tokens = DENSITY_TOKENS[useVisibilityPrefs().density];
  const palette = usePalette();
  return (
    <section className={`rounded-lg border ${palette.SECTION_TINT[priority]}`}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={!collapsed}
        className="flex w-full items-center gap-2 px-3 py-2 text-left focus:outline-hidden focus:ring-2 focus:ring-inset focus:ring-slate-400 dark:focus:ring-slate-500"
      >
        <Chevron expanded={!collapsed} />
        <span className="text-base font-medium">{priority}</span>
        <span className="text-sm text-slate-600 dark:text-slate-400">{totalCount}</span>
      </button>
      {!collapsed && (
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
                  expanded={expandedEpicIds.has(node.task.id)}
                  onToggleExpanded={toggleEpic}
                />
              );
            }
            return <TaskRow key={node.task.id} task={node.task} />;
          })}
        </div>
      )}
    </section>
  );
};
