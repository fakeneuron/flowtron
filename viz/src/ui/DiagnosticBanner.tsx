import React from 'react';

export const DiagnosticBanner: React.FC<{ message: React.ReactNode; children: React.ReactNode }> = ({
  message,
  children,
}) => (
  <div className="mx-4 mt-3 rounded border border-amber-300 bg-amber-50 p-3 text-base text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
    <p>{message}</p>
    <ul className="mt-1 font-mono text-sm">{children}</ul>
  </div>
);
