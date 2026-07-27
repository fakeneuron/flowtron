import React from 'react';
import type { TaskModel } from '../parser';

const HEAVY_MODELS = new Set(['opus', 'fable']);

export const ModelChip: React.FC<{ model: TaskModel }> = ({ model }) => {
  if (!HEAVY_MODELS.has(model)) return null;
  return <span className="text-xs">🧠</span>;
};
