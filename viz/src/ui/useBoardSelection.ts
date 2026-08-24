import { useCallback, useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import { displaySection } from './utils';
import { getSubtaskParentEpicId, type Priority, type Task } from '../parser';
import { useToggleSet } from './useToggleSet';

const HIGHLIGHT_MS = 1500;

export function useBoardSelection(tasks: Task[]): {
  expandedId: string | null;
  setExpandedId: Dispatch<SetStateAction<string | null>>;
  selectedId: string | null;
  setSelectedId: Dispatch<SetStateAction<string | null>>;
  highlightId: string | null;
  collapsedSections: Set<Priority>;
  toggleSection: (p: Priority) => void;
  expandedEpicIds: Set<string>;
  toggleEpic: (id: string) => void;
  navigateToTask: (id: string) => void;
  resetForProjectSwitch: () => void;
} {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [collapsedSections, toggleSection, setCollapsedSections] = useToggleSet<Priority>(
    new Set(['Completed']),
  );
  const [expandedEpicIds, toggleEpic, setExpandedEpicIds] = useToggleSet<string>();
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const highlightTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (highlightTimer.current) clearTimeout(highlightTimer.current);
    },
    [],
  );

  const navigateToTask = useCallback(
    (id: string) => {
      const target = tasks.find((t) => t.id === id);
      if (target) {
        const epicId = getSubtaskParentEpicId(id);
        const parent = epicId ? tasks.find((t) => t.id === epicId) : undefined;
        const section = displaySection(parent ?? target);
        setCollapsedSections((prev) => {
          if (!prev.has(section)) return prev;
          const next = new Set(prev);
          next.delete(section);
          return next;
        });
        if (epicId) {
          setExpandedEpicIds((prev) => {
            if (prev.has(epicId)) return prev;
            const next = new Set(prev);
            next.add(epicId);
            return next;
          });
        }
      }
      requestAnimationFrame(() => {
        const el = document.getElementById(`row-${id}`);
        if (!el) return;
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setHighlightId(id);
        if (highlightTimer.current) clearTimeout(highlightTimer.current);
        highlightTimer.current = setTimeout(() => setHighlightId(null), HIGHLIGHT_MS);
      });
    },
    [tasks, setCollapsedSections, setExpandedEpicIds],
  );

  const resetForProjectSwitch = useCallback(() => {
    setExpandedId(null);
    setExpandedEpicIds(new Set());
    setSelectedId(null);
    setCollapsedSections(new Set(['Completed']));
    if (highlightTimer.current) clearTimeout(highlightTimer.current);
    setHighlightId(null);
  }, [setCollapsedSections, setExpandedEpicIds]);

  return {
    expandedId,
    setExpandedId,
    selectedId,
    setSelectedId,
    highlightId,
    collapsedSections,
    toggleSection,
    expandedEpicIds,
    toggleEpic,
    navigateToTask,
    resetForProjectSwitch,
  };
}
