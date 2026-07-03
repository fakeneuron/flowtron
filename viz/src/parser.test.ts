import { describe, it, expect } from 'vitest';
import { groupTasks, parsePlanWithDiagnostics, type Task } from './parser';

function parsePlan(markdown: string): Task[] {
  return parsePlanWithDiagnostics(markdown).tasks;
}

describe('parsePlan', () => {
  it('parses an open task in High', () => {
    const md = `## High

- [ ] **CORE-001** — Hello world
`;
    expect(parsePlan(md)).toEqual([
      {
        id: 'CORE-001',
        description: 'Hello world',
        priority: 'High',
        critical: false,
        completed: false,
        completedDate: undefined,
        model: undefined,
        shortname: undefined,
        relatedTasks: [],
        blockedBy: [],
      },
    ]);
  });

  it('parses a completed task and extracts the date', () => {
    const md = `## Completed

- [x] **FE-005** — Did the thing. Completed 2026-04-30. Notes here.
`;
    const tasks = parsePlan(md);
    expect(tasks).toHaveLength(1);
    expect(tasks[0]).toMatchObject({
      id: 'FE-005',
      priority: 'Completed',
      completed: true,
      completedDate: '2026-04-30',
    });
    expect(tasks[0].description).toContain('Did the thing');
    expect(tasks[0].description).toContain('Notes here');
    expect(tasks[0].description).not.toContain('2026-04-30');
  });

  it('parses subtasks under an epic in the same section', () => {
    const md = `## Low

- [ ] **CORE-EPIC-009** — Epic top
  - [ ] **CORE-009.1** — Sub one
  - [ ] **CORE-009.2** — Sub two
`;
    const tasks = parsePlan(md);
    expect(tasks.map((t) => t.id)).toEqual(['CORE-EPIC-009', 'CORE-009.1', 'CORE-009.2']);
    expect(tasks.every((t) => t.priority === 'Low')).toBe(true);
  });

  it('skips task-shaped lines outside known section headings', () => {
    const md = `## Vision

- [ ] **CORE-999** — should not appear

## High

- [ ] **CORE-001** — should appear
`;
    expect(parsePlan(md).map((t) => t.id)).toEqual(['CORE-001']);
  });

  it('strips bold markdown from descriptions', () => {
    const md = `## Low

- [ ] **CORE-EPIC-009** — Migrate **fintown** (epic; child tasks)
`;
    expect(parsePlan(md)[0].description).toBe('Migrate fintown (epic; child tasks)');
  });

  it('ignores empty-section placeholder lines', () => {
    const md = `## Critical

(none)

## High

- [ ] **CORE-001** — first
`;
    expect(parsePlan(md).map((t) => t.id)).toEqual(['CORE-001']);
  });

  it('parses [model] segment when present', () => {
    const md = `## High\n\n- [ ] **CORE-001** [opus] — Hello\n`;
    const t = parsePlan(md)[0];
    expect(t.model).toBe('opus');
    expect(t.shortname).toBeUndefined();
    expect(t.description).toBe('Hello');
  });

  it('parses | shortname segment when present', () => {
    const md = `## High\n\n- [ ] **CORE-001** | quick name — long description\n`;
    const t = parsePlan(md)[0];
    expect(t.model).toBeUndefined();
    expect(t.shortname).toBe('quick name');
    expect(t.description).toBe('long description');
  });

  it('parses [model] + | shortname together', () => {
    const md = `## High\n\n- [ ] **CORE-001** [sonnet] | quick — long\n`;
    const t = parsePlan(md)[0];
    expect(t.model).toBe('sonnet');
    expect(t.shortname).toBe('quick');
    expect(t.description).toBe('long');
  });

  it('parses [model] + | shortname with no long description', () => {
    const md = `## High\n\n- [ ] **CORE-001** [opus] | quick name\n`;
    const t = parsePlan(md)[0];
    expect(t.model).toBe('opus');
    expect(t.shortname).toBe('quick name');
    expect(t.description).toBe('');
    expect(t.completedDate).toBeUndefined();
  });

  it('parses [model] alone with no shortname or long description', () => {
    const md = `## High\n\n- [ ] **CORE-001** [opus]\n`;
    const t = parsePlan(md)[0];
    expect(t.model).toBe('opus');
    expect(t.shortname).toBeUndefined();
    expect(t.description).toBe('');
  });

  it('legacy minimal form leaves model and shortname undefined', () => {
    const md = `## High\n\n- [ ] **CORE-001** — Hello world\n`;
    const t = parsePlan(md)[0];
    expect(t.model).toBeUndefined();
    expect(t.shortname).toBeUndefined();
    expect(t.description).toBe('Hello world');
  });

  it('extracts Completed date from long description with new grammar', () => {
    const md = `## Completed\n\n- [x] **FE-005** [opus] | viz rebuild — Did the thing. Completed 2026-04-30.\n`;
    const t = parsePlan(md)[0];
    expect(t).toMatchObject({
      id: 'FE-005',
      model: 'opus',
      shortname: 'viz rebuild',
      completed: true,
      completedDate: '2026-04-30',
    });
    expect(t.description).toContain('Did the thing');
    expect(t.description).not.toContain('2026-04-30');
  });

  it('accepts adopter model tokens beyond opus|sonnet', () => {
    // Per SPEC §"Task-line format": adopters MAY substitute project-specific
    // tokens. Regex accepts any short lowercase token `[a-z][\w.-]*`.
    const md = [
      '## High',
      '',
      '- [ ] **CORE-001** [haiku] — On haiku',
      '- [ ] **CORE-002** [gpt-5] — On gpt-5',
      '- [ ] **CORE-003** [gemini-pro] — On gemini-pro',
    ].join('\n');
    const ts = parsePlan(md);
    expect(ts.map((t) => t.model)).toEqual(['haiku', 'gpt-5', 'gemini-pro']);
  });

  it('silently skips lines with malformed model-token shapes', () => {
    // Tokens must start lowercase and contain only [\w.-]. Malformed shapes
    // (empty, leading uppercase, leading digit) cause the whole TASK_LINE
    // regex to fail; the line is silently dropped. Matches the prior
    // typo-guard behavior of the old `(opus|sonnet)` enum.
    const md = [
      '## High',
      '',
      '- [ ] **CORE-001** [] — Empty token',
      '- [ ] **CORE-002** [Opus] — Leading uppercase',
      '- [ ] **CORE-003** [3x] — Leading digit',
    ].join('\n');
    expect(parsePlan(md)).toEqual([]);
  });

  // FE-066: grammar tolerances for real PLAN.md decorations.
  it('parses a model-suggestion glyph after [model] with no space', () => {
    const md = `## High\n\n- [ ] **FE-066** [medium]🧠 | glyph tol — long desc\n`;
    const t = parsePlan(md)[0];
    expect(t).toMatchObject({ id: 'FE-066', model: 'medium', shortname: 'glyph tol' });
    expect(t.description).toBe('long desc');
  });

  it('parses a model-suggestion glyph after [model] with a space', () => {
    const md = `## High\n\n- [ ] **FE-065** [light] 🔧 | dedup — cleanup work\n`;
    const t = parsePlan(md)[0];
    expect(t).toMatchObject({ id: 'FE-065', model: 'light', shortname: 'dedup' });
    expect(t.description).toBe('cleanup work');
  });

  it('parses a suggestion glyph directly before the long description (no shortname)', () => {
    const md = `## Completed\n\n- [x] **FE-064** [medium]🧠 — Completed 2026-07-02.\n`;
    const t = parsePlan(md)[0];
    expect(t).toMatchObject({ id: 'FE-064', model: 'medium', completed: true, completedDate: '2026-07-02' });
    expect(t.shortname).toBeUndefined();
  });

  it('parses stacked [model] tokens, capturing the first and dropping the rest', () => {
    const md = `## High\n\n- [ ] **CORE-001** [fable] [light] | stacked — desc\n`;
    const t = parsePlan(md)[0];
    expect(t.model).toBe('fable');
    expect(t.shortname).toBe('stacked');
    expect(t.description).toBe('desc');
  });

  it('parses a leading status glyph between the checkbox and the bold ID', () => {
    const md = `## High\n\n- [ ] ⏸ **CORE-042** [heavy] | parked — blocked work\n`;
    const t = parsePlan(md)[0];
    expect(t).toMatchObject({ id: 'CORE-042', model: 'heavy', shortname: 'parked' });
    expect(t.description).toBe('blocked work');
  });

  it('composes all three tolerances with [!critical], shortname, long desc, and a wikilink', () => {
    const md = `## High\n\n- [ ] ⏸ **CORE-042** [!critical] [fable] [light]🧠 | hotfix — Builds on [[FE-001]].\n`;
    const t = parsePlan(md)[0];
    expect(t).toMatchObject({
      id: 'CORE-042',
      critical: true,
      model: 'fable',
      shortname: 'hotfix',
    });
    expect(t.relatedTasks).toEqual(['FE-001']);
  });

  it('does not flag glyph-decorated rows as unparsed diagnostics', () => {
    const md = [
      '## High',
      '',
      '- [ ] **FE-066** [medium]🧠 | glyph — real row',
      '- [ ] ⏸ **CORE-042** [fable] [light]🔧 | parked — stacked + leading glyph',
    ].join('\n');
    const { tasks, unparsed } = parsePlanWithDiagnostics(md);
    expect(tasks.map((t) => t.id)).toEqual(['FE-066', 'CORE-042']);
    expect(unparsed).toEqual([]);
  });

  it('extracts a single [[TASK-ID]] wikilink into relatedTasks', () => {
    const md = `## Medium\n\n- [ ] **FE-003** | wikilink resolution — Builds on [[FE-001]] in viz/.\n`;
    const t = parsePlan(md)[0];
    expect(t.relatedTasks).toEqual(['FE-001']);
    expect(t.blockedBy).toEqual([]);
  });

  it('extracts multiple wikilinks into relatedTasks (deduped, in source order)', () => {
    const md = `## Medium\n\n- [ ] **FE-002** [opus] | cross-project viz — Extends [[FE-001]]; pairs with [[FE-004]] (and [[FE-001]] again).\n`;
    const t = parsePlan(md)[0];
    expect(t.relatedTasks).toEqual(['FE-001', 'FE-004']);
    expect(t.blockedBy).toEqual([]);
  });

  it('extracts Blocked by [[ID]] into blockedBy', () => {
    const md = `## Medium\n\n- [ ] **CORE-016** [opus] — Execute migration. Blocked by [[CORE-008]] — do not start until backlog is cleared.\n`;
    const t = parsePlan(md)[0];
    expect(t.blockedBy).toEqual(['CORE-008']);
    // Wikilink inside a Blocked-by block must NOT also land in relatedTasks.
    expect(t.relatedTasks).toEqual([]);
  });

  it('extracts Blocked by with multiple comma-separated wikilinks', () => {
    const md = `## Medium\n\n- [ ] **CORE-016** — Run migration. Blocked by [[CORE-008]], [[CORE-007]] — wait for upstream.\n`;
    const t = parsePlan(md)[0];
    expect(t.blockedBy).toEqual(['CORE-008', 'CORE-007']);
    expect(t.relatedTasks).toEqual([]);
  });

  it('keeps related and blocked separate within the same description', () => {
    const md = `## Medium\n\n- [ ] **FE-007** — Builds on [[FE-001]] and [[FE-004]]. Blocked by [[CORE-008]] — wait for migration playbook.\n`;
    const t = parsePlan(md)[0];
    expect(t.relatedTasks).toEqual(['FE-001', 'FE-004']);
    expect(t.blockedBy).toEqual(['CORE-008']);
  });

  it('puts a wikilink ID in blockedBy only when it appears in BOTH contexts (blocker wins)', () => {
    const md = `## Medium\n\n- [ ] **FE-009** — Extends [[CORE-008]] in spirit. Blocked by [[CORE-008]] until backlog clears.\n`;
    const t = parsePlan(md)[0];
    expect(t.blockedBy).toEqual(['CORE-008']);
    expect(t.relatedTasks).toEqual([]);
  });

  it('does NOT match bare-ID `Blocked by: CORE-008` (wikilink-only contract)', () => {
    const md = `## Medium\n\n- [ ] **CORE-016** — Run migration. Blocked by: CORE-008 — bare ID without wikilinks must not parse.\n`;
    const t = parsePlan(md)[0];
    expect(t.blockedBy).toEqual([]);
    expect(t.relatedTasks).toEqual([]);
  });

  it('returns empty arrays when the description has neither wikilinks nor blockers', () => {
    const md = `## High\n\n- [ ] **CORE-001** [opus] — Plain prose with no cross-references.\n`;
    const t = parsePlan(md)[0];
    expect(t.relatedTasks).toEqual([]);
    expect(t.blockedBy).toEqual([]);
  });

  it('handles legacy minimal task lines with no description (no wikilinks possible)', () => {
    const md = `## High\n\n- [ ] **CORE-001** [opus] | quick name\n`;
    const t = parsePlan(md)[0];
    expect(t.relatedTasks).toEqual([]);
    expect(t.blockedBy).toEqual([]);
  });

  it('ignores wikilinks and Blocked-by clauses inside backtick code spans', () => {
    const md = `## High\n\n- [ ] **FE-003** [opus] — Builds on [[FE-001]]; example placeholder \`[[FE-042]]\` and \`Blocked by [[CORE-999]]\` are literal code.\n`;
    const t = parsePlan(md)[0];
    expect(t.relatedTasks).toEqual(['FE-001']);
    expect(t.blockedBy).toEqual([]);
  });

  // FE-044: per-task [!critical] flag replaces the dropped `Critical` Priority.
  it('defaults critical to false on a plain task line', () => {
    const md = `## High\n\n- [ ] **CORE-001** [opus] — Plain row.\n`;
    expect(parsePlan(md)[0].critical).toBe(false);
  });

  it('parses [!critical] alone', () => {
    const md = `## High\n\n- [ ] **FE-100** [!critical] — Urgent row.\n`;
    const t = parsePlan(md)[0];
    expect(t.critical).toBe(true);
    expect(t.model).toBeUndefined();
    expect(t.description).toBe('Urgent row');
  });

  it('parses [!critical] + [model] + | shortname + long description in canonical order', () => {
    const md = `## High\n\n- [ ] **FE-100** [!critical] [opus] | hotfix — Production breakage.\n`;
    const t = parsePlan(md)[0];
    expect(t.critical).toBe(true);
    expect(t.model).toBe('opus');
    expect(t.shortname).toBe('hotfix');
    expect(t.description).toBe('Production breakage');
  });

  it('soft-migrates a legacy `## Critical` heading to priority=High with critical=true on every row', () => {
    const md = `## Critical\n\n- [ ] **CORE-99** [opus] | hotfix — Production breakage.\n\n## High\n\n- [ ] **CORE-100** [opus] | normal — Routine work.\n`;
    const tasks = parsePlan(md);
    expect(tasks).toHaveLength(2);
    expect(tasks[0]).toMatchObject({ id: 'CORE-99', priority: 'High', critical: true });
    expect(tasks[1]).toMatchObject({ id: 'CORE-100', priority: 'High', critical: false });
  });
});

