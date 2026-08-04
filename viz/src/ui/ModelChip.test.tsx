import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import React from 'react';
import { ModelChip } from './ModelChip';

afterEach(() => {
  cleanup();
});

describe('ModelChip — 🧠 heavy-model glyph', () => {
  it('renders 🧠 for opus', () => {
    render(<ModelChip model="opus" />);
    expect(screen.getByText('🧠')).toBeInTheDocument();
  });

  it('renders 🧠 for fable', () => {
    render(<ModelChip model="fable" />);
    expect(screen.getByText('🧠')).toBeInTheDocument();
  });

  it('renders 🧠 for mythos', () => {
    render(<ModelChip model="mythos" />);
    expect(screen.getByText('🧠')).toBeInTheDocument();
  });

  it('renders 🧠 for the heavy category token', () => {
    render(<ModelChip model="heavy" />);
    expect(screen.getByText('🧠')).toBeInTheDocument();
  });

  it.each(['sonnet', 'grok', 'haiku', 'medium', 'light'])(
    'renders nothing for %s',
    (model) => {
      render(<ModelChip model={model} />);
      expect(screen.queryByText('🧠')).toBeNull();
    }
  );
});
