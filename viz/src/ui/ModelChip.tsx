import React from 'react';
import type { TaskModel } from '../parser';

export const ModelChip: React.FC<{ model: TaskModel }> = ({ model }) => (
  <span className="rounded border border-slate-200 px-1.5 py-0.5 text-[10px] font-mono text-slate-600">
    {model}
  </span>
);
