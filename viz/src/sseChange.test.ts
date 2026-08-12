import { describe, expect, it } from 'vitest';
import { formatChangePayload, projectFromChangeData } from './sseChange';

describe('formatChangePayload', () => {
  it('encodes an attributed change', () => {
    expect(formatChangePayload('alpha')).toBe('{"project":"alpha"}');
  });

  it('encodes an unattributed change as empty object', () => {
    expect(formatChangePayload(undefined)).toBe('{}');
  });
});

describe('projectFromChangeData', () => {
  it('reads the project name from an attributed payload', () => {
    expect(projectFromChangeData('{"project":"alpha"}')).toBe('alpha');
  });

  it('returns null for unattributed {}', () => {
    expect(projectFromChangeData('{}')).toBeNull();
  });

  it('returns null for missing, empty, or non-string data', () => {
    expect(projectFromChangeData(undefined)).toBeNull();
    expect(projectFromChangeData('')).toBeNull();
    expect(projectFromChangeData({ project: 'alpha' })).toBeNull();
  });

  it('returns null for malformed JSON, empty name, or non-object payloads', () => {
    expect(projectFromChangeData('{')).toBeNull();
    expect(projectFromChangeData('{"project":""}')).toBeNull();
    expect(projectFromChangeData('{"project":1}')).toBeNull();
    expect(projectFromChangeData('[]')).toBeNull();
    expect(projectFromChangeData('null')).toBeNull();
  });
});
