import React from 'react';
import type { DensityMode } from '../visibilityPrefs';
import { DENSITY_TOKENS } from './constants';
import { usePalette } from './VisibilityContext';

export const CriticalChip: React.FC<{ density: DensityMode }> = ({ density }) => {
  const palette = usePalette();
  return (
    <span
      className={`rounded ${palette.CRITICAL_FLAG} ${DENSITY_TOKENS[density].chipPad} text-xs font-medium`}
      title="Critical"
      aria-label="Critical"
    >
      !
    </span>
  );
};
