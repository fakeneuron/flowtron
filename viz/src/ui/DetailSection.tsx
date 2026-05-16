import React from 'react';
import { WikilinkMarkdown } from './WikilinkMarkdown';

export const DetailSection: React.FC<{
  title: string;
  markdown: string;
  navigateToTask: (id: string) => void;
}> = ({ title, markdown, navigateToTask }) => (
  <div className="mb-3 last:mb-0">
    <p className="mb-1 text-sm font-semibold text-slate-700 dark:text-slate-200">{title}</p>
    <div className="rounded border border-slate-200/70 bg-white/70 px-2.5 py-1.5 dark:border-slate-700/60 dark:bg-slate-900/40">
      <div className="prose prose-sm max-w-none [&_li]:my-0 [&_p]:my-1 [&_ul]:my-1 [&_input]:mr-1">
        <WikilinkMarkdown markdown={markdown} navigateToTask={navigateToTask} />
      </div>
    </div>
  </div>
);
