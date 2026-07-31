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
// authoritatively done regardless of frontmatter status. Phase 4 closure now
// asserts the `status: completed` flip (SPEC §"🚀 Phase 4: Closure"), but this
// fallback stays: adopters pinned to a pre-fix flowtron keep producing
// `in-progress` archives, and the oldest archives predate frontmatter entirely.
export function effectiveStatus(task: Task, tn: Tasknote | undefined): TasknoteStatus | null {
  if (task.completed) return 'completed';
  return tn?.frontmatter?.status ?? null;
}

// Version-currency of an adopter's pinned flowtron release vs the latest
// released tag. 'unknown' (no pinned version readable, or no tag resolved —
// e.g. the flowtron checkout itself) renders no dot: unknown ≠ stale.
type VersionCurrency = 'current' | 'behind' | 'unknown';

export function versionCurrency(
  version: string | null,
  latestRelease: string | null,
): VersionCurrency {
  if (!version || !latestRelease) return 'unknown';
  return version === latestRelease ? 'current' : 'behind';
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

export function splitHighlight(
  text: string,
  query: string,
): Array<{ text: string; matched: boolean }> {
  const q = query.trim();
  if (!q) return [{ text, matched: false }];

  const lq = q.toLowerCase();
  const lt = text.toLowerCase();
  const segments: Array<{ text: string; matched: boolean }> = [];
  let cursor = 0;

  while (cursor < text.length) {
    const i = lt.indexOf(lq, cursor);
    if (i === -1) {
      segments.push({ text: text.slice(cursor), matched: false });
      break;
    }
    if (i > cursor) segments.push({ text: text.slice(cursor, i), matched: false });
    segments.push({ text: text.slice(i, i + lq.length), matched: true });
    cursor = i + lq.length;
  }

  return segments;
}
