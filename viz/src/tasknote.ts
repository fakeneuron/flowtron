export type TasknoteStatus = 'starter' | 'not-started' | 'in-progress' | 'blocked' | 'completed';

export interface TasknoteFrontmatter {
  title: string;
  status: TasknoteStatus;
  tags: string[];
  created: string;
  due?: string;
  relatedTasks: string[];
}

export interface ChecklistCounts {
  total: number;
  done: number;
}

export interface Tasknote {
  id: string;
  path: string;
  frontmatter: TasknoteFrontmatter | null;
  body: string;
  goal: string;
  acceptance: string;
  subtasks: string;
  starterContext: string;
  subtasksProgress: ChecklistCounts;
  phases: ChecklistCounts[];
}

const STATUS_VALUES = new Set<TasknoteStatus>([
  'starter',
  'not-started',
  'in-progress',
  'blocked',
  'completed',
]);

function asString(v: unknown): string | undefined {
  if (typeof v === 'string') return v;
  if (v instanceof Date && !isNaN(v.getTime())) {
    return v.toISOString().slice(0, 10);
  }
  return undefined;
}

function asStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.filter((x): x is string => typeof x === 'string');
}

export function parseFrontmatter(raw: unknown): TasknoteFrontmatter | null {
  if (!raw || typeof raw !== 'object') return null;
  const data = raw as Record<string, unknown>;
  if (Object.keys(data).length === 0) return null;

  const title = asString(data.title);
  const status = asString(data.status);
  const created = asString(data.created);
  const due = asString(data.due);

  if (!title || !status || !created) return null;
  if (!STATUS_VALUES.has(status as TasknoteStatus)) return null;

  return {
    title,
    status: status as TasknoteStatus,
    tags: asStringArray(data.tags),
    created,
    due: due && due.length > 0 ? due : undefined,
    relatedTasks: asStringArray(data['related-tasks']),
  };
}

const SECTION_HEADING = /^##\s+(.+?)\s*$/;
const HORIZONTAL_RULE = /^---\s*$/;

export function extractSection(body: string, titleSubstring: string): string {
  const lines = body.split(/\r?\n/);
  let inSection = false;
  const collected: string[] = [];
  for (const line of lines) {
    const heading = SECTION_HEADING.exec(line);
    if (heading) {
      if (inSection) break;
      if (heading[1].includes(titleSubstring)) {
        inSection = true;
        continue;
      }
      continue;
    }
    if (!inSection) continue;
    if (HORIZONTAL_RULE.test(line)) break;
    collected.push(line);
  }
  return collected.join('\n').trim();
}

const CHECKLIST_LINE = /^\s*-\s+\[([ xX])\]/;

export function activePhaseIndex(phases: ChecklistCounts[]): number {
  for (let i = 0; i < phases.length; i++) {
    const p = phases[i];
    if (p.total === 0) return i;
    if (p.done < p.total) return i;
  }
  return Math.max(0, phases.length - 1);
}

export function countChecklist(markdown: string): ChecklistCounts {
  if (!markdown) return { total: 0, done: 0 };
  let total = 0;
  let done = 0;
  for (const line of markdown.split(/\r?\n/)) {
    const m = CHECKLIST_LINE.exec(line);
    if (!m) continue;
    total += 1;
    if (m[1] === 'x' || m[1] === 'X') done += 1;
  }
  return { total, done };
}

