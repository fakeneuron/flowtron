import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { groupBy } from './utils';
import { parsePlan, type Priority, type Task } from '../parser';

const COLUMNS: Priority[] = [
  'Critical',
  'High',
  'Medium',
  'Low',
  'Future Opportunities',
  'Completed',
];

const COLUMN_TINTS: Record<Priority, string> = {
  Critical: 'bg-red-50 border-red-200',
  High: 'bg-orange-50 border-orange-200',
  Medium: 'bg-amber-50 border-amber-200',
  Low: 'bg-sky-50 border-sky-200',
  'Future Opportunities': 'bg-violet-50 border-violet-200',
  Completed: 'bg-emerald-50 border-emerald-200',
};

export const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeIds, setActiveIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [query, setQuery] = useState<string>('');

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
      const ids = (await activeRes.json()) as string[];
      setTasks(parsePlan(md));
      setActiveIds(new Set(ids));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tasks;
    return tasks.filter((t) => `${t.id} ${t.description}`.toLowerCase().includes(q));
  }, [tasks, query]);

  const byPriority = useMemo(() => groupBy(filtered, (t) => t.priority), [filtered]);

  const total = tasks.length;
  const filteredCount = filtered.length;
  const inProgress = useMemo(
    () => tasks.filter((t) => activeIds.has(t.id) && !t.completed).length,
    [tasks, activeIds],
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white px-4 py-3">
        <div className="mx-auto flex max-w-screen-2xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-lg font-semibold">Flowtron — PLAN.md</h1>
            <p className="text-xs text-slate-600">
              {filteredCount === total
                ? `${total} tasks · ${inProgress} in progress`
                : `${filteredCount} of ${total} matching · ${inProgress} in progress`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search id or description"
              className="w-64 rounded border border-slate-300 bg-white px-3 py-1.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
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
      </header>

      {error && (
        <div className="mx-4 mt-3 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <main className="px-4 py-4">
        <div className="flex gap-3 overflow-x-auto pb-2">
          {COLUMNS.map((p) => {
            const col = byPriority[p] ?? [];
            return (
              <section
                key={p}
                className={`flex w-72 shrink-0 flex-col rounded-lg border ${COLUMN_TINTS[p]}`}
              >
                <div className="flex items-center justify-between border-b border-slate-200 px-3 py-2">
                  <span className="text-sm font-medium">{p}</span>
                  <span className="text-xs text-slate-600">{col.length}</span>
                </div>
                <div className="flex flex-col gap-2 p-2">
                  {col.length === 0 && (
                    <div className="px-1 py-2 text-xs text-slate-400">No tasks</div>
                  )}
                  {col.map((t) => {
                    const isActive = activeIds.has(t.id) && !t.completed;
                    return (
                      <article
                        key={t.id}
                        className="rounded border border-slate-200 bg-white p-2 text-sm shadow-sm"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono text-xs font-medium">{t.id}</span>
                          {isActive && (
                            <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-amber-800">
                              In progress
                            </span>
                          )}
                          {t.completed && t.completedDate && (
                            <span className="text-[10px] text-slate-500">{t.completedDate}</span>
                          )}
                        </div>
                        <p className="mt-1 text-xs text-slate-700">{t.description}</p>
                      </article>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </main>
    </div>
  );
};
