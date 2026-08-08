import React from 'react';
import type { ClosureDrift } from '../tasknote';

export const ClosureDriftChip: React.FC<{ drift: ClosureDrift }> = ({ drift }) => {
  const label = `Closure drift: ${drift.unticked} of ${drift.total} Acceptance criteria unticked and unannotated`;
  return (
    <span className="text-xs" title={label} aria-label={label}>
      ⚠️
    </span>
  );
};
