import { describe, expect, it } from 'vitest';
import { lookupCommandClass } from './command-classes';

const DEFAULT_COMMAND_NAME = 'UNKNOWN_COMMAND_CLASS';

describe('lookupCommandClass', () => {
  it('returns correct info for known command class', () => {
    const result = lookupCommandClass(0x20);
    expect(result.code).toBe(0x20);
    expect(result.name).toBe('GET_COMMAND');
  });

  it('returns UNKNOWN_COMMAND_CLASS for unknown code', () => {
    const unknown = lookupCommandClass(0xff);
    expect(unknown.name).toBe(DEFAULT_COMMAND_NAME);
    const negative = lookupCommandClass(-1);
    expect(negative.name).toBe(DEFAULT_COMMAND_NAME);
  });

  it('handles edge case of 0x00', () => {
    const result = lookupCommandClass(0x00);
    expect(result.name).toBe(DEFAULT_COMMAND_NAME);
  });
});
