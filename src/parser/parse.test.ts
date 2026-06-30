import { describe, expect, it } from 'vitest';
import { parseRdmPacket } from './parse';
import type {
  ParseResult,
  RdmPacket,
  RdmCommandPacket,
  RdmResponsePacket,
  RdmField,
  ParseError,
} from './types';
import * as examples from './examples';

const expectSuccess = (result: ParseResult): RdmPacket => {
  expect(result.success).toBe(true);
  if (!result.success) {
    throw new Error(
      'Expected successful parse but got error: ' + result.error.message
    );
  }
  return result.packet;
};

const expectParseError = (result: ParseResult): ParseError => {
  expect(result.success).toBe(false);
  if (result.success) {
    throw new Error('Expected parse error but got successful parse');
  }
  return result.error;
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

const expectBodyData = (packet: RdmPacket): RdmField<Uint8Array> => {
  expect(packet.parameterData).not.toBeNull();
  if (packet.parameterData === null) {
    throw new Error(`Expected parameter data but got null`);
  }
  return packet.parameterData;
};

describe('parseRdmPacket', () => {
  describe('header fields', () => {
    it('parses the start code', () => {
      const result = parseRdmPacket(examples.GET_DEVICE_INFO);
      const packet = expectSuccess(result);
      expect(packet.startCode.value).toBe(0xcc);
      expect(packet.startCode.startByte).toBe(0);
      expect(packet.startCode.endByte).toBe(0);
      expect(packet.startCode.rawBytes).toEqual(new Uint8Array([0xcc]));
    });

    it('parses the sub start code', () => {
      const result = parseRdmPacket(examples.GET_DEVICE_INFO);
      const packet = expectSuccess(result);
      expect(packet.subStartCode.value).toBe(0x01);
      expect(packet.subStartCode.startByte).toBe(1);
      expect(packet.subStartCode.endByte).toBe(1);
      expect(packet.subStartCode.rawBytes).toEqual(new Uint8Array([0x01]));
    });

    it('parses the message length', () => {
      const result = parseRdmPacket(examples.GET_DEVICE_INFO);
      const packet = expectSuccess(result);
      expect(packet.messageLength.value).toBe(0x18);
      expect(packet.messageLength.startByte).toBe(2);
      expect(packet.messageLength.endByte).toBe(2);
      expect(packet.messageLength.rawBytes).toEqual(new Uint8Array([0x18]));
    });

    it('parses the destination UID', () => {
      const result = parseRdmPacket(examples.GET_DEVICE_INFO);
      const packet = expectSuccess(result);
      expect(packet.destinationUid.value).toBe('0104:98765432');
      expect(packet.destinationUid.startByte).toBe(3);
      expect(packet.destinationUid.endByte).toBe(8);
      expect(packet.destinationUid.rawBytes).toEqual(
        new Uint8Array([0x01, 0x04, 0x98, 0x76, 0x54, 0x32])
      );
    });

    it('parses the source UID', () => {
      const result = parseRdmPacket(examples.GET_DEVICE_INFO);
      const packet = expectSuccess(result);
      expect(packet.sourceUid.value).toBe('0104:12345678');
      expect(packet.sourceUid.startByte).toBe(9);
      expect(packet.sourceUid.endByte).toBe(14);
      expect(packet.sourceUid.rawBytes).toEqual(
        new Uint8Array([0x01, 0x04, 0x12, 0x34, 0x56, 0x78])
      );
    });

    it('parses the transaction number', () => {
      const result = parseRdmPacket(examples.GET_DEVICE_INFO);
      const packet = expectSuccess(result);
      expect(packet.transactionNumber.value).toBe(0x25);
      expect(packet.transactionNumber.startByte).toBe(15);
      expect(packet.transactionNumber.endByte).toBe(15);
      expect(packet.transactionNumber.rawBytes).toEqual(new Uint8Array([0x25]));
    });

    it('parses the port ID', () => {
      const result = parseRdmPacket(examples.GET_DEVICE_INFO);
      const packet = expectSuccess(result);
      const request = expectCommand(packet);
      expect(request.portId.value).toBe(0x01);
      expect(request.portId.startByte).toBe(16);
      expect(request.portId.endByte).toBe(16);
      expect(request.portId.rawBytes).toEqual(new Uint8Array([0x01]));
    });

    it('parses the response type', () => {
      const result = parseRdmPacket(examples.GET_DEVICE_INFO_RESPONSE);
      const packet = expectSuccess(result);
      const response = expectResponse(packet);
      expect(response.responseType.value.code).toBe(0x00);
      expect(response.responseType.value.name).toBe('RESPONSE_TYPE_ACK');
      expect(response.responseType.startByte).toBe(16);
      expect(response.responseType.endByte).toBe(16);
      expect(response.responseType.rawBytes).toEqual(new Uint8Array([0x00]));
    });

    it('parses the message count', () => {
      const result = parseRdmPacket(examples.GET_DEVICE_INFO);
      const packet = expectSuccess(result);
      expect(packet.messageCount.value).toBe(0x00);
      expect(packet.messageCount.startByte).toBe(17);
      expect(packet.messageCount.endByte).toBe(17);
      expect(packet.messageCount.rawBytes).toEqual(new Uint8Array([0x00]));
    });

    it('parses the sub device', () => {
      const result = parseRdmPacket(examples.GET_DEVICE_INFO);
      const packet = expectSuccess(result);
      expect(packet.subDevice.value).toBe(0x0000);
      expect(packet.subDevice.startByte).toBe(18);
      expect(packet.subDevice.endByte).toBe(19);
      expect(packet.subDevice.rawBytes).toEqual(new Uint8Array([0x00, 0x00]));
    });

    it('parses the command class', () => {
      const result = parseRdmPacket(examples.GET_DEVICE_INFO);
      const packet = expectSuccess(result);
      expect(packet.commandClass.value.code).toBe(0x20);
      expect(packet.commandClass.value.name).toBe('GET_COMMAND');
      expect(packet.commandClass.startByte).toBe(20);
      expect(packet.commandClass.endByte).toBe(20);
      expect(packet.commandClass.rawBytes).toEqual(new Uint8Array([0x20]));
    });

    it('parses the PID', () => {
      const result = parseRdmPacket(examples.GET_DEVICE_INFO);
      const packet = expectSuccess(result);
      expect(packet.parameterId.value.pid).toBe(0x0060);
      expect(packet.parameterId.value.name).toBe('DEVICE_INFO');
      expect(packet.parameterId.startByte).toBe(21);
      expect(packet.parameterId.endByte).toBe(22);
      expect(packet.parameterId.rawBytes).toEqual(new Uint8Array([0x00, 0x60]));
    });

    it('parses the parameter data length', () => {
      const result = parseRdmPacket(examples.GET_DEVICE_INFO);
      const packet = expectSuccess(result);
      expect(packet.parameterDataLength.value).toBe(0x00);
      expect(packet.parameterDataLength.startByte).toBe(23);
      expect(packet.parameterDataLength.endByte).toBe(23);
      expect(packet.parameterDataLength.rawBytes).toEqual(
        new Uint8Array([0x00])
      );
    });
  });

  describe('body fields', () => {
    it('parses the parameter data', () => {
      const responseResult = parseRdmPacket(examples.GET_DEVICE_INFO_RESPONSE);
      const responsePacket = expectSuccess(responseResult);
      const parameterData = expectBodyData(responsePacket);
      expect(parameterData.value).toEqual(
        new Uint8Array([
          0x01, 0x00, 0x00, 0x2d, 0x00, 0x04, 0x00, 0x2d, 0x00, 0x01, 0x00,
          0x08, 0x00, 0x02, 0x00, 0x01, 0x00, 0x00, 0x01,
        ])
      );
      expect(parameterData.startByte).toBe(24);
      expect(parameterData.endByte).toBe(42);
      expect(parameterData.rawBytes).toEqual(
        new Uint8Array([
          0x01, 0x00, 0x00, 0x2d, 0x00, 0x04, 0x00, 0x2d, 0x00, 0x01, 0x00,
          0x08, 0x00, 0x02, 0x00, 0x01, 0x00, 0x00, 0x01,
        ])
      );
    });

    it('parses an empty parameter data field', () => {
      const result = parseRdmPacket(examples.GET_DEVICE_INFO);
      const packet = expectSuccess(result);
      expect(packet.parameterData).toBeNull();
    });

    it('matches the data length to the parameter data length', () => {
      const result = parseRdmPacket(examples.GET_DEVICE_INFO_RESPONSE);
      const packet = expectSuccess(result);
      const parameterData = expectBodyData(packet);
      expect(parameterData.value.length).toBe(packet.parameterDataLength.value);

      const setResult = parseRdmPacket(examples.SET_START_ADDRESS);
      const setPacket = expectSuccess(setResult);
      const setParameterData = expectBodyData(setPacket);
      expect(setParameterData.value.length).toBe(
        setPacket.parameterDataLength.value
      );
    });

    it('parses the checksum', () => {
      const commandResult = parseRdmPacket(examples.GET_DEVICE_INFO);
      const commandPacket = expectSuccess(commandResult);
      expect(commandPacket.checksum.value).toBe(0x043d);
      expect(commandPacket.checksum.startByte).toBe(24);
      expect(commandPacket.checksum.endByte).toBe(25);
      expect(commandPacket.checksum.rawBytes).toEqual(
        new Uint8Array([0x04, 0x3d])
      );

      const responseResult = parseRdmPacket(examples.GET_DEVICE_INFO_RESPONSE);
      const responsePacket = expectSuccess(responseResult);
      expect(responsePacket.checksum.value).toBe(0x04cf);
      expect(responsePacket.checksum.startByte).toBe(43);
      expect(responsePacket.checksum.endByte).toBe(44);
      expect(responsePacket.checksum.rawBytes).toEqual(
        new Uint8Array([0x04, 0xcf])
      );
    });

    it('calculates the expected checksum', () => {
      const result = parseRdmPacket(examples.GET_DEVICE_INFO);
      const packet = expectSuccess(result);
      expect(packet.expectedChecksum).toBe(0x043d);
    });

    it('validates the checksum', () => {
      const result = parseRdmPacket(examples.GET_DEVICE_INFO);
      const packet = expectSuccess(result);
      expect(packet.validChecksum).toBe(true);

      const invalidResult = parseRdmPacket(
        examples.INVALID_CHECKSUM_START_ADDRESS
      );
      const invalidPacket = expectSuccess(invalidResult);
      expect(invalidPacket.validChecksum).toBe(false);
    });
  });

  describe('response details', () => {
    it('parses ACK with no details', () => {
      const result = parseRdmPacket(examples.GET_DEVICE_INFO_RESPONSE);
      const packet = expectSuccess(result);
      const response = expectResponse(packet);
      expect(response.responseDetail.type).toBe('ack');
    });

    it('parses ACK_TIMER estimated time', () => {
      const result = parseRdmPacket(
        examples.GET_DEVICE_INFO_ACK_TIMER_RESPONSE
      );
      const packet = expectSuccess(result);
      const response = expectResponse(packet);
      expect(response.responseDetail.type).toBe('ackTimer');
      if (response.responseDetail.type !== 'ackTimer') {
        throw new Error(
          `Expected ACK_TIMER response detail but got ` +
            response.responseDetail.type
        );
      }
      expect(response.responseDetail.estimatedWaitMs).toBe(5000);
    });

    it('parses valid NACK reason', () => {
      const result = parseRdmPacket(
        examples.NACK_REASON_HARDWARE_FAULT_RESPONSE
      );
      const packet = expectSuccess(result);
      const response = expectResponse(packet);
      expect(response.responseDetail.type).toBe('nack');
      if (response.responseDetail.type !== 'nack') {
        throw new Error(
          `Expected NACK response detail but got ` +
            response.responseDetail.type
        );
      }
      expect(response.responseDetail.reason.code).toBe(0x02);
      expect(response.responseDetail.reason.name).toBe('HARDWARE_FAULT');
    });

    it('parses invalid NACK reason', () => {
      const invalidReasonResult = parseRdmPacket(
        examples.INVALID_NACK_REASON_RESPONSE
      );
      const invalidReasonPacket = expectSuccess(invalidReasonResult);
      const invalidReasonResponse = expectResponse(invalidReasonPacket);
      expect(invalidReasonResponse.responseDetail.type).toBe('nack');
      if (invalidReasonResponse.responseDetail.type !== 'nack') {
        throw new Error(
          `Expected NACK response detail but got ` +
            invalidReasonResponse.responseDetail.type
        );
      }
      expect(invalidReasonResponse.responseDetail.reason.code).toBe(0xff);
      expect(invalidReasonResponse.responseDetail.reason.name).toBe('UNKNOWN');
    });

    it('parses ACK_OVERFLOW with no details', () => {
      const result = parseRdmPacket(examples.ACK_OVERFLOW_RESPONSE);
      const packet = expectSuccess(result);
      const response = expectResponse(packet);
      expect(response.responseDetail.type).toBe('ackOverflow');
    });
  });

  describe('distinguishes command vs response packets', () => {
    it('parses a GET command packet', () => {
      const result = parseRdmPacket(examples.GET_DEVICE_INFO);
      const packet = expectSuccess(result);
      expect(packet.direction).toBe('command');
    });

    it('parses a GET response packet', () => {
      const result = parseRdmPacket(examples.GET_DEVICE_INFO_RESPONSE);
      const packet = expectSuccess(result);
      expect(packet.direction).toBe('response');
    });

    it('parses a SET command packet', () => {
      const result = parseRdmPacket(examples.SET_START_ADDRESS);
      const packet = expectSuccess(result);
      expect(packet.direction).toBe('command');
    });

    it('parses a SET response packet', () => {
      const result = parseRdmPacket(examples.SET_START_ADDRESS_RESPONSE);
      const packet = expectSuccess(result);
      expect(packet.direction).toBe('response');
    });

    it('parses a discovery command packet', () => {
      const result = parseRdmPacket(examples.DISCOVERY_MUTE_REQUEST);
      const packet = expectSuccess(result);
      expect(packet.direction).toBe('command');
    });

    it('parses a discovery response packet', () => {
      const result = parseRdmPacket(examples.DISCOVERY_MUTE_RESPONSE);
      const packet = expectSuccess(result);
      expect(packet.direction).toBe('response');
    });
  });

  describe('parse warning handling', () => {
    it('warns on invalid start code', () => {
      const invalidStartCodePacket =
        'cd 01 18 01 04 98 76 54 32 01 04 12 34 56 78 25 ' +
        '01 00 00 00 20 00 60 00 04 3e';
      const result = parseRdmPacket(invalidStartCodePacket);
      const packet = expectSuccess(result);
      expect(packet.startCode.value).toBe(0xcd);
      expect(packet.startCode.warning).toMatch(/start code/i);
    });

    it('warns on invalid sub start code', () => {
      const invalidSubStartCodePacket =
        'cc 02 18 01 04 98 76 54 32 01 04 12 34 56 78 25 ' +
        '01 00 00 00 20 00 60 00 04 3e';
      const result = parseRdmPacket(invalidSubStartCodePacket);
      const packet = expectSuccess(result);
      expect(packet.subStartCode.value).toBe(0x02);
      expect(packet.subStartCode.warning).toMatch(/sub start code/i);
    });

    it('warns on invalid message length', () => {
      const invalidMessageLengthPacket =
        'cc 01 05 01 04 98 76 54 32 01 04 12 34 56 78 25 ' +
        '01 00 00 00 20 00 60 00 04 2a';
      const result = parseRdmPacket(invalidMessageLengthPacket);
      const packet = expectSuccess(result);
      expect(packet.messageLength.value).toBe(0x05);
      expect(packet.messageLength.warning).toMatch(/invalid message length/i);
    });

    it('warns on mismatched message length', () => {
      const lowerMessageLengthPacket =
        'cc 01 18 01 04 98 76 54 32 01 04 12 34 56 78 26 ' +
        '01 00 00 00 30 00 f0 02 01 37 05 18';
      const lowerResult = parseRdmPacket(lowerMessageLengthPacket);
      const lowerPacket = expectSuccess(lowerResult);
      expect(lowerPacket.messageLength.value).toBe(0x18);
      expect(lowerPacket.messageLength.warning).toMatch(
        /mismatched message length/i
      );

      const higherMessageLengthPacket =
        'cc 01 1b 01 04 98 76 54 32 01 04 12 34 56 78 26 ' +
        '01 00 00 00 30 00 f0 02 01 37 05 1b';
      const higherResult = parseRdmPacket(higherMessageLengthPacket);
      const higherPacket = expectSuccess(higherResult);
      expect(higherPacket.messageLength.value).toBe(0x1b);
      expect(higherPacket.messageLength.warning).toMatch(
        /mismatched message length/i
      );
    });

    it('warns on invalid port ID', () => {
      const invalidPortIdPacket =
        'cc 01 18 01 04 98 76 54 32 01 04 12 34 56 78 25 ' +
        '00 00 00 00 20 00 60 00 04 3c';
      const result = parseRdmPacket(invalidPortIdPacket);
      const packet = expectSuccess(result);
      const command = expectCommand(packet);
      expect(command.portId.value).toBe(0x00);
      expect(command.portId.warning).toMatch(/port id/i);
    });

    it('warns on unknown response type', () => {
      const invalidResponseTypePacket =
        'cc 01 2b 01 04 12 34 56 78 01 04 98 76 54 32 25 ' +
        '13 00 00 00 21 00 60 13 01 00 00 2d 00 04 00 2d ' +
        '00 01 00 08 00 02 00 01 00 00 01 04 e2';
      const result = parseRdmPacket(invalidResponseTypePacket);
      const packet = expectSuccess(result);
      const response = expectResponse(packet);
      expect(response.responseType.value.code).toBe(0x13);
      expect(response.responseType.warning).toMatch(/response type/i);
    });

    it('warns on invalid message count', () => {
      const invalidMessageCountPacket =
        'cc 01 18 01 04 98 76 54 32 01 04 12 34 56 78 25 ' +
        '01 01 00 00 20 00 60 00 04 3e';
      const result = parseRdmPacket(invalidMessageCountPacket);
      const packet = expectSuccess(result);
      expect(packet.messageCount.value).toBe(0x01);
      expect(packet.messageCount.warning).toMatch(/message count/i);
    });

    it('warns on invalid sub device', () => {
      const invalidSubDevicePacket =
        'cc 01 18 01 04 98 76 54 32 01 04 12 34 56 78 25 ' +
        '01 00 02 01 20 00 60 00 04 40';
      const result = parseRdmPacket(invalidSubDevicePacket);
      const packet = expectSuccess(result);
      expect(packet.subDevice.value).toBe(0x0201);
      expect(packet.subDevice.warning).toMatch(/sub device/i);
    });

    it('warns on unknown command class', () => {
      const unknownCommandClassPacket =
        'cc 01 18 01 04 98 76 54 32 01 04 12 34 56 78 25 ' +
        '01 00 00 00 25 00 60 00 04 42';
      const result = parseRdmPacket(unknownCommandClassPacket);
      const packet = expectSuccess(result);
      expect(packet.commandClass.value.code).toBe(0x25);
      expect(packet.commandClass.warning).toMatch(/command class/i);
    });

    it('warns on unknown PID', () => {
      const unknownPidPacket =
        'cc 01 18 01 04 98 76 54 32 01 04 12 34 56 78 25 ' +
        '01 00 00 00 20 00 07 00 03 e4';
      const result = parseRdmPacket(unknownPidPacket);
      const packet = expectSuccess(result);
      expect(packet.parameterId.value.pid).toBe(0x0007);
      expect(packet.parameterId.warning).toMatch(/unknown pid/i);
    });

    it('warns on parameter data length mismatch', () => {
      const lowerDataLengthPacket =
        'cc 01 1a 01 04 98 76 54 32 01 04 12 34 56 78 26 ' +
        '01 00 00 00 30 00 f0 00 01 37 05 18';
      const lowerResult = parseRdmPacket(lowerDataLengthPacket);
      const lowerPacket = expectSuccess(lowerResult);
      expect(lowerPacket.parameterDataLength.value).toBe(0x00);
      expect(lowerPacket.parameterDataLength.warning).toMatch(
        /parameter data length/i
      );

      const higherDataLengthPacket =
        'cc 01 1a 01 04 98 76 54 32 01 04 12 34 56 78 26 ' +
        '01 00 00 00 30 00 f0 03 01 37 05 20';
      const higherResult = parseRdmPacket(higherDataLengthPacket);
      const higherPacket = expectSuccess(higherResult);
      expect(higherPacket.parameterDataLength.value).toBe(0x03);
      expect(higherPacket.parameterDataLength.warning).toMatch(
        /parameter data length/i
      );
    });

    it('warns on checksum mismatch', () => {
      const result = parseRdmPacket(examples.INVALID_CHECKSUM_START_ADDRESS);
      const packet = expectSuccess(result);
      expect(packet.validChecksum).toBe(false);
      expect(packet.checksum.warning).toMatch(/checksum mismatch/i);
    });
  });

  describe('parse error handling', () => {
    it('catches truncated packets', () => {
      const singleByteResult = parseRdmPacket('cc');
      const singleByteError = expectParseError(singleByteResult);
      expect(singleByteError.byteOffset).toBe(1);
      expect(singleByteError.message).toMatch(/beyond end/i);

      const dualByteResult = parseRdmPacket('cc 01');
      const dualByteError = expectParseError(dualByteResult);
      expect(dualByteError.byteOffset).toBe(2);
      expect(dualByteError.message).toMatch(/beyond end/i);
    });

    it('rejects empty inputs', () => {
      const result = parseRdmPacket('');
      const error = expectParseError(result);
      expect(error.message).toMatch(/empty input/i);
    });
  });

  describe('parse result structure', () => {
    it('includes raw bytes in successful parse', () => {
      const result = parseRdmPacket(examples.GET_DEVICE_INFO);
      expect(result.rawBytes).not.toBeNull();
      if (result.rawBytes === null) {
        throw new Error('Expected raw bytes to be present in successful parse');
      }
      expect(result.rawBytes.length).toEqual(26);
    });

    it('includes raw bytes in failed parse', () => {
      const result = parseRdmPacket('cc 01 18 01 04 98');
      expect(result.rawBytes).not.toBeNull();
      if (result.rawBytes === null) {
        throw new Error('Expected raw bytes to be present in failed parse');
      }
      expect(result.rawBytes.length).toEqual(6);
    });

    it('includes null raw bytes when input is empty', () => {
      const result = parseRdmPacket('');
      expect(result.rawBytes).toBeNull();
    });
  });
});
