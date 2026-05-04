import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { groupBy } from './utils';
import { groupTasks, parsePlan, type Priority, type Task, type TaskNode } from '../parser';
import { type Tasknote, type TasknoteStatus } from '../tasknote';
import { STATUS_LABEL, STATUS_BADGE } from './constants';
import { PrioritySection } from './PrioritySection';

const SECTIONS: Priority[] = [
  'Critical',
  'High',
  'Medium',
  'Low',
  'Future Opportunities',
  'Completed',
];

const STATUS_FILTER_VALUES: TasknoteStatus[] = [
  'starter',
  'not-started',
  'in-progress',
  'blocked',
  'completed',
];

const HIGHLIGHT_MS = 1500;

export const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tasknotesById, setTasknotesById] = useState<Map<string, Tasknote>>(new Map());
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [query, setQuery] = useState<string>('');
  const [tagFilter, setTagFilter] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState<Set<TasknoteStatus>>(new Set());
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [collapsedSections, setCollapsedSections] = useState<Set<Priority>>(
    new Set(['Completed']),
  );
  const [expandedEpicIds, setExpandedEpicIds] = useState<Set<string>>(new Set());
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const highlightTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [planRes, activeRes] = await Promise.all([
        fetch('/api/plan'),
        fetch('/api/active'),
      ]);
      if (!planRes.ok) throw new Error(`PLAN.md fetch failed: HTTP ${planRes.status}`);
      if (!activeRes.ok) throw new Error(`Tasknote list failed: HTTP ${activeRes.status}`);
      const md = await planRes.text();
      const tasknotes = (await activeRes.json()) as Tasknote[];
      setTasks(parsePlan(md));
      setTasknotesById(new Map(tasknotes.map((t) => [t.id, t])));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(
    () => () => {
      if (highlightTimer.current) clearTimeout(highlightTimer.current);
    },
    [],
  );

  const allTags = useMemo(() => {
    const set = new Set<string>();
    for (const tn of tasknotesById.values()) {
      tn.frontmatter?.tags.forEach((t) => set.add(t));
    }
    return Array.from(set).sort();
  }, [tasknotesById]);

  const matchesFilter = useCallback(
    (task: Task): boolean => {
      const tn = tasknotesById.get(task.id);
      const fm = tn?.frontmatter ?? null;

      if (tagFilter.size > 0) {
        if (!fm) return false;
        if (!fm.tags.some((tag) => tagFilter.has(tag))) return false;
      }

      if (statusFilter.size > 0) {
        if (!fm) return false;
        if (!statusFilter.has(fm.status)) return false;
      }

      const q = query.trim().toLowerCase();
      if (q) {
        const parts = [
          task.id,
          task.description,
          ...(fm ? [fm.tags.join(' '), fm.status, fm.title] : []),
        ];
        if (!parts.join(' ').toLowerCase().includes(q)) return false;
      }
      return true;
    },
    [tasknotesById, query, tagFilter, statusFilter],
  );

  const allNodes = useMemo(() => groupTasks(tasks), [tasks]);

  const filteredNodes = useMemo(
    () => allNodes.filter((n) => matchesFilter(n.task)),
    [allNodes, matchesFilter],
  );

  const bySection = useMemo(
    () => groupBy(filteredNodes, (n) => n.task.priority),
    [filteredNodes],
  );

  const total = tasks.length;
  const filteredCount = useMemo(
    () => filteredNodes.reduce((sum, n) => sum + 1 + n.children.length, 0),
    [filteredNodes],
  );
  const inProgress = useMemo(
    () =>
      tasks.filter((t) => {
        const tn = tasknotesById.get(t.id);
        if (tn?.frontmatter) return tn.frontmatter.status === 'in-progress';
        return tasknotesById.has(t.id) && !t.completed;
      }).length,
    [tasks, tasknotesById],
  );
  const starterCount = useMemo(
    () =>
      tasks.filter((t) => tasknotesById.get(t.id)?.frontmatter?.status === 'starter').length,
    [tasks, tasknotesById],
  );

  const toggleTag = (tag: string) =>
    setTagFilter((prev) => {
      const next = new Set(prev);
      next.has(tag) ? next.delete(tag) : next.add(tag);
      return next;
    });

  const toggleStatus = (status: TasknoteStatus) =>
    setStatusFilter((prev) => {
      const next = new Set(prev);
      next.has(status) ? next.delete(status) : next.add(status);
      return next;
    });

  const toggleSection = (p: Priority) =>
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      next.has(p) ? next.delete(p) : next.add(p);
      return next;
    });

  const toggleEpic = (id: string) =>
    setExpandedEpicIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

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
        const sub = /^([A-Z]+)-(\d+)\.\d+$/.exec(id);
        if (sub) {
          const epicId = `${sub[1]}-EPIC-${sub[2]}`;
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
    [tasks],
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white px-4 py-3">
        <div className="mx-auto flex max-w-screen-xl flex-col gap-2">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-lg font-semibold">Flowtron — PLAN.md</h1>
              <p className="text-xs text-slate-600">
                {filteredCount === total
                  ? `${total} tasks · ${inProgress} in progress${starterCount > 0 ? ` · ${starterCount} ${starterCount === 1 ? 'starter' : 'starters'}` : ''}`
                  : `${filteredCount} of ${total} matching · ${inProgress} in progress${starterCount > 0 ? ` · ${starterCount} ${starterCount === 1 ? 'starter' : 'starters'}` : ''}`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search id, description, tags, status"
                className="w-72 rounded border border-slate-300 bg-white px-3 py-1.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
                aria-label="Search tasks"
              />
              <button
                type="button"
                onClick={() => void load()}
                disabled={loading}
                className="rounded border border-slate-300 bg-white px-3 py-1.5 text-sm shadow-sm hover:bg-slate-50 disabled:opacity-50"
                aria-busy={loading}
              >
                {loading ? 'Loading…' : 'Refresh'}
              </button>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
            {allTags.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-slate-500">Tags:</span>
                {allTags.map((tag) => {
                  const on = tagFilter.has(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      aria-pressed={on}
                      className={`rounded-full px-2 py-0.5 ${
                        on
                          ? 'bg-slate-800 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            )}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-slate-500">Status:</span>
              {STATUS_FILTER_VALUES.map((s) => {
                const on = statusFilter.has(s);
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleStatus(s)}
                    aria-pressed={on}
                    className={`rounded-full px-2 py-0.5 ${
                      on
                        ? 'bg-slate-800 text-white'
                        : `${STATUS_BADGE[s]} hover:opacity-80`
                    }`}
                  >
                    {STATUS_LABEL[s]}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </header>

      {error && (
        <div className="mx-4 mt-3 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <main className="mx-auto max-w-screen-xl px-4 py-4">
        <div className="flex flex-col gap-3">
          {SECTIONS.map((p) => {
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
                expandedId={expandedId}
                setExpandedId={setExpandedId}
                expandedEpicIds={expandedEpicIds}
                toggleEpic={toggleEpic}
                highlightId={highlightId}
                navigateToTask={navigateToTask}
              />
            );
          })}
        </div>
      </main>
    </div>
  );
};
