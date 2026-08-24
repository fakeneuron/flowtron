import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { displaySection } from './utils';
import {
  getSubtaskParentEpicId,
  groupTasks,
  type Priority,
  type Task,
} from '../parser';
import { type TasknoteStatus } from '../tasknote';
import {
  collectEpicIds,
  collectVisibleIds,
  countFiltered,
  countInProgress,
  countStarters,
  emptySections,
  groupBySection,
  matchesFilter as matchesTaskFilter,
  pruneMatchingNodes,
} from './taskView';
import { DENSITY_TOKENS, TYPOGRAPHY } from './constants';
import { VisibilityProvider } from './VisibilityContext';
import { SearchProvider } from './SearchContext';
import { RowInteractionProvider } from './RowInteractionContext';
import { LoadingSkeleton } from './LoadingSkeleton';
import { PrioritySection } from './PrioritySection';
import { SettingsModal } from './SettingsModal';
import { ShortcutsModal } from './ShortcutsModal';
import { useKeyboardNav } from './useKeyboardNav';
import { LIVE_RECOVERY_MS, useProjectData } from './useProjectData';
import { useProjects } from './useProjects';
import { useToggleSet } from './useToggleSet';
import {
  DEFAULT_PREFS,
  readVisibilityPrefs,
  writeVisibilityPrefs,
  type VisibilityPrefs,
} from '../visibilityPrefs';
import { readStoredViewMode, writeStoredViewMode, type ViewMode } from '../viewMode';
import { BoardView } from './BoardView';
import { DiagnosticBanner } from './DiagnosticBanner';
import { AppHeader } from './AppHeader';

const SECTIONS: Priority[] = [
  'High',
  'Medium',
  'Low',
  'Future Opportunities',
  'Completed',
];

const BOARD_SECTIONS: Priority[] = ['High', 'Medium', 'Low'];
const BELOW_BOARD_SECTIONS: Priority[] = ['Future Opportunities', 'Completed'];

const HIGHLIGHT_MS = 1500;

