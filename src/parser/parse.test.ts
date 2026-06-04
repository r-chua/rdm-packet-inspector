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

// Example RDM packet for getting device info
const GET_DEVICE_INFO =
  'cc 01 18 01 04 98 76 54 32 01 04 12 34 56 78 25 ' +
  '01 00 00 00 20 00 60 00 04 3d';

// Example RDM response packet for getting device info
const GET_DEVICE_INFO_RESPONSE =
  'cc 01 2b 01 04 12 34 56 78 01 04 98 76 54 32 25 ' +
  '00 00 00 00 21 00 60 13 01 00 00 2d 00 04 00 2d ' +
  '00 01 00 08 00 02 00 01 00 00 01 04 cf';

// Example for delayed response with an estimated wait time of 5 seconds
const GET_DEVICE_INFO_ACK_TIMER_RESPONSE =
  'cc 01 1a 01 04 12 34 56 78 01 04 98 76 54 32 25 ' +
  '01 00 00 00 21 00 60 02 00 32 04 74';

// Example RDM SET command to set the DMX start address to 311
const SET_START_ADDRESS =
  'cc 01 1a 01 04 98 76 54 32 01 04 12 34 56 78 26 ' +
  '01 00 00 00 30 00 f0 02 01 37 05 1a';

const SET_START_ADDRESS_RESPONSE =
  'cc 01 18 01 04 12 34 56 78 01 04 98 76 54 32 26 ' +
  '00 00 00 00 31 00 f0 00 04 de';

// Example RDM SET command with an invalid checksum
const INVALID_CHECKSUM_START_ADDRESS =
  'cc 01 1a 01 04 98 76 54 32 01 04 12 34 56 78 26 ' +
  '01 00 00 00 20 00 f0 02 01 37 05 ff';

// Example NACK response with reason code of "Hardware Fault"
const NACK_REASON_HARDWARE_FAULT_RESPONSE =
  'cc 01 1a 01 04 12 34 56 78 01 04 98 76 54 32 25 ' +
  '02 00 00 00 21 00 66 02 00 02 04 4b';

const INVALID_NACK_REASON_RESPONSE =
  'cc 01 1a 01 04 12 34 56 78 01 04 98 76 54 32 25 ' +
  '02 00 00 00 21 00 66 02 00 ff 05 48';

const DISCOVERY_MUTE_REQUEST =
  'cc 01 18 01 04 98 76 54 32 01 04 12 34 56 78 38 ' +
  '01 00 00 00 10 00 02 00 03 e2';

const DISCOVERY_MUTE_RESPONSE =
  'cc 01 1a 01 04 12 34 56 78 01 04 98 76 54 32 38 ' +
  '00 00 00 00 11 00 02 02 00 00 03 e6';

