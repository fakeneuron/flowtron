import React from 'react';

export const BackRefChip: React.FC<{ count: number; onClick: () => void }> = ({
  count,
  onClick,
}) => (
  <button
    type="button"
    onClick={onClick}
    className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
    title={`${count} ${count === 1 ? 'task references' : 'tasks reference'} this`}
  >
    ← referenced by {count}
  </button>
);
