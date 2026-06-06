import React from 'react';
import { getFieldEntries, type FieldEntry } from '../parser/fields';
import type { RdmPacket } from '../parser/types';

type FieldViewProps = {
  packet: RdmPacket | null;
};

export function FieldView({ packet }: FieldViewProps) {
  const packetFields: FieldEntry[] = React.useMemo(() => {
    if (packet) {
      return getFieldEntries(packet);
    }
    return [];
  }, [packet]);

  function renderValue(value: unknown): string {
    if (value instanceof Uint8Array) {
      return Array.from(value)
        .map((byte) => byte.toString(16).toUpperCase().padStart(2, '0'))
        .join(' ');
    }
    if (typeof value === 'number') {
      return `0x${value.toString(16).toUpperCase()}`;
    }
    if (typeof value === 'string') {
      return value;
    }
    return 'Placeholder';
  }

  function renderFieldEntry(entry: FieldEntry) {
    return (
      <div key={entry.name}>
        <dt>{entry.name}</dt>
        <dd>{renderValue(entry.field.value)}</dd>
      </div>
    );
  }

  return (
    <section className="p-4">
      <h2 className="text-lg font-medium text-gray-900 mb-2">Field View</h2>

      <dl>{packetFields.map((entry) => renderFieldEntry(entry))}</dl>
    </section>
  );
}
