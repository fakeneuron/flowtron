import React from 'react';
import type { TaskModel } from '../parser';

// Heavy-tier concrete tokens, plus the 'heavy' category token itself, per
// SPEC/model.md §"Category-vs-concrete matching".
const HEAVY_MODELS = new Set(['opus', 'fable', 'mythos', 'heavy']);

export const ModelChip: React.FC<{ model: TaskModel }> = ({ model }) => {
  if (!HEAVY_MODELS.has(model)) return null;
  return <span className="text-xs">🧠</span>;
};
