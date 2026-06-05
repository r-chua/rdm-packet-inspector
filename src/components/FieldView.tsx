import type { FieldEntry } from '../parser/fields';

export function FieldView() {
  const placeholderFields: FieldEntry[] = [
    {
      name: 'Start Code',
      field: {
        value: 0xcc,
        rawBytes: new Uint8Array([0xcc]),
        startByte: 0,
        endByte: 0,
      },
    },
    {
      name: 'Sub Start Code',
      field: {
        value: 0x01,
        rawBytes: new Uint8Array([0x01]),
        startByte: 1,
        endByte: 1,
      },
    },
    {
      name: 'Message Length',
      field: {
        value: 24,
        rawBytes: new Uint8Array([0x18]),
        startByte: 2,
        endByte: 2,
      },
    },
  ];

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

      <dl>{placeholderFields.map((entry) => renderFieldEntry(entry))}</dl>
    </section>
  );
}
