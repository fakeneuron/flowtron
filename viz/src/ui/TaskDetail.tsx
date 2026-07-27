import React from 'react';
import type { Task } from '../parser';
import { STARTER_SUBSECTION_KEYS, type Tasknote } from '../tasknote';
import type { VisibilityPrefs } from '../visibilityPrefs';
import { WikilinkMarkdown } from './WikilinkMarkdown';
import { DetailSection } from './DetailSection';
import { STARTER_SUBSECTION_LABEL } from './constants';
import { usePalette } from './VisibilityContext';
import { StatusChip } from './StatusChip';
import { effectiveStatus } from './utils';

// Build a `vscode://file` href only for a well-formed absolute path, encoding
// it so spaces / special characters don't break the URI. Returns null for a
// path that isn't an absolute POSIX path, so no broken link renders.
export const vscodeFileHref = (path: string): string | null =>
  path.startsWith('/') ? `vscode://file${encodeURI(path)}` : null;

const TaskDetail: React.FC<{
  task: Task;
  tasknote: Tasknote | undefined;
  detailSections: VisibilityPrefs['detailSections'];
  starterSections: VisibilityPrefs['starterSections'];
  navigateToTask: (id: string) => void;
  compact?: boolean;
}> = ({ task, tasknote, detailSections, starterSections, navigateToTask, compact = false }) => {
  const palette = usePalette();
  const status = effectiveStatus(task, tasknote);
  const isStarter = status === 'starter';
  const priority = tasknote ? task.priority : undefined;
  const showMetaHeader = priority || (task.completed && task.completedDate) || tasknote;
  const vscodeHref = tasknote ? vscodeFileHref(tasknote.path) : null;
  const rootClass = compact
    ? '-mx-2 mt-2 mb-0.5 rounded border border-slate-200 bg-white pl-9 pr-3 py-2.5 text-sm text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'
    : 'border-t border-slate-100 bg-slate-50/40 pl-9 pr-3 py-2 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-300';
  return (
    <div className={rootClass}>
      {showMetaHeader && (
        <div className="mb-2 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          {priority && (
            <span
              className={`rounded px-1.5 py-0.5 font-medium ${palette.PRIORITY_BADGE[priority]}`}
            >
              {priority}
            </span>
          )}
          {status && <StatusChip status={status} />}
          {task.completed && task.completedDate && (
            <span>Completed {task.completedDate}</span>
          )}
          {vscodeHref && (
            <a
              href={vscodeHref}
              className="ml-auto hover:text-slate-800 hover:underline dark:hover:text-slate-100"
              title="Open tasknote in VS Code"
            >
              VS Code →
            </a>
          )}
        </div>
      )}
      {isStarter && tasknote ? (
        <>
          {STARTER_SUBSECTION_KEYS.map((key) => {
            const body = tasknote.starterSubsections[key];
            if (!starterSections[key] || !body) return null;
            return (
              <DetailSection
                key={key}
                title={STARTER_SUBSECTION_LABEL[key]}
                markdown={body}
                navigateToTask={navigateToTask}
              />
            );
          })}
        </>
      ) : tasknote ? (
        <>
          {detailSections.goal && tasknote.goal && (
            <DetailSection title="Goal" markdown={tasknote.goal} navigateToTask={navigateToTask} />
          )}
          {detailSections.acceptance && tasknote.acceptance && (
            <DetailSection
              title="Acceptance"
              markdown={tasknote.acceptance}
              navigateToTask={navigateToTask}
            />
          )}
          {detailSections.subtasks && tasknote.subtasks && (
            <DetailSection
              title="Subtasks"
              markdown={tasknote.subtasks}
              navigateToTask={navigateToTask}
            />
          )}
        </>
      ) : (
        <div className="prose prose-sm max-w-none [&_p]:my-1 [&_ul]:my-1 [&_li]:my-0 [&_input]:mr-1">
          <WikilinkMarkdown markdown={task.description} navigateToTask={navigateToTask} />
        </div>
      )}
    </div>
  );
};

export default TaskDetail;
