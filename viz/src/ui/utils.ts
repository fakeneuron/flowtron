import type { Task } from '../parser';
import type { Tasknote, TasknoteStatus } from '../tasknote';

export function groupBy<T, K extends string | number>(
  items: T[],
  keySelector: (item: T) => K,
): Record<K, T[]> {
  const groups = {} as Record<K, T[]>;
  for (const item of items) {
    const key = keySelector(item);
    if (!Object.prototype.hasOwnProperty.call(groups, key)) {
      groups[key] = [];
    }
    groups[key].push(item);
  }
  return groups;
}

// PLAN.md wins on completion: if the row is `[x]` in PLAN.md, the row is
// authoritatively done regardless of frontmatter status (some archives still
// say `in-progress` because of closure-protocol drift).
export function effectiveStatus(task: Task, tn: Tasknote | undefined): TasknoteStatus | null {
  if (task.completed) return 'completed';
  return tn?.frontmatter?.status ?? null;
}

export function rowOutlineClass(isHighlighted: boolean, isSelected: boolean): string {
  if (isHighlighted)
    return 'border-amber-400 ring-2 ring-amber-300 dark:border-amber-500 dark:ring-amber-600';
  if (isSelected)
    return 'border-slate-200 ring-2 ring-sky-400 dark:border-slate-800 dark:ring-sky-600';
  return 'border-slate-200 dark:border-slate-800';
}
