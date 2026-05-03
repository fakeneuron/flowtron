import { describe, it, expect } from 'vitest';
import {
  activePhaseIndex,
  countChecklist,
  extractSection,
  parseFrontmatter,
  parseTasknote,
} from './tasknote';

describe('parseFrontmatter', () => {
  it('returns null for empty data', () => {
    expect(parseFrontmatter({})).toBeNull();
    expect(parseFrontmatter(null)).toBeNull();
    expect(parseFrontmatter(undefined)).toBeNull();
  });

  it('returns null when required fields are missing', () => {
    expect(
      parseFrontmatter({
        title: 'X',
        status: 'in-progress',
        priority: 'High',
        // area and created missing
      }),
    ).toBeNull();
  });

  it('parses a complete frontmatter object', () => {
    const fm = parseFrontmatter({
      title: 'Test task',
      status: 'in-progress',
      priority: 'Medium',
      area: 'frontend',
      tags: ['ui', 'parser'],
      created: '2026-05-01',
      due: '2026-05-15',
      'related-tasks': ['FE-001', 'CORE-017'],
    });
    expect(fm).toEqual({
      title: 'Test task',
      status: 'in-progress',
      priority: 'Medium',
      area: 'frontend',
      tags: ['ui', 'parser'],
      created: '2026-05-01',
      due: '2026-05-15',
      relatedTasks: ['FE-001', 'CORE-017'],
    });
  });

  it('handles optional fields gracefully', () => {
    const fm = parseFrontmatter({
      title: 'Test',
      status: 'not-started',
      priority: 'Low',
      area: 'core',
      created: '2026-05-01',
    });
    expect(fm).not.toBeNull();
    expect(fm?.tags).toEqual([]);
    expect(fm?.due).toBeUndefined();
    expect(fm?.relatedTasks).toEqual([]);
  });

  it('rejects invalid status values', () => {
    expect(
      parseFrontmatter({
        title: 'X',
        status: 'bogus',
        priority: 'Medium',
        area: 'core',
        created: '2026-05-01',
      }),
    ).toBeNull();
  });

  it('accepts status: starter', () => {
    const fm = parseFrontmatter({
      title: 'A starter',
      status: 'starter',
      priority: 'Medium',
      area: 'core',
      created: '2026-05-03',
    });
    expect(fm).not.toBeNull();
    expect(fm?.status).toBe('starter');
  });

  it('tolerates legacy `model:` field on archived tasknotes (ignored, not rejected)', () => {
    const fm = parseFrontmatter({
      title: 'Old',
      status: 'completed',
      priority: 'High',
      area: 'core',
      model: 'opus',
      created: '2026-04-30',
    });
    expect(fm).not.toBeNull();
    expect(fm?.title).toBe('Old');
    expect((fm as unknown as { model?: string }).model).toBeUndefined();
  });
});

describe('extractSection', () => {
  const body = `# TASK-001 | Title

[← PLAN.md](../PLAN.md) · 🟢 In progress

## 🎯 Goal

The goal text.

## ✅ Acceptance

- [ ] Criterion A
- [ ] Criterion B

## 🧩 Subtasks

- [ ] Step 1
- [ ] Step 2

## 🔗 Related

- [[FE-001]] — predecessor

---

## 📝 Phase 1: Discovery

Phase content goes here.
`;

  it('extracts the Goal section', () => {
    expect(extractSection(body, 'Goal')).toBe('The goal text.');
  });

  it('extracts a multi-line section with markdown checklist', () => {
    expect(extractSection(body, 'Subtasks')).toBe('- [ ] Step 1\n- [ ] Step 2');
  });

  it('stops at the next H2 (does not bleed into Phase 1)', () => {
    const related = extractSection(body, 'Related');
    expect(related).toBe('- [[FE-001]] — predecessor');
    expect(related).not.toContain('Phase content');
  });

  it('returns empty string for missing sections', () => {
    expect(extractSection(body, 'DoesNotExist')).toBe('');
  });
});

describe('countChecklist', () => {
  it('returns zero counts for empty input', () => {
    expect(countChecklist('')).toEqual({ total: 0, done: 0 });
  });

  it('counts unchecked, lowercase x, and uppercase X items', () => {
    const md = `- [ ] one
- [x] two
- [X] three
- [ ] four`;
    expect(countChecklist(md)).toEqual({ total: 4, done: 2 });
  });

  it('ignores non-checklist lines and indented sub-paragraphs', () => {
    const md = `- [x] item with body

  some note text under it

- [ ] another item
plain prose line`;
    expect(countChecklist(md)).toEqual({ total: 2, done: 1 });
  });
});

describe('activePhaseIndex', () => {
  it('returns 0 when no phases have been started', () => {
    expect(
      activePhaseIndex([
        { total: 6, done: 0 },
        { total: 4, done: 0 },
        { total: 4, done: 0 },
        { total: 6, done: 0 },
      ]),
    ).toBe(0);
  });

  it('returns the earliest phase with any incomplete box', () => {
    expect(
      activePhaseIndex([
        { total: 6, done: 6 },
        { total: 4, done: 1 },
        { total: 4, done: 0 },
        { total: 6, done: 0 },
      ]),
    ).toBe(1);
  });

  it('treats a zero-total phase as the active phase (e.g. archived/empty)', () => {
    expect(
      activePhaseIndex([
        { total: 6, done: 6 },
        { total: 0, done: 0 },
        { total: 4, done: 0 },
        { total: 6, done: 0 },
      ]),
    ).toBe(1);
  });

  it('returns the last phase when all are fully done', () => {
    expect(
      activePhaseIndex([
        { total: 6, done: 6 },
        { total: 4, done: 4 },
        { total: 4, done: 4 },
        { total: 6, done: 6 },
      ]),
    ).toBe(3);
  });
});

