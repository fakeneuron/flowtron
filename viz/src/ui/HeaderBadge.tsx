import React from 'react';

export const HeaderBadge: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="ml-2 inline-flex items-center rounded bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-950 dark:text-amber-200">
    {children}
  </span>
);
