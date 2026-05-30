import { describe, expect, it } from 'vitest';
import { lookupNackReason } from './nack-reasons';

const DEFAULT_NACK_REASON_NAME = 'UNKNOWN';

describe('lookupNackReason', () => {
  it('returns correct info for known reason code', () => {
    const result = lookupNackReason(5);
    expect(result.code).toBe(5);
    expect(result.name).toBe('UNSUPPORTED_COMMAND_CLASS');
  });

  it('returns UNKNOWN for unknown code', () => {
    const unknown = lookupNackReason(0xff);
    expect(unknown.name).toBe(DEFAULT_NACK_REASON_NAME);
    const negative = lookupNackReason(-1);
    expect(negative.name).toBe(DEFAULT_NACK_REASON_NAME);
  });
});
