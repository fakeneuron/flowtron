export type Priority =
  | 'High'
  | 'Medium'
  | 'Low'
  | 'Future Opportunities'
  | 'Completed';

// Recommended set: 'fable' | 'opus' | 'sonnet' (flowtron convention; current
// Anthropic tiering — fable is the tier above opus). Adopters MAY substitute
// project-specific tokens (e.g., 'haiku', 'gpt-5', 'gemini-pro'); the
// TASK_LINE regex accepts any short lowercase token matching [a-z][\w.-]*.
// See SPEC §"Task-line format" + SPEC/model.md.
export type TaskModel = string;

export interface Task {
  id: string;
  description: string;
  priority: Priority;
  critical: boolean;
  completed: boolean;
  completedDate?: string;
  model?: TaskModel;
  shortname?: string;
  relatedTasks: string[];
  blockedBy: string[];
}

const SECTION_HEADINGS = new Set<Priority>([
  'High',
  'Medium',
  'Low',
  'Future Opportunities',
  'Completed',
]);

// Legacy `## Critical` heading — soft-migrated to `High` with every task
// under it auto-flagged `critical: true` (FE-044). Adopter PLAN.md files
// that still carry a `## Critical` section keep parsing without data loss.
const LEGACY_CRITICAL_HEADING = 'Critical';

// Grammar (see SPEC §"Task-line format"):
//   - [ ] **TASK-ID** [!critical] [model] | shortname — long description
// All of `[!critical]`, `[model]`, and `| shortname` are optional. Canonical
// ordering: `[!critical]` BEFORE `[model]`. The legacy minimal form
// `- [ ] **TASK-ID** — desc` keeps parsing.
//
// Three tolerances (FE-066) accept real PLAN.md decorations without capturing
// them — none add a capture group, so the destructure below is unchanged:
//   1. Leading status glyph between the checkbox and the ID
//      (`- [ ] ⏸ **ID**`) — the nav-header chip set 🟢/⏸/✅/⚪/🌱.
//   2. Stacked `[model]` tokens (`[fable] [light]`) — the FIRST is captured as
//      `model`; trailing bracket tokens are tolerated and dropped.
//   3. A model-suggestion glyph after `[model]` (`[medium]🧠` / `[medium] 🔧`
//      / `[medium]🧩`, space-optional) — decorative, redundant with the model
//      tier, dropped.
// Emoji are matched via alternation (not a char class) so astral-plane glyphs
// match correctly without the `u` flag; an optional trailing VS16 is tolerated.
const TASK_LINE =
  /^\s*-\s+\[([ xX])\]\s+(?:(?:🟢|⏸|✅|⚪|🌱)\uFE0F?\s+)?\*\*([A-Z]+(?:-EPIC)?-\d+(?:\.(?:\d+|N))?)\*\*(?:\s+\[(!critical)\])?(?:\s+\[([a-z][\w.-]*)\])?(?:\s+\[[a-z][\w.-]*\])*(?:\s*(?:🧠|🔧|🧩)\uFE0F?)?(?:\s+\|\s+(.+?))?(?:\s+[—-]\s+(.+?))?\s*$/;
const COMPLETED_DATE = /\bCompleted\s+(\d{4}-\d{2}-\d{2})\.?/;
const HEADING_LINE = /^##\s+(.+?)\s*$/;

