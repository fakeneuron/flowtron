import React from 'react';
import { activePhaseIndex, type ChecklistCounts } from '../tasknote';
import { PHASE_DOT } from './constants';

export const PhaseDots: React.FC<{ phases: ChecklistCounts[] }> = ({ phases }) => {
  const activeIdx = activePhaseIndex(phases);
  return (
    <div
      className="flex items-center gap-0.5"
      title={`Active phase: ${activeIdx + 1} of 4`}
      aria-label={`Phase ${activeIdx + 1} of 4 active`}
    >
      {phases.map((_, i) => {
        const filled = i < activeIdx;
        const active = i === activeIdx;
        const cls = filled ? PHASE_DOT.filled : active ? PHASE_DOT.active : PHASE_DOT.inactive;
        return <span key={i} className={`h-2 w-2 rounded-full ${cls}`} />;
      })}
    </div>
  );
};
