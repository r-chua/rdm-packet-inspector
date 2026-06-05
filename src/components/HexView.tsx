import { cn } from '../lib/utils';

export function HexView() {
  const placeholderData = new Uint8Array([
    0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b, 0x0c,
    0x0d, 0x0e, 0x0f, 0x10, 0x11, 0x12, 0x13,
    // ... more bytes as needed
  ]);

  function generateTableRowData(buffer: Uint8Array): number[][] {
    const rows: number[][] = [];
    for (let i = 0; i < buffer.length; i += 16) {
      rows.push(Array.from(buffer.slice(i, i + 16)));
    }
    return rows;
  }

  const rowData = generateTableRowData(placeholderData);

  return (
    <section className="p-4">
      <h2
        id="hex-view-title"
        className="text-lg font-medium text-gray-900 mb-2"
      >
        Hex View
      </h2>
      <table
        className={cn(
          'table-auto ',
          'border-collapse border border-gray-300',
          'center text-sm font-mono',
          'mx-auto'
        )}
        aria-labelledby="hex-view-title"
      >
        <thead>
          <tr className="italic">
            <th
              scope="col"
              className={cn(
                'border border-gray-300',
                'px-5 py-1',
                'bg-gray-100',
                'text-center'
              )}
            >
              Offset
            </th>
            {Array.from({ length: 16 }, (_, i) => (
              <th
                key={i}
                scope="col"
                className={cn(
                  'border border-gray-300',
                  'px-2 py-1',
                  'bg-gray-100',
                  'text-center'
                )}
              >
                {i.toString(16).toUpperCase().padStart(2, '0')}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rowData.map((row, rowIndex) => (
            <tr key={rowIndex}>
              <th
                scope="row"
                className="border border-gray-300 px-2 py-1 text-center"
              >
                {(rowIndex * 16).toString(16).toUpperCase().padStart(4, '0')}
              </th>
              {row.map((byte, colIndex) => (
                <td
                  key={colIndex}
                  className="border border-gray-300 px-2 py-1 text-center"
                >
                  {byte.toString(16).toUpperCase().padStart(2, '0')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