export const App: React.FC = () => {
  const {
    projects,
    projectVersions,
    latestRelease,
    activeProject,
    setActiveProject,
    initialLoading,
    error: projectsError,
  } = useProjects();
  const {
    tasks,
    unparsed,
    nearMissHeadings,
    tasknotesById,
    loading: dataLoading,
    error: dataError,
    liveDisconnected,
    refresh,
    reset,
  } = useProjectData(activeProject);
  const loading = initialLoading || (activeProject !== null && dataLoading);
  const errorMessage = projectsError ?? dataError;

  const [query, setQuery] = useState<string>('');
  const [statusFilter, , setStatusFilter] = useToggleSet<TasknoteStatus>();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [collapsedSections, toggleSection, setCollapsedSections] = useToggleSet<Priority>(
    new Set(['Completed']),
  );
  const [expandedEpicIds, toggleEpic, setExpandedEpicIds] = useToggleSet<string>();
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [visibilityPrefs, setVisibilityPrefs] = useState<VisibilityPrefs>(DEFAULT_PREFS);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>(() => readStoredViewMode());
  const highlightTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

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

  useEffect(
    () => () => {
      if (highlightTimer.current) clearTimeout(highlightTimer.current);
    },
    [],
  );

  const matchesFilter = useCallback(
    (task: Task): boolean => matchesTaskFilter(task, tasknotesById, query, statusFilter),
    [tasknotesById, query, statusFilter],
  );

  const { nodes: allNodes, duplicateEpics } = useMemo(() => groupTasks(tasks), [tasks]);

  const filteredNodes = useMemo(
    () => pruneMatchingNodes(allNodes, matchesFilter),
    [allNodes, matchesFilter],
  );

  const bySection = useMemo(() => groupBySection(filteredNodes), [filteredNodes]);

  const listViewEmptySections = useMemo(
    () => emptySections(SECTIONS, bySection),
    [bySection],
  );

  const epicIds = useMemo(() => collectEpicIds(allNodes), [allNodes]);

  const visibleIds = useMemo(
    () => collectVisibleIds(SECTIONS, bySection, collapsedSections, expandedEpicIds),
    [bySection, collapsedSections, expandedEpicIds],
  );

  const total = tasks.length;
  const filteredCount = useMemo(() => countFiltered(filteredNodes), [filteredNodes]);
  const inProgress = useMemo(
    () => countInProgress(tasks, tasknotesById),
    [tasks, tasknotesById],
  );
  const starterCount = useMemo(
    () => countStarters(tasks, tasknotesById),
    [tasks, tasknotesById],
  );

  const handleSelectProject = (name: string) => {
    if (name === activeProject) return;
    setQuery('');
    setStatusFilter(new Set());
    setExpandedId(null);
    setExpandedEpicIds(new Set());
    setSelectedId(null);
    setCollapsedSections(new Set(['Completed']));
    if (highlightTimer.current) clearTimeout(highlightTimer.current);
    setHighlightId(null);
    window.scrollTo({ top: 0, behavior: 'auto' });
    reset();
    setActiveProject(name);
  };

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

  const rowInteraction = useMemo(
    () => ({
      tasknotesById,
      expandedId,
      setExpandedId,
      expandedEpicIds,
      toggleEpic,
      highlightId,
      selectedId,
      navigateToTask,
    }),
    [
      tasknotesById,
      expandedId,
      setExpandedId,
      expandedEpicIds,
      toggleEpic,
      highlightId,
      selectedId,
      navigateToTask,
    ],
  );

  const renderSection = (p: Priority) => {
    const nodes = bySection[p] ?? [];
    const collapsed = collapsedSections.has(p);
    return (
      <PrioritySection
        key={p}
        priority={p}
        nodes={nodes}
        collapsed={collapsed}
        onToggle={() => toggleSection(p)}
      />
    );
  };

  useKeyboardNav({
    visibleIds,
    epicIds,
    searchInputRef,
    selectedId,
    setSelectedId,
    expandedId,
    setExpandedId,
    expandedEpicIds,
    toggleEpic,
    query,
    setQuery,
    statusFilter,
    setStatusFilter,
    load: refresh,
    onOpenShortcuts: () => setShortcutsOpen(true),
  });

  return (
    <VisibilityProvider value={visibilityPrefs}>
    <SearchProvider value={query}>
    <RowInteractionProvider value={rowInteraction}>
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <AppHeader
        activeProject={activeProject}
        projects={projects}
        projectVersions={projectVersions}
        latestRelease={latestRelease}
        onSelectProject={handleSelectProject}
        total={total}
        filteredCount={filteredCount}
        inProgress={inProgress}
        starterCount={starterCount}
        unparsedCount={unparsed.length}
        duplicateEpicCount={duplicateEpics.length}
        nearMissHeadingCount={nearMissHeadings.length}
        liveDisconnected={liveDisconnected}
        viewMode={viewMode}
        onViewModeChange={updateViewMode}
        query={query}
        onQueryChange={setQuery}
        searchInputRef={searchInputRef}
        onOpenShortcuts={() => setShortcutsOpen(true)}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      {errorMessage && (
        <div className="mx-4 mt-3 rounded border border-red-300 bg-red-50 p-3 text-base text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
          {errorMessage}
        </div>
      )}

      {liveDisconnected && (
        <div
          role="status"
          className="mx-4 mt-3 rounded border border-amber-300 bg-amber-50 p-3 text-base text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200"
        >
          ⚠ Live updates disconnected — showing polled data (every{' '}
          {Math.round(LIVE_RECOVERY_MS / 1000)}s) and retrying the live connection.
        </div>
      )}

      {!loading && unparsed.length > 0 && (
        <DiagnosticBanner
          message={
            <>
              ⚠ {unparsed.length === 1
                ? '1 line in PLAN.md looks like a task but failed to parse:'
                : `${unparsed.length} lines in PLAN.md look like tasks but failed to parse:`}
            </>
          }
        >
          {unparsed.map((u) => (
            <li key={u.line}>
              L{u.line}: {u.text}
            </li>
          ))}
        </DiagnosticBanner>
      )}

      {!loading && duplicateEpics.length > 0 && (
        <DiagnosticBanner
          message={
            <>
              ⚠ {duplicateEpics.length === 1
                ? '1 epic ID appears under more than one PLAN.md heading; only its first occurrence is shown:'
                : `${duplicateEpics.length} epic IDs appear under more than one PLAN.md heading; only each first occurrence is shown:`}
            </>
          }
        >
          {duplicateEpics.map((d, i) => (
            <li key={`${d.id}-${i}`}>{d.id}</li>
          ))}
        </DiagnosticBanner>
      )}

      {!loading && nearMissHeadings.length > 0 && (
        <DiagnosticBanner
          message={
            <>
              ⚠ {nearMissHeadings.length === 1
                ? "1 PLAN.md heading looks like a typo'd priority section and its tasks were skipped:"
                : `${nearMissHeadings.length} PLAN.md headings look like typo'd priority sections and their tasks were skipped:`}
            </>
          }
        >
          {nearMissHeadings.map((h) => (
            <li key={h.line}>
              L{h.line}: "{h.heading}" (did you mean "{h.matched}"?)
            </li>
          ))}
        </DiagnosticBanner>
      )}

      <main className="mx-auto max-w-screen-xl px-4 py-4">
        {loading ? (
          <LoadingSkeleton density={visibilityPrefs.density} />
        ) : (statusFilter.size > 0 || query.trim()) && filteredCount === 0 ? (
          <div className="flex items-center justify-center py-16">
            <p className={`${TYPOGRAPHY.body} text-slate-500 dark:text-slate-400`}>
              No matches. Press Esc to clear filters.
            </p>
          </div>
        ) : viewMode === 'board' ? (
          <div className={`flex flex-col ${DENSITY_TOKENS[visibilityPrefs.density].betweenSectionsGap}`}>
            <BoardView
              sections={BOARD_SECTIONS}
              bySection={bySection}
              collapsedSections={collapsedSections}
              toggleSection={toggleSection}
            />
            {BELOW_BOARD_SECTIONS.map(renderSection)}
          </div>
        ) : (
          <>
            <div className={`flex flex-col ${DENSITY_TOKENS[visibilityPrefs.density].betweenSectionsGap}`}>
              {SECTIONS.filter((p) => (bySection[p] ?? []).length > 0).map(renderSection)}
            </div>
            {listViewEmptySections.length > 0 && (
              <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
                {listViewEmptySections.length === SECTIONS.length
                  ? 'No tasks in this project'
                  : `No tasks in: ${listViewEmptySections.join(' · ')}`}
              </p>
            )}
          </>
        )}
      </main>
      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        prefs={visibilityPrefs}
        onChange={updateVisibilityPrefs}
      />
      <ShortcutsModal open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
    </div>
    </RowInteractionProvider>
    </SearchProvider>
    </VisibilityProvider>
  );
};
