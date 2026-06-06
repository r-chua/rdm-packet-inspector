import { toString16Bit, toString8Bit } from '../lib/utils';
import type { RdmPacket } from './types';

export type FieldEntry = {
  name: string;
  displayValue: string;
  startByte: number;
  endByte: number;
};

export const getFieldEntries = (packet: RdmPacket): FieldEntry[] => {
  const fields: FieldEntry[] = [
    {
      name: 'Start Code',
      displayValue: toString8Bit(packet.startCode.value),
      startByte: packet.startCode.startByte,
      endByte: packet.startCode.endByte,
    },
    {
      name: 'Sub Start Code',
      displayValue: toString8Bit(packet.subStartCode.value),
      startByte: packet.subStartCode.startByte,
      endByte: packet.subStartCode.endByte,
    },
    {
      name: 'Message Length',
      displayValue: packet.messageLength.value.toString(),
      startByte: packet.messageLength.startByte,
      endByte: packet.messageLength.endByte,
    },
    {
      name: 'Destination UID',
      displayValue: packet.destinationUid.value,
      startByte: packet.destinationUid.startByte,
      endByte: packet.destinationUid.endByte,
    },
    {
      name: 'Source UID',
      displayValue: packet.sourceUid.value,
      startByte: packet.sourceUid.startByte,
      endByte: packet.sourceUid.endByte,
    },
    {
      name: 'Transaction Number',
      displayValue: packet.transactionNumber.value.toString(),
      startByte: packet.transactionNumber.startByte,
      endByte: packet.transactionNumber.endByte,
    },
  ];

  if (packet.direction === 'command') {
    fields.push({
      name: 'Port ID',
      displayValue: packet.portId.value.toString(),
      startByte: packet.portId.startByte,
      endByte: packet.portId.endByte,
    });
  } else if (packet.direction === 'response') {
    fields.push({
      name: 'Response Type',
      displayValue: packet.responseType.value.name,
      startByte: packet.responseType.startByte,
      endByte: packet.responseType.endByte,
    });
  } else {
    fields.push({
      name: 'Port ID or Response Type',
      displayValue: packet.portIdOrResponseType.value.toString(),
      startByte: packet.portIdOrResponseType.startByte,
      endByte: packet.portIdOrResponseType.endByte,
    });
  }

  fields.push(
    {
      name: 'Message Count',
      displayValue: packet.messageCount.value.toString(),
      startByte: packet.messageCount.startByte,
      endByte: packet.messageCount.endByte,
    },
    {
      name: 'Sub Device',
      displayValue:
        `${packet.subDevice.value.toString()} ` +
        `(${toString16Bit(packet.subDevice.value)})`,
      startByte: packet.subDevice.startByte,
      endByte: packet.subDevice.endByte,
    },
    {
      name: 'Command Class',
      displayValue: packet.commandClass.value.name,
      startByte: packet.commandClass.startByte,
      endByte: packet.commandClass.endByte,
    },
    {
      name: 'Parameter ID (PID)',
      displayValue: packet.parameterId.value.name,
      startByte: packet.parameterId.startByte,
      endByte: packet.parameterId.endByte,
    },
    {
      name: 'Parameter Data Length',
      displayValue: packet.parameterDataLength.value.toString(),
      startByte: packet.parameterDataLength.startByte,
      endByte: packet.parameterDataLength.endByte,
    }
  );

  if (packet.parameterData !== null) {
    fields.push({
      name: 'Parameter Data',
      displayValue: packet.parameterData.value.toString(),
      startByte: packet.parameterData.startByte,
      endByte: packet.parameterData.endByte,
    });
  }

  fields.push({
    name: 'Checksum',
    displayValue: toString16Bit(packet.checksum.value),
    startByte: packet.checksum.startByte,
    endByte: packet.checksum.endByte,
  });

  return fields;
};
