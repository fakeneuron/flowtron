import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { groupBy } from './utils';
import { groupTasks, parsePlan, type Priority, type Task, type TaskModel, type TaskNode } from '../parser';
import { activePhaseIndex, type ChecklistCounts, type Tasknote, type TasknoteStatus } from '../tasknote';

const SECTIONS: Priority[] = [
  'Critical',
  'High',
  'Medium',
  'Low',
  'Future Opportunities',
  'Completed',
];

const SECTION_TINT: Record<Priority, string> = {
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
  starter: '🌱 Starter',
  'not-started': 'Not started',
  'in-progress': 'In progress',
  blocked: 'Blocked',
  completed: 'Completed',
};

const STATUS_BADGE: Record<TasknoteStatus, string> = {
  starter: 'bg-lime-100 text-lime-800',
  'not-started': 'bg-slate-100 text-slate-700',
  'in-progress': 'bg-amber-100 text-amber-800',
  blocked: 'bg-rose-100 text-rose-800',
  completed: 'bg-emerald-100 text-emerald-800',
};

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

interface PrioritySectionProps {
  priority: Priority;
  nodes: TaskNode[];
  collapsed: boolean;
  onToggle: () => void;
  tasknotesById: Map<string, Tasknote>;
  expandedId: string | null;
  setExpandedId: (id: string | null) => void;
  expandedEpicIds: Set<string>;
  toggleEpic: (id: string) => void;
  highlightId: string | null;
  navigateToTask: (id: string) => void;
}

const PrioritySection: React.FC<PrioritySectionProps> = ({
  priority,
  nodes,
  collapsed,
  onToggle,
  tasknotesById,
  expandedId,
  setExpandedId,
  expandedEpicIds,
  toggleEpic,
  highlightId,
  navigateToTask,
}) => {
  const totalCount = nodes.reduce((s, n) => s + 1 + n.children.length, 0);
  return (
    <section className={`rounded-lg border ${SECTION_TINT[priority]}`}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={!collapsed}
        className="flex w-full items-center gap-2 px-3 py-2 text-left"
      >
        <Chevron expanded={!collapsed} />
        <span className="text-sm font-medium">{priority}</span>
        <span className="text-xs text-slate-600">{totalCount}</span>
      </button>
      {!collapsed && (
        <div className="flex flex-col gap-1.5 border-t border-slate-200/70 bg-white/60 p-2">
          {nodes.length === 0 && (
            <div className="px-2 py-1 text-xs text-slate-400">No tasks</div>
          )}
          {nodes.map((node) => {
            const isEpic = node.children.length > 0 || /-EPIC-/.test(node.task.id);
            if (isEpic) {
              return (
                <EpicRow
                  key={node.task.id}
                  node={node}
                  tasknotesById={tasknotesById}
                  expandedId={expandedId}
                  setExpandedId={setExpandedId}
                  expanded={expandedEpicIds.has(node.task.id)}
                  toggleExpanded={() => toggleEpic(node.task.id)}
                  highlightId={highlightId}
                  navigateToTask={navigateToTask}
                />
              );
            }
            return (
              <TaskRow
                key={node.task.id}
                task={node.task}
                tasknotesById={tasknotesById}
                expandedId={expandedId}
                setExpandedId={setExpandedId}
                highlightId={highlightId}
                navigateToTask={navigateToTask}
              />
            );
          })}
        </div>
      )}
    </section>
  );
};

interface EpicRowProps {
  node: TaskNode;
  tasknotesById: Map<string, Tasknote>;
  expandedId: string | null;
  setExpandedId: (id: string | null) => void;
  expanded: boolean;
  toggleExpanded: () => void;
  highlightId: string | null;
  navigateToTask: (id: string) => void;
}

