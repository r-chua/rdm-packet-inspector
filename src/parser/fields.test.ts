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

  describe('subfields', () => {
    it('adds estimated wait time for ACK_TIMER responses', () => {
      const packet = parseOrThrow(examples.GET_DEVICE_INFO_ACK_TIMER_RESPONSE);
      const entries = getFieldEntries(packet);
      const pdEntry = entries.find((entry) => entry.name === 'Parameter Data');
      expect(pdEntry).toBeDefined();
      expect(pdEntry?.subFields).toBeDefined();
      const subFields = pdEntry?.subFields || [];
      const estimatedWaitEntry = subFields.find(
        (entry) => entry.name === 'Estimated Wait Time'
      );
      expect(estimatedWaitEntry).toBeDefined();
      expect(estimatedWaitEntry?.startByte).toBe(24);
      expect(estimatedWaitEntry?.endByte).toBe(25);
      expect(estimatedWaitEntry?.displayValue).toBe('5000 ms');
    });

    it('adds reason for NACK responses', () => {
      const packet = parseOrThrow(examples.NACK_REASON_HARDWARE_FAULT_RESPONSE);
      const entries = getFieldEntries(packet);
      const pdEntry = entries.find((entry) => entry.name === 'Parameter Data');
      expect(pdEntry).toBeDefined();
      expect(pdEntry?.subFields).toBeDefined();
      const subFields = pdEntry?.subFields || [];
      const reasonEntry = subFields.find(
        (entry) => entry.name === 'NACK Reason'
      );
      expect(reasonEntry).toBeDefined();
      expect(reasonEntry?.startByte).toBe(24);
      expect(reasonEntry?.endByte).toBe(25);
      expect(reasonEntry?.displayValue).toBe('Hardware Fault');
      expect(reasonEntry?.warning).not.toBeDefined();
    });

    it('handles unknown NACK reason codes', () => {
      const packet = parseOrThrow(examples.INVALID_NACK_REASON_RESPONSE);
      const entries = getFieldEntries(packet);
      const pdEntry = entries.find((entry) => entry.name === 'Parameter Data');
      expect(pdEntry).toBeDefined();
      expect(pdEntry?.subFields).toBeDefined();
      const subFields = pdEntry?.subFields || [];
      const reasonEntry = subFields.find(
        (entry) => entry.name === 'NACK Reason'
      );
      expect(reasonEntry).toBeDefined();
      expect(reasonEntry?.startByte).toBe(24);
      expect(reasonEntry?.endByte).toBe(25);
      expect(reasonEntry?.displayValue).toBe('Unknown (0xFF)');
      expect(reasonEntry?.warning).toBeDefined();
    });

    it('handles unknown response types', () => {
      const packet = parseOrThrow(examples.INVALID_RESPONSE_TYPE_RESPONSE);
      const entries = getFieldEntries(packet);
      const responseTypeEntry = entries.find(
        (entry) => entry.name === 'Response Type'
      );
      expect(responseTypeEntry).toBeDefined();
      expect(responseTypeEntry?.displayValue).toBe('Unknown (0xFF)');
      expect(responseTypeEntry?.warning).toBeDefined();
    });
  });
});
