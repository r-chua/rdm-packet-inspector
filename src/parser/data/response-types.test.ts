import { describe, expect, it } from 'vitest';
import { lookupResponseType } from './response-types';

const DEFAULT_RESPONSE_TYPE_NAME = 'UNKNOWN_RESPONSE_TYPE';

describe('lookupResponseType', () => {
  it('returns correct info for known response type code', () => {
    const result = lookupResponseType(0x01);
    expect(result.code).toBe(0x01);
    expect(result.name).toBe('RESPONSE_TYPE_ACK_TIMER');
  });

  it('returns UNKNOWN_RESPONSE_TYPE for unknown code', () => {
    const unknown = lookupResponseType(0xff);
    expect(unknown.name).toBe(DEFAULT_RESPONSE_TYPE_NAME);
    const negative = lookupResponseType(-1);
    expect(negative.name).toBe(DEFAULT_RESPONSE_TYPE_NAME);
  });
});
