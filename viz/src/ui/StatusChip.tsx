import React from 'react';
import type { TasknoteStatus } from '../tasknote';
import { STATUS_BADGE } from './constants';

const STATUS_CHIP_LABEL: Record<TasknoteStatus, string> = {
  starter: '🌱 Starter',
  'not-started': '⚪ Not started',
  'in-progress': '🟢 In progress',
  blocked: '⏸ Blocked',
  completed: '✅ Completed',
};

export const StatusChip: React.FC<{ status: TasknoteStatus }> = ({ status }) => (
  <span className={`rounded px-1.5 py-0.5 font-medium ${STATUS_BADGE[status]}`}>
    {STATUS_CHIP_LABEL[status]}
  </span>
);
