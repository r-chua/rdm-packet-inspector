// Example RDM packet for getting device info
export const GET_DEVICE_INFO =
  'cc 01 18 01 04 98 76 54 32 01 04 12 34 56 78 25 ' +
  '01 00 00 00 20 00 60 00 04 3d';

// Example RDM response packet for getting device info
export const GET_DEVICE_INFO_RESPONSE =
  'cc 01 2b 01 04 12 34 56 78 01 04 98 76 54 32 25 ' +
  '00 00 00 00 21 00 60 13 01 00 00 2d 00 04 00 2d ' +
  '00 01 00 08 00 02 00 01 00 00 01 04 cf';

// Example for delayed response with an estimated wait time of 5 seconds
export const GET_DEVICE_INFO_ACK_TIMER_RESPONSE =
  'cc 01 1a 01 04 12 34 56 78 01 04 98 76 54 32 25 ' +
  '01 00 00 00 21 00 60 02 00 32 04 74';

// Example RDM SET command to set the DMX start address to 311
export const SET_START_ADDRESS =
  'cc 01 1a 01 04 98 76 54 32 01 04 12 34 56 78 26 ' +
  '01 00 00 00 30 00 f0 02 01 37 05 1a';

export const SET_START_ADDRESS_RESPONSE =
  'cc 01 18 01 04 12 34 56 78 01 04 98 76 54 32 26 ' +
  '00 00 00 00 31 00 f0 00 04 de';

// Example RDM SET command with an invalid checksum
export const INVALID_CHECKSUM_START_ADDRESS =
  'cc 01 1a 01 04 98 76 54 32 01 04 12 34 56 78 26 ' +
  '01 00 00 00 20 00 f0 02 01 37 05 ff';

// Example NACK response with reason code of "Hardware Fault"
export const NACK_REASON_HARDWARE_FAULT_RESPONSE =
  'cc 01 1a 01 04 12 34 56 78 01 04 98 76 54 32 25 ' +
  '02 00 00 00 21 00 66 02 00 02 04 4b';

export const INVALID_NACK_REASON_RESPONSE =
  'cc 01 1a 01 04 12 34 56 78 01 04 98 76 54 32 25 ' +
  '02 00 00 00 21 00 66 02 00 ff 05 48';

export const DISCOVERY_MUTE_REQUEST =
  'cc 01 18 01 04 98 76 54 32 01 04 12 34 56 78 38 ' +
  '01 00 00 00 10 00 02 00 03 e2';

export const DISCOVERY_MUTE_RESPONSE =
  'cc 01 1a 01 04 12 34 56 78 01 04 98 76 54 32 38 ' +
  '00 00 00 00 11 00 02 02 00 00 03 e6';

// Example ACK_OVERFLOW response mocking a fixture with a large amount
// of proxied devices. Packet data is packed with 38 UIDs, which is the maximum
// that can fit in a single RDM packet.
export const ACK_OVERFLOW_RESPONSE =
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

// Get device info request with a message count of 1, which is invalid since
// the message count should be 0 for commands.
export const GET_DEVICE_INFO_WITH_MESSAGE_COUNT =
  'cc 01 18 01 04 98 76 54 32 01 04 12 34 56 78 25 ' +
  '01 01 00 00 20 00 60 00 04 3e';
