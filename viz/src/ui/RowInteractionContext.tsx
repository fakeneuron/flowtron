import { createContext, useContext } from 'react';
import type { Tasknote } from '../tasknote';

export interface RowInteraction {
  tasknotesById: Map<string, Tasknote>;
  expandedId: string | null;
  setExpandedId: (id: string | null) => void;
  expandedEpicIds: Set<string>;
  toggleEpic: (id: string) => void;
  highlightId: string | null;
  selectedId: string | null;
  navigateToTask: (id: string) => void;
}

const RowInteractionContext = createContext<RowInteraction | null>(null);

export const RowInteractionProvider = RowInteractionContext.Provider;

export const useRowInteraction = (): RowInteraction => {
  const value = useContext(RowInteractionContext);
  if (!value) throw new Error('useRowInteraction must be used within a RowInteractionProvider');
  return value;
};
