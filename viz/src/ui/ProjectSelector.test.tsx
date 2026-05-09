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
