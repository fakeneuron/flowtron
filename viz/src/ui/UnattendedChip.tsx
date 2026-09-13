import React from 'react';

// Renders the `[unattended]` row marker (SPEC §"Task-line format") — the
// task-level opt-in an operator-less runner reads before dispatching. Glyph-
// only, same asymmetric shape as ModelChip; the label carries the meaning.
const LABEL = 'Unattended — may be dispatched with no operator present';

export const UnattendedChip: React.FC = () => (
  <span className="text-xs" title={LABEL} aria-label={LABEL}>
    🤖
  </span>
);
