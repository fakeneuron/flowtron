import React from 'react';
import type { TaskModel } from '../parser';

// Heavy-tier concrete tokens per SPEC/model.md §"Category-vs-concrete matching".
const HEAVY_MODELS = new Set(['opus', 'fable', 'mythos']);

export const ModelChip: React.FC<{ model: TaskModel }> = ({ model }) => {
  if (!HEAVY_MODELS.has(model)) return null;
  return <span className="text-xs">🧠</span>;
};
