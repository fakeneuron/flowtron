import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { groupBy, effectiveStatus } from './utils';
import {
  getSubtaskParentEpicId,
  groupTasks,
  isEpic,
  type Priority,
  type Task,
} from '../parser';
import { type TasknoteStatus } from '../tasknote';
import { DENSITY_TOKENS, VIZ_VERSION, TYPOGRAPHY } from './constants';
import { VisibilityProvider } from './VisibilityContext';
import { SearchProvider } from './SearchContext';
import { LoadingSkeleton } from './LoadingSkeleton';
import { PrioritySection } from './PrioritySection';
import { ProjectSelector } from './ProjectSelector';
import { SettingsModal } from './SettingsModal';
import { ShortcutsModal } from './ShortcutsModal';
import { ThemeToggle } from './ThemeToggle';
import { useKeyboardNav } from './useKeyboardNav';
import { useProjectData } from './useProjectData';
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
    tasknotesById,
    loading: dataLoading,
    error: dataError,
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
    (task: Task): boolean => {
      const tn = tasknotesById.get(task.id);
      const fm = tn?.frontmatter ?? null;

      if (statusFilter.size > 0) {
        const s: TasknoteStatus = effectiveStatus(task, tn) ?? 'not-started';
        if (!statusFilter.has(s)) return false;
      }

      const q = query.trim().toLowerCase();
      if (q) {
        const parts = [
          task.id,
          ...(task.shortname ? [task.shortname] : []),
          task.description,
          ...(fm ? [fm.status, fm.title] : []),
        ];
        if (!parts.join(' ').toLowerCase().includes(q)) return false;
      }
      return true;
    },
    [tasknotesById, query, statusFilter],
  );

  const allNodes = useMemo(() => groupTasks(tasks), [tasks]);

  const filteredNodes = useMemo(
    () => allNodes.filter((n) => matchesFilter(n.task) || n.children.some(matchesFilter)),
    [allNodes, matchesFilter],
  );

  const bySection = useMemo(() => {
    const grouped = groupBy(filteredNodes, (n) => n.task.priority);
    const high = grouped.High;
    if (high && high.length > 1) {
      // Critical-flagged tasks rise to the top of High (FE-044). Stable sort
      // preserves source order within the flagged and un-flagged groups.
      grouped.High = [...high].sort(
        (a, b) => Number(b.task.critical) - Number(a.task.critical),
      );
    }
    return grouped;
  }, [filteredNodes]);

  const listViewEmptySections = useMemo(
    () => SECTIONS.filter((p) => (bySection[p] ?? []).length === 0),
    [bySection],
  );

  const epicIds = useMemo(() => {
    const set = new Set<string>();
    for (const node of allNodes) {
      if (isEpic(node)) set.add(node.task.id);
    }
    return set;
  }, [allNodes]);

  const visibleIds = useMemo(() => {
    const ids: string[] = [];
    for (const p of SECTIONS) {
      if (collapsedSections.has(p)) continue;
      const nodes = bySection[p] ?? [];
      for (const node of nodes) {
        ids.push(node.task.id);
        if (expandedEpicIds.has(node.task.id)) {
          for (const c of node.children) ids.push(c.id);
        }
      }
    }
    return ids;
  }, [bySection, collapsedSections, expandedEpicIds]);

  const total = tasks.length;
  const filteredCount = useMemo(
    () => filteredNodes.reduce((sum, n) => sum + 1 + n.children.length, 0),
    [filteredNodes],
  );
  const inProgress = useMemo(
    () =>
      tasks.filter((t) => {
        const tn = tasknotesById.get(t.id);
        const s = effectiveStatus(t, tn);
        if (s) return s === 'in-progress';
        return tasknotesById.has(t.id) && !t.completed;
      }).length,
    [tasks, tasknotesById],
  );
  const starterCount = useMemo(
    () =>
      tasks.filter((t) => tasknotesById.get(t.id)?.frontmatter?.status === 'starter').length,
    [tasks, tasknotesById],
  );
  const starterSuffix =
    starterCount > 0 ? ` · ${starterCount} ${starterCount === 1 ? 'starter' : 'starters'}` : '';

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
        setCollapsedSections((prev) => {
          if (!prev.has(target.priority)) return prev;
          const next = new Set(prev);
          next.delete(target.priority);
          return next;
        });
        const epicId = getSubtaskParentEpicId(id);
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
        tasknotesById={tasknotesById}
        visibility={visibilityPrefs}
        expandedId={expandedId}
        setExpandedId={setExpandedId}
        expandedEpicIds={expandedEpicIds}
        toggleEpic={toggleEpic}
        highlightId={highlightId}
        selectedId={selectedId}
        navigateToTask={navigateToTask}
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
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <header className="border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex max-w-screen-xl flex-col gap-2">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="flex items-center gap-2 text-lg font-semibold">
                <img src="/LOGO.webp" alt="" aria-hidden="true" className="h-6 w-auto" />
                Flowtron — {activeProject ?? '…'}
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {filteredCount === total
                  ? `${total} tasks · ${inProgress} in progress${starterSuffix}`
                  : `${filteredCount} of ${total} matching · ${inProgress} in progress${starterSuffix}`}
                {` · flowtron ${projectVersions[activeProject ?? ''] ?? VIZ_VERSION}`}
                {unparsed.length > 0 && (
                  <span className="ml-2 inline-flex items-center rounded bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-950 dark:text-amber-200">
                    ⚠ {unparsed.length} unparsed
                  </span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div
                role="group"
                aria-label="View mode"
                className="inline-flex rounded border border-slate-300 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900"
              >
                {(['list', 'board'] as const).map((m, i) => {
                  const active = viewMode === m;
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => updateViewMode(m)}
                      aria-pressed={active}
                      className={`${i === 0 ? 'rounded-l' : 'rounded-r'} px-3 py-1.5 text-base focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500 ${
                        active
                          ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900'
                          : 'hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800'
                      }`}
                    >
                      {m === 'list' ? 'List' : 'Board'}
                    </button>
                  );
                })}
              </div>
              <input
                ref={searchInputRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search id, description, status"
                autoComplete="off"
                className="w-72 rounded border border-slate-300 bg-white px-3 py-1.5 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-slate-600"
                aria-label="Search tasks"
              />
              <button
                type="button"
                onClick={() => setShortcutsOpen(true)}
                aria-label="Keyboard shortcuts"
                title="Keyboard shortcuts"
                className="rounded border border-slate-300 bg-white px-2 py-1.5 text-base shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:focus:ring-slate-500"
              >
                ⓘ
              </button>
              <ThemeToggle />
              <button
                type="button"
                onClick={() => setSettingsOpen(true)}
                aria-label="Open settings"
                title="Settings"
                className="rounded border border-slate-300 bg-white px-2 py-1.5 text-base shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:focus:ring-slate-500"
              >
                ⚙️
              </button>
            </div>
          </div>
          <div className="text-sm">
            <ProjectSelector
              projects={projects}
              active={activeProject}
              onSelect={handleSelectProject}
              versions={projectVersions}
              latestRelease={latestRelease}
            />
          </div>
        </div>
      </header>

      {errorMessage && (
        <div className="mx-4 mt-3 rounded border border-red-300 bg-red-50 p-3 text-base text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
          {errorMessage}
        </div>
      )}

      {!loading && unparsed.length > 0 && (
        <div className="mx-4 mt-3 rounded border border-amber-300 bg-amber-50 p-3 text-base text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
          <p>
            ⚠ {unparsed.length === 1
              ? '1 line in PLAN.md looks like a task but failed to parse:'
              : `${unparsed.length} lines in PLAN.md look like tasks but failed to parse:`}
          </p>
          <ul className="mt-1 font-mono text-sm">
            {unparsed.map((u) => (
              <li key={u.line}>
                L{u.line}: {u.text}
              </li>
            ))}
          </ul>
        </div>
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
              tasknotesById={tasknotesById}
              visibility={visibilityPrefs}
              expandedId={expandedId}
              setExpandedId={setExpandedId}
              expandedEpicIds={expandedEpicIds}
              toggleEpic={toggleEpic}
              highlightId={highlightId}
              selectedId={selectedId}
              navigateToTask={navigateToTask}
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
    </SearchProvider>
    </VisibilityProvider>
  );
};
