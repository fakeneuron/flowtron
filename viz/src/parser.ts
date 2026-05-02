export type Priority =
  | 'Critical'
  | 'High'
  | 'Medium'
  | 'Low'
  | 'Future Opportunities'
  | 'Completed';

export interface Task {
  id: string;
  description: string;
  priority: Priority;
  completed: boolean;
  completedDate?: string;
}

const SECTION_HEADINGS = new Set<Priority>([
  'Critical',
  'High',
  'Medium',
  'Low',
  'Future Opportunities',
  'Completed',
]);

const TASK_LINE = /^\s*-\s+\[([ xX])\]\s+\*\*([A-Z]+(?:-EPIC)?-\d+(?:\.\d+)?)\*\*\s*[—-]\s*(.+)$/;
const COMPLETED_DATE = /\bCompleted\s+(\d{4}-\d{2}-\d{2})\.?/;
const HEADING_LINE = /^##\s+(.+?)\s*$/;

function cleanDescription(raw: string): string {
  return raw
    .replace(COMPLETED_DATE, '')
    .replace(/\*\*/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
    .replace(/^[\.\s]+|[\.\s]+$/g, '');
}

export interface TaskNode {
  task: Task;
  children: Task[];
}

const EPIC_ID = /^([A-Z]+)-EPIC-(\d+)$/;
const SUBTASK_ID = /^([A-Z]+)-(\d+)\.\d+$/;

function epicKey(id: string): string | null {
  const m = EPIC_ID.exec(id);
  return m ? `${m[1]}-${m[2]}` : null;
}

function subtaskParentKey(id: string): string | null {
  const m = SUBTASK_ID.exec(id);
  return m ? `${m[1]}-${m[2]}` : null;
}

export function groupTasks(tasks: Task[]): TaskNode[] {
  const nodes: TaskNode[] = [];
  const epicByKey = new Map<string, TaskNode>();

  for (const task of tasks) {
    const eKey = epicKey(task.id);
    if (eKey) {
      const node: TaskNode = { task, children: [] };
      epicByKey.set(eKey, node);
      nodes.push(node);
      continue;
    }
    const pKey = subtaskParentKey(task.id);
    if (pKey && epicByKey.has(pKey)) {
      epicByKey.get(pKey)!.children.push(task);
      continue;
    }
    nodes.push({ task, children: [] });
  }

  return nodes;
}

export function parsePlan(markdown: string): Task[] {
  const lines = markdown.split(/\r?\n/);
  const tasks: Task[] = [];
  let currentPriority: Priority | null = null;

  for (const line of lines) {
    const headingMatch = HEADING_LINE.exec(line);
    if (headingMatch) {
      const heading = headingMatch[1] as Priority;
      currentPriority = SECTION_HEADINGS.has(heading) ? heading : null;
      continue;
    }
    if (!currentPriority) continue;

    const m = TASK_LINE.exec(line);
    if (!m) continue;

    const [, mark, id, rest] = m;
    const completed = mark === 'x' || mark === 'X';
    const dateMatch = COMPLETED_DATE.exec(rest);

    tasks.push({
      id,
      description: cleanDescription(rest),
      priority: currentPriority,
      completed,
      completedDate: dateMatch ? dateMatch[1] : undefined,
    });
  }

  return tasks;
}
