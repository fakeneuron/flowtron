export type Priority =
  | 'High'
  | 'Medium'
  | 'Low'
  | 'Future Opportunities'
  | 'Completed';

// Recommended set: 'heavy' | 'medium' | 'light' (flowtron's primary category
// labels — see SPEC §"Task-line format"). Concrete model names (e.g. 'fable',
// 'opus', 'sonnet', 'haiku', 'grok', 'gpt-5', 'gemini-pro') are valid
// precision tokens; the TASK_LINE regex accepts any short lowercase token
// matching [a-z][\w.-]*.
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

// The canonical priority registry, in board/list render order. Single source
// for both the parser's heading lookup below and the UI's section lists
// (`App.tsx`) — adding a `Priority` here reaches every consumer, which the
// hand-maintained copies it replaces did not (FE-039 and FE-044 each had to
// edit parser + App in lockstep).
export const PRIORITIES: readonly Priority[] = [
  'High',
  'Medium',
  'Low',
  'Future Opportunities',
  'Completed',
];

const SECTION_HEADINGS = new Set<Priority>(PRIORITIES);

// Legacy `## Critical` heading — soft-migrated to `High` with every task
// under it auto-flagged `critical: true` (FE-044). Adopter PLAN.md files
// that still carry a `## Critical` section keep parsing without data loss.
const LEGACY_CRITICAL_HEADING = 'Critical';

// Rotated-history heading (`## Completed 2026-07`). `.flowtron/PLAN-ARCHIVE.md`
// groups its month blocks under these, newest month first; the rows beneath are
// verbatim `PLAN.md` stubs, so only the heading needs teaching — the task-line
// grammar below is untouched. Mapped onto the canonical `Completed` priority
// inside the heading branch rather than widened into SECTION_HEADINGS, mirroring
// LEGACY_CRITICAL_HEADING (FE-044): the canonical Priority set stays the five
// section names the board renders.
// Contract: SPEC/tasknote-selection.md §"`## Completed` rotation".
const COMPLETED_MONTH_HEADING = /^Completed\s+\d{4}-\d{2}$/;

