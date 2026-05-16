import React from 'react';
import type { TaskModel } from '../parser';
import type { DensityMode } from '../visibilityPrefs';
import { DENSITY_TOKENS } from './constants';

const LABEL: Record<TaskModel, string> = {
  opus: 'Opus',
  sonnet: 'Sonnet',
};

export const ModelChip: React.FC<{ model: TaskModel; density?: DensityMode }> = ({
  model,
  density = 'default',
}) => (
  <span
    className={`rounded border border-slate-300 ${DENSITY_TOKENS[density].chipPad} font-mono text-[10px] text-slate-700 dark:border-slate-600 dark:text-slate-300`}
  >
    {LABEL[model]}
  </span>
);
