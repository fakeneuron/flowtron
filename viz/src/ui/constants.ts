import type { Priority } from '../parser';
import type { TasknoteStatus } from '../tasknote';
import type { DensityMode, PaletteName } from '../visibilityPrefs';

/**
 * Viz UI token registry — semantic mapping for typography, color, and density.
 *
 * **Typography scale (4-step, size-only).** Composition modifiers
 * (`font-mono`, `font-medium`, `font-semibold`, `tabular-nums`,
 * `uppercase`) apply alongside the role token at the use site.
 *
 * | Role       | Tailwind size  | Examples                                                            |
 * |------------|----------------|---------------------------------------------------------------------|
 * | `heading`  | `text-lg`      | H1 in App header                                                    |
 * | `subhead`  | `text-base`    | Section headers, search input, ⓘ button, ThemeToggle, error banner |
 * | `body`     | `text-sm`      | Task IDs, row titles, stats caption, filter pills, "No tasks"      |
 * | `caption`  | `text-xs`      | Chips, metadata rows, chevron, detail labels, subtask date         |
 *
 * Scale bumped one step at subhead/body/caption tiers (CORE-098.12).
 * Off-grid sizes (`text-[11px]`, `text-[9px]`) are deprecated — fold to
 * `body` and `caption` respectively (CORE-098.2).
 *
 * **Color palettes (FE-033.2).** Colors live in `PALETTES`, a
 * `Record<PaletteName, PaletteTokens>` keyed by user-selectable palette
 * (default / linear / github). Each palette ships the full 12-token bag
 * with light + dark variants baked into one Tailwind className per token
 * (Tailwind's `dark:` variant prefix resolves light/dark at CSS time).
 * The active palette is read via `usePalette()` (see `VisibilityContext`).
 *
 * **Default-palette semantic invariants (post-CORE-098.2)** — amber is the
 * *state/attention* family: in-progress status, active phase dot, Medium
 * priority section + badge. Row highlight uses indigo (CORE-098.2 collision
 * fix). `.3` (Linear) and `.4` (GitHub) curate their own hue→role bindings,
 * but every palette must keep the 5 status roles + 5 priority roles +
 * critical flag + highlight + selection visually distinct, and clear
 * FE-019's ≥4.5:1 small-text contrast in both light and dark.
 */

export const TYPOGRAPHY = {
  heading: 'text-lg',
  subhead: 'text-base',
  body: 'text-sm',
  caption: 'text-xs',
} as const;

export const STATUS_LABEL: Record<TasknoteStatus, string> = {
  starter: 'Starter',
  'not-started': 'Not started',
  'in-progress': 'In progress',
  blocked: 'Blocked',
  completed: 'Completed',
};

export const STATUS_CHIP_LABEL: Record<TasknoteStatus, string> = {
  starter: '◎',
  'not-started': '⚪',
  'in-progress': '●',
  blocked: '⏸',
  completed: '✓',
};

export interface PaletteTokens {
  STATUS_BADGE: Record<TasknoteStatus, string>;
  SECTION_TINT: Record<Priority, string>;
  PRIORITY_BADGE: Record<Priority, string>;
  CRITICAL_FLAG: string;
  PHASE_DOT: { filled: string; active: string; inactive: string };
  ROW_HIGHLIGHT: string;
  ROW_HIGHLIGHT_SUBTASK: string;
  ROW_SELECTION: string;
  ROW_SELECTION_SUBTASK: string;
  ROW_NEUTRAL: string;
  EPIC_ROW_NEUTRAL: string;
}

