import React from 'react';
import {
  DEFAULT_PREFS,
  DENSITY_MODES,
  PALETTE_NAMES,
  type DensityMode,
  type PaletteName,
  type VisibilityPrefs,
} from '../visibilityPrefs';
import { STARTER_SUBSECTION_KEYS } from '../tasknote';
import { STARTER_SUBSECTION_LABEL } from './constants';
import { useDialog } from './useDialog';

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
  prefs: VisibilityPrefs;
  onChange: (next: VisibilityPrefs) => void;
}

type RowChipKey = keyof VisibilityPrefs['rowChips'];
type DetailSectionKey = keyof VisibilityPrefs['detailSections'];
type StarterSectionKey = keyof VisibilityPrefs['starterSections'];

const ROW_CHIP_LABEL: Record<RowChipKey, string> = {
  id: 'Task ID',
  tags: 'Tags',
  model: 'Model',
  related: 'Related',
  blocked: 'Blocked',
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

const PALETTE_LABEL: Record<PaletteName, string> = {
  default: 'Default',
  linear: 'Linear',
  github: 'GitHub',
};

const ROW_CHIP_KEYS: RowChipKey[] = ['id', 'tags', 'model', 'related', 'blocked', 'due'];
const DETAIL_SECTION_KEYS: DetailSectionKey[] = ['goal', 'acceptance', 'subtasks'];

export const SettingsModal: React.FC<SettingsModalProps> = ({ open, onClose, prefs, onChange }) => {
  const dialogRef = useDialog(open, onClose);

  const setRowChip = (key: RowChipKey, value: boolean) => {
    onChange({ ...prefs, rowChips: { ...prefs.rowChips, [key]: value } });
  };
  const setDetailSection = (key: DetailSectionKey, value: boolean) => {
    onChange({ ...prefs, detailSections: { ...prefs.detailSections, [key]: value } });
  };
  const setStarterSection = (key: StarterSectionKey, value: boolean) => {
    onChange({ ...prefs, starterSections: { ...prefs.starterSections, [key]: value } });
  };
  const setDensity = (value: DensityMode) => {
    onChange({ ...prefs, density: value });
  };
  const setPalette = (value: PaletteName) => {
    onChange({ ...prefs, palette: value });
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
            {DENSITY_MODES.map((key) => (
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
            Palette
          </legend>
          <div className="flex items-center gap-4">
            {PALETTE_NAMES.map((key) => (
              <label key={key} className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="palette-mode"
                  value={key}
                  checked={prefs.palette === key}
                  onChange={() => setPalette(key)}
                />
                {PALETTE_LABEL[key]}
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
        <fieldset className="mb-4">
          <legend className="mb-1.5 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Starter context
          </legend>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
            {STARTER_SUBSECTION_KEYS.map((key) => (
              <label key={key} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={prefs.starterSections[key]}
                  onChange={(e) => setStarterSection(key, e.target.checked)}
                />
                {STARTER_SUBSECTION_LABEL[key]}
              </label>
            ))}
          </div>
        </fieldset>
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => onChange(DEFAULT_PREFS)}
            className="rounded border border-slate-300 bg-white px-2 py-1 text-sm text-slate-700 hover:bg-slate-50 focus:outline-hidden focus:ring-2 focus:ring-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:focus:ring-slate-500"
          >
            Reset to defaults
          </button>
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
