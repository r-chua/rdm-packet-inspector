import { toString16Bit, toString8Bit } from '../lib/utils';
import type { RdmPacket } from './types';

export type FieldEntry = {
  name: string;
  displayValue: string;
  startByte: number;
  endByte: number;
  warning?: string;
  subFields?: FieldEntry[];
};

export const getFieldEntries = (packet: RdmPacket): FieldEntry[] => {
  const fields: FieldEntry[] = [
    {
      name: 'Start Code',
      displayValue: toString8Bit(packet.startCode.value),
      startByte: packet.startCode.startByte,
      endByte: packet.startCode.endByte,
      warning: packet.startCode.warning,
    },
    {
      name: 'Sub Start Code',
      displayValue: toString8Bit(packet.subStartCode.value),
      startByte: packet.subStartCode.startByte,
      endByte: packet.subStartCode.endByte,
      warning: packet.subStartCode.warning,
    },
    {
      name: 'Message Length',
      displayValue: packet.messageLength.value.toString(),
      startByte: packet.messageLength.startByte,
      endByte: packet.messageLength.endByte,
      warning: packet.messageLength.warning,
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
      warning: packet.portId.warning,
    });
  } else if (packet.direction === 'response') {
    fields.push({
      name: 'Response Type',
      displayValue: packet.responseType.value.name,
      startByte: packet.responseType.startByte,
      endByte: packet.responseType.endByte,
      warning: packet.responseType.warning,
    });
  } else {
    fields.push({
      name: 'Port ID or Response Type',
      displayValue: packet.portIdOrResponseType.value.toString(),
      startByte: packet.portIdOrResponseType.startByte,
      endByte: packet.portIdOrResponseType.endByte,
      warning: packet.portIdOrResponseType.warning,
    });
  }

  fields.push(
    {
      name: 'Message Count',
      displayValue: packet.messageCount.value.toString(),
      startByte: packet.messageCount.startByte,
      endByte: packet.messageCount.endByte,
      warning: packet.messageCount.warning,
    },
    {
      name: 'Sub Device',
      displayValue:
        `${packet.subDevice.value.toString()} ` +
        `(${toString16Bit(packet.subDevice.value)})`,
      startByte: packet.subDevice.startByte,
      endByte: packet.subDevice.endByte,
      warning: packet.subDevice.warning,
    },
    {
      name: 'Command Class',
      displayValue: packet.commandClass.value.name,
      startByte: packet.commandClass.startByte,
      endByte: packet.commandClass.endByte,
      warning: packet.commandClass.warning,
    },
    {
      name: 'Parameter ID (PID)',
      displayValue: packet.parameterId.value.name,
      startByte: packet.parameterId.startByte,
      endByte: packet.parameterId.endByte,
      warning: packet.parameterId.warning,
    },
    {
      name: 'Parameter Data Length',
      displayValue: packet.parameterDataLength.value.toString(),
      startByte: packet.parameterDataLength.startByte,
      endByte: packet.parameterDataLength.endByte,
      warning: packet.parameterDataLength.warning,
    }
  );

  if (packet.parameterData !== null) {
    const parameterDataEntry: FieldEntry = {
      name: 'Parameter Data',
      displayValue: packet.parameterData.value.toString(),
      startByte: packet.parameterData.startByte,
      endByte: packet.parameterData.endByte,
    };

    if (packet.direction === 'response') {
      if (packet.responseDetail.type === 'ackTimer') {
        parameterDataEntry.subFields = [
          {
            name: 'Estimated Wait Time',
            displayValue:
              packet.responseDetail.estimatedWaitMs.toString() + ' ms',
            startByte: packet.parameterData.startByte,
            endByte: packet.parameterData.endByte,
          },
        ];
      } else if (packet.responseDetail.type === 'nack') {
        parameterDataEntry.subFields = [
          {
            name: 'NACK Reason',
            displayValue: packet.responseDetail.reason.name,
            startByte: packet.parameterData.startByte,
            endByte: packet.parameterData.endByte,
            warning:
              packet.responseDetail.reason.name === 'UNKNOWN'
                ? `Unknown NACK reason code: 0x${packet.responseDetail.reason.code
                    .toString(16)
                    .padStart(4, '0')
                    .toUpperCase()}`
                : undefined,
          },
        ];
      } else if (packet.responseDetail.type === 'unknown') {
        parameterDataEntry.warning =
          'Unknown response detail value: ' +
          `${packet.responseDetail.rawValue}`;
      }
    }

    fields.push(parameterDataEntry);
  }

  fields.push({
    name: 'Checksum',
    displayValue: toString16Bit(packet.checksum.value),
    startByte: packet.checksum.startByte,
    endByte: packet.checksum.endByte,
    warning: packet.checksum.warning,
  });

  return fields;
};