const EpicRow: React.FC<EpicRowProps> = ({
  node,
  tasknotesById,
  expandedId,
  setExpandedId,
  expanded,
  toggleExpanded,
  highlightId,
  navigateToTask,
}) => {
  const { task, children } = node;
  const done = children.filter((c) => c.completed).length;
  const total = children.length;
  return (
    <div
      id={`row-${task.id}`}
      className={`rounded border bg-white ${
        highlightId === task.id ? 'border-amber-400 ring-2 ring-amber-300' : 'border-slate-200'
      } transition-colors`}
    >
      <div className="flex items-center gap-2 px-2.5 py-1.5">
        <button
          type="button"
          onClick={toggleExpanded}
          aria-expanded={expanded}
          aria-label={expanded ? 'Collapse subtasks' : 'Expand subtasks'}
          className="flex h-5 w-5 shrink-0 items-center justify-center rounded hover:bg-slate-100"
        >
          <Chevron expanded={expanded} />
        </button>
        <TaskRowInner
          task={task}
          tasknotesById={tasknotesById}
          isExpandedDetail={expandedId === task.id}
          onToggleDetail={() => setExpandedId(expandedId === task.id ? null : task.id)}
          navigateToTask={navigateToTask}
          extraRightSlot={
            total > 0 ? (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700">
                {done}/{total} done
              </span>
            ) : null
          }
        />
      </div>
      {expanded && total > 0 && (
        <div className="flex flex-col gap-1 border-t border-slate-100 bg-slate-50/50 px-2 py-1.5">
          {children.map((c) => (
            <SubtaskRow
              key={c.id}
              task={c}
              highlightId={highlightId}
              navigateToTask={navigateToTask}
            />
          ))}
        </div>
      )}
      {expandedId === task.id && (
        <TaskDetail
          task={task}
          tasknote={tasknotesById.get(task.id)}
          navigateToTask={navigateToTask}
        />
      )}
    </div>
  );
};

interface TaskRowProps {
  task: Task;
  tasknotesById: Map<string, Tasknote>;
  expandedId: string | null;
  setExpandedId: (id: string | null) => void;
  highlightId: string | null;
  navigateToTask: (id: string) => void;
}

const TaskRow: React.FC<TaskRowProps> = ({
  task,
  tasknotesById,
  expandedId,
  setExpandedId,
  highlightId,
  navigateToTask,
}) => (
  <div
    id={`row-${task.id}`}
    className={`rounded border bg-white ${
      highlightId === task.id ? 'border-amber-400 ring-2 ring-amber-300' : 'border-slate-200'
    } transition-colors`}
  >
    <div className="flex items-center gap-2 px-2.5 py-1.5 pl-9">
      <TaskRowInner
        task={task}
        tasknotesById={tasknotesById}
        isExpandedDetail={expandedId === task.id}
        onToggleDetail={() => setExpandedId(expandedId === task.id ? null : task.id)}
        navigateToTask={navigateToTask}
      />
    </div>
    {expandedId === task.id && (
      <TaskDetail
        task={task}
        tasknote={tasknotesById.get(task.id)}
        navigateToTask={navigateToTask}
      />
    )}
  </div>
);

interface TaskRowInnerProps {
  task: Task;
  tasknotesById: Map<string, Tasknote>;
  isExpandedDetail: boolean;
  onToggleDetail: () => void;
  navigateToTask: (id: string) => void;
  extraRightSlot?: React.ReactNode;
}

