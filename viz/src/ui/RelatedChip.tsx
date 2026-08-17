import React from 'react';
import type { DensityMode } from '../visibilityPrefs';
import { DENSITY_TOKENS } from './constants';

const MAX_VISIBLE = 3;

type ChipTone = 'slate' | 'rose';

const TONE: Record<ChipTone, { chip: string; glyph: string }> = {
  slate: {
    chip: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    glyph: 'text-slate-500 dark:text-slate-400',
  },
  rose: {
    chip: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200',
    glyph: 'text-rose-600 dark:text-rose-400',
  },
};

export const RelatedChip: React.FC<{
  ids: string[];
  density?: DensityMode;
  glyph?: string;
  tone?: ChipTone;
}> = ({ ids, density = 'default', glyph = '→', tone = 'slate' }) => {
  if (ids.length === 0) return null;
  const visible = ids.slice(0, MAX_VISIBLE);
  const overflow = ids.length - visible.length;
  const colors = TONE[tone];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded ${colors.chip} ${DENSITY_TOKENS[density].chipPad} text-xs`}
    >
      <span aria-hidden className={colors.glyph}>
        {glyph}
      </span>
      <span className="font-mono">{visible.join(' ')}</span>
      {overflow > 0 && <span className={colors.glyph}>+{overflow}</span>}
    </span>
  );
};
