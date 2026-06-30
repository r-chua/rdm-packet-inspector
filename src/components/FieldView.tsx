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

  function renderFieldEntry(entry: FieldEntry) {
    return (
      <div key={entry.name} className="flex justify-between py-2 px-3">
        <dt className="text-sm font-medium text-gray-500">{entry.name}</dt>
        <dd className="text-sm font-mono text-gray-900">
          {entry.displayValue}
        </dd>
      </div>
    );
  }

  return (
    <section className="p-4">
      <h2 className="text-lg font-medium text-gray-900 mb-2">Field View</h2>

      <dl className="divide-y divide-gray-200">
        {packetFields.map((entry) => renderFieldEntry(entry))}
      </dl>
    </section>
  );
}
