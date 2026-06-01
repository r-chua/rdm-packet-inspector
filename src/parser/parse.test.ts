import { describe, expect, it } from 'vitest';
import { parseRdmPacket } from './parse';
import type {
  ParseResult,
  RdmPacket,
  RdmCommandPacket,
  RdmResponsePacket,
} from './types';

/** Example RDM packet for getting device info */
const GET_DEVICE_INFO =
  'cc 01 18 01 04 98 76 54 32 01 04 12 34 56 78 25 01 00 00 00 20 00 60 ' +
  '00 04 3d';

/** Example RDM response packet for getting device info */
const GET_DEVICE_INFO_RESPONSE =
  'cc 01 2b 01 04 98 76 54 32 01 04 12 34 56 78 25 00 00 00 00 21 00 60 ' +
  '13 01 00 00 2d 00 04 00 2d 00 01 00 08 00 02 00 01 00 00 01 04 cf';

const expectSuccess = (result: ParseResult): RdmPacket => {
  expect(result.success).toBe(true);
  if (!result.success) {
    throw new Error(
      'Expected successful parse but got error: ' + result.error.message
    );
  }
  return result.packet;
};

const expectCommand = (packet: RdmPacket): RdmCommandPacket => {
  expect(packet.direction).toBe('command');
  if (packet.direction !== 'command') {
    throw new Error(`Expected command packet but got response packet`);
  }
  return packet;
};

const expectResponse = (packet: RdmPacket): RdmResponsePacket => {
  expect(packet.direction).toBe('response');
  if (packet.direction !== 'response') {
    throw new Error(`Expected response packet but got command packet`);
  }
  return packet;
};

describe('parseRdmPacket', () => {
  describe('header fields', () => {
    it('parses the start code', () => {
      const result = parseRdmPacket(GET_DEVICE_INFO);
      const packet = expectSuccess(result);
      expect(packet.startCode.value).toBe(0xcc);
      expect(packet.startCode.startByte).toBe(0);
      expect(packet.startCode.endByte).toBe(0);
      expect(packet.startCode.rawBytes).toEqual(new Uint8Array([0xcc]));
    });

    it('parses the sub start code', () => {
      const result = parseRdmPacket(GET_DEVICE_INFO);
      const packet = expectSuccess(result);
      expect(packet.subStartCode.value).toBe(0x01);
      expect(packet.subStartCode.startByte).toBe(1);
      expect(packet.subStartCode.endByte).toBe(1);
      expect(packet.subStartCode.rawBytes).toEqual(new Uint8Array([0x01]));
    });

    it('parses the message length', () => {
      const result = parseRdmPacket(GET_DEVICE_INFO);
      const packet = expectSuccess(result);
      expect(packet.messageLength.value).toBe(0x18);
      expect(packet.messageLength.startByte).toBe(2);
      expect(packet.messageLength.endByte).toBe(2);
      expect(packet.messageLength.rawBytes).toEqual(new Uint8Array([0x18]));
    });

    it('parses the destination UID', () => {
      const result = parseRdmPacket(GET_DEVICE_INFO);
      const packet = expectSuccess(result);
      expect(packet.destinationUid.value).toBe('0104:98765432');
      expect(packet.destinationUid.startByte).toBe(3);
      expect(packet.destinationUid.endByte).toBe(8);
      expect(packet.destinationUid.rawBytes).toEqual(
        new Uint8Array([0x01, 0x04, 0x98, 0x76, 0x54, 0x32])
      );
    });

    it('parses the source UID', () => {
      const result = parseRdmPacket(GET_DEVICE_INFO);
      const packet = expectSuccess(result);
      expect(packet.sourceUid.value).toBe('0104:12345678');
      expect(packet.sourceUid.startByte).toBe(9);
      expect(packet.sourceUid.endByte).toBe(14);
      expect(packet.sourceUid.rawBytes).toEqual(
        new Uint8Array([0x01, 0x04, 0x12, 0x34, 0x56, 0x78])
      );
    });

    it('parses the transaction number', () => {
      const result = parseRdmPacket(GET_DEVICE_INFO);
      const packet = expectSuccess(result);
      expect(packet.transactionNumber.value).toBe(0x25);
      expect(packet.transactionNumber.startByte).toBe(15);
      expect(packet.transactionNumber.endByte).toBe(15);
      expect(packet.transactionNumber.rawBytes).toEqual(new Uint8Array([0x25]));
    });

    it('parses the port ID', () => {
      const result = parseRdmPacket(GET_DEVICE_INFO);
      const packet = expectSuccess(result);
      const request = expectCommand(packet);
      expect(request.portId.value).toBe(0x01);
      expect(request.portId.startByte).toBe(16);
      expect(request.portId.endByte).toBe(16);
      expect(request.portId.rawBytes).toEqual(new Uint8Array([0x01]));
    });

    it('parses the response type', () => {
      const result = parseRdmPacket(GET_DEVICE_INFO_RESPONSE);
      const packet = expectSuccess(result);
      const response = expectResponse(packet);
      expect(response.responseType.value.code).toBe(0x00);
      expect(response.responseType.value.name).toBe('RESPONSE_TYPE_ACK');
      expect(response.responseType.startByte).toBe(16);
      expect(response.responseType.endByte).toBe(16);
      expect(response.responseType.rawBytes).toEqual(new Uint8Array([0x00]));
    });

    it('parses the message count', () => {
      const result = parseRdmPacket(GET_DEVICE_INFO);
      const packet = expectSuccess(result);
      expect(packet.messageCount.value).toBe(0x00);
      expect(packet.messageCount.startByte).toBe(17);
      expect(packet.messageCount.endByte).toBe(17);
      expect(packet.messageCount.rawBytes).toEqual(new Uint8Array([0x00]));
    });

    it('parses the sub device', () => {
      const result = parseRdmPacket(GET_DEVICE_INFO);
      const packet = expectSuccess(result);
      expect(packet.subDevice.value).toBe(0x0000);
      expect(packet.subDevice.startByte).toBe(18);
      expect(packet.subDevice.endByte).toBe(19);
      expect(packet.subDevice.rawBytes).toEqual(new Uint8Array([0x00, 0x00]));
    });

    it('parses the command class', () => {
      const result = parseRdmPacket(GET_DEVICE_INFO);
      const packet = expectSuccess(result);
      expect(packet.commandClass.value.code).toBe(0x20);
      expect(packet.commandClass.value.name).toBe('GET_COMMAND');
      expect(packet.commandClass.startByte).toBe(20);
      expect(packet.commandClass.endByte).toBe(20);
      expect(packet.commandClass.rawBytes).toEqual(new Uint8Array([0x20]));
    });

    it('parses the PID', () => {
      const result = parseRdmPacket(GET_DEVICE_INFO);
      const packet = expectSuccess(result);
      expect(packet.parameterId.value.pid).toBe(0x0060);
      expect(packet.parameterId.value.name).toBe('DEVICE_INFO');
      expect(packet.parameterId.startByte).toBe(21);
      expect(packet.parameterId.endByte).toBe(22);
      expect(packet.parameterId.rawBytes).toEqual(new Uint8Array([0x00, 0x60]));
    });

    it('parses the parameter data length', () => {
      const result = parseRdmPacket(GET_DEVICE_INFO);
      const packet = expectSuccess(result);
      expect(packet.parameterDataLength.value).toBe(0x00);
      expect(packet.parameterDataLength.startByte).toBe(23);
      expect(packet.parameterDataLength.endByte).toBe(23);
      expect(packet.parameterDataLength.rawBytes).toEqual(
        new Uint8Array([0x00])
      );
    });
  });
});
