import React from 'react';
import { WikilinkMarkdown } from './WikilinkMarkdown';

export const DetailSection: React.FC<{
  title: string;
  markdown: string;
  navigateToTask: (id: string) => void;
}> = ({ title, markdown, navigateToTask }) => (
  <div className="mb-2 last:mb-0">
    <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
      {title}
    </p>
    <div className="prose prose-xs max-w-none [&_p]:my-1 [&_ul]:my-1 [&_li]:my-0 [&_input]:mr-1">
      <WikilinkMarkdown markdown={markdown} navigateToTask={navigateToTask} />
    </div>
  </div>
);
