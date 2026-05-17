import React from 'react';
import { type Priority, type TaskNode } from '../parser';
import type { Tasknote } from '../tasknote';
import type { VisibilityPrefs } from '../visibilityPrefs';
import { PrioritySection } from './PrioritySection';

interface BoardViewProps {
  sections: Priority[];
  bySection: Record<Priority, TaskNode[]>;
  collapsedSections: Set<Priority>;
  toggleSection: (p: Priority) => void;
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

export const BoardView: React.FC<BoardViewProps> = ({
  sections,
  bySection,
  collapsedSections,
  toggleSection,
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
  const visibleSections = sections.filter((p) => (bySection[p] ?? []).length > 0);
  if (visibleSections.length === 0) return null;
  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {visibleSections.map((p) => (
        <div key={p} className="min-w-72 flex-1">
          <PrioritySection
            priority={p}
            nodes={bySection[p] ?? []}
            collapsed={collapsedSections.has(p)}
            onToggle={() => toggleSection(p)}
            tasknotesById={tasknotesById}
            visibility={visibility}
            expandedId={expandedId}
            setExpandedId={setExpandedId}
            expandedEpicIds={expandedEpicIds}
            toggleEpic={toggleEpic}
            highlightId={highlightId}
            selectedId={selectedId}
            navigateToTask={navigateToTask}
          />
        </div>
      ))}
    </div>
  );
};
