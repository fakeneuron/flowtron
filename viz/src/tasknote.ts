export type TasknoteStatus = 'starter' | 'not-started' | 'in-progress' | 'blocked' | 'completed';

interface TasknoteFrontmatter {
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

export interface ClosureDrift {
  unticked: number;
  total: number;
}

export type StarterSubsectionKey = 'whyExists' | 'solutionShape' | 'filesToTouch' | 'outOfScope';

type StarterSubsections = Record<StarterSubsectionKey, string>;

export interface Tasknote {
  id: string;
  path: string;
  frontmatter: TasknoteFrontmatter | null;
  body: string;
  goal: string;
  acceptance: string;
  subtasks: string;
  starterContext: string;
  starterSubsections: StarterSubsections;
  subtasksProgress: ChecklistCounts;
  phases: ChecklistCounts[];
  closureDrift: ClosureDrift | null;
}

export const STARTER_SUBSECTION_KEYS: StarterSubsectionKey[] = [
  'whyExists',
  'solutionShape',
  'filesToTouch',
  'outOfScope',
];

const STARTER_SUBSECTION_TITLES: Record<StarterSubsectionKey, string> = {
  whyExists: 'Why this exists',
  solutionShape: 'Solution shape',
  filesToTouch: 'Files to touch',
  outOfScope: 'Explicitly out of scope',
};

export const emptyStarterSubsections = (): StarterSubsections => ({
  whyExists: '',
  solutionShape: '',
  filesToTouch: '',
  outOfScope: '',
});

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
const SUBSECTION_HEADING = /^###\s+(.+?)\s*$/;
const HORIZONTAL_RULE = /^---\s*$/;

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function extractSection(body: string, titleSubstring: string): string {
  const titleBoundary = new RegExp(`\\b${escapeRegExp(titleSubstring)}\\b`);
  const lines = body.split(/\r?\n/);
  let inSection = false;
  const collected: string[] = [];
  for (const line of lines) {
    const heading = SECTION_HEADING.exec(line);
    if (heading) {
      if (inSection) break;
      if (titleBoundary.test(heading[1])) {
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

export function extractStarterSubsections(starterContext: string): StarterSubsections {
  const result = emptyStarterSubsections();
  if (!starterContext) return result;
  const lines = starterContext.split(/\r?\n/);
  let activeKey: StarterSubsectionKey | null = null;
  const buffers: Record<StarterSubsectionKey, string[]> = {
    whyExists: [],
    solutionShape: [],
    filesToTouch: [],
    outOfScope: [],
  };
  for (const line of lines) {
    const heading = SUBSECTION_HEADING.exec(line);
    if (heading) {
      const title = heading[1];
      const matchedKey =
        STARTER_SUBSECTION_KEYS.find((k) => title.includes(STARTER_SUBSECTION_TITLES[k])) ?? null;
      activeKey = matchedKey;
      continue;
    }
    if (!activeKey) continue;
    if (HORIZONTAL_RULE.test(line)) {
      activeKey = null;
      continue;
    }
    buffers[activeKey].push(line);
  }
  for (const key of STARTER_SUBSECTION_KEYS) {
    result[key] = buffers[key].join('\n').trim();
  }
  return result;
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

// The Phase 4 Acceptance tick-through obligation (SPEC.md §"🚀 Phase 4: Closure")
// did not exist before CORE-393 landed on this date. Notes archived earlier were
// never governed by it, so flagging them would be false drift, not detection.
// The comparison below is strict: CORE-393 landed at 23:32, and the `**Archived:**
// stamp is date-only, so a note stamped 2026-08-01 most likely closed before the
// rule existed (CORE-389.3 did, at 21:24). Excluding the landing day trades a
// few unflagged hours for no false flags — the same "unknown is not drift" stance
// the missing-stamp case takes.
export const TICK_THROUGH_EFFECTIVE = '2026-08-01';

const ARCHIVED_STAMP = /^\*\*Archived:\*\*\s+(\d{4}-\d{2}-\d{2})\s*$/m;

// Closure may annotate a criterion in place instead of ticking it
// (`N/A — reason` / `not met — reason`, SPEC.md §"Acceptance tick-through").
// An annotated box is a satisfied obligation, so it is not drift.
const ANNOTATED = /\b(?:N\/A|not[ -]met)\b/i;

export function extractArchivedDate(body: string): string | undefined {
  return ARCHIVED_STAMP.exec(body)?.[1];
}

// Unticked, unannotated `## ✅ Acceptance` criteria on a note archived under the
// tick-through rule. Returns null when there is nothing to report — no archive
// stamp (an active note, or an unfilled `YYYY-MM-DD` placeholder), a note closed
// before the rule existed, or a clean Acceptance block. Unknown is not drift.
export function closureDrift(
  acceptance: string,
  archivedDate: string | undefined,
): ClosureDrift | null {
  if (!archivedDate || archivedDate <= TICK_THROUGH_EFFECTIVE) return null;
  let total = 0;
  let unticked = 0;
  for (const line of acceptance.split(/\r?\n/)) {
    const m = CHECKLIST_LINE.exec(line);
    if (!m) continue;
    total += 1;
    if (m[1] === ' ' && !ANNOTATED.test(line)) unticked += 1;
  }
  return unticked > 0 ? { unticked, total } : null;
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

