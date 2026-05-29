type CommandClassInfo = {
  name: string;
  description: string;
};

const COMMAND_CLASS_INFO: Record<number, CommandClassInfo> = {
  0x10: {
    name: 'DISCOVERY_COMMAND',
    description: 'Used for device discovery and identification.',
  },
  0x11: {
    name: 'DISCOVERY_COMMAND_RESPONSE',
    description: 'Response to a discovery command.',
  },
  0x20: {
    name: 'GET_COMMAND',
    description: 'Used to request information from a device.',
  },
  0x21: {
    name: 'GET_COMMAND_RESPONSE',
    description: 'Response to a GET command, containing the requested data.',
  },
  0x30: {
    name: 'SET_COMMAND',
    description: 'Used to set a parameter on a device.',
  },
  0x31: {
    name: 'SET_COMMAND_RESPONSE',
    description: 'Response to a SET command, indicating success or failure.',
  },
};

/**
 * Specifies the action of an RDM packet.
 *
 * Command classes are defined in E1.20 Section 6.2.10.1 and Table A-1.
 */
export type CommandClass = {
  code: number;
  name: string;
  description: string;
};

/**
 * Looks up an RDM command class code and returns its name and description. If
 * the code is not recognized, it returns a default "UNKNOWN_COMMAND_CLASS"
 * entry.
 *
 * @param code - The 8-bit command class code to look up
 * @return Command class name, description, and code.
 *
 * @example
 * ```ts
 * lookupCommandClass(0x20);
 * // { code: 0x20, name: 'GET_COMMAND', description: 'Used to request...' }
 * ```
 */
export function lookupCommandClass(code: number): CommandClass {
  const info = COMMAND_CLASS_INFO[code];
  if (info) {
    return { code, ...info };
  }

  return {
    code,
    name: 'UNKNOWN_COMMAND_CLASS',
    description: `Command class 0x${code.toString(16).padStart(2, '0').toUpperCase()}`,
  };
}
