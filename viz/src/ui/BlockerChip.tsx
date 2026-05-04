import React from 'react';

export const BlockerChip: React.FC<{ id: string; onClick: () => void }> = ({ id, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="rounded-full bg-rose-100 px-1.5 py-0.5 font-mono text-[11px] font-medium text-rose-800 hover:bg-rose-200"
    title={`Blocked by ${id}`}
  >
    ⛔ {id}
  </button>
);
