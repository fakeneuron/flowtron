import React, { useEffect, useRef } from 'react';

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

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ open, onClose }) => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const handleClose = () => onClose();
    const handleClick = (e: MouseEvent) => {
      if (e.target === dialog) dialog.close();
    };
    dialog.addEventListener('close', handleClose);
    dialog.addEventListener('click', handleClick);
    return () => {
      dialog.removeEventListener('close', handleClose);
      dialog.removeEventListener('click', handleClick);
    };
  }, [onClose]);

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
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            autoFocus
            className="rounded bg-slate-800 px-3 py-1 text-sm text-white hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:bg-slate-200 dark:text-slate-900 dark:hover:bg-slate-300 dark:focus:ring-slate-500"
          >
            Done
          </button>
        </div>
      </div>
    </dialog>
  );
};
