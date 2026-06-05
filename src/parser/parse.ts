import { lookupCommandClass } from './data/command-classes';
import { lookupNackReason } from './data/nack-reasons';
import { lookupPid } from './data/pids';
import { lookupResponseType } from './data/response-types';
import { normalizeHex } from './normalize';
import type {
  ParseResult,
  RdmField,
  RdmPacketBase,
  ResponseDetail,
} from './types';

/**
 * Reads a field from the given byte array starting at the specified offset and
 * spanning the specified length, applying a transformation function to convert
 * the raw bytes into a meaningful value.
 *
 * Should not be called with a length of 0.
 *
 * @param data - The byte array containing the field data
 * @param offset - The starting byte offset of the field within the data array
 * @param length - The number of bytes that make up the field
 * @param transform - A function that takes the raw bytes of the field and
 *  returns a transformed value of type T
 * @returns An object containing the transformed value, the start and end byte
 *  offsets, and the raw bytes of the field
 * @throws Error if the length is not greater than 0
 * @throws Error if the specified offset and length exceed the bounds of the
 *  data array
 *
 * @example
 * ```ts
 * const data = new Uint8Array([0xCC, 0x01, 0x18, 0x04]);
 * const startCode = readField(data, 0, 1, (bytes) => bytes[0]);
 * // startCode.value === 0xCC
 * // startCode.startByte === 0
 * // startCode.endByte === 0
 * // startCode.rawBytes === Uint8Array [ 0xCC ]
 * ```
 */
const readField = <T>(
  data: Uint8Array,
  offset: number,
  length: number,
  transform: (bytes: Uint8Array) => T
): RdmField<T> => {
  if (length <= 0) {
    throw new Error(
      `readField length must be greater than 0, but got ${length}`
    );
  }
  if (offset + length > data.length) {
    throw new Error(
      `Attempt to read beyond end of data: offset ${offset}, ` +
        `length ${length}, data length ${data.length}`
    );
  }
  const rawBytes = data.slice(offset, offset + length);
  return {
    value: transform(rawBytes),
    startByte: offset,
    endByte: offset + length - 1,
    rawBytes,
  };
};

/**
 * Creates a reader object that maintains an internal offset and provides a
 * method to read fields sequentially from a given byte array using the
 * readField function.
 *
 * @param data - The byte array to read from
 * @returns An object with a read method for reading fields and a method to get
 *  the current offset
 *
 * @example
 * ```ts
 * const data = new Uint8Array([0xCC, 0x01, 0x18]);
 * const reader = createReader(data);
 * const startCode = reader.read(1, (bytes) => bytes[0]);
 * // startCode.value === 0xCC
 * // reader.currentOffset() === 1
 * const subStartCode = reader.read(1, (bytes) => bytes[0]);
 * // subStartCode.value === 0x01
 * // reader.currentOffset() === 2
 * ```
 */
const createReader = (data: Uint8Array) => {
  let offset = 0;
  return {
    read: <T>(
      length: number,
      transform: (bytes: Uint8Array) => T
    ): RdmField<T> => {
      const field = readField(data, offset, length, transform);
      offset += length;
      return field;
    },
    currentOffset: () => offset,
  };
};

/**
 * Transforms a 6-byte UID field into the standard RDM UID string format
 * "NNNN:NNNNNNNN". If the input byte array does not have a length of 6,
 * an error is thrown.
 *
 * @param bytes - The 6-byte UID field as a Uint8Array
 * @returns The UID as a string in the format "NNNN:NNNNNNNN"
 * @throws Error if the input byte array does not have a length of 6
 */
const transformUid = (bytes: Uint8Array): string => {
  if (bytes.length !== 6) {
    throw new Error(
      `Invalid UID length: expected 6 bytes but got ` + `${bytes.length} bytes`
    );
  }
  return (
    bytes[0].toString(16).padStart(2, '0') +
    bytes[1].toString(16).padStart(2, '0') +
    ':' +
    bytes[2].toString(16).padStart(2, '0') +
    bytes[3].toString(16).padStart(2, '0') +
    bytes[4].toString(16).padStart(2, '0') +
    bytes[5].toString(16).padStart(2, '0')
  );
};

const transformUint16 = (bytes: Uint8Array): number => {
  if (bytes.length !== 2) {
    throw new Error(
      `Invalid uint16 length: expected 2 bytes but got ` +
        `${bytes.length} bytes`
    );
  }
  return (bytes[0] << 8) + bytes[1];
};

const isCommand = (commandClassCode: number): boolean => {
  return (
    commandClassCode === 0x10 ||
    commandClassCode === 0x20 ||
    commandClassCode === 0x30
  );
};

const isResponse = (commandClassCode: number): boolean => {
  return (
    commandClassCode === 0x11 ||
    commandClassCode === 0x21 ||
    commandClassCode === 0x31
  );
};