// Example ACK_OVERFLOW response mocking a fixture with a large amount
// of proxied devices. Packet data is packed with 38 UIDs, which is the maximum
// that can fit in a single RDM packet.
const ACK_OVERFLOW_RESPONSE =
  'cc 01 fc 01 04 12 34 56 78 01 04 98 76 54 32 27 ' +
  '03 00 00 00 21 00 10 e4 01 00 11 11 11 11 02 00 ' +
  '22 22 22 22 03 00 33 33 33 33 04 00 44 44 44 44 ' +
  '05 00 55 55 55 55 06 00 66 66 66 66 07 00 77 77 ' +
  '77 77 08 00 88 88 88 88 09 00 99 99 99 99 0a 00 ' +
  'aa aa aa aa 0b 00 bb bb bb bb 0c 00 cc cc cc cc ' +
  '0d 00 dd dd dd dd 0e 00 ee ee ee ee 0f 00 ff ff ' +
  'ff ff 10 00 00 00 00 00 11 00 11 11 11 11 12 00 ' +
  '22 22 22 22 13 00 33 33 33 33 14 00 44 44 44 44 ' +
  '15 00 55 55 55 55 16 00 66 66 66 66 17 00 77 77 ' +
  '77 77 18 00 88 88 88 88 19 00 99 99 99 99 1a 00 ' +
  'aa aa aa aa 1b 00 bb bb bb bb 1c 00 cc cc cc cc ' +
  '1d 00 dd dd dd dd 1e 00 ee ee ee ee 1f 00 ff ff ' +
  'ff ff 20 00 00 00 00 00 21 00 11 11 11 11 22 00 ' +
  '22 22 22 22 23 00 33 33 33 33 24 00 44 44 44 44 ' +
  '25 00 55 55 55 55 26 00 66 66 66 66 4d f3';

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

  describe('body fields', () => {
    it('parses the parameter data', () => {
      const responseResult = parseRdmPacket(GET_DEVICE_INFO_RESPONSE);
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
      const result = parseRdmPacket(GET_DEVICE_INFO);
      const packet = expectSuccess(result);
      expect(packet.parameterData).toBeNull();
    });

    it('matches the data length to the parameter data length', () => {
      const result = parseRdmPacket(GET_DEVICE_INFO_RESPONSE);
      const packet = expectSuccess(result);
      const parameterData = expectBodyData(packet);
      expect(parameterData.value.length).toBe(packet.parameterDataLength.value);

      const setResult = parseRdmPacket(SET_START_ADDRESS);
      const setPacket = expectSuccess(setResult);
      const setParameterData = expectBodyData(setPacket);
      expect(setParameterData.value.length).toBe(
        setPacket.parameterDataLength.value
      );
    });

    it('parses the checksum', () => {
      const commandResult = parseRdmPacket(GET_DEVICE_INFO);
      const commandPacket = expectSuccess(commandResult);
      expect(commandPacket.checksum.value).toBe(0x043d);
      expect(commandPacket.checksum.startByte).toBe(24);
      expect(commandPacket.checksum.endByte).toBe(25);
      expect(commandPacket.checksum.rawBytes).toEqual(
        new Uint8Array([0x04, 0x3d])
      );

      const responseResult = parseRdmPacket(GET_DEVICE_INFO_RESPONSE);
      const responsePacket = expectSuccess(responseResult);
      expect(responsePacket.checksum.value).toBe(0x04cf);
      expect(responsePacket.checksum.startByte).toBe(43);
      expect(responsePacket.checksum.endByte).toBe(44);
      expect(responsePacket.checksum.rawBytes).toEqual(
        new Uint8Array([0x04, 0xcf])
      );
    });

    it('calculates the expected checksum', () => {
      const result = parseRdmPacket(GET_DEVICE_INFO);
      const packet = expectSuccess(result);
      expect(packet.expectedChecksum).toBe(0x043d);
    });

    it('validates the checksum', () => {
      const result = parseRdmPacket(GET_DEVICE_INFO);
      const packet = expectSuccess(result);
      expect(packet.validChecksum).toBe(true);

      const invalidResult = parseRdmPacket(INVALID_CHECKSUM_START_ADDRESS);
      const invalidPacket = expectSuccess(invalidResult);
      expect(invalidPacket.validChecksum).toBe(false);
    });
  });

  describe('response details', () => {
    it('parses ACK with no details', () => {
      const result = parseRdmPacket(GET_DEVICE_INFO_RESPONSE);
      const packet = expectSuccess(result);
      const response = expectResponse(packet);
      expect(response.responseDetail.type).toBe('ack');
    });

    it('parses ACK_TIMER estimated time', () => {
      const result = parseRdmPacket(GET_DEVICE_INFO_ACK_TIMER_RESPONSE);
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
      const result = parseRdmPacket(NACK_REASON_HARDWARE_FAULT_RESPONSE);
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
      const invalidReasonResult = parseRdmPacket(INVALID_NACK_REASON_RESPONSE);
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
      const result = parseRdmPacket(ACK_OVERFLOW_RESPONSE);
      const packet = expectSuccess(result);
      const response = expectResponse(packet);
      expect(response.responseDetail.type).toBe('ackOverflow');
    });
  });

  describe('distinguishes command vs response packets', () => {
    it('parses a GET command packet', () => {
      const result = parseRdmPacket(GET_DEVICE_INFO);
      const packet = expectSuccess(result);
      expect(packet.direction).toBe('command');
    });

    it('parses a GET response packet', () => {
      const result = parseRdmPacket(GET_DEVICE_INFO_RESPONSE);
      const packet = expectSuccess(result);
      expect(packet.direction).toBe('response');
    });

    it('parses a SET command packet', () => {
      const result = parseRdmPacket(SET_START_ADDRESS);
      const packet = expectSuccess(result);
      expect(packet.direction).toBe('command');
    });

    it('parses a SET response packet', () => {
      const result = parseRdmPacket(SET_START_ADDRESS_RESPONSE);
      const packet = expectSuccess(result);
      expect(packet.direction).toBe('response');
    });

    it('parses a discovery command packet', () => {
      const result = parseRdmPacket(DISCOVERY_MUTE_REQUEST);
      const packet = expectSuccess(result);
      expect(packet.direction).toBe('command');
    });

    it('parses a discovery response packet', () => {
      const result = parseRdmPacket(DISCOVERY_MUTE_RESPONSE);
      const packet = expectSuccess(result);
      expect(packet.direction).toBe('response');
    });
  });

  describe('parse error handling', () => {
    it('catches invalid start code', () => {
      const invalidStartCodePacket =
        'cd 01 18 01 04 98 76 54 32 01 04 12 34 56 78 25 ' +
        '01 00 00 00 20 00 60 00 04 3d';
      const result = parseRdmPacket(invalidStartCodePacket);
      const error = expectParseError(result);
      expect(error.byteOffset).toBe(0);
      expect(error.message).toMatch(/start code: expected/i);
    });

    it('catches invalid sub start code', () => {
      const invalidSubStartCodePacket =
        'cc 02 18 01 04 98 76 54 32 01 04 12 34 56 78 25 ' +
        '01 00 00 00 20 00 60 00 04 3d';
      const result = parseRdmPacket(invalidSubStartCodePacket);
      const error = expectParseError(result);
      expect(error.byteOffset).toBe(1);
      expect(error.message).toMatch(/sub start code: expected/i);
    });

    it('catches invalid message length', () => {
      const invalidMessageLengthPacket =
        'cc 01 ff 01 04 98 76 54 32 01 04 12 34 56 78 25 ' +
        '01 00 00 00 20 00 60 00 04 3d';
      const result = parseRdmPacket(invalidMessageLengthPacket);
      const error = expectParseError(result);
      expect(error.byteOffset).toBe(2);
      expect(error.message).toMatch(/message length/i);
    });

    it('catches unknown command class', () => {
      const unknownCommandClassPacket =
        'cc 01 18 01 04 98 76 54 32 01 04 12 34 56 78 25 ' +
        '01 00 00 00 25 ff ff 00 04 3d';
      const result = parseRdmPacket(unknownCommandClassPacket);
      const error = expectParseError(result);
      expect(error.byteOffset).toBe(20);
      expect(error.message).toMatch(/command class/i);
    });

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
  });
});
