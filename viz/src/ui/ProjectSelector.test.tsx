import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { ProjectSelector } from './ProjectSelector';

afterEach(() => {
  cleanup();
});

describe('ProjectSelector', () => {
  it('renders a chip per project and marks the active one pressed', () => {
    render(
      React.createElement(ProjectSelector, {
        projects: ['alpha', 'beta', 'gamma'],
        active: 'beta',
        onSelect: () => {},
      }),
    );

    expect(screen.getByRole('button', { name: 'Project: alpha', pressed: false })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Project: beta', pressed: true })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Project: gamma', pressed: false })).toBeTruthy();
  });

  it('calls onSelect with the clicked project name', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      React.createElement(ProjectSelector, {
        projects: ['alpha', 'beta'],
        active: 'alpha',
        onSelect,
      }),
    );

    await user.click(screen.getByRole('button', { name: 'Project: beta' }));

    expect(onSelect).toHaveBeenCalledWith('beta');
  });

  it('renders a green dot for a project at the latest release and a red dot for one behind', () => {
    render(
      React.createElement(ProjectSelector, {
        projects: ['fresh', 'stale'],
        active: 'fresh',
        onSelect: () => {},
        versions: { fresh: 'v5.6.0', stale: 'v5.4.0' },
        latestRelease: 'v5.6.0',
      }),
    );

    const fresh = screen.getByRole('button', {
      name: 'Project: fresh (flowtron up to date, v5.6.0)',
    });
    expect(fresh.querySelector('[data-currency="current"]')).toBeTruthy();
    expect(fresh.querySelector('[data-currency="behind"]')).toBeNull();

    const stale = screen.getByRole('button', {
      name: 'Project: stale (flowtron outdated: v5.4.0, latest v5.6.0)',
    });
    expect(stale.querySelector('[data-currency="behind"]')).toBeTruthy();
    expect(stale.querySelector('[data-currency="current"]')).toBeNull();
  });

  it('renders no dot when the version or latest release is unknown', () => {
    render(
      React.createElement(ProjectSelector, {
        projects: ['mystery', 'pinned'],
        active: 'mystery',
        onSelect: () => {},
        versions: { mystery: null, pinned: 'v5.6.0' },
        latestRelease: null,
      }),
    );

    for (const name of ['mystery', 'pinned']) {
      const chip = screen.getByRole('button', { name: `Project: ${name}` });
      expect(chip.querySelector('[data-currency]')).toBeNull();
    }
  });

  it('renders nothing when the project list is empty', () => {
    const { container } = render(
      React.createElement(ProjectSelector, {
        projects: [],
        active: null,
        onSelect: () => {},
      }),
    );
    expect(container.firstChild).toBeNull();
  });
});