describe('parsePlanWithDiagnostics', () => {
  it('collects checkbox-bullet lines that fail TASK_LINE with 1-based line numbers', () => {
    const md = `## High

- [ ] **CORE-001** — parses fine
- [ ] *FE-064* [medium] | bad-bold — single-asterisk ID fails
- [x] **fe-065** — lowercase ID fails
`;
    const { tasks, unparsed } = parsePlanWithDiagnostics(md);
    expect(tasks.map((t) => t.id)).toEqual(['CORE-001']);
    expect(unparsed).toEqual([
      { line: 4, text: '- [ ] *FE-064* [medium] | bad-bold — single-asterisk ID fails' },
      { line: 5, text: '- [x] **fe-065** — lowercase ID fails' },
    ]);
  });

  it('does not collect valid task lines or non-checkbox prose bullets', () => {
    const md = `## Medium

- [ ] **CORE-002** [light] | fine — valid line
- plain prose bullet, not a checkbox
(none)
`;
    const { tasks, unparsed } = parsePlanWithDiagnostics(md);
    expect(tasks).toHaveLength(1);
    expect(unparsed).toEqual([]);
  });

  it('ignores malformed checkbox lines outside recognized section headings', () => {
    const md = `## Vision

- [ ] *CORE-999* — malformed but outside a known section

## High

- [ ] *CORE-998* — malformed inside a known section
`;
    const { unparsed } = parsePlanWithDiagnostics(md);
    expect(unparsed).toEqual([
      { line: 7, text: '- [ ] *CORE-998* — malformed inside a known section' },
    ]);
  });

  it('parsePlanWithDiagnostics tasks omit malformed lines', () => {
    const md = `## High

- [ ] **CORE-001** — fine
- [ ] *CORE-002* — malformed
`;
    expect(parsePlanWithDiagnostics(md).tasks.map((t) => t.id)).toEqual(['CORE-001']);
  });
});