const TaskRowInner: React.FC<TaskRowInnerProps> = ({
  task,
  tasknotesById,
  isExpandedDetail,
  onToggleDetail,
  navigateToTask,
  extraRightSlot,
}) => {
  const tn = tasknotesById.get(task.id);
  const fm = tn?.frontmatter ?? null;
  return (
    <div className="flex min-w-0 flex-1 items-center gap-2">
      <button
        type="button"
        onClick={onToggleDetail}
        aria-expanded={isExpandedDetail}
        className="flex min-w-0 flex-1 items-center gap-2 text-left"
      >
        <span className="shrink-0 font-mono text-xs font-medium tabular-nums">
          {task.id}
        </span>
        <span className="min-w-0 flex-1 truncate text-xs text-slate-700">
          {task.shortname ?? fm?.title ?? task.description}
        </span>
      </button>
      <div className="flex shrink-0 items-center justify-end gap-1.5 min-w-[30rem]">
        {!tn &&
          !extraRightSlot &&
          task.blockedBy.length === 0 &&
          task.relatedTasks.length === 0 && (
            <span className="rounded-full border border-dashed border-slate-300 px-2 py-0.5 text-[10px] text-slate-400">
              no tasknote
            </span>
          )}
        {tn && fm?.status !== 'starter' && <PhaseDots phases={tn.phases} />}
        {tn && tn.subtasksProgress.total > 0 && (
          <SubtaskProgress counts={tn.subtasksProgress} />
        )}
        {task.model && <ModelChip model={task.model} />}
        {fm && fm.tags.length > 0 && (
          <div className="flex items-center gap-1">
            {fm.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-700"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        {task.blockedBy.length > 0 && (
          <div className="flex items-center gap-1">
            {task.blockedBy.map((id) => (
              <BlockerChip key={id} id={id} onClick={() => navigateToTask(id)} />
            ))}
          </div>
        )}
        {(fm ? fm.relatedTasks : task.relatedTasks).length > 0 && (
          <div className="flex items-center gap-1">
            {(fm ? fm.relatedTasks : task.relatedTasks).map((id) => (
              <RelatedChip key={id} id={id} onClick={() => navigateToTask(id)} />
            ))}
          </div>
        )}
        {fm?.due && (
          <span className="rounded-full bg-indigo-100 px-1.5 py-0.5 text-[10px] text-indigo-800">
            due {fm.due}
          </span>
        )}
        {fm ? (
          <span
            className={`rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide ${STATUS_BADGE[fm.status]}`}
          >
            {STATUS_LABEL[fm.status]}
          </span>
        ) : (
          tasknotesById.has(task.id) &&
          !task.completed && (
            <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-amber-800">
              In progress
            </span>
          )
        )}
        {fm && (
          <span
            className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${PRIORITY_BADGE[fm.priority]}`}
          >
            {fm.priority}
          </span>
        )}
        {task.completed && task.completedDate && (
          <span className="text-[10px] text-slate-500">{task.completedDate}</span>
        )}
        {extraRightSlot}
        {tn && (
          <a
            href={`vscode://file${tn.path}`}
            className="text-[10px] text-slate-500 hover:text-slate-800 hover:underline"
            title="Open tasknote in VS Code"
          >
            VS Code →
          </a>
        )}
      </div>
    </div>
  );
};

interface SubtaskRowProps {
  task: Task;
  highlightId: string | null;
  navigateToTask: (id: string) => void;
}

const SubtaskRow: React.FC<SubtaskRowProps> = ({ task, highlightId, navigateToTask }) => (
  <div
    id={`row-${task.id}`}
    className={`flex items-center gap-2 rounded px-2 py-1 ${
      highlightId === task.id ? 'bg-amber-100 ring-1 ring-amber-300' : ''
    } transition-colors`}
  >
    <span
      aria-hidden
      className={`inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-sm border ${
        task.completed
          ? 'border-emerald-500 bg-emerald-500 text-white'
          : 'border-slate-300 bg-white'
      } text-[9px]`}
    >
      {task.completed ? '✓' : ''}
    </span>
    <button
      type="button"
      onClick={() => navigateToTask(task.id)}
      className="font-mono text-[11px] font-medium text-slate-700 hover:underline"
    >
      {task.id}
    </button>
    <span className="flex-1 truncate text-[11px] text-slate-600">{task.description}</span>
    {task.completed && task.completedDate && (
      <span className="text-[10px] text-slate-400">{task.completedDate}</span>
    )}
  </div>
);

const WIKILINK_TEXT = /\[\[([A-Z]+(?:-EPIC)?-\d+(?:\.\d+)?)\]\]/g;
const WIKILINK_HREF_PREFIX = '#wikilink-';

// Convert `[[TASK-ID]]` outside backtick code spans into a markdown link the
// `components.a` map below renders as a clickable button. Code spans are left
// untouched so literal `[[ID]]` examples render as code.
const wikilinkifyMarkdown = (text: string): string => {
  const segments = text.split(/(`[^`]*`)/g);
  return segments
    .map((seg, i) =>
      i % 2 === 1
        ? seg
        : seg.replace(WIKILINK_TEXT, (_m, id) => `[[[${id}]]](${WIKILINK_HREF_PREFIX}${id})`),
    )
    .join('');
};

const WikilinkMarkdown: React.FC<{
  markdown: string;
  navigateToTask: (id: string) => void;
}> = ({ markdown, navigateToTask }) => (
  <ReactMarkdown
    remarkPlugins={[remarkGfm]}
    components={{
      a: ({ href, children, ...props }) => {
        if (typeof href === 'string' && href.startsWith(WIKILINK_HREF_PREFIX)) {
          const id = href.slice(WIKILINK_HREF_PREFIX.length);
          return (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                navigateToTask(id);
              }}
              className="font-mono text-slate-700 hover:underline"
              title={`Jump to ${id}`}
            >
              {children}
            </button>
          );
        }
        return (
          <a href={href} {...props}>
            {children}
          </a>
        );
      },
    }}
  >
    {wikilinkifyMarkdown(markdown)}
  </ReactMarkdown>
);

const TaskDetail: React.FC<{
  task: Task;
  tasknote: Tasknote | undefined;
  navigateToTask: (id: string) => void;
}> = ({ task, tasknote, navigateToTask }) => {
  const isStarter = tasknote?.frontmatter?.status === 'starter';
  return (
    <div className="border-t border-slate-100 bg-slate-50/40 px-3 py-2 text-xs text-slate-700">
      {isStarter && tasknote ? (
        <DetailSection
          title="🌱 Starter context"
          markdown={tasknote.starterContext}
          navigateToTask={navigateToTask}
        />
      ) : tasknote ? (
        <>
          {tasknote.goal && (
            <DetailSection title="Goal" markdown={tasknote.goal} navigateToTask={navigateToTask} />
          )}
          {tasknote.acceptance && (
            <DetailSection
              title="Acceptance"
              markdown={tasknote.acceptance}
              navigateToTask={navigateToTask}
            />
          )}
          {tasknote.subtasks && (
            <DetailSection
              title="Subtasks"
              markdown={tasknote.subtasks}
              navigateToTask={navigateToTask}
            />
          )}
        </>
      ) : (
        <div className="prose prose-xs max-w-none [&_p]:my-1 [&_ul]:my-1 [&_li]:my-0 [&_input]:mr-1">
          <WikilinkMarkdown markdown={task.description} navigateToTask={navigateToTask} />
        </div>
      )}
    </div>
  );
};

const DetailSection: React.FC<{
  title: string;
  markdown: string;
  navigateToTask: (id: string) => void;
}> = ({ title, markdown, navigateToTask }) => (
  <div className="mb-2 last:mb-0">
    <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
      {title}
    </p>
    <div className="prose prose-xs max-w-none [&_p]:my-1 [&_ul]:my-1 [&_li]:my-0 [&_input]:mr-1">
      <WikilinkMarkdown markdown={markdown} navigateToTask={navigateToTask} />
    </div>
  </div>
);

const Chevron: React.FC<{ expanded: boolean }> = ({ expanded }) => (
  <span
    aria-hidden
    className={`inline-block text-[10px] text-slate-500 transition-transform ${
      expanded ? 'rotate-90' : ''
    }`}
  >
    ▶
  </span>
);

const PhaseDots: React.FC<{ phases: ChecklistCounts[] }> = ({ phases }) => {
  const activeIdx = activePhaseIndex(phases);
  return (
    <div
      className="flex items-center gap-0.5"
      title={`Active phase: ${activeIdx + 1} of 4`}
      aria-label={`Phase ${activeIdx + 1} of 4 active`}
    >
      {phases.map((_, i) => {
        const filled = i < activeIdx;
        const active = i === activeIdx;
        const cls = filled
          ? 'bg-emerald-500'
          : active
            ? 'bg-amber-400 ring-1 ring-amber-200'
            : 'bg-slate-200';
        return <span key={i} className={`h-1.5 w-1.5 rounded-full ${cls}`} />;
      })}
    </div>
  );
};

const SubtaskProgress: React.FC<{ counts: ChecklistCounts }> = ({ counts }) => {
  const pct = counts.total === 0 ? 0 : Math.round((counts.done / counts.total) * 100);
  return (
    <div
      className="flex items-center gap-1"
      title={`Subtasks: ${counts.done}/${counts.total}`}
      aria-label={`Subtasks ${counts.done} of ${counts.total} done`}
    >
      <div className="h-1.5 w-12 overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full bg-sky-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[10px] tabular-nums text-slate-500">
        {counts.done}/{counts.total}
      </span>
    </div>
  );
};

const ModelChip: React.FC<{ model: TaskModel }> = ({ model }) => (
  <span className="rounded border border-slate-200 px-1.5 py-0.5 text-[10px] font-mono text-slate-600">
    {model}
  </span>
);

const RelatedChip: React.FC<{ id: string; onClick: () => void }> = ({ id, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="rounded-full bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-700 hover:bg-slate-200"
    title={`Jump to ${id}`}
  >
    {id}
  </button>
);

const BlockerChip: React.FC<{ id: string; onClick: () => void }> = ({ id, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="rounded-full bg-rose-100 px-1.5 py-0.5 font-mono text-[10px] text-rose-800 hover:bg-rose-200"
    title={`Blocked by ${id}`}
  >
    ⛔ {id}
  </button>
);