const DEFAULT_PALETTE: PaletteTokens = {
  STATUS_BADGE: {
    starter: 'bg-lime-100 text-lime-800 dark:bg-lime-950 dark:text-lime-200',
    'not-started': 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    'in-progress': 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200',
    blocked: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200',
    completed: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200',
  },
  SECTION_TINT: {
    High: 'bg-orange-50 border-orange-200 dark:bg-orange-950/30 dark:border-orange-900',
    Medium: 'bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-900',
    Low: 'bg-sky-50 border-sky-200 dark:bg-sky-950/30 dark:border-sky-900',
    'Future Opportunities':
      'bg-violet-50 border-violet-200 dark:bg-violet-950/30 dark:border-violet-900',
    Completed: 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-900',
  },
  PRIORITY_BADGE: {
    High: 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-200',
    Medium: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200',
    Low: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-200',
    'Future Opportunities':
      'bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-200',
    Completed: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200',
  },
  CRITICAL_FLAG: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200',
  PHASE_DOT: {
    filled: 'bg-emerald-500',
    active: 'bg-amber-400 ring-1 ring-amber-200 dark:ring-amber-700',
    inactive: 'bg-slate-500 dark:bg-slate-400',
  },
  ROW_HIGHLIGHT:
    'border-indigo-400 ring-2 ring-indigo-300 dark:border-indigo-500 dark:ring-indigo-600',
  ROW_HIGHLIGHT_SUBTASK:
    'bg-indigo-100 ring-1 ring-indigo-300 dark:bg-indigo-900/30 dark:ring-indigo-700',
  ROW_SELECTION: 'border-slate-200 ring-2 ring-sky-400 dark:border-slate-800 dark:ring-sky-600',
  ROW_SELECTION_SUBTASK: 'ring-1 ring-sky-400 dark:ring-sky-600',
  ROW_NEUTRAL: 'border-slate-200 dark:border-slate-800',
  EPIC_ROW_NEUTRAL: 'border-slate-300 dark:border-slate-700',
};

const LINEAR_PALETTE: PaletteTokens = {
  STATUS_BADGE: {
    starter: 'bg-lime-100 text-lime-800 dark:bg-lime-950 dark:text-lime-200',
    'not-started': 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    'in-progress': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-200',
    blocked: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200',
    completed: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200',
  },
  SECTION_TINT: {
    High: 'bg-slate-50 border-amber-300 dark:bg-slate-900/50 dark:border-amber-800',
    Medium: 'bg-slate-50 border-indigo-300 dark:bg-slate-900/50 dark:border-indigo-800',
    Low: 'bg-slate-50 border-sky-300 dark:bg-slate-900/50 dark:border-sky-800',
    'Future Opportunities':
      'bg-slate-50 border-violet-300 dark:bg-slate-900/50 dark:border-violet-800',
    Completed: 'bg-slate-50 border-emerald-300 dark:bg-slate-900/50 dark:border-emerald-800',
  },
  PRIORITY_BADGE: {
    High: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200',
    Medium: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-200',
    Low: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-200',
    'Future Opportunities':
      'bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-200',
    Completed: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200',
  },
  CRITICAL_FLAG: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200',
  PHASE_DOT: {
    filled: 'bg-emerald-500',
    active: 'bg-amber-400 ring-1 ring-amber-200 dark:ring-amber-700',
    inactive: 'bg-slate-500 dark:bg-slate-400',
  },
  ROW_HIGHLIGHT:
    'border-indigo-400 ring-2 ring-indigo-300 dark:border-indigo-500 dark:ring-indigo-600',
  ROW_HIGHLIGHT_SUBTASK:
    'bg-indigo-100 ring-1 ring-indigo-300 dark:bg-indigo-900/30 dark:ring-indigo-700',
  ROW_SELECTION: 'border-slate-200 ring-2 ring-teal-400 dark:border-slate-800 dark:ring-teal-600',
  ROW_SELECTION_SUBTASK: 'ring-1 ring-teal-400 dark:ring-teal-600',
  ROW_NEUTRAL: 'border-slate-200 dark:border-slate-800',
  EPIC_ROW_NEUTRAL: 'border-slate-300 dark:border-slate-700',
};