describe('groupTasks', () => {
  const t = (id: string, completed = false): Task => ({
    id,
    description: id,
    priority: 'Low',
    critical: false,
    completed,
    relatedTasks: [],
    blockedBy: [],
  });

  it('returns standalone tasks as flat top-level nodes', () => {
    const nodes = groupTasks([t('FE-001'), t('CORE-002')]);
    expect(nodes).toHaveLength(2);
    expect(nodes.every((n) => n.children.length === 0)).toBe(true);
    expect(nodes.map((n) => n.task.id)).toEqual(['FE-001', 'CORE-002']);
  });

  it('attaches subtasks to their epic parent by ID convention', () => {
    const nodes = groupTasks([
      t('CORE-EPIC-009'),
      t('CORE-009.1', true),
      t('CORE-009.2'),
      t('CORE-009.3'),
    ]);
    expect(nodes).toHaveLength(1);
    expect(nodes[0].task.id).toBe('CORE-EPIC-009');
    expect(nodes[0].children.map((c) => c.id)).toEqual([
      'CORE-009.1',
      'CORE-009.2',
      'CORE-009.3',
    ]);
  });

  it('preserves original order across mixed standalone + epic + standalone', () => {
    const nodes = groupTasks([
      t('FE-001'),
      t('CORE-EPIC-009'),
      t('CORE-009.1'),
      t('FE-002'),
    ]);
    expect(nodes.map((n) => n.task.id)).toEqual([
      'FE-001',
      'CORE-EPIC-009',
      'FE-002',
    ]);
    expect(nodes[1].children.map((c) => c.id)).toEqual(['CORE-009.1']);
  });

  it('attaches a subtask to its epic even when listed above the epic', () => {
    const nodes = groupTasks([
      t('CORE-009.1'),
      t('CORE-EPIC-009'),
      t('CORE-009.2'),
    ]);
    expect(nodes).toHaveLength(1);
    expect(nodes[0].task.id).toBe('CORE-EPIC-009');
    expect(nodes[0].children.map((c) => c.id)).toEqual([
      'CORE-009.1',
      'CORE-009.2',
    ]);
  });

  it('treats orphan subtasks (no matching epic) as top-level rows', () => {
    const nodes = groupTasks([t('CORE-009.1'), t('FE-001')]);
    expect(nodes.map((n) => n.task.id)).toEqual(['CORE-009.1', 'FE-001']);
    expect(nodes.every((n) => n.children.length === 0)).toBe(true);
  });

  it('handles an epic with no children', () => {
    const nodes = groupTasks([t('CORE-EPIC-009')]);
    expect(nodes).toHaveLength(1);
    expect(nodes[0].task.id).toBe('CORE-EPIC-009');
    expect(nodes[0].children).toEqual([]);
  });
});
