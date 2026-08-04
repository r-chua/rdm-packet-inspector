import React from 'react';
import { FieldView } from './FieldView.tsx';
import { HexInput } from './HexInput.tsx';
import { HexView } from './HexView.tsx';
import type { ParseResult } from '../parser/types.ts';
import { parseRdmPacket } from '../parser/parse.ts';
import { getFieldEntries, type FieldEntry } from '../parser/fields.ts';
import { cn } from '../lib/utils.ts';

export function PacketInspector() {
  const [parseResult, setParseResult] = React.useState<ParseResult | null>(
    null
  );
  const [highlightedField, setHighlightedField] =
    React.useState<FieldEntry | null>(null);
  const [selectedField, setSelectedField] = React.useState<FieldEntry | null>(
    null
  );
  const [selectionWasMade, setSelectionWasMade] = React.useState(false);

  const readThemePref = () => {
    const theme = localStorage.getItem('theme');
    if (theme === 'dark') {
      return 'dark';
    } else if (theme === 'light') {
      return 'light';
    } else {
      return 'system';
    }
  };
  const [theme, setTheme] = React.useState<string>(() => readThemePref());

  const fieldEntries = React.useMemo(() => {
    if (parseResult?.success) {
      return parseResult.packet ? getFieldEntries(parseResult.packet) : null;
    }
    return null;
  }, [parseResult]);

  React.useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.dataset.theme = 'dark';
    } else if (theme === 'light') {
      document.documentElement.dataset.theme = 'light';
    } else {
      document.documentElement.dataset.theme = matchMedia(
        '(prefers-color-scheme: dark)'
      ).matches
        ? 'dark'
        : 'light';
    }
  }, [theme]);

  const handleParse = (hexString: string) => {
    setHighlightedField(null);
    setSelectedField(null);
    setSelectionWasMade(false);
    if (hexString.trim() === '') {
      setParseResult(null);
    } else {
      setParseResult(parseRdmPacket(hexString));
    }
  };

  const handleSelect = (field: FieldEntry | null) => {
    setSelectedField(field);
    if (field) setSelectionWasMade(true);
  };

  return (
    <div className="flex flex-col h-screen">
      <header
        className={cn(
          'flex items-center',
          'bg-surface border-b border-border',
          'p-4 gap-4'
        )}
      >
        <h1 className="text-2xl font-bold">RDM Packet Inspector</h1>
        <button
          className={cn(
            'mt-2 ml-auto px-4 py-2 rounded-md shadow-sm',
            'bg-surface',
            'text-fg',
            'border border-border',
            'hover:bg-surface-subtle',
            'focus:ring-2 focus:ring-offset-2 focus:ring-focus'
          )}
          onClick={() => {}}
        >
          Theme
        </button>
      </header>

      <div className="flex flex-col flex-1 min-h-0 p-4 gap-4">
        <div
          className={cn(
            'overflow-auto',
            'bg-surface',
            'border border-border rounded-lg shadow-sm'
          )}
        >
          <HexInput onParse={handleParse} />
        </div>

        <div role="alert">
          {parseResult && !parseResult.success && (
            <div
              className={cn(
                'bg-danger-surface',
                'border border-border rounded-lg shadow-sm p-4'
              )}
            >
              <p className="text-danger font-bold">Error:</p>
              <p className="italic">{parseResult.error.message}</p>
              {parseResult.error.byteOffset !== -1 && (
                <p>Byte Index: {parseResult.error.byteOffset}</p>
              )}
            </div>
          )}
        </div>

        <div role="status" className="sr-only">
          {selectedField
            ? `Selected ${selectedField.name}, bytes ` +
              `${selectedField.startByte} to ${selectedField.endByte}`
            : selectionWasMade
              ? 'Selection cleared'
              : ''}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 min-h-0">
          <div
            className={cn(
              'overflow-auto',
              'bg-surface',
              'border border-border rounded-lg shadow-sm'
            )}
          >
            <HexView
              rawBytes={parseResult?.rawBytes || null}
              fieldEntries={fieldEntries}
              highlightedField={highlightedField}
              onHighlight={setHighlightedField}
              selectedField={selectedField}
              onSelect={handleSelect}
            />
          </div>
          <div
            className={cn(
              'overflow-auto',
              'bg-surface',
              'border border-border rounded-lg shadow-sm'
            )}
          >
            <FieldView
              fieldEntries={fieldEntries}
              highlightedField={highlightedField}
              onHighlight={setHighlightedField}
              selectedField={selectedField}
              onSelect={handleSelect}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