const interpretResponseDetail = (
  responseType: number,
  parameterData: Uint8Array | null
): ResponseDetail => {
  switch (responseType) {
    case 0x00: // ACK
      return { type: 'ack' };
    case 0x01: // ACK_TIMER
      if (!parameterData || parameterData.length !== 2) {
        throw new Error(
          `Invalid parameter data for ACK_TIMER response: expected 2 bytes ` +
            `but got ${parameterData ? parameterData.length : 'null'}`
        );
      }
      // Packet contains estimated time in 100ms units, so we convert it to ms
      // for easier interpretation
      return {
        type: 'ackTimer',
        estimatedWaitMs: transformUint16(parameterData) * 100,
      };
    case 0x02: // NACK
      if (!parameterData || parameterData.length !== 2) {
        throw new Error(
          `Invalid parameter data for NACK response: expected 2 bytes but ` +
            `got ${parameterData ? parameterData.length : 'null'}`
        );
      }
      return {
        type: 'nack',
        reason: lookupNackReason(transformUint16(parameterData)),
      };
    case 0x03: // ACK_OVERFLOW
      return { type: 'ackOverflow' };
    default:
      return { type: 'unknown', rawValue: responseType };
  }
};

/**
 * Parses a hexadecimal string representing an RDM GET or SET command or
 * response packet and returns a structured representation of all fields.
 *
 * Also performs validation of the packet structure with early returns. This
 * means that a packet with an invalid start code will return an error
 * indicating the invalid index of the start code, rather than attempting to
 * parse the rest of the packet.
 *
 * @param packet - The RDM packet as a hexadecimal string
 * @returns an object indicating either a successful parse with the structured
 *  packet data or a failed parse with an error message and byte offset
 *
 */
export const parseRdmPacket = (packet: string): ParseResult => {
  let normalizedPacket;
  try {
    normalizedPacket = normalizeHex(packet);
  } catch (error) {
    return {
      success: false,
      error: {
        byteOffset: -1,
        message: (error as Error).message,
      },
    };
  }

  const reader = createReader(normalizedPacket);

  try {
    const startCode = reader.read(1, (bytes) => bytes[0]);
    if (startCode.value !== 0xcc) {
      startCode.warning =
        `Invalid start code: expected 0xCC but got ` +
        `0x${startCode.value.toString(16)}`;
    }

    const subStartCode = reader.read(1, (bytes) => bytes[0]);
    if (subStartCode.value !== 0x01) {
      subStartCode.warning =
        `Invalid sub start code: expected 0x01 but got ` +
        `0x${subStartCode.value.toString(16)}`;
    }

    const messageLength = reader.read(1, (bytes) => bytes[0]);
    // Length doesn't include the checksum
    if (messageLength.value < 24) {
      messageLength.warning =
        `Invalid message length: minimum length is 24, but got ` +
        `${messageLength.value}`;
    } else if (messageLength.value !== normalizedPacket.length - 2) {
      messageLength.warning =
        `Mismatched message length: expected ${messageLength.value} bytes ` +
        `but got ${normalizedPacket.length - 2} bytes`;
    }

    const destinationUid = reader.read(6, transformUid);

    const sourceUid = reader.read(6, transformUid);

    const transactionNumber = reader.read(1, (bytes) => bytes[0]);

    const portIdOrResponseType = reader.read(1, (bytes) => bytes[0]);

    const messageCount = reader.read(1, (bytes) => bytes[0]);

    const subDevice = reader.read(2, transformUint16);

    const commandClass = reader.read(1, (bytes) =>
      lookupCommandClass(bytes[0])
    );

    const parameterId = reader.read(2, (bytes) =>
      lookupPid(transformUint16(bytes))
    );

    const parameterDataLength = reader.read(1, (bytes) => bytes[0]);

    const parameterData =
      parameterDataLength.value > 0
        ? reader.read(parameterDataLength.value, (bytes) => bytes)
        : null;

    const checksum = reader.read(2, transformUint16);

    const expectedChecksum = normalizedPacket
      .slice(0, -2)
      .reduce((sum, byte) => {
        return (sum + byte) & 0xffff; // Keep it to 16 bits
      }, 0);
    const validChecksum = checksum.value === expectedChecksum;

    const packetBase: RdmPacketBase = {
      startCode,
      subStartCode,
      messageLength,
      destinationUid,
      sourceUid,
      transactionNumber,
      messageCount,
      subDevice,
      commandClass,
      parameterId,
      parameterDataLength,
      parameterData,
      checksum,
      expectedChecksum,
      validChecksum,
    };

    if (isCommand(commandClass.value.code)) {
      // Command packet
      const packet = {
        ...packetBase,
        direction: 'command' as const,
        portId: portIdOrResponseType,
      };
      return { success: true, packet };
    } else if (isResponse(commandClass.value.code)) {
      // Response packet
      const responseType = {
        value: lookupResponseType(portIdOrResponseType.value),
        startByte: portIdOrResponseType.startByte,
        endByte: portIdOrResponseType.endByte,
        rawBytes: portIdOrResponseType.rawBytes,
      };
      const responseDetail = interpretResponseDetail(
        responseType.value.code,
        parameterData?.rawBytes || null
      );
      const packet = {
        ...packetBase,
        direction: 'response' as const,
        responseType,
        responseDetail,
      };
      return { success: true, packet };
    } else {
      return {
        success: false,
        error: {
          byteOffset: commandClass.startByte,
          message:
            `Invalid command class for determining packet direction: ` +
            `0x${commandClass.value.code.toString(16)}`,
        },
      };
    }
  } catch (error) {
    return {
      success: false,
      error: {
        byteOffset: reader.currentOffset(),
        message: (error as Error).message,
      },
    };
  }
};
