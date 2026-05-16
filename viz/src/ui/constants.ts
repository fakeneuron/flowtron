import type { Priority } from '../parser';
import type { TasknoteStatus } from '../tasknote';

/**
 * Viz UI token registry — semantic mapping for typography + color.
 *
 * **Typography scale (4-step, size-only).** Composition modifiers
 * (`font-mono`, `font-medium`, `font-semibold`, `tabular-nums`,
 * `uppercase`) apply alongside the role token at the use site.
 *
 * | Role       | Tailwind size  | Examples                                                            |
 * |------------|----------------|---------------------------------------------------------------------|
 * | `heading`  | `text-lg`      | H1 in App header                                                    |
 * | `subhead`  | `text-sm`      | Section headers, search input, ⓘ button, ThemeToggle, error banner |
 * | `body`     | `text-xs`      | Task IDs, row titles, stats caption, filter pills, "No tasks"      |
 * | `caption`  | `text-[10px]`  | Chips, metadata rows, chevron, detail labels, subtask date         |
 *
 * Off-grid sizes (`text-[11px]`, `text-[9px]`) are deprecated — fold to
 * `body` and `caption` respectively (CORE-098.2).
 *
 * **Color semantic mapping.** Amber is the *state/attention* family:
 * in-progress status (`STATUS_BADGE['in-progress']`), active-phase
 * (`PHASE_DOT.active`), Medium-priority section + badge. Row highlight
 * moved to indigo (CORE-098.2) to resolve the amber-collision when a
 * Medium-priority in-progress row was momentarily highlighted.
 */

export const TYPOGRAPHY = {
  heading: 'text-lg',
  subhead: 'text-sm',
  body: 'text-xs',
  caption: 'text-[10px]',
} as const;

export const STATUS_LABEL: Record<TasknoteStatus, string> = {
  starter: '🌱 Starter',
  'not-started': 'Not started',
  'in-progress': 'In progress',
  blocked: 'Blocked',
  completed: 'Completed',
};

export const STATUS_CHIP_LABEL: Record<TasknoteStatus, string> = {
  starter: '🌱 Starter',
  'not-started': '⚪ Not started',
  'in-progress': '🟢 In progress',
  blocked: '⏸ Blocked',
  completed: '✅ Completed',
};

export const STATUS_BADGE: Record<TasknoteStatus, string> = {
  starter: 'bg-lime-100 text-lime-800 dark:bg-lime-950 dark:text-lime-200',
  'not-started': 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  'in-progress': 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200',
  blocked: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200',
  completed: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200',
};

export const SECTION_TINT: Record<Priority, string> = {
  Critical: 'bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-900',
  High: 'bg-orange-50 border-orange-200 dark:bg-orange-950/30 dark:border-orange-900',
  Medium: 'bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-900',
  Low: 'bg-sky-50 border-sky-200 dark:bg-sky-950/30 dark:border-sky-900',
  'Future Opportunities':
    'bg-violet-50 border-violet-200 dark:bg-violet-950/30 dark:border-violet-900',
  Completed: 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-900',
};

export const PRIORITY_BADGE: Record<Priority, string> = {
  Critical: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200',
  High: 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-200',
  Medium: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200',
  Low: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-200',
  'Future Opportunities':
    'bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-200',
  Completed: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200',
};

export const PHASE_DOT = {
  filled: 'bg-emerald-500',
  active: 'bg-amber-400 ring-1 ring-amber-200 dark:ring-amber-700',
  inactive: 'bg-slate-200 dark:bg-slate-700',
} as const;

export const ROW_HIGHLIGHT =
  'border-indigo-400 ring-2 ring-indigo-300 dark:border-indigo-500 dark:ring-indigo-600';
export const ROW_HIGHLIGHT_SUBTASK =
  'bg-indigo-100 ring-1 ring-indigo-300 dark:bg-indigo-900/30 dark:ring-indigo-700';
export const ROW_SELECTION =
  'border-slate-200 ring-2 ring-sky-400 dark:border-slate-800 dark:ring-sky-600';
export const ROW_SELECTION_SUBTASK = 'ring-1 ring-sky-400 dark:ring-sky-600';
export const ROW_NEUTRAL = 'border-slate-200 dark:border-slate-800';

export const PILL_ACTIVE = 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900';
export const PILL_DEFAULT_SLATE = 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700';
