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

// Inbound `[[ID]]` references: who points at this task? Sources are
// `Task.relatedTasks` (PLAN long-description wikilinks; `Blocked by` already
// stripped by the parser) and `Tasknote.frontmatter.relatedTasks`. Same
// referrer counted once even when present in both.
export function buildInboundRefs(
  tasks: Task[],
  tasknotesById: Map<string, Tasknote>,
): Map<string, Set<string>> {
  const refs = new Map<string, Set<string>>();
  const add = (target: string, source: string) => {
    if (target === source) return;
    let set = refs.get(target);
    if (!set) {
      set = new Set();
      refs.set(target, set);
    }
    set.add(source);
  };
  for (const task of tasks) {
    for (const id of task.relatedTasks) add(id, task.id);
  }
  for (const tn of tasknotesById.values()) {
    for (const id of tn.frontmatter?.relatedTasks ?? []) add(id, tn.id);
  }
  return refs;
}
