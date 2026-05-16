import React from 'react';
import type { DensityMode } from '../visibilityPrefs';
import { DENSITY_TOKENS } from './constants';

const MAX_VISIBLE = 3;

export const RelatedChip: React.FC<{ ids: string[]; density?: DensityMode }> = ({
  ids,
  density = 'default',
}) => {
  if (ids.length === 0) return null;
  const visible = ids.slice(0, MAX_VISIBLE);
  const overflow = ids.length - visible.length;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded bg-slate-100 ${DENSITY_TOKENS[density].chipPad} text-[10px] text-slate-700 dark:bg-slate-800 dark:text-slate-300`}
    >
      <span aria-hidden className="text-slate-500 dark:text-slate-400">
        →
      </span>
      <span className="font-mono">{visible.join(' ')}</span>
      {overflow > 0 && (
        <span className="text-slate-500 dark:text-slate-400">+{overflow}</span>
      )}
    </span>
  );
};
