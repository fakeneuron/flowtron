import { isEpic, type Priority, type Task, type TaskNode } from '../parser';
import type { Tasknote, TasknoteStatus } from '../tasknote';
import { displaySection, effectiveStatus, groupBy } from './utils';

// The pure view-model pipeline behind App's derived state: filter → prune →
// group → visible ids / counts. Extracted from App.tsx (FE-94.3) so the
// semantics below are unit-testable without driving the DOM. No React here —
// App keeps the useMemo/useCallback boundaries and their dependency arrays.

export function matchesFilter(
  task: Task,
  tasknotesById: Map<string, Tasknote>,
  query: string,
  statusFilter: Set<TasknoteStatus>,
): boolean {
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
}

// Single derived tree for count, render, and keyboard-nav: keep a parent
// when it or any child matches, but prune non-matching children so "N of M
// matching" and j/k stops never include hidden rows (CORE-432.3).
export function pruneMatchingNodes(
  nodes: TaskNode[],
  matches: (task: Task) => boolean,
): TaskNode[] {
  return nodes.flatMap((n) => {
    const filteredChildren = n.children.filter(matches);
    // Reuse the original children/node references when filtering removed
    // nothing, so a re-render triggered by an unrelated query change doesn't
    // also invalidate React.memo on every unaffected row (FE-101.4).
    const children =
      filteredChildren.length === n.children.length ? n.children : filteredChildren;
    if (!matches(n.task) && children.length === 0) return [];
    if (children === n.children && matches(n.task)) return [n];
    return [{ task: n.task, children }];
  });
}

export function groupBySection(nodes: TaskNode[]): Record<Priority, TaskNode[]> {
  const grouped = groupBy(nodes, (n) => displaySection(n.task));
  const high = grouped.High;
  if (high && high.length > 1) {
    // Critical-flagged tasks rise to the top of High (FE-044). Stable sort
    // preserves source order within the flagged and un-flagged groups.
    grouped.High = [...high].sort((a, b) => Number(b.task.critical) - Number(a.task.critical));
  }
  return grouped;
}

export function emptySections(
  sections: readonly Priority[],
  bySection: Record<Priority, TaskNode[]>,
): Priority[] {
  return sections.filter((p) => (bySection[p] ?? []).length === 0);
}

export function collectEpicIds(nodes: TaskNode[]): Set<string> {
  const set = new Set<string>();
  for (const node of nodes) {
    if (isEpic(node)) set.add(node.task.id);
  }
  return set;
}

export function collectVisibleIds(
  sections: readonly Priority[],
  bySection: Record<Priority, TaskNode[]>,
  collapsedSections: Set<Priority>,
  expandedEpicIds: Set<string>,
): string[] {
  const ids: string[] = [];
  for (const p of sections) {
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
}

export function countFiltered(nodes: TaskNode[]): number {
  return nodes.reduce((sum, n) => sum + 1 + n.children.length, 0);
}

export function countInProgress(
  tasks: Task[],
  tasknotesById: Map<string, Tasknote>,
): number {
  return tasks.filter((t) => {
    const tn = tasknotesById.get(t.id);
    const s = effectiveStatus(t, tn);
    if (s) return s === 'in-progress';
    return tasknotesById.has(t.id) && !t.completed;
  }).length;
}

export function countStarters(
  tasks: Task[],
  tasknotesById: Map<string, Tasknote>,
): number {
  return tasks.filter((t) => tasknotesById.get(t.id)?.frontmatter?.status === 'starter').length;
}
