import React from 'react';
import type { Priority, TaskNode } from '../parser';
import type { Tasknote } from '../tasknote';
import { Chevron } from './Chevron';
import { EpicRow } from './EpicRow';
import { TaskRow } from './TaskRow';

const SECTION_TINT: Record<Priority, string> = {
  Critical: 'bg-red-50 border-red-200',
  High: 'bg-orange-50 border-orange-200',
  Medium: 'bg-amber-50 border-amber-200',
  Low: 'bg-sky-50 border-sky-200',
  'Future Opportunities': 'bg-violet-50 border-violet-200',
  Completed: 'bg-emerald-50 border-emerald-200',
};

interface PrioritySectionProps {
  priority: Priority;
  nodes: TaskNode[];
  collapsed: boolean;
  onToggle: () => void;
  tasknotesById: Map<string, Tasknote>;
  expandedId: string | null;
  setExpandedId: (id: string | null) => void;
  expandedEpicIds: Set<string>;
  toggleEpic: (id: string) => void;
  highlightId: string | null;
  navigateToTask: (id: string) => void;
}

export const PrioritySection: React.FC<PrioritySectionProps> = ({
  priority,
  nodes,
  collapsed,
  onToggle,
  tasknotesById,
  expandedId,
  setExpandedId,
  expandedEpicIds,
  toggleEpic,
  highlightId,
  navigateToTask,
}) => {
  const totalCount = nodes.reduce((s, n) => s + 1 + n.children.length, 0);
  return (
    <section className={`rounded-lg border ${SECTION_TINT[priority]}`}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={!collapsed}
        className="flex w-full items-center gap-2 px-3 py-2 text-left"
      >
        <Chevron expanded={!collapsed} />
        <span className="text-sm font-medium">{priority}</span>
        <span className="text-xs text-slate-600">{totalCount}</span>
      </button>
      {!collapsed && (
        <div className="flex flex-col gap-1.5 border-t border-slate-200/70 bg-white/60 p-2">
          {nodes.length === 0 && (
            <div className="px-2 py-1 text-xs text-slate-400">No tasks</div>
          )}
          {nodes.map((node) => {
            const isEpic = node.children.length > 0 || /-EPIC-/.test(node.task.id);
            if (isEpic) {
              return (
                <EpicRow
                  key={node.task.id}
                  node={node}
                  tasknotesById={tasknotesById}
                  expandedId={expandedId}
                  setExpandedId={setExpandedId}
                  expanded={expandedEpicIds.has(node.task.id)}
                  toggleExpanded={() => toggleEpic(node.task.id)}
                  highlightId={highlightId}
                  navigateToTask={navigateToTask}
                />
              );
            }
            return (
              <TaskRow
                key={node.task.id}
                task={node.task}
                tasknotesById={tasknotesById}
                expandedId={expandedId}
                setExpandedId={setExpandedId}
                highlightId={highlightId}
                navigateToTask={navigateToTask}
              />
            );
          })}
        </div>
      )}
    </section>
  );
};
