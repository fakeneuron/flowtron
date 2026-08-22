import React from 'react';
import type { TasknoteStatus } from '../tasknote';
import { STATUS_LABEL, STATUS_CHIP_LABEL } from './constants';
import { useDialog } from './useDialog';

interface ShortcutsModalProps {
  open: boolean;
  onClose: () => void;
}

const SHORTCUTS: { keys: string; description: string }[] = [
  { keys: '/', description: 'Focus search' },
  { keys: 'j / k', description: 'Navigate rows' },
  { keys: 'Enter', description: 'Expand row / toggle epic' },
  { keys: 'r', description: 'Refresh' },
  { keys: 'Esc', description: 'Close detail · clear filters' },
  { keys: '?', description: 'Show keyboard shortcuts' },
];

const STATUS_LEGEND: TasknoteStatus[] = [
  'starter',
  'not-started',
  'in-progress',
  'blocked',
  'completed',
];

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ open, onClose }) => {
  const dialogRef = useDialog(open, onClose);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="shortcuts-modal-title"
      className="rounded-lg border border-slate-200 bg-white p-0 text-slate-900 shadow-xl backdrop:bg-slate-900/40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
    >
      <div className="min-w-[18rem] p-4">
        <h2 id="shortcuts-modal-title" className="mb-3 text-base font-semibold">
          Keyboard shortcuts
        </h2>
        <table className="mb-4 w-full border-collapse text-sm">
          <tbody>
            {SHORTCUTS.map(({ keys, description }) => (
              <tr key={keys} className="border-b border-slate-100 last:border-0 dark:border-slate-800">
                <td className="py-1.5 pr-4">
                  <kbd className="rounded border border-slate-300 bg-slate-100 px-1.5 py-0.5 font-mono text-xs dark:border-slate-600 dark:bg-slate-800">
                    {keys}
                  </kbd>
                </td>
                <td className="py-1.5 text-slate-700 dark:text-slate-300">{description}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <h3 className="mb-1.5 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Status
        </h3>
        <ul className="mb-4 flex flex-wrap gap-x-4 gap-y-1 text-sm">
          {STATUS_LEGEND.map((s) => (
            <li key={s} className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
              <span aria-hidden>{STATUS_CHIP_LABEL[s]}</span>
              {STATUS_LABEL[s]}
            </li>
          ))}
        </ul>
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            autoFocus
            className="rounded bg-slate-800 px-3 py-1 text-sm text-white hover:bg-slate-700 focus:outline-hidden focus:ring-2 focus:ring-slate-400 dark:bg-slate-200 dark:text-slate-900 dark:hover:bg-slate-300 dark:focus:ring-slate-500"
          >
            Done
          </button>
        </div>
      </div>
    </dialog>
  );
};
