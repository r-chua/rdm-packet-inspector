import type { CommandClass } from './data/command-classes';
import type { NackReason } from './data/nack-reasons';
import type { ParameterId } from './data/pids';
import type { RdmResponseType } from './data/response-types';

/**
 * Represents a field parsed from an RDM packet, including its value, raw bytes,
 * byte offsets, and an optional description. This structure allows us to retain
 * both the interpreted value and the original byte data for each field in the
 * packet.
 *
 * @typeParam T - The type of the interpreted value (e.g., number, string, etc.)
 */
export type RdmField<T> = {
  value: T;
  rawBytes: Uint8Array;
  /** Inclusive start byte index */
  startByte: number;
  /** Inclusive end byte index */
  endByte: number;
  description?: string;
};

/**
 * Base structure for an RDM packet, containing all common fields. This type is
 * extended by specific command and response packet types to include additional
 * fields relevant to their direction.
 */
export type RdmPacketBase = {
  startCode: RdmField<number>;
  subStartCode: RdmField<number>;
  messageLength: RdmField<number>;
  destinationUid: RdmField<string>;
  sourceUid: RdmField<string>;
  transactionNumber: RdmField<number>;
  messageCount: RdmField<number>;
  subDevice: RdmField<number>;
  commandClass: RdmField<CommandClass>;
  parameterId: RdmField<ParameterId>;
  parameterDataLength: RdmField<number>;
  /** The raw parameter data bytes, which are interpreted based on the PID */
  parameterData: RdmField<Uint8Array> | null;
  /** The checksum value extracted from the packet */
  checksum: RdmField<number>;
  /** The calculated checksum based on the packet data */
  expectedChecksum: number;
  /** Whether the checksum is valid */
  validChecksum: boolean;
};

export type RdmCommandPacket = RdmPacketBase & {
  direction: 'command';
  portId: RdmField<number>;
};

/**
 * Contains details about the response based on the response type.
 *
 * ACK and ACK_OVERFLOW types do not have additional details, while ACK_TIMER
 * includes the estimated wait time, and NACK includes the reason for rejection.
 */
type ResponseDetail =
  | { type: 'ack' }
  | { type: 'ackTimer'; estimatedWaitMs: number }
  | { type: 'nack'; reason: NackReason }
  | { type: 'ackOverflow' };

export type RdmResponsePacket = RdmPacketBase & {
  direction: 'response';
  responseType: RdmField<RdmResponseType>;
  responseDetail: ResponseDetail;
};

/**
 * Represents a parsed RDM packet, which can be either a command or a response.
 */
export type RdmPacket = RdmCommandPacket | RdmResponsePacket;

/**
 * Represents an error that occurred during parsing of an RDM packet, including
 * the byte offset where the error was detected and a descriptive message.
 *
 * A byteOffset of -1 can be used to indicate an error that is not specific to
 * a particular byte.
 */
export type ParseError = {
  byteOffset: number;
  message: string;
};

/**
 * Represents the result of parsing an RDM packet, which can be either a
 * successful parse with a valid packet or a failed parse with an error.
 */
export type ParseResult =
  | { success: true; packet: RdmPacket }
  | { success: false; error: ParseError };
