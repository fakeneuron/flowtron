import type { TasknoteStatus } from '../tasknote';

export const STATUS_LABEL: Record<TasknoteStatus, string> = {
  starter: '🌱 Starter',
  'not-started': 'Not started',
  'in-progress': 'In progress',
  blocked: 'Blocked',
  completed: 'Completed',
};

export const STATUS_BADGE: Record<TasknoteStatus, string> = {
  starter: 'bg-lime-100 text-lime-800',
  'not-started': 'bg-slate-100 text-slate-700',
  'in-progress': 'bg-amber-100 text-amber-800',
  blocked: 'bg-rose-100 text-rose-800',
  completed: 'bg-emerald-100 text-emerald-800',
};
