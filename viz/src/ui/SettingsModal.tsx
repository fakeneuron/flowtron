import React, { useEffect, useRef } from 'react';
import { DEFAULT_PREFS, type DensityMode, type VisibilityPrefs } from '../visibilityPrefs';

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
  prefs: VisibilityPrefs;
  onChange: (next: VisibilityPrefs) => void;
}

type RowChipKey = keyof VisibilityPrefs['rowChips'];
type DetailSectionKey = keyof VisibilityPrefs['detailSections'];

const ROW_CHIP_LABEL: Record<RowChipKey, string> = {
  tags: 'Tags',
  model: 'Model',
  related: 'Related',
  due: 'Due date',
};

const DETAIL_SECTION_LABEL: Record<DetailSectionKey, string> = {
  goal: 'Goal',
  acceptance: 'Acceptance',
  subtasks: 'Subtasks',
};

const DENSITY_LABEL: Record<DensityMode, string> = {
  comfortable: 'Comfortable',
  default: 'Default',
  compact: 'Compact',
};

const ROW_CHIP_KEYS: RowChipKey[] = ['tags', 'model', 'related', 'due'];
const DETAIL_SECTION_KEYS: DetailSectionKey[] = ['goal', 'acceptance', 'subtasks'];
const DENSITY_KEYS: DensityMode[] = ['comfortable', 'default', 'compact'];

export const SettingsModal: React.FC<SettingsModalProps> = ({ open, onClose, prefs, onChange }) => {
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

  const setRowChip = (key: RowChipKey, value: boolean) => {
    onChange({ ...prefs, rowChips: { ...prefs.rowChips, [key]: value } });
  };
  const setDetailSection = (key: DetailSectionKey, value: boolean) => {
    onChange({ ...prefs, detailSections: { ...prefs.detailSections, [key]: value } });
  };
  const setDensity = (value: DensityMode) => {
    onChange({ ...prefs, density: value });
  };

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="settings-modal-title"
      className="rounded-lg border border-slate-200 bg-white p-0 text-slate-900 shadow-xl backdrop:bg-slate-900/40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
    >
      <div className="min-w-[20rem] p-4">
        <h2 id="settings-modal-title" className="mb-3 text-base font-semibold">
          Settings
        </h2>
        <fieldset className="mb-4">
          <legend className="mb-1.5 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Row chips
          </legend>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
            {ROW_CHIP_KEYS.map((key) => (
              <label key={key} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={prefs.rowChips[key]}
                  onChange={(e) => setRowChip(key, e.target.checked)}
                />
                {ROW_CHIP_LABEL[key]}
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset className="mb-4">
          <legend className="mb-1.5 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Density
          </legend>
          <div className="flex items-center gap-4">
            {DENSITY_KEYS.map((key) => (
              <label key={key} className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="density-mode"
                  value={key}
                  checked={prefs.density === key}
                  onChange={() => setDensity(key)}
                />
                {DENSITY_LABEL[key]}
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset className="mb-4">
          <legend className="mb-1.5 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Detail panel
          </legend>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
            {DETAIL_SECTION_KEYS.map((key) => (
              <label key={key} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={prefs.detailSections[key]}
                  onChange={(e) => setDetailSection(key, e.target.checked)}
                />
                {DETAIL_SECTION_LABEL[key]}
              </label>
            ))}
          </div>
        </fieldset>
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => onChange(DEFAULT_PREFS)}
            className="rounded border border-slate-300 bg-white px-2 py-1 text-sm text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Reset to defaults
          </button>
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            autoFocus
            className="rounded bg-slate-800 px-3 py-1 text-sm text-white hover:bg-slate-700 dark:bg-slate-200 dark:text-slate-900 dark:hover:bg-slate-300"
          >
            Done
          </button>
        </div>
      </div>
    </dialog>
  );
};
