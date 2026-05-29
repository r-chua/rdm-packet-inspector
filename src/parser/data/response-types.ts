type ResponseTypeInfo = {
  name: string;
  description: string;
};

const RESPONSE_TYPE: Record<number, ResponseTypeInfo> = {
  0x00: {
    name: 'RESPONSE_TYPE_ACK',
    description: 'The command was accepted and processed successfully.',
  },
  0x01: {
    name: 'RESPONSE_TYPE_ACK_TIMER',
    description:
      'The command was accepted but requires more time to process. Parameter ' +
      'data contains the estimated time (in milliseconds) until the response ' +
      'is ready. Response will be added to QUEUED_MESSAGE list once ready.',
  },
  0x02: {
    name: 'RESPONSE_TYPE_NACK_REASON',
    description:
      'The command was rejected. The parameter data contains a NACK reason ' +
      'code that indicates why the command was rejected.',
  },
  0x03: {
    name: 'RESPONSE_TYPE_ACK_OVERFLOW',
    description:
      'The command was accepted but the response data exceeds the maximum ' +
      'allowed length. Continue requesting this PID to retrieve the ' +
      'remaining data.',
  },
};

/**
 * Represents the type of acknowledgement in an RDM response packet.
 *
 * Contains the response type code, a human-readable name, and a description of
 * what the response type indicates. Response types are described in E1.20
 * Section 6.3 and Table A-2.
 */
export type RdmResponseType = {
  code: number;
  name: string;
  description: string;
};

/**
 * Looks up an RDM response type code and returns its name and description. If
 * the code is not recognized, it returns a default name and description.
 *
 * @param code - The 8-bit response type code to look up
 * @returns Response type name, description, and code.
 *
 * @example
 * ```ts
 * lookupResponseType(0x01);
 * // { code: 0x01, name: 'RESPONSE_TYPE_ACK_TIMER', description: 'The...' }
 * ```
 */
export function lookupResponseType(code: number): RdmResponseType {
  const info = RESPONSE_TYPE[code];
  if (info) {
    return { code, ...info };
  }

  return {
    code,
    name: 'UNKNOWN_RESPONSE_TYPE',
    description: `Response type 0x${code.toString(16).padStart(2, '0').toUpperCase()}`,
  };
}
