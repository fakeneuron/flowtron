import { describe, it, expect } from 'vitest';
import { extractSection, parseFrontmatter, parseTasknote } from './tasknote';

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
        // area, model, created missing
      }),
    ).toBeNull();
  });

  it('parses a complete CORE-017 frontmatter object', () => {
    const fm = parseFrontmatter({
      title: 'Test task',
      status: 'in-progress',
      priority: 'Medium',
      area: 'frontend',
      model: 'opus',
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
      model: 'opus',
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
      model: 'sonnet',
      created: '2026-05-01',
    });
    expect(fm).not.toBeNull();
    expect(fm?.tags).toEqual([]);
    expect(fm?.due).toBeUndefined();
    expect(fm?.relatedTasks).toEqual([]);
  });

  it('rejects invalid status or model values', () => {
    expect(
      parseFrontmatter({
        title: 'X',
        status: 'bogus',
        priority: 'Medium',
        area: 'core',
        model: 'opus',
        created: '2026-05-01',
      }),
    ).toBeNull();
    expect(
      parseFrontmatter({
        title: 'X',
        status: 'in-progress',
        priority: 'Medium',
        area: 'core',
        model: 'gpt',
        created: '2026-05-01',
      }),
    ).toBeNull();
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

describe('parseTasknote', () => {
  it('parses a tasknote with frontmatter and section extraction', () => {
    const text = `---
title: Demo
status: in-progress
priority: High
area: frontend
model: opus
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
});
