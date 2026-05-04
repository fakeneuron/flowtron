import React from 'react';

export const RelatedChip: React.FC<{ id: string; onClick: () => void }> = ({ id, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="rounded-full bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-700 hover:bg-slate-200"
    title={`Jump to ${id}`}
  >
    {id}
  </button>
);
