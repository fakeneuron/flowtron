import React from 'react';
import type { TaskModel } from '../parser';

export const ModelChip: React.FC<{ model: TaskModel }> = ({ model }) => {
  if (model !== 'opus' && model !== 'fable') return null;
  return <span className="text-xs">🧠</span>;
};
