import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import React from 'react';
import { ErrorBoundary } from './ErrorBoundary';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const Boom: React.FC = () => {
  throw new Error('render exploded');
};

const renderWithSuppressedBoundaryNoise = (ui: React.ReactElement) => {
  const swallowExpectedJsdomError = (event: ErrorEvent) => {
    if (event.error instanceof Error && event.error.message === 'render exploded') {
      event.preventDefault();
    }
  };

  window.addEventListener('error', swallowExpectedJsdomError);
  try {
    render(ui);
  } finally {
    window.removeEventListener('error', swallowExpectedJsdomError);
  }
};

describe('ErrorBoundary', () => {
  beforeEach(() => {
    // React logs caught errors to console.error; silence it for clean output.
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('renders children when they do not throw', () => {
    render(
      <ErrorBoundary>
        <span>healthy detail</span>
      </ErrorBoundary>,
    );
    expect(screen.getByText('healthy detail')).toBeInTheDocument();
  });

  it('renders the default fallback when a child throws', () => {
    renderWithSuppressedBoundaryNoise(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>,
    );
    expect(screen.getByText(/Could not render this tasknote/)).toBeInTheDocument();
  });

  it('renders a custom fallback when provided', () => {
    renderWithSuppressedBoundaryNoise(
      <ErrorBoundary fallback={<span>custom fallback</span>}>
        <Boom />
      </ErrorBoundary>,
    );
    expect(screen.getByText('custom fallback')).toBeInTheDocument();
  });
});
