import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import React from 'react';
import { WikilinkMarkdown } from './WikilinkMarkdown';

afterEach(() => {
  cleanup();
});

const noop = () => {};

describe('WikilinkMarkdown — non-wikilink anchor allowlist', () => {
  it('renders http:// links as anchors', () => {
    render(<WikilinkMarkdown markdown="[link](http://example.com)" navigateToTask={noop} />);
    expect(screen.getByRole('link', { name: 'link' })).toHaveAttribute(
      'href',
      'http://example.com',
    );
  });

  it('renders https:// links as anchors', () => {
    render(<WikilinkMarkdown markdown="[link](https://example.com)" navigateToTask={noop} />);
    expect(screen.getByRole('link', { name: 'link' })).toHaveAttribute(
      'href',
      'https://example.com',
    );
  });

  it('suppresses data: links', () => {
    render(
      <WikilinkMarkdown
        markdown="[x](data:text/html,<h1>hi</h1>)"
        navigateToTask={noop}
      />,
    );
    expect(screen.queryByRole('link')).toBeNull();
  });

  it('suppresses blob: links', () => {
    render(<WikilinkMarkdown markdown="[x](blob:http://example.com/abc)" navigateToTask={noop} />);
    expect(screen.queryByRole('link')).toBeNull();
  });

  it('suppresses javascript: links', () => {
    render(
      <WikilinkMarkdown markdown="[x](javascript:alert(1))" navigateToTask={noop} />,
    );
    expect(screen.queryByRole('link')).toBeNull();
  });

  it('wikilinks still render as buttons', () => {
    render(<WikilinkMarkdown markdown="[[CORE-001]]" navigateToTask={noop} />);
    expect(screen.getByRole('button', { name: /\[\[CORE-001\]\]/ })).toBeInTheDocument();
  });

  it('wikilink button calls navigateToTask on click', async () => {
    const navigate = vi.fn();
    const { container } = render(
      <WikilinkMarkdown markdown="[[CORE-002]]" navigateToTask={navigate} />,
    );
    const btn = container.querySelector('button')!;
    btn.click();
    expect(navigate).toHaveBeenCalledWith('CORE-002');
  });
});
