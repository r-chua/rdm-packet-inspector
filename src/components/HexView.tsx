import React from 'react';
import {
  HIGHLIGHT_CLASS,
  SELECTED_EDGE_SHADOW_Y,
  SELECTED_EDGE_SHADOW_L,
  SELECTED_EDGE_SHADOW_R,
} from '../lib/styles';
import { cn, scrollBehavior } from '../lib/utils';
import type { FieldEntry } from '../parser/fields';

type HexViewProps = {
  rawBytes: Uint8Array | null;
  fieldEntries: FieldEntry[] | null;
  highlightedField: FieldEntry | null;
  onHighlight: (field: FieldEntry | null) => void;
  selectedField: FieldEntry | null;
  onSelect: (field: FieldEntry | null) => void;
};

const BYTES_PER_ROW = 16;

type SelectedByteBorders = {
  left: boolean;
  right: boolean;
  y: boolean;
};

const EDGE_SHADOW: Record<keyof SelectedByteBorders, string> = {
  left: SELECTED_EDGE_SHADOW_L,
  right: SELECTED_EDGE_SHADOW_R,
  y: SELECTED_EDGE_SHADOW_Y,
};

export function HexView({
  rawBytes,
  fieldEntries,
  highlightedField,
  onHighlight,
  selectedField,
  onSelect,
}: HexViewProps) {
  const cellRefs = React.useRef<Map<number, HTMLTableCellElement>>(new Map());

  React.useEffect(() => {
    if (!selectedField) return;
    const firstByteIndex = selectedField.startByte;
    const cell = cellRefs.current.get(firstByteIndex);
    cell?.scrollIntoView({
      behavior: scrollBehavior(),
    });
  }, [selectedField]);

  const isByteInField = (
    byteIndex: number,
    field: FieldEntry | null
  ): boolean => {
    if (!field) return false;
    return byteIndex >= field.startByte && byteIndex <= field.endByte;
  };

  const fieldForByteIndex = (
    byteIndex: number,
    entries: FieldEntry[]
  ): FieldEntry | null => {
    for (const entry of entries) {
      if (isByteInField(byteIndex, entry)) {
        return entry;
      }
    }
    return null;
  };

  const getSelectedByteBorders = (
    byteIndex: number,
    field: FieldEntry | null,
    colIndex: number
  ): SelectedByteBorders => {
    if (!field) return { left: false, right: false, y: false };
    return {
      left:
        byteIndex === field.startByte ||
        (isByteInField(byteIndex, field) && colIndex === 0),
      right:
        byteIndex === field.endByte ||
        (isByteInField(byteIndex, field) && colIndex === BYTES_PER_ROW - 1),
      y: isByteInField(byteIndex, field),
    };
  };

  const dataToDisplay = React.useMemo(() => {
    if (rawBytes) {
      return generateTableRowData(rawBytes);
    }
    return generateTableRowData(new Uint8Array([]));
  }, [rawBytes]);

  function generateTableRowData(buffer: Uint8Array): number[][] {
    const rows: number[][] = [];
    for (let i = 0; i < buffer.length; i += BYTES_PER_ROW) {
      rows.push(Array.from(buffer.slice(i, i + BYTES_PER_ROW)));
    }
    return rows;
  }

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
          {dataToDisplay.map((row, rowIndex) => (
            <tr key={rowIndex}>
              <th
                scope="row"
                className="border border-gray-300 px-2 py-1 text-center"
              >
                {(rowIndex * BYTES_PER_ROW)
                  .toString(16)
                  .toUpperCase()
                  .padStart(4, '0')}
              </th>
              {row.map((byte, colIndex) => {
                const byteIndex = rowIndex * BYTES_PER_ROW + colIndex;
                const selectedBorders = getSelectedByteBorders(
                  byteIndex,
                  selectedField,
                  colIndex
                );
                const selectedShadows = Object.entries(selectedBorders)
                  .filter(([, isActive]) => isActive)
                  .map(
                    ([side]) => EDGE_SHADOW[side as keyof SelectedByteBorders]
                  )
                  .join(', ');

                return (
                  <td
                    key={colIndex}
                    ref={(el) => {
                      if (el) cellRefs.current.set(byteIndex, el);
                      else cellRefs.current.delete(byteIndex);
                    }}
                    onMouseEnter={() => {
                      if (fieldEntries) {
                        const field = fieldForByteIndex(
                          byteIndex,
                          fieldEntries
                        );
                        onHighlight(field);
                      }
                    }}
                    onMouseLeave={() => onHighlight(null)}
                    onClick={() => {
                      if (fieldEntries) {
                        const field = fieldForByteIndex(
                          byteIndex,
                          fieldEntries
                        );
                        onSelect(field);
                      }
                    }}
                    data-highlighted={isByteInField(
                      byteIndex,
                      highlightedField
                    )}
                    data-selected={isByteInField(byteIndex, selectedField)}
                    className={cn(
                      'border border-gray-300 px-2 py-1 text-center',
                      HIGHLIGHT_CLASS
                    )}
                    style={{ boxShadow: selectedShadows }}
                  >
                    {byte.toString(16).toUpperCase().padStart(2, '0')}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
