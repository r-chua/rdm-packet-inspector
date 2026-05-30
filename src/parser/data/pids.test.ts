import { describe, expect, it } from 'vitest';
import { lookupPid } from './pids';

const DEFAULT_PID_NAME = 'UNKNOWN_PID';
const MANUFACTURER_DEFINED_NAME = 'MANUFACTURER_DEFINED';

describe('lookupPid', () => {
  it('returns correct info for known PID', () => {
    const result = lookupPid(0x0060);
    expect(result.pid).toBe(0x0060);
    expect(result.name).toBe('DEVICE_INFO');
  });

  it('returns UNKNOWN_PID for unknown PID', () => {
    const unknown = lookupPid(0);
    expect(unknown.name).toBe(DEFAULT_PID_NAME);
    const negative = lookupPid(-1);
    expect(negative.name).toBe(DEFAULT_PID_NAME);
    const random = lookupPid(0x1234);
    expect(random.name).toBe(DEFAULT_PID_NAME);
  });

  it('identifies manufacturer-defined PIDs', () => {
    const lowerBound = lookupPid(0x8000);
    expect(lowerBound.name).toBe(MANUFACTURER_DEFINED_NAME);
    const underLowerBound = lookupPid(0x7fff);
    expect(underLowerBound.name).toBe(DEFAULT_PID_NAME);
    const upperBound = lookupPid(0xffdf);
    expect(upperBound.name).toBe(MANUFACTURER_DEFINED_NAME);
    const overUpperBound = lookupPid(0xffe0);
    expect(overUpperBound.name).toBe(DEFAULT_PID_NAME);
  });
});
