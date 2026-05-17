import React from 'react';
import type { TasknoteStatus } from '../tasknote';
import type { DensityMode } from '../visibilityPrefs';
import { DENSITY_TOKENS, STATUS_CHIP_LABEL } from './constants';
import { usePalette } from './VisibilityContext';

export const StatusChip: React.FC<{ status: TasknoteStatus; density?: DensityMode }> = ({
  status,
  density = 'default',
}) => {
  const palette = usePalette();
  return (
    <span
      className={`rounded ${DENSITY_TOKENS[density].chipPad} font-medium ${palette.STATUS_BADGE[status]}`}
    >
      {STATUS_CHIP_LABEL[status]}
    </span>
  );
};
