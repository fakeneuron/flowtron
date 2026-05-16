import React from 'react';
import type { TaskModel } from '../parser';

const LABEL: Record<TaskModel, string> = {
  opus: 'Opus',
  sonnet: 'Sonnet',
};

export const ModelChip: React.FC<{ model: TaskModel }> = ({ model }) => (
  <span className="rounded border border-slate-300 px-1.5 py-0.5 font-mono text-[10px] text-slate-700 dark:border-slate-600 dark:text-slate-300">
    {LABEL[model]}
  </span>
);
