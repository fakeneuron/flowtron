import { describe, expect, it } from 'vitest';
import { vscodeFileHref } from './TaskDetail';

describe('vscodeFileHref', () => {
  it('builds a vscode://file link for an absolute path', () => {
    expect(vscodeFileHref('/Users/x/.flowtron/tasknote/FE-064.md')).toBe(
      'vscode://file/Users/x/.flowtron/tasknote/FE-064.md',
    );
  });

  it('encodes spaces and special characters', () => {
    expect(vscodeFileHref('/Users/x/my notes/FE 1.md')).toBe(
      'vscode://file/Users/x/my%20notes/FE%201.md',
    );
  });

  it('returns null for a non-absolute path', () => {
    expect(vscodeFileHref('relative/path.md')).toBeNull();
    expect(vscodeFileHref('')).toBeNull();
  });
});
