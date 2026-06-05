import { describe, expect, it } from 'vitest';
import { getFieldEntries } from './fields';
import type { RdmPacket } from './types';
import { parseRdmPacket } from './parse';

// Example RDM packet for getting device info
const GET_DEVICE_INFO =
  'cc 01 18 01 04 98 76 54 32 01 04 12 34 56 78 25 ' +
  '01 00 00 00 20 00 60 00 04 3d';

// Example RDM response packet for getting device info
const GET_DEVICE_INFO_RESPONSE =
  'cc 01 2b 01 04 12 34 56 78 01 04 98 76 54 32 25 ' +
  '00 00 00 00 21 00 60 13 01 00 00 2d 00 04 00 2d ' +
  '00 01 00 08 00 02 00 01 00 00 01 04 cf';

function parseOrThrow(hexString: string): RdmPacket {
  const result = parseRdmPacket(hexString);
  if (!result.success) {
    throw new Error('Failed to parse RDM packet');
  }
  return result.packet;
}

const commandPacket = parseOrThrow(GET_DEVICE_INFO);
const responsePacket = parseOrThrow(GET_DEVICE_INFO_RESPONSE);

describe('getFieldEntries', () => {
  it('includes portId for command packets', () => {
    const entries = getFieldEntries(commandPacket);
    const portIdEntry = entries.find((entry) => entry.name === 'Port ID');
    expect(portIdEntry).toBeDefined();
    expect(portIdEntry?.field.value).toBe(1);
  });

  it('includes responseType for response packets', () => {
    const entries = getFieldEntries(responsePacket);
    const responseTypeEntry = entries.find(
      (entry) => entry.name === 'Response Type'
    );
    expect(responseTypeEntry).toBeDefined();
  });

  it('returns fields in the correct order', () => {
    const entries = getFieldEntries(responsePacket);
    for (let i = 1; i < entries.length; i++) {
      expect(entries[i].field.startByte).toBeGreaterThanOrEqual(
        entries[i - 1].field.startByte
      );
    }
  });

  it('handles packets with missing parameterData', () => {
    const entries = getFieldEntries(commandPacket);
    const parameterDataEntry = entries.find(
      (entry) => entry.name === 'Parameter Data'
    );
    expect(parameterDataEntry).not.toBeDefined();
  });
});
