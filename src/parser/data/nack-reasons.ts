type NackReasonInfo = {
  name: string;
  description: string;
};

const NACK_REASON: Record<number, NackReasonInfo> = {
  0x0000: {
    name: 'UNKNOWN_PID',
    description: 'The PID is not recognized by the device.',
  },
  0x0001: {
    name: 'FORMAT_ERROR',
    description: 'The format of the command is incorrect.',
  },
  0x0002: {
    name: 'HARDWARE_FAULT',
    description: 'A hardware fault has occurred.',
  },
  0x0003: {
    name: 'PROXY_REJECTED',
    description: 'The proxy cannot comply with the request.',
  },
  0x0004: {
    name: 'WRITE_PROTECT',
    description: 'SET commands are currently blocked.',
  },
  0x0005: {
    name: 'UNSUPPORTED_COMMAND_CLASS',
    description: 'The command class is not supported.',
  },
  0x0006: {
    name: 'DATA_OUT_OF_RANGE',
    description: 'The parameter data is out of range.',
  },
  0x0007: {
    name: 'BUFFER_FULL',
    description: 'The buffer or queue has no free space.',
  },
  0x0008: {
    name: 'PACKET_SIZE_UNSUPPORTED',
    description: 'The incoming packet size is greater than available space.',
  },
  0x0009: {
    name: 'SUB_DEVICE_OUT_OF_RANGE',
    description: 'The sub-device is out of range or unknown.',
  },
  0x000a: {
    name: 'PROXY_BUFFER_FULL',
    description: 'The proxy buffer is full.',
  },
};

/**
 * Represents the reason for a rejected RDM command.
 *
 * NACK reasons are described in E1.20 Table A-17. Each reason code indicates
 * a specific condition that caused the command to be rejected.
 */
export type NackReason = {
  code: number;
  name: string;
  description: string;
};

/**
 * Looks up a NACK reason code and returns its name and description. If the
 * reason is not recognized, it returns a default name and description.
 *
 * @param reason - The 16-bit NACK reason code to look up
 * @returns NACK reason name, description, and code.
 *
 * @example
 * ```ts
 * lookupNackReason(0x0001);
 * // { code: 0x0001, name: 'FORMAT_ERROR', description: 'The format...' }
 * ```
 */
export function lookupNackReason(reason: number): NackReason {
  const info = NACK_REASON[reason];
  if (info) {
    return {
      code: reason,
      name: info.name,
      description: info.description,
    };
  }

  return {
    code: reason,
    name: 'UNKNOWN',
    description: `Unknown NACK reason 0x${reason.toString(16).padStart(4, '0').toUpperCase()}`,
  };
}
