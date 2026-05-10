import React from 'react';
import type { TasknoteStatus } from '../tasknote';
import { STATUS_BADGE, STATUS_CHIP_LABEL } from './constants';

export const StatusChip: React.FC<{ status: TasknoteStatus }> = ({ status }) => (
  <span className={`rounded px-1.5 py-0.5 font-medium ${STATUS_BADGE[status]}`}>
    {STATUS_CHIP_LABEL[status]}
  </span>
);