// Grammar (see SPEC §"Task-line format"):
//   - [ ] **TASK-ID** [!critical] [model] | shortname — long description
// All of `[!critical]`, `[model]`, and `| shortname` are optional. Canonical
// ordering: `[!critical]` BEFORE `[model]`. The legacy minimal form
// `- [ ] **TASK-ID** — desc` keeps parsing.
//
// TASK_LINE is composed from named fragments (FE-084) so each piece of the
// grammar — including the three FE-066 tolerances below — is independently
// readable and diffable. Fragment order below is left-to-right match order;
// concatenation order in the `new RegExp(...)` call must match it exactly.
// Capture groups, in order: mark, id, criticalRaw, modelRaw, criticalAfter,
// shortnameRaw, longRaw. The three FE-066 tolerances are all non-capturing;
// CRITICAL_FLAG_AFTER is the FE-087 swapped-order capture (canonical
// CRITICAL_FLAG stays group 3; this is group 5 so a `[model] [!critical]`
// row — including after a suggestion glyph — still sets `critical`):
//   1. STATUS_GLYPH — leading status glyph between the checkbox and the ID
//      (`- [ ] ⏸ **ID**`) — the nav-header chip set 🟢/⏸/✅/⚪/🌱.
//   2. STACKED_MODEL_TOKENS — stacked `[model]` tokens (`[fable] [light]`) —
//      the FIRST is captured as `model`; trailing bracket tokens are
//      tolerated and dropped.
//   3. SUGGESTION_GLYPH — a model-suggestion glyph after `[model]`
//      (`[medium]🧠` / `[medium] 🔧` / `[medium]🧩` / `[medium]🔭`,
//      space-optional) — decorative, redundant with the model tier, dropped.
// Emoji are matched via alternation (not a char class) so astral-plane glyphs
// match correctly without the `u` flag; an optional trailing VS16 is tolerated.
//
// TASK_ID_BODY (FE-087) is the shared ID shape: canonical SPEC
// `<AREA>-<NUMBER>` / `<AREA>-EPIC-<NUMBER>` / one `.(digits|N)` subtask
// slot, plus two adopter near-misses — a lowercase letter suffix on a
// numeric segment (`FE-310.3a`) and repeating decimals (`FE-067.2.1`).
// Threaded through TASK_ID, WIKILINK_PATTERN, BLOCKED_BY_BLOCK, and
// ID_SHAPE_CASE_INSENSITIVE so the five regex slots stay in lockstep
// (CORE-333 precedent). Not canonical authoring — new entries still use
// SPEC §"Task ID convention".
const BULLET_CHECKBOX = String.raw`^\s*-\s+\[([ xX])\]\s+`;
const STATUS_GLYPH = String.raw`(?:(?:🟢|⏸|✅|⚪|🌱)\uFE0F?\s+)?`;
const TASK_ID_BODY = String.raw`[A-Z]+(?:-EPIC)?-\d+(?:\.(?:\d+[a-z]?|N))*`;
const TASK_ID = String.raw`\*\*(${TASK_ID_BODY})\*\*`;
const CRITICAL_FLAG = String.raw`(?:\s+\[(!critical)\])?`;
const MODEL_TOKEN = String.raw`(?:\s+\[([a-z][\w.-]*)\])?`;
const STACKED_MODEL_TOKENS = String.raw`(?:\s+\[[a-z][\w.-]*\])*`;
const SUGGESTION_GLYPH = String.raw`(?:\s*(?:🧠|🔧|🧩|🔭)\uFE0F?)?`;
const CRITICAL_FLAG_AFTER = CRITICAL_FLAG;
const SHORTNAME = String.raw`(?:\s+\|\s+([^\n]+?))?`;
const LONG_DESCRIPTION = String.raw`(?:\s+[—-]\s+([^\n]+?))?\s*$`;
const TASK_LINE = new RegExp(
  BULLET_CHECKBOX +
    STATUS_GLYPH +
    TASK_ID +
    CRITICAL_FLAG +
    MODEL_TOKEN +
    STACKED_MODEL_TOKENS +
    SUGGESTION_GLYPH +
    CRITICAL_FLAG_AFTER +
    SHORTNAME +
    LONG_DESCRIPTION
);
const COMPLETED_DATE = /\bCompleted\s+(\d{4}-\d{2}-\d{2})\.?/;
const HEADING_LINE = /^##\s+(.+?)\s*$/;

