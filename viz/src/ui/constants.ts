import type { TasknoteStatus } from '../tasknote';

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

export const PILL_ACTIVE = 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900';
export const PILL_DEFAULT_SLATE = 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700';
