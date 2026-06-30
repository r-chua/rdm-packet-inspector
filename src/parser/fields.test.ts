import { describe, expect, it } from 'vitest';
import { getFieldEntries } from './fields';
import type { RdmPacket } from './types';
import { parseRdmPacket } from './parse';
import * as examples from './examples';

function parseOrThrow(hexString: string): RdmPacket {
  const result = parseRdmPacket(hexString);
  if (!result.success) {
    throw new Error('Failed to parse RDM packet');
  }
  return result.packet;
}

const commandPacket = parseOrThrow(examples.GET_DEVICE_INFO);
const responsePacket = parseOrThrow(examples.GET_DEVICE_INFO_RESPONSE);

describe('getFieldEntries', () => {
  it('includes portId for command packets', () => {
    const entries = getFieldEntries(commandPacket);
    const portIdEntry = entries.find((entry) => entry.name === 'Port ID');
    expect(portIdEntry).toBeDefined();
    expect(portIdEntry?.displayValue).toBe('1');
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
      expect(entries[i].startByte).toBeGreaterThanOrEqual(
        entries[i - 1].startByte
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

  it('includes field warnings', () => {
    const entries = getFieldEntries(
      parseOrThrow(examples.GET_DEVICE_INFO_WITH_MESSAGE_COUNT)
    );
    const messageCountEntry = entries.find(
      (entry) => entry.name === 'Message Count'
    );
    expect(messageCountEntry).toBeDefined();
    expect(messageCountEntry?.warning).toBeDefined();
  });

  it('omits warnings for valid fields', () => {
    const entries = getFieldEntries(commandPacket);
    const messageCountEntry = entries.find(
      (entry) => entry.name === 'Message Count'
    );
    expect(messageCountEntry).toBeDefined();
    expect(messageCountEntry?.warning).not.toBeDefined();
  });
});
