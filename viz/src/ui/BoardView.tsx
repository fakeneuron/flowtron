import React from 'react';
import { type Priority, type TaskNode } from '../parser';
import { PrioritySection } from './PrioritySection';

interface BoardViewProps {
  sections: Priority[];
  bySection: Record<Priority, TaskNode[]>;
  collapsedSections: Set<Priority>;
  toggleSection: (p: Priority) => void;
}

export const BoardView: React.FC<BoardViewProps> = ({
  sections,
  bySection,
  collapsedSections,
  toggleSection,
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
          />
        </div>
      ))}
    </div>
  );
};
