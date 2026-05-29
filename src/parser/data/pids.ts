type PidInfo = {
  name: string;
  description: string;
};

const PID_INFO: Record<number, PidInfo> = {
  // --- Category: Network Management ---
  0x0001: {
    name: 'DISC_UNIQUE_BRANCH',
    description: 'Discovery message to find devices within a UID range.',
  },
  0x0002: {
    name: 'DISC_MUTE',
    description: 'Mute a device so it stops responding to discovery messages.',
  },
  0x0003: {
    name: 'DISC_UN_MUTE',
    description:
      'Clear a device\u2019s discovery mute flag so it responds to discovery ' +
      'messages again.',
  },
  0x0010: {
    name: 'PROXIED_DEVICES',
    description: 'Packed list of UIDs of devices represented by a proxy.',
  },
  0x0011: {
    name: 'PROXIED_DEVICE_COUNT',
    description:
      'Number of devices behind a proxy and whether the list has changed.',
  },
  0x0015: {
    name: 'COMMS_STATUS',
    description:
      'Communication error counters (short message, length mismatch, ' +
      'checksum fail).',
  },

  // --- Category: Status Collection ---
  0x0020: {
    name: 'QUEUED_MESSAGE',
    description:
      'Retrieve a deferred/queued message from the responder\u2019s message ' +
      'queue.',
  },
  0x0030: {
    name: 'STATUS_MESSAGES',
    description: 'Collect status or error messages from a device.',
  },
  0x0031: {
    name: 'STATUS_ID_DESCRIPTION',
    description: 'ASCII text description for a given Status Message ID.',
  },
  0x0032: {
    name: 'CLEAR_STATUS_ID',
    description: 'Clear the device\u2019s status message queue.',
  },
  0x0033: {
    name: 'SUB_DEVICE_STATUS_REPORT_THRESHOLD',
    description:
      'Get/set the status reporting verbosity threshold for sub-devices.',
  },

  // --- Category: RDM Information ---
  0x0050: {
    name: 'SUPPORTED_PARAMETERS',
    description: 'PIDs supported by this device.',
  },
  0x0051: {
    name: 'PARAMETER_DESCRIPTION',
    description:
      'Definition of a manufacturer-specific PID for controller use.',
  },

  // --- Category: Product Information ---
  0x0060: {
    name: 'DEVICE_INFO',
    description:
      'Core device info: protocol version, model, category, footprint, ' +
      'address, etc.',
  },
  0x0070: {
    name: 'PRODUCT_DETAIL_ID_LIST',
    description:
      'Packed list of product detail IDs describing device technology.',
  },
  0x0080: {
    name: 'DEVICE_MODEL_DESCRIPTION',
    description: 'Description of the device model type',
  },
  0x0081: {
    name: 'MANUFACTURER_LABEL',
    description: 'Name of the device manufacturer',
  },
  0x0082: {
    name: 'DEVICE_LABEL',
    description: 'A user-assigned descriptive label for the device.',
  },
  0x0090: {
    name: 'FACTORY_DEFAULTS',
    description:
      'Report whether at factory defaults, or instruct device to revert to them.',
  },
  0x00a0: {
    name: 'LANGUAGE_CAPABILITIES',
    description: 'List of ISO 639-1 language codes the device supports.',
  },
  0x00b0: {
    name: 'LANGUAGE',
    description: 'The current language (ISO 639-1) for device messages.',
  },
  0x00c0: {
    name: 'SOFTWARE_VERSION_LABEL',
    description: 'Label for the device\u2019s operating software version.',
  },
  0x00c1: {
    name: 'BOOT_SOFTWARE_VERSION_ID',
    description: '32-bit boot software version ID.',
  },
  0x00c2: {
    name: 'BOOT_SOFTWARE_VERSION_LABEL',
    description: 'Label for the device\u2019s boot software version.',
  },

  // --- Category: DMX512 Setup ---
  0x00e0: {
    name: 'DMX_PERSONALITY',
    description: 'The current DMX512 personality and report total available.',
  },
  0x00e1: {
    name: 'DMX_PERSONALITY_DESCRIPTION',
    description:
      'Text description and slot footprint for a given DMX512 personality.',
  },
  0x00f0: {
    name: 'DMX_START_ADDRESS',
    description: 'The DMX512 start address (1-512).',
  },
  0x0120: {
    name: 'SLOT_INFO',
    description:
      'Functional info (type and label ID) for the device\u2019s DMX512 slots',
  },
  0x0121: {
    name: 'SLOT_DESCRIPTION',
    description: 'Description for a given DMX512 slot offset.',
  },
  0x0122: {
    name: 'DEFAULT_SLOT_VALUE',
    description: 'Default values for the device\u2019s DMX512 slot offsets.',
  },

  // --- Category: Sensors ---
  0x0200: {
    name: 'SENSOR_DEFINITION',
    description: 'Definition of a specific sensor (type, unit, range, etc.).',
  },
  0x0201: {
    name: 'SENSOR_VALUE',
    description: 'Get current sensor values, or reset a sensor (SET).',
  },
  0x0202: {
    name: 'RECORD_SENSORS',
    description:
      'Instruct device to record current sensor values for later retrieval.',
  },

  // --- Category: Power/Lamp Settings ---
  0x0400: {
    name: 'DEVICE_HOURS',
    description: 'Total hours of device operation.',
  },
  0x0401: {
    name: 'LAMP_HOURS',
    description: 'Total lamp-on hours.',
  },
  0x0402: {
    name: 'LAMP_STRIKES',
    description: 'The number of times the lamp has been struck.',
  },
  0x0403: {
    name: 'LAMP_STATE',
    description: 'The current operating state of the lamp.',
  },
  0x0404: {
    name: 'LAMP_ON_MODE',
    description: 'The conditions under which the lamp will strike.',
  },
  0x0405: {
    name: 'DEVICE_POWER_CYCLES',
    description: 'The number of device power-up cycles.',
  },

  // --- Category: Display Settings ---
  0x0500: {
    name: 'DISPLAY_INVERT',
    description:
      'Get/set display invert (off/on/auto) to rotate the display 180\u00b0.',
  },
  0x0501: {
    name: 'DISPLAY_LEVEL',
    description: 'Get/set the display intensity/brightness level.',
  },

  // --- Category: Configuration ---
  0x0600: {
    name: 'PAN_INVERT',
    description: 'Get/set the pan invert setting.',
  },
  0x0601: {
    name: 'TILT_INVERT',
    description: 'Get/set the tilt invert setting.',
  },
  0x0602: {
    name: 'PAN_TILT_SWAP',
    description: 'Get/set the pan/tilt swap setting.',
  },
  0x0603: {
    name: 'REAL_TIME_CLOCK',
    description: 'Get/set the device\u2019s real-time clock (date and time).',
  },

  // --- Category: Control ---
  0x1000: {
    name: 'IDENTIFY_DEVICE',
    description:
      'Get/set device identify state (visible/audible self-identification)',
  },
  0x1001: {
    name: 'RESET_DEVICE',
    description: 'Instruct the device to perform a warm or cold reset',
  },
  0x1010: {
    name: 'POWER_STATE',
    description:
      'Get/set the device power state (full off, shutdown, standby, normal)',
  },
  0x1020: {
    name: 'PERFORM_SELFTEST',
    description: 'Run a built-in self-test routine, or check if one is running',
  },
  0x1021: {
    name: 'SELF_TEST_DESCRIPTION',
    description: 'ASCII text label for a given self-test operation',
  },
  0x1030: {
    name: 'CAPTURE_PRESET',
    description:
      'Capture the current scene into a preset (with optional fade/wait times)',
  },
  0x1031: {
    name: 'PRESET_PLAYBACK',
    description:
      'Recall a pre-recorded preset scene (off/all/scene #) with master level',
  },
};

/**
 * Identifies the type of Parameter Data contained in an RDM packet.
 *
 * Each PID corresponds to a specific type of information or command parameter.
 * PIDs are defined in E1.20 Section 6.2.10.2 and Table A-3.
 */
export type ParameterId = {
  pid: number;
  name: string;
  description: string;
};

/**
 * Looks up a Parameter ID (PID) and returns its name and description. If the
 * PID is not recognized, it returns a default name and description.
 *
 * Manufacturer-defined PIDs are identified by values greater than or equal to
 * 0x8000.
 *
 * @param pid - The 16-bit parameter ID to look up
 * @returns PID name, description, and code.
 *
 * @example
 * ```ts
 * lookupPid(0x0060);
 * // { pid: 0x0060, name: 'DEVICE_INFO', description: 'Contains...' }
 * ```
 */
export function lookupPid(pid: number): ParameterId {
  const info = PID_INFO[pid];
  if (info) {
    return { pid, ...info };
  }

  return {
    pid,
    name: pid >= 0x8000 ? 'MANUFACTURER_DEFINED' : 'UNKNOWN_PID',
    description: `PID 0x${pid.toString(16).padStart(4, '0').toUpperCase()}`,
  };
}
