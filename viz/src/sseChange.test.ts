import { describe, expect, it } from 'vitest';
import { formatChangePayload, parseChangeData } from './sseChange';

describe('formatChangePayload', () => {
  it('encodes an attributed change', () => {
    expect(formatChangePayload('alpha')).toBe('{"project":"alpha"}');
  });

  it('encodes an unattributed change as empty object', () => {
    expect(formatChangePayload(undefined)).toBe('{}');
  });

  it('encodes the scopes that fired', () => {
    expect(formatChangePayload('alpha', ['active'])).toBe('{"project":"alpha","scopes":["active"]}');
    expect(formatChangePayload('alpha', new Set(['plan', 'archive'] as const))).toBe(
      '{"project":"alpha","scopes":["plan","archive"]}',
    );
  });

  it('omits an empty scope set rather than encoding []', () => {
    // `scopes: []` would decode as "nothing to refetch"; the unscoped shape
    // decodes as "refetch everything", which is the fail-open default.
    expect(formatChangePayload('alpha', [])).toBe('{"project":"alpha"}');
  });

  it('ignores scopes on an unattributed change', () => {
    expect(formatChangePayload(undefined, ['plan'])).toBe('{}');
  });
});

describe('parseChangeData', () => {
  it('reads the project name from an attributed payload', () => {
    expect(parseChangeData('{"project":"alpha"}')).toEqual({ project: 'alpha', scopes: null });
  });

  it('reads the scopes alongside the project', () => {
    expect(parseChangeData('{"project":"alpha","scopes":["plan","active"]}')).toEqual({
      project: 'alpha',
      scopes: ['plan', 'active'],
    });
  });

  it('returns null project for unattributed {}', () => {
    expect(parseChangeData('{}')).toEqual({ project: null, scopes: null });
  });

  it('returns null project for missing, empty, or non-string data', () => {
    expect(parseChangeData(undefined).project).toBeNull();
    expect(parseChangeData('').project).toBeNull();
    expect(parseChangeData({ project: 'alpha' }).project).toBeNull();
  });

  it('returns null project for malformed JSON, empty name, or non-object payloads', () => {
    expect(parseChangeData('{').project).toBeNull();
    expect(parseChangeData('{"project":""}').project).toBeNull();
    expect(parseChangeData('{"project":1}').project).toBeNull();
    expect(parseChangeData('[]').project).toBeNull();
    expect(parseChangeData('null').project).toBeNull();
  });

  it('drops scopes when the project is unattributed', () => {
    // Without a project the client cannot filter by project either, so the
    // whole payload fails open — carrying the scopes through would let it skip
    // endpoints on a change it cannot attribute.
    expect(parseChangeData('{"scopes":["active"]}')).toEqual({ project: null, scopes: null });
  });

  it('fails open on a scope value it does not recognize', () => {
    // A newer server naming a scope this client has never heard of must not
    // silently stop the board refreshing — null means "refetch everything".
    expect(parseChangeData('{"project":"alpha","scopes":["sidequest"]}')).toEqual({
      project: 'alpha',
      scopes: null,
    });
  });

  it('keeps the known scopes from a mixed list', () => {
    expect(parseChangeData('{"project":"alpha","scopes":["active","sidequest"]}')).toEqual({
      project: 'alpha',
      scopes: ['active'],
    });
  });

  it('fails open on absent, empty, or non-array scopes', () => {
    expect(parseChangeData('{"project":"alpha","scopes":[]}').scopes).toBeNull();
    expect(parseChangeData('{"project":"alpha","scopes":"active"}').scopes).toBeNull();
    expect(parseChangeData('{"project":"alpha","scopes":null}').scopes).toBeNull();
  });
});
