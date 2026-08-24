import { useCallback, useEffect, useState } from 'react';
import {
  DEFAULT_PREFS,
  readVisibilityPrefs,
  writeVisibilityPrefs,
  type VisibilityPrefs,
} from '../visibilityPrefs';
import { readStoredViewMode, writeStoredViewMode, type ViewMode } from '../viewMode';

export function useViewPrefs(activeProject: string | null): {
  visibilityPrefs: VisibilityPrefs;
  updateVisibilityPrefs: (next: VisibilityPrefs) => void;
  viewMode: ViewMode;
  updateViewMode: (next: ViewMode) => void;
} {
  const [visibilityPrefs, setVisibilityPrefs] = useState<VisibilityPrefs>(DEFAULT_PREFS);
  const [viewMode, setViewMode] = useState<ViewMode>(() => readStoredViewMode());

  useEffect(() => {
    if (!activeProject) return;
    setVisibilityPrefs(readVisibilityPrefs(activeProject));
  }, [activeProject]);

  const updateVisibilityPrefs = useCallback(
    (next: VisibilityPrefs) => {
      setVisibilityPrefs(next);
      if (activeProject) writeVisibilityPrefs(activeProject, next);
    },
    [activeProject],
  );

  const updateViewMode = useCallback((next: ViewMode) => {
    setViewMode(next);
    writeStoredViewMode(next);
  }, []);

  return { visibilityPrefs, updateVisibilityPrefs, viewMode, updateViewMode };
}
