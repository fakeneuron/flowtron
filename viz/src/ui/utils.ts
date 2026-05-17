import type { Task } from '../parser';
import type { Tasknote, TasknoteStatus } from '../tasknote';
import type { PaletteTokens } from './constants';

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

export function rowOutlineClass(
  palette: PaletteTokens,
  isHighlighted: boolean,
  isSelected: boolean,
): string {
  if (isHighlighted) return palette.ROW_HIGHLIGHT;
  if (isSelected) return palette.ROW_SELECTION;
  return palette.ROW_NEUTRAL;
}

export function epicRowOutlineClass(
  palette: PaletteTokens,
  isHighlighted: boolean,
  isSelected: boolean,
): string {
  if (isHighlighted) return palette.ROW_HIGHLIGHT;
  if (isSelected) return palette.ROW_SELECTION;
  return palette.EPIC_ROW_NEUTRAL;
}