function cleanDescription(raw: string): string {
  return raw
    .replace(COMPLETED_DATE, '')
    .replace(/\*\*/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
    .replace(/^[.\s]+|[.\s]+$/g, '');
}

// Long-description conventions (see SPEC §"Long-description conventions"):
//   `[[TASK-ID]]`             — cross-reference; collected into Task.relatedTasks
//   `Blocked by [[ID]], [[ID]]` — dependency; collected into Task.blockedBy
// Wikilink-only — bare-ID forms (`Blocked by: CORE-008`) are not recognized.
// Wikilinks inside markdown inline code spans (between backticks) are treated
// as literal text and ignored, mirroring how renderers display code spans.
// A wikilink that appears inside a `Blocked by` block lands in `blockedBy` only;
// the same ID elsewhere in the description is excluded from `relatedTasks` to
// avoid double-rendering (blocker is the stronger signal).
export const WIKILINK_PATTERN = /\[\[([A-Z]+(?:-EPIC)?-\d+(?:\.(?:\d+|N))?)\]\]/g;
const BLOCKED_BY_BLOCK =
  /Blocked by\s+(\[\[[A-Z]+(?:-EPIC)?-\d+(?:\.(?:\d+|N))?\]\](?:\s*,\s*\[\[[A-Z]+(?:-EPIC)?-\d+(?:\.(?:\d+|N))?\]\])*)/g;
const CODE_SPAN = /`[^`]*`/g;

function stripCodeSpans(text: string): string {
  return text.replace(CODE_SPAN, '');
}

function extractBlockedBy(text: string): string[] {
  const cleaned = stripCodeSpans(text);
  const ids = new Set<string>();
  for (const block of cleaned.matchAll(BLOCKED_BY_BLOCK)) {
    for (const m of block[1].matchAll(WIKILINK_PATTERN)) ids.add(m[1]);
  }
  return Array.from(ids);
}

function extractRelatedTasks(text: string, blocked: string[]): string[] {
  const cleaned = stripCodeSpans(text);
  const blockedSet = new Set(blocked);
  const ids = new Set<string>();
  for (const m of cleaned.matchAll(WIKILINK_PATTERN)) {
    if (!blockedSet.has(m[1])) ids.add(m[1]);
  }
  return Array.from(ids);
}

export interface TaskNode {
  task: Task;
  children: Task[];
}

const EPIC_ID = /^([A-Z]+)-EPIC-(\d+)$/;
const SUBTASK_ID = /^([A-Z]+)-(\d+)\.(?:\d+|N)$/;

function epicKey(id: string): string | null {
  const m = EPIC_ID.exec(id);
  return m ? `${m[1]}-${m[2]}` : null;
}

function subtaskParentKey(id: string): string | null {
  const m = SUBTASK_ID.exec(id);
  return m ? `${m[1]}-${m[2]}` : null;
}

export function isEpic(node: TaskNode): boolean {
  return node.children.length > 0 || EPIC_ID.test(node.task.id);
}

export function getSubtaskParentEpicId(id: string): string | null {
  const m = SUBTASK_ID.exec(id);
  return m ? `${m[1]}-EPIC-${m[2]}` : null;
}

export function groupTasks(tasks: Task[]): TaskNode[] {
  const epicByKey = new Map<string, TaskNode>();

  // Pass 1: index every epic first so a subtask listed before its epic in
  // the input array still finds its parent in pass 2.
  for (const task of tasks) {
    const eKey = epicKey(task.id);
    if (eKey) {
      epicByKey.set(eKey, { task, children: [] });
    }
  }

  const nodes: TaskNode[] = [];
  for (const task of tasks) {
    const eKey = epicKey(task.id);
    if (eKey) {
      nodes.push(epicByKey.get(eKey)!);
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

export interface UnparsedLine {
  /** 1-based line number in PLAN.md */
  line: number;
  text: string;
}

export interface PlanParseResult {
  tasks: Task[];
  unparsed: UnparsedLine[];
}

// Loose checkbox-bullet prefix: a line that *looks like* a task entry. Lines
// matching this inside a recognized section but failing TASK_LINE are
// hand-authoring mistakes — collected as diagnostics instead of silently
// dropped (FE-063.2).
const CHECKBOX_BULLET = /^\s*-\s+\[[ xX]\]/;

// Pre-flowtron legacy record (FE-067): a completed historical line whose bold
// token was never an `<AREA>-NNN` ID (`**P1**`, `**flowtron v5.2.0 bump**`) —
// it predates flowtron's ID convention and has no tasknote to promote it to.
// The grammar allows only a bare `**token**` optionally followed by an
// em/en-dash description — no room for `[!critical]`/`[model]`/`| shortname`,
// so a line carrying any of those never matches here and still falls through
// to the unparsed diagnostic below.
const LEGACY_LABEL_LINE =
  /^\s*-\s+\[([ xX])\]\s+\*\*([^*]+)\*\*(?:\s+[—-]\s+(.+))?\s*$/;

// A token that merely has the wrong case of a real ID (`fe-065`) still reads
// as a hand-authoring typo and must keep surfacing as unparsed — only a token
// with no letter-dash-digit structure at all (checked case-insensitively) is
// eligible for the legacy exclusion above.
const ID_SHAPE_CASE_INSENSITIVE = /^[A-Za-z]+(?:-EPIC)?-\d+(?:\.(?:\d+|N))?$/;

// HTML comments (`<!-- ... -->`, possibly multi-line) are non-rendered content:
// checkbox lines inside them — typically a grammar-reference example carrying a
// literal `**TASK-ID**` placeholder — must not parse as tasks or surface as
// diagnostics (CORE-336). Blank the comment interior while preserving newlines so
// the 1-based line numbers reported for real content stay accurate. An unclosed
// `<!--` (no matching `-->`) is left untouched — PLAN.md comment blocks are always
// closed, and matching to EOF risks blanking real content below a stray marker.
function blankHtmlComments(markdown: string): string {
  return markdown.replace(/<!--[\s\S]*?-->/g, (m) => m.replace(/[^\n]/g, ' '));
}

export function parsePlanWithDiagnostics(markdown: string): PlanParseResult {
  const lines = blankHtmlComments(markdown).split(/\r?\n/);
  const tasks: Task[] = [];
  const unparsed: UnparsedLine[] = [];
  let currentPriority: Priority | null = null;
  let legacyCriticalSection = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const headingMatch = HEADING_LINE.exec(line);
    if (headingMatch) {
      const heading = headingMatch[1];
      if (heading === LEGACY_CRITICAL_HEADING) {
        currentPriority = 'High';
        legacyCriticalSection = true;
      } else if (SECTION_HEADINGS.has(heading as Priority)) {
        currentPriority = heading as Priority;
        legacyCriticalSection = false;
      } else {
        currentPriority = null;
        legacyCriticalSection = false;
      }
      continue;
    }
    if (!currentPriority) continue;

    const m = TASK_LINE.exec(line);
    if (!m) {
      if (CHECKBOX_BULLET.test(line)) {
        const legacyMatch = LEGACY_LABEL_LINE.exec(line);
        const isLegacyRecord =
          legacyMatch !== null &&
          (legacyMatch[1] === 'x' || legacyMatch[1] === 'X') &&
          !ID_SHAPE_CASE_INSENSITIVE.test(legacyMatch[2]);
        if (!isLegacyRecord) {
          unparsed.push({ line: i + 1, text: line.trim() });
        }
      }
      continue;
    }

    const [, mark, id, criticalRaw, modelRaw, shortnameRaw, longRaw] = m;
    const completed = mark === 'x' || mark === 'X';
    const longText = longRaw ?? '';
    const dateMatch = COMPLETED_DATE.exec(longText);
    const blockedBy = extractBlockedBy(longText);
    const relatedTasks = extractRelatedTasks(longText, blockedBy);

    tasks.push({
      id,
      description: longText ? cleanDescription(longText) : '',
      priority: currentPriority,
      critical: criticalRaw === '!critical' || legacyCriticalSection,
      completed,
      completedDate: dateMatch ? dateMatch[1] : undefined,
      model: modelRaw as TaskModel | undefined,
      shortname: shortnameRaw ? shortnameRaw.trim() : undefined,
      relatedTasks,
      blockedBy,
    });
  }

  return { tasks, unparsed };
}