// A fenced code block is content the note is *showing*, not structure it
// *has*: a PLAN.md task-line grammar reference or an example row quoted
// inside a fence must not switch the current section or parse as a real
// task. Ported from `tasknote.ts`'s `fenceMask` (CORE-421.2) — kept private
// and per-module rather than shared, mirroring that note's no-export
// precedent. CommonMark fence rules: up to 3 spaces of indent, the closing
// run is the same character and at least as long as the opening one, and a
// backtick info string may not itself contain a backtick. An unclosed fence
// runs to end-of-input, also per CommonMark.
const FENCE_DELIMITER = /^ {0,3}(`{3,}|~{3,})(.*)$/;

function fenceMask(lines: string[]): boolean[] {
  const mask: boolean[] = [];
  let open: string | null = null;
  for (const line of lines) {
    const m = FENCE_DELIMITER.exec(line);
    if (open === null) {
      if (m !== null && !(m[1][0] === '`' && m[2].includes('`'))) {
        open = m[1];
        mask.push(true);
      } else {
        mask.push(false);
      }
      continue;
    }
    mask.push(true);
    const closes =
      m !== null && m[1][0] === open[0] && m[1].length >= open.length && m[2].trim() === '';
    if (closes) open = null;
  }
  return mask;
}

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
export const WIKILINK_PATTERN = new RegExp(
  String.raw`\[\[(${TASK_ID_BODY})\]\]`,
  'g'
);
const BLOCKED_BY_BLOCK = new RegExp(
  String.raw`Blocked by\s+(\[\[${TASK_ID_BODY}\]\](?:\s*,\s*\[\[${TASK_ID_BODY}\]\])*)`,
  'g'
);
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

interface DuplicateEpic {
  /** The epic ID that appeared under more than one heading. */
  id: string;
}

const EPIC_ID = /^([A-Z]+)-EPIC-(\d+)$/;
const SUBTASK_ID = /^([A-Z]+)-(\d+)\.(?:\d+[a-z]?|N)(?:\.(?:\d+[a-z]?|N))*$/;

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

interface GroupTasksResult {
  nodes: TaskNode[];
  duplicateEpics: DuplicateEpic[];
}

export function groupTasks(tasks: Task[]): GroupTasksResult {
  const epicByKey = new Map<string, TaskNode>();
  const seenEpicKeys = new Set<string>();
  const duplicateEpics: DuplicateEpic[] = [];

  // Pass 1: index every epic first so a subtask listed before its epic in
  // the input array still finds its parent in pass 2. Only the first
  // occurrence of a given epic ID is kept — an epic ID hand-authored under
  // two headings would otherwise let the second `.set()` silently overwrite
  // the first (last write wins), stranding it out of its original section.
  for (const task of tasks) {
    const eKey = epicKey(task.id);
    if (!eKey) continue;
    if (seenEpicKeys.has(eKey)) {
      duplicateEpics.push({ id: task.id });
      continue;
    }
    seenEpicKeys.add(eKey);
    epicByKey.set(eKey, { task, children: [] });
  }

  const pushedEpicKeys = new Set<string>();
  const nodes: TaskNode[] = [];
  for (const task of tasks) {
    const eKey = epicKey(task.id);
    if (eKey) {
      // Guard mirrors pass 1: a duplicate epic line must not push its
      // shared TaskNode into `nodes` a second time.
      if (pushedEpicKeys.has(eKey)) continue;
      pushedEpicKeys.add(eKey);
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

  return { nodes, duplicateEpics };
}

export interface UnparsedLine {
  /** 1-based line number in PLAN.md */
  line: number;
  text: string;
}

export interface NearMissHeading {
  /** 1-based line number in PLAN.md */
  line: number;
  /** The heading text as written (e.g. "medium") */
  heading: string;
  /** The canonical Priority it case-insensitively matches (e.g. "Medium") */
  matched: Priority;
}

interface PlanParseResult {
  tasks: Task[];
  unparsed: UnparsedLine[];
  nearMissHeadings: NearMissHeading[];
}

// Lowercased priority name -> canonical Priority, for the near-miss check below.
const LOWERCASE_TO_PRIORITY = new Map<string, Priority>(
  Array.from(SECTION_HEADINGS, (p) => [p.toLowerCase(), p])
);

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
const ID_SHAPE_CASE_INSENSITIVE = new RegExp(`^${TASK_ID_BODY}$`, 'i');

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

// One document's worth of scanning. Private because the two documents a board
// reads are not interchangeable: only `PLAN.md`'s diagnostics reach the caller
// (see parsePlanWithDiagnostics).
// A heading line's effect on scan state: which priority (if any) subsequent
// lines file under, whether the legacy `## Critical` section is active, and
// the near-miss match (if the heading looks like a typo'd priority).
function resolveHeadingLine(heading: string): {
  priority: Priority | null;
  legacyCriticalSection: boolean;
  nearMissMatch: Priority | null;
} {
  if (heading === LEGACY_CRITICAL_HEADING) {
    return { priority: 'High', legacyCriticalSection: true, nearMissMatch: null };
  }
  if (SECTION_HEADINGS.has(heading as Priority)) {
    return { priority: heading as Priority, legacyCriticalSection: false, nearMissMatch: null };
  }
  if (COMPLETED_MONTH_HEADING.test(heading)) {
    return { priority: 'Completed', legacyCriticalSection: false, nearMissMatch: null };
  }
  return {
    priority: null,
    legacyCriticalSection: false,
    nearMissMatch: LOWERCASE_TO_PRIORITY.get(heading.toLowerCase()) ?? null,
  };
}

// A task-section line's effect on scan output: a parsed `Task`, unparsed
// text for a checkbox line that looked like a task but didn't match, or
// `null` for a line that's neither (blank lines, prose, etc.).
function parseTaskLine(
  line: string,
  currentPriority: Priority,
  legacyCriticalSection: boolean,
): { task: Task } | { unparsedText: string } | null {
  const m = TASK_LINE.exec(line);
  if (!m) {
    if (CHECKBOX_BULLET.test(line)) {
      const legacyMatch = LEGACY_LABEL_LINE.exec(line);
      const isLegacyRecord =
        legacyMatch !== null &&
        (legacyMatch[1] === 'x' || legacyMatch[1] === 'X') &&
        !ID_SHAPE_CASE_INSENSITIVE.test(legacyMatch[2]);
      // FE-087: a checkbox with no ID emphasis (`*` / `**`) is a prose
      // checklist item, not a failed task. Genuine ID near-misses still
      // carry asterisks (`*FE-064*`, `**fe-065**`) and keep flagging.
      if (!isLegacyRecord && line.includes('*')) {
        return { unparsedText: line.trim() };
      }
    }
    return null;
  }

  const [, mark, id, criticalRaw, modelRaw, criticalAfter, shortnameRaw, longRaw] = m;
  const completed = mark === 'x' || mark === 'X';
  const longText = longRaw ?? '';
  const dateMatch = COMPLETED_DATE.exec(longText);
  const blockedBy = extractBlockedBy(longText);
  const relatedTasks = extractRelatedTasks(longText, blockedBy);

  return {
    task: {
      id,
      description: longText ? cleanDescription(longText) : '',
      priority: currentPriority,
      critical: criticalRaw === '!critical' || criticalAfter === '!critical' || legacyCriticalSection,
      completed,
      completedDate: dateMatch ? dateMatch[1] : undefined,
      model: modelRaw as TaskModel | undefined,
      shortname: shortnameRaw ? shortnameRaw.trim() : undefined,
      relatedTasks,
      blockedBy,
    },
  };
}

function scanDocument(markdown: string): PlanParseResult {
  const lines = blankHtmlComments(markdown).split(/\r?\n/);
  const inFence = fenceMask(lines);
  const tasks: Task[] = [];
  const unparsed: UnparsedLine[] = [];
  const nearMissHeadings: NearMissHeading[] = [];
  let currentPriority: Priority | null = null;
  let legacyCriticalSection = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (inFence[i]) continue;
    const headingMatch = HEADING_LINE.exec(line);
    if (headingMatch) {
      const heading = headingMatch[1];
      const resolved = resolveHeadingLine(heading);
      currentPriority = resolved.priority;
      legacyCriticalSection = resolved.legacyCriticalSection;
      if (resolved.nearMissMatch) {
        nearMissHeadings.push({ line: i + 1, heading, matched: resolved.nearMissMatch });
      }
      continue;
    }
    if (!currentPriority) continue;

    const parsed = parseTaskLine(line, currentPriority, legacyCriticalSection);
    if (parsed && 'task' in parsed) {
      tasks.push(parsed.task);
    } else if (parsed && 'unparsedText' in parsed) {
      unparsed.push({ line: i + 1, text: parsed.unparsedText });
    }
  }

  return { tasks, unparsed, nearMissHeadings };
}

// `PLAN.md` plus, optionally, the rotated history in `.flowtron/PLAN-ARCHIVE.md`.
// Rotation moves closed rows out of `PLAN.md` verbatim, so a board that reads
// only the first file loses every rotated month; concatenating the second
// restores whole history. Absence is an empty archive, never an error — the file
// does not exist until a project's first rotation.
//
// Diagnostics stay `PLAN.md`-only, deliberately. `UnparsedLine.line` /
// `NearMissHeading.line` are documented as `PLAN.md` line numbers and rendered
// as "N lines in PLAN.md ..." (FE-063.2); the archive is machine-rotated,
// append-only, and never hand-authored, so it is not the authoring surface those
// diagnostics were built to protect. Reporting an archive line number under that
// banner would point the operator at a line of `PLAN.md` that says something
// else entirely.
export function parsePlanWithDiagnostics(
  markdown: string,
  archiveMarkdown?: string,
): PlanParseResult {
  const plan = scanDocument(markdown);
  if (!archiveMarkdown) return plan;
  const archive = scanDocument(archiveMarkdown);
  return { ...plan, tasks: [...plan.tasks, ...archive.tasks] };
}
