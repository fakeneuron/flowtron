import { describe, it, expect } from 'vitest';
import { groupTasks, parsePlan, type Task } from './parser';

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
        completed: false,
        completedDate: undefined,
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
});

describe('groupTasks', () => {
  const t = (id: string, completed = false): Task => ({
    id,
    description: id,
    priority: 'Low',
    completed,
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
