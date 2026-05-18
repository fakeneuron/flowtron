import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { makeTasknote, renderApp } from '../test/fixtures';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('App — navigateToTask', () => {
  const plan = `## Critical

- [ ] **CORE-EPIC-1** | epic — Parent epic
- [ ] **CORE-1.1** | sub one — Subtask one. Builds on parent.
- [ ] **CORE-1.2** | sub two — Subtask two.

## Low

- [ ] **CORE-900** | jumper — Has [[CORE-1.1]] in related.
`;

  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('clicking a wikilink in TaskDetail auto-expands the parent epic, scrolls, and clears highlight', async () => {
    const scrollSpy = vi.spyOn(Element.prototype, 'scrollIntoView').mockImplementation(() => {});
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderApp({ plan });

    await waitFor(() => expect(screen.getByText('CORE-EPIC-1')).toBeInTheDocument());

    const epicChevron = screen.getByRole('button', { name: 'Expand subtasks' });
    expect(epicChevron).toHaveAttribute('aria-expanded', 'false');

    await user.click(screen.getByRole('button', { name: /CORE-900/, expanded: false }));

    const wikilink = await screen.findByRole('button', { name: /\[\[CORE-1\.1\]\]/ });
    await user.click(wikilink);

    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Collapse subtasks' })).toBeInTheDocument(),
    );
    expect(document.getElementById('row-CORE-1.1')).not.toBeNull();

    expect(scrollSpy).toHaveBeenCalledWith({ behavior: 'smooth', block: 'center' });

    const targetRow = document.getElementById('row-CORE-1.1')!;
    expect(targetRow.className).toMatch(/ring-indigo/);

    await vi.advanceTimersByTimeAsync(1500);
    await waitFor(() => expect(targetRow.className).not.toMatch(/ring-indigo/));
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

describe('App — subtask expand-on-click toggling', () => {
  const plan = `## High

- [ ] **CORE-EPIC-1** | epic — Parent epic
- [ ] **CORE-1.1** | sub one — Subtask one
`;

  const active = [
    makeTasknote({
      id: 'CORE-1.1',
      goal: 'The subtask goal sentence.',
      frontmatter: {
        title: 'sub one',
        status: 'in-progress',
        tags: [],
        created: '2026-05-07',
        relatedTasks: [],
      },
    }),
  ];

  it('reveals TaskDetail on first click of a subtask and hides it on the second click', async () => {
    const user = userEvent.setup();
    renderApp({ plan, active });

    await waitFor(() => expect(screen.getByText('CORE-EPIC-1')).toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: 'Expand subtasks' }));
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Collapse subtasks' })).toBeInTheDocument(),
    );

    const subtaskToggle = screen.getByRole('button', { name: /CORE-1\.1/, expanded: false });
    expect(screen.queryByText('The subtask goal sentence.')).not.toBeInTheDocument();

    await user.click(subtaskToggle);
    await waitFor(() =>
      expect(screen.getByText('The subtask goal sentence.')).toBeInTheDocument(),
    );
    expect(
      screen.getByRole('button', { name: /CORE-1\.1/, expanded: true }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /CORE-1\.1/, expanded: true }));
    await waitFor(() =>
      expect(screen.queryByText('The subtask goal sentence.')).not.toBeInTheDocument(),
    );
  });
});

