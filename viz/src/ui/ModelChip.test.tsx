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

  it('renders nothing for other tokens', () => {
    render(<ModelChip model="sonnet" />);
    expect(screen.queryByText('🧠')).toBeNull();
  });
});
