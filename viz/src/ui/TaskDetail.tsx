import React from 'react';
import type { Task } from '../parser';
import type { Tasknote } from '../tasknote';
import { WikilinkMarkdown } from './WikilinkMarkdown';
import { DetailSection } from './DetailSection';

export const TaskDetail: React.FC<{
  task: Task;
  tasknote: Tasknote | undefined;
  navigateToTask: (id: string) => void;
}> = ({ task, tasknote, navigateToTask }) => {
  const isStarter = tasknote?.frontmatter?.status === 'starter';
  return (
    <div className="border-t border-slate-100 bg-slate-50/40 px-3 py-2 text-xs text-slate-700">
      {isStarter && tasknote ? (
        <DetailSection
          title="🌱 Starter context"
          markdown={tasknote.starterContext}
          navigateToTask={navigateToTask}
        />
      ) : tasknote ? (
        <>
          {tasknote.goal && (
            <DetailSection title="Goal" markdown={tasknote.goal} navigateToTask={navigateToTask} />
          )}
          {tasknote.acceptance && (
            <DetailSection
              title="Acceptance"
              markdown={tasknote.acceptance}
              navigateToTask={navigateToTask}
            />
          )}
          {tasknote.subtasks && (
            <DetailSection
              title="Subtasks"
              markdown={tasknote.subtasks}
              navigateToTask={navigateToTask}
            />
          )}
        </>
      ) : (
        <div className="prose prose-xs max-w-none [&_p]:my-1 [&_ul]:my-1 [&_li]:my-0 [&_input]:mr-1">
          <WikilinkMarkdown markdown={task.description} navigateToTask={navigateToTask} />
        </div>
      )}
    </div>
  );
};
