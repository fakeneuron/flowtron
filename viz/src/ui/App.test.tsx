import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { makeTasknote, renderApp } from '../test/fixtures';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('App — matchesFilter intersection', () => {
  const plan = `## High

- [ ] **CORE-100** | one — Task one
- [ ] **CORE-200** | two — Task two
- [ ] **CORE-300** | three — Task three
`;

  const active = [
    makeTasknote({
      id: 'CORE-100',
      frontmatter: {
        title: 'one',
        status: 'in-progress',
        tags: ['alpha'],
        created: '2026-05-07',
        relatedTasks: [],
      },
    }),
    makeTasknote({
      id: 'CORE-200',
      frontmatter: {
        title: 'two',
        status: 'blocked',
        tags: ['alpha'],
        created: '2026-05-07',
        relatedTasks: [],
      },
    }),
    makeTasknote({
      id: 'CORE-300',
      frontmatter: {
        title: 'three',
        status: 'in-progress',
        tags: ['beta'],
        created: '2026-05-07',
        relatedTasks: [],
      },
    }),
  ];

  it('intersects tag, status, and query (AND across dimensions)', async () => {
    const user = userEvent.setup();
    renderApp({ plan, active });

    await waitFor(() => expect(screen.getByText('CORE-100')).toBeInTheDocument());
    expect(screen.getByText('CORE-200')).toBeInTheDocument();
    expect(screen.getByText('CORE-300')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'alpha' }));
    await waitFor(() => expect(screen.queryByText('CORE-300')).not.toBeInTheDocument());
    expect(screen.getByText('CORE-100')).toBeInTheDocument();
    expect(screen.getByText('CORE-200')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /^In progress$/ }));
    await waitFor(() => expect(screen.queryByText('CORE-200')).not.toBeInTheDocument());
    expect(screen.getByText('CORE-100')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /^In progress$/ }));
    await user.type(screen.getByRole('searchbox'), '200');
    await waitFor(() => expect(screen.queryByText('CORE-100')).not.toBeInTheDocument());
    expect(screen.getByText('CORE-200')).toBeInTheDocument();
    expect(screen.queryByText('CORE-300')).not.toBeInTheDocument();
  });
});

describe('App — navigateToTask', () => {
  const plan = `## Critical

- [ ] **CORE-EPIC-1** | epic — Parent epic
- [ ] **CORE-1.1** | sub one — Subtask one. Builds on parent.
- [ ] **CORE-1.2** | sub two — Subtask two.

## Low

- [ ] **CORE-900** | jumper — Has [[CORE-1.1]] in related.
`;

  const active = [
    makeTasknote({
      id: 'CORE-900',
      frontmatter: {
        title: 'jumper',
        status: 'in-progress',
        tags: [],
        created: '2026-05-07',
        relatedTasks: ['CORE-1.1'],
      },
    }),
  ];

  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('auto-expands the parent epic, scrolls into view, and clears highlight after HIGHLIGHT_MS', async () => {
    const scrollSpy = vi.spyOn(Element.prototype, 'scrollIntoView').mockImplementation(() => {});
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderApp({ plan, active });

    await waitFor(() => expect(screen.getByText('CORE-EPIC-1')).toBeInTheDocument());

    const epicChevron = screen.getByRole('button', { name: 'Expand subtasks' });
    expect(epicChevron).toHaveAttribute('aria-expanded', 'false');
    expect(document.getElementById('row-CORE-1.1')).toBeNull();

    const relatedChip = screen.getByRole('button', { name: 'CORE-1.1' });
    await user.click(relatedChip);

    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Collapse subtasks' })).toBeInTheDocument(),
    );
    expect(document.getElementById('row-CORE-1.1')).not.toBeNull();

    expect(scrollSpy).toHaveBeenCalledWith({ behavior: 'smooth', block: 'center' });

    const targetRow = document.getElementById('row-CORE-1.1')!;
    expect(targetRow.className).toMatch(/ring-amber/);

    await vi.advanceTimersByTimeAsync(1500);
    await waitFor(() => expect(targetRow.className).not.toMatch(/ring-amber/));
  });
});

describe('App — expand-on-click toggling', () => {
  const plan = `## High

- [ ] **CORE-100** | only — Only task
`;

  const active = [
    makeTasknote({
      id: 'CORE-100',
      goal: 'The goal sentence.',
      frontmatter: {
        title: 'only',
        status: 'in-progress',
        tags: [],
        created: '2026-05-07',
        relatedTasks: [],
      },
    }),
  ];

  it('reveals TaskDetail on first click and hides it on the second click', async () => {
    const user = userEvent.setup();
    renderApp({ plan, active });

    await waitFor(() => expect(screen.getByText('CORE-100')).toBeInTheDocument());

    const toggle = screen.getByRole('button', { expanded: false, name: /CORE-100/ });
    expect(screen.queryByText('The goal sentence.')).not.toBeInTheDocument();

    await user.click(toggle);
    await waitFor(() => expect(screen.getByText('The goal sentence.')).toBeInTheDocument());
    expect(screen.getByRole('button', { expanded: true, name: /CORE-100/ })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { expanded: true, name: /CORE-100/ }));
    await waitFor(() =>
      expect(screen.queryByText('The goal sentence.')).not.toBeInTheDocument(),
    );
  });
});

describe('App — status badge selection', () => {
  const plan = `## High

- [ ] **CORE-100** | active — Active
- [ ] **CORE-200** | parked — Parked
`;

  const active = [
    makeTasknote({
      id: 'CORE-100',
      frontmatter: {
        title: 'active',
        status: 'in-progress',
        tags: [],
        created: '2026-05-07',
        relatedTasks: [],
      },
    }),
    makeTasknote({
      id: 'CORE-200',
      frontmatter: {
        title: 'parked',
        status: 'blocked',
        tags: [],
        created: '2026-05-07',
        relatedTasks: [],
      },
    }),
  ];

  it('toggles aria-pressed on the chip and filters rows by selected status', async () => {
    const user = userEvent.setup();
    renderApp({ plan, active });

    await waitFor(() => expect(screen.getByText('CORE-100')).toBeInTheDocument());

    const statusGroup = screen.getByText('Status:').parentElement!;
    const blockedChip = within(statusGroup).getByRole('button', { name: 'Blocked' });
    expect(blockedChip).toHaveAttribute('aria-pressed', 'false');

    await user.click(blockedChip);

    await waitFor(() =>
      expect(within(statusGroup).getByRole('button', { name: 'Blocked' })).toHaveAttribute(
        'aria-pressed',
        'true',
      ),
    );
    expect(screen.queryByText('CORE-100')).not.toBeInTheDocument();
    expect(screen.getByText('CORE-200')).toBeInTheDocument();

    await user.click(within(statusGroup).getByRole('button', { name: 'Blocked' }));
    await waitFor(() => expect(screen.getByText('CORE-100')).toBeInTheDocument());
    expect(within(statusGroup).getByRole('button', { name: 'Blocked' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });
});
