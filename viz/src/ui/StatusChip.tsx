import React from 'react';
import type { TasknoteStatus } from '../tasknote';
import type { DensityMode } from '../visibilityPrefs';
import { DENSITY_TOKENS, STATUS_BADGE, STATUS_CHIP_LABEL } from './constants';

export const StatusChip: React.FC<{ status: TasknoteStatus; density?: DensityMode }> = ({
  status,
  density = 'default',
}) => (
  <span
    className={`rounded ${DENSITY_TOKENS[density].chipPad} font-medium ${STATUS_BADGE[status]}`}
  >
    {STATUS_CHIP_LABEL[status]}
  </span>
);