describe('App — row StatusChip', () => {
  const plan = `## High

- [ ] **CORE-100** | active — Active task
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
  ];

  it('renders the emoji-only StatusChip in the row', async () => {
    renderApp({ plan, active });
    await waitFor(() => expect(screen.getByText('CORE-100')).toBeInTheDocument());
    expect(within(screen.getByRole('main')).getByText('🟢')).toBeInTheDocument();
  });
});

describe('App — project switching', () => {
  const plan = `## High

- [ ] **CORE-100** | one — Task one
`;
  const active = [
    makeTasknote({
      id: 'CORE-100',
      frontmatter: {
        title: 'one',
        status: 'in-progress',
        tags: [],
        created: '2026-05-07',
        relatedTasks: [],
      },
    }),
  ];

  beforeEach(() => {
    window.localStorage.clear();
  });

  it('fetches /api/projects, renders chips, and marks the stored or first project active', async () => {
    window.localStorage.setItem('flowtron-viz-active-project', 'fintown');
    renderApp({ plan, active, projects: ['flowtron', 'fintown', 'invisipaw'] });

    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Project: fintown' })).toHaveAttribute(
        'aria-pressed',
        'true',
      ),
    );
    expect(screen.getByRole('button', { name: 'Project: flowtron' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Flowtron — fintown');
  });

  it('falls back to the first project when stored value is unknown', async () => {
    window.localStorage.setItem('flowtron-viz-active-project', 'gone-project');
    renderApp({ plan, active, projects: ['alpha', 'beta'] });

    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Project: alpha' })).toHaveAttribute(
        'aria-pressed',
        'true',
      ),
    );
  });

  it('on switch: updates active state, persists to localStorage, and resets filters', async () => {
    const user = userEvent.setup();
    renderApp({ plan, active, projects: ['flowtron', 'fintown'] });

    await waitFor(() => expect(screen.getByText('CORE-100')).toBeInTheDocument());

    await user.type(screen.getByRole('searchbox'), 'one');
    expect(screen.getByRole('searchbox')).toHaveValue('one');

    await user.click(screen.getByRole('button', { name: 'Project: fintown' }));

    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Project: fintown' })).toHaveAttribute(
        'aria-pressed',
        'true',
      ),
    );
    expect(window.localStorage.getItem('flowtron-viz-active-project')).toBe('fintown');
    expect(screen.getByRole('searchbox')).toHaveValue('');
  });
});

describe('App — load() partial failure on project switch', () => {
  const plan = `## High

- [ ] **CORE-100** | one — Task one
`;
  const active = [
    makeTasknote({
      id: 'CORE-100',
      frontmatter: {
        title: 'one',
        status: 'in-progress',
        tags: [],
        created: '2026-05-07',
        relatedTasks: [],
      },
    }),
  ];

  beforeEach(() => {
    window.localStorage.clear();
  });

  it('clears stale rows when the new project /api/archive fails', async () => {
    const user = userEvent.setup();
    renderApp({
      plan,
      active,
      projects: ['flowtron', 'fintown'],
      perProject: {
        fintown: { fail: { archive: 500 } },
      },
    });

    await waitFor(() => expect(screen.getByText('CORE-100')).toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: 'Project: fintown' }));

    await waitFor(() =>
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Flowtron — fintown'),
    );
    await waitFor(() =>
      expect(screen.getByText(/Archive list failed: HTTP 500/)).toBeInTheDocument(),
    );

    expect(screen.queryByText('CORE-100')).not.toBeInTheDocument();
  });
});

describe('App — settings modal', () => {
  const plan = `## High

- [ ] **CORE-100** [opus] | one — Task one [[CORE-200]]
`;
  const active = [
    makeTasknote({
      id: 'CORE-100',
      goal: 'The goal sentence.',
      subtasks: '- [ ] step a\n- [ ] step b',
      frontmatter: {
        title: 'one',
        status: 'in-progress',
        tags: ['viz', 'ui'],
        created: '2026-05-07',
        due: '2026-06-01',
        relatedTasks: [],
      },
    }),
  ];

  beforeEach(() => {
    window.localStorage.clear();
  });

  it('gear opens the dialog; Done closes it', async () => {
    const user = userEvent.setup();
    renderApp({ plan, active });

    await waitFor(() => expect(screen.getByText('CORE-100')).toBeInTheDocument());

    const dialog = document.querySelector('dialog') as HTMLDialogElement;
    expect(dialog.open).toBe(false);

    await user.click(screen.getByRole('button', { name: 'Open settings' }));
    await waitFor(() => expect(dialog.open).toBe(true));

    await user.click(screen.getByRole('button', { name: 'Done' }));
    await waitFor(() => expect(dialog.open).toBe(false));
  });

  it('toggling row-chip prefs surfaces hidden chips and hides shown ones', async () => {
    const user = userEvent.setup();
    renderApp({ plan, active });

    await waitFor(() => expect(screen.getByText('CORE-100')).toBeInTheDocument());
    expect(screen.queryByText('viz')).not.toBeInTheDocument();
    expect(screen.getByText('🧠')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Open settings' }));
    await user.click(screen.getByRole('checkbox', { name: 'Tags' }));
    await user.click(screen.getByRole('checkbox', { name: 'Model' }));

    await waitFor(() => expect(screen.getByText('viz')).toBeInTheDocument());
    expect(screen.getByText('ui')).toBeInTheDocument();
    expect(screen.queryByText('🧠')).not.toBeInTheDocument();
  });

  it('toggling detailSections.subtasks hides the Subtasks section when the row is expanded', async () => {
    const user = userEvent.setup();
    renderApp({ plan, active });

    await waitFor(() => expect(screen.getByText('CORE-100')).toBeInTheDocument());

    await user.click(screen.getByRole('button', { expanded: false, name: /CORE-100/ }));
    await waitFor(() => expect(screen.getByText('The goal sentence.')).toBeInTheDocument());
    expect(screen.getByText('Subtasks', { selector: 'p' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Open settings' }));
    await user.click(screen.getByRole('checkbox', { name: 'Subtasks' }));

    await waitFor(() =>
      expect(screen.queryByText('Subtasks', { selector: 'p' })).not.toBeInTheDocument(),
    );
    expect(screen.getByText('The goal sentence.')).toBeInTheDocument();
  });

  it('Reset to defaults restores tags OFF / model ON and detail-sections ON', async () => {
    const user = userEvent.setup();
    window.localStorage.setItem(
      'flowtron-viz-prefs:flowtron',
      JSON.stringify({
        version: 1,
        rowChips: { tags: true, model: false, related: false, due: false },
        detailSections: { goal: false, acceptance: true, subtasks: true },
      }),
    );
    renderApp({ plan, active });

    await waitFor(() => expect(screen.getByText('viz')).toBeInTheDocument());
    expect(screen.queryByText('🧠')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Open settings' }));
    await user.click(screen.getByRole('button', { name: 'Reset to defaults' }));

    await waitFor(() => expect(screen.queryByText('viz')).not.toBeInTheDocument());
    expect(screen.getByText('🧠')).toBeInTheDocument();
  });

  it('per-project: switching projects reloads prefs from that project key', async () => {
    const user = userEvent.setup();
    window.localStorage.setItem(
      'flowtron-viz-prefs:fintown',
      JSON.stringify({
        version: 1,
        rowChips: { tags: true, model: false, related: false, due: false },
        detailSections: { goal: true, acceptance: true, subtasks: true },
      }),
    );
    renderApp({ plan, active, projects: ['flowtron', 'fintown'] });

    await waitFor(() => expect(screen.getByText('CORE-100')).toBeInTheDocument());
    expect(screen.queryByText('viz')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Project: fintown' }));

    await waitFor(() => expect(screen.getByText('viz')).toBeInTheDocument());
  });
});

describe('App — density modes', () => {
  const plan = `## High

- [ ] **CORE-100** [opus] | one — Task one
`;
  const active = [
    makeTasknote({
      id: 'CORE-100',
      frontmatter: {
        title: 'one',
        status: 'in-progress',
        tags: [],
        created: '2026-05-07',
        relatedTasks: [],
      },
    }),
  ];

  beforeEach(() => {
    window.localStorage.clear();
  });

  const rowPadClasses = (): string => {
    const row = document.getElementById('row-CORE-100');
    const inner = row?.querySelector(':scope > div');
    return inner?.className ?? '';
  };

  it('renders three Density radios in the settings modal', async () => {
    const user = userEvent.setup();
    renderApp({ plan, active });

    await waitFor(() => expect(screen.getByText('CORE-100')).toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: 'Open settings' }));

    const densityGroup = screen.getByRole('group', { name: 'Density' });
    const comfortable = within(densityGroup).getByRole('radio', { name: 'Comfortable' });
    const def = within(densityGroup).getByRole('radio', { name: 'Default' });
    const compact = within(densityGroup).getByRole('radio', { name: 'Compact' });
    expect(comfortable).not.toBeChecked();
    expect(def).toBeChecked();
    expect(compact).not.toBeChecked();
  });

  it('selecting Compact tightens row padding', async () => {
    const user = userEvent.setup();
    renderApp({ plan, active });

    await waitFor(() => expect(screen.getByText('CORE-100')).toBeInTheDocument());
    expect(rowPadClasses()).toContain('px-2.5 py-1.5');

    await user.click(screen.getByRole('button', { name: 'Open settings' }));
    await user.click(screen.getByRole('radio', { name: 'Compact' }));

    await waitFor(() => expect(rowPadClasses()).toContain('px-2 py-1'));
    expect(rowPadClasses()).not.toContain('px-2.5');
  });

  it('selecting Comfortable loosens row padding', async () => {
    const user = userEvent.setup();
    renderApp({ plan, active });

    await waitFor(() => expect(screen.getByText('CORE-100')).toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: 'Open settings' }));
    await user.click(screen.getByRole('radio', { name: 'Comfortable' }));

    await waitFor(() => expect(rowPadClasses()).toContain('px-3 py-2'));
    expect(rowPadClasses()).not.toContain('px-2.5');
  });

  it('Reset to defaults restores Default density', async () => {
    const user = userEvent.setup();
    window.localStorage.setItem(
      'flowtron-viz-prefs:flowtron',
      JSON.stringify({
        version: 1,
        rowChips: { tags: false, model: true, related: false, due: false },
        detailSections: { goal: true, acceptance: true, subtasks: true },
        density: 'compact',
      }),
    );
    renderApp({ plan, active });

    await waitFor(() => expect(screen.getByText('CORE-100')).toBeInTheDocument());
    expect(rowPadClasses()).toContain('px-2 py-1');

    await user.click(screen.getByRole('button', { name: 'Open settings' }));
    await user.click(screen.getByRole('button', { name: 'Reset to defaults' }));

    await waitFor(() => expect(rowPadClasses()).toContain('px-2.5 py-1.5'));
  });

  it('per-project: switching projects reloads density from that project key', async () => {
    const user = userEvent.setup();
    window.localStorage.setItem(
      'flowtron-viz-prefs:fintown',
      JSON.stringify({
        version: 1,
        rowChips: { tags: false, model: true, related: false, due: false },
        detailSections: { goal: true, acceptance: true, subtasks: true },
        density: 'comfortable',
      }),
    );
    renderApp({ plan, active, projects: ['flowtron', 'fintown'] });

    await waitFor(() => expect(screen.getByText('CORE-100')).toBeInTheDocument());
    expect(rowPadClasses()).toContain('px-2.5 py-1.5');

    await user.click(screen.getByRole('button', { name: 'Project: fintown' }));

    await waitFor(() => expect(rowPadClasses()).toContain('px-3 py-2'));
  });
});


describe('App — palette modes', () => {
  const plan = `## High

- [ ] **CORE-100** [opus] | one — Task one
`;
  const active = [
    makeTasknote({
      id: 'CORE-100',
      frontmatter: {
        title: 'one',
        status: 'in-progress',
        tags: [],
        created: '2026-05-07',
        relatedTasks: [],
      },
    }),
  ];

  beforeEach(() => {
    window.localStorage.clear();
  });

  it('renders two Palette radios in the settings modal', async () => {
    const user = userEvent.setup();
    renderApp({ plan, active });

    await waitFor(() => expect(screen.getByText('CORE-100')).toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: 'Open settings' }));

    const paletteGroup = screen.getByRole('group', { name: 'Palette' });
    const def = within(paletteGroup).getByRole('radio', { name: 'Default' });
    const linear = within(paletteGroup).getByRole('radio', { name: 'Linear' });
    expect(def).toBeChecked();
    expect(linear).not.toBeChecked();
  });

  it('selecting Linear checks the Linear radio', async () => {
    const user = userEvent.setup();
    renderApp({ plan, active });

    await waitFor(() => expect(screen.getByText('CORE-100')).toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: 'Open settings' }));
    await user.click(screen.getByRole('radio', { name: 'Linear' }));

    await waitFor(() => expect(screen.getByRole('radio', { name: 'Linear' })).toBeChecked());
  });

  it('Reset to defaults restores Default palette', async () => {
    const user = userEvent.setup();
    window.localStorage.setItem(
      'flowtron-viz-prefs:flowtron',
      JSON.stringify({
        version: 2,
        rowChips: { id: true, tags: false, model: true, related: false, due: false },
        detailSections: { goal: true, acceptance: true, subtasks: true },
        starterSections: { whyExists: true, solutionShape: true, filesToTouch: true, outOfScope: true },
        density: 'default',
        palette: 'linear',
      }),
    );
    renderApp({ plan, active });

    await waitFor(() => expect(screen.getByText('CORE-100')).toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: 'Open settings' }));
    expect(screen.getByRole('radio', { name: 'Linear' })).toBeChecked();

    await user.click(screen.getByRole('button', { name: 'Reset to defaults' }));

    await waitFor(() => expect(screen.getByRole('radio', { name: 'Linear' })).not.toBeChecked());
  });

  it('per-project: switching projects reloads palette from that project key', async () => {
    const user = userEvent.setup();
    window.localStorage.setItem(
      'flowtron-viz-prefs:fintown',
      JSON.stringify({
        version: 2,
        rowChips: { id: true, tags: false, model: true, related: false, due: false },
        detailSections: { goal: true, acceptance: true, subtasks: true },
        starterSections: { whyExists: true, solutionShape: true, filesToTouch: true, outOfScope: true },
        density: 'default',
        palette: 'linear',
      }),
    );
    renderApp({ plan, active, projects: ['flowtron', 'fintown'] });

    await waitFor(() => expect(screen.getByText('CORE-100')).toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: 'Project: fintown' }));

    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Project: fintown' })).toHaveAttribute(
        'aria-pressed',
        'true',
      ),
    );

    await user.click(screen.getByRole('button', { name: 'Open settings' }));
    await waitFor(() => expect(screen.getByRole('radio', { name: 'Linear' })).toBeChecked());
  });
});

describe('App — shortcuts modal', () => {
  const plan = `## High

- [ ] **CORE-100** | one — Task one
`;
  const active = [
    makeTasknote({
      id: 'CORE-100',
      frontmatter: {
        title: 'one',
        status: 'in-progress',
        tags: [],
        created: '2026-05-07',
        relatedTasks: [],
      },
    }),
  ];

  it('? button opens the dialog; Done closes it', async () => {
    const user = userEvent.setup();
    renderApp({ plan, active });

    await waitFor(() => expect(screen.getByText('CORE-100')).toBeInTheDocument());

    const dialogs = document.querySelectorAll('dialog');
    const shortcutsDialog = Array.from(dialogs).find(
      (d) => d.getAttribute('aria-labelledby') === 'shortcuts-modal-title',
    ) as HTMLDialogElement;
    expect(shortcutsDialog.open).toBe(false);

    await user.click(screen.getByRole('button', { name: 'Keyboard shortcuts' }));
    await waitFor(() => expect(shortcutsDialog.open).toBe(true));

    await user.click(screen.getByRole('button', { name: 'Done' }));
    await waitFor(() => expect(shortcutsDialog.open).toBe(false));
  });

  it('pressing ? key opens the dialog', async () => {
    const user = userEvent.setup();
    renderApp({ plan, active });

    await waitFor(() => expect(screen.getByText('CORE-100')).toBeInTheDocument());

    const dialogs = document.querySelectorAll('dialog');
    const shortcutsDialog = Array.from(dialogs).find(
      (d) => d.getAttribute('aria-labelledby') === 'shortcuts-modal-title',
    ) as HTMLDialogElement;
    expect(shortcutsDialog.open).toBe(false);

    await user.keyboard('?');
    await waitFor(() => expect(shortcutsDialog.open).toBe(true));
  });
});
