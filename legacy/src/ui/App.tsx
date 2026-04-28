import React, { useMemo, useState } from 'react';
import { groupBy } from './utils';

type Plan = {
  plan_id: string;
  tasks?: Array<{ task_id: string; title: string; status: string; priority?: string }>;
};

type TaskNote = {
  task_id: string;
  title: string;
  priority?: string;
  phases?: Array<{ name: string; steps?: Array<{ description: string; status: string }> }>;
};

type LoadedFiles = {
  plans: Plan[];
  tasknotes: TaskNote[];
};

export const App: React.FC = () => {
  const [loaded, setLoaded] = useState<LoadedFiles>({ plans: [], tasknotes: [] });
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState<string>('');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [loadingSamples, setLoadingSamples] = useState<boolean>(false);

  const tasks = useMemo(() => loaded.plans.flatMap((p) => p.tasks ?? []), [loaded]);
  const filteredTasks = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tasks;
    return tasks.filter((t) => {
      const hay = `${t.task_id} ${t.title ?? ''} ${t.priority ?? ''}`.toLowerCase();
      return hay.includes(q);
    });
  }, [tasks, query]);
  const byStatus = useMemo(() => groupBy(filteredTasks, (t) => (t.status ?? 'Unknown') as string), [filteredTasks]);
  const counters = useMemo(() => ({
    total: tasks.length,
    filtered: filteredTasks.length,
    byStatus: {
      'Not Started': (byStatus['Not Started'] ?? []).length,
      'In Progress': (byStatus['In Progress'] ?? []).length,
      'Complete': (byStatus['Complete'] ?? []).length,
    }
  }), [tasks.length, filteredTasks.length, byStatus]);
  const taskIdToNote = useMemo(() => {
    const map: Record<string, TaskNote> = {};
    for (const n of loaded.tasknotes) map[n.task_id] = n;
    return map;
  }, [loaded.tasknotes]);

  async function handlePickFiles(event: React.ChangeEvent<HTMLInputElement>) {
    setError(null);
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;

    const plans: Plan[] = [];
    const tasknotes: TaskNote[] = [];

    for (const file of files) {
      try {
        const text = await file.text();
        const json = JSON.parse(text);
        if (json && typeof json === 'object') {
          if ('plan_id' in json) plans.push(json as Plan);
          if ('task_id' in json && 'phases' in json) tasknotes.push(json as TaskNote);
        }
      } catch (e) {
        setError(`Failed to parse ${file.name}: ${(e as Error).message}`);
        return;
      }
    }
    setLoaded({ plans, tasknotes });
  }

  async function handleLoadSamples() {
    setError(null);
    setLoadingSamples(true);
    try {
      const urls = ['/samples/plan-frontend.json', '/samples/tasknote-FE-004.json'];
      const responses = await Promise.all(urls.map((u) => fetch(u)));
      const texts = await Promise.all(responses.map(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status} for ${r.url}`);
        return r.text();
      }));
      const plans: Plan[] = [];
      const tasknotes: TaskNote[] = [];
      for (const t of texts) {
        try {
          const json = JSON.parse(t);
          if (json && typeof json === 'object') {
            if ('plan_id' in json) plans.push(json as Plan);
            if ('task_id' in json && 'phases' in json) tasknotes.push(json as TaskNote);
          }
        } catch (e) {
          setError(`Failed to parse sample: ${(e as Error).message}`);
          return;
        }
      }
      setLoaded({ plans, tasknotes });
    } catch (e) {
      setError(`Failed to load samples: ${(e as Error).message}`);
    } finally {
      setLoadingSamples(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4">
      <div className="mx-auto max-w-5xl space-y-4">
        <h1 className="text-2xl font-semibold">Flowtron Visualization (MVP)</h1>
        <p className="text-sm text-slate-600">Load plan and tasknote JSON files to visualize status.</p>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <label className="inline-flex items-center gap-2 rounded border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm hover:bg-slate-50 cursor-pointer w-fit">
            <input type="file" accept="application/json" multiple onChange={handlePickFiles} className="hidden" />
            <span>Choose JSON files</span>
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleLoadSamples}
              disabled={loadingSamples}
              className="rounded border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm hover:bg-slate-50 disabled:opacity-50"
              aria-busy={loadingSamples}
            >
              {loadingSamples ? 'Loading samples…' : 'Load sample files'}
            </button>
            <input
              type="search"
              placeholder="Search task id/title/priority"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-72 rounded border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
              aria-label="Search tasks"
            />
          </div>
        </div>

        <div className="text-xs text-slate-600">
          {counters.filtered !== counters.total ? (
            <span>
              Showing {counters.filtered} of {counters.total} tasks — {counters.byStatus['Not Started']} not started, {counters.byStatus['In Progress']} in progress, {counters.byStatus['Complete']} complete
            </span>
          ) : (
            <span>
              {counters.total} tasks — {counters.byStatus['Not Started']} not started, {counters.byStatus['In Progress']} in progress, {counters.byStatus['Complete']} complete
            </span>
          )}
        </div>

        {error && (
          <div className="rounded border border-red-300 bg-red-50 p-3 text-red-800 text-sm">{error}</div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(['Not Started', 'In Progress', 'Complete'] as const).map((column) => (
            <div key={column} className="rounded-lg border border-slate-200 bg-white">
              <div className="border-b border-slate-200 px-3 py-2 text-sm font-medium">{column}</div>
              <div className="p-3 space-y-2">
                {(byStatus[column] ?? []).map((t) => {
                  const isSelected = selectedTaskId === t.task_id;
                  const note = taskIdToNote[t.task_id];
                  return (
                    <button
                      key={t.task_id}
                      onClick={() => setSelectedTaskId(t.task_id)}
                      className={`w-full text-left rounded border border-slate-200 p-2 text-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300 ${isSelected ? 'ring-2 ring-slate-400 bg-slate-50' : ''}`}
                      aria-label={`Select ${t.task_id}`}
                      aria-current={isSelected ? 'true' : undefined}
                    >
                      <div className="font-medium">{t.task_id}</div>
                      <div className="text-slate-700">{t.title}</div>
                      <div className="mt-1 flex flex-wrap gap-3 text-xs text-slate-600">
                        {t.priority && (
                          <span>Priority: {t.priority}</span>
                        )}
                        {note && (
                          <span>Phases: {Array.isArray(note.phases) ? note.phases.length : 0}</span>
                        )}
                      </div>
                    </button>
                  );
                })}
                {((byStatus[column] ?? []).length === 0) && (
                  <div className="text-xs text-slate-400">No tasks</div>
                )}
              </div>
            </div>
          ))}
        </div>

        {(selectedTaskId || loaded.tasknotes.length > 0) && (
          <div className="rounded-lg border border-slate-200 bg-white">
            <div className="border-b border-slate-200 px-3 py-2 text-sm font-medium">Details</div>
            <div className="p-3 grid gap-3 md:grid-cols-2">
              {selectedTaskId && (
                <div className="rounded border border-slate-200 p-3">
                  {(() => {
                    const t = tasks.find((x) => x.task_id === selectedTaskId);
                    if (!t) return <div className="text-sm">Select a task</div>;
                    const note = taskIdToNote[t.task_id];
                    return (
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <div className="font-medium">{t.task_id}</div>
                          <button
                            type="button"
                            onClick={() => setSelectedTaskId(null)}
                            className="rounded border border-slate-300 bg-white px-2 py-1 text-xs shadow-sm hover:bg-slate-50"
                          >Clear</button>
                        </div>
                        <div className="text-slate-700">{t.title}</div>
                        <div className="text-xs text-slate-600">Status: {t.status ?? 'Unknown'}</div>
                        {t.priority && <div className="text-xs text-slate-600">Priority: {t.priority}</div>}
                        {note && (
                          <div className="text-xs text-slate-600">Phases in TaskNote: {Array.isArray(note.phases) ? note.phases.length : 0}</div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}
              {loaded.tasknotes.length > 0 && (
                <div className="rounded border border-slate-200 p-3">
                  <div className="text-sm font-medium">Loaded TaskNotes</div>
                  <div className="mt-2 grid gap-2">
                    {loaded.tasknotes.map((n) => (
                      <div key={n.task_id} className="rounded border border-slate-200 p-2">
                        <div className="text-sm font-medium">{n.task_id} — {n.title}</div>
                        <div className="mt-1 text-xs text-slate-600">Phases: {Array.isArray(n.phases) ? n.phases.length : 0}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


