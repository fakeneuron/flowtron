import React from 'react';
import type { TaskModel } from '../parser';

// Heavy-tier concrete tokens, plus the 'heavy' category token itself, per
// SPEC/model.md §"Tier ladder vs. the next-move suggestion glyph".
const HEAVY_MODELS = new Set(['opus', 'fable', 'mythos', 'heavy']);

// 'xheavy' is manual-only — no concrete token buckets to it (same section).
const XHEAVY_MODELS = new Set(['xheavy']);

export const ModelChip: React.FC<{ model: TaskModel }> = ({ model }) => {
  if (XHEAVY_MODELS.has(model)) return <span className="text-xs">🔭</span>;
  if (HEAVY_MODELS.has(model)) return <span className="text-xs">🧠</span>;
  return null;
};
