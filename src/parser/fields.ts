import type { RdmField, RdmPacket } from './types';

export type FieldEntry = {
  name: string;
  field: RdmField<unknown>;
};

export const getFieldEntries = (packet: RdmPacket): FieldEntry[] => {
  throw new Error('getFieldEntries is not implemented yet');
};
