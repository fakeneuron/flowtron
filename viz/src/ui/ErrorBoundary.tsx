import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

const DEFAULT_FALLBACK = (
  <div className="px-3 py-2 text-sm text-slate-500 dark:text-slate-400">
    ⚠ Could not render this tasknote&rsquo;s detail.
  </div>
);

// Contains a render error to its subtree so one malformed tasknote degrades a
// single row's detail panel instead of blanking the whole board. React error
// boundaries must be class components.
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error): void {
    // Surface for debugging; the boundary keeps the rest of the board alive.
    console.error('Tasknote render failed:', error);
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return this.props.fallback ?? DEFAULT_FALLBACK;
    }
    return this.props.children;
  }
}
