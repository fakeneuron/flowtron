import React, { useCallback, useEffect, useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { groupBy } from './utils';
import { parsePlan, type Priority, type Task } from '../parser';
import type { Tasknote, TasknoteStatus } from '../tasknote';

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

const PRIORITY_BADGE: Record<Priority, string> = {
  Critical: 'bg-red-100 text-red-800',
  High: 'bg-orange-100 text-orange-800',
  Medium: 'bg-amber-100 text-amber-800',
  Low: 'bg-sky-100 text-sky-800',
  'Future Opportunities': 'bg-violet-100 text-violet-800',
  Completed: 'bg-emerald-100 text-emerald-800',
};

const STATUS_LABEL: Record<TasknoteStatus, string> = {
  'not-started': 'Not started',
  'in-progress': 'In progress',
  blocked: 'Blocked',
  completed: 'Completed',
};

const STATUS_BADGE: Record<TasknoteStatus, string> = {
  'not-started': 'bg-slate-100 text-slate-700',
  'in-progress': 'bg-amber-100 text-amber-800',
  blocked: 'bg-rose-100 text-rose-800',
  completed: 'bg-emerald-100 text-emerald-800',
};

const STATUS_FILTER_VALUES: TasknoteStatus[] = [
  'not-started',
  'in-progress',
  'blocked',
  'completed',
];

export const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tasknotesById, setTasknotesById] = useState<Map<string, Tasknote>>(new Map());
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [query, setQuery] = useState<string>('');
  const [tagFilter, setTagFilter] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState<Set<TasknoteStatus>>(new Set());
  const [expandedId, setExpandedId] = useState<string | null>(null);

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

  const allTags = useMemo(() => {
    const set = new Set<string>();
    for (const tn of tasknotesById.values()) {
      tn.frontmatter?.tags.forEach((t) => set.add(t));
    }
    return Array.from(set).sort();
  }, [tasknotesById]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tasks.filter((t) => {
      const tn = tasknotesById.get(t.id);
      const fm = tn?.frontmatter ?? null;

      if (tagFilter.size > 0) {
        if (!fm) return false;
        const hasAny = fm.tags.some((tag) => tagFilter.has(tag));
        if (!hasAny) return false;
      }

      if (statusFilter.size > 0) {
        if (!fm) return false;
        if (!statusFilter.has(fm.status)) return false;
      }

      if (q) {
        const haystackParts = [
          t.id,
          t.description,
          ...(fm ? [fm.tags.join(' '), fm.status, fm.title] : []),
        ];
        const haystack = haystackParts.join(' ').toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      return true;
    });
  }, [tasks, tasknotesById, query, tagFilter, statusFilter]);

  const byPriority = useMemo(() => groupBy(filtered, (t) => t.priority), [filtered]);

  const total = tasks.length;
  const filteredCount = filtered.length;
  const inProgress = useMemo(
    () =>
      tasks.filter((t) => {
        const tn = tasknotesById.get(t.id);
        if (tn?.frontmatter) return tn.frontmatter.status === 'in-progress';
        return tasknotesById.has(t.id) && !t.completed;
      }).length,
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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white px-4 py-3">
        <div className="mx-auto flex max-w-screen-2xl flex-col gap-2">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
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

      <main className="px-4 py-4">
        <div className="flex gap-3 overflow-x-auto pb-2">
          {COLUMNS.map((p) => {
            const col = byPriority[p] ?? [];
            return (
              <section
                key={p}
                className={`flex w-80 shrink-0 flex-col rounded-lg border ${COLUMN_TINTS[p]}`}
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
                    const tn = tasknotesById.get(t.id);
                    const fm = tn?.frontmatter ?? null;
                    const isExpanded = expandedId === t.id;
                    return (
                      <article
                        key={t.id}
                        className="rounded border border-slate-200 bg-white p-2 text-sm shadow-sm"
                      >
                        <button
                          type="button"
                          onClick={() => setExpandedId(isExpanded ? null : t.id)}
                          className="flex w-full items-center justify-between gap-2 text-left"
                          aria-expanded={isExpanded}
                        >
                          <span className="font-mono text-xs font-medium">{t.id}</span>
                          <div className="flex items-center gap-1">
                            {fm && (
                              <span
                                className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${PRIORITY_BADGE[fm.priority]}`}
                              >
                                {fm.priority}
                              </span>
                            )}
                            {fm ? (
                              <span
                                className={`rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide ${STATUS_BADGE[fm.status]}`}
                              >
                                {STATUS_LABEL[fm.status]}
                              </span>
                            ) : (
                              tasknotesById.has(t.id) &&
                              !t.completed && (
                                <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-amber-800">
                                  In progress
                                </span>
                              )
                            )}
                            {t.completed && t.completedDate && (
                              <span className="text-[10px] text-slate-500">
                                {t.completedDate}
                              </span>
                            )}
                          </div>
                        </button>
                        <p className="mt-1 text-xs text-slate-700">
                          {fm?.title ?? t.description}
                        </p>
                        {fm && (fm.tags.length > 0 || fm.due) && (
                          <div className="mt-1.5 flex flex-wrap items-center gap-1">
                            {fm.tags.map((tag) => (
                              <span
                                key={tag}
                                className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-700"
                              >
                                {tag}
                              </span>
                            ))}
                            {fm.due && (
                              <span className="rounded-full bg-indigo-100 px-1.5 py-0.5 text-[10px] text-indigo-800">
                                due {fm.due}
                              </span>
                            )}
                          </div>
                        )}
                        {tn && (
                          <div className="mt-1.5 flex justify-end">
                            <a
                              href={`vscode://file${tn.path}`}
                              onClick={(e) => e.stopPropagation()}
                              className="text-[10px] text-slate-500 hover:text-slate-800 hover:underline"
                              title="Open tasknote in VS Code"
                            >
                              Open in VS Code →
                            </a>
                          </div>
                        )}
                        {isExpanded && tn && (
                          <div className="mt-2 border-t border-slate-100 pt-2 text-xs text-slate-700">
                            {tn.goal && (
                              <Section title="Goal" markdown={tn.goal} />
                            )}
                            {tn.acceptance && (
                              <Section title="Acceptance" markdown={tn.acceptance} />
                            )}
                            {tn.subtasks && (
                              <Section title="Subtasks" markdown={tn.subtasks} />
                            )}
                          </div>
                        )}
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

const Section: React.FC<{ title: string; markdown: string }> = ({ title, markdown }) => (
  <div className="mb-2 last:mb-0">
    <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
      {title}
    </p>
    <div className="prose prose-xs max-w-none [&_p]:my-1 [&_ul]:my-1 [&_li]:my-0 [&_input]:mr-1">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
    </div>
  </div>
);
