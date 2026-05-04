import React from 'react';

export const Chevron: React.FC<{ expanded: boolean }> = ({ expanded }) => (
  <span
    aria-hidden
    className={`inline-block text-[10px] text-slate-500 transition-transform ${
      expanded ? 'rotate-90' : ''
    }`}
  >
    ▶
  </span>
);