describe('parseTasknote', () => {
  it('parses a tasknote with frontmatter and section extraction', () => {
    const text = `---
title: Demo
status: in-progress
priority: High
area: frontend
tags: [a, b]
created: 2026-05-01
due:
related-tasks: []
---

# DEMO-1 | Demo

## 🎯 Goal

Demo goal.

## 🧩 Subtasks

- [ ] One
- [ ] Two
`;
    const tn = parseTasknote('DEMO-1', '/abs/path/DEMO-1.md', text);
    expect(tn.id).toBe('DEMO-1');
    expect(tn.path).toBe('/abs/path/DEMO-1.md');
    expect(tn.frontmatter?.title).toBe('Demo');
    expect(tn.frontmatter?.tags).toEqual(['a', 'b']);
    expect(tn.frontmatter?.due).toBeUndefined();
    expect(tn.goal).toBe('Demo goal.');
    expect(tn.subtasks).toBe('- [ ] One\n- [ ] Two');
  });

  it('returns null frontmatter for an archived tasknote with no YAML block', () => {
    const text = `# OLD-1 | Old tasknote

Some legacy content with no frontmatter.
`;
    const tn = parseTasknote('OLD-1', '/abs/path/OLD-1.md', text);
    expect(tn.frontmatter).toBeNull();
    expect(tn.body).toContain('# OLD-1');
  });

  it('returns null frontmatter for malformed YAML missing required fields', () => {
    const text = `---
title: Missing fields
---

Body
`;
    const tn = parseTasknote('BAD-1', '/abs/path/BAD-1.md', text);
    expect(tn.frontmatter).toBeNull();
  });

  it('extracts per-phase checklist counts and subtasksProgress', () => {
    const text = `# T-1 | Title

## 🧩 Subtasks

- [x] one
- [x] two
- [ ] three

---

## 📝 Phase 1: Discovery

- [x] reviewed PLAN.md
- [x] relevance assessment
- [x] read source files
- [x] drift check
- [x] clarifying questions
- [x] subtasks populated

## 🛠️ Phase 2: Execution

- [ ] pattern survey
- [ ] minimal implementation
- [ ] tests
- [ ] targeted run

## 🧪 Phase 3: Testing & Linting

- [ ] targeted suite
- [ ] lint/type-check
- [ ] visual confirmation
- [ ] fixed introduced issues

## 🚀 Phase 4: Closure

- [ ] verified prior phases
- [ ] updated docs
- [ ] PLAN.md flipped
- [ ] nav header updated
- [ ] moved to archive
- [ ] recap confirmed
`;
    const tn = parseTasknote('T-1', '/abs/path/T-1.md', text);
    expect(tn.subtasksProgress).toEqual({ total: 3, done: 2 });
    expect(tn.phases).toHaveLength(4);
    expect(tn.phases[0]).toEqual({ total: 6, done: 6 }); // Phase 1 fully done
    expect(tn.phases[1]).toEqual({ total: 4, done: 0 }); // Phase 2 not started
    expect(tn.phases[2]).toEqual({ total: 4, done: 0 });
    expect(tn.phases[3]).toEqual({ total: 6, done: 0 });
  });

  it('returns zero phase counts for archived tasknotes with no phase headings', () => {
    const text = `# OLD-1 | Old\n\nNo phases here.\n`;
    const tn = parseTasknote('OLD-1', '/abs/OLD-1.md', text);
    expect(tn.phases).toEqual([
      { total: 0, done: 0 },
      { total: 0, done: 0 },
      { total: 0, done: 0 },
      { total: 0, done: 0 },
    ]);
    expect(tn.subtasksProgress).toEqual({ total: 0, done: 0 });
  });

  it('parses a starter tasknote and populates starterContext', () => {
    const text = `---
title: Demo starter
status: starter
priority: Medium
area: frontend
tags: []
created: 2026-05-03
---

# DEMO-2 | Demo starter

[← PLAN.md](../PLAN.md) · 🌱 Starter (filed 2026-05-03)

## 🌱 Starter context

_Captured 2026-05-03._

### Why this exists

Rich context that would otherwise bloat PLAN.md.

### Files to touch

- \`viz/src/tasknote.ts\` — add starter status
`;
    const tn = parseTasknote('DEMO-2', '/abs/DEMO-2.md', text);
    expect(tn.frontmatter?.status).toBe('starter');
    expect(tn.goal).toBe('');
    expect(tn.acceptance).toBe('');
    expect(tn.subtasks).toBe('');
    expect(tn.starterContext).toContain('Why this exists');
    expect(tn.starterContext).toContain('Rich context that would otherwise bloat PLAN.md.');
    expect(tn.starterContext).toContain('viz/src/tasknote.ts');
  });
});
