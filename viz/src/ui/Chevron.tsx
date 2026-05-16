import React from 'react';

export const Chevron: React.FC<{ expanded: boolean }> = ({ expanded }) => (
  <span
    aria-hidden
    className={`inline-block text-xs text-slate-500 transition-transform dark:text-slate-400 ${
      expanded ? 'rotate-90' : ''
    }`}
  >
    ▶
  </span>
);