const GITHUB_PALETTE: PaletteTokens = {
  STATUS_BADGE: {
    starter: 'bg-lime-100 text-lime-800 dark:bg-lime-950 dark:text-lime-200',
    'not-started': 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    'in-progress': 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200',
    blocked: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200',
    completed: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200',
  },
  SECTION_TINT: {
    High: 'bg-purple-50 border-purple-200 dark:bg-purple-950/30 dark:border-purple-900',
    Medium: 'bg-violet-50 border-violet-200 dark:bg-violet-950/30 dark:border-violet-900',
    Low: 'bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-900',
    'Future Opportunities':
      'bg-cyan-50 border-cyan-200 dark:bg-cyan-950/30 dark:border-cyan-900',
    Completed: 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-900',
  },
  PRIORITY_BADGE: {
    High: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-200',
    Medium: 'bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-200',
    Low: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200',
    'Future Opportunities':
      'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-200',
    Completed: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200',
  },
  CRITICAL_FLAG: 'bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-950 dark:text-fuchsia-200',
  PHASE_DOT: {
    filled: 'bg-emerald-500',
    active: 'bg-blue-400 ring-1 ring-blue-200 dark:ring-blue-700',
    inactive: 'bg-slate-500 dark:bg-slate-400',
  },
  ROW_HIGHLIGHT:
    'border-yellow-400 ring-2 ring-yellow-300 dark:border-yellow-500 dark:ring-yellow-600',
  ROW_HIGHLIGHT_SUBTASK:
    'bg-yellow-100 ring-1 ring-yellow-300 dark:bg-yellow-900/30 dark:ring-yellow-700',
  ROW_SELECTION: 'border-slate-200 ring-2 ring-pink-400 dark:border-slate-800 dark:ring-pink-600',
  ROW_SELECTION_SUBTASK: 'ring-1 ring-pink-400 dark:ring-pink-600',
  ROW_NEUTRAL: 'border-slate-200 dark:border-slate-800',
  EPIC_ROW_NEUTRAL: 'border-slate-300 dark:border-slate-700',
};

export const PALETTES: Record<PaletteName, PaletteTokens> = {
  default: DEFAULT_PALETTE,
  linear: LINEAR_PALETTE,
  github: GITHUB_PALETTE,
};

/**
 * Density tokens (CORE-098.4). Three opt-in modes selectable from the
 * settings modal: Default = today's spacing (post-FE-031 lean baseline);
 * Comfortable adds one step of breathing room; Compact tightens one step.
 * Scope: row-surface only — TaskDetail and header chrome stay fixed.
 * Chip text size stays on `TYPOGRAPHY.caption`; density scales padding.
 */
export interface DensityTokens {
  rowPad: string;
  subtaskRowPad: string;
  subtaskContainerPad: string;
  sectionInteriorPad: string;
  interRowGap: string;
  subtaskInterRowGap: string;
  betweenSectionsGap: string;
  chipPad: string;
}

export const DENSITY_TOKENS: Record<DensityMode, DensityTokens> = {
  comfortable: {
    rowPad: 'px-3 py-2',
    subtaskRowPad: 'px-2.5 py-1.5',
    subtaskContainerPad: 'px-2.5 py-2',
    sectionInteriorPad: 'p-3',
    interRowGap: 'gap-2',
    subtaskInterRowGap: 'gap-1.5',
    betweenSectionsGap: 'gap-4',
    chipPad: 'px-2 py-1',
  },
  default: {
    rowPad: 'px-2.5 py-1.5',
    subtaskRowPad: 'px-2 py-1',
    subtaskContainerPad: 'px-2 py-1.5',
    sectionInteriorPad: 'p-2',
    interRowGap: 'gap-1.5',
    subtaskInterRowGap: 'gap-1',
    betweenSectionsGap: 'gap-3',
    chipPad: 'px-1.5 py-0.5',
  },
  compact: {
    rowPad: 'px-2 py-1',
    subtaskRowPad: 'px-1.5 py-0.5',
    subtaskContainerPad: 'px-1.5 py-1',
    sectionInteriorPad: 'p-1.5',
    interRowGap: 'gap-1',
    subtaskInterRowGap: 'gap-0.5',
    betweenSectionsGap: 'gap-2',
    chipPad: 'px-1 py-0',
  },
};
