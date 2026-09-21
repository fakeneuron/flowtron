import React from 'react';

// Renders the `[handoff]` row marker (SPEC §"Task-line format") — the
// operator's declaration that this row stops mid-run for a human act that is
// not another task. Glyph-only, mirrors UnattendedChip; the label carries the
// meaning.
const LABEL = 'Handoff — stops mid-run for a human act, not another task';

export const HandoffChip: React.FC = () => (
  <span className="text-xs" title={LABEL} aria-label={LABEL}>
    ✋
  </span>
);
