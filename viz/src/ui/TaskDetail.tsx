import React from 'react';
import type { Task } from '../parser';
import type { Tasknote } from '../tasknote';
import { WikilinkMarkdown } from './WikilinkMarkdown';
import { DetailSection } from './DetailSection';
import { PRIORITY_BADGE } from './constants';
import { StatusChip } from './StatusChip';
import { effectiveStatus } from './utils';

const TaskDetail: React.FC<{
  task: Task;
  tasknote: Tasknote | undefined;
  navigateToTask: (id: string) => void;
}> = ({ task, tasknote, navigateToTask }) => {
  const status = effectiveStatus(task, tasknote);
  const isStarter = status === 'starter';
  const priority = tasknote ? task.priority : undefined;
  const showMetaHeader = priority || (task.completed && task.completedDate) || tasknote;
  return (
    <div className="border-t border-slate-100 bg-slate-50/40 px-3 py-2 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-300">
      {showMetaHeader && (
        <div className="mb-2 flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400">
          {priority && (
            <span
              className={`rounded px-1.5 py-0.5 font-medium ${PRIORITY_BADGE[priority]}`}
            >
              {priority}
            </span>
          )}
          {status && <StatusChip status={status} />}
          {task.completed && task.completedDate && (
            <span>Completed {task.completedDate}</span>
          )}
          {tasknote && (
            <a
              href={`vscode://file${tasknote.path}`}
              className="ml-auto hover:text-slate-800 hover:underline dark:hover:text-slate-100"
              title="Open tasknote in VS Code"
            >
              VS Code →
            </a>
          )}
        </div>
      )}
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

export default TaskDetail;
