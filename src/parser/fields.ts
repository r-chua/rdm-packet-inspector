import type { RdmField, RdmPacket } from './types';

export type FieldEntry = {
  name: string;
  field: RdmField<unknown>;
};

export const getFieldEntries = (packet: RdmPacket): FieldEntry[] => {
  const fields: FieldEntry[] = [
    { name: 'Start Code', field: packet.startCode },
    { name: 'Sub Start Code', field: packet.subStartCode },
    { name: 'Message Length', field: packet.messageLength },
    { name: 'Destination UID', field: packet.destinationUid },
    { name: 'Source UID', field: packet.sourceUid },
    { name: 'Transaction Number', field: packet.transactionNumber },
  ];

  if (packet.direction === 'command') {
    fields.push({ name: 'Port ID', field: packet.portId });
  } else if (packet.direction === 'response') {
    fields.push({ name: 'Response Type', field: packet.responseType });
  } else {
    fields.push({
      name: 'Port ID or Response Type',
      field: packet.portIdOrResponseType,
    });
  }

  fields.push(
    { name: 'Message Count', field: packet.messageCount },
    { name: 'Sub Device', field: packet.subDevice },
    { name: 'Command Class', field: packet.commandClass },
    { name: 'Parameter ID (PID)', field: packet.parameterId },
    { name: 'Parameter Data Length', field: packet.parameterDataLength }
  );

  if (packet.parameterData !== null) {
    fields.push({ name: 'Parameter Data', field: packet.parameterData });
  }

  fields.push({ name: 'Checksum', field: packet.checksum });

  return fields;
};
